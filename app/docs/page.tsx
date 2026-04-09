"use client";

import React, { useState } from 'react';
import { BookOpen, Terminal, Database, ShieldCheck, Cpu, Globe, Search } from 'lucide-react';

export default function DocsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    
    return (
        <div 
            style={{ backgroundColor: "#020202", color: "#E0E0E0", minHeight: "100vh" }} 
            className="w-full overflow-x-hidden font-sans selection:bg-[#D4AF37]/30 selection:text-white"
        >
            <div className="w-full max-w-[1200px] mx-auto pt-32 pb-40 px-6 lg:px-12 flex flex-col items-start">
                
                {/* ── TOPOGRAPHY ── */}
                <div style={{ color: "#D4AF37" }} className="font-mono text-[10px] font-medium tracking-[0.4em] uppercase mb-8 opacity-80">
                    Architectural Treatise • Section D-1
                </div>
                
                <h1 
                    style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} 
                    className="text-5xl md:text-7xl font-light tracking-tight leading-[1.05] mb-6"
                >
                    Technical Specifications.
                </h1>
                
                <div className="flex items-center gap-6 mb-12">
                    <p style={{ color: "#545F73" }} className="font-mono text-sm uppercase tracking-widest m-0">
                        Version: Alpha Release 1.5.0
                    </p>
                    <a 
                        href="/SOVEREIGN_WHITEPAPER.md" 
                        download="Whale_Alert_Whitepaper.md"
                        className="bg-[#D4AF37] text-black font-mono text-xs font-bold uppercase tracking-wider py-2 px-6 rounded-md hover:bg-[#F2d36d] transition-colors"
                    >
                        Download PDF/MD Variant
                    </a>
                </div>

                {/* ── SEARCH BAR ── */}
                <div className="w-full max-w-2xl mb-24 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A94A6]" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search the sovereign archives..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0A0C0F] border border-[#ffffff10] rounded-xl py-4 pl-12 pr-4 text-[#F5F5F5] font-mono text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                        style={{ outline: "none", boxShadow: "none" }}
                    />
                    {searchQuery && (
                        <div className="absolute top-full mt-2 w-full bg-[#0A0C0F] border border-[#ffffff10] rounded-xl p-4 z-10 text-sm text-[#8A94A6] font-mono">
                            Press Enter to search for &quot;{searchQuery}&quot;...
                        </div>
                    )}
                </div>

                {/* ── MODULE CARDS ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-24">
                    <div style={{ backgroundColor: "rgba(10, 12, 15, 0.6)", border: "1px solid rgba(255, 255, 255, 0.04)" }} className="p-8 rounded-xl backdrop-blur-sm">
                        <Terminal style={{ color: "#D4AF37" }} size={24} strokeWidth={1.5} className="mb-6" />
                        <h3 style={{ color: "#EAEAEA" }} className="text-lg font-medium mb-2">Ingestion Layer</h3>
                        <p style={{ color: "#8A94A6" }} className="text-sm font-light leading-relaxed">
                            WebSockets bound to EVM RPC clusters, extracting blocks asynchronously.
                        </p>
                    </div>
                    <div style={{ backgroundColor: "rgba(10, 12, 15, 0.6)", border: "1px solid rgba(255, 255, 255, 0.04)" }} className="p-8 rounded-xl backdrop-blur-sm">
                        <Database style={{ color: "#D4AF37" }} size={24} strokeWidth={1.5} className="mb-6" />
                        <h3 style={{ color: "#EAEAEA" }} className="text-lg font-medium mb-2">State Engine</h3>
                        <p style={{ color: "#8A94A6" }} className="text-sm font-light leading-relaxed">
                            PostgreSQL coupled with Prisma ORM. Topologies persisted with zero latency.
                        </p>
                    </div>
                    <div style={{ backgroundColor: "rgba(10, 12, 15, 0.6)", border: "1px solid rgba(255, 255, 255, 0.04)" }} className="p-8 rounded-xl backdrop-blur-sm">
                        <ShieldCheck style={{ color: "#D4AF37" }} size={24} strokeWidth={1.5} className="mb-6" />
                        <h3 style={{ color: "#EAEAEA" }} className="text-lg font-medium mb-2">Authentication</h3>
                        <p style={{ color: "#8A94A6" }} className="text-sm font-light leading-relaxed">
                            Clerk sessions intertwined with Wagmi configurations for strict validation.
                        </p>
                    </div>
                </div>

                {/* ── CORE TEXT SECTIONS ── */}
                <div className="flex flex-col gap-20 w-full max-w-3xl">
                    <section className="flex flex-col md:flex-row gap-6 md:gap-12">
                        <div style={{ color: "rgba(212, 175, 55, 0.3)" }} className="font-mono text-3xl md:text-4xl font-medium shrink-0">
                            01.
                        </div>
                        <div>
                            <h2 style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-light mb-4">
                                Abstract Configuration
                            </h2>
                            <p style={{ color: "#8A94A6" }} className="text-base font-light leading-relaxed">
                                The Whale Alert Network is not a conventional application. It operates as an infinite coordinate canvas 
                                structured via Next.js and optimized through Framer Motion physics. State management transcends local buffers, 
                                securing absolute mathematical coherence of the user's intelligence topology.
                            </p>
                        </div>
                    </section>

                    <section className="flex flex-col md:flex-row gap-6 md:gap-12">
                        <div style={{ color: "rgba(212, 175, 55, 0.3)" }} className="font-mono text-3xl md:text-4xl font-medium shrink-0">
                            02.
                        </div>
                        <div>
                            <h2 style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-light mb-4">
                                Event Synthesis
                            </h2>
                            <p style={{ color: "#8A94A6" }} className="text-base font-light leading-relaxed mb-6">
                                Blockchain interactions contain immense stochastic noise. Our algorithm filters transactional artifacts through 
                                conditional heuristics (Z-score variations, liquidity pools drain signatures) allowing only empirically significant 
                                "Whale Events" to penetrate the visualization layer.
                            </p>
                            <div style={{ backgroundColor: "#000", border: "1px solid rgba(255, 255, 255, 0.1)" }} className="p-4 rounded-lg font-mono text-xs overflow-x-auto text-[#8A94A6]">
                                <code>
                                    <span style={{ color: "#a855f7" }}>import</span> {'{ BlockchainListener }'} <span style={{ color: "#a855f7" }}>from</span> <span style={{ color: "#4ade80" }}>'@/core/ingestion'</span>;<br/><br/>
                                    <span style={{ color: "#D4AF37" }}>const</span> filterNoise = (tx: Entity) =&gt; {'{'}<br/>
                                    &nbsp;&nbsp;<span style={{ color: "#D4AF37" }}>if</span> (tx.volume &lt; THRESHOLD) <span style={{ color: "#D4AF37" }}>return</span> <span style={{ color: "#4ade80" }}>false</span>;<br/>
                                    &nbsp;&nbsp;<span style={{ color: "#D4AF37" }}>return</span> verifySignatures(tx);<br/>
                                    {'};'}
                                </code>
                            </div>
                        </div>
                    </section>
                </div>

                {/* ── FOOTER MARK ── */}
                <div className="w-full flex flex-col items-center justify-center mt-32 pt-16 border-t" style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}>
                    <Globe style={{ color: "rgba(255, 255, 255, 0.05)" }} size={48} className="mb-6" />
                    <p style={{ color: "#545F73" }} className="font-mono text-xs uppercase tracking-[0.2em] font-medium text-center">
                        Whale Alert Protocol · Core Infrastructure
                    </p>
                </div>
            </div>
        </div>
    );
}
