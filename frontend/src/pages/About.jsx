import React from "react";
import { Link } from "react-router-dom";

const ABOUT_IMG = "/images/products/essential-2.jpg";

export default function About() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <section className="bg-[#F4F1EA] py-24 lg:py-32 border-b border-[#E7E2D6]">
        <div className="max-w-4xl mx-auto text-center px-6">
          <div className="overline mb-4">The Maison</div>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-[#0F4C45] leading-tight">
            A quiet obsession<br/><span className="italic text-[#C9A35A]">with scent</span>
          </h1>
          <p className="font-serif italic text-2xl text-[#4F4F4F] mt-10">Born of dreams, bottled in elegance.</p>
        </div>
      </section>

      <section className="max-w-screen-2xl mx-auto py-24 px-6 lg:px-10 grid md:grid-cols-2 gap-16 items-center">
        <div className="relative aspect-[4/5] overflow-hidden border border-[#E7E2D6]">
          <img src={ABOUT_IMG} alt="Vin&c Aroma" className="w-full h-full object-cover"/>
        </div>
        <div className="text-[#4F4F4F] leading-relaxed space-y-6">
          <div className="overline">Our Story</div>
          <p className="text-lg">
            Vin&amp;c Aroma was born from the belief that a fragrance is not decoration — it is autobiography.
            Every bottle we compose begins as a private memory: the way afternoon light fell through a window,
            the cool weight of silk against skin, a garden after rain.
          </p>
          <p>
            The Vin&amp;c signature line is a trilogy — <span className="text-[#0F4C45] font-medium">The Essential</span>,
            <span className="text-[#0F4C45] font-medium"> The Gentleman</span>, and
            <span className="text-[#0F4C45] font-medium"> The Casino</span> — each an Extrait de Parfum composed to become
            a signature, not an accessory.
          </p>
          <p className="font-serif italic text-2xl text-[#0F4C45] pt-6 border-t border-[#E7E2D6]">
            &ldquo;To wear a scent well is to wear something invisible with total intention.&rdquo;
          </p>
          <div className="pt-4">
            <Link to="/shop" className="btn-gold inline-block" data-testid="about-shop-btn">Explore the Collection</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
