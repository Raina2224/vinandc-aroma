from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os, logging, uuid, random, jwt, bcrypt, unicodedata, re
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta

try:
    # Works when the app is launched from the repo root, e.g.
    # `python -m uvicorn backend.server:app`
    from backend.lib.stripe_wrapper import StripeCheckout, CheckoutSessionRequest
except ImportError:
    # Works when the app is launched from inside backend/, e.g.
    # `uvicorn server:app` (cwd == backend/)
    from lib.stripe_wrapper import StripeCheckout, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', '')
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALG = "HS256"

app = FastAPI(title="Vin&c Aroma API")
api = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vincaroma")


# ---------------- Models ----------------
def now_iso():
    return datetime.now(timezone.utc).isoformat()


class OTPRequest(BaseModel):
    phone: str


class OTPVerify(BaseModel):
    phone: str
    otp: str
    name: Optional[str] = None


class AdminLogin(BaseModel):
    email: str
    password: str


class Address(BaseModel):
    fullName: str
    phone: str
    line1: str
    line2: Optional[str] = ""
    city: str
    state: str
    pincode: str
    country: str = "India"


class CartItem(BaseModel):
    productId: str
    quantity: int
    size: Optional[str] = "50ml"


class CheckoutRequest(BaseModel):
    items: List[CartItem]
    address: Address
    origin_url: str
    payment_method: str = "stripe"  # stripe | razorpay | cod


class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    tagline: str
    description: str
    price: float
    compare_at_price: Optional[float] = None
    currency: str = "INR"
    gender: str  # men | women | unisex
    scent_family: str  # floral | woody | citrus | oriental | fresh | musky
    top_notes: List[str]
    middle_notes: List[str]
    base_notes: List[str]
    longevity: int  # 1-5
    sillage: int  # 1-5
    ingredients: str
    images: List[str]
    sizes: List[Dict[str, Any]]  # [{size:"50ml", price: 2499}]
    stock: int = 50
    is_bestseller: bool = False
    is_new: bool = False
    rating: float = 4.7
    review_count: int = 0
    created_at: str = Field(default_factory=now_iso)


class ProductCreate(BaseModel):
    name: str
    tagline: str
    description: str
    price: float
    compare_at_price: Optional[float] = None
    gender: str
    scent_family: str
    top_notes: List[str]
    middle_notes: List[str]
    base_notes: List[str]
    longevity: int
    sillage: int
    ingredients: str
    images: List[str]
    sizes: List[Dict[str, Any]]
    stock: int = 50
    is_bestseller: bool = False
    is_new: bool = False


class Review(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    user_name: str
    rating: int
    title: str
    body: str
    created_at: str = Field(default_factory=now_iso)


class ReviewCreate(BaseModel):
    product_id: str
    user_name: str
    rating: int
    title: str
    body: str


# --------------- Auth helpers ----------------
def create_token(payload: dict) -> str:
    payload = {**payload, "exp": datetime.now(timezone.utc) + timedelta(days=30)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def decode_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])


async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    if not creds:
        return None
    try:
        return decode_token(creds.credentials)
    except Exception:
        return None


async def require_admin(creds: HTTPAuthorizationCredentials = Depends(security)):
    if not creds:
        raise HTTPException(401, "Missing token")
    try:
        data = decode_token(creds.credentials)
        if data.get("role") != "admin":
            raise HTTPException(403, "Admin only")
        return data
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(401, "Invalid token")


# ---------------- Startup seeding ----------------
async def seed_admin():
    existing = await db.admins.find_one({"email": "admin@vincaroma.com"})
    if existing:
        return
    pw_hash = bcrypt.hashpw(b"Admin@123", bcrypt.gensalt()).decode()
    await db.admins.insert_one({
        "email": "admin@vincaroma.com",
        "password_hash": pw_hash,
        "created_at": now_iso(),
    })
    logger.info("Seeded default admin admin@vincaroma.com / Admin@123")


# Real product photography (uploaded by the founder), served as static files from
# the frontend's public/images/products/ folder. A 4th product can be added later
# via the admin dashboard once it's named — see PRODUCT_SEED below.
PRODUCT_SEED = [
    {"name":"The Essential","tagline":"Born of dreams, bottled in elegance","gender":"unisex","scent_family":"oriental","price":599,
     "top_notes":["Bergamot","Pink Pepper"],"middle_notes":["Rose","Saffron"],"base_notes":["Oud","Amber","Vanilla"],
     "longevity":5,"sillage":4,"is_bestseller":True,"is_new":True,
     "images":["/images/products/essential-1.jpg","/images/products/essential-2.jpg","/images/products/essential-3.jpg"]},
    {"name":"The Gentleman","tagline":"Refined masculinity, quietly worn","gender":"men","scent_family":"woody","price":599,
     "top_notes":["Grapefruit","Cardamom"],"middle_notes":["Cedarwood","Vetiver"],"base_notes":["Leather","Patchouli","Amber"],
     "longevity":5,"sillage":4,"is_bestseller":True,"is_new":True,
     "images":["/images/products/gentleman-1.jpg","/images/products/gentleman-2.jpg","/images/products/gentleman-3.jpg","/images/products/gentleman-4.jpg","/images/products/gentleman-5.jpg"]},
    {"name":"The Casino","tagline":"An opulent play of amber and spice","gender":"unisex","scent_family":"oriental","price":599,
     "top_notes":["Saffron","Bergamot","Rum"],"middle_notes":["Tobacco","Rose","Cinnamon"],"base_notes":["Oud","Tonka","Vanilla"],
     "longevity":5,"sillage":5,"is_bestseller":True,"is_new":True,
     "images":["/images/products/casino-1.jpg","/images/products/casino-2.jpg","/images/products/casino-3.jpg"]},
]


def slugify(name: str) -> str:
    # Normalize unicode to ASCII (é -> e), lowercase, replace non-alnum with -, collapse dashes
    n = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii")
    n = n.lower()
    n = re.sub(r"[^a-z0-9]+", "-", n)
    return n.strip("-")


async def seed_products():
    docs = []
    for i, p in enumerate(PRODUCT_SEED):
        prod = Product(
            name=p["name"],
            slug=slugify(p["name"]),
            tagline=p["tagline"],
            description=(
                f"{p['name']} by Vin&c Aroma — {p['tagline'].lower()}. "
                "Crafted in France with the finest raw materials, this eau de parfum "
                "unfolds slowly on the skin, revealing a bespoke olfactory journey "
                "made to become your signature."
            ),
            price=p["price"],
            compare_at_price=p.get("compare_at_price"),
            gender=p["gender"],
            scent_family=p["scent_family"],
            top_notes=p["top_notes"],
            middle_notes=p["middle_notes"],
            base_notes=p["base_notes"],
            longevity=p["longevity"],
            sillage=p["sillage"],
            ingredients="Alcohol Denat., Parfum (Fragrance), Aqua, Limonene, Linalool, Citral, Geraniol. IFRA-compliant.",
            images=p["images"],
            sizes=[
                {"size":"30ml","price": round(p["price"]*0.7, 0)},
                {"size":"50ml","price": p["price"]},
                {"size":"100ml","price": round(p["price"]*1.6, 0)},
            ],
            stock=random.randint(30, 100),
            is_bestseller=p.get("is_bestseller", False),
            is_new=p.get("is_new", False),
            rating=round(random.uniform(4.4, 4.9), 1),
            review_count=random.randint(24, 320),
        )
        docs.append(prod.model_dump())

    for doc in docs:
        existing = await db.products.find_one({"slug": doc["slug"]}, {"_id": 0, "id": 1})
        if existing:
            doc["id"] = existing["id"]
        await db.products.replace_one({"slug": doc["slug"]}, doc, upsert=True)
    logger.info(f"Synced {len(docs)} catalog products (images/price/details always match PRODUCT_SEED)")


@app.on_event("startup")
async def on_start():
    await seed_admin()
    await seed_products()


# ---------------- Auth Routes ----------------
@api.post("/auth/otp/send")
async def send_otp(payload: OTPRequest):
    phone = payload.phone.strip()
    if len(phone) < 10:
        raise HTTPException(400, "Invalid phone number")
    # MOCK OTP - fixed 123456 for demo. Also store to db.
    otp = "123456"
    await db.otps.update_one(
        {"phone": phone},
        {"$set": {"phone": phone, "otp": otp, "created_at": now_iso()}},
        upsert=True,
    )
    logger.info(f"[MOCK OTP] phone={phone} otp={otp}")
    return {"success": True, "message": "OTP sent (demo)", "demo_otp": otp}


@api.post("/auth/otp/verify")
async def verify_otp(payload: OTPVerify):
    phone = payload.phone.strip()
    rec = await db.otps.find_one({"phone": phone})
    if not rec or rec["otp"] != payload.otp:
        raise HTTPException(401, "Invalid OTP")
    # Upsert user
    user = await db.users.find_one({"phone": phone})
    if not user:
        user_doc = {
            "id": str(uuid.uuid4()),
            "phone": phone,
            "name": payload.name or f"Guest {phone[-4:]}",
            "created_at": now_iso(),
        }
        await db.users.insert_one(user_doc)
        user = user_doc
    token = create_token({"sub": user["id"], "phone": phone, "role": "user"})
    return {
        "token": token,
        "user": {"id": user["id"], "phone": user["phone"], "name": user.get("name")},
    }


@api.post("/auth/admin/login")
async def admin_login(payload: AdminLogin):
    admin = await db.admins.find_one({"email": payload.email})
    if not admin:
        raise HTTPException(401, "Invalid credentials")
    if not bcrypt.checkpw(payload.password.encode(), admin["password_hash"].encode()):
        raise HTTPException(401, "Invalid credentials")
    token = create_token({"sub": payload.email, "role": "admin"})
    return {"token": token, "email": payload.email}


@api.get("/auth/me")
async def me(user=Depends(get_current_user)):
    if not user:
        return {"user": None}
    return {"user": user}


# ---------------- Product Routes ----------------
@api.get("/products")
async def list_products(
    gender: Optional[str] = None,
    scent_family: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    longevity: Optional[int] = None,
    q: Optional[str] = None,
    is_bestseller: Optional[bool] = None,
    is_new: Optional[bool] = None,
    sort: Optional[str] = None,
    limit: int = 100,
):
    query: Dict[str, Any] = {}
    if gender and gender != "all":
        query["gender"] = gender
    if scent_family and scent_family != "all":
        query["scent_family"] = scent_family
    if longevity:
        query["longevity"] = {"$gte": longevity}
    if is_bestseller:
        query["is_bestseller"] = True
    if is_new:
        query["is_new"] = True
    if min_price is not None or max_price is not None:
        pq = {}
        if min_price is not None:
            pq["$gte"] = min_price
        if max_price is not None:
            pq["$lte"] = max_price
        query["price"] = pq
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"tagline": {"$regex": q, "$options": "i"}},
            {"scent_family": {"$regex": q, "$options": "i"}},
        ]

    sort_spec = [("created_at", -1)]
    if sort == "price_asc":
        sort_spec = [("price", 1)]
    elif sort == "price_desc":
        sort_spec = [("price", -1)]
    elif sort == "rating":
        sort_spec = [("rating", -1)]

    docs = await db.products.find(query, {"_id": 0}).sort(sort_spec).to_list(limit)
    return {"products": docs, "count": len(docs)}


@api.get("/products/suggest")
async def suggest(q: str):
    if not q:
        return {"suggestions": []}
    docs = await db.products.find(
        {"$or": [
            {"name": {"$regex": q, "$options": "i"}},
            {"tagline": {"$regex": q, "$options": "i"}},
            {"scent_family": {"$regex": q, "$options": "i"}},
            {"top_notes": {"$regex": q, "$options": "i"}},
            {"middle_notes": {"$regex": q, "$options": "i"}},
            {"base_notes": {"$regex": q, "$options": "i"}},
        ]},
        {"_id": 0, "id": 1, "name": 1, "slug": 1, "images": 1, "price": 1},
    ).limit(6).to_list(6)
    return {"suggestions": docs}


@api.get("/products/{slug}")
async def get_product(slug: str):
    doc = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Product not found")
    # Related: same scent family, exclude self
    related = await db.products.find(
        {"scent_family": doc["scent_family"], "id": {"$ne": doc["id"]}}, {"_id": 0}
    ).limit(4).to_list(4)
    reviews = await db.reviews.find(
        {"product_id": doc["id"]}, {"_id": 0}
    ).sort([("created_at", -1)]).limit(20).to_list(20)
    return {"product": doc, "related": related, "reviews": reviews}


@api.post("/products", dependencies=[Depends(require_admin)])
async def create_product(payload: ProductCreate):
    prod = Product(**payload.model_dump(), slug=slugify(payload.name))
    await db.products.insert_one(prod.model_dump())
    return {"product": prod.model_dump()}


@api.put("/products/{product_id}", dependencies=[Depends(require_admin)])
async def update_product(product_id: str, payload: ProductCreate):
    updates = payload.model_dump()
    updates["slug"] = slugify(payload.name)
    res = await db.products.update_one({"id": product_id}, {"$set": updates})
    if not res.matched_count:
        raise HTTPException(404, "Not found")
    return {"success": True}


@api.delete("/products/{product_id}", dependencies=[Depends(require_admin)])
async def delete_product(product_id: str):
    res = await db.products.delete_one({"id": product_id})
    return {"deleted": res.deleted_count}


# ---------------- Reviews ----------------
@api.post("/reviews")
async def add_review(payload: ReviewCreate):
    review = Review(**payload.model_dump())
    await db.reviews.insert_one(review.model_dump())
    # Update product rating aggregate
    all_reviews = await db.reviews.find({"product_id": payload.product_id}).to_list(1000)
    if all_reviews:
        avg = sum(r["rating"] for r in all_reviews) / len(all_reviews)
        await db.products.update_one(
            {"id": payload.product_id},
            {"$set": {"rating": round(avg, 1), "review_count": len(all_reviews)}},
        )
    return {"review": review.model_dump()}


# ---------------- Checkout (Stripe) ----------------
async def calc_totals(items: List[CartItem]):
    total = 0.0
    detailed = []
    for it in items:
        prod = await db.products.find_one({"id": it.productId}, {"_id": 0})
        if not prod:
            raise HTTPException(400, f"Product {it.productId} not found")
        # Find price by size
        size_price = prod["price"]
        for s in prod.get("sizes", []):
            if s.get("size") == it.size:
                size_price = float(s.get("price", prod["price"]))
                break
        line_total = size_price * it.quantity
        total += line_total
        detailed.append({
            "productId": it.productId,
            "name": prod["name"],
            "size": it.size,
            "quantity": it.quantity,
            "unit_price": size_price,
            "line_total": line_total,
            "image": (prod.get("images") or [""])[0],
        })
    # Free shipping on orders ₹499+ (see PRD); otherwise a flat ₹99 fee.
    # Charged here so Stripe/Razorpay/COD totals all match what the storefront displays.
    shipping = 0.0 if total >= 499 else 99.0
    return total, shipping, detailed


@api.post("/checkout/session")
async def create_checkout_session(req: CheckoutRequest, request: Request):
    if not req.items:
        raise HTTPException(400, "Cart empty")
    subtotal, shipping, detailed = await calc_totals(req.items)
    total = subtotal + shipping

    order_id = str(uuid.uuid4())
    origin = req.origin_url.rstrip("/")
    success_url = f"{origin}/success?order_id={order_id}&session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/checkout"

    order_doc = {
        "id": order_id,
        "items": detailed,
        "address": req.address.model_dump(),
        "subtotal": subtotal,
        "shipping": shipping,
        "amount": total,
        "currency": "INR",
        "payment_method": req.payment_method,
        "payment_status": "pending",
        "status": "pending",
        "created_at": now_iso(),
    }
    await db.orders.insert_one(order_doc)

    if req.payment_method == "cod":
        await db.orders.update_one(
            {"id": order_id},
            {"$set": {"payment_status": "cod_pending", "status": "confirmed"}},
        )
        return {"order_id": order_id, "redirect_url": f"{origin}/success?order_id={order_id}&cod=1"}

    if req.payment_method == "razorpay":
        # MOCK Razorpay: immediately mark as paid (simulation)
        await db.orders.update_one(
            {"id": order_id},
            {"$set": {"payment_status": "paid", "status": "confirmed",
                      "razorpay_payment_id": f"pay_mock_{order_id[:8]}"}},
        )
        return {
            "order_id": order_id,
            "razorpay_mock": True,
            "redirect_url": f"{origin}/success?order_id={order_id}&mock=1",
        }

    # Stripe
    webhook_url = f"{str(request.base_url).rstrip('/')}/api/webhook/stripe"
    stripe = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    ck = CheckoutSessionRequest(
        amount=float(total),
        currency="inr",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"order_id": order_id, "source": "vincaroma"},
    )
    session = await stripe.create_checkout_session(ck)

    await db.payment_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "order_id": order_id,
        "session_id": session.session_id,
        "amount": float(total),
        "currency": "INR",
        "status": "initiated",
        "payment_status": "pending",
        "metadata": {"order_id": order_id},
        "created_at": now_iso(),
    })
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"stripe_session_id": session.session_id}},
    )
    return {"order_id": order_id, "url": session.url, "session_id": session.session_id}


@api.get("/checkout/status/{session_id}")
async def checkout_status(session_id: str, request: Request):
    webhook_url = f"{str(request.base_url).rstrip('/')}/api/webhook/stripe"
    stripe = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    status = await stripe.get_checkout_status(session_id)

    tx = await db.payment_transactions.find_one({"session_id": session_id})
    if tx and tx.get("payment_status") != "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"status": status.status, "payment_status": status.payment_status}},
        )
        if status.payment_status == "paid":
            order_id = (tx.get("metadata") or {}).get("order_id") or tx.get("order_id")
            if order_id:
                await db.orders.update_one(
                    {"id": order_id},
                    {"$set": {"payment_status": "paid", "status": "confirmed"}},
                )
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency,
    }


@api.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    sig = request.headers.get("Stripe-Signature", "")
    webhook_url = f"{str(request.base_url).rstrip('/')}/api/webhook/stripe"
    stripe = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    try:
        evt = await stripe.handle_webhook(body, sig)
        if evt.payment_status == "paid" and evt.session_id:
            tx = await db.payment_transactions.find_one({"session_id": evt.session_id})
            if tx and tx.get("payment_status") != "paid":
                await db.payment_transactions.update_one(
                    {"session_id": evt.session_id},
                    {"$set": {"payment_status": "paid", "status": "complete"}},
                )
                order_id = (tx.get("metadata") or {}).get("order_id") or tx.get("order_id")
                if order_id:
                    await db.orders.update_one(
                        {"id": order_id},
                        {"$set": {"payment_status": "paid", "status": "confirmed"}},
                    )
    except Exception as e:
        logger.error(f"Webhook error: {e}")
    return {"ok": True}


# ---------------- Orders ----------------
@api.get("/orders/{order_id}")
async def get_order(order_id: str):
    doc = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Order not found")
    return {"order": doc}


@api.get("/orders")
async def list_orders(admin=Depends(require_admin)):
    docs = await db.orders.find({}, {"_id": 0}).sort([("created_at", -1)]).limit(200).to_list(200)
    return {"orders": docs}


# ---------------- Scent Finder ----------------
@api.post("/scent-finder")
async def scent_finder(payload: Dict[str, Any]):
    """
    payload: { mood: 'bold'|'soft'|'fresh'|'warm', occasion: 'daily'|'evening'|'date'|'office',
               gender: 'men'|'women'|'unisex', notes: ['woody','floral'...] }
    """
    mood = payload.get("mood", "")
    occasion = payload.get("occasion", "")
    gender = payload.get("gender", "")
    notes = payload.get("notes", []) or []

    query: Dict[str, Any] = {}
    if gender and gender != "unisex":
        query["gender"] = {"$in": [gender, "unisex"]}

    family_map = {
        "bold": ["oriental", "woody"],
        "soft": ["floral", "musky"],
        "fresh": ["citrus", "fresh"],
        "warm": ["oriental", "woody"],
    }
    occasion_map = {
        "evening": ["oriental", "woody"],
        "date": ["floral", "oriental"],
        "office": ["fresh", "citrus", "musky"],
        "daily": ["fresh", "citrus", "floral"],
    }
    families = set(family_map.get(mood, [])) | set(occasion_map.get(occasion, [])) | set(notes)
    if families:
        query["scent_family"] = {"$in": list(families)}

    docs = await db.products.find(query, {"_id": 0}).sort([("rating", -1)]).limit(6).to_list(6)
    if not docs:
        docs = await db.products.find({}, {"_id": 0}).sort([("rating", -1)]).limit(6).to_list(6)
    return {"recommendations": docs}


# ---------------- Contact ----------------
class ContactMsg(BaseModel):
    name: str
    email: str
    subject: str
    message: str


@api.post("/contact")
async def contact(payload: ContactMsg):
    doc = {**payload.model_dump(), "id": str(uuid.uuid4()), "created_at": now_iso()}
    await db.contact_messages.insert_one(doc)
    return {"success": True}


@api.get("/")
async def root():
    return {"brand": "Vin&c Aroma", "status": "ok"}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
