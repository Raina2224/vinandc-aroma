import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, LogOut, Package, ShoppingBag, TrendingUp } from "lucide-react";
import api from "@/lib/api";

export default function AdminDashboard() {
  const nav = useNavigate();
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankForm());

  useEffect(() => {
    const t = localStorage.getItem("vc_admin_token");
    if (!t) { nav("/admin/login"); return; }
    localStorage.setItem("vc_token", t);
    loadAll();
    // eslint-disable-next-line
  }, []);

  function blankForm() {
    return {
      name: "", tagline: "", description: "", price: 2999, compare_at_price: "",
      gender: "unisex", scent_family: "floral",
      top_notes: "", middle_notes: "", base_notes: "",
      longevity: 4, sillage: 3,
      ingredients: "Alcohol Denat., Parfum, Aqua",
      images: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=900",
      sizes: `[{"size":"30ml","price":2099},{"size":"50ml","price":2999},{"size":"100ml","price":4799}]`,
      stock: 40, is_bestseller: false, is_new: true,
    };
  }

  const loadAll = async () => {
    const p = await api.get("/products", { params: { limit: 200 } });
    setProducts(p.data.products);
    try {
      const o = await api.get("/orders");
      setOrders(o.data.orders);
    } catch { /* not admin? */ }
  };

  const openNew = () => { setForm(blankForm()); setEditing(null); setShowForm(true); };
  const openEdit = (p) => {
    setForm({
      name: p.name, tagline: p.tagline, description: p.description,
      price: p.price, compare_at_price: p.compare_at_price || "",
      gender: p.gender, scent_family: p.scent_family,
      top_notes: p.top_notes.join(", "),
      middle_notes: p.middle_notes.join(", "),
      base_notes: p.base_notes.join(", "),
      longevity: p.longevity, sillage: p.sillage,
      ingredients: p.ingredients,
      images: p.images.join("\n"),
      sizes: JSON.stringify(p.sizes),
      stock: p.stock, is_bestseller: p.is_bestseller, is_new: p.is_new,
    });
    setEditing(p);
    setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault();
    let sizes;
    try { sizes = JSON.parse(form.sizes); }
    catch { return toast.error("Sizes must be valid JSON"); }
    const payload = {
      name: form.name, tagline: form.tagline, description: form.description,
      price: Number(form.price),
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      gender: form.gender, scent_family: form.scent_family,
      top_notes: form.top_notes.split(",").map(s => s.trim()).filter(Boolean),
      middle_notes: form.middle_notes.split(",").map(s => s.trim()).filter(Boolean),
      base_notes: form.base_notes.split(",").map(s => s.trim()).filter(Boolean),
      longevity: Number(form.longevity), sillage: Number(form.sillage),
      ingredients: form.ingredients,
      images: form.images.split("\n").map(s => s.trim()).filter(Boolean),
      sizes, stock: Number(form.stock),
      is_bestseller: !!form.is_bestseller, is_new: !!form.is_new,
    };
    try {
      if (editing) await api.put(`/products/${editing.id}`, payload);
      else await api.post("/products", payload);
      toast.success(editing ? "Product updated" : "Product created");
      setShowForm(false); loadAll();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Save failed");
    }
  };

  const del = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    await api.delete(`/products/${p.id}`);
    toast.success("Deleted");
    loadAll();
  };

  const logout = () => {
    localStorage.removeItem("vc_admin_token");
    localStorage.removeItem("vc_token");
    nav("/admin/login");
  };

  const revenue = orders.filter(o => o.payment_status === "paid").reduce((s, o) => s + o.amount, 0);

  return (
    <div className="min-h-screen bg-[#FAFAF8] max-w-screen-2xl mx-auto px-6 lg:px-10 py-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <div className="overline mb-2">Atelier</div>
          <h1 className="font-serif text-4xl text-[#0F4C45]">Admin Dashboard</h1>
        </div>
        <button onClick={logout} className="btn-ghost" data-testid="admin-logout-btn"><LogOut size={14}/> Sign out</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {[
          { label: "Products", val: products.length, icon: Package },
          { label: "Orders", val: orders.length, icon: ShoppingBag },
          { label: "Revenue", val: `₹${revenue.toLocaleString('en-IN')}`, icon: TrendingUp },
        ].map(s => (
          <div key={s.label} className="card-luxe p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="overline mb-2">{s.label}</div>
                <div className="font-serif text-3xl text-[#0F4C45]" data-testid={`stat-${s.label.toLowerCase()}`}>{s.val}</div>
              </div>
              <s.icon size={22} className="text-[#C9A35A]"/>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 border-b border-[#E7E2D6] mb-8">
        {["products", "orders"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-3 text-sm uppercase tracking-widest font-medium ${tab === t ? "text-[#C9A35A] border-b-2 border-[#C9A35A]" : "text-[#6B6B6B]"}`}
            data-testid={`admin-tab-${t}`}>{t}</button>
        ))}
      </div>

      {tab === "products" && (
        <div>
          <div className="flex justify-end mb-6">
            <button onClick={openNew} className="btn-gold" data-testid="admin-new-product-btn"><Plus size={14}/> New Product</button>
          </div>
          <div className="card-luxe overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F4F1EA] text-[#6B6B6B] text-xs uppercase tracking-widest">
                <tr><th className="text-left p-4">Product</th><th className="text-left p-4">Family</th><th className="text-left p-4">Price</th><th className="text-left p-4">Stock</th><th className="p-4"></th></tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-t border-[#E7E2D6]" data-testid={`admin-product-row-${p.slug}`}>
                    <td className="p-4 flex items-center gap-3"><img src={p.images[0]} alt="" className="w-10 h-12 object-cover" crossOrigin="anonymous"/><span className="text-[#0F4C45] font-medium">{p.name}</span></td>
                    <td className="p-4 text-[#6B6B6B] capitalize">{p.scent_family}</td>
                    <td className="p-4 text-[#1F1F1F]">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-[#6B6B6B]">{p.stock}</td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => openEdit(p)} className="text-[#C9A35A] hover:text-[#0F4C45]" data-testid={`admin-edit-${p.slug}`}><Edit2 size={14}/></button>
                      <button onClick={() => del(p)} className="text-red-500 hover:text-red-700" data-testid={`admin-delete-${p.slug}`}><Trash2 size={14}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="card-luxe overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F4F1EA] text-[#6B6B6B] text-xs uppercase tracking-widest">
              <tr><th className="text-left p-4">Order</th><th className="text-left p-4">Customer</th><th className="text-left p-4">Amount</th><th className="text-left p-4">Payment</th><th className="text-left p-4">Status</th></tr>
            </thead>
            <tbody>
              {orders.length === 0 && <tr><td className="p-6 text-[#6B6B6B]" colSpan={5}>No orders yet.</td></tr>}
              {orders.map(o => (
                <tr key={o.id} className="border-t border-[#E7E2D6]">
                  <td className="p-4 text-[#0F4C45] font-medium">#{o.id.slice(0,8)}</td>
                  <td className="p-4 text-[#6B6B6B]">{o.address?.fullName} · {o.address?.phone}</td>
                  <td className="p-4 text-[#1F1F1F]">₹{o.amount.toLocaleString('en-IN')}</td>
                  <td className="p-4 text-[#6B6B6B] uppercase text-xs tracking-widest">{o.payment_method}</td>
                  <td className="p-4"><span className={`text-xs uppercase tracking-widest font-medium ${o.payment_status === "paid" ? "text-[#0F4C45]" : "text-[#B88A3C]"}`}>{o.payment_status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[100] bg-[#0F4C45]/50 flex items-start justify-center p-6 overflow-y-auto" onClick={() => setShowForm(false)}>
          <form onSubmit={save} onClick={e => e.stopPropagation()}
            className="bg-white border border-[#C9A35A]/40 max-w-2xl w-full p-8 my-10 space-y-4 shadow-2xl" data-testid="admin-product-form">
            <div className="font-serif text-2xl text-[#0F4C45]">{editing ? "Edit" : "New"} Product</div>
            <input required className="input-luxe" placeholder="Name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} data-testid="pf-name"/>
            <input required className="input-luxe" placeholder="Tagline" value={form.tagline} onChange={e => setForm(f => ({...f, tagline: e.target.value}))}/>
            <textarea rows={3} className="input-luxe resize-none" placeholder="Description" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}/>
            <div className="grid grid-cols-2 gap-4">
              <input required className="input-luxe" type="number" placeholder="Price" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))}/>
              <input className="input-luxe" type="number" placeholder="Compare-at price" value={form.compare_at_price} onChange={e => setForm(f => ({...f, compare_at_price: e.target.value}))}/>
              <select className="input-luxe" value={form.gender} onChange={e => setForm(f => ({...f, gender: e.target.value}))}>
                <option value="women">Women</option><option value="men">Men</option><option value="unisex">Unisex</option>
              </select>
              <select className="input-luxe" value={form.scent_family} onChange={e => setForm(f => ({...f, scent_family: e.target.value}))}>
                {["floral","woody","citrus","oriental","fresh","musky"].map(x => <option key={x} value={x}>{x}</option>)}
              </select>
              <input className="input-luxe" type="number" min="1" max="5" placeholder="Longevity" value={form.longevity} onChange={e => setForm(f => ({...f, longevity: e.target.value}))}/>
              <input className="input-luxe" type="number" min="1" max="5" placeholder="Sillage" value={form.sillage} onChange={e => setForm(f => ({...f, sillage: e.target.value}))}/>
            </div>
            <input className="input-luxe" placeholder="Top notes (comma)" value={form.top_notes} onChange={e => setForm(f => ({...f, top_notes: e.target.value}))}/>
            <input className="input-luxe" placeholder="Middle notes (comma)" value={form.middle_notes} onChange={e => setForm(f => ({...f, middle_notes: e.target.value}))}/>
            <input className="input-luxe" placeholder="Base notes (comma)" value={form.base_notes} onChange={e => setForm(f => ({...f, base_notes: e.target.value}))}/>
            <textarea rows={2} className="input-luxe resize-none" placeholder="Ingredients" value={form.ingredients} onChange={e => setForm(f => ({...f, ingredients: e.target.value}))}/>
            <textarea rows={3} className="input-luxe resize-none" placeholder="Images (one URL per line)" value={form.images} onChange={e => setForm(f => ({...f, images: e.target.value}))}/>
            <textarea rows={2} className="input-luxe resize-none" placeholder='Sizes JSON: [{"size":"50ml","price":2999}]' value={form.sizes} onChange={e => setForm(f => ({...f, sizes: e.target.value}))}/>
            <div className="flex gap-4 items-center">
              <label className="text-sm text-[#0F4C45] flex items-center gap-2"><input type="checkbox" checked={form.is_bestseller} onChange={e => setForm(f => ({...f, is_bestseller: e.target.checked}))}/> Best seller</label>
              <label className="text-sm text-[#0F4C45] flex items-center gap-2"><input type="checkbox" checked={form.is_new} onChange={e => setForm(f => ({...f, is_new: e.target.checked}))}/> New arrival</label>
              <input className="input-luxe !w-32 ml-auto" type="number" placeholder="Stock" value={form.stock} onChange={e => setForm(f => ({...f, stock: e.target.value}))}/>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
              <button type="submit" className="btn-gold flex-1" data-testid="admin-save-btn">{editing ? "Update" : "Create"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
