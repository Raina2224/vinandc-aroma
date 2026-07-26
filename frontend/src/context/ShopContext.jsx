import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const ShopContext = createContext(null);
export const useShop = () => useContext(ShopContext);

export function ShopProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem("vc_cart") || "[]"); } catch { return []; }
  });
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem("vc_wishlist") || "[]"); } catch { return []; }
  });
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem("vc_recent") || "[]"); } catch { return []; }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("vc_user") || "null"); } catch { return null; }
  });

  useEffect(() => { localStorage.setItem("vc_cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("vc_wishlist", JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem("vc_recent", JSON.stringify(recent)); }, [recent]);

  const addToCart = (product, size = "50ml", qty = 1) => {
    const sizePrice = (product.sizes || []).find(s => s.size === size)?.price ?? product.price;
    setCart(prev => {
      const idx = prev.findIndex(i => i.productId === product.id && i.size === size);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [
        ...prev,
        {
          productId: product.id, name: product.name, slug: product.slug,
          image: product.images?.[0], size, price: sizePrice, quantity: qty,
        },
      ];
    });
    setCartOpen(true);
  };

  const removeFromCart = (productId, size) =>
    setCart(prev => prev.filter(i => !(i.productId === productId && i.size === size)));

  const updateQty = (productId, size, qty) =>
    setCart(prev => prev.map(i =>
      i.productId === productId && i.size === size ? { ...i, quantity: Math.max(1, qty) } : i
    ));

  const clearCart = () => setCart([]);

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      if (prev.find(p => p.id === product.id)) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, { id: product.id, name: product.name, slug: product.slug, image: product.images?.[0], price: product.price }];
    });
  };
  const inWishlist = (id) => !!wishlist.find(p => p.id === id);

  const addRecent = (product) => {
    setRecent(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      return [{ id: product.id, name: product.name, slug: product.slug, image: product.images?.[0], price: product.price }, ...filtered].slice(0, 8);
    });
  };

  const login = (token, userObj) => {
    localStorage.setItem("vc_token", token);
    localStorage.setItem("vc_user", JSON.stringify(userObj));
    setUser(userObj);
  };
  const logout = () => {
    localStorage.removeItem("vc_token");
    localStorage.removeItem("vc_user");
    setUser(null);
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const value = {
    cart, wishlist, recent, user,
    cartOpen, setCartOpen,
    authOpen, setAuthOpen,
    searchOpen, setSearchOpen,
    addToCart, removeFromCart, updateQty, clearCart,
    toggleWishlist, inWishlist, addRecent,
    login, logout,
    subtotal, cartCount,
    api,
  };
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
