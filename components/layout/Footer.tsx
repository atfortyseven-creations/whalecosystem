"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Twitter, Github, Lock, Database, ArrowUpRight, Globe, Code } from 'lucide-react';
import Link from 'next/link';

export const Footer = () => {
    // Custom immersive cursor bounded only to the footer domain
    const footerRef = useRef<HTMLElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    
    const cursorX = useSpring(0, { stiffness: 150, damping: 20 });
    const cursorY = useSpring(0, { stiffness: 150, damping: 20 });

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        if (!footerRef.current) return;
        const rect = footerRef.current.getBoundingClientRect();
        cursorX.set(e.clientX - rect.left);
        cursorY.set(e.clientY - rect.top);
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    return (
        <footer 
            ref={footerRef} 
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative z-10 bg-[#050505] border-t border-white/5 overflow-hidden text-white/80 pb-12 pt-28 font-sans"
        >
            {/* Immersive Cursor */}
            {!isMobile && (
                <motion.div
                    className="pointer-events-none absolute w-96 h-96 rounded-full mix-blend-screen z-0 opacity-0 transition-opacity duration-300"
                    style={{
                        x: cursorX,
                        y: cursorY,
                        translateX: '-50%',
                        translateY: '-50%',
                        opacity: isHovered ? 1 : 0,
                        background: 'radial-gradient(circle, rgba(147,51,234,0.15) 0%, rgba(147,51,234,0) 70%)'
                    }}
                />
            )}
            {!isMobile && (
                <motion.div
                    className="pointer-events-none absolute w-10 h-10 border border-white/20 rounded-full mix-blend-screen z-50 flex items-center justify-center transition-opacity duration-300"
                    style={{
                        x: cursorX,
                        y: cursorY,
                        translateX: '-50%',
                        translateY: '-50%',
                        opacity: isHovered ? 1 : 0,
                    }}
                    animate={{ scale: isHovered ? [1, 1.1, 1] : 1 }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <div className="w-1.5 h-1.5 bg-[var(--aztec-orchid)] rounded-full shadow-[0_0_10px_var(--aztec-orchid)]" />
                </motion.div>
            )}

            {/* Atmosphere Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-30" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--aztec-orchid)]/30 to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
                    
                    {/* Brand Identity */}
                    <div className="md:col-span-5 flex flex-col items-start">
                        <div className="flex items-center gap-3 mb-6 bg-white/5 border border-white/10 px-5 py-2.5 rounded-full backdrop-blur-md shadow-2xl">
                            <span className="text-xl pb-1">🐋</span>
                            <span className="text-[12px] font-aztec-mono font-black tracking-[0.25em] uppercase text-white">Whale Alert Network</span>
                        </div>
                        <p className="text-[13px] font-sans text-white/40 leading-relaxed max-w-sm tracking-wide">
                            Advanced on-chain analytics and sovereign privacy infrastructure. Built exclusively for global financial institutions and elite market makers.
                        </p>
                    </div>

                    {/* Elite Navigation */}
                    <div className="md:col-span-7 grid grid-cols-2 gap-12 md:pl-16">
                        {/* Platform */}
                        <div className="flex flex-col gap-8">
                            <h4 className="text-[10px] font-aztec-mono font-black uppercase tracking-[0.3em] text-[var(--aztec-orchid)] flex items-center gap-3">
                                <span className="w-4 h-[1px] bg-[var(--aztec-orchid)]" /> Platform
                            </h4>
                            <div className="flex flex-col gap-5">
                                <FooterLink href="/network" icon={<Globe size={15} />}>System Terminal</FooterLink>
                                <FooterLink href="/academy" icon={<Database size={15} />}>Sovereign Academy</FooterLink>
                                <FooterLink href="/api-marketplace" icon={<Code size={15} />}>API Marketplace</FooterLink>
                                <FooterLink href="/docs/whitepaper" icon={<Lock size={15} />}>Institutional Whitepaper</FooterLink>
                                <FooterLink href="/docs" icon={<Code size={15} />}>Technical Docs</FooterLink>
                            </div>
                        </div>

                        {/* Connect */}
                        <div className="flex flex-col gap-8">
                            <h4 className="text-[10px] font-aztec-mono font-black uppercase tracking-[0.3em] text-[var(--aztec-chartreuse)] flex items-center gap-3">
                                <span className="w-4 h-[1px] bg-[var(--aztec-chartreuse)]" /> Connect
                            </h4>
                            <div className="flex flex-col gap-5">
                                <FooterLink href="https://twitter.com/whalecosystem" external icon={<Twitter size={15} />}>Twitter / X</FooterLink>
                                <FooterLink href="https://github.com/atfortyseven-creations/whalecosystem" external icon={<Github size={15} />}>Github Repository</FooterLink>
                                <FooterLink href="/llms.txt" external icon={<Code size={15} />}>LLM / AI Instructions</FooterLink>
                                <FooterLink href="/privacy" icon={<Lock size={15} />}>Privacy Policy</FooterLink>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secure Baseline */}
                <div className="pt-8 flex flex-col items-center gap-6">
                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    <div className="text-[9px] font-aztec-mono font-black uppercase tracking-[0.4em] text-white/20 flex items-center justify-center gap-4 hover:text-white/40 transition-colors">
                        <Globe size={11} className="opacity-50" />
                        <span>© 2026 Whale Alert Network CORP — ALL RIGHTS RESERVED</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

interface FooterLinkProps {
    href: string;
    children: React.ReactNode;
    external?: boolean;
    icon?: React.ReactNode;
}

const FooterLink = ({ href, children, external = false, icon }: FooterLinkProps) => (
    <Link 
        href={href} 
        target={external ? "_blank" : "_self"}
        rel={external ? "noopener noreferrer" : ""}
        className="group flex items-center gap-4 text-[13px] font-sans font-semibold text-white/40 hover:text-white transition-all w-fit relative"
    >
        {/* Animated indicator line */}
        <div className="absolute -left-4 w-1 h-[1px] bg-white opacity-0 group-hover:opacity-100 group-hover:-left-6 transition-all duration-300" />
        
        {icon && <span className="text-white/20 group-hover:text-[var(--aztec-orchid)] transition-colors duration-300">{icon}</span>}
        <span className="tracking-wide group-hover:translate-x-1 transition-transform duration-300">{children}</span>
        
        <ArrowUpRight 
            size={12} 
            className="opacity-0 -translate-y-2 translate-x-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300 text-[var(--aztec-orchid)]" 
        />
    </Link>
);
