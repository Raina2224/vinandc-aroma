import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { ShopProvider } from "@/context/ShopContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import AuthModal from "@/components/AuthModal";

import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Checkout from "@/pages/Checkout";
import Success from "@/pages/Success";
import Wishlist from "@/pages/Wishlist";
import OrderTracking from "@/pages/OrderTracking";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import FAQ from "@/pages/FAQ";
import ShippingPolicy from "@/pages/ShippingPolicy";
import ScentFinder from "@/pages/ScentFinder";

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function Layout({ children, hideChrome }) {
  return (
    <>
      {!hideChrome && <Header />}
      <main data-testid="main-content" className="grain-overlay">{children}</main>
      {!hideChrome && <Footer />}
      <CartDrawer />
      <AuthModal />
    </>
  );
}

function AppRoutes() {
  const loc = useLocation();
  const isAdmin = loc.pathname.startsWith("/admin");
  return (
    <Layout hideChrome={isAdmin}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/collections/:collection" element={<Shop />} />
        <Route path="/best-sellers" element={<Shop />} />
        <Route path="/new-arrivals" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/scent-finder" element={<ScentFinder />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/success" element={<Success />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/order-tracking" element={<OrderTracking />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Layout>
  );
}

function BestNewRewrites() {
  // Rewrite /best-sellers → /shop?best=1 semantic
  const loc = useLocation();
  React.useEffect(() => {
    if (loc.pathname === "/best-sellers" && !loc.search) {
      window.history.replaceState({}, "", "/best-sellers?best=1");
    }
    if (loc.pathname === "/new-arrivals" && !loc.search) {
      window.history.replaceState({}, "", "/new-arrivals?new=1");
    }
  }, [loc]);
  return null;
}

export default function App() {
  return (
    <div className="App">
      <ShopProvider>
        <BrowserRouter>
          <ScrollToTop />
          <BestNewRewrites />
          <AppRoutes />
          <Toaster position="bottom-right" theme="light" toastOptions={{ style: { background: "#FAFAF8", border: "1px solid #C9A35A", color: "#0F4C45", borderRadius: "0" } }} />
        </BrowserRouter>
      </ShopProvider>
    </div>
  );
}
