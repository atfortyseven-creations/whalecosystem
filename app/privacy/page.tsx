"use client";

import React from 'react';
import { Shield, Eye, Lock, Globe, Database, Cpu, Network, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div style={{ backgroundColor: "#020202", color: "#E0E0E0", minHeight: "100vh" }} className="relative w-full overflow-x-hidden font-sans selection:bg-[#D4AF37]/30 selection:text-white">
            {/* Ambient Ambient Grid Structure */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" 
                 style={{ backgroundImage: "radial-gradient(#D4AF37 0.5px, transparent 0.5px)", backgroundSize: "32px 32px" }} />
            
            <div className="relative z-10 max-w-4xl mx-auto px-6 py-32 flex flex-col items-start">
                {/* Header Information */}
                <div style={{ borderLeft: "2px solid rgba(212, 175, 55, 0.3)" }} className="pl-8 mb-24">
                    <div style={{ color: "#D4AF37" }} className="font-mono text-[10px] uppercase tracking-[0.4em] mb-4 opacity-80">
                        Institutional Privacy Protocol · P-12
                    </div>
                    <h1 style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} className="text-5xl md:text-6xl font-light tracking-tight leading-[1.1] mb-6">
                        Privacy Policy.
                    </h1>
                    <p style={{ color: "#8A94A6" }} className="text-sm font-light italic max-w-md">
                        Last methodology update: April 4, 2026. This document outlines the cryptographic 
                        shield mechanisms employed by the Whale Alert Network.
                    </p>
                </div>

                {/* Core Pillars of Sovereignty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24 w-full">
                    <div style={{ backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)" }} className="p-8 rounded-xl backdrop-blur-sm">
                        <Shield size={24} style={{ color: "#D4AF37" }} strokeWidth={1.5} className="mb-6" />
                        <h3 style={{ color: "#F5F5F5" }} className="text-xl font-medium mb-4">Zero-Trust Ontology</h3>
                        <p style={{ color: "#8A94A6" }} className="text-sm font-light leading-relaxed">
                            Every data vector within the network is treated with the assumption of 
                            compromised boundaries. All session logic is maintained via 
                            cryptographically verified signatures, ensuring no unauthenticated state leaks.
                        </p>
                    </div>
                    <div style={{ backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)" }} className="p-8 rounded-xl backdrop-blur-sm">
                        <Cpu size={24} style={{ color: "#D4AF37" }} strokeWidth={1.5} className="mb-6" />
                        <h3 style={{ color: "#F5F5F5" }} className="text-xl font-medium mb-4">E2EE Data Persistence</h3>
                        <p style={{ color: "#8A94A6" }} className="text-sm font-light leading-relaxed">
                            Personal node topologies and portfolio mappings are encrypted 
                            at the client edge. Our servers store only opaque artifacts, 
                            maintaining absolute isolation between your identity and your data.
                        </p>
                    </div>
                </div>

                {/* Detailed Sections */}
                <div className="space-y-20 w-full mb-32">
                    <section className="flex flex-col md:flex-row gap-8 items-start">
                        <div style={{ color: "#D4AF37" }} className="font-mono text-xs opacity-40 shrink-0 mt-1 md:w-20">01</div>
                        <div className="space-y-4">
                            <h2 style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-light">
                                Identification and Credentials
                            </h2>
                            <p style={{ color: "#8A94A6" }} className="text-base leading-relaxed font-light">
                                We utilize secure OIDC protocols (via Clerk) for identity verification. 
                                This mechanism allows for persistent academic sessions without 
                                storing plain-text credentials locally. Your social or email identity 
                                is decoupled from the cryptographic activity of the matrix.
                            </p>
                        </div>
                    </section>

                    <section className="flex flex-col md:flex-row gap-8 items-start">
                        <div style={{ color: "#D4AF37" }} className="font-mono text-xs opacity-40 shrink-0 mt-1 md:w-20">02</div>
                        <div className="space-y-4">
                            <h2 style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-light">
                                On-Chain Data Processing
                            </h2>
                            <p style={{ color: "#8A94A6" }} className="text-base leading-relaxed font-light">
                                The Whale Alert Network ingests raw block data directly from 
                                institutional RPC nodes. This process involves no secondary 
                                storage of your IP address or telemetry. Every request is 
                                routed through an anonymization layer to preserve your 
                                network-level sovereignty.
                            </p>
                            <div style={{ backgroundColor: "rgba(212, 175, 55, 0.05)", border: "1px solid rgba(212, 175, 55, 0.2)" }} className="p-6 rounded-lg flex items-start gap-4">
                                <CheckCircle size={20} style={{ color: "#D4AF37" }} className="shrink-0 mt-1" />
                                <p style={{ color: "#D4AF37" }} className="text-xs font-light italic leading-relaxed">
                                    "We provide the tools for insight, not the pathways for surveillance. 
                                    Your digital footprint is your proprietary property."
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="flex flex-col md:flex-row gap-8 items-start">
                        <div style={{ color: "#D4AF37" }} className="font-mono text-xs opacity-40 shrink-0 mt-1 md:w-20">03</div>
                        <div className="space-y-4">
                            <h2 style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-light">
                                Third-Party Integrations
                            </h2>
                            <p style={{ color: "#8A94A6" }} className="text-base leading-relaxed font-light">
                                When interacting with external modules (e.g., MoonPay, Transak, or Polymarket), 
                                the protocol utilizes isolated iframes or direct API tunnels. 
                                No authorization tokens from your session are shared with these 
                                third-party operators without your explicit algorithmic consent.
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
