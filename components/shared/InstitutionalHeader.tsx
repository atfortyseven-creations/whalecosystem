"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import { SystemsUtilityHeader } from './SystemsUtilityHeader';
import Image from 'next/image';
import { SplashContainer } from '@/components/shared/SplashContainer';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

type NavGroup = {
    label: string;
    links: { href: string; label: string; activePathMatch?: string }[];
};

export function InstitutionalHeader() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navGroups: NavGroup[] = [
        {
            label: "Markets",
            links: [
                { href: '/dashboard', label: 'Macro Dashboard' }
            ]
        },
        {
            label: "Intelligence",
            links: [
                { href: '/news', label: 'Global Market Feeds' }
            ]
        },
        {
            label: "Portfolio",
            links: [
                { href: '/portfolio', label: 'Sovereign Portfolio' }
            ]
        },
        {
            label: "Learn & Support",
            links: [
                { href: '/academy', label: 'Academic Documentation' },
                { href: '/support', label: 'Protocol Support' },
                { href: '/ticket', label: 'Genesis Authorization' }
            ]
        }
    ];

    return (
        <header
            className="relative flex items-center justify-between px-6 lg:px-10 w-full border-b sticky top-0 z-[100] transition-colors duration-300 bg-white dark:bg-black border-black/5 dark:border-white/10 shadow-sm"
            style={{ minHeight: '68px' }}
        >
            {/* Paper grain texture overlay */}
            <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.05] pointer-events-none noise-bg" />

            {/* LEFT: Brand Identity */}
            <div className="flex items-center gap-5 relative z-10 flex-shrink-0 mr-auto">
                <Link href="/" className="flex items-center gap-3.5 group">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        className="relative flex items-center justify-center rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 shadow-sm overflow-hidden w-[58px] h-[36px]"
                    >
                        <SplashContainer className="w-full h-full flex items-center justify-center">
                            <Image
                                src="/official-whale-monochrome.png"
                                alt="Whale Alert Network Logo"
                                width={52}
                                height={32}
                                className="object-contain w-full h-full p-1 dark:invert"
                                unoptimized={true}
                            />
                        </SplashContainer>
                    </motion.div>
                    <div className="flex flex-col leading-none text-black dark:text-white">
                        <span className="font-aztec-serif text-[18px] font-black uppercase tracking-tighter leading-none">
                            Whale Alert Network
                        </span>
                        <span className="font-mono text-[7px] font-bold uppercase tracking-[0.4em] mt-0.5 opacity-40 dark:opacity-60">
                            Terminal
                        </span>
                    </div>
                </Link>

                {/* Vertical divider */}
                <div className="hidden lg:block h-8 w-px bg-black/10 dark:bg-white/10" />

                {/* ─── DESKTOP NAV ─── */}
                <nav className="hidden xl:flex items-center gap-2">
                    {navGroups.map((group) => (
                        <div key={group.label} className="relative group/nav px-2 py-4 cursor-default">
                             <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-black/60 dark:text-white/60 group-hover/nav:text-black dark:group-hover/nav:text-white transition-colors">
                                 {group.label}
                                 <ChevronDown size={12} className="opacity-50" />
                             </div>
                             
                             {/* DROPDOWN MENU */}
                             <div className="absolute top-full left-0 mt-0 w-56 opacity-0 translate-y-2 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:translate-y-0 group-hover/nav:pointer-events-auto transition-all duration-300 z-50">
                                 <div className="bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 rounded-xl shadow-xl flex flex-col p-2 backdrop-blur-xl">
                                     {group.links.map(link => {
                                         const isActive = pathname === link.href;
                                         return (
                                             <Link 
                                                 href={link.href} 
                                                 key={link.label}
                                                 className={`px-4 py-3 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all
                                                    ${isActive 
                                                        ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white' 
                                                        : 'text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
                                                    }`}
                                             >
                                                 {link.label}
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
                <ThemeToggle />

                <div className="hidden lg:block">
                    <SystemsUtilityHeader />
                </div>

                {/* Mobile hamburger */}
                <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="xl:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-black/10 dark:border-white/10 transition-all bg-transparent dark:text-white"
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
                        className="absolute top-full left-0 right-0 border-b border-black/5 dark:border-white/10 z-[90] p-6 bg-white dark:bg-black shadow-xl"
                    >
                        <div className="grid grid-cols-1 gap-6 mb-5 pb-5 border-b border-black/5 dark:border-white/5">
                            {navGroups.map((group) => (
                                <div key={group.label} className="flex flex-col gap-2">
                                     <span className="text-[9px] font-black uppercase tracking-[0.3em] text-black/30 dark:text-white/30 px-2">
                                         {group.label}
                                     </span>
                                     <div className="grid grid-cols-2 gap-2">
                                        {group.links.map(link => {
                                             const isActive = pathname === link.href;
                                             return (
                                                 <Link
                                                     key={link.href}
                                                     href={link.href}
                                                     onClick={() => setIsMenuOpen(false)}
                                                     className={`px-4 py-3 rounded-xl text-[9px] font-mono font-black uppercase tracking-wider transition-all border
                                                        ${isActive 
                                                            ? 'bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 text-black dark:text-white' 
                                                            : 'bg-transparent border-transparent text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5'}
                                                     `}
                                                 >
                                                     {link.label}
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
