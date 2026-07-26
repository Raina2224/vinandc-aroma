import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Minus, Plus, Truck, Sparkles, ShieldCheck } from "lucide-react";
import api from "@/lib/api";
import { useShop } from "@/context/ShopContext";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";

export default function ProductDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [size, setSize] = useState("50ml");
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [reviewForm, setReviewForm] = useState({ user_name: "", rating: 5, title: "", body: "" });
  const { addToCart, toggleWishlist, inWishlist, addRecent } = useShop();

  useEffect(() => {
    setActiveImg(0);
    setData(null);
    setNotFound(false);
    api.get(`/products/${slug}`).then(r => {
      setData(r.data);
      addRecent(r.data.product);
    }).catch(() => setNotFound(true));
    // eslint-disable-next-line
  }, [slug]);

  if (notFound) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FAFAF8] px-6 text-center">
        <div className="overline mb-3">Not Found</div>
        <h2 className="font-serif text-3xl text-[#0F4C45] mb-6">We couldn&apos;t find that fragrance</h2>
        <Link to="/shop" className="btn-gold">Discover Fragrances</Link>
      </div>
    );
  }

  if (!data) return <div className="min-h-[70vh] flex items-center justify-center bg-[#FAFAF8]"><div className="text-[#6B6B6B] tracking-widest uppercase text-xs">Loading fragrance…</div></div>;

  const { product: p, related, reviews } = data;
  const price = (p.sizes || []).find(s => s.size === size)?.price ?? p.price;
  const wished = inWishlist(p.id);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.user_name || !reviewForm.title) return toast.error("Please fill in name and title");
    try {
      const { data: rr } = await api.post("/reviews", { ...reviewForm, product_id: p.id });
      toast.success("Thank you for your review");
      setData(d => ({ ...d, reviews: [rr.review, ...d.reviews] }));
      setReviewForm({ user_name: "", rating: 5, title: "", body: "" });
    } catch {
      toast.error("Failed to submit review");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-10 grid lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="lg:sticky lg:top-32 self-start">
          <motion.img key={activeImg} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            src={p.images[activeImg]} alt={p.name} className="w-full aspect-[4/5] object-cover bg-[#F4F1EA] border border-[#E7E2D6]" data-testid="product-main-image"/>
          <div className="flex gap-3 mt-4">
            {p.images.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)}
                className={`w-20 h-24 overflow-hidden border-2 transition-colors ${activeImg===i?"border-[#C9A35A]":"border-[#E7E2D6] hover:border-[#0F4C45]/30"}`} data-testid={`thumb-${i}`}>
                <img src={img} alt="" className="w-full h-full object-cover"/>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <div className="overline mb-3">{p.scent_family} · {p.gender} · Extrait de Parfum</div>
            <h1 className="font-serif text-4xl md:text-5xl text-[#0F4C45] leading-tight" data-testid="product-title">{p.name}</h1>
            <p className="font-serif italic text-[#4F4F4F] mt-2 text-lg">{p.tagline}</p>
            <div className="flex items-center gap-3 mt-4">
              <span className="text-[#C9A35A]">★ {p.rating}</span>
              <span className="text-xs text-[#6B6B6B]">({p.review_count} reviews)</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="font-serif text-3xl text-[#0F4C45]" data-testid="product-price">₹{price.toLocaleString('en-IN')}</span>
            {p.compare_at_price && <span className="text-[#6B6B6B] line-through text-lg">₹{p.compare_at_price.toLocaleString('en-IN')}</span>}
          </div>

          <div>
            <div className="overline mb-3">Size</div>
            <div className="flex gap-3">
              {p.sizes.map(s => (
                <button key={s.size} onClick={() => setSize(s.size)}
                  className={`px-6 py-3 border text-sm tracking-widest transition-colors ${size === s.size ? "border-[#C9A35A] text-[#C9A35A] bg-[#C9A35A]/5" : "border-[#E7E2D6] text-[#1F1F1F] hover:border-[#0F4C45]"}`}
                  data-testid={`size-${s.size}`}>
                  {s.size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center border border-[#E7E2D6] bg-white">
              <button onClick={() => setQty(q => Math.max(1, q-1))} className="w-11 h-12 hover:bg-[#F4F1EA]" data-testid="qty-decrease"><Minus size={14} className="mx-auto text-[#0F4C45]"/></button>
              <span className="w-10 text-center text-[#0F4C45]" data-testid="qty-value">{qty}</span>
              <button onClick={() => setQty(q => q+1)} className="w-11 h-12 hover:bg-[#F4F1EA]" data-testid="qty-increase"><Plus size={14} className="mx-auto text-[#0F4C45]"/></button>
            </div>
            <button onClick={() => addToCart(p, size, qty)} className="btn-gold flex-1 min-w-[200px]" data-testid="add-to-cart-btn">
              <ShoppingBag size={14}/> Add to Bag
            </button>
            <button onClick={() => toggleWishlist(p)} className={`w-12 h-12 border flex items-center justify-center transition-colors ${wished ? "border-[#C9A35A] bg-[#C9A35A] text-white" : "border-[#E7E2D6] text-[#0F4C45] hover:border-[#C9A35A]"}`} data-testid="wishlist-btn-detail">
              <Heart size={16} fill={wished ? "currentColor" : "none"}/>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-[10px] text-[#6B6B6B] tracking-widest uppercase pt-2">
            <div className="flex items-center gap-2"><Truck size={14} className="text-[#C9A35A]"/> Free ship ₹499+</div>
            <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-[#C9A35A]"/> 100% Authentic</div>
            <div className="flex items-center gap-2"><Sparkles size={14} className="text-[#C9A35A]"/> Signature Gift</div>
          </div>

          <div className="border-t border-[#E7E2D6] pt-8">
            <div className="overline mb-4">Scent Pyramid</div>
            <div className="space-y-4">
              {[
                { label: "Top", notes: p.top_notes, w: "60%" },
                { label: "Heart", notes: p.middle_notes, w: "80%" },
                { label: "Base", notes: p.base_notes, w: "100%" },
              ].map(row => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs text-[#4F4F4F] mb-2">
                    <span className="tracking-widest uppercase text-[#C9A35A]">{row.label}</span>
                    <span className="text-right">{(row.notes || []).join(" · ")}</span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-[#C9A35A] via-[#C9A35A]/40 to-transparent" style={{ width: row.w }}/>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 border-t border-[#E7E2D6] pt-8">
            <div>
              <div className="text-xs text-[#6B6B6B] uppercase tracking-widest mb-2">Longevity</div>
              <div className="flex gap-1">{[1,2,3,4,5].map(i => (
                <div key={i} className={`w-6 h-1 ${i <= p.longevity ? "bg-[#C9A35A]" : "bg-[#E7E2D6]"}`}/>
              ))}</div>
              <div className="text-xs text-[#6B6B6B] mt-2">{p.longevity}/5 · {p.longevity >= 4 ? "Long lasting" : "Moderate"}</div>
            </div>
            <div>
              <div className="text-xs text-[#6B6B6B] uppercase tracking-widest mb-2">Sillage</div>
              <div className="flex gap-1">{[1,2,3,4,5].map(i => (
                <div key={i} className={`w-6 h-1 ${i <= p.sillage ? "bg-[#C9A35A]" : "bg-[#E7E2D6]"}`}/>
              ))}</div>
              <div className="text-xs text-[#6B6B6B] mt-2">{p.sillage}/5 · {p.sillage >= 4 ? "Powerful" : "Intimate"}</div>
            </div>
          </div>

          <div className="border-t border-[#E7E2D6] pt-8">
            <div className="overline mb-3">Description</div>
            <p className="text-[#4F4F4F] leading-relaxed">{p.description}</p>
          </div>

          <div className="border-t border-[#E7E2D6] pt-8">
            <div className="overline mb-3">Ingredients</div>
            <p className="text-[#6B6B6B] text-sm leading-relaxed">{p.ingredients}</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-16 border-t border-[#E7E2D6]">
        <div className="flex justify-between items-end mb-10">
          <div>
            <div className="overline mb-3">Voices</div>
            <h2 className="font-serif text-3xl text-[#0F4C45]">Customer Reviews</h2>
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-10">
          <form onSubmit={submitReview} className="space-y-5 card-luxe p-6 lg:p-8" data-testid="review-form">
            <div className="overline">Write a review</div>
            <input value={reviewForm.user_name} onChange={(e) => setReviewForm(f => ({...f, user_name: e.target.value}))} className="input-luxe" placeholder="Your name" data-testid="review-name"/>
            <div>
              <div className="text-xs text-[#6B6B6B] uppercase tracking-widest mb-2">Rating</div>
              <div className="flex gap-1 text-2xl">
                {[1,2,3,4,5].map(n => (
                  <button type="button" key={n} onClick={() => setReviewForm(f => ({...f, rating: n}))} className={n <= reviewForm.rating ? "text-[#C9A35A]" : "text-[#E7E2D6]"} data-testid={`review-star-${n}`}>★</button>
                ))}
              </div>
            </div>
            <input value={reviewForm.title} onChange={(e) => setReviewForm(f => ({...f, title: e.target.value}))} className="input-luxe" placeholder="Review title" data-testid="review-title"/>
            <textarea value={reviewForm.body} onChange={(e) => setReviewForm(f => ({...f, body: e.target.value}))} rows={4} className="input-luxe resize-none" placeholder="Share your experience" data-testid="review-body"/>
            <button className="btn-gold w-full" data-testid="submit-review-btn">Submit Review</button>
          </form>

          <div className="lg:col-span-2 space-y-6">
            {reviews.length === 0 && <div className="text-[#6B6B6B] italic">Be the first to review this fragrance.</div>}
            {reviews.map(r => (
              <div key={r.id} className="border-b border-[#E7E2D6] pb-5" data-testid={`review-${r.id}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[#0F4C45] font-medium">{r.title}</div>
                    <div className="text-xs text-[#6B6B6B] mt-1">by {r.user_name}</div>
                  </div>
                  <div className="text-[#C9A35A] text-sm">{"★".repeat(r.rating)}<span className="text-[#E7E2D6]">{"★".repeat(5-r.rating)}</span></div>
                </div>
                <p className="text-[#4F4F4F] mt-3 leading-relaxed text-sm">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {related?.length > 0 && (
        <section className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-16 border-t border-[#E7E2D6]">
          <h2 className="font-serif text-3xl text-[#0F4C45] mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map(r => <ProductCard key={r.id} product={r}/>)}
          </div>
        </section>
      )}
    </div>
  );
}
