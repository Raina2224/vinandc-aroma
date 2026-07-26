import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import api from "@/lib/api";
import { useShop } from "@/context/ShopContext";
import { toast } from "sonner";

export default function AuthModal() {
  const { authOpen, setAuthOpen, login } = useShop();
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState("");

  const close = () => { setAuthOpen(false); setStep("phone"); setOtp(""); setDemoOtp(""); };

  const sendOtp = async () => {
    if (phone.length < 10) return toast.error("Enter valid 10-digit phone");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/otp/send", { phone });
      setDemoOtp(data.demo_otp || "");
      if (data.demo_otp) setOtp(data.demo_otp);
      toast.success(`OTP sent · Demo code: ${data.demo_otp}`);
      setStep("otp");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to send OTP");
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) return toast.error("Enter 6-digit OTP");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/otp/verify", { phone, otp, name });
      login(data.token, data.user);
      toast.success("Welcome to Vin&c Aroma");
      close();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Invalid OTP");
    } finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {authOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close} className="fixed inset-0 bg-[#0F4C45]/60 backdrop-blur-md z-[100]"/>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] w-[92%] max-w-md bg-[#FAFAF8] border border-[#C9A35A]/40 p-10 shadow-2xl"
            data-testid="auth-modal">
            <button onClick={close} className="absolute right-4 top-4 text-[#6B6B6B] hover:text-[#0F4C45]" data-testid="close-auth-btn"><X size={20}/></button>

            <div className="text-center mb-8">
              <div className="overline mb-3">Vin&amp;c Aroma</div>
              <h2 className="font-serif text-3xl text-[#0F4C45]">{step === "phone" ? "Enter the Maison" : "Verify Your Identity"}</h2>
              <div className="divider-gold mx-auto mt-4"/>
            </div>

            {step === "phone" ? (
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.25em] text-[#6B6B6B]">Your Name (optional)</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="input-luxe" placeholder="Full name" data-testid="auth-name-input"/>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.25em] text-[#6B6B6B]">Phone Number</label>
                  <div className="flex items-center gap-3 border-b border-[#C8C1AF] focus-within:border-[#0F4C45]">
                    <span className="text-[#0F4C45] font-medium">+91</span>
                    <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g,"").slice(0,10))}
                           className="flex-1 bg-transparent outline-none py-3 text-[#1F1F1F] tracking-widest" placeholder="98765 43210"
                           data-testid="auth-phone-input"/>
                  </div>
                </div>
                <button onClick={sendOtp} disabled={loading} className="btn-gold w-full" data-testid="send-otp-btn">
                  {loading ? "Sending…" : "Send OTP"}
                </button>
                <p className="text-[11px] text-[#6B6B6B] text-center tracking-wide">By continuing you agree to our Terms &amp; Privacy Policy</p>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-sm text-[#4F4F4F] text-center">We sent a 6-digit code to <span className="text-[#0F4C45] font-medium">+91 {phone}</span></p>
                {demoOtp && <div className="text-center text-[11px] text-[#C9A35A] tracking-widest bg-[#C9A35A]/10 py-2 border border-[#C9A35A]/30">DEMO OTP: {demoOtp}</div>}
                <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g,"").slice(0,6))}
                       className="input-luxe text-center text-2xl tracking-[0.5em] font-serif" placeholder="000000"
                       maxLength={6} data-testid="auth-otp-input"/>
                <button onClick={verifyOtp} disabled={loading} className="btn-gold w-full" data-testid="verify-otp-btn">
                  {loading ? "Verifying…" : "Verify & Continue"}
                </button>
                <button onClick={() => setStep("phone")} className="text-xs text-[#6B6B6B] hover:text-[#C9A35A] tracking-widest uppercase w-full text-center" data-testid="change-phone-btn">
                  ← Change phone number
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
