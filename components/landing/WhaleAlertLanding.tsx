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
          <div className="font-aztec-h2 text-[12px] uppercase tracking-[0.6em] text-[var(--aztec-ink)] opacity-40 mb-12">The Protocol of Sovereign Privacy</div>
          <h1 className="font-aztec-h1 text-[clamp(2.5rem,10vw,14rem)] leading-[0.85] text-[var(--aztec-ink)] mb-12 drop-shadow-sm">
            Introduction <br/> to <span className="italic">Aztec</span>.
          </h1>
          
          <p className="font-aztec-body text-xl md:text-3xl text-[var(--aztec-ink)]/60 max-w-4xl mx-auto leading-relaxed mb-16 px-4">
             Aztec’s technology provides programmable privacy for real-world use cases, ensuring your data remains your own while transacting on public blockchains.
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

      {/* ── PHASE 2: WHY AZTEC? (Technical Use-Cases) ── */}
      <section className="bg-[var(--aztec-ink)] py-48 px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row items-baseline justify-between mb-32 border-b border-white/5 pb-20">
                  <div className="max-w-3xl">
                      <div className="font-aztec-h2 text-[12px] text-[var(--aztec-chartreuse)] uppercase tracking-[0.6em] mb-12">Applications Ecosystem</div>
                      <h2 className="font-aztec-h1 text-8xl text-white mb-12">Why <span className="italic text-[var(--aztec-orchid)]">Aztec?</span></h2>
                      <p className="font-aztec-body text-2xl text-white/50 leading-relaxed">
                          Built for a wide range of applications: Aztec supports everything from DeFi to remittances with absolute cryptographic sovereignty.
                      </p>
                  </div>
                  <div className="mt-12 lg:mt-0 text-right hidden xl:block">
                      <div className="font-aztec-h1 text-9xl text-white/5">$27.6T</div>
                      <div className="font-aztec-h2 text-[10px] text-white/40 uppercase tracking-widest mt-2">Stablecoin volume in 2024</div>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {DATA.applications.map((app, i) => (
                      <div key={i} className="group relative aspect-[4/5] bg-[#111] overflow-hidden rounded-[2.5rem] p-10 flex flex-col justify-end border border-white/5 hover:border-[var(--aztec-orchid)]/50 transition-all duration-700 will-change-transform">
                          <div className="absolute inset-0 opacity-40 group-hover:opacity-80 transition-opacity duration-1000 grayscale group-hover:grayscale-0">
                              <Image src={app.img} alt={app.title} fill className="object-cover transition-transform duration-[2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110" />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-[var(--aztec-ink)] via-[var(--aztec-ink)]/60 to-transparent opacity-90" />
                          <div className="relative z-10 transform transition-transform duration-500 group-hover:-translate-y-4">
                              <div className="w-12 h-12 mb-6 text-[var(--aztec-chartreuse)] opacity-50 group-hover:opacity-100 transition-opacity">
                                <app.icon strokeWidth={1.5} size={32} />
                              </div>
                              <h3 className="font-aztec-h3 text-3xl text-[var(--aztec-parchment)] mb-4">{app.title}</h3>
                              <p className="font-aztec-body text-sm text-[var(--aztec-parchment)]/60 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{app.desc}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* ── PHASE 3: INSTITUTIONAL COMPLIANCE (System Visuals) ── */}
      <section className="py-48 px-6 bg-[var(--aztec-parchment)] relative overflow-hidden">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center relative z-10">
              <div className="relative aspect-square rounded-[4rem] overflow-hidden shadow-2xl border border-black/5 will-change-transform">
                   <Image src="/models/update/Aztec Image_12.jpg" alt="Institutional Privacy Infrastructure" fill className="object-cover" />
                   <div className="absolute inset-0 bg-[var(--aztec-ink)]/10 mix-blend-multiply" />
                   <div className="absolute bottom-12 left-12 right-12 p-8 glass-sovereign rounded-3xl backdrop-blur-md">
                        <div className="font-aztec-mono text-[var(--aztec-chartreuse)] text-[10px] mb-4">SOVEREIGN_AUDIT_PROTOCOL_V1</div>
                        <p className="font-aztec-body text-xs text-white/80 leading-relaxed">
                            Encrypted viewing keys allow for compliant auditing without exposing user data to the public network.
                        </p>
                   </div>
              </div>

              <div>
                  <div className="font-aztec-h2 text-[12px] text-[var(--aztec-orchid)] uppercase tracking-[0.5em] mb-12">Institutional Grade</div>
                  <h2 className="font-aztec-h1 text-8xl text-[var(--aztec-ink)] leading-[0.8] mb-12">
                      Sovereign <br/> <span className="italic">Compliance</span>.
                  </h2>
                  <div className="space-y-12">
                      <p className="font-aztec-body text-2xl text-[var(--aztec-ink)]/60 leading-relaxed">
                          Aztec enables privacy-preserving compliance for institutions and businesses transacting on public blockchains. No more adoption capping due to lack of privacy.
                      </p>
                      <div className="flex gap-16">
                          <div>
                              <div className="font-aztec-h1 text-6xl text-[var(--aztec-ink)]">24/7</div>
                              <div className="font-aztec-h2 text-[10px] uppercase tracking-widest text-[var(--aztec-ink)]/40 mt-2">Zero-Knowledge Audits</div>
                          </div>
                          <div>
                              <div className="font-aztec-h1 text-6xl text-[var(--aztec-ink)]">0%</div>
                              <div className="font-aztec-h2 text-[10px] uppercase tracking-widest text-[var(--aztec-ink)]/40 mt-2">Data Leakage Risk</div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* ── PHASE 4: THE ARCHITECTURAL EXPLAINER ── */}
      <section className="bg-[var(--aztec-ink)] py-48 px-6">
          <div className="max-w-6xl mx-auto flex flex-col items-center">
              <div className="font-aztec-h2 text-[12px] text-[var(--aztec-aqua)] uppercase tracking-[0.6em] mb-12">System Architecture</div>
              <h2 className="font-aztec-h1 text-6xl md:text-8xl text-white mb-24 text-center">Privacy Without <br/><span className="italic text-[var(--aztec-aqua)]">Compromise.</span></h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center mb-32">
                  <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10">
                      <Image src="/models/update/Aztec Image_03.jpg" alt="Noir Programming Model" fill className="object-cover opacity-60 scale-105" />
                      <div className="absolute inset-0 flex items-center justify-center">
                          <div className="p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl">
                             <h4 className="font-aztec-h3 text-xl text-white mb-2">Noir: The SDK</h4>
                             <p className="font-aztec-body text-xs text-white/60">Aztec's domain-specific language for writing private smart contracts.</p>
                          </div>
                      </div>
                  </div>
                  <div className="space-y-8">
                     <h3 className="font-aztec-h3 text-4xl text-white uppercase italic tracking-tighter">Programmable <br/> Encrypted State.</h3>
                     <p className="font-aztec-body text-xl text-white/40 leading-relaxed font-light">
                        Aztec abstracts complex ZK proofs into a simple execution environment where users interact with both encrypted user states and public execution environments fluidly.
                     </p>
                  </div>
              </div>
          </div>
      </section>

      {/* ── PHASE 5: THE DIAMOND RECAP ── */}
      <section className="relative py-64 px-6 overflow-hidden bg-[var(--aztec-parchment)]">
          <div className="max-w-5xl mx-auto text-center relative z-10">
              <div className="w-64 h-64 mx-auto mb-20 relative will-change-transform">
                  <Image src="/models/update/gradient-pink-diamond-balls-assortment (2).png" alt="Corporate Diamond Shield" fill className="object-contain animate-blob mix-blend-multiply" />
              </div>
              <h2 className="font-aztec-h1 text-7xl md:text-9xl text-[var(--aztec-ink)] uppercase leading-none mb-12">
                  Building the First <br/> <span className="italic text-[var(--aztec-orchid)]">Privacy</span> Network.
              </h2>
              <p className="font-aztec-body text-3xl text-[var(--aztec-ink)]/60 max-w-3xl mx-auto leading-relaxed mb-20 px-8">
                  Stablecoin transaction volume surpassed $27.6 trillion in 2024 – but adoption is capped without privacy. Aztec eliminates the cap.
              </p>
              <motion.button
                onClick={handleEnterArchive}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="px-24 py-10 bg-[var(--aztec-chartreuse)] text-[var(--aztec-ink)] font-aztec-h1 text-2xl uppercase tracking-[0.1em] rounded-full shadow-2xl hover:shadow-[var(--aztec-chartreuse)]/40 transition-all font-black"
              >
                Claim Sovereignty
              </motion.button>
          </div>
      </section>

      {/* ── FOOTER & LEGAL (The Ultimate Downhead) ── */}
      <footer className="bg-[var(--aztec-parchment)] text-[var(--aztec-ink)]/50 py-32 px-12 border-t border-[var(--aztec-ink)]/10">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-24 mb-32">
                <div className="col-span-1 md:col-span-2 space-y-8">
                    <div className="font-aztec-h1 text-6xl text-[var(--aztec-ink)] flex items-center gap-4">
                      <div className="w-14 h-14 relative">
                        <Image src="/models/update/gradient-pink-diamond-balls-assortment (2).png" alt="Logo" fill className="object-contain mix-blend-multiply" />
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
                    © 2024 WHALE ALERT CORP — ALL RIGHTS RESERVED
                </div>
                <div className="font-aztec-h1 text-4xl opacity-5 select-none tracking-tighter">AZTEC PROTOCOL</div>
            </div>
        </div>
      </footer>
    </div>
  );
}
