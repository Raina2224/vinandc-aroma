import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Package, Truck, CheckCircle, Circle } from "lucide-react";
import api from "@/lib/api";

export default function OrderTracking() {
  const [params, setParams] = useSearchParams();
  const [id, setId] = useState(params.get("id") || "");
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");

  const fetchOrder = async (oid) => {
    setErr("");
    try {
      const { data } = await api.get(`/orders/${oid}`);
      setOrder(data.order);
    } catch (e) {
      setErr(e.response?.data?.detail || "Order not found");
      setOrder(null);
    }
  };

  useEffect(() => {
    if (params.get("id")) fetchOrder(params.get("id"));
    // eslint-disable-next-line
  }, []);

  const stages = [
    { key: "confirmed", label: "Confirmed", icon: CheckCircle },
    { key: "packed", label: "Packed", icon: Package },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "delivered", label: "Delivered", icon: CheckCircle },
  ];
  const currentIdx = order ? (order.status === "confirmed" ? 0 : 1) : -1;

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-16 max-w-4xl mx-auto px-6">
      <div className="text-center mb-10">
        <div className="overline mb-3">Order Tracking</div>
        <h1 className="font-serif text-4xl text-[#0F4C45]">Follow your Fragrance</h1>
      </div>

      <div className="flex gap-3 border-b border-[#C9A35A]/60 pb-4 mb-10">
        <Search className="text-[#C9A35A]"/>
        <input value={id} onChange={(e) => setId(e.target.value)}
               placeholder="Enter your order ID"
               className="flex-1 bg-transparent outline-none text-[#0F4C45]" data-testid="track-id-input"/>
        <button onClick={() => { setParams({ id }); fetchOrder(id); }} className="btn-gold" data-testid="track-search-btn">Track</button>
      </div>

      {err && <div className="text-red-500 text-sm text-center">{err}</div>}

      {order && (
        <div className="card-luxe p-8">
          <div className="flex flex-wrap justify-between items-start mb-8 gap-4">
            <div>
              <div className="overline mb-2">Order</div>
              <div className="font-serif text-2xl text-[#0F4C45]">#{order.id.slice(0,8).toUpperCase()}</div>
              <div className="text-xs text-[#6B6B6B] mt-1">Placed {new Date(order.created_at).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="overline mb-2">Total</div>
              <div className="font-serif text-2xl text-[#C9A35A]">₹{order.amount.toLocaleString('en-IN')}</div>
              <div className="text-xs text-[#6B6B6B] mt-1 uppercase tracking-widest">{order.payment_status}</div>
            </div>
          </div>

          <div className="flex justify-between mb-10 relative">
            <div className="absolute top-5 left-5 right-5 h-px bg-[#E7E2D6]"/>
            {stages.map((s, i) => {
              const active = i <= currentIdx;
              const Icon = active ? s.icon : Circle;
              return (
                <div key={s.key} className="relative flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center bg-white ${active ? "border-[#C9A35A] text-[#C9A35A]" : "border-[#E7E2D6] text-[#E7E2D6]"}`}>
                    <Icon size={16}/>
                  </div>
                  <div className={`mt-2 text-[10px] tracking-widest uppercase ${active ? "text-[#C9A35A]" : "text-[#6B6B6B]"}`}>{s.label}</div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-[#E7E2D6] pt-6 space-y-3">
            {order.items?.map((i, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <img src={i.image} alt={i.name} className="w-14 h-16 object-cover bg-[#F4F1EA]"/>
                <div className="flex-1">
                  <div className="text-[#0F4C45] font-serif">{i.name}</div>
                  <div className="text-xs text-[#6B6B6B] uppercase tracking-widest">{i.size} · Qty {i.quantity}</div>
                </div>
                <div className="text-[#1F1F1F] text-sm font-medium">₹{i.line_total.toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
