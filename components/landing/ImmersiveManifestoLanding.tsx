"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Scan, Shield, Zap, Globe2, Layers, LineChart, Network } from "lucide-react";
import { useEthMetrics } from "@/hooks/useEthMetrics";
import { StackableCarousel } from "@/components/ui/StackableCarousel";
import { motion } from "framer-motion";
import { RemoteLottie } from "@/components/ui/RemoteLottie";
import { SovereignFooter } from "@/components/landing/SovereignFooter";

// ─── Constants ──────────────────────────────────────────────────────────────

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
        
        {/* Left Content */}
        <motion.div 
          initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
          className="relative z-10 flex flex-col justify-center flex-1 px-6 sm:px-12 md:px-20 pt-32 pb-24 lg:py-0 w-full lg:w-1/2 min-h-[100dvh] lg:min-h-0 xl:pl-32"
        >

          <motion.h1 variants={FADE_UP} className="text-[48px] sm:text-[64px] md:text-[80px] xl:text-[96px] font-black tracking-tighter leading-[0.9] uppercase text-[#0a0a0a] mb-8 drop-shadow-sm">
            Whale<br />Alert<br /><span className="text-[#0044CC]">Network</span>
          </motion.h1>

          <motion.p variants={FADE_UP} className="font-serif text-[16px] sm:text-[18px] text-slate-600 leading-relaxed max-w-lg mb-12">
            Track institutional capital before markets react. Real-time on-chain intelligence — from mempool to execution.
          </motion.p>

          {/* Live Stats Glassmorphism Bar */}
          <motion.div variants={FADE_UP} className="flex flex-wrap items-center gap-x-8 gap-y-6 p-6 md:p-8 bg-white/80 backdrop-blur-2xl border border-black/5 rounded-3xl mb-10 shadow-xl shadow-black/5 max-w-2xl">
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

        {/* Right Lottie Presentation (Replaces Globe) */}
        <div className="absolute inset-0 w-full h-[100dvh] opacity-20 pointer-events-none lg:relative lg:w-1/2 lg:h-screen lg:opacity-100 lg:pointer-events-auto z-0 flex items-center justify-center overflow-hidden mix-blend-multiply">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAFAF8] via-transparent to-transparent z-10 hidden lg:block" />
          <div className="w-full h-full max-w-[800px] max-h-[800px] flex items-center justify-center translate-x-[5%]">
             <RemoteLottie path="Abstract Isometric Loader #1.json" className="w-[150%] h-[150%] object-contain scale-[1.3] opacity-90 drop-shadow-2xl" />
          </div>
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

      {/* ── BENTO BOX: WHY WHALE ALERT NETWORK ──────────────────────────────── */}
      <section className="w-full py-24 md:py-40 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 xl:px-20 space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-6 mb-20">
                <h2 className="text-[40px] sm:text-[56px] font-black tracking-tighter uppercase leading-[0.95] text-[#0a0a0a]">
                    Architectural <span className="text-[#0044CC]">Precision.</span>
                </h2>
                <p className="font-serif text-[18px] text-slate-500 leading-relaxed">
                    Designed for institutional quantitative teams. We eliminate the noise, providing mathematical certainty and actionable intelligence through three core pillars.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Bento Card 1 */}
                <div className="col-span-1 lg:col-span-2 bg-[#FAFAF8] rounded-[2.5rem] border border-black/5 p-10 flex flex-col lg:flex-row items-center gap-10 hover:shadow-xl transition-all duration-500 overflow-hidden group">
                    <div className="w-full lg:w-1/2 space-y-6">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-black/5 flex items-center justify-center">
                            <Layers size={20} className="text-[#0a0a0a]" />
                        </div>
                        <h3 className="text-[28px] font-black uppercase tracking-tight text-[#0a0a0a]">
                            Cryptographic Integrity.
                        </h3>
                        <p className="text-[16px] text-slate-500 leading-relaxed font-serif">
                            The Sovereign Protocol operates on a strict zero-knowledge architecture. There are no passwords to compromise. Your operational identity is mathematically verified via elliptic-curve cryptography, ensuring that your institutional portfolio data cannot be intercepted or exposed.
                        </p>
                    </div>
                    <div className="w-full lg:w-1/2 h-full min-h-[300px] flex items-center justify-center bg-[#FAFAF8] dark:bg-[#0A0A0A] rounded-[2rem] border border-black/5 dark:border-white/5 overflow-hidden p-8">
                        <RemoteLottie path="isometric-cube.json" className="w-[150%] h-[150%] object-contain scale-[1.3] transition-transform duration-700 group-hover:scale-[1.4]" />
                    </div>
                </div>

                {/* Bento Card 2 */}
                <div className="col-span-1 bg-[#FAFAF8] rounded-[2.5rem] border border-black/5 p-10 flex flex-col justify-between hover:shadow-xl transition-all duration-500 group">
                    <div className="w-full h-[200px] flex items-center justify-center bg-[#FAFAF8] dark:bg-[#0A0A0A] rounded-[2rem] border border-black/5 dark:border-white/5 mb-8 overflow-hidden p-6">
                        <RemoteLottie path="social.json" className="w-full h-full object-contain scale-[1.6] transition-transform duration-700 group-hover:scale-[1.8]" />
                    </div>
                    <div className="space-y-6">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-black/5 flex items-center justify-center">
                            <LineChart size={20} className="text-[#0a0a0a]" />
                        </div>
                        <h3 className="text-[24px] font-black uppercase tracking-tight text-[#0a0a0a]">
                            Entity Resolution.
                        </h3>
                        <p className="text-[15px] text-slate-500 leading-relaxed font-serif">
                            We map complex multi-hop interactions and de-obfuscate mixer outputs in real-time, grouping fragmented wallets into unified institutional entities for absolute clarity.
                        </p>
                    </div>
                </div>

                {/* Bento Card 3 */}
                <div className="col-span-1 bg-[#FAFAF8] rounded-[2.5rem] border border-black/5 p-10 flex flex-col justify-between hover:shadow-xl transition-all duration-500 group">
                    <div className="space-y-6 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-black/5 flex items-center justify-center">
                            <Network size={20} className="text-[#0a0a0a]" />
                        </div>
                        <h3 className="text-[24px] font-black uppercase tracking-tight text-[#0a0a0a]">
                            Quantitative AI Models.
                        </h3>
                        <p className="text-[15px] text-slate-500 leading-relaxed font-serif">
                            Our heuristic algorithms process 12TB of raw blockchain state daily, detecting liquidity injections and massive accumulations prior to market impact.
                        </p>
                    </div>
                    <div className="w-full h-[200px] flex items-center justify-center bg-[#FAFAF8] dark:bg-[#0A0A0A] rounded-[2rem] border border-black/5 dark:border-white/5 overflow-hidden p-6">
                        <RemoteLottie path="DeeWork About Blockchain.json" className="w-full h-full object-contain scale-[1.4] transition-transform duration-700 group-hover:scale-[1.5]" />
                    </div>
                </div>

                {/* Bento Card 4 */}
                <div className="col-span-1 lg:col-span-2 bg-[#FAFAF8] rounded-[2.5rem] border border-black/5 p-10 flex flex-col lg:flex-row items-center gap-10 hover:shadow-xl transition-all duration-500 overflow-hidden group">
                    <div className="w-full lg:w-1/2 h-full min-h-[300px] flex items-center justify-center bg-[#FAFAF8] dark:bg-[#0A0A0A] rounded-[2rem] border border-black/5 dark:border-white/5 overflow-hidden p-8 relative">
                        <div className="absolute inset-0 bg-[#0044CC]/5 pointer-events-none mix-blend-multiply" />
                        <RemoteLottie path="Abstract Isometric Loader #1.json" className="w-[150%] h-[150%] object-contain scale-[1.5] transition-transform duration-700 group-hover:scale-[1.6]" />
                    </div>
                    <div className="w-full lg:w-1/2 space-y-6">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-black/5 flex items-center justify-center">
                            <Zap size={20} className="text-[#0a0a0a]" />
                        </div>
                        <h3 className="text-[28px] font-black uppercase tracking-tight text-[#0a0a0a]">
                            Pre-Execution Tracking.
                        </h3>
                        <p className="text-[16px] text-slate-500 leading-relaxed font-serif">
                            Relying on block confirmations means you are already too late. Our dedicated node mesh directly interfaces with the global mempool, allowing you to intercept and analyze institutional orders milliseconds after they are signed, giving you the ultimate execution edge.
                        </p>
                    </div>
                </div>

            </div>
        </div>
      </section>

      {/* ── SHOWCASE ────────────────────────────────────────────────────────── */}
      <section className="w-full py-24 md:py-40 bg-[#FAFAF8] overflow-hidden relative border-t border-black/5">
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

      {/* ── CLOSING ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-32 md:py-48 bg-white border-t border-black/5">
        <div className="max-w-[850px] mx-auto px-6 text-center flex flex-col items-center">
          <h2 className="text-[36px] md:text-[56px] font-serif text-[#0a0a0a] leading-tight tracking-tight mb-8">
            In the pursuit of <br /><span className="italic font-light text-slate-500">absolute transparency</span>.
          </h2>
          <p className="font-serif text-[15px] md:text-[18px] text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Foundational document on pure mathematical abstraction, zero-knowledge cryptographic mechanisms,
            and deterministic heuristic paradigms that cement the immutable global infrastructure.
          </p>
        </div>
      </section>
      
    </div>
  );
}
