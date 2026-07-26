import React from "react";
import { Link } from "react-router-dom";
import { Heart, X } from "lucide-react";
import { useShop } from "@/context/ShopContext";

export default function Wishlist() {
  const { wishlist, toggleWishlist } = useShop();
  return (
    <div className="min-h-[70vh] max-w-screen-2xl mx-auto px-6 lg:px-10 py-16 bg-[#FAFAF8]">
      <div className="text-center mb-12">
        <div className="overline mb-3">Saved for later</div>
        <h1 className="font-serif text-5xl text-[#0F4C45]">Wishlist</h1>
      </div>
      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={40} className="text-[#E7E2D6] mx-auto mb-4"/>
          <div className="text-[#4F4F4F] mb-6">Your wishlist is empty</div>
          <Link to="/shop" className="btn-gold inline-block" data-testid="wishlist-shop-btn">Explore Fragrances</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" data-testid="wishlist-grid">
          {wishlist.map(p => (
            <div key={p.id} className="group relative card-luxe" data-testid={`wishlist-item-${p.slug}`}>
              <Link to={`/product/${p.slug}`} className="block aspect-[3/4] overflow-hidden bg-[#F4F1EA]" data-testid={`product-card-${p.slug}`}>
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
              </Link>
              <button onClick={() => toggleWishlist(p)} className="absolute top-3 right-3 w-8 h-8 bg-white border border-[#E7E2D6] flex items-center justify-center hover:border-[#C9A35A]" data-testid={`remove-wishlist-${p.slug}`}><X size={14} className="text-[#0F4C45]"/></button>
              <div className="p-4">
                <div className="font-serif text-lg text-[#0F4C45]">{p.name}</div>
                <div className="text-[#C9A35A] font-medium">₹{p.price.toLocaleString('en-IN')}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
