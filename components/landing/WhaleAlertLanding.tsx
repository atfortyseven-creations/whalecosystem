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
import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import dynamic from 'next/dynamic';

// Letta-inspired Terminal Component
const LettaTerminal = () => {
  return (
    <div className="w-full max-w-5xl mx-auto my-32 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="rounded-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl overflow-hidden relative"
      >
        {/* Terminal Header */}
        <div className="bg-[#111111] border-b border-white/5 px-4 py-3 flex items-center gap-2">
           <div className="flex gap-1.5">
             <div className="w-3 h-3 rounded-full bg-red-500/80" />
             <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
             <div className="w-3 h-3 rounded-full bg-green-500/80" />
           </div>
           <div className="flex-1 text-center text-[10px] font-aztec-mono text-white/30 uppercase tracking-widest">
              whale-cli ~ sovereign-node
           </div>
        </div>
        
        {/* Terminal Body */}
        <div className="p-6 font-aztec-mono text-xs md:text-sm text-green-400/90 leading-relaxed overflow-x-auto">
          <p className="text-white/50 mb-4">$ npx whale-alert-cli init --sovereign</p>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="mb-1 text-[var(--aztec-chartreuse)]">❯ Initializing Sovereign Identity Matrix...</p>
            <p className="mb-1 text-white/70">✔ Generating Zero-Knowledge Proofs</p>
            <p className="mb-1 text-white/70">✔ Synchronizing with global Whale tracking nodes</p>
            <p className="mb-1 text-white/70">✔ Establishing end-to-end encrypted vault tunnel</p>
            <p className="mt-4 mb-2 text-[var(--aztec-orchid)]">System Ready. Awaiting institutional command.</p>
            <div className="flex items-center gap-2 mt-4 text-white/50">
               <span>$</span>
               <span className="w-2 h-4 bg-white/50 animate-pulse" />
            </div>
          </motion.div>
        </div>
        
        {/* Glowing Background Effect */}
        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[var(--aztec-chartreuse)]/5 blur-[100px] rounded-full pointer-events-none" />
      </motion.div>
    </div>
  );
};

// Letta-inspired Bento Grid
const BentoGrid = () => {
    return (
        <div className="w-full max-w-7xl mx-auto px-6 mb-32">
            <div className="text-center mb-16">
                <h2 className="font-aztec-h1 text-4xl md:text-5xl text-[var(--aztec-ink)] mb-4 tracking-tight">
                    Stateful Privacy for <br/> <span className="italic text-[var(--aztec-orchid)]">Smart Capital</span>
                </h2>
                <p className="font-aztec-mono text-[11px] uppercase tracking-widest text-[var(--aztec-ink)]/50">
                    The agentic development framework for high-net-worth indexing.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Large Card */}
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="md:col-span-2 bg-white rounded-3xl p-8 border border-black/5 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.05)] relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[var(--aztec-chartreuse)]/20 to-transparent blur-[40px] rounded-full -translate-y-1/2 translate-x-1/4 group-hover:scale-110 transition-transform duration-700" />
                    <Activity className="text-[var(--aztec-ink)] mb-6 opacity-80" size={32} />
                    <h3 className="font-aztec-h2 text-sm uppercase tracking-widest text-[var(--aztec-ink)] font-bold mb-3">
                        Long-Term Memory Indexing
                    </h3>
                    <p className="font-aztec-body text-lg text-[var(--aztec-ink)]/60 leading-relaxed max-w-md">
                        Whale Alert automatically manages an infinite context window of global blockchain transactions, allowing your sovereign agents to recall years of capital flow data instantly.
                    </p>
                </motion.div>

                {/* Small Card 1 */}
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-[var(--aztec-ink)] text-[var(--aztec-parchment)] rounded-3xl p-8 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.2)]"
                >
                    <Lock className="text-[var(--aztec-orchid)] mb-6" size={32} />
                    <h3 className="font-aztec-h2 text-sm uppercase tracking-widest text-[var(--aztec-parchment)] mb-3">
                        Sovereign ADE
                    </h3>
                    <p className="font-aztec-body text-sm text-[var(--aztec-parchment)]/60 leading-relaxed">
                        The ultimate Agent Development Environment built exclusively for zero-knowledge deployment and institutional grade privacy.
                    </p>
                </motion.div>

                {/* Small Card 2 */}
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-3xl p-8 border border-black/5 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.05)]"
                >
                    <Cpu className="text-[var(--aztec-ink)]/80 mb-6" size={32} />
                    <h3 className="font-aztec-h2 text-sm uppercase tracking-widest text-[var(--aztec-ink)] mb-3">
                        Custom Tools
                    </h3>
                    <p className="font-aztec-body text-sm text-[var(--aztec-ink)]/60 leading-relaxed">
                        Equip your tracking agents with exact API integrations. Hook into DeFi, specific wallets, or global CEX inflows programmatically.
                    </p>
                </motion.div>

                {/* Wide Card */}
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="md:col-span-2 bg-gradient-to-br from-white to-[#f5f5f0] rounded-3xl p-8 border border-black/5 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center gap-8 justify-between"
                >
                    <div>
                        <Target className="text-[var(--aztec-ink)]/80 mb-6" size={32} />
                        <h3 className="font-aztec-h2 text-sm uppercase tracking-widest text-[var(--aztec-ink)] mb-3">
                            Predictable Agentic Reasoning
                        </h3>
                        <p className="font-aztec-body text-sm text-[var(--aztec-ink)]/60 leading-relaxed max-w-sm">
                            Whale Alert's LLM engine is hard-forked to focus strictly on capital velocity and market impact predictions, returning exact structured JSON arrays.
                        </p>
                    </div>
                    {/* Simulated Output window */}
                    <div className="bg-[#111111] rounded-xl p-4 w-full md:w-64 border border-white/5 shadow-inner">
                         <div className="font-aztec-mono text-[9px] text-[#D4FF2B] leading-relaxed">
                             {"{"}<br/>
                             &nbsp;&nbsp;"signal": "BULL",<br/>
                             &nbsp;&nbsp;"confidence": "0.98",<br/>
                             &nbsp;&nbsp;"impact_usd": "14B"<br/>
                             {"}"}
                         </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

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
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0 hidden md:block">
           <Image 
             src="/models/update/logan-voss-VTWMWadBMvM-unsplash.jpg" 
             alt="Background Logans Voss Immersion" 
             fill 
             priority 
             className="object-cover opacity-20 mix-blend-multiply brightness-[1.05]" 
           />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 2, ease: [0.23, 1, 0.32, 1] }}
          className="text-center relative z-10 max-w-7xl mx-auto will-change-transform"
        >
          <h1 className="font-aztec-h1 text-[clamp(2.5rem,10vw,12rem)] leading-[0.85] text-[var(--aztec-ink)] mb-12 drop-shadow-sm tracking-tight">
            Whale Alert <br/><span className="italic font-light opacity-80">Corporation</span><sup className="text-[0.2em] align-top ml-2 opacity-50 font-sans font-normal">TM</sup>
          </h1>
          
          <p className="font-aztec-body text-xl md:text-3xl text-[var(--aztec-ink)]/60 max-w-4xl mx-auto leading-relaxed mb-16 px-4">
             Providing programmable <span className="text-[var(--aztec-ink)] font-bold">data surveillance</span> for institutional sovereigns. Your capital, your identity, absolute digital permanence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-12">
            <motion.button
              onClick={handleEnterArchive}
              whileHover={{ 
                backgroundColor: "var(--aztec-chartreuse)", 
                scale: 1.05,
                boxShadow: "0 20px 40px -10px rgba(180, 255, 0, 0.4)" 
              }}
              whileTap={{ scale: 0.98 }}
              className="px-20 py-7 bg-[var(--aztec-ink)] text-[var(--aztec-parchment)] font-aztec-h2 text-[12px] uppercase tracking-[0.5em] transition-all duration-700 rounded-full shadow-2xl relative group overflow-hidden"
            >
              <span className="relative z-10">Initialize Compliance</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </motion.button>
            <Link href="/docs" className="group font-aztec-h2 text-[11px] uppercase tracking-[0.4em] text-[var(--aztec-ink)] hover:text-[var(--aztec-orchid)] transition-all flex items-center gap-3">
              Technical Documentation 
              <motion.div 
                animate={{ x: [0, 5, 0] }} 
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ChevronRight size={14} className="text-[var(--aztec-orchid)]" />
              </motion.div>
            </Link>
          </div>
        </motion.div>
        
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 opacity-20 hidden md:block">
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-px h-16 bg-black" />
        </div>
      </section>

      {/* ── LETTA-STYLE ARCHITECTURE ── */}
      <section className="relative z-10 bg-[var(--aztec-parchment)]">
        {/* Subtle background grid pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
             style={{ backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
        />
        
        <LettaTerminal />
        <BentoGrid />
      </section>

      {/* ── FOOTER & LEGAL ── */}
      <footer className="relative z-10 bg-[#050505] text-white/50 py-32 px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-24 mb-32">
                <div className="col-span-1 md:col-span-2 space-y-8">
                    <div className="font-aztec-h1 text-6xl text-white flex items-center gap-4">
                      <div className="w-16 h-16 relative bg-white/5 rounded-full p-2 shadow-xl border border-white/10 flex items-center justify-center">
                        <Image src="/official-whale-legendary.png" alt="Legendary Logo" fill className="object-contain p-2" />
                      </div>
                      Whale Alert <span className="italic text-[var(--aztec-orchid)]">Corp</span>.
                    </div>
                    <p className="font-aztec-body text-xl max-w-md leading-relaxed text-white/60">
                        The definitive ADE (Agent Development Environment) for on-chain sovereign privacy. Built for global institutions.
                    </p>
                </div>
                
                <div className="space-y-6">
                    <div className="font-aztec-h2 text-[10px] uppercase tracking-[0.4em] text-white">Platform</div>
                    <div className="flex flex-col gap-4">
                        <Link href="/vip" className="font-aztec-body text-sm hover:text-[var(--aztec-orchid)] transition-colors">VIP Archive</Link>
                        <Link href="/network" className="font-aztec-body text-sm hover:text-[var(--aztec-orchid)] transition-colors">Network Portal</Link>
                        <Link href="/academy" className="font-aztec-body text-sm hover:text-[var(--aztec-orchid)] transition-colors">Whale Academy</Link>
                        <Link href="/support" className="font-aztec-body text-sm hover:text-[var(--aztec-orchid)] transition-colors">Core Support</Link>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="font-aztec-h2 text-[10px] uppercase tracking-[0.4em] text-white">Connect</div>
                    <div className="flex flex-col gap-4">
                        <a href="https://twitter.com/aztecnetwork" target="_blank" className="font-aztec-body text-sm flex items-center justify-between hover:text-[var(--aztec-orchid)] transition-colors group border-b border-white/5 pb-2">
                             <span>Twitter / X</span>
                             <Twitter size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                        <a href="https://github.com/AztecProtocol" target="_blank" className="font-aztec-body text-sm flex items-center justify-between hover:text-[var(--aztec-orchid)] transition-colors group border-b border-white/5 pb-2">
                             <span>Github Repository</span>
                             <Github size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                        <Link href="/docs" className="font-aztec-body text-sm hover:text-[var(--aztec-orchid)] transition-colors">Technical Docs</Link>
                        <Link href="/privacy" className="font-aztec-body text-sm hover:text-[var(--aztec-orchid)] transition-colors">Privacy Policy</Link>
                    </div>
                </div>
            </div>

            <div className="pt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="font-aztec-mono text-[9px] uppercase tracking-[0.5em] opacity-40">
                    © 2025 WHALE ALERT CORP — ALL RIGHTS RESERVED
                </div>
                <div className="font-aztec-h1 text-4xl opacity-[0.03] select-none tracking-tighter">WHALE ALERT</div>
            </div>
        </div>
      </footer>
    </div>
  );
}
