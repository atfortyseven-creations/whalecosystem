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
  const { isConnected } = useAccount();
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

      {/* ── PHASE 2: BENTO EXPLAINER (4 PHOTOS) ── */}
      <section className="bg-[var(--aztec-ink)] py-32 px-6 relative z-10 border-t border-white/10">
          <div className="max-w-7xl mx-auto flex flex-col items-center">
              <div className="font-aztec-h2 text-[12px] text-[var(--aztec-chartreuse)] uppercase tracking-[0.6em] mb-12">Global Intelligence</div>
              <h2 className="font-aztec-h1 text-5xl md:text-7xl text-white mb-20 text-center uppercase tracking-tighter">
                  Whale Alert <span className="italic text-[var(--aztec-orchid)]">Protocol</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl">
                  {/* Card 1: What is Whale Alert Network (Purpose) */}
                  <div className="group relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-black border border-white/5 hover:border-[var(--aztec-orchid)]/30 transition-all duration-700">
                      <Image src="/models/update/Aztec Image_04.jpg" alt="Whale Alert Network" fill className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-[2s]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      <div className="absolute inset-0 p-10 flex flex-col justify-end">
                          <h3 className="font-aztec-h3 text-3xl text-white mb-4 flex items-center gap-3">Global Network</h3>
                          <p className="font-aztec-body text-sm text-white/60 leading-relaxed max-w-sm">
                              Whale Alert is the premier terminal for tracking oceanic dark pool movements. We decode the hidden flow of trillions of dollars across public ledgers, converting raw hexadecimal data into actionable, high-frequency kinetic intelligence.
                          </p>
                      </div>
                  </div>

                  {/* Card 2: System Architecture (Technical structure) */}
                  <div className="group relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-black border border-white/5 hover:border-[var(--aztec-chartreuse)]/30 transition-all duration-700">
                      <Image src="/models/update/Aztec Image_03.jpg" alt="System Architecture" fill className="object-cover opacity-50 grayscale group-hover:scale-105 transition-transform duration-[2s]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      <div className="absolute inset-0 p-10 flex flex-col justify-end">
                          <h3 className="font-aztec-h3 text-3xl text-white mb-4 flex items-center gap-3">Core Architecture</h3>
                          <p className="font-aztec-body text-sm text-white/60 leading-relaxed max-w-sm">
                              Built on a proprietary triple-stack infrastructure. Our execution nodes synchronize directly with sovereign RPC endpoints, bypassing bloated middleware to deliver sub-millisecond settlement visualization across all Layer-1 and Layer-2 topologies.
                          </p>
                      </div>
                  </div>

                  {/* Card 3: Scalability (Performance and throughput) */}
                  <div className="group relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-black border border-white/5 hover:border-[var(--aztec-aqua)]/30 transition-all duration-700">
                      <Image src="/models/update/Aztec Image_06.jpg" alt="Scalability" fill className="object-cover opacity-50 grayscale mix-blend-screen group-hover:scale-105 transition-transform duration-[2s]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      <div className="absolute inset-0 p-10 flex flex-col justify-end">
                          <h3 className="font-aztec-h3 text-3xl text-white mb-4 flex items-center gap-3">Scalable Throughput</h3>
                          <p className="font-aztec-body text-sm text-white/60 leading-relaxed max-w-sm">
                              The system dynamically shards incoming data feeds across isolated processing clusters. Whether parsing ten transactions per second or ten thousand during a black swan event, the sovereign dashboard maintains an unyielding 120Hz refresh rate.
                          </p>
                      </div>
                  </div>

                  {/* Card 4: Global Security (Sovereign Privacy) */}
                  <div className="group relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-black border border-white/5 hover:border-[var(--aztec-parchment)]/30 transition-all duration-700">
                      <Image src="/models/update/Aztec Image_12.jpg" alt="Sovereign Privacy Security" fill className="object-cover opacity-50 group-hover:scale-105 transition-transform duration-[2s]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      <div className="absolute inset-0 p-10 flex flex-col justify-end">
                          <h3 className="font-aztec-h3 text-3xl text-white mb-4 flex items-center gap-3">Data Privacy</h3>
                          <p className="font-aztec-body text-sm text-white/60 leading-relaxed max-w-sm">
                              Your identity remains yours. Whale Alert utilizes advanced Zero-Knowledge session proofs to sync your mobile device strictly to your terminal monitor. No centralized databases hold your unencrypted biometric wallet keys.
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      </section>


      {/* ── PHASE 3: APPLICATIONS SHOWCASE ── */}
      <section className="bg-[var(--aztec-parchment)] py-40 px-6 relative z-10 border-t border-[var(--aztec-ink)]/5 overflow-hidden">
        <div className="absolute inset-0 noise-bg opacity-[0.03] pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-24">
            <div>
              <div className="font-aztec-h2 text-[11px] text-[var(--aztec-orchid)] uppercase tracking-[0.6em] mb-6">
                Sovereign Applications
              </div>
              <h2 className="font-aztec-h1 text-5xl md:text-7xl text-[var(--aztec-ink)] uppercase tracking-tighter leading-[0.9]">
                Built For<br />Every<br /><span className="italic text-[var(--aztec-orchid)]">Use Case</span>
              </h2>
            </div>
            <p className="font-aztec-body text-lg text-[var(--aztec-ink)]/50 max-w-sm leading-relaxed">
              From sovereign personal vaults to trillion-dollar institutional compliance layers — the protocol adapts to your scale.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {DATA.applications.map((app, i) => {
              const Icon = app.icon;
              return (
                <motion.div
                  key={app.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  className="group relative rounded-[2rem] overflow-hidden bg-[var(--aztec-ink)]/[0.03] border border-[var(--aztec-ink)]/5 hover:border-[var(--aztec-orchid)]/20 hover:bg-[var(--aztec-orchid)]/[0.03] transition-all duration-500 p-8 flex flex-col gap-6"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[var(--aztec-ink)]/5 flex items-center justify-center group-hover:bg-[var(--aztec-orchid)]/10 transition-all duration-500">
                    <Icon size={22} className="text-[var(--aztec-ink)]/40 group-hover:text-[var(--aztec-orchid)] transition-colors duration-500" />
                  </div>
                  <div>
                    <h3 className="font-aztec-h3 text-lg text-[var(--aztec-ink)] font-black leading-tight mb-3">
                      {app.title}
                    </h3>
                    <p className="font-aztec-body text-xs text-[var(--aztec-ink)]/40 leading-relaxed">
                      {app.desc}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center gap-2 text-[9px] font-aztec-mono font-black uppercase tracking-[0.3em] text-[var(--aztec-orchid)] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span>Explore</span>
                    <ChevronRight size={10} />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Stats Bar */}
          <div className="mt-28 grid grid-cols-2 md:grid-cols-4 gap-1">
            {DATA.stats.map((s) => (
              <div
                key={s.val}
                className="p-10 border border-[var(--aztec-ink)]/5 first:rounded-l-[2rem] last:rounded-r-[2rem] flex flex-col gap-2 hover:bg-[var(--aztec-ink)]/[0.02] transition-all"
              >
                <div className="font-aztec-h1 text-4xl md:text-5xl text-[var(--aztec-ink)] tracking-tighter">{s.val}</div>
                <div className="font-aztec-h2 text-[10px] text-[var(--aztec-ink)]/60 uppercase tracking-[0.3em]">{s.label}</div>
                <div className="font-aztec-body text-xs text-[var(--aztec-ink)]/30">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

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

