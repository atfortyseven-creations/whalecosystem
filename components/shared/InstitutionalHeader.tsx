"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, Bell, Eye, EyeOff, Search, User, ChevronDown, Activity, Globe, Zap, Settings, HelpCircle, LifeBuoy, Fingerprint, Menu, X, Ticket } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';
import { useSmartAccount } from '@/hooks/useSmartAccount';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { useUIStore } from '@/lib/store/ui-store';
import { SystemsUtilityHeader } from './SystemsUtilityHeader';

// ─── CORPORATE IDENTITY: THE GOLDEN WHALE ───
import { CorporateWhaleLogo } from "@/components/bsv/CorporateWhaleLogo";

export function InstitutionalHeader() {
    const pathname = usePathname();
    const { address: eoaAddress, isConnected: isEoaConnected } = useSovereignAccount();
    const { smartAddress, isConnected, isLoading: isSaLoading } = useSmartAccount();
    const { openConnectModal } = useUIStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isStealth, setIsStealth] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    const navLinks = [
        { href: '/dashboard', label: 'System', active: pathname === '/dashboard', isSystem: true }, // Highlighted system link
        { href: '/vip', label: 'Whale Vip', active: pathname === '/vip' },
        { href: '/dashboard', label: 'Whale Dashboard', active: pathname === '/dashboard' },
        { href: '/network', label: 'Whale Activity', active: pathname === '/network' },
        { href: '/portfolio', label: 'Whale Portfolio', active: pathname === '/portfolio' },
        { href: '/support', label: 'Whale Support', active: pathname === '/support' },
        { href: '/academy', label: 'Whale Academy', active: pathname === '/academy' },
        { href: '/ticket', label: 'Gold Ticket', active: pathname === '/ticket', isTicket: true },
    ];

    return (
        <>
        <header className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#050505]/90 backdrop-blur-3xl sticky top-0 z-[100] transition-all duration-500 shadow-sm">
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none noise-bg" />
            
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-6 relative z-10">
                <Link href="/" className="flex items-center gap-4 group">
                    <div className="relative w-14 h-14 flex items-center justify-center group-hover:rotate-[5deg] transition-all duration-700 bg-white/5 rounded-full shadow-[0_5px_25px_rgba(0,0,0,0.6)] border border-white/10 p-2">
                        <img src="/official-whale-monochrome.png" alt="Whale Logo" className="w-full h-full object-contain invert mix-blend-screen opacity-90" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-aztec-serif font-black text-white uppercase tracking-tighter leading-none flex items-start">
                            Whale Alert<sup className="text-[10px] ml-0.5 mt-1 font-sans opacity-60 tracking-normal">TM</sup>
                        </h1>
                        <span className="text-[9px] font-aztec-mono font-black uppercase tracking-[0.4em] text-white/50 mt-1 drop-shadow-sm">Corporation</span>
                    </div>
                </Link>


                <div className="h-10 w-px bg-black/5 hidden md:block" />

                {/* Desktop Navigation */}
                <nav className="hidden xl:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.label}
                            href={link.href}
                            className={`text-[10px] font-aztec-mono font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
                                link.isSystem ? 'bg-white text-black px-4 py-1.5 rounded-full shadow-[0_4px_10px_rgba(255,255,255,0.2)] hover:scale-105' :
                                link.isTicket ? 'bg-white/10 text-white border border-white/30 px-4 py-1.5 rounded-full hover:bg-white/20 hover:scale-105 shadow-[0_0_15px_rgba(255,255,255,0.1)]' :
                                link.active ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'text-white/50 hover:text-white'
                            }`}
                        >
                            {link.isSystem && <Globe size={12} className="animate-spin-slow" />}
                            {link.isTicket && <Ticket size={12} className="text-white" />}
                            {link.label}
                            {link.isTicket && <span className="ml-0.5 inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Right: Institutional Actions */}
            <div className="flex items-center gap-5 relative z-10">
                <div className="hidden lg:block">
                    <SystemsUtilityHeader />
                </div>
                
                {/* Mobile Menu Toggle - Hidden when hub is active at lg */}
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="lg:hidden p-3 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all active:scale-95 shadow-sm"
                >
                    {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Navigation Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 right-0 bg-white/40 backdrop-blur-3xl border-b border-black/5 p-8 flex flex-col gap-6 xl:hidden shadow-2xl z-[90]"
                    >
                        <div className="grid grid-cols-1 gap-4">
                            {navLinks.map((link) => (
                                <Link 
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`p-6 rounded-2xl text-[12px] font-aztec-mono font-black uppercase tracking-[0.3em] transition-all border ${
                                        link.active 
                                        ? 'bg-white/10 text-white border-white/20' 
                                        : 'bg-black/5 text-black/70 border-black/5 hover:text-black hover:bg-black/10'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                        <div className="pt-6 border-t border-white/10 flex justify-center scale-110">
                            <SystemsUtilityHeader />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
        </>
    );
}
