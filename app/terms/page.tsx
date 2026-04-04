"use client";

import React from 'react';
import { Gavel, Globe, Zap, AlertTriangle, Database, Shield, Lock, Cpu } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
    return (
        <div style={{ backgroundColor: "#020202", color: "#E0E0E0", minHeight: "100vh" }} className="relative w-full overflow-x-hidden font-sans selection:bg-[#D4AF37]/30 selection:text-white">
            {/* Ambient Background Structure */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" 
                 style={{ backgroundImage: "radial-gradient(#D4AF37 0.5px, transparent 0.5px)", backgroundSize: "32px 32px" }} />
            
            <div className="relative z-10 max-w-4xl mx-auto px-6 py-32 flex flex-col items-start">
                {/* Header Information */}
                <div style={{ borderLeft: "2px solid rgba(212, 175, 55, 0.3)" }} className="pl-8 mb-24">
                    <div style={{ color: "#D4AF37" }} className="font-mono text-[10px] uppercase tracking-[0.4em] mb-4 opacity-80">
                        Institutional Governance Document · L-1
                    </div>
                    <h1 style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} className="text-5xl md:text-6xl font-light tracking-tight leading-[1.1] mb-6">
                        Terms of Service.
                    </h1>
                    <p style={{ color: "#8A94A6" }} className="text-sm font-light italic max-w-md">
                        Last methodology update: April 4, 2026. This document defines the formal boundaries 
                        of interaction within the Whale Alert Network environment.
                    </p>
                </div>

                {/* Core Pillars of Interaction */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24 w-full">
                    <div style={{ backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)" }} className="p-8 rounded-xl backdrop-blur-sm">
                        <Cpu size={24} style={{ color: "#D4AF37" }} strokeWidth={1.5} className="mb-6" />
                        <h3 style={{ color: "#F5F5F5" }} className="text-xl font-medium mb-4">Infrastructural Integrity</h3>
                        <p style={{ color: "#8A94A6" }} className="text-sm font-light leading-relaxed">
                            Access to the Whale Alert Network implies a commitment to technical precision. 
                            The system is designed for low-latency observation and must not be subjected 
                            to unauthorized stress tests or scraping subroutines.
                        </p>
                    </div>
                    <div style={{ backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)" }} className="p-8 rounded-xl backdrop-blur-sm">
                        <Lock size={24} style={{ color: "#D4AF37" }} strokeWidth={1.5} className="mb-6" />
                        <h3 style={{ color: "#F5F5F5" }} className="text-xl font-medium mb-4">Sovereign Responsibility</h3>
                        <p style={{ color: "#8A94A6" }} className="text-sm font-light leading-relaxed">
                            The protocol operates under the principle of client-side sovereignty. 
                            Users are historically and mathematically responsible for the 
                            interactions initiated within their proprietary node topology.
                        </p>
                    </div>
                </div>

                {/* Detailed Sections */}
                <div className="space-y-20 w-full mb-32">
                    <section className="flex flex-col md:flex-row gap-8 items-start">
                        <div style={{ color: "#D4AF37" }} className="font-mono text-xs opacity-40 shrink-0 mt-1 md:w-20">01</div>
                        <div className="space-y-4">
                            <h2 style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-light">
                                Authorized Use and Compliance
                            </h2>
                            <p style={{ color: "#8A94A6" }} className="text-base leading-relaxed font-light">
                                Use of the Whale Alert Network Matrix is reserved for researchers and institutions 
                                with a valid academic license or verified cryptographic signature. Any attempt to 
                                bypass our session protocols or obfuscate the origin of data requests is strictly 
                                prohibited under the Institutional Council's guidelines.
                            </p>
                        </div>
                    </section>

                    <section className="flex flex-col md:flex-row gap-8 items-start">
                        <div style={{ color: "#D4AF37" }} className="font-mono text-xs opacity-40 shrink-0 mt-1 md:w-20">02</div>
                        <div className="space-y-4">
                            <h2 style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-light">
                                Limitation of Technical Liability
                            </h2>
                            <p style={{ color: "#8A94A6" }} className="text-base leading-relaxed font-light">
                                While our detect algoritms sustain a confirmed 98% accuracy in on-chain flow analysis, 
                                the Whale Alert Network provides these tools for formal observation only. We are not 
                                liable for financial outcomes derived from the interpretation of stochastic market deviations.
                            </p>
                            <div style={{ backgroundColor: "rgba(212, 175, 55, 0.05)", border: "1px solid rgba(212, 175, 55, 0.2)" }} className="p-6 rounded-lg flex items-start gap-4">
                                <AlertTriangle size={20} style={{ color: "#D4AF37" }} className="shrink-0 mt-1" />
                                <p style={{ color: "#D4AF37" }} className="text-xs font-light italic leading-relaxed">
                                    "Financial observation requires intellectual rigor. Data provided by this terminal 
                                    does not constitute institutional advice or formal recommendations."
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="flex flex-col md:flex-row gap-8 items-start">
                        <div style={{ color: "#D4AF37" }} className="font-mono text-xs opacity-40 shrink-0 mt-1 md:w-20">03</div>
                        <div className="space-y-4">
                            <h2 style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-light">
                                Intellectual Sovereignty
                            </h2>
                            <p style={{ color: "#8A94A6" }} className="text-base leading-relaxed font-light">
                                Every architectural component, from the Euclid Node Mappings to the 
                                240Hz Rendering Engine, constitutes the intellectual record of the 
                                Whale Alert Network Council. Reproduction of these methodologies 
                                without explicit cryptographic authorization is forbidden.
                            </p>
                        </div>
                    </section>
                </div>

                {/* Footer Transition */}
                <div className="w-full pt-16 border-t border-white/5 flex flex-col items-center text-center">
                    <Database size={24} style={{ color: "#D4AF37" }} strokeWidth={1} className="mb-8 opacity-40" />
                    <p style={{ color: "#545F73" }} className="font-mono text-[10px] uppercase tracking-[0.2em] mb-4">
                        End of Document · Protocol Integrity Maintained
                    </p>
                    <Link href="/" style={{ color: "#8A94A6" }} className="text-[11px] font-light hover:text-white transition-colors">
                        Return to Foundation
                    </Link>
                </div>
            </div>
        </div>
    );
}
