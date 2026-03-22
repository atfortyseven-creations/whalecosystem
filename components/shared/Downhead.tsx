"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, Zap, Globe, Cpu } from 'lucide-react';

import Link from 'next/link';

export function Downhead() {
    const navItems = [
        { label: 'Privacy', href: '/privacy' },
        { label: 'Developers', href: '/developers' },
        { label: 'Terms', href: '/terms' },
        { label: 'Documentation', href: '/docs' },
    ];

    return (
        <footer className="w-full bg-[var(--aztec-parchment)] border-t border-[var(--aztec-ink)]/10 py-16 px-6 lg:px-20 relative overflow-hidden">
            <div className="absolute inset-0 noise-bg opacity-[0.05] pointer-events-none" />
            
            <div className="max-w-[1400px] mx-auto relative z-10">
                {/* Upper Footer: Logo & Subscription */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 mb-20">
                    <div className="flex flex-col gap-4">
                        <h2 className="font-aztec-serif text-5xl md:text-6xl font-black text-[var(--aztec-ink)] uppercase leading-none tracking-tighter">
                            Whale <br/><span className="italic text-[var(--aztec-orchid)]">Alert</span>
                        </h2>
                        <div className="font-aztec-mono text-[9px] uppercase tracking-[0.4em] text-[var(--aztec-ink)]/40 font-black">
                            Corporate Identity Layer
                        </div>
                    </div>

                    <div className="w-full lg:w-auto">
                        <p className="font-aztec-mono text-[10px] uppercase tracking-[0.3em] text-[var(--aztec-ink)]/60 mb-4 font-black">Receive Fleet Intelligence</p>
                        <div className="flex flex-col sm:flex-row gap-0 border border-[var(--aztec-ink)]/20 shadow-xl">
                            <input 
                                type="email" 
                                placeholder="ENTER CORPORATE EMAIL" 
                                className="bg-transparent px-6 py-4 outline-none font-aztec-mono text-[11px] tracking-widest text-[var(--aztec-ink)] min-w-[300px]"
                            />
                            <button className="bg-[var(--aztec-ink)] text-[var(--aztec-parchment)] px-10 py-4 font-aztec-mono text-[11px] font-black uppercase tracking-widest hover:bg-[var(--aztec-orchid)] transition-colors">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lower Footer: Nav & Systems */}
                <div className="pt-10 border-t border-[var(--aztec-ink)]/10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-8 md:gap-12 flex-wrap justify-center">
                        {navItems.map((item) => (
                            <Link 
                                key={item.label}
                                href={item.href}
                                className="text-[10px] font-aztec-mono text-[var(--aztec-ink)]/40 hover:text-[var(--aztec-ink)] uppercase tracking-[0.4em] transition-all duration-500 hover:tracking-[0.6em] font-black"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>


                </div>
            </div>
        </footer>
    );
}

