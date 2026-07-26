import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, RotateCcw } from "lucide-react";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";

const IMG_1 = "https://picsum.photos/seed/vinandc-quiz-bold/600/800";
const IMG_2 = "https://picsum.photos/seed/vinandc-quiz-soft/600/800";
const IMG_3 = "https://picsum.photos/seed/vinandc-quiz-warm/600/800";
const IMG_4 = "https://picsum.photos/seed/vinandc-quiz-fresh/600/800";
const IMG_5 = "https://picsum.photos/seed/vinandc-quiz-office/600/800";

const QUESTIONS = [
  { key: "mood", title: "How would you like to feel?", options: [
    { v: "bold", label: "Bold & Magnetic", img: IMG_1 },
    { v: "soft", label: "Soft & Romantic", img: IMG_2 },
    { v: "fresh", label: "Fresh & Alive", img: IMG_4 },
    { v: "warm", label: "Warm & Enveloping", img: IMG_3 },
  ]},
  { key: "occasion", title: "When will you wear it?", options: [
    { v: "daily", label: "Daily Signature", img: IMG_2 },
    { v: "evening", label: "Evening & Nights", img: IMG_3 },
    { v: "date", label: "Intimate Moments", img: IMG_1 },
    { v: "office", label: "Work & Confidence", img: IMG_5 },
  ]},
  { key: "gender", title: "For whom is it intended?", options: [
    { v: "women", label: "For Her", img: IMG_2 },
    { v: "men", label: "For Him", img: IMG_5 },
    { v: "unisex", label: "Beyond Gender", img: IMG_1 },
  ]},
  { key: "notes", title: "Which family calls to you?", multi: true, options: [
    { v: "floral", label: "Floral" },
    { v: "woody", label: "Woody" },
    { v: "oriental", label: "Oriental" },
    { v: "citrus", label: "Citrus" },
    { v: "fresh", label: "Fresh" },
    { v: "musky", label: "Musky" },
  ]},
];

export default function ScentFinder() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ notes: [] });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const q = QUESTIONS[step];

  const submit = async (final) => {
    setLoading(true);
    try {
      const { data } = await api.post("/scent-finder", final);
      setResults(data.recommendations);
    } finally { setLoading(false); }
  };

  const pick = (v) => {
    if (q.multi) {
      setAnswers(a => {
        const notes = a.notes.includes(v) ? a.notes.filter(x => x !== v) : [...a.notes, v];
        return { ...a, notes };
      });
    } else {
      const next = { ...answers, [q.key]: v };
      setAnswers(next);
      if (step < QUESTIONS.length - 1) setStep(step + 1);
      else submit(next);
    }
  };

  const reset = () => { setStep(0); setAnswers({ notes: [] }); setResults(null); };

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-16 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="overline mb-3 flex items-center justify-center gap-2"><Sparkles size={12}/> Signature Ritual</div>
        <h1 className="font-serif text-5xl text-[#0F4C45]">The Scent Finder</h1>
        <p className="text-[#4F4F4F] mt-4 max-w-md mx-auto">Answer four questions. We&apos;ll reveal fragrances made for your inner world.</p>
      </div>

      {!results ? (
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 mb-10 justify-center">
            {QUESTIONS.map((_, i) => (
              <div key={i} className={`h-0.5 w-16 ${i <= step ? "bg-[#C9A35A]" : "bg-[#E7E2D6]"}`}/>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <h2 className="font-serif text-3xl text-[#0F4C45] text-center mb-10" data-testid="quiz-question">{q.title}</h2>
              <div className={`grid ${q.options.length > 3 ? "md:grid-cols-4" : "md:grid-cols-3"} gap-4`}>
                {q.options.map(o => {
                  const active = q.multi ? answers.notes.includes(o.v) : answers[q.key] === o.v;
                  return (
                    <button key={o.v} onClick={() => pick(o.v)}
                      className={`group relative overflow-hidden border-2 transition-all ${active ? "border-[#C9A35A]" : "border-[#E7E2D6] hover:border-[#0F4C45]/40"} aspect-[3/4] bg-white`}
                      data-testid={`quiz-option-${o.v}`}>
                      {o.img ? <img src={o.img} alt="" className="w-full h-full object-cover" crossOrigin="anonymous"/> : <div className="w-full h-full bg-gradient-to-br from-[#F4F1EA] to-[#E7E2D6]"/>}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F4C45]/90 to-transparent"/>
                      <div className="absolute inset-x-0 bottom-0 p-4 text-center">
                        <div className="font-serif text-xl text-[#FAFAF8]">{o.label}</div>
                        {active && <div className="mt-2 text-[10px] tracking-widest text-[#D8B46A]">SELECTED</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
              {q.multi && (
                <div className="flex justify-center mt-8">
                  <button onClick={() => submit(answers)} disabled={loading} className="btn-gold" data-testid="quiz-submit-btn">
                    {loading ? "Composing…" : "Reveal My Fragrances"} <ChevronRight size={14}/>
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <div>
          <div className="text-center mb-10">
            <div className="overline mb-3">Your composition</div>
            <h2 className="font-serif text-4xl text-[#0F4C45]">Fragrances Made for You</h2>
            <button onClick={reset} className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C9A35A] hover:text-[#B88A3C]" data-testid="quiz-retake-btn"><RotateCcw size={12}/> Retake the ritual</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6" data-testid="quiz-results">
            {results.map(p => <ProductCard key={p.id} product={p}/>)}
          </div>
        </div>
      )}
    </div>
  );
}
