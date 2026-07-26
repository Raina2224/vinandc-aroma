import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Sparkles, Leaf, Gem, ShieldCheck, Gift, Truck, Feather, ChevronDown } from "lucide-react";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";

const HERO_BG = "/images/products/essential-1.jpg";
const CRAFTED_IMG = "/images/products/gentleman-2.jpg";

const WHY_VINANDC = [
  { icon: Gem, title: "40% Concentrated Oils", body: "Extrait de Parfum strength — nearly double a standard eau de parfum." },
  { icon: Feather, title: "8-Week Maceration", body: "Every batch rests for eight weeks so the notes marry fully before bottling." },
  { icon: ShieldCheck, title: "100% Authentic", body: "Sealed, batch-coded bottles shipped straight from the Maison." },
  { icon: Leaf, title: "Vegan & Cruelty-Free", body: "No animal-derived ingredients, no animal testing — ever." },
  { icon: Truck, title: "Free Shipping ₹499+", body: "Complimentary delivery across India in 4–5 business days." },
  { icon: Gift, title: "Signature Gift Wrap", body: "Every order arrives dressed in Vin&c's emerald-and-gold packaging." },
];

const INGREDIENTS = [
  { name: "French Bergamot", origin: "Calabria & Provence" },
  { name: "Oud", origin: "Assam, India" },
  { name: "Bulgarian Rose", origin: "Kazanlak Valley" },
  { name: "Madagascar Vanilla", origin: "Sava Region" },
  { name: "Mysore Sandalwood", origin: "Karnataka, India" },
  { name: "Ambergris Accord", origin: "Sustainably Synthesized" },
];

const REVIEWS = [
  { name: "Ananya R.", scent: "The Essential", rating: 5, body: "The longevity is unreal — I sprayed it at 8am and could still catch it on my scarf at midnight." },
  { name: "Rohan K.", scent: "The Gentleman", rating: 5, body: "Compliment magnet. Cedarwood and leather done exactly right, never overpowering." },
  { name: "Meera S.", scent: "The Casino", rating: 4, body: "Smoky, spiced, unexpected — my go-to for evenings out. The bottle alone feels like a gift." },
  { name: "Aditya V.", scent: "The Essential", rating: 5, body: "Wore this to a wedding and three strangers asked what it was. Worth every rupee." },
];

const FAQS = [
  { q: "How long does the fragrance last?", a: "Our Extrait de Parfum lasts 4–6 hours on skin and even longer on clothes." },
  { q: "Do you offer free shipping?", a: "Yes — complimentary shipping on all orders above ₹499 across India." },
  { q: "How long does delivery take?", a: "Orders are typically delivered within 4–5 business days across India." },
  { q: "Are your fragrances vegan and cruelty-free?", a: "Yes. All Vin&c Aroma fragrances are 100% vegan and cruelty-free." },
];

function FaqRow({ item, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#E7E2D6]">
      <button onClick={() => setOpen(v => !v)} className="w-full flex justify-between items-center py-5 text-left group" data-testid="home-faq-toggle">
        <span className="font-serif text-lg md:text-xl text-[#0F4C45] group-hover:text-[#C9A35A] transition-colors pr-6">{item.q}</span>
        <ChevronDown size={16} className={`text-[#C9A35A] shrink-0 transition-transform ${open ? "rotate-180" : ""}`}/>
      </button>
      <motion.div initial={false} animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
        <p className="text-[#4F4F4F] leading-relaxed pb-5 max-w-2xl text-sm">{item.a}</p>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get("/products", { params: { sort: "rating", limit: 4 } }).then(r => setFeatured(r.data.products));
  }, []);

  return (
    <div className="bg-[#FAFAF8]">
      {/* 1 — HERO */}
      <section className="relative overflow-hidden bg-[#F4F1EA] border-b border-[#E7E2D6]">
        <div className="max-w-screen-2xl mx-auto grid lg:grid-cols-2 min-h-[90vh]">
          <div className="flex items-center px-6 lg:px-16 py-20 lg:py-0 order-2 lg:order-1">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
              <div className="overline mb-6">Maison Vin&amp;c Aroma</div>
              <h1 className="font-serif font-light text-[#0F4C45] leading-[0.92] text-[3.2rem] sm:text-[4.2rem] lg:text-[6.2rem] tracking-tight">
                Vin<span className="text-[#C9A35A]">&amp;</span>c
              </h1>
              <div className="overline text-[#0F4C45] mt-4 mb-8 tracking-[0.42em]">Aroma</div>
              <p className="font-serif italic text-[#0F4C45] text-2xl sm:text-3xl lg:text-4xl leading-tight max-w-xl">
                Born of dreams,<br/>bottled in <span className="text-[#C9A35A]">elegance</span>.
              </p>
              <div className="flex flex-wrap gap-4 mt-12">
                <Link to="/shop" className="btn-gold" data-testid="hero-shop-btn">Explore Collection <ChevronRight size={16}/></Link>
                <Link to="/about" className="btn-outline-gold" data-testid="hero-about-btn">Our Story</Link>
              </div>
            </motion.div>
          </div>
          <div className="relative order-1 lg:order-2 aspect-square lg:aspect-auto">
            <img src={HERO_BG} alt="Vin&c Aroma — The Essential" className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous"/>
          </div>
        </div>
      </section>

      {/* 2 — FEATURED COLLECTION (top rated) */}
      <section className="py-24 lg:py-32 max-w-screen-2xl mx-auto px-6 lg:px-10" data-testid="collection-section">
        <div className="text-center mb-16">
          <div className="overline mb-3">The Signature Line</div>
          <h2 className="font-serif text-5xl md:text-6xl text-[#0F4C45]">Featured Collection</h2>
          <div className="divider-gold mx-auto mt-6"/>
          <p className="font-serif italic text-lg text-[#4F4F4F] mt-6 max-w-lg mx-auto">
            Three distinguished scents, unmistakable elegance.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8" data-testid="featured-grid">
          {featured.map(p => <ProductCard key={p.id} product={p}/>)}
        </div>
        <div className="text-center mt-16">
          <Link to="/shop" className="btn-outline-gold inline-block" data-testid="collection-view-all">
            Shop The Full Collection <ChevronRight size={14}/>
          </Link>
        </div>
      </section>

      {/* 4 — WHY VIN&C AROMA */}
      <section className="py-24 lg:py-32 max-w-screen-2xl mx-auto px-6 lg:px-10" data-testid="why-vinandc-section">
        <div className="text-center mb-16">
          <div className="overline mb-3">The Difference</div>
          <h2 className="font-serif text-4xl md:text-5xl text-[#0F4C45]">Why Vin&amp;c Aroma</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_VINANDC.map(w => (
            <div key={w.title} className="card-luxe p-8" data-testid={`why-card-${w.title.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`}>
              <w.icon size={26} className="text-[#C9A35A] mb-5"/>
              <div className="font-serif text-xl text-[#0F4C45] mb-2">{w.title}</div>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">{w.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5 — CRAFTED IN FRANCE */}
      <section className="bg-[#0F4C45] py-16 lg:py-24" data-testid="crafted-in-france-section">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative overflow-hidden border border-[#D8B46A]/30 order-2 md:order-1">
            <img src={CRAFTED_IMG} alt="Crafted in France" className="w-full h-auto" crossOrigin="anonymous"/>
          </div>
          <div className="text-[#FAFAF8] order-1 md:order-2">
            <div className="text-[10px] font-medium tracking-[0.32em] uppercase text-[#D8B46A] mb-5">Provenance</div>
            <h2 className="font-serif text-4xl md:text-6xl leading-tight">
              Crafted in<br/><span className="italic text-[#D8B46A]">France.</span>
            </h2>
            <p className="text-[#FAFAF8]/80 mt-8 leading-relaxed max-w-md">
              Every Vin&amp;c Aroma fragrance is composed with French concentrated perfume oils and left to
              mature before it ever touches a bottle — the quiet discipline behind a scent that lasts.
            </p>
            <div className="grid grid-cols-3 gap-6 mt-10 border-t border-[#D8B46A]/30 pt-8">
              <div><div className="font-serif text-3xl text-[#D8B46A]">40%</div><div className="text-[10px] tracking-widest uppercase text-[#FAFAF8]/60 mt-1">Concentrated Oils</div></div>
              <div><div className="font-serif text-3xl text-[#D8B46A]">8 wks</div><div className="text-[10px] tracking-widest uppercase text-[#FAFAF8]/60 mt-1">Maceration</div></div>
              <div><div className="font-serif text-3xl text-[#D8B46A]">4–6h</div><div className="text-[10px] tracking-widest uppercase text-[#FAFAF8]/60 mt-1">On Skin</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 — LUXURY INGREDIENTS */}
      <section className="py-24 lg:py-32 max-w-screen-2xl mx-auto px-6 lg:px-10" data-testid="ingredients-section">
        <div className="text-center mb-16">
          <div className="overline mb-3">Sourced Globally</div>
          <h2 className="font-serif text-4xl md:text-5xl text-[#0F4C45]">Luxury Ingredients</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-[#E7E2D6] border border-[#E7E2D6]">
          {INGREDIENTS.map(ing => (
            <div key={ing.name} className="bg-[#FAFAF8] p-8 text-center" data-testid={`ingredient-${ing.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`}>
              <div className="font-serif text-xl text-[#0F4C45]">{ing.name}</div>
              <div className="text-[10px] tracking-widest uppercase text-[#B88A3C] mt-2">{ing.origin}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 7 — FIND YOUR SCENT (quiz CTA) */}
      <section className="py-20 lg:py-28 bg-[#F4F1EA] border-y border-[#E7E2D6]" data-testid="scent-finder-cta-section">
        <div className="max-w-3xl mx-auto text-center px-6">
          <div className="overline mb-3 flex items-center justify-center gap-2"><Sparkles size={12}/> Signature Ritual</div>
          <h2 className="font-serif text-4xl md:text-5xl text-[#0F4C45]">Find Your Scent</h2>
          <p className="text-[#4F4F4F] mt-6 leading-relaxed max-w-lg mx-auto">
            Answer four questions and we&apos;ll reveal the fragrances made for your inner world.
          </p>
          <Link to="/scent-finder" className="btn-gold mt-10 inline-flex" data-testid="home-scent-finder-btn">
            Take the Scent Quiz <ChevronRight size={14}/>
          </Link>
        </div>
      </section>

      {/* 8 — ABOUT THE BRAND */}
      <section className="py-24 lg:py-32 max-w-screen-2xl mx-auto px-6 lg:px-10" data-testid="about-brand-section">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="overline mb-4">About the Maison</div>
            <h2 className="font-serif text-4xl md:text-6xl text-[#0F4C45] leading-tight">
              A quiet<br/>obsession with<br/><span className="italic text-[#C9A35A]">scent.</span>
            </h2>
            <p className="text-[#4F4F4F] mt-8 leading-relaxed max-w-md">
              Vin&amp;c Aroma was born from the belief that a fragrance is not decoration — it is autobiography.
              Every bottle we compose begins as a private memory, translated into a language only skin can speak.
            </p>
            <p className="font-serif italic text-[#0F4C45] text-2xl mt-8 max-w-md">
              &ldquo;To wear a scent well is to wear something invisible with total intention.&rdquo;
            </p>
            <Link to="/about" className="btn-gold mt-10 inline-flex" data-testid="home-about-btn">
              Discover Our Story <ChevronRight size={14}/>
            </Link>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden border border-[#E7E2D6]">
            <img src="/images/products/casino-2.jpg" alt="Vin&c Aroma" className="w-full h-full object-cover"/>
          </div>
        </div>
      </section>

      {/* 9 — CUSTOMER REVIEWS */}
      <section className="py-24 lg:py-32 max-w-screen-2xl mx-auto px-6 lg:px-10" data-testid="reviews-section">
        <div className="text-center mb-16">
          <div className="overline mb-3">Voices</div>
          <h2 className="font-serif text-4xl md:text-5xl text-[#0F4C45]">Customer Reviews</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {REVIEWS.map(r => (
            <div key={r.name} className="card-luxe p-6" data-testid={`home-review-${r.name.split(' ')[0].toLowerCase()}`}>
              <div className="text-[#C9A35A] text-sm mb-3">{"★".repeat(r.rating)}<span className="text-[#E7E2D6]">{"★".repeat(5-r.rating)}</span></div>
              <p className="text-sm text-[#4F4F4F] leading-relaxed">&ldquo;{r.body}&rdquo;</p>
              <div className="text-xs text-[#0F4C45] font-medium mt-4">{r.name}</div>
              <div className="text-[10px] text-[#B88A3C] uppercase tracking-widest mt-1">{r.scent}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 10 — FAQ (inline) */}
      <section className="py-20 lg:py-28 bg-[#F4F1EA] border-y border-[#E7E2D6]" data-testid="home-faq-section">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="overline mb-3">Support</div>
            <h2 className="font-serif text-4xl md:text-5xl text-[#0F4C45]">Frequently Asked</h2>
          </div>
          <div>
            {FAQS.map((f, i) => <FaqRow key={f.q} item={f} defaultOpen={i === 0}/>)}
          </div>
          <div className="text-center mt-10">
            <Link to="/faq" className="btn-outline-gold inline-block" data-testid="home-faq-view-all">View All FAQs</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
