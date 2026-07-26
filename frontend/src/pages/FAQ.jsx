import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQ = [
  { q: "How long does the fragrance last?", a: "Our Extrait de Parfum is designed to perform — lasting 4 to 6 hours on skin and even longer on clothes. Longevity may vary depending on the fragrance, your skin type, and weather conditions, but every spray is crafted to leave a memorable impression." },
  { q: "Do you offer free shipping?", a: "Yes. We offer complimentary shipping on all orders above ₹499 across India." },
  { q: "How long does delivery take?", a: "Orders are typically delivered within 4–5 business days across India." },
  { q: "What size are the bottles?", a: "Each Vin&c Aroma bottle is 50ml (approximately 450 sprays) — a lifetime companion for daily wear or special occasions." },
  { q: "How should I store my perfume?", a: "Store away from direct sunlight and heat, ideally at room temperature. Avoid the bathroom — humidity and temperature swings can degrade the fragrance. A dark drawer is ideal." },
  { q: "Are your fragrances vegan and cruelty-free?", a: "Yes. All Vin&c Aroma fragrances are 100% vegan and cruelty-free. We never test on animals." },
  { q: "Can I return or exchange a fragrance?", a: "Due to the nature of the product, opened fragrances cannot be returned. Unopened items can be exchanged within 7 days of delivery — please contact us at vinandcaroma@gmail.com." },
  { q: "How do I track my order?", a: "Once your order ships, you'll receive a confirmation. You can also track your order anytime at our Track Order page using your order ID." },
];

function Item({ item, i, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#E7E2D6]" data-testid={`faq-page-item-${i}`}>
      <button onClick={() => setOpen(v => !v)} className="w-full flex justify-between items-center py-6 text-left group">
        <span className="font-serif text-xl md:text-2xl text-[#0F4C45] group-hover:text-[#C9A35A] transition-colors pr-8">{item.q}</span>
        <ChevronDown size={18} className={`text-[#C9A35A] transition-transform shrink-0 ${open ? "rotate-180" : ""}`}/>
      </button>
      <motion.div initial={false} animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
        <p className="text-[#4F4F4F] leading-relaxed pb-6 max-w-3xl">{item.a}</p>
      </motion.div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-14">
        <div className="overline mb-3">Support</div>
        <h1 className="font-serif text-5xl md:text-6xl text-[#0F4C45]">Frequently Asked</h1>
        <p className="text-[#4F4F4F] mt-4 max-w-lg mx-auto">Everything you need to know about Vin&amp;c Aroma.</p>
      </div>
      <div>
        {FAQ.map((f, i) => <Item key={i} item={f} i={i} defaultOpen={i === 0}/>)}
      </div>
      <div className="text-center mt-16 border-t border-[#E7E2D6] pt-10">
        <p className="text-[#4F4F4F] mb-6">Still have a question?</p>
        <Link to="/contact" className="btn-gold inline-block" data-testid="faq-contact-btn">Speak with our Concierge</Link>
      </div>
    </div>
  );
}
