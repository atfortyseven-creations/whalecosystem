"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { RemoteLottie } from "@/components/ui/RemoteLottie";

// ─── Constants ──────────────────────────────────────────────────────────────

const FADE_UP: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

// ─── Component ──────────────────────────────────────────────────────────────

export function ImmersiveManifestoLanding({ onOpenScanner, hideMap = false }: { onOpenScanner?: () => void; hideMap?: boolean; }) {

  return (
    <div className="relative bg-transparent text-[#0a0a0a] font-sans antialiased overflow-x-hidden selection:bg-black/10">



      {/* ── BENTO BOX: WHY WHALE ALERT NETWORK ──────────────────────────────── */}
      <section className="w-full py-24 md:py-40 bg-transparent relative z-10 flex justify-center">
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 xl:px-20 space-y-16">
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
                <div className="col-span-1 lg:col-span-2 bg-white/70 backdrop-blur-[40px] rounded-[3rem] border border-white/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] p-12 flex flex-col lg:flex-row items-center gap-12 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 overflow-hidden group">
                    <div className="w-full lg:w-1/2 space-y-6">
                        <h3 className="text-[32px] font-black uppercase tracking-tight text-[#050505]">
                            Secure Integrity.
                        </h3>
                        <p className="text-[17px] text-slate-500/90 leading-relaxed font-serif">
                            The Whale Alert Network operates on a strict zero-knowledge architecture. There are no passwords to compromise. Your identity is mathematically verified, ensuring that your professional portfolio data remains private.
                        </p>
                    </div>
                    <div className="w-full lg:w-1/2 h-full min-h-[340px] flex items-center justify-center bg-black/[0.02] rounded-[2rem] border border-black/5 overflow-hidden p-6 relative group-hover:bg-black/[0.04] transition-colors">
                        <RemoteLottie path="DeeWork About Blockchain.json" className="w-full h-full scale-125" />
                    </div>
                </div>

                {/* Bento Card 2 */}
                <div className="col-span-1 bg-white/70 backdrop-blur-[40px] rounded-[3rem] border border-white/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] p-12 flex flex-col justify-between hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 group">
                    <div className="w-full h-[220px] flex items-center justify-center bg-black/[0.02] rounded-[2rem] border border-black/5 mb-10 overflow-hidden p-4 relative group-hover:bg-black/[0.04] transition-colors">
                         <RemoteLottie path="Connected world.json" className="scale-125" />
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-[28px] font-black uppercase tracking-tight text-[#050505]">
                            Entity Resolution.
                        </h3>
                        <p className="text-[16px] text-slate-500/90 leading-relaxed font-serif">
                            We map complex multi-hop interactions and resolve fragmented on-chain fingerprints into unified professional entities for absolute regulatory clarity.
                        </p>
                    </div>
                </div>

                {/* Bento Card 3 */}
                <div className="col-span-1 bg-white/70 backdrop-blur-[40px] rounded-[3rem] border border-white/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] p-12 flex flex-col justify-between hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 group">
                    <div className="space-y-6 mb-10">
                        <h3 className="text-[28px] font-black uppercase tracking-tight text-[#050505]">
                            Analytics Engines.
                        </h3>
                        <p className="text-[16px] text-slate-500/90 leading-relaxed font-serif">
                            Our deterministic algorithms process vast arrays of raw blockchain state, detecting liquidity patterns and massive accumulations with mathematical precision.
                        </p>
                    </div>
                    <Link href="/dashboard" target="_blank" rel="noopener noreferrer" className="w-full h-[220px] flex items-center justify-center bg-black/[0.02] rounded-[2rem] border border-black/5 overflow-hidden p-4 relative group-hover:bg-black/[0.04] transition-colors">
                         <RemoteLottie path="Isometric data analysis.json" className="w-full h-full scale-110" />
                    </Link>
                </div>

                {/* Bento Card 4 */}
                <div className="col-span-1 lg:col-span-2 bg-white/70 backdrop-blur-[40px] rounded-[3rem] border border-white/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] p-12 flex flex-col lg:flex-row items-center gap-12 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 overflow-hidden group">
                    <div className="w-full lg:w-1/2 h-full min-h-[340px] flex items-center justify-center bg-black/[0.02] rounded-[2rem] border border-black/5 overflow-hidden p-6 relative group-hover:bg-black/[0.04] transition-colors">
                        <div className="absolute inset-0 bg-[#050505]/5 pointer-events-none mix-blend-multiply transition-opacity duration-700 group-hover:opacity-50" />
                         <RemoteLottie path="Trade.json" className="w-full h-full scale-125" />
                    </div>
                    <div className="w-full lg:w-1/2 space-y-6">
                        <h3 className="text-[32px] font-black uppercase tracking-tight text-[#050505]">
                            Network Tracking.
                        </h3>
                        <p className="text-[17px] text-slate-500/90 leading-relaxed font-serif">
                            Relying on block confirmations is insufficient for advanced operations. Our dedicated node mesh directly interfaces with the global mempool, allowing you to intercept and analyze capital flows milliseconds after they are signed.
                        </p>
                    </div>
                </div>

            </div>
        </div>
      </section>

      {/* ── SHOWCASE ────────────────────────────────────────────────────────── */}
      <section className="w-full py-24 md:py-40 bg-transparent overflow-hidden relative border-t border-black/5">
        {/* Section Header */}
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 xl:px-20 mb-16 md:mb-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={FADE_UP}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8"
          >
            <div className="relative text-left">
              <h2 className="text-[40px] sm:text-[56px] md:text-[64px] font-black tracking-tighter uppercase leading-[0.95] text-[#0a0a0a]">
                Clean design.<br />
                <span className="text-black/20">Expert execution.</span>
              </h2>
            </div>
            <p className="font-serif text-[16px] sm:text-[18px] text-slate-500 max-w-lg leading-relaxed text-left">
              A comprehensive and intuitive dashboard designed to provide a clear overview of the platform, combining powerful analytical tools with an elegant, professional aesthetic.
            </p>
          </motion.div>
        </div>

        {/* Image Gallery — perfectly centred, no overlays, no zoom, full quality */}
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 xl:px-20 flex flex-col items-center gap-12 md:gap-20">
          {[
            "/system-shots/Captura de pantalla 2026-05-07 012904.png",
            "/system-shots/Captura de pantalla 2026-05-07 032204.png",
            "/system-shots/Captura de pantalla 2026-05-10 002811.png",
            "/system-shots/Captura de pantalla 2026-05-10 002900.png",
            "/system-shots/Captura de pantalla 2026-05-10 002953.png",
            "/system-shots/Captura de pantalla 2026-05-13 191540.png",
            "/system-shots/Captura de pantalla 2026-05-13 191728.png",
            "/system-shots/Captura de pantalla 2026-05-13 191813.png",
            "/system-shots/Captura de pantalla 2026-05-13 192204.png",
            "/system-shots/Captura de pantalla 2026-05-15 042315.png",
          ].map((src, idx) => (
            <motion.div
              key={idx}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={FADE_UP}
              className="w-full flex justify-center"
            >
              <div className="w-full relative group">
                {/* Subtle hover glow — no overlay labels */}
                <div className="absolute -inset-[1px] rounded-[20px] md:rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{ boxShadow: '0 0 60px rgba(0,0,0,0.08)' }}
                />
                <img
                  src={src}
                  className="w-full h-auto block mx-auto rounded-[16px] md:rounded-[24px] object-contain transition-transform duration-700 group-hover:-translate-y-1"
                  style={{
                    boxShadow: '0 8px 48px rgba(0,0,0,0.10)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    background: '#F7F7F5',
                    imageRendering: 'auto',
                  }}
                  alt={`Platform view ${idx + 1}`}
                  loading={idx < 2 ? "eager" : "lazy"}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── WHALE CHAT MARKETING SECTION ──────────────────────────────────────── */}
      <section className="w-full py-24 md:py-40 bg-white relative z-10 flex justify-center border-t border-black/5">
        <div className="w-full max-w-[2560px] mx-auto px-6 md:px-12 xl:px-20">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                {/* Text Side */}
                <div className="w-full lg:w-5/12 space-y-8 text-left">
                    <div className="inline-block px-3 py-1 bg-black/5 rounded-full border border-black/10">
                        <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-black">XMTP Protocol Integration</span>
                    </div>
                    <h2 className="text-[40px] sm:text-[56px] font-black tracking-tighter uppercase leading-[0.95] text-[#0a0a0a]">
                        Whale Chat.<br />
                        <span className="text-black/30">P2P Secure Terminal.</span>
                    </h2>
                    <p className="font-serif text-[18px] text-slate-500 leading-relaxed">
                        A sovereign messaging layer built directly into the institutional interface. Engage in cryptographically secure, peer-to-peer conversations without compromising your zero-knowledge identity.
                    </p>
                    <ul className="space-y-4 pt-4">
                        <li className="flex items-center gap-4 text-[14px] font-mono tracking-tight uppercase text-[#555]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00C076]" />
                            End-to-End Encryption
                        </li>
                        <li className="flex items-center gap-4 text-[14px] font-mono tracking-tight uppercase text-[#555]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00C076]" />
                            No Central Servers
                        </li>
                        <li className="flex items-center gap-4 text-[14px] font-mono tracking-tight uppercase text-[#555]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00C076]" />
                            Automated Contact Persistence
                        </li>
                    </ul>
                    <div className="pt-8">
                        <Link href="/chat" className="inline-flex items-center gap-3 px-8 py-4 bg-[#0a0a0a] text-white rounded-full font-mono text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black/80 transition-colors">
                            Initialize Terminal <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

                {/* Visual Side */}
                <div className="w-full lg:w-7/12">
                    <div className="w-full relative bg-[#FAF9F6] rounded-[2.5rem] border border-black/5 p-6 md:p-12 shadow-xl overflow-hidden group">
                        {/* Abstract representations of chat lines */}
                        <div className="w-full space-y-6 opacity-80 transition-transform duration-700 group-hover:scale-105">
                            <div className="flex justify-start">
                                <div className="max-w-[70%] bg-white border border-black/5 rounded-2xl rounded-tl-sm p-5 shadow-sm">
                                    <div className="h-2 bg-black/10 rounded w-24 mb-3"></div>
                                    <div className="h-2 bg-black/10 rounded w-48 mb-2"></div>
                                    <div className="h-2 bg-black/10 rounded w-32"></div>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <div className="max-w-[70%] bg-[#0a0a0a] rounded-2xl rounded-tr-sm p-5 shadow-sm">
                                    <div className="h-2 bg-white/20 rounded w-20 mb-3"></div>
                                    <div className="h-2 bg-white/20 rounded w-56 mb-2"></div>
                                    <div className="h-2 bg-white/20 rounded w-40"></div>
                                </div>
                            </div>
                            <div className="flex justify-start">
                                <div className="max-w-[70%] bg-white border border-black/5 rounded-2xl rounded-tl-sm p-5 shadow-sm">
                                    <div className="h-2 bg-black/10 rounded w-16 mb-3"></div>
                                    <div className="h-2 bg-black/10 rounded w-40"></div>
                                </div>
                            </div>
                        </div>
                        {/* Overlay to give it a terminal feel */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F6] via-transparent to-transparent opacity-80 pointer-events-none" />
                        <div className="absolute top-6 left-6 font-mono text-[9px] uppercase tracking-[0.3em] text-black/30 font-bold">
                            WHALE CHAT // XMTP 
                        </div>
                    </div>
                </div>
            </div>
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
