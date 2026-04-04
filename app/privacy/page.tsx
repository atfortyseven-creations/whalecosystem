"use client";

import React from 'react';
import { ShieldAlert, Network, EyeOff, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
    return (
        <div 
            style={{ backgroundColor: "#020202", color: "#E0E0E0", minHeight: "100vh" }} 
            className="w-full overflow-x-hidden font-sans selection:bg-[#D4AF37]/30 selection:text-white"
        >
            <div className="w-full max-w-[1200px] mx-auto pt-32 pb-40 px-6 lg:px-12 flex flex-col items-start">
                
                {/* ── TOPOGRAPHY ── */}
                <div style={{ color: "#D4AF37" }} className="font-mono text-[10px] font-medium tracking-[0.4em] uppercase mb-8 opacity-80">
                    Confidentiality Protocol • Section P-1
                </div>
                
                <h1 
                    style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} 
                    className="text-5xl md:text-7xl font-light tracking-tight leading-[1.05] mb-6"
                >
                    Privacy Policy.
                </h1>
                
                <p style={{ color: "#545F73" }} className="font-mono text-sm mb-24 uppercase tracking-widest">
                    Last updated: Academic Cycle 2026
                </p>

                {/* ── CARDS ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-24">
                    <div style={{ backgroundColor: "rgba(10, 12, 15, 0.6)", border: "1px solid rgba(255, 255, 255, 0.04)" }} className="p-10 rounded-xl backdrop-blur-sm">
                        <EyeOff style={{ color: "#D4AF37" }} size={28} strokeWidth={1.5} className="mb-6" />
                        <h3 style={{ color: "#EAEAEA" }} className="text-xl font-medium mb-3">Absolute Obfuscation</h3>
                        <p style={{ color: "#8A94A6" }} className="text-sm font-light leading-relaxed">
                            Interactions with our terminal are shielded by Zero-Knowledge verifications, ensuring that observational trajectories remain unmapped.
                        </p>
                    </div>
                    <div style={{ backgroundColor: "rgba(10, 12, 15, 0.6)", border: "1px solid rgba(255, 255, 255, 0.04)" }} className="p-10 rounded-xl backdrop-blur-sm">
                        <ShieldAlert style={{ color: "#D4AF37" }} size={28} strokeWidth={1.5} className="mb-6" />
                        <h3 style={{ color: "#EAEAEA" }} className="text-xl font-medium mb-3">Ephemeral States</h3>
                        <p style={{ color: "#8A94A6" }} className="text-sm font-light leading-relaxed">
                            Web3 sessions are volatile by design. Whale Alert Network commits cache mechanisms strictly locally, maintaining infrastructure sterility.
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
                                Data Retention Models
                            </h2>
                            <p style={{ color: "#8A94A6" }} className="text-base font-light leading-relaxed">
                                The platform operates under a strict minimization principle. Wallet addresses, heuristic queries, and node placements 
                                within the terminal are utilized strictly to render the environment. The mathematical architecture inherently rejects 
                                longitudinal profiling of its operators.
                            </p>
                        </div>
                    </section>

                    <section className="flex flex-col md:flex-row gap-6 md:gap-12">
                        <div style={{ color: "rgba(212, 175, 55, 0.3)" }} className="font-mono text-3xl md:text-4xl font-medium shrink-0">
                            02.
                        </div>
                        <div>
                            <h2 style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-light mb-4">
                                Network Telemetry
                            </h2>
                            <p style={{ color: "#8A94A6" }} className="text-base font-light leading-relaxed mb-6">
                                We gather aggregate, non-identifiable telemetry to evaluate computational loads and packet deviations. 
                                This purely mathematical feedback loop assists in optimizing WebSocket velocity to achieve our 240Hz visual threshold.
                            </p>
                        </div>
                    </section>

                    <section className="flex flex-col md:flex-row gap-6 md:gap-12">
                        <div style={{ color: "rgba(212, 175, 55, 0.3)" }} className="font-mono text-3xl md:text-4xl font-medium shrink-0">
                            03.
                        </div>
                        <div>
                            <h2 style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-light mb-4">
                                Cryptographic Delegation
                            </h2>
                            <p style={{ color: "#8A94A6" }} className="text-base font-light leading-relaxed">
                                By utilizing Clerk and associated EVM signers, identity handling is deferred to mathematically secure frameworks external to our core infrastructure.
                                We do not, and logically cannot, decrypt private keys or circumvent local security envelopes.
                            </p>
                        </div>
                    </section>
                </div>

                {/* ── FOOTER MARK ── */}
                <div className="w-full flex flex-col items-center justify-center mt-32 pt-16 border-t" style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}>
                    <Globe style={{ color: "rgba(255, 255, 255, 0.05)" }} size={48} className="mb-6" />
                    <p style={{ color: "#545F73" }} className="font-mono text-xs uppercase tracking-[0.2em] font-medium text-center">
                        Whale Alert Protocol · Enclave Operations
                    </p>
                </div>
            </div>
        </div>
    );
}
