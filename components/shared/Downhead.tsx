"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, Zap, Globe, Cpu, Database, BookOpen, Lock } from 'lucide-react';
import Link from 'next/link';

export function Downhead() {
    const navItems = [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Technical Docs', href: '/docs' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Developers', href: '/developers' },
        { label: 'Infrastructure', href: '/infrastructure' },
        { label: 'Academic Support', href: '/support' },
    ];

    return (
        <footer style={{ backgroundColor: "#020202", borderTop: "1px solid rgba(255,255,255,0.05)" }} className="relative w-full py-24 px-6 lg:px-20 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
                 style={{ backgroundImage: "radial-gradient(#D4AF37 0.5px, transparent 0.5px)", backgroundSize: "24px 24px" }} />
            
            <div className="max-w-[1400px] mx-auto relative z-10">
                {/* Upper Footer: Academic Identity & Communications */}
                <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-24">
                    <div className="flex flex-col gap-6 max-w-md">
                        <div className="flex items-center gap-3">
                            <div style={{ color: "#D4AF37" }} className="p-2 border border-[#D4AF37]/20 bg-[#D4AF37]/5 rounded">
                                <Database size={20} strokeWidth={1.5} />
                            </div>
                            <h2 style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-light tracking-tight">
                                Whale Alert Network
                            </h2>
                        </div>
                        <p style={{ color: "#8A94A6" }} className="text-sm font-light leading-relaxed">
                            A decentralized protocol for the formal observation of institutional liquidity flows. 
                            Built upon the principles of cryptographic sovereignty and mathematical rigour.
                        </p>
                        <div style={{ color: "#D4AF37" }} className="font-mono text-[9px] uppercase tracking-[0.4em] opacity-60">
                            Institutional Record Archive · v1.0.4
                        </div>
                    </div>

                    <div className="w-full lg:w-auto">
                        <p style={{ color: "#F5F5F5" }} className="font-mono text-[10px] uppercase tracking-[0.3em] mb-6 opacity-80">
                            Academic Correspondence
                        </p>
                        <div className="flex flex-col sm:flex-row gap-0 group">
                            <input 
                                type="email" 
                                placeholder="ENTER INSTITUTIONAL EMAIL" 
                                style={{ border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.02)", color: "#E0E0E0" }}
                                className="px-6 py-4 outline-none font-mono text-[11px] tracking-widest min-w-[320px] focus:border-[#D4AF37]/50 transition-colors"
                            />
                            <button style={{ backgroundColor: "#EAEAEA", color: "#0A0A0A" }} 
                                    className="px-10 py-4 font-mono text-[11px] font-medium uppercase tracking-widest hover:bg-white transition-all active:scale-[0.98]">
                                SUBSCRIBE
                            </button>
                        </div>
                        <p style={{ color: "#545F73" }} className="text-[10px] mt-4 font-light italic">
                            Strictly for technical updates and protocol adjustments.
                        </p>
                    </div>
                </div>

                {/* Lower Footer: Navigation Matrix */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex items-center gap-x-8 gap-y-6 flex-wrap justify-center">
                        {navItems.map((item) => (
                            <Link 
                                key={item.label}
                                href={item.href}
                                style={{ color: "#8A94A6" }}
                                className="text-[10px] font-mono hover:text-[#D4AF37] uppercase tracking-[0.3em] transition-all duration-300"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-6 opacity-40">
                        <Shield size={14} style={{ color: "#D4AF37" }} />
                        <span style={{ color: "#8A94A6" }} className="text-[9px] font-mono tracking-widest">
                            SECURE ARCHITECTURE
                        </span>
                    </div>
                </div>
                
                <div className="mt-16 text-center">
                    <p style={{ color: "#545F73" }} className="text-[10px] font-light tracking-[0.1em]">
                        © 2026 Whale Alert Network · All technical designs reserved by the Institutional Council.
                    </p>
                </div>
            </div>
        </footer>
    );
}
