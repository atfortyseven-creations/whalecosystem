"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { SovereignGlobe3D } from "./SovereignGlobe3D";
import Link from "next/link";
import { ArrowRight, Scan, MessageSquare, ChevronRight, Shield, Zap, Globe2, Layers, Cpu, Code2, Network } from "lucide-react";
import { useEthMetrics } from "@/hooks/useEthMetrics";
import { PRICING_TIERS } from "@/lib/config/pricing-tiers";
import { StackableCarousel } from "@/components/ui/StackableCarousel";
import { motion, AnimatePresence } from "framer-motion";
import { RemoteLottie } from "@/components/ui/RemoteLottie";

// ─── Constants ──────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: Zap, title: "Mempool Intelligence", desc: "Intercept institutional capital before block confirmation. Sub-second detection across 12 chains." },
  { icon: Shield, title: "Cryptographic Identity", desc: "Zero passwords. Your wallet is your key. Every session is mathematically verifiable via ECDSA." },
  { icon: Globe2, title: "On-Chain Forensics", desc: "De-obfuscate mixer outputs, trace multi-hop routes, and map entity clusters in real time." },
];

const ARCHITECTURE = [
  { id: "SYS-1", label: "Performance", desc: "Optimized response times and seamless data synchronization.", color: "#00C076", icon: Zap },
  { id: "SYS-2", label: "Authentication", desc: "Secure, frictionless access with advanced identity verification.", color: "#00C076", icon: Shield },
  { id: "SYS-3", label: "Data Engine", desc: "Real-time processing and intelligent information structuring.", color: "#1a1a1a", icon: Layers },
  { id: "SYS-4", label: "Community", desc: "Interactive tools designed for engagement and clear communication.", color: "#1a1a1a", icon: MessageSquare },
  { id: "SYS-5", label: "Operations", desc: "Automated billing and seamless regulatory compliance features.", color: "#555", icon: Cpu },
  { id: "SYS-6", label: "Infrastructure", desc: "High availability and robust server management protocols.", color: "#555", icon: Network },
  { id: "SYS-7", label: "Analytics", desc: "Clear metrics and predictive modeling for business growth.", color: "#888", icon: Code2 },
  { id: "SYS-8", label: "Security", desc: "Comprehensive protection layers safeguarding all user data.", color: "#888", icon: Shield },
];

const FADE_UP: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

// ─── Component ──────────────────────────────────────────────────────────────

export function ImmersiveManifestoLanding({ onOpenScanner, hideMap = false }: { onOpenScanner?: () => void; hideMap?: boolean; }) {
  const { blockNumber, baseFeeGwei, syncing } = useEthMetrics();
  const [globalStats, setGlobalStats] = useState<{ tokens: string; cap: string } | null>(null);

  useEffect(() => {
    fetch("/api/market/global").then((r) => r.json()).then((data) => {
      if (data?.data) setGlobalStats({ tokens: data.data.active_cryptocurrencies.toLocaleString(), cap: "$" + (data.data.total_market_cap.usd / 1e12).toFixed(2) + "T" });
    }).catch(() => {});
  }, []);

  return (
    <div className="relative bg-[#FAFAF8] text-[#0a0a0a] font-sans antialiased overflow-x-hidden selection:bg-black/10">

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[100dvh] flex flex-col lg:flex-row items-center justify-between border-b border-black/5 overflow-hidden">
        
        {/* Large Lottie Background Overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
            <div className="w-[120%] max-w-[1600px] aspect-square">
                <RemoteLottie path="Connected world.json" />
            </div>
        </div>

        {/* Left Content */}
        <motion.div 
          initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
          className="relative z-10 flex flex-col justify-center flex-1 px-6 sm:px-12 md:px-20 pt-32 pb-24 lg:py-0 w-full lg:w-1/2 min-h-[100dvh] lg:min-h-0 xl:pl-32"
        >

          <motion.h1 variants={FADE_UP} className="text-[48px] sm:text-[64px] md:text-[80px] xl:text-[96px] font-black tracking-tighter leading-[0.9] uppercase text-[#0a0a0a] mb-8 drop-shadow-sm">
            Whale<br />Alert<br /><span className="text-black/30">Network</span>
          </motion.h1>

          <motion.p variants={FADE_UP} className="font-serif text-[16px] sm:text-[18px] text-slate-600 leading-relaxed max-w-lg mb-12">
            Track institutional capital before markets react. Real-time on-chain intelligence — from mempool to execution.
          </motion.p>

          {/* Live Stats Glassmorphism Bar */}
          <motion.div variants={FADE_UP} className="flex flex-wrap items-center gap-x-8 gap-y-6 p-6 md:p-8 bg-white/60 backdrop-blur-2xl border border-black/5 rounded-3xl mb-10 shadow-xl shadow-black/5 max-w-2xl">
            {[
              { label: "ETH Block", val: syncing ? "Syncing..." : blockNumber ?? "---" },
              { label: "Base Fee", val: baseFeeGwei ? `${baseFeeGwei} Gwei` : "---" },
              { label: "Active Tokens", val: globalStats?.tokens ?? "---" },
              { label: "Total Cap", val: globalStats?.cap ?? "---" }
            ].map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-8">
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{stat.label}</span>
                  <span className="font-mono text-[14px] sm:text-[16px] font-black text-[#0a0a0a]">{stat.val}</span>
                </div>
                {i !== 3 && <div className="w-px h-10 bg-black/10 hidden sm:block" />}
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row gap-4 mb-10">
            <Link href="/dashboard" className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#0a0a0a] text-white rounded-xl font-mono text-[11px] sm:text-[12px] font-black uppercase tracking-[0.2em] hover:bg-black/80 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10">
              Enter the Network <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/pricing" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white border border-black/10 text-[#0a0a0a] rounded-xl font-mono text-[11px] sm:text-[12px] font-black uppercase tracking-[0.2em] hover:border-black/30 hover:bg-slate-50 active:scale-[0.98] transition-all">
              View Plans
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Globe */}
        <div className="absolute inset-0 w-full h-[100dvh] opacity-30 pointer-events-none lg:relative lg:w-1/2 lg:h-screen lg:opacity-100 lg:pointer-events-auto z-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAFAF8] via-transparent to-transparent z-10 hidden lg:block" />
          {!hideMap && <SovereignGlobe3D />}
        </div>
        
        {/* Mobile Scanner Button */}
        {onOpenScanner && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[200] bg-white/80 backdrop-blur-xl border-t border-black/10 flex justify-center py-4 px-6" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
            <button onClick={onOpenScanner} className="w-full max-w-sm px-8 py-4 bg-[#0a0a0a] text-white rounded-xl font-mono text-[11px] font-black uppercase tracking-[0.2em] active:scale-95 transition-transform flex items-center justify-center gap-3 shadow-2xl">
              <Scan size={16} /> Connect Wallet
            </button>
          </div>
        )}
      </section>

      {/* ── SHOWCASE ────────────────────────────────────────────────────────── */}
      <section className="w-full py-24 md:py-40 bg-white overflow-hidden relative">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 xl:px-20 mb-16 md:mb-24">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={FADE_UP} className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
            <div className="relative">
              <h2 className="text-[40px] sm:text-[56px] md:text-[72px] font-black tracking-tighter uppercase leading-[0.95]">
                Clean design.<br /><span className="text-black/20">Expert execution.</span>
              </h2>
            </div>
            <p className="font-serif text-[16px] sm:text-[18px] text-slate-500 max-w-lg leading-relaxed">
              A comprehensive and intuitive dashboard designed to provide a clear overview of the platform, combining powerful forensic tools with an elegant, institutional aesthetic.
            </p>
          </motion.div>
        </div>
        
        <div className="w-full relative py-12 md:py-20 flex justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-[#FAFAF8] to-white opacity-50" />
          <StackableCarousel className="w-full relative z-10" itemClassName="w-[85vw] md:w-[900px] lg:w-[1100px] hover:scale-[1.01] transition-transform duration-700 cursor-grab active:cursor-grabbing">
            {[
              "/system-shots/Captura de pantalla 2026-05-07 012904.png",
              "/system-shots/Captura de pantalla 2026-05-07 032204.png",
              "/system-shots/Captura de pantalla 2026-05-10 002811.png",
              "/system-shots/Captura de pantalla 2026-05-10 002900.png"
            ].map((src, idx) => (
              <img key={idx} src={src} className="w-full h-auto rounded-2xl md:rounded-[2rem] shadow-2xl border border-black/5 object-cover bg-white" alt={`Terminal view ${idx + 1}`} />
            ))}
          </StackableCarousel>
        </div>
      </section>

      {/* ── MATHEMATICAL CERTAINTY ── */}
      <section className="py-40 bg-[#FAFAF8] relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 xl:px-20 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-10 relative z-10">
                <h2 className="text-[48px] md:text-[86px] font-black text-[#0a0a0a] leading-[0.85] tracking-tighter uppercase">
                    Mathematical <br /> <span className="text-slate-300">Certainty</span>.
                </h2>
                <p className="font-serif text-[18px] md:text-[22px] text-slate-500 max-w-md leading-relaxed">
                    We eliminate the heuristic gap. Our systems identify the structural shifts in the global ledger before they manifest as price action.
                </p>
                <div className="flex flex-col gap-6 pt-4">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-px bg-black opacity-10" />
                        <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">System Core v3.0</span>
                    </div>
                </div>
            </div>

            <div className="relative aspect-square w-full max-w-[700px] mx-auto flex items-center justify-center">
                <div className="absolute inset-0 bg-slate-200/20 blur-[120px] rounded-full" />
                <RemoteLottie path="Abstract Isometric Loader #1.json" className="relative z-10 scale-150" />
            </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────────── */}
      <section className="w-full py-20 md:py-32 bg-white border-y border-black/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 xl:px-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.8, ease: "easeOut" as any } } }} className="group bg-slate-50/50 p-10 md:p-12 rounded-3xl border border-black/5 hover:border-black/15 hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 flex flex-col gap-8">
                <div className="w-14 h-14 rounded-2xl bg-white border border-black/5 flex items-center justify-center group-hover:bg-[#0a0a0a] transition-colors duration-500 shadow-sm">
                  <f.icon size={24} strokeWidth={1.5} className="text-[#0a0a0a] group-hover:text-white transition-colors duration-500" />
                </div>
                <div>
                  <h3 className="font-mono text-[13px] md:text-[14px] font-black uppercase tracking-[0.15em] mb-4 text-[#0a0a0a]">{f.title}</h3>
                  <p className="font-serif text-[15px] md:text-[16px] text-slate-500 leading-relaxed font-medium">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-32 md:py-48 bg-[#FAFAF8]">
        <div className="max-w-[850px] mx-auto px-6 text-center flex flex-col items-center">
          <div className="w-64 h-64 mb-12 opacity-10">
             <RemoteLottie path="Connected world.json" />
          </div>
          <h2 className="text-[36px] md:text-[56px] font-serif text-[#0a0a0a] leading-tight tracking-tight mb-8">
            In the pursuit of <br /><span className="italic font-light text-slate-500">absolute transparency</span>.
          </h2>
          <div className="flex justify-center mb-10">
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 bg-white px-6 py-3 rounded-full border border-black/5 shadow-sm">
              © 2026 atfortyseven-creations
            </span>
          </div>
          <p className="font-serif text-[15px] md:text-[18px] text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Foundational document on pure mathematical abstraction, zero-knowledge cryptographic mechanisms,
            and deterministic heuristic paradigms that cement the immutable global infrastructure.
          </p>
        </div>
      </section>
    </div>
  );
}
