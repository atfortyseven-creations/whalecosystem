"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Scan } from "lucide-react";
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
        
        {/* Right Content */}
        <motion.div 
          initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
          className="relative z-10 flex flex-col justify-end lg:items-end flex-1 px-6 sm:px-12 md:px-20 pt-48 pb-20 lg:pb-32 w-full lg:w-1/2 lg:ml-auto min-h-[100dvh] lg:min-h-0 xl:pr-32 lg:text-right"
        >

          <motion.h1 variants={FADE_UP} className="text-[28px] sm:text-[48px] md:text-[64px] xl:text-[72px] font-black tracking-tighter leading-[1.05] text-[#0a0a0a] mb-6 drop-shadow-sm max-w-4xl">
            Track institutional capital <br />
            <span className="text-[#0044CC]">before markets react.</span>
          </motion.h1>

          <motion.p variants={FADE_UP} className="text-[18px] sm:text-[20px] font-medium text-slate-600 leading-relaxed max-w-2xl mb-12">
            Real-time on-chain intelligence — from mempool to execution.
          </motion.p>

          {/* Performance Status — Institutional Readout */}
          <motion.div variants={FADE_UP} className="grid grid-cols-2 lg:flex lg:flex-row items-center justify-end gap-6 lg:gap-2 p-6 sm:p-8 bg-white border border-black/5 rounded-[2rem] mb-10 shadow-sm max-w-2xl w-full">
            {[
              { label: "Network State", val: blockNumber ? `#${blockNumber.toLocaleString()}` : "Operational" },
              { label: "Gas Topology", val: baseFeeGwei ? `${baseFeeGwei} Gwei` : "Nominal" },
              { label: "Entity Density", val: globalStats?.tokens ?? "Verified" },
              { label: "Capital Flow", val: globalStats?.cap ?? "Nominal" }
            ].map((stat, i) => (
              <div key={stat.label} className="flex items-center lg:flex-row-reverse">
                <div className="flex flex-col gap-1 lg:items-end">
                  <span className="font-mono text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-black/20 truncate">{stat.label}</span>
                  <span className="font-mono text-[12px] sm:text-[16px] font-black text-[#0a0a0a] truncate tracking-tight">{stat.val}</span>
                </div>
                {i !== 3 && <div className="hidden lg:block w-px h-8 bg-black/5 mx-2 sm:mx-6" />}
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row gap-4 mb-10 lg:justify-end">
            <Link href="/dashboard" className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#0a0a0a] text-white rounded-xl font-mono text-[11px] sm:text-[12px] font-black uppercase tracking-[0.2em] hover:bg-black/80 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10">
              Enter the Network <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/pricing" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white border border-black/10 text-[#0a0a0a] rounded-xl font-mono text-[11px] sm:text-[12px] font-black uppercase tracking-[0.2em] hover:border-black/30 hover:bg-slate-50 active:scale-[0.98] transition-all">
              View Plans
            </Link>
          </motion.div>
        </motion.div>

        {/* Left 4K Wave */}
        <div className="hidden lg:block absolute left-0 top-0 w-1/2 h-full z-0 overflow-hidden pointer-events-none">
          {/* Hard right-edge mask: cream fades cleanly into the wave */}
          <div className="absolute inset-0 bg-gradient-to-l from-[#FAFAF8] via-[#FAFAF8]/70 to-transparent z-10" style={{ width: '45%', left: '55%' }} />
          <div className="absolute inset-0 bg-gradient-to-l from-[#FAFAF8] to-transparent z-10" style={{ width: '20%', left: '80%' }} />
          <img
            src="/olas-hokusai-4k.png"
            alt="Wave"
            className="absolute inset-0 w-full h-full object-cover object-right"
            style={{ opacity: 0.85, mixBlendMode: 'multiply' }}
          />
        </div>
        {/* Mobile: subtle wave behind content */}
        <div className="lg:hidden absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src="/olas-hokusai-4k.png"
            alt="Wave"
            className="absolute -left-20 top-0 w-full h-full object-cover object-right"
            style={{ opacity: 0.45, mixBlendMode: 'multiply' }}
          />
        </div>
        

      </section>

      {/* ── BENTO BOX: WHY WHALE ALERT NETWORK ──────────────────────────────── */}
      <section className="w-full py-24 md:py-40 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 xl:px-20 space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-6 mb-20">
                <h2 className="text-[40px] sm:text-[56px] font-black tracking-tighter uppercase leading-[0.95] text-[#0a0a0a]">
                    Architectural <span className="text-[#0044CC]">Precision.</span>
                </h2>
                <p className="font-serif text-[18px] text-slate-500 leading-relaxed">
                    Designed for institutional compliance and quantitative research. We eliminate the noise, providing mathematical certainty and actionable intelligence.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Bento Card 1 */}
                <div className="col-span-1 lg:col-span-2 bg-[#FAFAF8] rounded-[2.5rem] border border-black/5 p-10 flex flex-col lg:flex-row items-center gap-10 hover:shadow-xl transition-all duration-500 overflow-hidden group">
                    <div className="w-full lg:w-1/2 space-y-6">
                        <h3 className="text-[28px] font-black uppercase tracking-tight text-[#0a0a0a]">
                            Cryptographic Integrity.
                        </h3>
                        <p className="text-[16px] text-slate-500 leading-relaxed font-serif">
                            The Whale Alert Network operates on a strict zero-knowledge architecture. There are no passwords to compromise. Your operational identity is mathematically verified via elliptic-curve cryptography, ensuring that your institutional portfolio data remains private.
                        </p>
                    </div>
                    <div className="w-full lg:w-1/2 h-full min-h-[300px] flex items-center justify-center bg-[#FAFAF8] rounded-[2rem] border border-black/5 overflow-hidden p-6 relative group-hover:bg-slate-50 transition-colors">
                        <RemoteLottie path="DeeWork About Blockchain.json" className="w-full h-full scale-125" />
                    </div>
                </div>

                {/* Bento Card 2 */}
                <div className="col-span-1 bg-[#FAFAF8] rounded-[2.5rem] border border-black/5 p-10 flex flex-col justify-between hover:shadow-xl transition-all duration-500 group">
                    <div className="w-full h-[200px] flex items-center justify-center bg-[#FAFAF8] rounded-[2rem] border border-black/5 mb-8 overflow-hidden p-4 relative group-hover:bg-slate-50 transition-colors">
                         <RemoteLottie path="Connected world.json" className="scale-125" />
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-[24px] font-black uppercase tracking-tight text-[#0a0a0a]">
                            Entity Resolution.
                        </h3>
                        <p className="text-[15px] text-slate-500 leading-relaxed font-serif">
                            We map complex multi-hop interactions and resolve fragmented on-chain fingerprints into unified institutional entities for absolute regulatory clarity.
                        </p>
                    </div>
                </div>

                {/* Bento Card 3 */}
                <div className="col-span-1 bg-[#FAFAF8] rounded-[2.5rem] border border-black/5 p-10 flex flex-col justify-between hover:shadow-xl transition-all duration-500 group">
                    <div className="space-y-6 mb-8">
                        <h3 className="text-[24px] font-black uppercase tracking-tight text-[#0a0a0a]">
                            Heuristic Engines.
                        </h3>
                        <p className="text-[15px] text-slate-500 leading-relaxed font-serif">
                            Our deterministic algorithms process vast arrays of raw blockchain state, detecting liquidity patterns and massive accumulations with mathematical precision.
                        </p>
                    </div>
                    <div className="w-full h-[200px] flex items-center justify-center bg-[#FAFAF8] dark:bg-[#0A0A0A] rounded-[2rem] border border-black/5 dark:border-white/5 overflow-hidden p-4 relative group-hover:bg-slate-50 transition-colors">
                         <RemoteLottie path="Isometric data analysis.json" className="w-full h-full scale-110" />
                    </div>
                </div>

                {/* Bento Card 4 */}
                <div className="col-span-1 lg:col-span-2 bg-[#FAFAF8] rounded-[2.5rem] border border-black/5 p-10 flex flex-col lg:flex-row items-center gap-10 hover:shadow-xl transition-all duration-500 overflow-hidden group">
                    <div className="w-full lg:w-1/2 h-full min-h-[300px] flex items-center justify-center bg-[#FAFAF8] rounded-[2rem] border border-black/5 overflow-hidden p-6 relative group-hover:bg-slate-50 transition-colors">
                        <div className="absolute inset-0 bg-[#0044CC]/5 pointer-events-none mix-blend-multiply transition-opacity duration-700 group-hover:opacity-50" />
                         <RemoteLottie path="Trade.json" className="w-full h-full scale-125" />
                    </div>
                    <div className="w-full lg:w-1/2 space-y-6">
                        <h3 className="text-[28px] font-black uppercase tracking-tight text-[#0a0a0a]">
                            Heuristic Tracking.
                        </h3>
                        <p className="text-[16px] text-slate-500 leading-relaxed font-serif">
                            Relying on block confirmations is insufficient for institutional operations. Our dedicated node mesh directly interfaces with the global mempool, allowing you to intercept and analyze capital flows milliseconds after they are signed.
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

        {/* Second Screenshot Strip: Protocol Handshake & Execution */}
        <div className="w-full relative py-12 md:py-20 flex justify-center bg-white">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-transparent pointer-events-none" />
          <StackableCarousel className="w-full relative z-10" itemClassName="w-[85vw] md:w-[900px] lg:w-[1100px] hover:scale-[1.01] transition-transform duration-700 cursor-grab active:cursor-grabbing">
            {[
              "/system-shots/Captura de pantalla 2026-05-13 191540.png",
              "/system-shots/Captura de pantalla 2026-05-13 191728.png",
              "/system-shots/Captura de pantalla 2026-05-13 191813.png",
              "/system-shots/Captura de pantalla 2026-05-13 192204.png"
            ].map((src, idx) => (
              <img key={idx} src={src} className="w-full h-auto rounded-2xl md:rounded-[2rem] shadow-2xl border border-black/5 object-cover bg-white" alt={`Protocol view ${idx + 1}`} />
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
