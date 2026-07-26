import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { useShop } from "@/context/ShopContext";

export default function ProductCard({ product, onQuickView }) {
  const { addToCart, toggleWishlist, inWishlist } = useShop();
  const [hover, setHover] = useState(false);
  const wished = inWishlist(product.id);
  const testid = `product-card-${product.slug}`;

  return (
    <div className="group card-luxe overflow-hidden"
         onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} data-testid={testid}>
      <Link to={`/product/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-[#F4F1EA]">
        <motion.img
          src={product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover"
          animate={{ scale: hover ? 1.05 : 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          crossOrigin="anonymous"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.is_bestseller && <span className="bg-[#0F4C45] text-[#FAFAF8] text-[9px] tracking-[0.22em] px-2.5 py-1 uppercase font-medium" data-testid={`badge-bestseller-${product.slug}`}>Best Seller</span>}
          {product.is_new && <span className="bg-[#C9A35A] text-white text-[9px] tracking-[0.22em] px-2.5 py-1 uppercase font-medium" data-testid={`badge-new-${product.slug}`}>New</span>}
          {product.compare_at_price && <span className="bg-[#B88A3C] text-white text-[9px] tracking-[0.22em] px-2.5 py-1 uppercase font-medium">Sale</span>}
        </div>

        {/* Wishlist */}
        <button onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
          className={`absolute top-4 right-4 w-9 h-9 flex items-center justify-center transition-all backdrop-blur-sm ${wished ? "bg-[#C9A35A] text-white" : "bg-white/85 text-[#0F4C45] hover:bg-white"}`}
          data-testid={`wishlist-toggle-${product.slug}`}>
          <Heart size={14} fill={wished ? "currentColor" : "none"}/>
        </button>

        {/* Hover overlay revealing scent notes */}
        <AnimatePresence>
          {hover && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0F4C45]/95 via-[#0F4C45]/80 to-transparent p-5 pt-14">
              <div className="text-[9px] tracking-[0.3em] uppercase text-[#D8B46A] mb-2">Scent Notes</div>
              <div className="text-xs text-[#FAFAF8] leading-relaxed">
                {[...(product.top_notes || []).slice(0,2), ...(product.middle_notes || []).slice(0,2)].join(" · ")}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={(e) => { e.preventDefault(); addToCart(product); }}
                        className="flex-1 bg-[#C9A35A] hover:bg-[#D8B46A] text-white text-[10px] tracking-[0.2em] uppercase py-2.5 flex items-center justify-center gap-2 transition-colors"
                        data-testid={`quick-add-${product.slug}`}>
                  <ShoppingBag size={12}/> Add
                </button>
                {onQuickView && (
                  <button onClick={(e) => { e.preventDefault(); onQuickView(product); }}
                          className="w-11 bg-white/10 border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-[#0F4C45]"
                          data-testid={`quick-view-${product.slug}`}>
                    <Eye size={14}/>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      <div className="p-5 bg-white">
        <div className="text-[10px] tracking-[0.28em] uppercase text-[#B88A3C] mb-1.5">{product.scent_family} · Extrait de Parfum</div>
        <Link to={`/product/${product.slug}`} className="block">
          <h3 className="font-serif text-2xl text-[#0F4C45] group-hover:text-[#C9A35A] transition-colors" data-testid={`product-name-${product.slug}`}>{product.name}</h3>
          <p className="text-xs text-[#6B6B6B] mt-1 line-clamp-1 italic font-serif">{product.tagline}</p>
        </Link>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-[#1F1F1F] text-lg font-medium" data-testid={`product-price-${product.slug}`}>₹{product.price.toLocaleString('en-IN')}</span>
            {product.compare_at_price && <span className="text-[#6B6B6B] text-xs line-through">₹{product.compare_at_price.toLocaleString('en-IN')}</span>}
          </div>
          <div className="text-[11px] text-[#C9A35A] tracking-wider">★ {product.rating}</div>
        </div>
      </div>
    </div>
  );
}
