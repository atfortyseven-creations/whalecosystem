"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Landmark, Globe, Building2, Fingerprint, Cpu, Target, Zap, ShieldCheck, Lock, Activity, ChevronRight, Twitter, Github } from "lucide-react";
import Link from "next/link";
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useUIStore } from "@/lib/store/ui-store";
import AntiPhishing from "@/components/security/AntiPhishing";
import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import SubmarineDeconstruction3D from "./SubmarineDeconstruction3D";

const DATA = {
    stats: [
        { val: "$27.6T", label: "Stablecoin Vol 2024", sub: "More than Visa & Mastercard" },
        { val: "2511",   label: "April 13th Protocol", sub: "Zero-Knowledge Settlement" },
        { val: "99.9%",  label: "Privacy Uptime",      sub: "Forensic Yield Shield" },
        { val: "ZK",     label: "Noir Language",      sub: "Programmable Compliance" },
    ],
    applications: [
        { title: "DeFi & Yield Assets", icon: Landmark, img: "/models/update/Aztec Image_04.jpg", desc: "Private decentralized finance with institutional-grade security." },
        { title: "Global Remittances", icon: Globe, img: "/models/update/Aztec Image_05.jpg", desc: "Instant, private cross-border payments for everyone." },
        { title: "Capital Markets", icon: Building2, img: "/models/update/Aztec Image_06.jpg", desc: "Tokenized real-world assets with privacy-preserving compliance." },
        { title: "Identity Mgmt", icon: Fingerprint, img: "/models/update/Aztec Image_07.jpg", desc: "Verifiable, private identity for sovereign digital beings." },
        { title: "Verifiable AI/ML", icon: Cpu, img: "/models/update/Aztec Image_08.jpg", desc: "Encrypted machine learning models on public blockchains." },
        { title: "Zero-Sum Gaming", icon: Target, img: "/models/update/Aztec Image_09.jpg", desc: "Private strategic strategy games like Battleships or Trading." },
        { title: "Payments Shield", icon: Zap, img: "/models/update/Aztec Image_10.jpg", desc: "High-throughput private transactions for retail." },
        { title: "Compliance Layer", icon: ShieldCheck, img: "/models/update/Aztec Image_11.jpg", desc: "Built-in regulatory tools for institutional transparency." },
    ]
};

export function WhaleAlertLanding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isConnected } = useSovereignAccount();
  const { openConnectModal } = useUIStore();
  const router = useRouter();

  const handleEnterArchive = () => {
    if (isConnected) router.push('/vip');
    else openConnectModal();
  };

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroBgY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div ref={containerRef} className="relative w-full overflow-x-hidden bg-[var(--aztec-parchment)] selection:bg-[var(--aztec-orchid)]/30 bg-noise">
      <AntiPhishing />
      
      {/* ── PHASE 1: AZTEC HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 px-6 overflow-hidden">
        <motion.div 
          style={{ y: heroBgY }} 
          className="absolute inset-0 z-0 will-change-transform hidden md:block"
        >
           <Image 
             src="/models/update/logan-voss-VTWMWadBMvM-unsplash.jpg" 
             alt="Background Logans Voss Immersion" 
             fill 
             priority 
             className="object-cover opacity-20 mix-blend-multiply brightness-[1.05]" 
           />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
          className="text-center relative z-10 max-w-7xl mx-auto will-change-transform"
        >

          <h1 className="font-aztec-h1 text-[clamp(2.5rem,10vw,12rem)] leading-[0.85] text-[var(--aztec-ink)] mb-12 drop-shadow-sm">
            Whale Alert <br/> Corporation<sup className="text-[0.2em] align-top ml-2 opacity-50 font-sans">TM</sup>
          </h1>
          
          <p className="font-aztec-body text-xl md:text-3xl text-[var(--aztec-ink)]/60 max-w-4xl mx-auto leading-relaxed mb-16 px-4">
             Whale Alert’s technology provides programmable data surveillance for institutional use cases, ensuring your data remains sovereign while transacting on public blockchains.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <motion.button
              onClick={handleEnterArchive}
              whileHover={{ backgroundColor: "var(--aztec-chartreuse)", scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-16 py-6 bg-[var(--aztec-ink)] text-[var(--aztec-parchment)] font-aztec-h2 text-[11px] uppercase tracking-[0.4em] transition-all duration-500 rounded-full shadow-xl"
            >
              Initialize Compliance
            </motion.button>
            <Link href="/docs" className="font-aztec-h2 text-[11px] uppercase tracking-[0.4em] text-[var(--aztec-ink)] hover:text-[var(--aztec-orchid)] transition-all flex items-center gap-2">
              Read Documentation <ChevronRight size={14} />
            </Link>
          </div>
        </motion.div>
        
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 opacity-20 hidden md:block">
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-px h-16 bg-black" />
        </div>
      </section>

      {/* ── PHASE 2: GOD-TIER 3D SUBMARINE BREAKDOWN ── */}
      <SubmarineDeconstruction3D />

      {/* ── FOOTER & LEGAL (The Ultimate Downhead) ── */}
      <footer className="bg-[var(--aztec-parchment)] text-[var(--aztec-ink)]/50 py-32 px-12 border-t border-[var(--aztec-ink)]/10">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-24 mb-32">
                <div className="col-span-1 md:col-span-2 space-y-8">
                    <div className="font-aztec-h1 text-6xl text-[var(--aztec-ink)] flex items-center gap-4">
                      <div className="w-16 h-16 relative bg-white rounded-full p-2 shadow-xl border border-black/5 flex items-center justify-center">
                        <Image src="/official-whale-legendary.png" alt="Legendary Logo" fill className="object-contain p-2" />
                      </div>
                      Whale Alert <span className="italic">Corp</span>.
                    </div>
                    <p className="font-aztec-body text-xl max-w-md leading-relaxed">
                        The definitive protocol for on-chain sovereign privacy. Built for global institutions, developers, and pioneers of the next financial frontier.
                    </p>
                </div>
                
                <div className="space-y-6">
                    <div className="font-aztec-h2 text-[10px] uppercase tracking-[0.4em] text-[var(--aztec-ink)]">Platform</div>
                    <div className="flex flex-col gap-4">
                        <Link href="/vip" className="font-aztec-body text-sm hover:text-[var(--aztec-orchid)] transition-colors">VIP Archive</Link>
                        <Link href="/network" className="font-aztec-body text-sm hover:text-[var(--aztec-orchid)] transition-colors">Network Portal</Link>
                        <Link href="/academy" className="font-aztec-body text-sm hover:text-[var(--aztec-orchid)] transition-colors">Whale Academy</Link>
                        <Link href="/support" className="font-aztec-body text-sm hover:text-[var(--aztec-orchid)] transition-colors">Core Support</Link>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="font-aztec-h2 text-[10px] uppercase tracking-[0.4em] text-[var(--aztec-ink)]">Connect</div>
                    <div className="flex flex-col gap-4">
                        <a href="https://twitter.com/aztecnetwork" target="_blank" className="font-aztec-body text-sm flex items-center justify-between hover:text-[var(--aztec-orchid)] transition-colors group border-b border-black/5 pb-2">
                             <span>Twitter / X</span>
                             <Twitter size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                        <a href="https://github.com/AztecProtocol" target="_blank" className="font-aztec-body text-sm flex items-center justify-between hover:text-[var(--aztec-orchid)] transition-colors group border-b border-black/5 pb-2">
                             <span>Github Repository</span>
                             <Github size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                        <Link href="/docs" className="font-aztec-body text-sm hover:text-[var(--aztec-orchid)] transition-colors">Technical Docs</Link>
                        <Link href="/privacy" className="font-aztec-body text-sm hover:text-[var(--aztec-orchid)] transition-colors">Privacy Policy</Link>
                    </div>
                </div>
            </div>

            <div className="pt-20 border-t border-[var(--aztec-ink)]/5 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="font-aztec-mono text-[9px] uppercase tracking-[0.5em] opacity-40">
                    © 2025 WHALE ALERT CORP — ALL RIGHTS RESERVED
                </div>
                <div className="font-aztec-h1 text-4xl opacity-5 select-none tracking-tighter">WHALE ALERT</div>
            </div>
        </div>
      </footer>
    </div>
  );
}

