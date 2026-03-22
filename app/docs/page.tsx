"use client";

import React from 'react';
import { BookOpen, Key, Layers, Code2, Globe, Cpu, Zap, ChevronRight, Terminal, Shield, Network, Lock, Workflow, Activity, Fingerprint } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-[var(--aztec-ink)] text-[var(--aztec-parchment)] font-sans relative overflow-hidden">
            {/* Immersive Wallpaper Injection */}
            <div className="absolute inset-0 z-0">
                <Image 
                    src="/models/update/simon-lee-hbFd11O0nwc-unsplash.jpg" 
                    alt="Sovereign Architecture" 
                    fill 
                    className="object-cover opacity-[0.15] mix-blend-screen" 
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--aztec-ink)]/80 via-transparent to-[var(--aztec-ink)] pointer-events-none" />
            </div>

            <div className="max-w-[1400px] mx-auto grid lg:grid-cols-[300px,1fr] gap-12 lg:gap-20 pt-32 lg:pt-40 pb-20 lg:pb-32 px-4 md:px-6 lg:px-12 relative z-10">
                
                {/* Aztec Restructured Sidebar */}
                <aside className="hidden lg:block h-fit sticky top-40 text-[var(--aztec-parchment)]">
                    <div className="bg-[var(--aztec-parchment)]/5 backdrop-blur-xl border border-[var(--aztec-parchment)]/10 shadow-2xl p-8 relative">
                        {/* Decorative Corners */}
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[var(--aztec-chartreuse)] opacity-60" />
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[var(--aztec-chartreuse)] opacity-60" />

                        <div className="font-aztec-mono text-[10px] uppercase tracking-[0.4em] text-[var(--aztec-parchment)]/40 mb-8 border-b border-[var(--aztec-parchment)]/10 pb-4 flex items-center gap-3">
                            <BookOpen size={14} className="text-[var(--aztec-orchid)]" /> WHALE ALERT OVERVIEW
                        </div>

                        <div className="space-y-10">
                            <div className="space-y-4">
                                <h3 className="font-aztec-h2 text-sm font-black text-[var(--aztec-parchment)] uppercase tracking-widest">Foundational Topics</h3>
                                <nav className="flex flex-col gap-3 font-aztec-mono text-[11px] uppercase tracking-wider">
                                    <a href="#overview" className="text-[var(--aztec-orchid)] font-black flex items-center gap-2 hover:translate-x-1 transition-transform">
                                        <ChevronRight size={12} /> Getting Started
                                    </a>
                                    <a href="#devnet" className="text-[var(--aztec-parchment)]/50 hover:text-[var(--aztec-parchment)] transition-all flex items-center gap-2 hover:translate-x-1">
                                        <div className="w-1 h-1 bg-[var(--aztec-parchment)]/20" /> Setting up Devnet
                                    </a>
                                    <a href="#ai-tooling" className="text-[var(--aztec-parchment)]/50 hover:text-[var(--aztec-parchment)] transition-all flex items-center gap-2 hover:translate-x-1">
                                        <div className="w-1 h-1 bg-[var(--aztec-parchment)]/20" /> AI Forensic Tooling
                                    </a>
                                </nav>
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="font-aztec-h2 text-sm font-black text-[var(--aztec-parchment)] uppercase tracking-widest">Tutorials</h3>
                                <nav className="flex flex-col gap-3 font-aztec-mono text-[11px] uppercase tracking-wider">
                                    <a href="#local-network" className="text-[var(--aztec-parchment)]/50 hover:text-[var(--aztec-parchment)] transition-all flex items-center gap-2 hover:translate-x-1">
                                        <div className="w-1 h-1 bg-[var(--aztec-parchment)]/20" /> Sentinel on Local Network
                                    </a>
                                    <a href="#contracts" className="text-[var(--aztec-parchment)]/50 hover:text-[var(--aztec-parchment)] transition-all flex items-center gap-2 hover:translate-x-1">
                                        <div className="w-1 h-1 bg-[var(--aztec-parchment)]/20" /> Intelligence Scripts
                                    </a>
                                    <a href="#tracking-contract" className="text-[var(--aztec-parchment)]/50 hover:text-[var(--aztec-parchment)] transition-all flex items-center gap-2 hover:translate-x-1">
                                        <div className="w-1 h-1 bg-[var(--aztec-parchment)]/20" /> Write a Tracking Module
                                    </a>
                                    <a href="#private-alerts" className="text-[var(--aztec-parchment)]/50 hover:text-[var(--aztec-parchment)] transition-all flex items-center gap-2 hover:translate-x-1">
                                        <div className="w-1 h-1 bg-[var(--aztec-parchment)]/20" /> Private Alert Subscriptions
                                    </a>
                                </nav>
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="font-aztec-h2 text-sm font-black text-[var(--aztec-parchment)] uppercase tracking-widest">Applications Ecosystem</h3>
                                <nav className="flex flex-col gap-3 font-aztec-mono text-[11px] uppercase tracking-wider">
                                    <a href="#ecosystem" className="text-[var(--aztec-parchment)]/50 hover:text-[var(--aztec-parchment)] transition-all flex items-center gap-2 hover:translate-x-1">
                                        <div className="w-1 h-1 bg-[var(--aztec-parchment)]/20" /> DeFi & Yield Assets
                                    </a>
                                    <a href="#compliance" className="text-[var(--aztec-parchment)]/50 hover:text-[var(--aztec-parchment)] transition-all flex items-center gap-2 hover:translate-x-1">
                                        <div className="w-1 h-1 bg-[var(--aztec-parchment)]/20" /> Forensic Compliance
                                    </a>
                                </nav>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="space-y-40">
                    
                    {/* Introduction Section */}
                    <section id="overview" className="relative glitch-hover">
                        <div className="font-aztec-mono text-[11px] text-[var(--aztec-chartreuse)] uppercase tracking-[0.5em] mb-6 flex items-center gap-4">
                            <div className="w-8 h-[1px] bg-[var(--aztec-chartreuse)]/40" />
                            WHALE ALERT CORP • CORE ENGINE
                        </div>
                        <h1 className="font-aztec-h1 text-[clamp(2.5rem,6vw,6rem)] font-black leading-[0.85] tracking-tight text-[var(--aztec-parchment)] mb-10 uppercase break-words hyphens-auto">
                            Introduction <br/> <span className="text-[var(--aztec-orchid)]">to Whale Alert.</span>
                        </h1>
                        <div className="space-y-8">
                            <p className="font-aztec-body text-2xl text-[var(--aztec-parchment)]/90 max-w-3xl leading-relaxed border-l-4 border-[var(--aztec-orchid)] pl-8 py-2 italic font-bold">
                                Whale Alert's typography reflects its uncompromising, institutional ethos. Real-time elite intelligence for on-chain use cases.
                            </p>
                            <p className="font-aztec-body text-xl text-[var(--aztec-parchment)]/70 max-w-3xl leading-relaxed">
                                The canonical guide to interfacing with our bespoke forensic engines. Extract deterministic transaction flows, perfectly reconstruct L1/L2 callstacks, trace dark-pool routing via automated MEV searchers, and pipe unadulterated intelligence directly to your proprietary institutional trading systems via our zero-copy, zero-latency WebSockets.
                            </p>
                        </div>
                        <div className="mt-12 flex gap-6">
                            <button className="px-8 py-4 bg-[var(--aztec-chartreuse)] text-[var(--aztec-ink)] font-aztec-mono font-black text-[11px] uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_30px_rgba(182,234,38,0.3)]">
                                Initialize Compliance
                            </button>
                            <button className="px-8 py-4 bg-transparent border border-[var(--aztec-parchment)]/20 text-[var(--aztec-parchment)] font-aztec-mono font-bold text-[11px] uppercase tracking-widest hover:bg-[var(--aztec-parchment)]/5 transition-all flex items-center gap-2">
                                Read Documentation <ChevronRight size={14} />
                            </button>
                        </div>
                    </section>

                    {/* Applications Ecosystem */}
                    <section id="ecosystem" className="space-y-16 border-t border-[var(--aztec-parchment)]/10 pt-20">
                        <div className="space-y-4">
                            <h2 className="font-aztec-h1 text-4xl lg:text-6xl font-black text-[var(--aztec-parchment)] uppercase tracking-tight">Applications Ecosystem</h2>
                            <h3 className="font-aztec-h2 text-xl lg:text-3xl text-[var(--aztec-orchid)] italic">Why Whale Alert?</h3>
                            <p className="font-aztec-body text-lg text-[var(--aztec-parchment)]/70 max-w-3xl leading-relaxed mt-4 border-l-2 border-[var(--aztec-parchment)]/10 pl-6">
                                Built for a wide range of applications: Whale Alert supports DeFi, remittances, payments, capital markets, identity management, and even zero-sum games like trading.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Card 1 */}
                            <div className="bg-[var(--aztec-ink)] border border-[var(--aztec-parchment)]/10 p-8 hover:border-[var(--aztec-chartreuse)]/30 transition-all group glitch-hover">
                                <Activity className="text-[var(--aztec-chartreuse)] mb-6 duration-500 group-hover:scale-110" size={32} />
                                <h4 className="font-aztec-h1 text-2xl text-[var(--aztec-parchment)] uppercase mb-3">DeFi & Yield Assets</h4>
                                <p className="font-aztec-body text-sm text-[var(--aztec-parchment)]/60">Private decentralized finance tracking with institutional-grade security.</p>
                            </div>
                            
                            {/* Card 2 */}
                            <div className="bg-[var(--aztec-ink)] border border-[var(--aztec-parchment)]/10 p-8 hover:border-[var(--aztec-orchid)]/30 transition-all group glitch-hover">
                                <Globe className="text-[var(--aztec-orchid)] mb-6 duration-500 group-hover:scale-110" size={32} />
                                <h4 className="font-aztec-h1 text-2xl text-[var(--aztec-parchment)] uppercase mb-3">Global Remittances</h4>
                                <p className="font-aztec-body text-sm text-[var(--aztec-parchment)]/60">Instant, private cross-border payments surveillance for everyone.</p>
                            </div>

                            {/* Card 3 */}
                            <div className="bg-[var(--aztec-ink)] border border-[var(--aztec-parchment)]/10 p-8 hover:border-[var(--aztec-chartreuse)]/30 transition-all group glitch-hover">
                                <div className="text-[var(--aztec-chartreuse)] mb-6 font-aztec-h1 text-4xl leading-none duration-500 group-hover:scale-110">$27.6T</div>
                                <h4 className="font-aztec-h1 text-2xl text-[var(--aztec-parchment)] uppercase mb-3">Stablecoin Volume</h4>
                                <p className="font-aztec-body text-sm text-[var(--aztec-parchment)]/60">Monitored throughout 2024 through our institutional data nodes.</p>
                            </div>

                             {/* Card 4 */}
                            <div className="bg-[var(--aztec-ink)] border border-[var(--aztec-parchment)]/10 p-8 hover:border-[var(--aztec-orchid)]/30 transition-all group glitch-hover">
                                <Network className="text-[var(--aztec-orchid)] mb-6 duration-500 group-hover:scale-110" size={32} />
                                <h4 className="font-aztec-h1 text-2xl text-[var(--aztec-parchment)] uppercase mb-3">Capital Markets</h4>
                                <p className="font-aztec-body text-sm text-[var(--aztec-parchment)]/60">Tokenized real-world assets tracked with privacy-preserving compliance.</p>
                            </div>

                             {/* Card 5 */}
                            <div className="bg-[var(--aztec-ink)] border border-[var(--aztec-parchment)]/10 p-8 hover:border-[var(--aztec-chartreuse)]/30 transition-all group glitch-hover">
                                <Fingerprint className="text-[var(--aztec-chartreuse)] mb-6 duration-500 group-hover:scale-110" size={32} />
                                <h4 className="font-aztec-h1 text-2xl text-[var(--aztec-parchment)] uppercase mb-3">Identity Mgmt</h4>
                                <p className="font-aztec-body text-sm text-[var(--aztec-parchment)]/60">Verifiable, private identity tracking for sovereign digital beings.</p>
                            </div>

                            {/* Card 6 */}
                            <div className="bg-[var(--aztec-ink)] border border-[var(--aztec-parchment)]/10 p-8 hover:border-[var(--aztec-orchid)]/30 transition-all group glitch-hover">
                                <Cpu className="text-[var(--aztec-orchid)] mb-6 duration-500 group-hover:scale-110" size={32} />
                                <h4 className="font-aztec-h1 text-2xl text-[var(--aztec-parchment)] uppercase mb-3">Verifiable AI/ML</h4>
                                <p className="font-aztec-body text-sm text-[var(--aztec-parchment)]/60">Encrypted machine learning models enforcing forensic transparency on public blockchains.</p>
                            </div>
                        </div>
                    </section>

                    {/* Institutional Compliance Section */}
                    <section id="compliance" className="space-y-12 border-t border-[var(--aztec-parchment)]/10 pt-20">
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-8">
                            <div className="flex items-center gap-6">
                                <div className="p-5 bg-[var(--aztec-ink)] border border-[var(--aztec-parchment)]/20 text-[var(--aztec-parchment)] shrink-0 shadow-lg">
                                    <Shield size={40} className="text-[var(--aztec-chartreuse)]" />
                                </div>
                                <div>
                                    <h2 className="font-aztec-h1 text-4xl lg:text-6xl font-black text-[var(--aztec-parchment)] uppercase tracking-tight leading-[0.9]">
                                        Institutional Grade <br/> <span className="text-[var(--aztec-orchid)] italic">Sovereign Compliance.</span>
                                    </h2>
                                    <div className="font-aztec-mono text-[10px] text-[var(--aztec-parchment)]/40 uppercase tracking-[0.4em] mt-4">INSTITUTIONAL FORENSIC COMPLIANCE</div>
                                </div>
                            </div>
                        </div>

                        <p className="font-aztec-body text-xl text-[var(--aztec-parchment)]/80 leading-relaxed max-w-4xl border-l-[3px] border-[var(--aztec-chartreuse)] pl-8">
                            Whale Alert enables privacy-preserving compliance for institutions and businesses transacting on public blockchains. No more adoption capping due to lack of privacy documentation or forensic exposure.
                        </p>

                        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mt-8">
                            <div className="flex items-center gap-6 p-6 border border-[var(--aztec-parchment)]/10 bg-[var(--aztec-ink)]/50 glitch-hover">
                                <div className="text-4xl font-aztec-h1 font-black text-[var(--aztec-chartreuse)]">24/7</div>
                                <div className="font-aztec-mono text-[11px] font-bold uppercase tracking-widest text-[var(--aztec-parchment)]">Zero-Knowledge Audits</div>
                            </div>
                            <div className="flex items-center gap-6 p-6 border border-[var(--aztec-parchment)]/10 bg-[var(--aztec-ink)]/50 glitch-hover">
                                <div className="text-4xl font-aztec-h1 font-black text-[var(--aztec-orchid)]">0%</div>
                                <div className="font-aztec-mono text-[11px] font-bold uppercase tracking-widest text-[var(--aztec-parchment)]">Data Leakage Risk</div>
                            </div>
                        </div>
                    </section>
                    
                    {/* Contract Tutorial Example adapted */}
                    <section id="tracking-contract" className="space-y-12 border-t border-[var(--aztec-parchment)]/10 pt-20">
                         <div className="flex items-center gap-6 mb-8">
                            <div className="p-4 bg-[var(--aztec-ink)] border border-[var(--aztec-parchment)]/20 text-[var(--aztec-parchment)] shrink-0">
                                <Terminal size={32} />
                            </div>
                            <div>
                                <h2 className="font-aztec-h1 text-3xl lg:text-5xl font-black text-[var(--aztec-parchment)] uppercase tracking-tight">Verify AI-Driven Proofs</h2>
                                <div className="font-aztec-mono text-[10px] text-[var(--aztec-parchment)]/30 uppercase tracking-[0.4em] mt-2">WHALE ALERT CONTRACTS</div>
                            </div>
                        </div>
                        
                        <p className="font-aztec-body text-lg text-[var(--aztec-parchment)]/80 leading-relaxed max-w-3xl">
                            In this guide, we will create our first sovereign smart contract integration. We will build a simple private listener, where you can keep your own encrypted analytics - so no one knows what liquidity ID you are tracing or when you execute! This contract will get you started with the basic setup and syntax of the Whale API.
                        </p>

                        <div className="space-y-6 max-w-4xl">
                            <h4 className="font-aztec-mono text-[10px] font-black uppercase tracking-[0.3em] text-[var(--aztec-chartreuse)]">1. Initialize Compliance</h4>
                            <div className="border border-[var(--aztec-parchment)]/10 bg-[var(--aztec-ink)] relative h-[250px] flex flex-col shadow-2xl glitch-hover">
                                <div className="bg-[var(--aztec-ink)] px-6 py-3 border-b border-[var(--aztec-parchment)]/10 flex items-center justify-between shrink-0">
                                    <span className="text-[10px] font-aztec-mono uppercase tracking-widest text-[var(--aztec-parchment)]/40">TypeScript / Whale.js</span>
                                    <Code2 size={14} className="text-[var(--aztec-parchment)]/20" />
                                </div>
                                <pre
                                    className="p-6 lg:p-8 text-[11px] lg:text-[13px] font-mono text-[var(--aztec-parchment)]/80 leading-relaxed overflow-x-auto flex-1 custom-scrollbar"
                                    dangerouslySetInnerHTML={{ __html: [
                                        `<span style="color:var(--aztec-orchid)">import</span> { WhaleDelivery, SovereignLogger } <span style="color:var(--aztec-orchid)">from</span> '@whale-alert/sdk';`,
                                        ``,
                                        `<span style="color:var(--aztec-parchment);opacity:0.4">// Sovereign initializer decorator</span>`,
                                        `@initializer`,
                                        `@external("private")`,
                                        `<span style="color:var(--aztec-orchid)">export async function</span> initializeSentinel(headstart: <span style="color:var(--aztec-chartreuse)">u64</span>, owner: <span style="color:var(--aztec-chartreuse)">WhaleAddress</span>) {`,
                                        `    <span style="color:var(--aztec-parchment);opacity:0.4">// Delivers strict on-chain constrained notes</span>`,
                                        `    <span style="color:var(--aztec-orchid)">await</span> <span style="color:var(--aztec-chartreuse)">this</span>.storage.clusters.at(owner).add(headstart).deliver(`,
                                        `        WhaleDelivery.ONCHAIN_CONSTRAINED,`,
                                        `    );`,
                                        `}`,
                                    ].join('\n') }}
                                />
                            </div>
                        </div>
                    </section>

                </main>
            </div>
            
             <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(182,234,38,0.5); }
            `}</style>
        </div>
    );
}
