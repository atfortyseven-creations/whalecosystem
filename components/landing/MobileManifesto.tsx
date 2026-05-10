"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, ChevronDown, Activity, Globe, Shield, Zap } from "lucide-react";
import { PRICING_TIERS } from "@/lib/config/pricing-tiers";
import { StackableCarousel } from "@/components/ui/StackableCarousel";
import { motion, AnimatePresence } from "framer-motion";

interface Flow {
  txid: string;
  fromCity: string;
  toCity: string;
  btc: string;
  type: string;
  latencyMs: number;
  confirmations: string;
  confirmed: boolean;
}

function useLiveFlows() {
  const [flows, setFlows] = useState<Flow[] | null>(null);
  const [loading, setLoad] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchFlows = useCallback(async () => {
    try {
      const res = await fetch("/api/network/whale-flows");
      const data = await res.json();
      setFlows(data.flows ?? []);
      setLastUpdated(new Date());
    } catch {
      setFlows([]);
    } finally {
      setLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchFlows();
    const start = () => { if (!intervalRef.current) intervalRef.current = setInterval(fetchFlows, 65000); };
    const stop = () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };
    start();
    const onVisibility = () => { document.hidden ? stop() : (fetchFlows(), start()); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => { stop(); document.removeEventListener("visibilitychange", onVisibility); };
  }, [fetchFlows]);

  return { flows, loading, lastUpdated };
}

function useSecondsAgo(date: Date | null): string {
  const [label, setLabel] = useState("just now");
  useEffect(() => {
    if (!date) return;
    const update = () => {
      const secs = Math.floor((Date.now() - date.getTime()) / 1000);
      if (secs < 5) setLabel("just now");
      else if (secs < 60) setLabel(`${secs}s ago`);
      else setLabel(`${Math.floor(secs / 60)}m ago`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [date]);
  return label;
}

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export function MobileManifesto() {
  const { flows, loading, lastUpdated } = useLiveFlows();
  const [tick, setTick] = useState(0);
  const updatedLabel = useSecondsAgo(lastUpdated);
  const [noteExpanded, setNoteExpanded] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    setHasSession(document.cookie.includes("sovereign_handshake=") || document.cookie.includes("siwe_session="));
    const t = setInterval(() => setTick((v) => v + 1), 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative bg-[#FAFAF8] text-[#0a0a0a] font-sans antialiased overflow-x-hidden min-h-screen selection:bg-black/10">

      {/* ── 1. HERO ───────────────────────────────────────────────────────────── */}
      <section className="px-6 pb-16 pt-safe border-b border-black/5 bg-white" style={{ paddingTop: "max(6rem, env(safe-area-inset-top, 6rem))" }}>
        <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
          <motion.div variants={FADE_UP} className="flex items-center gap-3 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#0a0a0a] animate-pulse" />
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
              Live Network
            </span>
          </motion.div>

          <motion.h1 variants={FADE_UP} className="text-[48px] sm:text-[56px] font-black tracking-tighter leading-[0.9] uppercase mb-6 text-[#0a0a0a]">
            Whale<br />Alert<br /><span className="text-black/30">Network</span>
          </motion.h1>

          <motion.p variants={FADE_UP} className="font-serif text-[16px] text-slate-500 leading-relaxed mb-10 max-w-sm">
            Institutional capital moves before price does. We read it from the chain — before confirmation, before your terminal shows it.
          </motion.p>

          <motion.div variants={FADE_UP} className="flex flex-col gap-4 w-full">
            <Link href={hasSession ? "/dashboard" : "/connect"} className="flex items-center justify-center gap-3 w-full h-[56px] bg-[#0a0a0a] text-white rounded-[1rem] font-mono text-[12px] font-black uppercase tracking-[0.2em] shadow-xl shadow-black/10 active:scale-[0.98] transition-transform">
              {hasSession ? "Enter Terminal" : "Connect Wallet"} <ArrowRight size={14} />
            </Link>
            <Link href="/pricing" className="flex items-center justify-center gap-3 w-full h-[56px] bg-white border border-black/10 text-[#0a0a0a] rounded-[1rem] font-mono text-[12px] font-black uppercase tracking-[0.2em] active:scale-[0.98] transition-transform">
              View Plans
            </Link>
          </motion.div>

          {/* Trust signals */}
          <motion.div variants={FADE_UP} className="flex flex-wrap items-center gap-3 mt-10 pt-8 border-t border-black/5">
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mr-1">Secured by</span>
            {["Stripe", "Ethereum", "Aztec ZK"].map((label) => (
              <span key={label} className="font-mono text-[9px] font-black uppercase text-slate-500 bg-slate-50 border border-black/5 px-3 py-1.5 rounded-full">
                {label}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── 2. CREATOR'S NOTE ─────────────────────────────────────────────────── */}
      <section className="px-6 py-20 border-b border-black/5 bg-[#FAFAF8]">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 block mb-6">
            Architect's Note
          </span>
          <div className="space-y-5 font-serif text-[16px] text-[#0a0a0a] leading-[1.8] font-medium">
            <p>
              I built this alone. Not at a fund, not at a startup — from my desk, watching whale wallets move nine figures while retail read the news twenty minutes later. That gap is structural.
            </p>
            <p>
              The chain is transparent by design. Every transfer is public, every address is traceable — if you have the infrastructure. I spent two years building that infrastructure.
            </p>
            
            <AnimatePresence>
              {noteExpanded && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-5 overflow-hidden">
                  <p className="pt-2">
                    This platform watches known exchange wallets, OTC desks, and institutional custodians across twelve networks. It catches transfers from the mempool — before confirmation, before price impact.
                  </p>
                  <p>
                    Identity on this platform is cryptographic. Your wallet is your login. Forum posts carry your ECDSA signature. Nothing is anonymous, nothing is unaccountable.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={() => setNoteExpanded((v) => !v)} className="flex items-center justify-center gap-2 mt-8 w-full h-[48px] rounded-xl bg-white border border-black/5 font-mono text-[11px] font-black uppercase tracking-[0.2em] text-[#0a0a0a] active:bg-slate-50 transition-colors shadow-sm">
            {noteExpanded ? "Collapse Note" : "Read Full Manifesto"}
            <ChevronDown size={14} className={`transition-transform duration-300 ${noteExpanded ? "rotate-180" : ""}`} />
          </button>
        </motion.div>
      </section>

      {/* ── 3. HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section className="px-6 py-20 border-b border-black/5 bg-white">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 block mb-8">
            Engine Mechanics
          </span>
          <div className="flex flex-col gap-6">
            {[
              { n: "01", icon: Zap, title: "Mempool Capture", body: "GetBlock nodes stream pending transaction logs before any block confirmation. Whale-sized transfers get flagged instantly." },
              { n: "02", icon: Activity, title: "Entity Resolution", body: "Known exchange wallets are matched against a curated registry. Unknown wallets are clustered by behavioural footprint." },
              { n: "03", icon: Globe, title: "Cross-Chain Sync", body: "The intelligence runs seamlessly on Ethereum, Solana, Base and 9 more. One unified interface, zero context switching." },
            ].map((item, i) => (
              <motion.div key={item.n} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.1 } } }} className="p-8 rounded-3xl bg-[#FAFAF8] border border-black/5">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-black/5 flex items-center justify-center shadow-sm">
                    <item.icon size={20} className="text-[#0a0a0a]" />
                  </div>
                  <span className="font-mono text-[24px] font-black text-black/10">{item.n}</span>
                </div>
                <h3 className="font-mono text-[14px] font-black uppercase tracking-[0.15em] mb-3 text-[#0a0a0a]">{item.title}</h3>
                <p className="font-serif text-[15px] text-slate-500 leading-relaxed font-medium">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── 4. LIVE FLOWS ─────────────────────────────────────────────────────── */}
      <section className="py-20 border-b border-black/5 bg-[#FAFAF8] overflow-hidden">
        <div className="px-6 mb-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Network Telemetry</span>
            {!loading && lastUpdated && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-black/5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0a0a0a] animate-pulse" />
                <span className="font-mono text-[9px] font-black text-slate-500 uppercase tracking-widest">{updatedLabel}</span>
              </div>
            )}
          </div>
          <h2 className="font-black text-[32px] tracking-tighter uppercase leading-[0.95]">
            Live Capital<br /><span className="text-black/20">Flows.</span>
          </h2>
        </div>

        <div className="px-6 flex flex-col gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-white border border-black/5 rounded-2xl animate-pulse" />)
          ) : flows && flows.length > 0 ? (
            flows.slice(0, 5).map((f, i) => (
              <motion.div key={f.txid} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: i * 0.05 }} className="flex flex-col p-5 bg-white border border-black/5 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[11px] font-black text-[#0a0a0a] uppercase tracking-widest">{f.fromCity} <span className="text-slate-300 mx-1">→</span> {f.toCity}</span>
                    <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest">{f.type}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-mono text-[14px] font-black text-[#0a0a0a]">{f.btc} BTC</span>
                    <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest">{f.confirmations}</span>
                  </div>
                </div>
                <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
                  <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="h-full bg-black/10" />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-12 bg-white rounded-2xl border border-black/5 flex items-center justify-center">
              <span className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Awaiting On-Chain Data</span>
            </div>
          )}
        </div>
      </section>

      {/* ── 5. PLANS ──────────────────────────────────────────────────────────── */}
      <section className="py-20 border-b border-black/5 bg-white">
        <div className="px-6 mb-12">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 block mb-4">Access Tiers</span>
          <h2 className="font-black text-[32px] tracking-tighter uppercase leading-[0.95]">
            The Right Tier.<br /><span className="text-black/20">For every firm.</span>
          </h2>
        </div>

        <div className="px-6 flex flex-col gap-6">
          {PRICING_TIERS.filter((t) => ["STARTER", "PRO"].includes(t.id)).map((tier) => (
            <Link key={tier.id} href="/pricing" className={`group relative flex flex-col p-8 rounded-3xl transition-transform active:scale-[0.98] border ${tier.highlight ? "bg-[#0a0a0a] text-white border-black shadow-2xl" : "bg-[#FAFAF8] border-black/5"}`}>
              {tier.highlight && (
                <div className="absolute -top-3 right-6 px-4 py-1.5 bg-white text-[#0a0a0a] rounded-full font-mono text-[9px] font-black uppercase tracking-widest shadow-lg">
                  {tier.badge || "Most Popular"}
                </div>
              )}
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-50">{tier.id}</span>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-black text-[48px] tracking-tighter leading-none">€{tier.priceMonthly}</span>
              </div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-40 mb-8 block">EUR / month</span>
              <p className="font-serif text-[15px] opacity-70 leading-relaxed font-medium mb-8">{tier.tagline}</p>
              
              <div className="flex flex-col gap-3">
                {tier.features.slice(0, 3).map((f) => (
                  <div key={f.text} className="flex items-start gap-3">
                    <CheckCircle size={16} className={`mt-0.5 shrink-0 ${tier.highlight ? "text-white" : "text-[#0a0a0a]"}`} />
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wide opacity-80">{f.text}</span>
                  </div>
                ))}
              </div>
            </Link>
          ))}
          <Link href="/pricing" className="flex items-center justify-center gap-3 w-full h-[56px] mt-4 bg-slate-50 border border-black/5 text-[#0a0a0a] rounded-xl font-mono text-[11px] font-black uppercase tracking-[0.2em] active:bg-slate-100 transition-colors">
            View All Pricing Details <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── 5.5 529-AXIOM SYSTEM (MOBILE) ───────────────────────────────────── */}
      <section className="bg-[#0a0a0a] text-white">
        <div className="px-6 py-20">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 block mb-6">System Architecture</span>
          <h2 className="font-black text-[32px] tracking-tighter uppercase leading-[0.95] mb-6">
            529 Axioms.<br /><span className="text-white/30">Zero gaps.</span>
          </h2>
          <p className="font-serif text-[16px] text-white/50 leading-relaxed mb-12">
            29 original axioms + 500 extended elements. Every edge case covered. Production-ready institutional grade infrastructure.
          </p>

          <div className="flex flex-col gap-4">
            {[
              { range: "01–50", label: "TitaniumGate Auth", desc: "X25519 · EdDSA JWT · Redis zero-race · ZK 2FA" },
              { range: "51–100", label: "Intelligence Engine", desc: "Mempool capture · 7-hop Neo4j · MEV detection" },
              { range: "151–229", label: "Billing & Compliance", desc: "Atomic upgrade · SEPA · KYC ZK-proof" },
              { range: "350–449", label: "Analytics & Growth", desc: "Churn prediction · LTV · K-factor mapping" },
            ].map((p, i) => (
              <motion.div key={p.range} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0, transition: { delay: i * 0.1 } } }} className="bg-[#141414] p-6 rounded-2xl border border-white/5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  <span className="font-mono text-[11px] font-black uppercase tracking-[0.15em] text-white">{p.label}</span>
                </div>
                <p className="font-serif text-[13px] text-white/40 leading-relaxed pl-4 border-l border-white/5 ml-[3px]">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. CLOSING CTA ────────────────────────────────────────────────────── */}
      <section className="px-6 pt-20 pb-safe" style={{ paddingBottom: "max(5rem, env(safe-area-inset-bottom, 5rem))" }}>
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-white border border-black/5 shadow-sm flex items-center justify-center mb-8">
            <Shield size={20} className="text-[#0a0a0a]" />
          </div>
          <h2 className="text-[28px] font-serif text-[#0a0a0a] leading-tight tracking-tight mb-6">
            The chain never lies. <br /><span className="italic font-light text-slate-500">Read it before the market.</span>
          </h2>
          
          <Link href={hasSession ? "/dashboard" : "/connect"} className="flex items-center justify-center gap-3 w-full h-[56px] mt-4 bg-[#0a0a0a] text-white rounded-xl font-mono text-[12px] font-black uppercase tracking-[0.2em] shadow-xl shadow-black/10 active:scale-[0.98] transition-transform">
            {hasSession ? "Enter Terminal" : "Connect Wallet"} <ArrowRight size={14} />
          </Link>
          
          <div className="mt-16 pt-8 border-t border-black/5 w-full">
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-slate-400 block">
              © 2026 atfortyseven-creations
            </span>
          </div>
        </div>
      </section>

    </div>
  );
}
