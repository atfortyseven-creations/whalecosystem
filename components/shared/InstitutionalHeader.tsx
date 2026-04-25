"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import { SystemsUtilityHeader } from './SystemsUtilityHeader';
import Image from 'next/image';
import { SplashContainer } from '@/components/shared/SplashContainer';

type NavGroup = {
    label: string;
    links: { href: string; label: string; desc: string; activePathMatch?: string }[];
};

export function InstitutionalHeader() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navGroups: NavGroup[] = [
        {
            label: "Home",
            links: [
                { href: '/dashboard', label: 'Dashboard', desc: 'General portfolio overview and balances.' }
                // { href: '/voss-supremacy', label: 'Sniper Trading', desc: 'Automated high-speed execution tools.' }
            ]
        },
        {
            label: "Analytics",
            links: [
                { href: '/sovereign-intel', label: 'Intelligence', desc: 'On-chain analytics and graphing.' },
                { href: '/ledger', label: 'Transaction History', desc: 'Complete history of all wallet actions.' },
                // { href: '/predictions', label: 'Polymarket', desc: 'Decentralized prediction markets.' },
                { href: '/news', label: 'Global News', desc: 'Curated market and crypto news.' }
            ]
        },
        {
            label: "Assets",
            links: [
                { href: '/portfolio', label: 'Cold Wallet', desc: 'Secure long-term asset storage.' }
                // { href: '/gold-registry', label: 'Identity Credentials', desc: 'Your verified ID and access passes.' }
            ]
        },
        {
            label: "Ecosystem",
            links: [
                { href: '/academy', label: 'Academy', desc: 'Educational courses and articles.' },
                { href: '/developer', label: 'Developers', desc: 'API links and system architecture.' },
                { href: '/support', label: 'Support', desc: 'Help center and system status.' }
            ]
        }
    ];

    return (
        <header
            className="relative flex items-center justify-between px-6 lg:px-10 w-full border-b sticky top-0 z-[100] transition-colors duration-300 shadow-sm"
            style={{ minHeight: '68px', backgroundColor: '#FAF9F6', borderColor: 'rgba(5,5,5,0.08)' }}
        >
            {/* Paper grain texture overlay */}
            <div className="absolute inset-0 opacity-[0.035] pointer-events-none noise-bg" />

            {/* LEFT: Brand Identity */}
            <div className="flex items-center gap-5 relative z-10 flex-shrink-0 mr-auto">
                <Link href="/" className="flex items-center gap-3.5 group">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        className="relative flex items-center justify-center rounded-xl border overflow-hidden w-[58px] h-[36px]"
                        style={{ backgroundColor: 'rgba(5,5,5,0.03)', borderColor: 'rgba(5,5,5,0.08)' }}
                    >
                        <SplashContainer className="w-full h-full flex items-center justify-center">
                            <Image
                                src="/official-whale-monochrome.png"
                                alt="Whale Alert Network Logo"
                                width={52}
                                height={32}
                                className="object-contain w-full h-full p-1 opacity-80 mix-blend-multiply"
                                unoptimized={true}
                            />
                        </SplashContainer>
                    </motion.div>
                    <div className="flex flex-col leading-none text-[#050505]">
                        <span className="font-aztec-serif text-[18px] font-black uppercase tracking-tighter leading-none">
                            Whale Alert Network
                        </span>
                        <span className="font-mono text-[7px] font-bold uppercase tracking-[0.4em] mt-0.5" style={{ color: 'rgba(5,5,5,0.4)' }}>
                            Terminal
                        </span>
                    </div>
                </Link>

                {/* Vertical divider */}
                <div className="hidden lg:block h-8 w-px" style={{ backgroundColor: 'rgba(5,5,5,0.08)' }} />

                {/* ─── DESKTOP NAV ─── */}
                <nav className="hidden xl:flex items-center gap-2">
                    {navGroups.map((group) => (
                        <div key={group.label} className="relative group/nav px-2 py-4 cursor-default">
                             <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-[0.2em] transition-colors"
                                  style={{ color: 'rgba(5,5,5,0.5)' }}>
                                 {group.label}
                                 <ChevronDown size={12} className="opacity-50" />
                             </div>
                             
                             {/* DROPDOWN MENU - Ivory Standard */}
                             <div className="absolute top-full left-0 mt-0 opacity-0 translate-y-2 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:translate-y-0 group-hover/nav:pointer-events-auto transition-all duration-300 z-50">
                                 <div className="rounded-xl shadow-2xl flex flex-col p-2 backdrop-blur-3xl min-w-[340px]"
                                      style={{ backgroundColor: 'rgba(250,249,246,0.95)', border: '1px solid rgba(5,5,5,0.08)' }}>
                                     {group.links.map(link => {
                                         const isActive = pathname === link.href;
                                         return (
                                             <Link 
                                                 href={link.href} 
                                                 key={link.label}
                                                 className="flex flex-col gap-1 px-4 py-4 rounded-lg transition-all hover:scale-[1.01] hover:bg-[rgba(5,5,5,0.03)]"
                                                 style={{ 
                                                     backgroundColor: isActive ? 'rgba(5,5,5,0.03)' : undefined,
                                                 }}
                                             >
                                                 <span className="text-[12px] font-black uppercase tracking-widest text-[#050505]">
                                                     {link.label}
                                                 </span>
                                                 <span className="text-[10px] font-medium leading-relaxed tracking-wide" style={{ color: 'rgba(5,5,5,0.45)' }}>
                                                     {link.desc}
                                                 </span>
                                             </Link>
                                         );
                                     })}
                                 </div>
                             </div>
                        </div>
                    ))}
                </nav>
            </div>

            {/* RIGHT: Utility area */}
            <div className="flex items-center gap-4 relative z-10 flex-shrink-0">
                <div className="hidden lg:block">
                    <SystemsUtilityHeader />
                </div>

                {/* Mobile hamburger */}
                <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="xl:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-black/10 transition-all bg-transparent text-black"
                >
                    {isMenuOpen ? <X size={16} /> : <Menu size={16} />}
                </motion.button>
            </div>

            {/* ─── MOBILE MENU DRAWER ─── */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 z-[90] p-6 shadow-2xl"
                        style={{ backgroundColor: '#FAF9F6', borderBottom: '1px solid rgba(5,5,5,0.08)' }}
                    >
                        <div className="grid grid-cols-1 gap-6 mb-5 pb-5" style={{ borderBottom: '1px solid rgba(5,5,5,0.08)' }}>
                            {navGroups.map((group) => (
                                <div key={group.label} className="flex flex-col gap-3">
                                     <span className="text-[9px] font-black uppercase tracking-[0.3em] px-2" style={{ color: 'rgba(5,5,5,0.4)' }}>
                                         {group.label}
                                     </span>
                                     <div className="flex flex-col gap-2">
                                        {group.links.map(link => {
                                             const isActive = pathname === link.href;
                                             return (
                                                 <Link
                                                     key={link.href}
                                                     href={link.href}
                                                     onClick={() => setIsMenuOpen(false)}
                                                     className="flex flex-col gap-1 px-4 py-3 rounded-xl transition-all border"
                                                     style={{
                                                         backgroundColor: isActive ? 'rgba(5,5,5,0.04)' : 'transparent',
                                                         borderColor: isActive ? 'rgba(5,5,5,0.08)' : 'transparent',
                                                     }}
                                                 >
                                                     <span className="text-[11px] font-black uppercase tracking-widest text-[#050505]">
                                                         {link.label}
                                                     </span>
                                                     <span className="text-[9px] font-medium leading-relaxed" style={{ color: 'rgba(5,5,5,0.45)' }}>
                                                         {link.desc}
                                                     </span>
                                                 </Link>
                                             );
                                        })}
                                     </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex flex-col items-center w-full">
                            <SystemsUtilityHeader />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
