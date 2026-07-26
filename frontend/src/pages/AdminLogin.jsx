import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";

export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@vincaroma.com");
  const [pw, setPw] = useState("Admin@123");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("vc_admin_token")) nav("/admin");
  }, [nav]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/admin/login", { email, password: pw });
      localStorage.setItem("vc_admin_token", data.token);
      localStorage.setItem("vc_token", data.token);
      toast.success("Welcome, curator");
      nav("/admin");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] bg-[#FAFAF8] flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-md card-luxe p-10" data-testid="admin-login-form">
        <div className="text-center mb-8">
          <div className="overline mb-3">Vin&amp;c Aroma</div>
          <h1 className="font-serif text-3xl text-[#0F4C45]">Admin Atelier</h1>
        </div>
        <div className="space-y-6">
          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-[#6B6B6B]">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} className="input-luxe" data-testid="admin-email"/>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-[#6B6B6B]">Password</label>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} className="input-luxe" data-testid="admin-password"/>
          </div>
          <button className="btn-gold w-full" disabled={loading} data-testid="admin-login-btn">{loading ? "Signing in…" : "Enter Atelier"}</button>
          <div className="text-[10px] text-[#6B6B6B] text-center tracking-widest">DEMO · admin@vincaroma.com / Admin@123</div>
        </div>
      </form>
    </div>
  );
}
