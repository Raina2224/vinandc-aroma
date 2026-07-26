import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useShop } from "@/context/ShopContext";

export default function CartDrawer() {
  const { cartOpen, setCartOpen, cart, updateQty, removeFromCart, subtotal } = useShop();

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-[#0F4C45]/40 backdrop-blur-sm z-[80]" data-testid="cart-backdrop"/>
          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
            className="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-[#FAFAF8] border-l border-[#C9A35A]/30 z-[90] flex flex-col shadow-2xl"
            data-testid="cart-drawer">
            <div className="flex items-center justify-between p-6 border-b border-[#E7E2D6]">
              <div>
                <div className="overline">Your bag</div>
                <div className="font-serif text-2xl text-[#0F4C45]">{cart.length} {cart.length === 1 ? "Item" : "Items"}</div>
              </div>
              <button onClick={() => setCartOpen(false)} className="text-[#0F4C45] hover:text-[#C9A35A]" data-testid="close-cart-btn"><X /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {cart.length === 0 && (
                <div className="text-center py-20">
                  <ShoppingBag size={48} className="mx-auto text-[#E7E2D6] mb-4"/>
                  <div className="text-[#4F4F4F] mb-2">Your bag is empty</div>
                  <div className="text-xs text-[#6B6B6B] mb-6">Add a fragrance to begin your journey</div>
                  <Link to="/shop" onClick={() => setCartOpen(false)} className="btn-outline-gold inline-block" data-testid="empty-cart-shop-btn">Explore Shop</Link>
                </div>
              )}
              {cart.map(item => (
                <div key={`${item.productId}-${item.size}`} className="flex gap-4 border-b border-[#E7E2D6] pb-5" data-testid={`cart-item-${item.slug}`}>
                  <img src={item.image} alt={item.name} className="w-24 h-28 object-cover bg-[#F4F1EA]" crossOrigin="anonymous"/>
                  <div className="flex-1">
                    <div className="text-[#0F4C45] font-serif text-lg">{item.name}</div>
                    <div className="text-xs text-[#6B6B6B] uppercase tracking-widest mt-1">{item.size}</div>
                    <div className="text-[#C9A35A] mt-2 font-medium">₹{item.price.toLocaleString('en-IN')}</div>
                    <div className="flex items-center gap-3 mt-3">
                      <button onClick={() => updateQty(item.productId, item.size, item.quantity - 1)} className="w-7 h-7 border border-[#E7E2D6] flex items-center justify-center hover:border-[#0F4C45]" data-testid={`decrease-qty-${item.slug}`}><Minus size={12} className="text-[#0F4C45]"/></button>
                      <span className="text-[#0F4C45] text-sm">{item.quantity}</span>
                      <button onClick={() => updateQty(item.productId, item.size, item.quantity + 1)} className="w-7 h-7 border border-[#E7E2D6] flex items-center justify-center hover:border-[#0F4C45]" data-testid={`increase-qty-${item.slug}`}><Plus size={12} className="text-[#0F4C45]"/></button>
                      <button onClick={() => removeFromCart(item.productId, item.size)} className="ml-auto text-xs text-[#6B6B6B] hover:text-red-500 uppercase tracking-widest" data-testid={`remove-item-${item.slug}`}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-[#E7E2D6] space-y-4 bg-[#F4F1EA]">
                <div className="flex justify-between text-sm text-[#4F4F4F]">
                  <span>Subtotal</span>
                  <span className="text-[#0F4C45] text-lg font-serif" data-testid="cart-subtotal">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-[11px] text-[#6B6B6B] uppercase tracking-widest">
                  {subtotal >= 499 ? "✨ Free shipping unlocked" : `Add ₹${(499 - subtotal).toLocaleString('en-IN')} more for free shipping`}
                </div>
                <Link to="/checkout" onClick={() => setCartOpen(false)} className="btn-gold w-full" data-testid="checkout-btn">
                  Proceed to Checkout
                </Link>
                <Link to="/shop" onClick={() => setCartOpen(false)} className="text-center block text-xs uppercase tracking-widest text-[#6B6B6B] hover:text-[#C9A35A]">Continue shopping</Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
