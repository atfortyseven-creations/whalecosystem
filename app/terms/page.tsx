"use client";

import React from 'react';
import { Gavel, Globe, Zap, AlertTriangle, Scale } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TermsPage() {
    return (
        <div 
            style={{ backgroundColor: "#020202", color: "#E0E0E0", minHeight: "100vh" }} 
            className="w-full overflow-x-hidden font-sans selection:bg-[#D4AF37]/30 selection:text-white"
        >
            <div className="w-full max-w-[1200px] mx-auto pt-32 pb-40 px-6 lg:px-12 flex flex-col items-start">
                
                {/* ── TOPOGRAPHY ── */}
                <div style={{ color: "#D4AF37" }} className="font-mono text-[10px] font-medium tracking-[0.4em] uppercase mb-8 opacity-80">
                    Legal Agreement • Section L-1
                </div>
                
                <h1 
                    style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} 
                    className="text-5xl md:text-7xl font-light tracking-tight leading-[1.05] mb-6"
                >
                    Terms of Service.
                </h1>
                
                <p style={{ color: "#545F73" }} className="font-mono text-sm mb-24 uppercase tracking-widest">
                    Last updated: Academic Cycle 2026
                </p>

                {/* ── CARDS ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-24">
                    <div style={{ backgroundColor: "rgba(10, 12, 15, 0.6)", border: "1px solid rgba(255, 255, 255, 0.04)" }} className="p-10 rounded-xl backdrop-blur-sm">
                        <Zap style={{ color: "#D4AF37" }} size={28} strokeWidth={1.5} className="mb-6" />
                        <h3 style={{ color: "#EAEAEA" }} className="text-xl font-medium mb-3">Extreme Fidelity</h3>
                        <p style={{ color: "#8A94A6" }} className="text-sm font-light leading-relaxed">
                            By utilizing Whale Alert Network, you are connecting to an institutional-grade infrastructure mathematically optimized for minimal latency.
                        </p>
                    </div>
                    <div style={{ backgroundColor: "rgba(10, 12, 15, 0.6)", border: "1px solid rgba(255, 255, 255, 0.04)" }} className="p-10 rounded-xl backdrop-blur-sm">
                        <Scale style={{ color: "#D4AF37" }} size={28} strokeWidth={1.5} className="mb-6" />
                        <h3 style={{ color: "#EAEAEA" }} className="text-xl font-medium mb-3">Ontological Sovereignty</h3>
                        <p style={{ color: "#8A94A6" }} className="text-sm font-light leading-relaxed">
                            Our platform operates strictly under principles of cryptographic decentralization. You assume absolute responsibility for your interactions.
                        </p>
                    </div>
                </div>

                {/* ── SECTIONS ── */}
                <div className="flex flex-col gap-20 w-full max-w-3xl">
                    <section className="flex flex-col md:flex-row gap-6 md:gap-12">
                        <div style={{ color: "rgba(212, 175, 55, 0.3)" }} className="font-mono text-3xl md:text-4xl font-medium shrink-0">
                            01.
                        </div>
                        <div>
                            <h2 style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-light mb-4">
                                Method of Extraction
                            </h2>
                            <p style={{ color: "#8A94A6" }} className="text-base font-light leading-relaxed">
                                Access to the Whale Alert Network matrix and its intelligence APIs is subject exclusively to valid subscription parameters. 
                                Unwarranted exploitation, such as asynchronous scraping or heuristic manipulation of the foundational data structure, 
                                will instantly result in cryptographic banishment from our nodes.
                            </p>
                        </div>
                    </section>

                    <section className="flex flex-col md:flex-row gap-6 md:gap-12">
                        <div style={{ color: "rgba(212, 175, 55, 0.3)" }} className="font-mono text-3xl md:text-4xl font-medium shrink-0">
                            02.
                        </div>
                        <div>
                            <h2 style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-light mb-4">
                                Limitation of Liability
                            </h2>
                            <p style={{ color: "#8A94A6" }} className="text-base font-light leading-relaxed mb-8">
                                Whale Alert Network does not act as a fiduciary structure. We isolate noise and detect on-chain movements with profound accuracy, 
                                yet the broader financial market remains an inherently chaotic entity. Consequently, we disclaim any responsibility for capital deployment.
                            </p>
                            
                            <div style={{ backgroundColor: "rgba(212, 175, 55, 0.05)", border: "1px solid rgba(212, 175, 55, 0.2)" }} className="p-6 rounded-lg flex items-start gap-4">
                                <AlertTriangle style={{ color: "#D4AF37" }} size={20} className="shrink-0 mt-0.5" />
                                <p style={{ color: "#E0E0E0" }} className="text-sm font-light italic">
                                    "Interaction with crypto-financial structures implies an acknowledgment of absolute risk. This infrastructure serves strictly as an analytical apparatus, not as a prescription for financial engagement."
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="flex flex-col md:flex-row gap-6 md:gap-12">
                        <div style={{ color: "rgba(212, 175, 55, 0.3)" }} className="font-mono text-3xl md:text-4xl font-medium shrink-0">
                            03.
                        </div>
                        <div>
                            <h2 style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-light mb-4">
                                Intellectual Architecture
                            </h2>
                            <p style={{ color: "#8A94A6" }} className="text-base font-light leading-relaxed">
                                The structural engineering, specific mathematical models, and the visual topology presented within the Sovereign Interface 
                                remain the exclusive property of the Whale Alert Protocol. Reverse-engineering of our classification engine constitutes a violation of these terms.
                            </p>
                        </div>
                    </section>
                </div>

                {/* ── FOOTER MARK ── */}
                <div className="w-full flex flex-col items-center justify-center mt-32 pt-16 border-t" style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}>
                    <Globe style={{ color: "rgba(255, 255, 255, 0.05)" }} size={48} className="mb-6" />
                    <p style={{ color: "#545F73" }} className="font-mono text-xs uppercase tracking-[0.2em] font-medium text-center">
                        Whale Alert Protocol · Compendium L-1
                    </p>
                </div>
            </div>
        </div>
    );
}
