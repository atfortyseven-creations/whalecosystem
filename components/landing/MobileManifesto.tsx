"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, ChevronDown, Activity, Globe, Shield, Zap } from "lucide-react";
import { PRICING_TIERS } from "@/lib/config/pricing-tiers";
import { StackableCarousel } from "@/components/ui/StackableCarousel";
import { motion, AnimatePresence } from "framer-motion";
import { RemoteLottie } from "@/components/ui/RemoteLottie";

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

const FADE_UP: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as any } }
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
      <section className="px-6 pb-16 pt-safe border-b border-black/5 bg-white relative overflow-hidden" style={{ paddingTop: "max(6rem, env(safe-area-inset-top, 6rem))" }}>
        {/* Mobile Hero Lottie */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] opacity-[0.04] pointer-events-none">
            <RemoteLottie path="Earth globe rotating with Seamless loop animation.json" />
        </div>

        <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="relative z-10">

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
          <div className="flex flex-col gap-6">
            <div className="relative w-full aspect-video bg-[#FAFAF8] rounded-3xl border border-black/5 overflow-hidden flex items-center justify-center p-8 mb-4">
                <RemoteLottie path="Trade.json" className="scale-125" />
            </div>
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

      {/* ── 6. CLOSING CTA ────────────────────────────────────────────────────── */}
      <section className="px-6 pt-20 pb-safe" style={{ paddingBottom: "max(5rem, env(safe-area-inset-bottom, 5rem))" }}>
        <div className="flex flex-col items-center text-center">
          <div className="w-48 h-48 mb-8 opacity-20">
            <RemoteLottie path="Crypto coins.json" />
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
