import React, { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Mail, Phone, Instagram, MapPin } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return toast.error("Please fill all fields");
    setLoading(true);
    try {
      await api.post("/contact", form);
      toast.success("Thank you. We will reach out shortly.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch { toast.error("Failed to send"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16">
      <div>
        <div className="overline mb-4">Get in touch</div>
        <h1 className="font-serif text-5xl text-[#0F4C45] leading-tight">Speak with the<br/>Maison</h1>
        <p className="text-[#4F4F4F] mt-6 leading-relaxed max-w-md">
          Whether you seek a custom composition, a gift for someone rare, or a private consultation — our concierge is here.
        </p>
        <div className="mt-10 space-y-4 text-sm text-[#1F1F1F]">
          <a href="tel:+917975999476" className="flex items-center gap-3 hover:text-[#C9A35A] transition-colors" data-testid="contact-phone">
            <Phone size={16} className="text-[#C9A35A]"/> +91 79759 99476
          </a>
          <a href="mailto:vinandcaroma@gmail.com" className="flex items-center gap-3 hover:text-[#C9A35A] transition-colors" data-testid="contact-email-link">
            <Mail size={16} className="text-[#C9A35A]"/> vinandcaroma@gmail.com
          </a>
          <a href="https://instagram.com/vinandc.aroma" target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-[#C9A35A] transition-colors" data-testid="contact-instagram">
            <Instagram size={16} className="text-[#C9A35A]"/> @vinandc.aroma
          </a>
          <div className="flex items-center gap-3"><MapPin size={16} className="text-[#C9A35A]"/> Atelier Vin&amp;c · India</div>
        </div>

        <div className="mt-12 border-t border-[#E7E2D6] pt-8">
          <div className="overline mb-3">Concierge hours</div>
          <p className="text-sm text-[#4F4F4F]">Mon – Sat · 10am to 7pm IST</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-5 card-luxe p-8 h-fit" data-testid="contact-form">
        <div className="overline">Send us a message</div>
        <input className="input-luxe" placeholder="Your Name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} data-testid="contact-name"/>
        <input className="input-luxe" placeholder="Email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} data-testid="contact-email"/>
        <input className="input-luxe" placeholder="Subject" value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} data-testid="contact-subject"/>
        <textarea rows={5} className="input-luxe resize-none" placeholder="Your message" value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} data-testid="contact-message"/>
        <button disabled={loading} className="btn-gold w-full" data-testid="contact-submit-btn">{loading ? "Sending…" : "Send Message"}</button>
      </form>
    </div>
  );
}
