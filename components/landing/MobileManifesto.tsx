"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, ChevronDown, Activity, Globe, Shield, Zap, Layers, LineChart, Network } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RemoteLottie } from "@/components/ui/RemoteLottie";
import { SovereignFooter } from "@/components/landing/SovereignFooter";

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
  const updatedLabel = useSecondsAgo(lastUpdated);
  const [noteExpanded, setNoteExpanded] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    setHasSession(document.cookie.includes("sovereign_handshake=") || document.cookie.includes("siwe_session="));
  }, []);

  return (
    <div className="relative bg-[#FAFAF8] text-[#0A0A0A] font-sans antialiased overflow-x-hidden min-h-screen selection:bg-black/10">

      {/* ── 1. HERO ───────────────────────────────────────────────────────────── */}
      <section className="px-6 pb-16 pt-safe border-b border-black/5 bg-white relative overflow-hidden" style={{ paddingTop: "max(6rem, env(safe-area-inset-top, 6rem))" }}>
        
        <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="relative z-10">

          <motion.div variants={FADE_UP} className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FAFAF8] border border-slate-200 rounded-full shadow-sm mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0044CC] animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Sovereign Intelligence</span>
          </motion.div>

          <motion.h1 variants={FADE_UP} className="text-[48px] sm:text-[56px] font-black tracking-tighter leading-[0.95] uppercase mb-6 text-[#0A0A0A]">
            Whale<br />Alert<br /><span className="text-[#0044CC]">Network</span>
          </motion.h1>

          <motion.p variants={FADE_UP} className="font-serif text-[18px] text-slate-500 leading-relaxed mb-10 max-w-sm">
            Institutional capital moves before price does. We read it from the chain — before confirmation, before your terminal shows it.
          </motion.p>

          {/* Centralized High-Vis Lottie */}
          <motion.div variants={FADE_UP} className="w-full aspect-square max-w-[300px] mx-auto mb-10">
              <RemoteLottie path="Isometric data analysis.json" className="w-full h-full scale-110" />
          </motion.div>

          <motion.div variants={FADE_UP} className="flex flex-col gap-4 w-full">
            <Link href={hasSession ? "/dashboard" : "/connect"} className="flex items-center justify-center gap-3 w-full h-[56px] bg-[#0044CC] text-white rounded-[1rem] font-sans text-[14px] font-bold tracking-wide shadow-xl shadow-[#0044CC]/20 active:scale-[0.98] transition-transform">
              {hasSession ? "Enter Terminal" : "Start Tracking"} <ArrowRight size={16} />
            </Link>
            <Link href="/pricing" className="flex items-center justify-center gap-3 w-full h-[56px] bg-[#FAFAF8] border border-black/5 text-[#0A0A0A] rounded-[1rem] font-sans text-[14px] font-bold tracking-wide active:scale-[0.98] transition-transform">
              View Architecture
            </Link>
          </motion.div>

        </motion.div>
      </section>

      {/* ── 2. ARCHITECTURE BLOCKS (NESTR STYLE STACKED) ────────────────────── */}
      <section className="px-6 py-20 border-b border-black/5 bg-white space-y-20">
        
        <div className="text-center space-y-4 mb-10">
            <h2 className="text-[36px] font-black tracking-tighter uppercase leading-[0.95] text-[#0A0A0A]">
                How It <span className="text-[#0044CC]">Works.</span>
            </h2>
            <p className="font-serif text-[16px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                We eliminate the noise, providing mathematical certainty and actionable intelligence.
            </p>
        </div>

        {/* Block 1 */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={FADE_UP} className="flex flex-col gap-8">
            <div className="w-full aspect-square bg-[#FAFAF8] rounded-[2.5rem] border border-black/5 flex items-center justify-center p-8 shadow-sm">
                <RemoteLottie path="Connected world.json" className="scale-125" />
            </div>
            <div className="space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-[#0044CC]/10 flex items-center justify-center mb-2">
                    <Globe size={20} className="text-[#0044CC]" />
                </div>
                <h3 className="text-[28px] font-black uppercase tracking-tight text-[#0A0A0A] leading-none">Global Mempool.</h3>
                <p className="font-serif text-[16px] text-slate-500 leading-relaxed font-medium">
                    The blockchain is public, but retail only sees confirmed blocks. Our infrastructure intercepts pending transactions directly from 14 major network mempools, giving you the pre-execution edge.
                </p>
            </div>
        </motion.div>

        {/* Block 2 */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={FADE_UP} className="flex flex-col gap-8">
            <div className="w-full aspect-square bg-[#FAFAF8] rounded-[2.5rem] border border-black/5 flex items-center justify-center p-8 shadow-sm">
                <RemoteLottie path="Business Analysis.json" className="scale-150" />
            </div>
            <div className="space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-[#0044CC]/10 flex items-center justify-center mb-2">
                    <LineChart size={20} className="text-[#0044CC]" />
                </div>
                <h3 className="text-[28px] font-black uppercase tracking-tight text-[#0A0A0A] leading-none">Entity Resolution.</h3>
                <p className="font-serif text-[16px] text-slate-500 leading-relaxed font-medium">
                    Whales hide their tracks. We de-obfuscate mixer outputs and map complex multi-hop interactions, grouping fragmented wallet addresses into unified institutional entities.
                </p>
            </div>
        </motion.div>

        {/* Block 3 */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={FADE_UP} className="flex flex-col gap-8">
            <div className="w-full aspect-square bg-[#FAFAF8] rounded-[2.5rem] border border-black/5 flex items-center justify-center p-8 shadow-sm">
                <RemoteLottie path="Trade.json" className="scale-125" />
            </div>
            <div className="space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-[#0044CC]/10 flex items-center justify-center mb-2">
                    <Zap size={20} className="text-[#0044CC]" />
                </div>
                <h3 className="text-[28px] font-black uppercase tracking-tight text-[#0A0A0A] leading-none">Real-Time Alerts.</h3>
                <p className="font-serif text-[16px] text-slate-500 leading-relaxed font-medium">
                    Our heuristic algorithms process 12TB of raw blockchain state daily, pushing actionable alerts about massive accumulations and liquidity injections directly to your dashboard.
                </p>
            </div>
        </motion.div>

      </section>

      {/* ── 3. MANIFESTO (CLEAN TEXT) ─────────────────────────────────────────── */}
      <section className="px-6 py-20 border-b border-black/5 bg-[#FAFAF8]">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}>
          <div className="space-y-6 font-serif text-[17px] text-[#0A0A0A] leading-[1.8] font-medium">
            <p>
              The gap between institutional intelligence and retail execution is structural. I built this platform because watching whale wallets move nine figures while waiting for delayed news feeds is an inherent disadvantage.
            </p>
            <p>
              The ledger is completely transparent by design. Every transfer is public, every address is traceable — but only if you have the proprietary infrastructure to read the mempool before block confirmation. We spent two years building that exact infrastructure.
            </p>
            
            <AnimatePresence>
              {noteExpanded && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-6 overflow-hidden">
                  <p className="pt-2">
                    This platform watches known exchange wallets, OTC desks, and institutional custodians across twelve networks simultaneously. It catches transfers before they impact market volatility.
                  </p>
                  <p>
                    Identity on this platform is completely cryptographic. Your wallet is your login. We use zero-knowledge proofs to ensure your institutional strategies remain entirely private.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={() => setNoteExpanded((v) => !v)} className="flex items-center justify-center gap-3 mt-10 w-full h-[56px] rounded-xl bg-white border border-black/5 font-sans text-[14px] font-bold tracking-wide text-[#0A0A0A] active:bg-slate-50 transition-colors shadow-sm">
            {noteExpanded ? "Collapse Manifesto" : "Read Full Manifesto"}
            <ChevronDown size={18} className={`transition-transform duration-300 ${noteExpanded ? "rotate-180" : ""}`} />
          </button>
        </motion.div>
      </section>

      {/* ── 4. LIVE FLOWS ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="px-6 mb-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            {!loading && lastUpdated && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FAFAF8] rounded-full border border-black/5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0044CC] animate-pulse" />
                <span className="font-mono text-[9px] font-bold text-slate-500 uppercase tracking-widest">{updatedLabel}</span>
              </div>
            )}
          </div>
          <h2 className="font-black text-[32px] tracking-tighter uppercase leading-[0.95]">
            Live Capital<br /><span className="text-[#0044CC]">Flows.</span>
          </h2>
        </div>

        <div className="px-6 flex flex-col gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-[#FAFAF8] border border-black/5 rounded-2xl animate-pulse" />)
          ) : flows && flows.length > 0 ? (
            flows.slice(0, 5).map((f, i) => (
              <motion.div key={f.txid} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: i * 0.05 }} className="flex flex-col p-5 bg-[#FAFAF8] border border-black/5 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[11px] font-black text-[#0A0A0A] uppercase tracking-widest">{f.fromCity} <span className="text-slate-300 mx-1">→</span> {f.toCity}</span>
                    <span className="font-mono text-[9px] font-bold text-[#0044CC] uppercase tracking-widest">{f.type}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-mono text-[14px] font-black text-[#0A0A0A]">{f.btc} BTC</span>
                    <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest">{f.confirmations}</span>
                  </div>
                </div>
                <div className="w-full h-1 bg-white rounded-full overflow-hidden">
                  <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="h-full bg-[#0044CC]/20" />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-12 bg-[#FAFAF8] rounded-2xl border border-black/5 flex items-center justify-center">
              <span className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Awaiting On-Chain Data</span>
            </div>
          )}
        </div>
      </section>

      <SovereignFooter />

    </div>
  );
}
