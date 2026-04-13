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
    <div className="relative w-full border-y border-white/5 overflow-hidden py-4 bg-black/40 backdrop-blur-xl z-50">
      <motion.div className="flex gap-20 will-change-transform w-max" animate={{ x: [0, -2000] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
        {content.map((item: string, i: number) => (
          <span key={i} className="text-[10px] font-mono uppercase tracking-[0.4em] font-bold text-white/30 flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F2EA] shadow-[0_0_8px_rgba(0,242,234,0.5)]" />
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
    <main className="relative min-h-screen bg-[#050505] text-white selection:bg-[#00F2EA]/30 overflow-x-hidden">
      
      {/* ── BACKGROUND LAYERS: Inhuman Fidelity ───────────────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Layer 1: Institutional Blue Blocks (Subtle Depth) */}
        <div 
          className="absolute inset-0 opacity-[0.08] mix-blend-screen bg-repeat"
          style={{ 
            backgroundImage: "url('/api/checkpoint-image?name=patron-cosmico-4k.png')",
            backgroundSize: '800px auto'
          }}
        />
        {/* Layer 2: Celestial Mesh Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none" />
      </div>

      {/* ── NAVIGATION ────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 w-full z-[100] px-6 py-8 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-4 group cursor-pointer">
          <WhaleLogo className="w-10 h-10 transition-transform group-hover:scale-110" />
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tighter uppercase leading-none">Whale Alert Network</span>
            <span className="text-[9px] font-mono text-white/40 tracking-[0.3em] uppercase mt-1">Institutional Hub</span>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <button onClick={handleEntry} className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors">
            {address ? "Open Terminal" : "Connect your Wallet"}
          </button>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex gap-4">
            <Github size={18} className="text-white/20 hover:text-white transition-colors cursor-pointer" />
            <Twitter size={18} className="text-white/20 hover:text-white transition-colors cursor-pointer" />
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION: GSAP ScrollFloat Masterpiece ───────────────────────── */}
      <UltraFluidSection className="min-h-screen flex flex-col items-center justify-center pt-20 px-6 overflow-visible">
        {({ y, opacity, scale }) => (
          <UltraFluidLayer style={{ y, opacity, scale }} className="flex flex-col items-center text-center max-w-6xl z-10">
            
            <Reveal delay={0.2}>
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-10 backdrop-blur-xl">
                 <div className="w-2 h-2 rounded-full bg-[#00F2EA] animate-pulse shadow-[0_0_12px_rgba(0,242,234,0.8)]" />
                 <span className="text-[10px] font-mono font-black tracking-[0.25em] text-white/70 uppercase">Institutional Feed Active</span>
              </div>
            </Reveal>

            <ScrollFloat 
              containerClassName="mb-12"
              textClassName="text-7xl md:text-9xl lg:text-[12rem] text-white tracking-tighter leading-[0.85] drop-shadow-[0_0_40px_rgba(0,0,0,0.5)]"
              animationDuration={1.2}
              stagger={0.05}
            >
              SOVEREIGN TERMINAL
            </ScrollFloat>

            <Reveal delay={0.5}>
              <p className="text-lg md:text-xl text-white/50 max-w-3xl leading-relaxed mb-16 font-light">
                The market is not a product of observation; it is a consequence of structured analysis. Every signal you see is sourced directly from the mempool—verified on-chain, processed at sub-15ms latency.
              </p>
            </Reveal>

            <Reveal delay={0.7}>
              <div className="flex flex-col sm:flex-row gap-6">
                <button onClick={handleEntry} className="group relative px-12 py-6 bg-white text-black font-black uppercase tracking-[0.25em] text-xs rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)]">
                   <div className="absolute inset-0 bg-[#00F2EA] opacity-0 group-hover:opacity-10 transition-opacity" />
                   Connect your Wallet
                </button>
                <button className="px-12 py-6 border border-white/10 text-white font-black uppercase tracking-[0.25em] text-xs rounded-full hover:bg-white/5 transition-all">
                   Network Protocol
                </button>
              </div>
            </Reveal>
          </UltraFluidLayer>
        )}
      </UltraFluidSection>

      <DataTicker />

      <section className="relative py-40 border-t border-white/5 bg-[#050505] overflow-hidden">
        <div 
          className="absolute inset-0 z-0 opacity-40 transition-opacity grayscale hover:grayscale-0 duration-1000"
          style={{ 
            backgroundImage: "url('/api/checkpoint-image?name=olas-hokusai-4k.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom'
          }}
        />
        {/* Superior Blending Gradient */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#050505] via-transparent to-[#050505] opacity-80" />
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
                    <Reveal key={i} delay={0.1 * i} className="group p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] hover:border-white/10 transition-all">
                      <h4 className="text-xl font-black mb-2 flex items-center gap-4">
                        <span className="text-[#00F2EA] font-mono text-sm">0{i+1}</span>
                        {item.title}
                      </h4>
                      <p className="text-white/40 leading-relaxed font-light">{item.desc}</p>
                    </Reveal>
                  ))}
                </div>
              </div>
              <div className="relative aspect-square">
                 <div className="absolute inset-0 bg-[#00F2EA]/10 blur-[120px] rounded-full animate-pulse" />
                 <div className="relative h-full w-full border border-white/10 rounded-[4rem] overflow-hidden backdrop-blur-3xl bg-black/40 p-12">
                    <div 
                      className="absolute inset-0 opacity-[0.1] mix-blend-overlay"
                      style={{ 
                        backgroundImage: "url('/api/checkpoint-image?name=patron-cosmico-4k.png')",
                        backgroundSize: '400px auto',
                      }}
                    />
                    <div className="relative h-full w-full border border-white/5 rounded-[3rem] p-8 flex flex-col justify-between z-10">
                       <Activity className="text-[#00F2EA] w-12 h-12" />
                       <div className="space-y-4">
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                             <motion.div className="h-full bg-[#00F2EA]" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
                          </div>
                          <div className="h-2 w-3/4 bg-white/5 rounded-full overflow-hidden">
                             <motion.div className="h-full bg-white/20" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />
                          </div>
                       </div>
                       <div className="font-mono text-[10px] text-white/20 tracking-widest uppercase">
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
          <p className="text-white/40 max-w-xl mx-auto mb-12 text-sm leading-loose uppercase tracking-[0.1em]">
            Permissionless authentication. Hardened security. Your data is encrypted locally. Zero persistence of sensitive session tokens.
          </p>
          <button onClick={handleEntry} className="px-16 py-8 bg-white text-black font-black uppercase tracking-[0.3em] text-[11px] rounded-full hover:scale-105 active:scale-95 shadow-[0_20px_60px_rgba(255,255,255,0.15)]">
            Connect your Wallet
          </button>
        </Reveal>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 px-6 py-20 border-t border-white/5 bg-black/40 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 text-[11px] font-mono tracking-widest text-white/30 uppercase">
          <div className="flex flex-col gap-6">
            <WhaleLogo className="w-6 h-6 grayscale opacity-50" />
            <p>© 2026 Sovereign Network Technology. All rights reserved.</p>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-white/60">Operational status</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00F2EA] shadow-[0_0_8px_rgba(0,242,234,0.4)] animate-pulse" />
              <span>All systems nominal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00F2EA]/50" />
              <span>Node uptime 99.998%</span>
            </div>
          </div>
          <div className="flex flex-col gap-4 items-end">
            <span className="text-white/60">Terminal Build 777-X</span>
            <p>Hash: 0x8f2d...5e9a</p>
          </div>
        </div>
      </footer>

      {/* ── GATE MODAL ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showDocumentGate && (
          <div className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A0A0A] border border-white/10 p-12 rounded-[3rem] max-w-2xl w-full shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8">
                 <button onClick={() => setShowDocumentGate(false)} className="text-white/20 hover:text-white transition-colors">
                    [ EXIT ]
                 </button>
               </div>
               <div className="relative z-10">
                 <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-4 text-white">
                    <WhaleLogo className="w-10 h-10" /> Sovereign Handshake
                 </h2>
                 <div className="space-y-6 text-[12px] text-white/40 leading-relaxed font-mono tracking-wider mb-12">
                   <p>Verify wallet ownership via a gasless digital signature. No private keys are ever shared with the network.</p>
                   <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5 font-bold uppercase text-[9px] tracking-[0.2em] text-center">
                      Whale Alert Network Protocol Access
                   </div>
                 </div>
                 <button onClick={() => router.push("/dashboard")} className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.3em] text-xs rounded-full hover:scale-105 active:scale-95 transition-all">
                    Connect your Wallet
                 </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
