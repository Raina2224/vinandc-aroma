import React from "react";
import { Link } from "react-router-dom";
import { Truck, Clock, Package, MapPin, Mail } from "lucide-react";

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-14">
        <div className="overline mb-3">Policy</div>
        <h1 className="font-serif text-5xl text-[#0F4C45]">Shipping</h1>
        <p className="text-[#4F4F4F] mt-4 max-w-lg mx-auto">Every Vin&amp;c Aroma order is packed by hand and shipped with care across India.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-16">
        <div className="card-luxe p-8" data-testid="shipping-free-card">
          <Truck size={22} className="text-[#C9A35A] mb-4"/>
          <div className="font-serif text-2xl text-[#0F4C45]">Free Shipping</div>
          <div className="text-[#4F4F4F] mt-3">Complimentary on all orders above <span className="text-[#C9A35A] font-medium">₹499</span>.</div>
        </div>
        <div className="card-luxe p-8" data-testid="shipping-time-card">
          <Clock size={22} className="text-[#C9A35A] mb-4"/>
          <div className="font-serif text-2xl text-[#0F4C45]">4–5 Business Days</div>
          <div className="text-[#4F4F4F] mt-3">Delivery across India from our atelier.</div>
        </div>
      </div>

      <div className="space-y-10 text-[#1F1F1F]">
        <section>
          <div className="overline mb-3">Order Processing</div>
          <p className="leading-relaxed text-[#4F4F4F]">Orders are processed within 24 hours (excluding Sundays and public holidays). You will receive a confirmation the moment your order is placed, and again once it ships.</p>
        </section>
        <section>
          <div className="overline mb-3">Delivery Time</div>
          <p className="leading-relaxed text-[#4F4F4F]">Standard delivery across India takes <span className="text-[#C9A35A] font-medium">4–5 business days</span>. Metro cities are typically faster than remote pincodes.</p>
        </section>
        <section>
          <div className="overline mb-3">Shipping Charges</div>
          <ul className="space-y-2 leading-relaxed text-[#4F4F4F]">
            <li>· Orders above ₹499 — <span className="text-[#C9A35A] font-medium">Free</span></li>
            <li>· Orders below ₹499 — Flat ₹99</li>
          </ul>
        </section>
        <section>
          <div className="overline mb-3">Order Tracking</div>
          <p className="leading-relaxed text-[#4F4F4F]">You will receive a tracking link via SMS and email once your fragrance dispatches. You can also track anytime using your order ID at our <Link to="/order-tracking" className="text-[#C9A35A] underline underline-offset-4">Track Order</Link> page.</p>
        </section>
        <section>
          <div className="overline mb-3">Packaging</div>
          <p className="leading-relaxed text-[#4F4F4F]">Each fragrance is presented in a signature Vin&amp;c Aroma outer box, protected with cushioned insulation to ensure safe arrival — and to make the unboxing itself a ritual.</p>
        </section>
        <section>
          <div className="overline mb-3">Delivery Area</div>
          <p className="leading-relaxed text-[#4F4F4F] flex items-start gap-2"><MapPin size={16} className="text-[#C9A35A] mt-1 shrink-0"/> We currently ship to all serviceable pincodes across India. International shipping arriving soon.</p>
        </section>
        <section>
          <div className="overline mb-3">Delayed or Missing Orders</div>
          <p className="leading-relaxed text-[#4F4F4F] flex items-start gap-2"><Mail size={16} className="text-[#C9A35A] mt-1 shrink-0"/> Write to us at <a href="mailto:vinandcaroma@gmail.com" className="text-[#C9A35A] underline underline-offset-4">vinandcaroma@gmail.com</a> or call <a href="tel:+917975999476" className="text-[#C9A35A]">+91 79759 99476</a> and our concierge will personally follow up.</p>
        </section>
      </div>

      <div className="text-center mt-16 border-t border-[#E7E2D6] pt-10">
        <Link to="/shop" className="btn-gold inline-block" data-testid="shipping-shop-btn"><Package size={14}/> Explore Fragrances</Link>
      </div>
    </div>
  );
}
