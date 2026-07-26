"""Backend API tests for Vin&c Aroma e-commerce."""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8000').rstrip('/')
# Note: REACT_APP_BACKEND_URL lives in frontend/.env; fall back to the known value.
if not BASE_URL:
    from pathlib import Path
    envp = Path('/app/frontend/.env')
    for line in envp.read_text().splitlines():
        if line.startswith('REACT_APP_BACKEND_URL='):
            BASE_URL = line.split('=', 1)[1].strip().rstrip('/')

API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def s():
    return requests.Session()


@pytest.fixture(scope="session")
def admin_token(s):
    r = s.post(f"{API}/auth/admin/login", json={"email": "admin@vincaroma.com", "password": "Admin@123"})
    assert r.status_code == 200, r.text
    return r.json()["token"]


# ---------------- Products ----------------
class TestProducts:
    def test_list_all(self, s):
        r = s.get(f"{API}/products")
        assert r.status_code == 200
        data = r.json()
        assert data["count"] >= 3
        p = data["products"][0]
        for f in ["name", "price", "images", "top_notes", "middle_notes", "base_notes", "gender", "scent_family"]:
            assert f in p, f"missing {f}"

    def test_filter_gender_men(self, s):
        r = s.get(f"{API}/products", params={"gender": "men"})
        assert r.status_code == 200
        prods = r.json()["products"]
        assert len(prods) > 0
        assert all(p["gender"] == "men" for p in prods)

    def test_filter_scent_family_oriental(self, s):
        r = s.get(f"{API}/products", params={"scent_family": "oriental"})
        assert r.status_code == 200
        prods = r.json()["products"]
        assert len(prods) > 0
        assert all(p["scent_family"] == "oriental" for p in prods)

    def test_filter_bestseller(self, s):
        r = s.get(f"{API}/products", params={"is_bestseller": "true"})
        assert r.status_code == 200
        prods = r.json()["products"]
        assert len(prods) > 0
        assert all(p["is_bestseller"] is True for p in prods)

    def test_suggest(self, s):
        r = s.get(f"{API}/products/suggest", params={"q": "gentleman"})
        assert r.status_code == 200
        sug = r.json()["suggestions"]
        assert isinstance(sug, list)
        assert len(sug) > 0

    def test_get_by_slug(self, s):
        r = s.get(f"{API}/products/the-essential")
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["product"]["slug"] == "the-essential"
        assert isinstance(data["related"], list)
        assert isinstance(data["reviews"], list)


# ---------------- Auth ----------------
class TestAuth:
    def test_otp_send(self, s):
        r = s.post(f"{API}/auth/otp/send", json={"phone": "9876543210"})
        assert r.status_code == 200
        data = r.json()
        assert data["success"] is True
        assert data["demo_otp"] == "123456"

    def test_otp_verify(self, s):
        s.post(f"{API}/auth/otp/send", json={"phone": "9876543211"})
        r = s.post(f"{API}/auth/otp/verify", json={"phone": "9876543211", "otp": "123456", "name": "TEST_User"})
        assert r.status_code == 200
        data = r.json()
        assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 10
        assert data["user"]["phone"] == "9876543211"

    def test_admin_login_success(self, s):
        r = s.post(f"{API}/auth/admin/login", json={"email": "admin@vincaroma.com", "password": "Admin@123"})
        assert r.status_code == 200
        assert "token" in r.json()

    def test_admin_login_wrong(self, s):
        r = s.post(f"{API}/auth/admin/login", json={"email": "admin@vincaroma.com", "password": "wrong"})
        assert r.status_code == 401


# ---------------- Reviews ----------------
class TestReviews:
    def test_add_review_updates_rating(self, s):
        r = s.get(f"{API}/products/the-gentleman")
        assert r.status_code == 200
        pid = r.json()["product"]["id"]
        payload = {"product_id": pid, "user_name": "TEST_Reviewer", "rating": 5, "title": "TEST_Review", "body": "Great scent"}
        r2 = s.post(f"{API}/reviews", json=payload)
        assert r2.status_code == 200
        assert r2.json()["review"]["rating"] == 5
        # verify persisted via GET
        r3 = s.get(f"{API}/products/the-gentleman")
        titles = [rv["title"] for rv in r3.json()["reviews"]]
        assert "TEST_Review" in titles


# ---------------- Checkout ----------------
@pytest.fixture(scope="session")
def sample_item(s):
    r = s.get(f"{API}/products", params={"limit": 1})
    p = r.json()["products"][0]
    return {"productId": p["id"], "quantity": 1, "size": "50ml"}


ADDRESS = {"fullName": "Test User", "phone": "9999999999", "line1": "1 Test St", "city": "Mumbai", "state": "MH", "pincode": "400001", "country": "India"}


class TestCheckout:
    def test_cod(self, s, sample_item):
        r = s.post(f"{API}/checkout/session", json={
            "items": [sample_item], "address": ADDRESS, "origin_url": "https://example.com", "payment_method": "cod"
        })
        assert r.status_code == 200, r.text
        data = r.json()
        assert "order_id" in data
        assert "redirect_url" in data and "cod=1" in data["redirect_url"]
        # Verify order confirmed
        r2 = s.get(f"{API}/orders/{data['order_id']}")
        assert r2.status_code == 200
        assert r2.json()["order"]["status"] == "confirmed"

    def test_razorpay(self, s, sample_item):
        r = s.post(f"{API}/checkout/session", json={
            "items": [sample_item], "address": ADDRESS, "origin_url": "https://example.com", "payment_method": "razorpay"
        })
        assert r.status_code == 200
        data = r.json()
        assert data.get("razorpay_mock") is True
        assert "mock=1" in data["redirect_url"]
        r2 = s.get(f"{API}/orders/{data['order_id']}")
        assert r2.json()["order"]["payment_status"] == "paid"

    def test_stripe(self, s, sample_item):
        r = s.post(f"{API}/checkout/session", json={
            "items": [sample_item], "address": ADDRESS, "origin_url": "https://example.com", "payment_method": "stripe"
        })
        assert r.status_code == 200, r.text
        data = r.json()
        assert "url" in data and data["url"].startswith("https://")
        assert "session_id" in data
        # status polling
        r2 = s.get(f"{API}/checkout/status/{data['session_id']}")
        assert r2.status_code == 200
        assert "status" in r2.json()


# ---------------- Scent finder ----------------
class TestScentFinder:
    def test_recommend(self, s):
        r = s.post(f"{API}/scent-finder", json={"mood": "bold", "occasion": "evening", "gender": "unisex", "notes": ["woody"]})
        assert r.status_code == 200
        recs = r.json()["recommendations"]
        assert 1 <= len(recs) <= 6


# ---------------- Contact ----------------
class TestContact:
    def test_create(self, s):
        r = s.post(f"{API}/contact", json={"name": "TEST_C", "email": "t@t.com", "subject": "Hi", "message": "Hello"})
        assert r.status_code == 200
        assert r.json()["success"] is True


# ---------------- Admin orders ----------------
class TestAdminOrders:
    def test_orders_requires_admin(self, s):
        r = s.get(f"{API}/orders")
        assert r.status_code == 401

    def test_orders_with_admin(self, s, admin_token):
        r = s.get(f"{API}/orders", headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200
        assert "orders" in r.json()
