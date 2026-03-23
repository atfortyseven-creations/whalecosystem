"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, Bell, Eye, EyeOff, Search, User, ChevronDown, Activity, Globe, Zap, Settings, HelpCircle, LifeBuoy, Fingerprint, Menu, X } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useSmartAccount } from '@/hooks/useSmartAccount';
import { useUIStore } from '@/lib/store/ui-store';
import { SystemsUtilityHeader } from './SystemsUtilityHeader';

export function InstitutionalHeader() {
    const pathname = usePathname();
    const { address: eoaAddress, isConnected: isEoaConnected } = useAccount();
    const { smartAddress, isConnected, isLoading: isSaLoading } = useSmartAccount();
    const { openConnectModal } = useUIStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isStealth, setIsStealth] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    const navLinks = [
        { href: '#', label: 'System', active: false, isSystem: true }, // Highlighted system link
        { href: '/vip', label: 'Whale Vip', active: pathname === '/vip' },
        { href: '/dashboard', label: 'Whale Dashboard', active: pathname === '/dashboard' },
        { href: '/network', label: 'Whale Activity', active: pathname === '/network' },
        { href: '/portfolio', label: 'Whale Portfolio', active: pathname === '/portfolio' },
        { href: '/support', label: 'Whale Support', active: pathname === '/support' },
        { href: '/academy', label: 'Whale Academy', active: pathname === '/academy' },
    ];

    return (
        <>
        <header className="flex items-center justify-between px-8 py-5 border-b border-[var(--aztec-ink)]/5 bg-[var(--aztec-parchment)]/30 backdrop-blur-3xl sticky top-0 z-[100] transition-all duration-500 shadow-sm">
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none noise-bg" />
            
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-6 relative z-10">
                <Link href="/" className="flex items-center gap-4 group">
                    <div className="relative w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <img 
                            src="/models/update/gradient-pink-diamond-balls-assortment (2).png" 
                            alt="Whale Alert" 
                            className="w-full h-full object-contain mix-blend-multiply"
                        />
                    </div>
                    <h1 className="text-2xl font-aztec-serif font-black text-[var(--aztec-ink)] uppercase tracking-tighter leading-none">
                        Whale Alert
                    </h1>
                </Link>

                <div className="h-10 w-px bg-black/5 hidden md:block" />

                {/* Desktop Navigation */}
                <nav className="hidden xl:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.label}
                            href={link.href}
                            className={`text-[10px] font-aztec-mono font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
                                link.isSystem ? 'bg-[var(--aztec-chartreuse)] text-[var(--aztec-ink)] px-4 py-1.5 rounded-full shadow-[0_4px_10px_rgba(180,255,0,0.2)] hover:scale-105' :
                                link.active ? 'text-[var(--aztec-orchid)] drop-shadow-[0_0_8px_rgba(209,37,199,0.2)]' : 'text-[var(--aztec-ink)]/40 hover:text-[var(--aztec-ink)]'
                            }`}
                        >
                            {link.isSystem && <Globe size={12} className="animate-spin-slow" />}
                            {link.label}
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
                                        ? 'bg-[var(--aztec-chartreuse)]/10 text-[var(--aztec-chartreuse)] border-[var(--aztec-chartreuse)]/20' 
                                        : 'bg-[var(--aztec-ink)]/5 text-[var(--aztec-ink)]/50 border-[var(--aztec-ink)]/5 hover:text-[var(--aztec-ink)] hover:bg-[var(--aztec-ink)]/10'
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
