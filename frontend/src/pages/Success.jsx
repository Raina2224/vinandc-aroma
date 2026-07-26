import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Check, Package, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useShop } from "@/context/ShopContext";

export default function Success() {
  const loc = useLocation();
  const nav = useNavigate();
  const params = new URLSearchParams(loc.search);
  const sessionId = params.get("session_id");
  const orderId = params.get("order_id");
  const cod = params.get("cod");
  const mock = params.get("mock");

  const [status, setStatus] = useState(cod || mock ? "paid" : "checking");
  const [attempts, setAttempts] = useState(0);
  const { clearCart } = useShop();

  useEffect(() => {
    if (cod || mock) { clearCart(); return; }
    if (!sessionId) return;
    let cancelled = false;
    const poll = async (n = 0) => {
      if (n >= 6 || cancelled) { setStatus("timeout"); return; }
      try {
        const { data } = await api.get(`/checkout/status/${sessionId}`);
        if (data.payment_status === "paid") { setStatus("paid"); clearCart(); return; }
        if (data.status === "expired") { setStatus("expired"); return; }
        setAttempts(n+1);
        setTimeout(() => poll(n+1), 2000);
      } catch { setTimeout(() => poll(n+1), 2000); }
    };
    poll(0);
    return () => { cancelled = true; };
    // eslint-disable-next-line
  }, [sessionId]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center bg-[#FAFAF8]">
      {status === "checking" && (
        <>
          <Loader2 size={40} className="text-[#C9A35A] animate-spin mb-6"/>
          <h1 className="font-serif text-3xl md:text-4xl text-[#0F4C45] mb-4">Confirming your fragrance…</h1>
          <p className="text-[#6B6B6B] text-sm">Please wait while we verify your payment. Attempt {attempts+1}/6</p>
        </>
      )}
      {status === "paid" && (
        <>
          <div className="w-20 h-20 border-2 border-[#C9A35A] flex items-center justify-center mb-6 bg-white"><Check size={32} className="text-[#C9A35A]"/></div>
          <div className="overline mb-3">Order Confirmed</div>
          <h1 className="font-serif text-4xl md:text-5xl text-[#0F4C45] mb-4">Thank you</h1>
          <p className="text-[#4F4F4F] max-w-md leading-relaxed">Your Vin&amp;c Aroma order is being carefully prepared. A confirmation will arrive shortly on your phone.</p>
          {orderId && <div className="mt-6 text-xs uppercase tracking-widest text-[#6B6B6B]" data-testid="order-id">Order ID: {orderId.slice(0,8)}</div>}
          <div className="flex gap-4 mt-10">
            {orderId && <Link to={`/order-tracking?id=${orderId}`} className="btn-outline-gold" data-testid="track-order-btn"><Package size={14}/> Track Order</Link>}
            <button onClick={() => nav("/shop")} className="btn-gold" data-testid="continue-shopping-btn">Continue Shopping</button>
          </div>
        </>
      )}
      {(status === "expired" || status === "timeout") && (
        <>
          <h1 className="font-serif text-3xl text-[#0F4C45] mb-4">Payment {status === "expired" ? "expired" : "check timed out"}</h1>
          <button onClick={() => nav("/checkout")} className="btn-gold mt-6">Try again</button>
        </>
      )}
    </div>
  );
}
