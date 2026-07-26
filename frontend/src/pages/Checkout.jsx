import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useShop } from "@/context/ShopContext";
import api from "@/lib/api";

export default function Checkout() {
  const { cart, subtotal, clearCart } = useShop();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("stripe");
  const [addr, setAddr] = useState({
    fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", country: "India",
  });

  const shipping = subtotal >= 499 ? 0 : 99;
  const total = subtotal + shipping;

  const canSubmit = cart.length > 0 && addr.fullName && addr.phone && addr.line1 && addr.city && addr.state && addr.pincode;

  const placeOrder = async () => {
    if (!canSubmit) return toast.error("Please fill all address fields");
    setLoading(true);
    try {
      const { data } = await api.post("/checkout/session", {
        items: cart.map(i => ({ productId: i.productId, quantity: i.quantity, size: i.size })),
        address: addr,
        origin_url: window.location.origin,
        payment_method: method,
      });
      if (method === "stripe") {
        if (!data.url) throw new Error("No checkout URL");
        window.location.href = data.url;
      } else {
        // razorpay mock or COD → clear cart and go to success
        clearCart();
        nav(data.redirect_url.replace(window.location.origin, ""));
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || e.message || "Checkout failed");
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 bg-[#FAFAF8]">
        <div className="overline mb-3">Your bag is empty</div>
        <h2 className="font-serif text-3xl text-[#0F4C45] mb-6">Nothing to check out yet</h2>
        <button onClick={() => nav("/shop")} className="btn-gold" data-testid="checkout-empty-shop-btn">Discover Fragrances</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] max-w-screen-2xl mx-auto px-6 lg:px-10 py-16 grid lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-10">
        <div>
          <div className="overline mb-3">Step 1</div>
          <h2 className="font-serif text-3xl text-[#0F4C45]">Shipping Address</h2>
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 mt-8">
            <input className="input-luxe" placeholder="Full Name" value={addr.fullName} onChange={e => setAddr(a => ({...a, fullName: e.target.value}))} data-testid="addr-fullName"/>
            <input className="input-luxe" placeholder="Phone" value={addr.phone} onChange={e => setAddr(a => ({...a, phone: e.target.value}))} data-testid="addr-phone"/>
            <input className="input-luxe md:col-span-2" placeholder="Address Line 1" value={addr.line1} onChange={e => setAddr(a => ({...a, line1: e.target.value}))} data-testid="addr-line1"/>
            <input className="input-luxe md:col-span-2" placeholder="Address Line 2 (optional)" value={addr.line2} onChange={e => setAddr(a => ({...a, line2: e.target.value}))} data-testid="addr-line2"/>
            <input className="input-luxe" placeholder="City" value={addr.city} onChange={e => setAddr(a => ({...a, city: e.target.value}))} data-testid="addr-city"/>
            <input className="input-luxe" placeholder="State" value={addr.state} onChange={e => setAddr(a => ({...a, state: e.target.value}))} data-testid="addr-state"/>
            <input className="input-luxe" placeholder="Pincode" value={addr.pincode} onChange={e => setAddr(a => ({...a, pincode: e.target.value}))} data-testid="addr-pincode"/>
            <input className="input-luxe" placeholder="Country" value={addr.country} onChange={e => setAddr(a => ({...a, country: e.target.value}))} data-testid="addr-country"/>
          </div>
        </div>

        <div>
          <div className="overline mb-3">Step 2</div>
          <h2 className="font-serif text-3xl text-[#0F4C45]">Payment Method</h2>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            {[
              { id: "stripe", title: "Credit / Debit Card", sub: "Powered by Stripe · Secure" },
              { id: "razorpay", title: "Razorpay (UPI/NetBanking)", sub: "Instant · Mock" },
              { id: "cod", title: "Cash on Delivery", sub: "Pay when it arrives" },
            ].map(pm => (
              <button key={pm.id} onClick={() => setMethod(pm.id)}
                className={`text-left p-5 border transition-colors ${method === pm.id ? "border-[#C9A35A] bg-[#C9A35A]/5" : "border-[#E7E2D6] bg-white hover:border-[#0F4C45]/40"}`}
                data-testid={`payment-${pm.id}`}>
                <div className="text-[#0F4C45] text-sm font-medium">{pm.title}</div>
                <div className="text-xs text-[#6B6B6B] mt-1">{pm.sub}</div>
              </button>
            ))}
          </div>
          {method === "razorpay" && (
            <div className="text-[11px] text-[#B88A3C] mt-3 italic">Note: Razorpay is running in MOCKED mode for demo. Real key will be plugged in when provided.</div>
          )}
        </div>
      </div>

      <aside className="card-luxe p-8 h-fit sticky top-32">
        <div className="overline mb-4">Order Summary</div>
        <div className="space-y-4 max-h-[300px] overflow-y-auto">
          {cart.map(i => (
            <div key={`${i.productId}-${i.size}`} className="flex gap-3 text-sm">
              <img src={i.image} alt={i.name} className="w-14 h-16 object-cover bg-[#F4F1EA]"/>
              <div className="flex-1">
                <div className="text-[#0F4C45] font-serif text-base">{i.name}</div>
                <div className="text-xs text-[#6B6B6B] uppercase tracking-widest">{i.size} × {i.quantity}</div>
              </div>
              <div className="text-[#1F1F1F] font-medium">₹{(i.price * i.quantity).toLocaleString('en-IN')}</div>
            </div>
          ))}
        </div>
        <div className="border-t border-[#E7E2D6] mt-6 pt-6 space-y-3 text-sm">
          <div className="flex justify-between text-[#4F4F4F]"><span>Subtotal</span><span className="text-[#1F1F1F]" data-testid="summary-subtotal">₹{subtotal.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between text-[#4F4F4F]"><span>Shipping</span><span className="text-[#1F1F1F]">{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
          <div className="flex justify-between border-t border-[#E7E2D6] pt-3 text-lg font-serif"><span className="text-[#0F4C45]">Total</span><span className="text-[#C9A35A]" data-testid="summary-total">₹{total.toLocaleString('en-IN')}</span></div>
        </div>
        <button onClick={placeOrder} disabled={loading || !canSubmit} className="btn-gold w-full mt-6" data-testid="place-order-btn">
          {loading ? "Processing…" : method === "cod" ? "Place Order" : "Pay Securely"}
        </button>
      </aside>
    </div>
  );
}
