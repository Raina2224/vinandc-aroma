import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { SlidersHorizontal } from "lucide-react";

export default function Shop() {
  const { collection } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [params] = useSearchParams();
  const forceBest = params.get("best") === "1";
  const forceNew = params.get("new") === "1";

  const [filters, setFilters] = useState({
    gender: collection || "all",
    scent_family: "all",
    max_price: 6000,
    longevity: 0,
    sort: "",
  });

  useEffect(() => {
    setFilters(f => ({ ...f, gender: collection || "all" }));
  }, [collection]);

  useEffect(() => {
    setLoading(true);
    const p = {};
    if (filters.gender !== "all") p.gender = filters.gender;
    if (filters.scent_family !== "all") p.scent_family = filters.scent_family;
    if (filters.max_price) p.max_price = filters.max_price;
    if (filters.longevity) p.longevity = filters.longevity;
    if (filters.sort) p.sort = filters.sort;
    if (forceBest) p.is_bestseller = true;
    if (forceNew) p.is_new = true;
    api.get("/products", { params: p }).then(r => {
      setProducts(r.data.products);
      setLoading(false);
    });
  }, [filters, forceBest, forceNew]);

  const heading = useMemo(() => {
    if (forceBest) return "Best Sellers";
    if (forceNew) return "New Arrivals";
    if (collection === "men") return "For Him";
    if (collection === "women") return "For Her";
    if (collection === "unisex") return "Unisex";
    return "The Full Collection";
  }, [collection, forceBest, forceNew]);

  const families = ["all", "floral", "woody", "citrus", "oriental", "fresh", "musky"];

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <section className="pt-16 pb-10 px-6 lg:px-10 max-w-screen-2xl mx-auto text-center border-b border-[#E7E2D6]">
        <div className="overline mb-3">Shop</div>
        <h1 className="font-serif text-5xl md:text-6xl text-[#0F4C45]">{heading}</h1>
        <p className="text-[#4F4F4F] mt-4 max-w-lg mx-auto text-sm italic font-serif">Every fragrance is composed with 40% French concentrated perfume oils and matured for eight weeks before bottling.</p>
      </section>

      <section className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setShowFilters(v => !v)} className="btn-ghost" data-testid="toggle-filters-btn">
            <SlidersHorizontal size={14}/> Filters
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6B6B6B] hidden sm:inline">{products.length} pieces</span>
            <select value={filters.sort} onChange={(e) => setFilters(f => ({ ...f, sort: e.target.value }))}
              className="bg-white border border-[#E7E2D6] text-[#0F4C45] text-xs uppercase tracking-widest py-2 px-3 outline-none" data-testid="sort-select">
              <option value="">Featured</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="card-luxe p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-6" data-testid="filters-panel">
            <div>
              <div className="overline mb-3">Gender</div>
              <div className="space-y-2 text-sm">
                {["all", "women", "men", "unisex"].map(g => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer text-[#1F1F1F] hover:text-[#0F4C45]">
                    <input type="radio" name="gender" checked={filters.gender === g} onChange={() => setFilters(f => ({...f, gender: g}))} data-testid={`filter-gender-${g}`}/>
                    <span className="capitalize">{g === "all" ? "All" : g}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <div className="overline mb-3">Scent Family</div>
              <div className="space-y-2 text-sm">
                {families.map(f => (
                  <label key={f} className="flex items-center gap-2 cursor-pointer text-[#1F1F1F] hover:text-[#0F4C45]">
                    <input type="radio" name="family" checked={filters.scent_family === f} onChange={() => setFilters(x => ({...x, scent_family: f}))} data-testid={`filter-family-${f}`}/>
                    <span className="capitalize">{f === "all" ? "All" : f}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <div className="overline mb-3">Max Price ₹{filters.max_price}</div>
              <input type="range" min="1500" max="6000" step="100" value={filters.max_price}
                onChange={(e) => setFilters(f => ({...f, max_price: Number(e.target.value)}))}
                className="w-full accent-[#0F4C45]" data-testid="filter-price-range"/>
            </div>
            <div>
              <div className="overline mb-3">Longevity ≥ {filters.longevity || "any"}</div>
              <div className="flex gap-2">
                {[0,3,4,5].map(n => (
                  <button key={n} onClick={() => setFilters(f => ({...f, longevity: n}))}
                    className={`px-3 py-1.5 text-xs border ${filters.longevity===n?"border-[#C9A35A] text-[#C9A35A] bg-[#C9A35A]/5":"border-[#E7E2D6] text-[#6B6B6B]"}`}
                    data-testid={`filter-longevity-${n}`}>{n === 0 ? "Any" : `${n}★`}</button>
                ))}
              </div>
              <button onClick={() => setFilters({ gender: collection || "all", scent_family: "all", max_price: 6000, longevity: 0, sort: "" })}
                className="text-[10px] mt-6 tracking-widest uppercase text-[#6B6B6B] hover:text-[#C9A35A]" data-testid="reset-filters-btn">Reset filters ×</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_,i) => <div key={i} className="aspect-[3/4] shimmer"/>)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-[#6B6B6B]" data-testid="empty-shop">No fragrances match these filters.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6" data-testid="products-grid">
            {products.map(p => <ProductCard key={p.id} product={p}/>)}
          </div>
        )}
      </section>
    </div>
  );
}
