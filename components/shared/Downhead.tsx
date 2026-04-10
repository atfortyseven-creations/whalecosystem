"use client";

import React from 'react';
import Link from 'next/link';

export function Downhead() {
    const navItems = [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Technical Docs', href: '/docs' },
        { label: 'Terms of Service', href: '/terms' },
    ];

    return (
        <footer 
            style={{ 
                backgroundColor: "#020202", 
                borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                color: "#E0E0E0"
            }} 
            className="w-full py-16 px-6 lg:px-20 relative overflow-hidden font-sans selection:bg-[#D4AF37]/30 selection:text-white wave-surface-strong"
        >
            <div className="max-w-[1400px] mx-auto relative z-10">
                {/* Upper Footer: Logo & Subscription */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 mb-20">
                    <div className="flex flex-col gap-4">
                        <h2 
                            style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} 
                            className="text-4xl md:text-5xl font-light leading-none tracking-tight"
                        >
                            Whale Alert Network<span style={{ color: "#D4AF37" }}>.</span>
                        </h2>
                        <div style={{ color: "#8A94A6" }} className="font-mono text-[10px] uppercase tracking-[0.3em] font-medium opacity-80">
                            Institutional Terminal Layer
                        </div>
                    </div>

                    <div className="w-full lg:w-auto">
                        <p style={{ color: "#8A94A6" }} className="font-mono text-[9px] uppercase tracking-[0.25em] mb-4 font-medium opacity-80">
                            Establish Academic Correspondence
                        </p>
                        <div style={{ border: "1px solid rgba(255, 255, 255, 0.08)", backgroundColor: "rgba(10, 12, 15, 0.6)" }} className="flex flex-col sm:flex-row gap-0 rounded overflow-hidden">
                            <input 
                                type="email" 
                                placeholder="ENTER SECURE EMAIL" 
                                style={{ color: "#E0E0E0" }}
                                className="bg-transparent px-6 py-4 outline-none font-mono text-[11px] tracking-widest min-w-[300px] placeholder:text-[#545F73]"
                            />
                            <button 
                                style={{ backgroundColor: "#EAEAEA", color: "#0A0A0A" }}
                                className="px-10 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] transition-colors hover:bg-white"
                            >
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lower Footer: Nav & Systems */}
                <div 
                    style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)" }} 
                    className="pt-10 flex flex-col md:flex-row justify-between items-center gap-8"
                >
                    <div className="flex items-center gap-8 md:gap-12 flex-wrap justify-center">
                        {navItems.map((item) => (
                            <Link 
                                key={item.label}
                                href={item.href}
                                style={{ color: "#8A94A6" }}
                                className="text-[10px] font-mono uppercase tracking-[0.3em] transition-colors hover:text-[#D4AF37] font-medium"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                    
                    <div style={{ color: "#545F73" }} className="font-mono text-[9px] uppercase tracking-[0.2em]">
                        © 2026 Whale Alert Network. Pure Mathematics.
                    </div>
                </div>
            </div>
        </footer>
    );
}
