"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Landmark, Globe, Building2, Fingerprint, Cpu, Target, Zap, ShieldCheck, Lock, Activity, ChevronRight, Twitter, Github } from "lucide-react";
import Link from "next/link";
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useUIStore } from "@/lib/store/ui-store";
import AntiPhishing from "@/components/security/AntiPhishing";
// Letta-inspired Marquee
const MarqueeBanner = () => {
  return (
    <div className="w-full overflow-hidden bg-[#0a0a0a] py-6 border-y border-white/5 flex relative z-20 shadow-2xl">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
      >
        <span className="font-mono text-xl md:text-3xl text-white/30 tracking-[0.3em] font-bold uppercase">
          WHALE ALERT <span className="mx-8">◎</span> SOVEREIGN DATA <span className="mx-8">◎</span> ZK-COMPLIANCE <span className="mx-8">◎</span> INSTITUTIONAL <span className="mx-8">◎</span> WHALE ALERT <span className="mx-8">◎</span> SOVEREIGN DATA <span className="mx-8">◎</span> ZK-COMPLIANCE <span className="mx-8">◎</span> INSTITUTIONAL <span className="mx-8">◎</span>
        </span>
      </motion.div>
    </div>
  );
};

// Letta-inspired Strict Terminal Window
const TerminalWindow = ({ title, children, rightIcon = ">>>", className = "" }: any) => (
  <div className={`bg-[#0a0a0a] border border-white/10 overflow-hidden ${className}`}>
     <div className="bg-[#111111] border-b border-white/5 px-4 py-2 flex justify-between items-center font-aztec-mono text-[9px] text-white/50 uppercase tracking-[0.3em]">
         <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-white/40" />
             {title}
         </div>
         <div className="opacity-50 tracking-widest">{rightIcon}</div>
     </div>
     <div className="w-full h-full">
        {children}
     </div>
  </div>
);

// Letta-inspired Bento Grid
const LettaFeatures = () => {
    return (
        <div className="w-full bg-[#0d0d0d] pt-24 pb-32">
            <div className="max-w-7xl mx-auto px-6">
                
                <h2 className="text-center font-aztec-body text-2xl md:text-4xl text-white/80 font-light tracking-tight mb-20">
                    Designed for deeply sovereign institutions
                </h2>

                <div className="grid grid-cols-1 gap-8">
                    {/* Big Mockup Bento - Letta Style */}
                    <TerminalWindow title="PERSISTENT AGENTS" className="min-h-[400px]">
                        <div className="flex flex-col md:flex-row h-full">
                            <div className="p-12 md:p-16 flex-1 flex flex-col justify-center">
                                <h3 className="font-aztec-body text-3xl md:text-4xl text-white mb-6">
                                    Persistent agents instead of stateless sessions
                                </h3>
                                <p className="font-aztec-body text-lg text-white/50 leading-relaxed max-w-md">
                                    Build your own deeply personalized agents, each with their own unique global index, designed to evolve with your institutional tracking and compliance needs.
                                </p>
                            </div>
                            <div className="flex-1 bg-gradient-to-br from-[var(--aztec-orchid)]/80 to-[var(--aztec-ink)] relative overflow-hidden hidden md:block border-l border-white/10">
                                {/* Simulated Mockup from Screenshot */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] bg-[#050505] border border-white/10 shadow-2xl rounded-lg p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-[var(--aztec-chartreuse)] flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="text-white text-sm mb-1">Whale Alert (Core)</div>
                                            <div className="text-white/40 text-xs mb-4">Tracking high-net-worth inflows...</div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center bg-white/5 p-2 rounded text-xs text-white/70">
                                                    <span>Analyzing Binance Cold Wallet...</span>
                                                    <span>0.5s</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white/5 p-2 rounded text-xs text-white/70">
                                                    <span>Executing Zero-Knowledge Proof...</span>
                                                    <span>1.2s</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TerminalWindow>

                    {/* Secondary Bento Grid Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <TerminalWindow title="LEARNING" className="min-h-[300px]">
                            <div className="flex flex-col h-full bg-[#0a0a0a]">
                                {/* Top image area taking inspiration from the blue rock texture in Letta */}
                                <div className="h-48 relative overflow-hidden bg-[#050505] border-b border-white/5">
                                    <Image src="/models/update/Aztec Image_04.jpg" alt="Deep Texture" fill className="object-cover opacity-60 mix-blend-screen" />
                                </div>
                                <div className="p-8">
                                    <h3 className="font-aztec-body text-xl text-white mb-3">Always processing and learning</h3>
                                    <p className="text-white/50 text-sm leading-relaxed">
                                        The protocol constantly absorbs block headers and mempool data, maintaining an infinite context of financial shifts.
                                    </p>
                                </div>
                            </div>
                         </TerminalWindow>
                         
                         <TerminalWindow title="CUSTOM TOOLS" className="min-h-[300px]">
                            <div className="flex flex-col h-full bg-[#0a0a0a] p-8">
                                <div className="flex-1 font-aztec-mono text-xs text-[var(--aztec-chartreuse)] bg-black border border-white/5 p-4 rounded mb-6 overflow-hidden">
                                     {`def initialize_sovereign_tool():\n  # Connects to Aztec Network\n  zk_shield = create_proof(capital=1000)\n  return zk_shield.verify()`}
                                </div>
                                <div>
                                    <h3 className="font-aztec-body text-xl text-white mb-3">Attach Custom APIs</h3>
                                    <p className="text-white/50 text-sm leading-relaxed">
                                        Extend your agents by linking private institutional endpoints or CEX websockets instantly.
                                    </p>
                                </div>
                            </div>
                         </TerminalWindow>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Letta's Light-Theme "Accessible Anywhere" Section
const CrossPlatformAccess = () => {
    return (
        <div className="w-full bg-[#E8E8E8] py-32 px-6">
            <div className="max-w-4xl mx-auto">
                <h3 className="text-center font-aztec-body text-2xl text-[#111] mb-12">
                    Your personalized agent, accessible from anywhere
                </h3>
                
                <div className="flex flex-col bg-transparent rounded-xl border border-black/10 overflow-hidden shadow-sm">
                    {/* Item 1 */}
                    <div className="flex items-center justify-between p-6 bg-[#E8E8E8] border-b border-black/10 hover:bg-[#F2F2F2] transition-colors">
                        <div className="flex items-center gap-6">
                            <div className="flex -space-x-2">
                                {/* Simulated Letta App icons (Green, Dark, Blue) */}
                                <div className="w-12 h-12 rounded bg-green-500 shadow-md flex items-center justify-center text-white"><Activity size={20} /></div>
                                <div className="w-12 h-12 rounded bg-[#111] shadow-md flex items-center justify-center text-white"><ShieldCheck size={20} /></div>
                                <div className="w-12 h-12 rounded bg-blue-500 shadow-md flex items-center justify-center text-white"><Lock size={20} /></div>
                            </div>
                            <span className="font-aztec-body text-lg text-black/80 font-medium">Install the desktop app</span>
                        </div>
                        <button className="px-4 py-2 font-aztec-body text-xs text-black border border-black/20 rounded hover:bg-black hover:text-white transition-colors">
                            Download for MacOS
                        </button>
                    </div>
                    
                    {/* Item 2 */}
                    <div className="flex items-center justify-between p-6 bg-[#E8E8E8] border-b border-black/10 hover:bg-[#F2F2F2] transition-colors">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-16 rounded overflow-hidden shadow-md bg-black relative p-2 flex items-center">
                                <span className="font-mono text-[8px] text-[var(--aztec-chartreuse)]">npm run start</span>
                            </div>
                            <span className="font-aztec-body text-lg text-black/80 font-medium">Use in the terminal</span>
                        </div>
                        <button className="px-4 py-2 font-aztec-body text-xs text-black border border-black/20 rounded hover:bg-black hover:text-white transition-colors">
                            Install with npm
                        </button>
                    </div>

                    {/* Item 3 */}
                    <div className="flex items-center justify-between p-6 bg-[#E8E8E8] hover:bg-[#F2F2F2] transition-colors">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-16 rounded overflow-hidden shadow-md bg-gradient-to-r from-orange-600 to-red-600 relative p-2 flex items-center justify-center">
                                <span className="font-mono text-[10px] text-white">SDK_CORE</span>
                            </div>
                            <span className="font-aztec-body text-lg text-black/80 font-medium">Build with the SDK</span>
                        </div>
                        <button className="px-4 py-2 font-aztec-body text-xs text-black border border-black/20 rounded hover:bg-black hover:text-white transition-colors">
                            Read the docs
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import dynamic from 'next/dynamic';


export function WhaleAlertLanding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isConnected } = useSovereignAccount();
  const { openConnectModal } = useUIStore();
  const router = useRouter();

  const handleEnterArchive = () => {
    if (isConnected) router.push('/vip');
    else openConnectModal();
  };

  return (
    <div ref={containerRef} className="relative w-full overflow-x-hidden bg-[var(--aztec-parchment)] selection:bg-[var(--aztec-orchid)]/30 bg-noise">
      <AntiPhishing />
      
      {/* ── PHASE 1: AZTEC HERO (Mandatory Preservation) ── */}
      <section className="relative min-h-screen pt-32 px-6 overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 z-0 hidden md:block">
           <Image 
             src="/models/update/logan-voss-VTWMWadBMvM-unsplash.jpg" 
             alt="Background Logans Voss Immersion" 
             fill 
             priority 
             className="object-cover opacity-20 mix-blend-multiply brightness-[1.05]" 
           />
        </div>

        {/* Letta-style floating UI window super-imposed on the hero */}
        <div className="absolute bottom-[-20%] md:bottom-[-40%] left-1/2 -translate-x-1/2 w-full max-w-5xl z-20 pointer-events-none opacity-30 blur-sm scale-105 hidden lg:block">
             <div className="w-full aspect-[16/9] rounded-t-3xl border-t border-x border-white/20 shadow-[0_0_100px_rgba(0,0,0,0.8)] bg-[#050505] overflow-hidden flex">
                 <div className="w-1/4 h-full border-r border-white/10 p-6 flex flex-col gap-4">
                     <div className="h-4 w-24 bg-white/20 rounded" />
                     <div className="h-4 w-32 bg-white/10 rounded" />
                     <div className="h-4 w-20 bg-white/10 rounded" />
                 </div>
                 <div className="flex-1 h-full p-12">
                     <div className="w-3/4 h-32 bg-white/5 rounded-xl ml-auto mb-8" />
                     <div className="w-1/2 h-20 bg-[var(--aztec-chartreuse)]/10 rounded-xl" />
                 </div>
             </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 2, ease: [0.23, 1, 0.32, 1] }}
          className="text-center relative z-10 max-w-7xl mx-auto will-change-transform"
        >
          <div className="w-16 h-16 bg-[var(--aztec-ink)] rounded-xl shadow-xl flex items-center justify-center mx-auto mb-8 relative">
              <ShieldCheck className="text-[var(--aztec-chartreuse)]" size={32} />
          </div>

          <h1 className="font-aztec-body font-light tracking-tight text-[clamp(2rem,6vw,5rem)] leading-none text-[#111111] mb-6 drop-shadow-sm">
            Whale Alert Code
          </h1>
          
          <p className="font-aztec-body text-xl md:text-3xl font-light text-[#111111]/70 max-w-4xl mx-auto leading-relaxed mb-12 px-4">
             The sovereign-first agent. <span className="underline decoration-black/20 underline-offset-4">Get started securely.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              onClick={handleEnterArchive}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-[#E8E8E8] text-black font-aztec-body text-sm rounded border border-black/10 hover:bg-[#d4d4d4] transition-colors"
            >
              Download for MacOS
            </motion.button>

            <Link href="/docs" className="px-8 py-3 bg-transparent text-[#111] font-aztec-body text-sm rounded border border-black/30 hover:bg-black/5 transition-colors">
              Install the CLI
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── LETTA-STYLE ARCHITECTURE ── */}
      <section className="relative z-10">
        <MarqueeBanner />
        <LettaFeatures />
        <CrossPlatformAccess />
        
        {/* Deep Letta Pre-footer */}
        <div className="bg-[#111111] py-32 text-center text-white relative border-b border-white/5">
            <h2 className="font-aztec-body text-3xl font-light mb-4">Whale Alert Code</h2>
            <p className="font-aztec-body text-white/50 text-sm mb-12 max-w-md mx-auto">
               The memory-first agent. Try for free with your own API keys or our institutional node.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="px-6 py-2 bg-white text-black text-xs font-medium rounded hover:bg-white/90">Download for MacOS</button>
              <button className="px-6 py-2 bg-transparent border border-white/20 text-white text-xs font-medium rounded hover:bg-white/10">Install the CLI</button>
            </div>
        </div>
      </section>

      {/* ── VERY MINI FOOTER LETTA ── */}
      <footer className="relative z-10 bg-[#0a0a0a] text-white/50 py-4 px-6 flex justify-between items-center text-xs">
          <div className="flex gap-4">
             <Github size={14} className="hover:text-white cursor-pointer" />
             <Twitter size={14} className="hover:text-white cursor-pointer" />
          </div>
          <div>
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block mr-2" />
            All systems operational
          </div>
      </footer>
    </div>
  );
}
