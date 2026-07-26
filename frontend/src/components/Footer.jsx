import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Phone, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) return toast.error("Enter a valid email");
    setSubscribing(true);
    try {
      await api.post("/contact", {
        name: "Newsletter Signup", email, subject: "Newsletter Signup",
        message: `${email} subscribed to the Vin&c Aroma newsletter.`,
      });
      toast.success("You're on the list — welcome to the Maison");
      setEmail("");
    } catch {
      toast.error("Something went wrong, please try again");
    } finally { setSubscribing(false); }
  };
  return (
    <footer className="bg-[#0F4C45] text-[#FAFAF8] mt-24">
      {/* Brand banner */}
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 pt-20 pb-14 text-center border-b border-[#D8B46A]/20">
        <div className="font-serif text-6xl md:text-8xl leading-none">
          <span className="text-[#FAFAF8]">Vin</span><span className="text-[#D8B46A]">&amp;</span><span className="text-[#FAFAF8]">c</span>
        </div>
        <div className="text-[11px] tracking-[0.45em] uppercase text-[#D8B46A] mt-3 font-medium">Aroma</div>
        <p className="font-serif italic text-xl md:text-2xl text-[#FAFAF8]/85 mt-6">
          Born of dreams, bottled in <span className="text-[#D8B46A]">elegance</span>.
        </p>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="text-[10px] font-medium tracking-[0.32em] uppercase text-[#D8B46A] mb-5">The Maison</div>
          <p className="text-sm text-[#FAFAF8]/70 leading-relaxed max-w-xs">
            A trilogy of Extrait de Parfum for those who wear scent as a signature, not an accessory.
          </p>
          <div className="flex gap-4 mt-6">
            <a href="https://instagram.com/vinandc.aroma" target="_blank" rel="noreferrer"
               className="text-[#D8B46A] hover:text-[#FAFAF8] transition-colors" data-testid="social-instagram" aria-label="Instagram">
              <Instagram size={20}/>
            </a>
          </div>
        </div>

        <div>
          <div className="text-[10px] font-medium tracking-[0.32em] uppercase text-[#D8B46A] mb-5">Shop</div>
          <ul className="space-y-3 text-sm text-[#FAFAF8]/80">
            <li><Link to="/shop" className="hover:text-[#D8B46A]">The Collection</Link></li>
            <li><Link to="/product/the-essential" className="hover:text-[#D8B46A]">The Essential</Link></li>
            <li><Link to="/product/the-gentleman" className="hover:text-[#D8B46A]">The Gentleman</Link></li>
            <li><Link to="/product/the-casino" className="hover:text-[#D8B46A]">The Casino</Link></li>
            <li><Link to="/wishlist" className="hover:text-[#D8B46A]">Wishlist</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-[10px] font-medium tracking-[0.32em] uppercase text-[#D8B46A] mb-5">Maison</div>
          <ul className="space-y-3 text-sm text-[#FAFAF8]/80">
            <li><Link to="/about" className="hover:text-[#D8B46A]">Our Story</Link></li>
            <li><Link to="/faq" className="hover:text-[#D8B46A]">FAQ</Link></li>
            <li><Link to="/shipping-policy" className="hover:text-[#D8B46A]">Shipping Policy</Link></li>
            <li><Link to="/order-tracking" className="hover:text-[#D8B46A]">Track Order</Link></li>
            <li><Link to="/contact" className="hover:text-[#D8B46A]">Contact</Link></li>
            <li><Link to="/admin/login" className="hover:text-[#D8B46A]">Admin</Link></li>
          </ul>
        </div>

        <div className="col-span-2 md:col-span-1">
          <div className="text-[10px] font-medium tracking-[0.32em] uppercase text-[#D8B46A] mb-5">Reach Us</div>
          <ul className="space-y-3 text-sm text-[#FAFAF8]/80">
            <li className="flex items-center gap-2"><Phone size={14} className="text-[#D8B46A]"/> <a href="tel:+917975999476" className="hover:text-[#D8B46A]" data-testid="footer-phone">+91 79759 99476</a></li>
            <li className="flex items-center gap-2"><Mail size={14} className="text-[#D8B46A]"/> <a href="mailto:vinandcaroma@gmail.com" className="hover:text-[#D8B46A]" data-testid="footer-email">vinandcaroma@gmail.com</a></li>
            <li className="flex items-center gap-2"><Instagram size={14} className="text-[#D8B46A]"/> <a href="https://instagram.com/vinandc.aroma" target="_blank" rel="noreferrer" className="hover:text-[#D8B46A]" data-testid="footer-instagram">@vinandc.aroma</a></li>
            <li className="flex items-center gap-2"><MapPin size={14} className="text-[#D8B46A]"/> India</li>
          </ul>

          <div className="text-[10px] font-medium tracking-[0.32em] uppercase text-[#D8B46A] mt-8 mb-3">Newsletter</div>
          <form className="flex" onSubmit={subscribe}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email"
                   className="flex-1 mr-2 bg-transparent border-b border-[#D8B46A]/40 focus:border-[#D8B46A] text-[#FAFAF8] placeholder:text-[#FAFAF8]/40 placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest py-2 outline-none"
                   data-testid="newsletter-input"/>
            <button disabled={subscribing} className="text-[10px] tracking-[0.22em] uppercase text-[#0F4C45] bg-[#D8B46A] hover:bg-[#FAFAF8] hover:text-[#0F4C45] px-4 transition-colors font-medium disabled:opacity-60" data-testid="newsletter-submit">{subscribing ? "…" : "Join"}</button>
          </form>
        </div>
      </div>
      <div className="border-t border-[#FAFAF8]/10 py-6 text-center text-xs text-[#FAFAF8]/50 tracking-widest uppercase">
        © 2026 Vin&amp;c Aroma · Delivered across India
      </div>
    </footer>
  );
}
