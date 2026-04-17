"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUIStore } from '@/lib/store/ui-store';
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import Link from 'next/link';

export default function WhaleAlertLanding() {
  const [mounted, setMounted] = useState(false);
  const openConnectModal = useUIStore(s => s.openConnectModal);
  const router = useRouter();
  const { isConnected } = useAccount();

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-[#FAF9F6] text-[#050505] font-sans flex flex-col justify-between selection:bg-black selection:text-white">

      {/* ── Layer 0: Peakpx isometric watermark (fixed, very subtle) ── */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "url('/api/assets?name=peakpx.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "invert(1) grayscale(1)",
        }}
      />

      {/* ── Layer 1: Hokusai Wave — ANCHORED AT BOTTOM, NO ZOOM, FULL DPI ── */}
      <div className="absolute flex justify-center bottom-0 left-0 w-full z-0 pointer-events-none" style={{ lineHeight: 0 }}>
        <img
          src="/olas-hokusai-4k.png"
          alt=""
          aria-hidden="true"
          className="w-full max-w-[1920px]"
          style={{
            display: "block",
            objectFit: "contain",
            objectPosition: "bottom center",
            opacity: 0.12,
            mixBlendMode: "multiply",
            maxHeight: "50vh",
          }}
        />
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="relative z-[50] flex-1 w-full max-w-3xl mx-auto flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="w-full bg-white/95 backdrop-blur-2xl shadow-[0_16px_40px_-8px_rgba(0,0,0,0.12)] rounded-[20px] overflow-hidden border border-black/[0.04] p-8 md:p-12 text-center flex flex-col items-center justify-center"
        >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-8 bg-black/15" />
              <span className="text-[9px] font-black uppercase tracking-[0.35em] text-black/40">Technical Architecture</span>
              <div className="h-px w-8 bg-black/15" />
            </div>
            
            <h1 className="text-[28px] md:text-[34px] font-black tracking-tight text-[#050505] leading-tight mb-4">
              Whale Alert Network
            </h1>
            
            <div className="space-y-4 mb-8 max-w-xl text-[#050505]/70 font-mono text-[11px] md:text-[12px] leading-relaxed text-left border-l-2 border-black/10 pl-6">
              <p>
                <strong>IN SEARCH OF TRANSPARENCY.</strong> Rastreando y filtrando los movimientos institucionales en tiempo real. Toda nuestra información proviene directamente del estado natural de las Blockchains. 100% Verificable. 100% En Vivo.
              </p>
              <p>
                El protocolo v6.12.0 monitoriza transacciones de ballenas, eventos del mempool y flujos de liquidez cross-chain. Diseñado para ofrecerte herramientas de análisis con cero latencia y total transparencia.
              </p>
              <p className="text-black italic mt-2 opacity-80">
                To proceed, connect your authorized injected Web3 interface or complete the Mobile-PC Handshake via QR integration.
              </p>
            </div>
            
            <div className="w-full max-w-md flex flex-col gap-3">
               <div className="flex items-center justify-between px-5 py-3 border border-black/10 rounded-lg bg-[#FAF9F6] text-[10px] font-black uppercase tracking-widest text-[#050505]">
                 <span>System Status</span>
                 <span className="text-emerald-500 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/> Fully Operational</span>
               </div>
               <div className="flex items-center justify-between px-5 py-3 border border-black/10 rounded-lg bg-[#FAF9F6] text-[10px] font-black uppercase tracking-widest text-[#050505]">
                 <span>Deployment Version</span>
                 <span className="text-black/50">v6.12.0 (Diamond-Hardened)</span>
               </div>
            </div>
            
            <div className="mt-8 flex gap-3 flex-wrap justify-center">
                {["L1/L2 Ingress Active", "Zero-Mock", "Aesthetic: Ivory", "Non-Custodial"].map((tag) => (
                  <span key={tag} className="text-[8px] font-black uppercase tracking-[0.2em] text-black/30 border border-black/10 px-3 py-1.5 rounded-sm bg-black/[0.02]">
                    {tag}
                  </span>
                ))}
            </div>

            <div className="mt-12 mb-4 w-full flex justify-center">
                {isConnected ? (
                  <button
                     onClick={() => router.push('/dashboard')}
                     className="w-full max-w-sm relative px-8 py-4 bg-[#050505] text-[#FAF9F6] border border-[#050505] rounded-xl font-black uppercase tracking-[0.2em] text-[12px] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.4)] hover:bg-[#FAF9F6] hover:text-[#050505] transition-all duration-300"
                  >
                     <span className="relative z-10 flex items-center justify-center gap-3">
                         ENTER DASHBOARD 
                         <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                     </span>
                  </button>
                ) : (
                  <button
                     onClick={(e) => { e.preventDefault(); openConnectModal(); }}
                     className="w-full max-w-sm relative px-8 py-4 bg-[#050505] text-[#FAF9F6] border border-[#050505] rounded-xl font-black uppercase tracking-[0.2em] text-[12px] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.4)] hover:bg-[#FAF9F6] hover:text-[#050505] transition-all duration-300 group"
                  >
                     <span className="relative z-10 flex items-center justify-center gap-3">
                         INITIALIZE TERMINAL 
                         <div className="w-1.5 h-1.5 bg-[#FAF9F6] group-hover:bg-[#050505] rounded-full animate-pulse" />
                     </span>
                  </button>
                )}
            </div>
        </motion.div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-[100] px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-[#050505] w-full">
        <div className="flex items-center gap-2">
          <img src="/official-whale-monochrome.png" className="w-3 h-3 opacity-30 grayscale" alt="" />
          <span className="text-[8px] font-black uppercase tracking-[0.4em] text-black/35">© WHALE ALERT NETWORK 2026</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://twitter.com/WhaleAlert" className="text-[8px] font-black uppercase tracking-widest text-black/25 hover:text-black transition-colors">Twitter</a>
          <a href="https://github.com" className="text-[8px] font-black uppercase tracking-widest text-black/25 hover:text-black transition-colors">GitHub</a>
        </div>
      </footer>
    </div>
  );
}
