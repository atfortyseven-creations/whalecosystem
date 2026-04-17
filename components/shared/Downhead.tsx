"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Downhead() {
    const navItems = [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Technical Docs', href: '/docs' },
        { label: 'Terms of Service', href: '/terms' },
    ];

    return (
        <footer className="w-full relative overflow-hidden font-sans selection:bg-[#D4AF37]/30 selection:text-white">

            {/* ── WAVE IMAGE — full-bleed, behind all content ── */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/olas-hokusai-4k.png"
                    alt="Wave pattern — Hokusai"
                    fill
                    priority={false}
                    quality={85}
                    className="object-cover object-center"
                    sizes="100vw"
                />
                {/* Deep overlay so text remains legible over the wave */}
                <div className="absolute inset-0 bg-[#020202]/82" />
            </div>

            {/* ── CONTENT ── */}
            <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-20 pt-20 pb-16">

                {/* Upper: Logo + Subscription */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-16">
                    <div className="flex flex-col gap-3">
                        <h2
                            className="text-4xl md:text-5xl font-light leading-none tracking-tight"
                            style={{ color: '#F5F5F5', fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                            Whale Alert Network<span style={{ color: '#D4AF37' }}>.</span>
                        </h2>
                        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#8A94A6]/70">
                            Institutional Terminal Layer
                        </p>
                    </div>

                    <div className="w-full lg:w-auto">
                        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#8A94A6]/60 mb-3">
                            Establish Academic Correspondence
                        </p>
                        <div
                            className="flex flex-col sm:flex-row overflow-hidden rounded"
                            style={{ border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(5,5,5,0.7)' }}
                        >
                            <input
                                type="email"
                                placeholder="ENTER SECURE EMAIL"
                                className="bg-transparent px-5 py-3.5 outline-none font-mono text-[11px] tracking-widest min-w-[280px] text-[#E0E0E0] placeholder:text-[#545F73]"
                            />
                            <button
                                className="px-8 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] transition-colors hover:bg-white"
                                style={{ backgroundColor: '#EAEAEA', color: '#0A0A0A' }}
                            >
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lower: Nav + Copyright */}
                <div
                    className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                >
                    <div className="flex items-center gap-10 flex-wrap justify-center">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="text-[10px] font-mono uppercase tracking-[0.3em] font-medium transition-colors hover:text-[#D4AF37]"
                                style={{ color: '#8A94A6' }}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: '#545F73' }}>
                        © 2026 Whale Alert Network. Pure Mathematics.
                    </p>
                </div>
            </div>
        </footer>
    );
}
