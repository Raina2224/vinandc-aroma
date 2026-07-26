import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, User, Heart, Menu, X } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import SearchBar from "@/components/SearchBar";

const ANNOUNCEMENTS = [
  "Free Shipping on Orders Above ₹499",
  "Born Of Dreams, Bottled In Elegance",
  "Delivery Across India in 4–5 Days",
];

export default function Header() {
  const { cartCount, setCartOpen, setAuthOpen, user, logout, searchOpen, setSearchOpen } = useShop();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [annIdx, setAnnIdx] = useState(0);
  const nav = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setAnnIdx(i => (i + 1) % ANNOUNCEMENTS.length), 3800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const links = [
    { to: "/shop", label: "Shop" },
    { to: "/collections/women", label: "Women" },
    { to: "/collections/men", label: "Men" },
    { to: "/collections/unisex", label: "Unisex" },
    { to: "/scent-finder", label: "Scent Finder" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <>
      <div className="bg-[#0F4C45] text-[#FAFAF8] h-9 flex items-center justify-center overflow-hidden" data-testid="announcement-bar">
        <AnimatePresence mode="wait">
          <motion.div key={annIdx} initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -15, opacity: 0 }} transition={{ duration: 0.4 }}
            className="text-[11px] tracking-[0.3em] uppercase font-medium">
            {ANNOUNCEMENTS[annIdx]}
          </motion.div>
        </AnimatePresence>
      </div>

      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#FAFAF8]/95 border-b border-[#E7E2D6]">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-28">
            <button className="lg:hidden text-[#0F4C45] hover:text-[#C9A35A]" onClick={() => setMobileOpen(true)} data-testid="mobile-menu-btn" aria-label="Menu">
              <Menu size={24} />
            </button>

            <Link to="/" className="flex-1 lg:flex-none text-center lg:text-left" data-testid="brand-logo">
              <div className="font-serif text-4xl lg:text-5xl tracking-tight leading-none">
                <span className="text-[#0F4C45]">Vin</span><span className="text-[#C9A35A]">&amp;</span><span className="text-[#0F4C45]">c</span>
              </div>
              <div className="text-[10px] tracking-[0.42em] uppercase text-[#0F4C45] mt-1.5 font-medium">Aroma</div>
            </Link>

            <nav className="hidden lg:flex items-center gap-8 mx-8">
              {links.map(l => (
                <Link key={l.to} to={l.to} className="text-[11px] tracking-[0.24em] uppercase text-[#0F4C45] hover:text-[#C9A35A] transition-colors font-medium" data-testid={`nav-${l.label.toLowerCase().replace(/\s+/g,'-')}`}>
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-5 lg:gap-6">
              <button className="text-[#0F4C45] hover:text-[#C9A35A] transition-colors" onClick={() => setSearchOpen(true)} data-testid="open-search-btn" aria-label="Search">
                <Search size={20} />
              </button>
              <button className="text-[#0F4C45] hover:text-[#C9A35A] transition-colors hidden sm:block" onClick={() => nav("/wishlist")} data-testid="wishlist-btn" aria-label="Wishlist">
                <Heart size={20} />
              </button>
              {user ? (
                <div className="relative group">
                  <button className="text-[#0F4C45] hover:text-[#C9A35A]" data-testid="user-menu-btn" aria-label="Account">
                    <User size={20} />
                  </button>
                  <div className="absolute right-0 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="bg-white border border-[#E7E2D6] min-w-[200px] p-4 shadow-xl">
                      <div className="text-[10px] text-[#6B6B6B] uppercase tracking-widest">Signed in</div>
                      <div className="text-sm text-[#0F4C45] mt-1 font-medium">{user.name}</div>
                      <div className="text-xs text-[#6B6B6B] mb-3">{user.phone}</div>
                      <button onClick={() => { logout(); nav("/"); }} className="text-xs text-[#C9A35A] uppercase tracking-widest hover:text-[#0F4C45]" data-testid="logout-btn">Sign out</button>
                    </div>
                  </div>
                </div>
              ) : (
                <button className="text-[#0F4C45] hover:text-[#C9A35A] transition-colors" onClick={() => setAuthOpen(true)} data-testid="open-auth-btn" aria-label="Sign in">
                  <User size={20} />
                </button>
              )}
              <button className="relative text-[#0F4C45] hover:text-[#C9A35A] transition-colors" onClick={() => setCartOpen(true)} data-testid="open-cart-btn" aria-label="Cart">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#0F4C45] text-[#FAFAF8] text-[10px] font-semibold min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full" data-testid="cart-count-badge">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* PREMIUM FULL-SCREEN MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] bg-[#0F4C45] flex flex-col" data-testid="mobile-menu-overlay">
            <div className="flex justify-between items-center p-6 border-b border-[#D8B46A]/20">
              <Link to="/" onClick={() => setMobileOpen(false)} className="font-serif text-3xl">
                <span className="text-[#FAFAF8]">Vin</span><span className="text-[#D8B46A]">&amp;</span><span className="text-[#FAFAF8]">c</span>
              </Link>
              <button onClick={() => setMobileOpen(false)} data-testid="close-mobile-menu" className="text-[#FAFAF8] hover:text-[#D8B46A]" aria-label="Close menu">
                <X size={26}/>
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-center px-8 space-y-1 overflow-y-auto py-10">
              {links.map((l, i) => (
                <motion.div key={l.to}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 + i * 0.06 }}>
                  <Link to={l.to} onClick={() => setMobileOpen(false)}
                        className="block py-4 font-serif text-4xl text-[#FAFAF8] hover:text-[#D8B46A] transition-colors border-b border-[#D8B46A]/10">
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="pt-8 space-y-3">
                <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="block text-xs tracking-[0.28em] uppercase text-[#FAFAF8]/70 hover:text-[#D8B46A]">Wishlist</Link>
                <Link to="/order-tracking" onClick={() => setMobileOpen(false)} className="block text-xs tracking-[0.28em] uppercase text-[#FAFAF8]/70 hover:text-[#D8B46A]">Track Order</Link>
                <Link to="/faq" onClick={() => setMobileOpen(false)} className="block text-xs tracking-[0.28em] uppercase text-[#FAFAF8]/70 hover:text-[#D8B46A]">FAQ</Link>
                <Link to="/shipping-policy" onClick={() => setMobileOpen(false)} className="block text-xs tracking-[0.28em] uppercase text-[#FAFAF8]/70 hover:text-[#D8B46A]">Shipping Policy</Link>
              </motion.div>
            </div>

            <div className="p-8 border-t border-[#D8B46A]/20 text-center">
              <a href="tel:+917975999476" className="block text-[#D8B46A] text-sm tracking-widest">+91 79759 99476</a>
              <a href="mailto:vinandcaroma@gmail.com" className="block text-[#FAFAF8]/60 text-xs tracking-widest mt-2">vinandcaroma@gmail.com</a>
              <a href="https://instagram.com/vinandc.aroma" target="_blank" rel="noreferrer" className="block text-[#D8B46A] text-[10px] tracking-[0.3em] uppercase mt-4">@vinandc.aroma</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {searchOpen && <SearchBar onClose={() => setSearchOpen(false)} />}
    </>
  );
}
