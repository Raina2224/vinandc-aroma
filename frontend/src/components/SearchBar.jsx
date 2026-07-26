import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Search as SearchIcon } from "lucide-react";
import api from "@/lib/api";

export default function SearchBar({ onClose }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    if (!q) { setResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get(`/products/suggest`, { params: { q } });
        setResults(data.suggestions || []);
      } catch { /* ignore */ }
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const clickTag = (t) => {
    if (t === "Best Sellers") { onClose(); nav("/best-sellers"); return; }
    setQ(t);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-[#FAFAF8]/98 backdrop-blur-xl" data-testid="search-overlay">
      <div className="max-w-3xl mx-auto pt-32 px-6">
        <div className="flex items-center gap-4 border-b border-[#C9A35A]/60 pb-4">
          <SearchIcon size={20} className="text-[#C9A35A]"/>
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search fragrances, notes, families…"
                 className="flex-1 bg-transparent outline-none text-[#0F4C45] text-2xl font-serif placeholder:text-[#9C947D]" data-testid="search-input"/>
          <button onClick={onClose} data-testid="close-search-btn"><X className="text-[#6B6B6B] hover:text-[#0F4C45]"/></button>
        </div>

        {results.length > 0 && (
          <div className="mt-6 space-y-3 max-h-[60vh] overflow-y-auto" data-testid="search-results">
            {results.map(r => (
              <Link key={r.id} to={`/product/${r.slug}`} onClick={onClose}
                    className="flex items-center gap-4 p-3 hover:bg-[#F4F1EA] transition-colors border border-transparent hover:border-[#E7E2D6]" data-testid={`search-result-${r.slug}`}>
                <img src={r.images?.[0]} alt={r.name} className="w-14 h-14 object-cover bg-[#F4F1EA]" crossOrigin="anonymous"/>
                <div className="flex-1">
                  <div className="text-[#0F4C45] font-serif text-lg">{r.name}</div>
                  <div className="text-xs text-[#C9A35A]">₹{r.price?.toLocaleString('en-IN')}</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {q === "" && (
          <div className="mt-10">
            <div className="overline mb-4">Popular searches</div>
            <div className="flex flex-wrap gap-3">
              {["Oud", "Rose", "Woody", "Fresh", "Amber", "Vanilla", "Best Sellers"].map(t => (
                <button key={t} onClick={() => clickTag(t)} className="btn-ghost" data-testid={`popular-search-${t.toLowerCase()}`}>{t}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
