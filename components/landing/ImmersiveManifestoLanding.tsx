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
    <div className="relative bg-transparent text-[#0a0a0a] font-sans antialiased overflow-x-hidden selection:bg-black/10">



      {/* ── BENTO BOX: WHY WHALE ALERT NETWORK ──────────────────────────────── */}
      <section className="w-full py-24 md:py-40 bg-transparent relative z-10 flex justify-center">
        <div className="w-full max-w-[2560px] mx-auto px-6 md:px-12 xl:px-20 space-y-16">
            <div className="text-left max-w-3xl space-y-6 mb-20">
                <h2 className="text-[40px] sm:text-[56px] font-black tracking-tighter uppercase leading-[0.95] text-[#0a0a0a]">
                    Architectural <span className="text-[#050505]">Precision.</span>
                </h2>
                <p className="font-serif text-[18px] text-slate-500 leading-relaxed">
                    Designed for professional compliance and quantitative research. We eliminate the noise, providing mathematical certainty and actionable intelligence.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Bento Card 1 */}
                <div className="col-span-1 lg:col-span-2 bg-white/40 backdrop-blur-3xl rounded-[2.5rem] border border-black/5 p-10 flex flex-col lg:flex-row items-center gap-10 hover:shadow-xl transition-all duration-500 overflow-hidden group">
                    <div className="w-full lg:w-1/2 space-y-6">
                        <h3 className="text-[28px] font-black uppercase tracking-tight text-[#0a0a0a]">
                            Secure Integrity.
                        </h3>
                        <p className="text-[16px] text-slate-500 leading-relaxed font-serif">
                            The Whale Alert Network operates on a strict zero-knowledge architecture. There are no passwords to compromise. Your identity is mathematically verified, ensuring that your professional portfolio data remains private.
                        </p>
                    </div>
                    <div className="w-full lg:w-1/2 h-full min-h-[300px] flex items-center justify-center bg-white/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 overflow-hidden p-6 relative group-hover:bg-slate-50 transition-colors">
                        <RemoteLottie path="DeeWork About Blockchain.json" className="w-full h-full scale-125" />
                    </div>
                </div>

                {/* Bento Card 2 */}
                <div className="col-span-1 bg-white/40 backdrop-blur-3xl rounded-[2.5rem] border border-black/5 p-10 flex flex-col justify-between hover:shadow-xl transition-all duration-500 group">
                    <div className="w-full h-[200px] flex items-center justify-center bg-white/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 mb-8 overflow-hidden p-4 relative group-hover:bg-slate-50 transition-colors">
                         <RemoteLottie path="Connected world.json" className="scale-125" />
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-[24px] font-black uppercase tracking-tight text-[#0a0a0a]">
                            Entity Resolution.
                        </h3>
                        <p className="text-[15px] text-slate-500 leading-relaxed font-serif">
                            We map complex multi-hop interactions and resolve fragmented on-chain fingerprints into unified professional entities for absolute regulatory clarity.
                        </p>
                    </div>
                </div>

                {/* Bento Card 3 */}
                <div className="col-span-1 bg-white/40 backdrop-blur-3xl rounded-[2.5rem] border border-black/5 p-10 flex flex-col justify-between hover:shadow-xl transition-all duration-500 group">
                    <div className="space-y-6 mb-8">
                        <h3 className="text-[24px] font-black uppercase tracking-tight text-[#0a0a0a]">
                            Analytics Engines.
                        </h3>
                        <p className="text-[15px] text-slate-500 leading-relaxed font-serif">
                            Our deterministic algorithms process vast arrays of raw blockchain state, detecting liquidity patterns and massive accumulations with mathematical precision.
                        </p>
                    </div>
                    <Link href="/dashboard" target="_blank" rel="noopener noreferrer" className="w-full h-[200px] flex items-center justify-center bg-white/40 backdrop-blur-3xl dark:bg-[#0A0A0A] rounded-[2rem] border border-black/5 dark:border-white/5 overflow-hidden p-4 relative group-hover:bg-slate-50 transition-colors">
                         <RemoteLottie path="Isometric data analysis.json" className="w-full h-full scale-110" />
                    </Link>
                </div>

                {/* Bento Card 4 */}
                <div className="col-span-1 lg:col-span-2 bg-white/40 backdrop-blur-3xl rounded-[2.5rem] border border-black/5 p-10 flex flex-col lg:flex-row items-center gap-10 hover:shadow-xl transition-all duration-500 overflow-hidden group">
                    <div className="w-full lg:w-1/2 h-full min-h-[300px] flex items-center justify-center bg-white/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 overflow-hidden p-6 relative group-hover:bg-slate-50 transition-colors">
                        <div className="absolute inset-0 bg-[#050505]/5 pointer-events-none mix-blend-multiply transition-opacity duration-700 group-hover:opacity-50" />
                         <RemoteLottie path="Trade.json" className="w-full h-full scale-125" />
                    </div>
                    <div className="w-full lg:w-1/2 space-y-6">
                        <h3 className="text-[28px] font-black uppercase tracking-tight text-[#0a0a0a]">
                            Network Tracking.
                        </h3>
                        <p className="text-[16px] text-slate-500 leading-relaxed font-serif">
                            Relying on block confirmations is insufficient for advanced operations. Our dedicated node mesh directly interfaces with the global mempool, allowing you to intercept and analyze capital flows milliseconds after they are signed.
                        </p>
                    </div>
                </div>

            </div>
        </div>
      </section>

      {/* ── SHOWCASE ────────────────────────────────────────────────────────── */}
      <section className="w-full py-24 md:py-40 bg-transparent overflow-hidden relative border-t border-black/5 flex justify-center">
        <div className="w-full max-w-[2560px] mx-auto px-6 md:px-12 xl:px-20 mb-16 md:mb-24">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={FADE_UP} className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
            <div className="relative text-left">
              <h2 className="text-[40px] sm:text-[56px] md:text-[72px] font-black tracking-tighter uppercase leading-[0.95]">
                Clean design.<br /><span className="text-black/20">Expert execution.</span>
              </h2>
            </div>
            <p className="font-serif text-[16px] sm:text-[18px] text-slate-500 max-w-lg leading-relaxed text-left">
              A comprehensive and intuitive dashboard designed to provide a clear overview of the platform, combining powerful analytical tools with an elegant, professional aesthetic.
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
              <img key={idx} src={src} className="w-full h-auto rounded-2xl md:rounded-[2rem] shadow-2xl border border-black/5 object-cover bg-white" alt={`Platform view ${idx + 1}`} />
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

      <section className="w-full py-32 md:py-48 bg-transparent border-t border-black/5 flex justify-center">
        <div className="w-full max-w-[2560px] mx-auto px-6 text-left flex flex-col items-start">
          <h2 className="text-[36px] md:text-[56px] font-serif text-[#0a0a0a] leading-tight tracking-tight mb-8">
            In the pursuit of <br /><span className="italic font-light text-slate-500">absolute transparency</span>.
          </h2>
          <p className="font-serif text-[15px] md:text-[18px] text-slate-500 max-w-2xl leading-relaxed text-left">
            Foundational document on pure mathematical abstraction, zero-knowledge security,
            and deterministic analytical paradigms that cement the immutable global infrastructure.
          </p>
        </div>
      </section>
      
    </div>
  );
}
