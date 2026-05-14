"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, ChevronDown, Activity, Globe, Shield, Zap, Layers, LineChart, Network } from "lucide-react";
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
            <span className="text-[9px] font-black uppercase tracking-widest text-black/40">Whale Alert Network</span>
          </motion.div>

          <motion.h1 variants={FADE_UP} className="text-[40px] sm:text-[48px] font-black tracking-tighter leading-[1.05] mb-6 text-[#0A0A0A] max-w-xs">
            Institutional identity <br />
            <span className="text-black/30">without compromise.</span>
          </motion.h1>

          <motion.p variants={FADE_UP} className="font-serif text-[18px] text-slate-500 leading-relaxed mb-10 max-w-sm">
            The definitive cryptographic identity and intelligence layer for the sovereign institution. Verify humanity, preserve privacy.
          </motion.p>

          {/* Centralized High-Vis Lottie */}
          <motion.div variants={FADE_UP} className="w-full aspect-square max-w-[300px] mx-auto mb-10">
              <RemoteLottie path="Isometric data analysis.json" className="w-full h-full scale-110" />
          </motion.div>

          <motion.div variants={FADE_UP} className="flex flex-col gap-4 w-full">
            <Link href={hasSession ? "/dashboard" : "/connect"} className="flex items-center justify-center gap-3 w-full h-[56px] bg-[#0A0A0A] text-white rounded-[1rem] font-sans text-[14px] font-black tracking-[0.2em] uppercase active:scale-[0.98] transition-transform">
              {hasSession ? "Enter Terminal" : "Start Verification"} <ArrowRight size={16} />
            </Link>
            <Link href="/pricing" className="flex items-center justify-center gap-3 w-full h-[56px] bg-[#FAFAF8] border border-black/5 text-[#0A0A0A] rounded-[1rem] font-sans text-[14px] font-black tracking-[0.2em] uppercase active:scale-[0.98] transition-transform">
              Architecture
            </Link>
          </motion.div>

        </motion.div>
      </section>

      {/* ── 2. ARCHITECTURE BLOCKS (NESTR STYLE STACKED) ────────────────────── */}
      <section className="px-6 py-20 border-b border-black/5 bg-white space-y-20">
        
        <div className="text-center space-y-4 mb-10">
            <h2 className="text-[36px] font-black tracking-tighter uppercase leading-[0.95] text-[#0A0A0A]">
                System <span className="text-black/20">Design.</span>
            </h2>
            <p className="font-serif text-[16px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                We eliminate noise, providing mathematical certainty through three core pillars.
            </p>
        </div>

        {/* Block 1 */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={FADE_UP} className="flex flex-col gap-8">
            <div className="w-full aspect-square bg-[#FAFAF8] rounded-[2.5rem] border border-black/5 flex items-center justify-center p-8 shadow-sm">
                <RemoteLottie path="Connected world.json" className="scale-125" />
            </div>
            <div className="space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center mb-2">
                    <Globe size={20} className="text-black/40" />
                </div>
                <h3 className="text-[28px] font-black uppercase tracking-tight text-[#0A0A0A] leading-none">Global Ledger.</h3>
                <p className="font-serif text-[16px] text-slate-500 leading-relaxed font-medium">
                    The ledger is public, but retail only sees historical states. Our infrastructure intercepts capital flows directly from network mempools.
                </p>
            </div>
        </motion.div>

        {/* Block 2 */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={FADE_UP} className="flex flex-col gap-8">
            <div className="w-full aspect-square bg-[#FAFAF8] rounded-[2.5rem] border border-black/5 flex items-center justify-center p-8 shadow-sm overflow-hidden">
                <RemoteLottie path="Business Analysis.json" className="w-full h-full object-contain scale-[1.5]" />
            </div>
            <div className="space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center mb-2">
                    <LineChart size={20} className="text-black/40" />
                </div>
                <h3 className="text-[28px] font-black uppercase tracking-tight text-[#0A0A0A] leading-none">Entity Resolution.</h3>
                <p className="font-serif text-[16px] text-slate-500 leading-relaxed font-medium">
                    We resolve complex multi-hop interactions and de-obfuscate mixer outputs, grouping fragmented fingerprints into unified institutional entities.
                </p>
            </div>
        </motion.div>

        {/* Block 3 */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={FADE_UP} className="flex flex-col gap-8">
            <div className="w-full aspect-square bg-[#FAFAF8] rounded-[2.5rem] border border-black/5 flex items-center justify-center p-8 shadow-sm overflow-hidden">
                <RemoteLottie path="Trade.json" className="w-full h-full object-contain scale-[1.3]" />
            </div>
            <div className="space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center mb-2">
                    <Zap size={20} className="text-black/40" />
                </div>
                <h3 className="text-[28px] font-black uppercase tracking-tight text-[#0A0A0A] leading-none">Heuristic Tracking.</h3>
                <p className="font-serif text-[16px] text-slate-500 leading-relaxed font-medium">
                    Our deterministic algorithms process vast arrays of raw blockchain state, detecting massive accumulations milliseconds after they are signed.
                </p>
            </div>
        </motion.div>

      </section>

      {/* ── 3. MANIFESTO (CLEAN TEXT) ─────────────────────────────────────────── */}
      <section className="px-6 py-20 border-b border-black/5 bg-[#FAFAF8]">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}>
          <div className="space-y-6 font-serif text-[17px] text-[#0A0A0A] leading-[1.8] font-medium">
            <p>
              The gap between institutional intelligence and retail execution is structural. HumanID was architected to eliminate this inherent disadvantage through mathematical certainty.
            </p>
            <p>
              The ledger is transparent by design. Every transfer is public, every address is traceable — but only if you have the proprietary infrastructure to read the mempool before block confirmation.
            </p>
            
            <AnimatePresence>
              {noteExpanded && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-6 overflow-hidden">
                  <p className="pt-2">
                    This platform watches exchange wallets and institutional custodians across twelve networks simultaneously. It catches transfers before they impact market volatility.
                  </p>
                  <p>
                    Identity on this platform is completely cryptographic. Your wallet is your login. We use zero-knowledge proofs to ensure your institutional strategies remain entirely private.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={() => setNoteExpanded((v) => !v)} className="flex items-center justify-center gap-3 mt-10 w-full h-[56px] rounded-xl bg-white border border-black/5 font-sans text-[14px] font-black tracking-widest uppercase text-[#0A0A0A] active:bg-slate-50 transition-colors">
            {noteExpanded ? "Collapse" : "Manifesto"}
            <ChevronDown size={18} className={`transition-transform duration-300 ${noteExpanded ? "rotate-180" : ""}`} />
          </button>
        </motion.div>
      </section>

      {/* ── 4. PROTOCOL ACTIVITY ─────────────────────────────────────────────── */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="px-6 mb-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            {!loading && lastUpdated && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FAFAF8] rounded-full border border-black/5 shadow-sm">
                <span className="font-mono text-[9px] font-black text-black/20 uppercase tracking-widest">{updatedLabel}</span>
              </div>
            )}
          </div>
          <h2 className="font-black text-[32px] tracking-tighter uppercase leading-[0.95]">
            Protocol<br /><span className="text-black/20">Activity.</span>
          </h2>
        </div>

        <div className="px-6 flex flex-col gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-[#FAFAF8] border border-black/5 rounded-2xl" />)
          ) : flows && flows.length > 0 ? (
            flows.slice(0, 5).map((f, i) => (
              <motion.div key={f.txid} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: i * 0.05 }} className="flex flex-col p-5 bg-[#FAFAF8] border border-black/5 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[11px] font-black text-[#0A0A0A] uppercase tracking-widest">{f.fromCity} <span className="text-slate-300 mx-1">→</span> {f.toCity}</span>
                    <span className="font-mono text-[9px] font-black text-black/30 uppercase tracking-widest">{f.type}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-mono text-[14px] font-black text-[#0A0A0A] uppercase">{f.btc} BTC</span>
                    <span className="font-mono text-[9px] font-bold text-black/15 uppercase tracking-widest">{f.confirmations}</span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-12 bg-[#FAFAF8] rounded-2xl border border-black/5 flex items-center justify-center">
              <span className="font-mono text-[11px] font-black text-black/10 uppercase tracking-[0.2em]">Awaiting State Update</span>
            </div>
          )}
        </div>
      </section>

      {/* ── Mobile Footer ── */}
      <footer className="bg-[#0a0a0a] text-white px-6 py-12 flex flex-col items-center gap-8">
        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-black">H</div>
        <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/40">Whale Alert Network</span>

        {/* Social */}
        <div className="flex items-center gap-6">
          <a href="https://t.me/humanityledger" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z" fill="none" stroke="currentColor"/>
              <path d="M5.491 11.74 17.094 7.24c.539-.194 1.01.131.835.951l-1.97 9.28c-.147.664-.537.825-1.087.513l-3.004-2.213-1.45 1.394c-.16.16-.295.295-.606.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.08 14.348l-2.951-.924c-.641-.2-.656-.641.136-.951z" fill="white"/>
            </svg>
          </a>
          <a href="https://x.com/whalecosystem" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.26 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="white"/>
            </svg>
          </a>
        </div>

        {/* Regulatory badges */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
          {['GDPR', 'KYC/AML', 'MiCA', 'ISO 27001'].map(b => (
            <span key={b} className="font-mono text-[8px] font-black uppercase tracking-[0.2em] text-white/20">{b}</span>
          ))}
        </div>

        {/* Legal links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {[['Terms', '/terms'], ['Privacy', '/privacy'], ['Docs', '/docs']].map(([l, h]) => (
            <Link key={l} href={h} className="font-mono text-[9px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors">{l}</Link>
          ))}
        </div>

        <span className="font-mono text-[8px] uppercase tracking-widest text-white/10">© 2026 Whale Alert Network</span>
      </footer>

    </div>
  );
}
