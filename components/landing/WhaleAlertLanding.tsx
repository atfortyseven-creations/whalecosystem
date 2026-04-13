"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Database, Shield, Binary, Activity, Zap, Lock, Globe, ArrowRight, Github, Twitter, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useSWR from "swr";
import Image from "next/image";

import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import { WhaleLogo } from "@/components/shared/WhaleLogo";
import { UltraFluidSection, UltraFluidLayer } from "./UltraFluidEngine";
import { ScrollFloat } from "@/components/ui/ScrollFloat";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const DynamicCryptoCheckoutModal = dynamic(
  () => import("@/components/news/CryptoCheckoutModal").then((m) => m.CryptoCheckoutModal),
  { ssr: false }
);

// ── Reveal wrapper ──────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "", yOffset = 30 }: { children: React.ReactNode; delay?: number; className?: string; yOffset?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: yOffset }} 
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }} 
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Data ticker ─────────────────────────────────────────────────────────────────
const TICKER_FALLBACK = [
  "DATA FEED ACTIVE", "ZK PROOF VERIFIED", "WHALE MOVEMENT DETECTED", "NETWORK STATUS: SECURE",
  "NODE LATENCY: <15ms", "MEMPOOL: MONITORING", "ON-CHAIN CAPTURE ACTIVE", "L2 NETWORKS: SYNCED"
];

function DataTicker() {
  const { data } = useSWR("/api/network/live-ticker", (url) => fetch(url).then((res) => res.json()), {
    fallbackData: { ticker: TICKER_FALLBACK }, refreshInterval: 5000
  });
  const tData = data?.ticker || TICKER_FALLBACK;
  const content = [...tData, ...tData, ...tData];
  return (
    <div className="relative w-full border-y border-black/5 overflow-hidden py-4 bg-white/40 backdrop-blur-xl z-50">
      <motion.div className="flex gap-20 will-change-transform w-max" animate={{ x: [0, -2000] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
        {content.map((item: string, i: number) => (
          <span key={i} className="text-[10px] font-mono uppercase tracking-[0.4em] font-bold text-black/30 flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F2EA] shadow-[0_0_8px_rgba(0,242,234,0.3)]" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function WhaleAlertLanding() {
  const router = useRouter();
  const { address } = useSovereignAccount();
  const [showDocumentGate, setShowDocumentGate] = useState(false);

  const handleEntry = () => {
    if (address) router.push("/dashboard");
    else setShowDocumentGate(true);
  };

  return (
    <main className="relative min-h-screen bg-[#FAF9F6] text-[#050505] selection:bg-[#00F2EA]/30 overflow-x-hidden">
      
      {/* ── BACKGROUND LAYERS: Inhuman Fidelity ───────────────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Layer 1: Institutional Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.06] mix-blend-multiply"
          style={{ 
            backgroundImage: "url('/api/checkpoint-image?name=patron-cosmico-4k.png')",
            backgroundSize: '800px auto',
            backgroundRepeat: 'repeat'
          }}
        />
        {/* Layer 2: Texture Depth */}
        <div 
          className="absolute inset-0 opacity-[0.03] mix-blend-multiply"
          style={{ 
            backgroundImage: "url('/api/checkpoint-image?name=media__1776045581666.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        {/* Layer 3: Futurist Mesh Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{ 
            backgroundImage: "url('/api/checkpoint-image?name=media__1776045572078.png')",
            backgroundSize: '1200px auto',
            backgroundPosition: 'top left'
          }}
        />
        {/* Layer 4: Atmosphere Blending */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-[#FAF9F6] opacity-90" />
      </div>

      {/* ── NAVIGATION ────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 w-full z-[100] px-6 py-8 flex justify-between items-center bg-gradient-to-b from-white/80 to-transparent backdrop-blur-sm border-b border-black/[0.03]">
        <div className="flex items-center gap-4 group cursor-pointer">
          <WhaleLogo className="w-10 h-10 transition-transform group-hover:scale-110" />
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tighter uppercase leading-none text-black">Whale Alert Network</span>
            <span className="text-[9px] font-mono text-black/40 tracking-[0.3em] uppercase mt-1">Institutional Hub</span>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6 mr-4">
             <span className="text-[9px] font-mono font-bold text-[#00F2EA] flex items-center gap-1.5 animate-pulse">
                <span className="w-1 h-1 rounded-full bg-[#00F2EA]" /> NETWORK SYNCED: 99.9%
             </span>
             <span className="text-[9px] font-mono text-black/30">
                TERMINAL AUTH MODE: [SOVEREIGN]
             </span>
          </div>
          <button onClick={handleEntry} className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-black/50 hover:text-black transition-colors">
            {address ? "Open Terminal" : "Connect your Wallet"}
          </button>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex gap-4">
            <Github size={18} className="text-black/20 hover:text-black transition-colors cursor-pointer" />
            <Twitter size={18} className="text-black/20 hover:text-black transition-colors cursor-pointer" />
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION: GSAP ScrollFloat Masterpiece ───────────────────────── */}
      <UltraFluidSection className="min-h-screen flex flex-col items-center justify-center pt-20 px-6 overflow-visible">
        {({ y, opacity, scale }) => (
          <UltraFluidLayer style={{ y, opacity, scale }} className="flex flex-col items-center text-center max-w-6xl z-10">
            
            <Reveal delay={0.2}>
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-black/5 border border-black/10 rounded-full mb-10 backdrop-blur-xl">
                 <div className="w-2 h-2 rounded-full bg-[#00F2EA] animate-pulse shadow-[0_0_12px_rgba(0,242,234,0.4)]" />
                 <span className="text-[10px] font-mono font-black tracking-[0.25em] text-black/70 uppercase">Institutional Feed Active</span>
              </div>
            </Reveal>

            <ScrollFloat 
              containerClassName="mb-12"
              textClassName="text-7xl md:text-9xl lg:text-[11rem] text-black tracking-tighter leading-[0.82] drop-shadow-[0_4px_30px_rgba(0,0,0,0.05)]"
              animationDuration={1.4}
              stagger={0.06}
            >
              SOVEREIGN TERMINAL
            </ScrollFloat>

            <Reveal delay={0.5}>
              <p className="text-lg md:text-xl text-black/40 max-w-3xl leading-relaxed mb-16 font-light">
                The market is not a product of observation; it is a consequence of structured analysis. Every signal you see is sourced directly from the mempool—verified on-chain, processed at sub-15ms latency.
              </p>
            </Reveal>

            <Reveal delay={0.7}>
              <div className="flex flex-col sm:flex-row gap-6">
                <button onClick={handleEntry} className="group relative px-12 py-6 bg-white text-black font-black uppercase tracking-[0.25em] text-xs rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)]">
                   <div className="absolute inset-0 bg-[#00F2EA] opacity-0 group-hover:opacity-10 transition-opacity" />
                   Connect your Wallet
                </button>
                <button className="px-12 py-6 border border-black/10 text-black font-black uppercase tracking-[0.25em] text-xs rounded-full hover:bg-black/5 transition-all">
                   Network Protocol
                </button>
              </div>
            </Reveal>
          </UltraFluidLayer>
        )}
      </UltraFluidSection>

      <DataTicker />

      <section className="relative py-40 border-t border-black/5 bg-[#FAF9F6] overflow-hidden">
        <div 
          className="absolute inset-0 z-0 opacity-40 transition-opacity grayscale hover:grayscale-0 duration-1000"
          style={{ 
            backgroundImage: "url('/api/checkpoint-image?name=olas-hokusai-4k.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom'
          }}
        />
        {/* Superior Blending Gradient */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#FAF9F6] via-transparent to-[#FAF9F6] opacity-80" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
           <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <ScrollFloat 
                  scrollStart="top bottom" 
                  scrollEnd="bottom center"
                  textClassName="text-5xl md:text-7xl leading-tight mb-8"
                >
                  WHALE ALERT NETWORK
                </ScrollFloat>
                <div className="space-y-8">
                  {[
                    { title: "Real-Time Intelligence", desc: "Priority fee monitoring on Solana and L1/L2 EVM mempool capture." },
                    { title: "Sovereign Mesh Protocol", desc: "Encoded P2P data propagation with ZK-proven signal authenticity." },
                    { title: "Capital Movement Tracker", desc: "Automated forensic analysis of movement in deep-cold wallets." }
                  ].map((item, i) => (
                    <Reveal key={i} delay={0.1 * i} className="group p-8 bg-white text-black rounded-3xl hover:scale-[1.02] transition-all shadow-[0_10px_40px_rgba(255,255,255,0.1)]">
                      <h4 className="text-xl font-black mb-2 flex items-center gap-4">
                        <span className="text-[#00F2EA] font-mono text-xs px-2 py-1 bg-black rounded">LVL 0{i+1}</span>
                        {item.title}
                      </h4>
                      <p className="text-black/60 leading-relaxed font-bold text-sm tracking-tight">{item.desc}</p>
                    </Reveal>
                  ))}
                </div>
              </div>
              <div className="relative aspect-square">
                 <div className="absolute inset-0 bg-[#00F2EA]/10 blur-[120px] rounded-full animate-pulse" />
                 <div className="relative h-full w-full border border-black/10 rounded-[4rem] overflow-hidden backdrop-blur-3xl bg-white/40 p-12">
                    <div 
                      className="absolute inset-0 opacity-[0.1] mix-blend-overlay"
                      style={{ 
                        backgroundImage: "url('/api/checkpoint-image?name=patron-cosmico-4k.png')",
                        backgroundSize: '400px auto',
                      }}
                    />
                    <div className="relative h-full w-full border border-black/5 rounded-[3rem] p-8 flex flex-col justify-between z-10">
                       <Activity className="text-[#00F2EA] w-12 h-12" />
                       <div className="space-y-4">
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                             <motion.div className="h-full bg-[#00F2EA]" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
                          </div>
                          <div className="h-2 w-3/4 bg-white/5 rounded-full overflow-hidden">
                             <motion.div className="h-full bg-white/20" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />
                          </div>
                       </div>
                       <div className="font-mono text-[10px] text-black/20 tracking-widest uppercase">
                          System Active · Zero Trust
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* ── CTA SECTION: Final Connection ────────────────────────────────────── */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center p-6 border-t border-white/5 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay rotate-180"
          style={{ 
            backgroundImage: "url('/api/checkpoint-image?name=patron-cosmico-4k.png')",
            backgroundSize: '1200px auto',
            backgroundPosition: 'center'
          }}
        />
        <Reveal className="text-center relative z-10">
          <WhaleLogo className="w-24 h-24 mx-auto mb-12 animate-float" />
          <ScrollFloat textClassName="text-6xl md:text-8xl mb-8">SECURE ACCESS</ScrollFloat>
          <p className="text-black/40 max-w-xl mx-auto mb-12 text-sm leading-loose uppercase tracking-[0.1em]">
            Permissionless authentication. Hardened security. Your data is encrypted locally. Zero persistence of sensitive session tokens.
          </p>
            <button onClick={handleEntry} className="px-6 py-2.5 bg-[#00F2EA] text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,242,234,0.3)]">
              Connect your Wallet
            </button>
        </Reveal>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 px-6 py-20 border-t border-black/5 bg-white/40 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 text-[11px] font-mono tracking-widest text-black/30 uppercase">
          <div className="flex flex-col gap-6">
            <WhaleLogo className="w-6 h-6 grayscale opacity-50" />
            <p>© 2026 Sovereign Network Technology. All rights reserved.</p>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-black/60">Operational status</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00F2EA] shadow-[0_0_8px_rgba(0,242,234,0.4)] animate-pulse" />
              <span>All systems nominal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00F2EA] animate-pulse" />
              <span>Institutional Protocol Active</span>
            </div>
          </div>
          <div className="flex flex-col gap-4 items-end">
            <span className="text-black/60">Terminal Build 777-X</span>
            <p>Hash: 0x8f2d...5e9a</p>
          </div>
        </div>
      </footer>

      {/* ── GATE MODAL ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showDocumentGate && (
          <div className="fixed inset-0 z-[10000] bg-white/80 backdrop-blur-2xl flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-black/[0.08] p-12 md:p-16 rounded-[4rem] max-w-2xl w-full shadow-[0_40px_100px_rgba(0,0,0,0.1)] relative overflow-hidden">
               
               <div 
                 className="absolute inset-0 opacity-[0.03] pointer-events-none"
                 style={{ 
                   backgroundImage: "url('/api/checkpoint-image?name=patron-cosmico-4k.png')",
                   backgroundSize: '400px auto',
                 }}
               />

               <div className="absolute top-0 right-0 p-10">
                 <button onClick={() => setShowDocumentGate(false)} className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center text-black/20 hover:text-black hover:bg-black/10 transition-all">
                    <X size={18} />
                 </button>
               </div>
               
               <div className="relative z-10 flex flex-col items-center text-center">
                 <div className="w-20 h-20 bg-black text-white rounded-[2rem] flex items-center justify-center mb-10 shadow-xl">
                    <WhaleLogo className="w-12 h-12" />
                 </div>
                 
                 <h2 className="text-3xl font-black uppercase tracking-tighter mb-6 text-black">
                    Sovereign Handshake
                 </h2>
                 
                 <div className="space-y-6 text-[11px] text-black/40 leading-relaxed font-mono tracking-[0.1em] uppercase mb-12">
                   <p>Verify ownership via a gasless cryptographic signature. Institutional-grade encryption protocol active.</p>
                   <div className="p-5 bg-black/[0.02] rounded-2xl border border-black/[0.04] font-black text-[9px] tracking-[0.3em]">
                      IDENTITY MASKING STATUS: [0xVERIFIED]
                   </div>
                 </div>
                 
                 <button onClick={() => router.push("/dashboard")} className="group relative w-full py-6 bg-black text-white font-black uppercase tracking-[0.4em] text-[11px] rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-10 transition-opacity" />
                    Connect your Wallet
                 </button>
                 
                 <p className="mt-8 text-[9px] font-black text-black/20 uppercase tracking-[0.5em]">
                    HumanID Digital Signature Required
                 </p>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
