"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Menu, X, Ticket, RadioTower } from 'lucide-react';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { useUIStore } from '@/lib/store/ui-store';
import { SystemsUtilityHeader } from './SystemsUtilityHeader';
import Image from 'next/image';
import { SplashContainer } from '@/components/shared/SplashContainer';
import { io } from 'socket.io-client';

// ─── IVORY INSTITUTIONAL HEADER ───
// Crema/Ivory premium palette — 100% visible, senior Web3 grade
export function InstitutionalHeader() {
    const pathname = usePathname();
    const { address: eoaAddress, isConnected } = useSovereignAccount();
    const { openConnectModal } = useUIStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [engineOnline, setEngineOnline] = useState(false);
    const [tps, setTps] = useState(0);

    useEffect(() => {
        const socket = io();
        socket.on('connect', () => setEngineOnline(true));
        socket.on('disconnect', () => setEngineOnline(false));
        socket.on('engine_status', (s: any) => setTps(s.tps));
        return () => { socket.disconnect(); };
    }, []);

    const navLinks: { href: string; label: string; active: boolean; isSystem?: boolean; isTicket?: boolean }[] = [
        { href: '/dashboard',  label: 'System',          active: pathname === '/dashboard',  isSystem: true  },
        // { href: '/portfolio',  label: 'Sovereign Portfolio',  active: pathname === '/portfolio'                   },
        // { href: '/news',       label: 'News of today',    active: pathname === '/news'                        },
        // { href: '/support',    label: 'Sovereign Support',    active: pathname === '/support'                     },
        // { href: '/academy',    label: 'Sovereign Academy',    active: pathname === '/academy'                     },
        // { href: '/ticket',     label: 'Gold Ticket',      active: pathname === '/ticket',     isTicket: true  },
    ];

    return (
        <>
        {/* ─── MAIN IVORY HEADER ─── */}
        <header
            className="relative flex items-center justify-between px-6 lg:px-10 w-full border-b sticky top-0 z-[100] transition-all duration-300"
            style={{
                background: 'linear-gradient(135deg, #FDFAF5 0%, #F7F2EA 50%, #FDFAF5 100%)',
                borderColor: 'rgba(0,0,0,0.07)',
                boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.06)',
                minHeight: '68px',
            }}
        >
            {/* Paper grain texture overlay */}
            <div className="absolute inset-0 opacity-[0.025] pointer-events-none noise-bg" />
            {/* Subtle top edge light */}
            <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0.9) 70%, transparent)' }} />

            {/* LEFT: Brand Identity */}
            <div className="flex items-center gap-5 relative z-10 flex-shrink-0 mr-auto">
                <Link href="/" className="flex items-center gap-3.5 group">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        className="relative flex items-center justify-center rounded-xl border shadow-sm overflow-hidden"
                        style={{
                            width: '58px', height: '36px',
                            background: 'rgba(0,0,0,0.04)',
                            borderColor: 'rgba(0,0,0,0.08)'
                        }}
                    >
                        <SplashContainer className="w-full h-full flex items-center justify-center">
                            <Image
                                src="/official-whale-monochrome.png"
                                alt="Whale Alert Network Logo"
                                width={52}
                                height={32}
                                className="object-contain w-full h-full p-1"
                                unoptimized={true}
                            />
                        </SplashContainer>
                    </motion.div>
                    <div className="flex flex-col leading-none">
                        <span className="font-aztec-serif text-[18px] font-black text-black uppercase tracking-tighter leading-none">
                            Whale Alert Network
                        </span>
                        <span className="font-mono text-[7px] font-bold uppercase tracking-[0.4em] mt-0.5" style={{ color: 'rgba(0,0,0,0.35)' }}>
                            Terminal
                        </span>
                    </div>
                </Link>

                {/* Vertical divider */}
                <div className="hidden lg:block h-8 w-px" style={{ background: 'rgba(0,0,0,0.08)' }} />

                {/* ─── DESKTOP NAV ─── */}
                <nav className="hidden xl:flex items-center gap-1">
                    {navLinks.map((link) => {
                        if (link.isSystem) return (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[9px] font-mono font-black uppercase tracking-[0.22em] transition-all hover:scale-105"
                                style={{
                                    background: 'rgba(0,0,0,0.88)',
                                    color: '#F7F2EA',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                }}
                            >
                                <Globe size={10} />
                                {link.label}
                            </Link>
                        );
                        if (link.isTicket) return (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[9px] font-mono font-black uppercase tracking-[0.22em] border transition-all hover:shadow-md"
                                style={{
                                    background: link.active ? 'rgba(0,0,0,0.07)' : 'transparent',
                                    borderColor: 'rgba(0,0,0,0.15)',
                                    color: 'rgba(0,0,0,0.7)',
                                }}
                            >
                                <Ticket size={10} />
                                {link.label}
                                <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#000', opacity: 0.5 }} />
                            </Link>
                        );
                        return (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="relative px-3 py-1.5 text-[9px] font-mono font-black uppercase tracking-[0.22em] whitespace-nowrap transition-all rounded-lg group"
                                style={{
                                    color: link.active ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.4)',
                                    background: link.active ? 'rgba(0,0,0,0.06)' : 'transparent',
                                }}
                            >
                                <span className="relative z-10 group-hover:text-black transition-colors" style={{ color: 'inherit' }}>
                                    {link.label}
                                </span>
                                {link.active && (
                                    <motion.div
                                        layoutId="nav-active-pill"
                                        className="absolute inset-0 rounded-lg"
                                        style={{ background: 'rgba(0,0,0,0.06)' }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                                {/* Hover underline */}
                                <span
                                    className="absolute bottom-0.5 left-3 right-3 h-px opacity-0 group-hover:opacity-30 transition-opacity"
                                    style={{ background: '#000' }}
                                />
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* RIGHT: Utility area */}
            <div className="flex items-center gap-3 relative z-10 flex-shrink-0">

                {/* Engine Status Badge Removed from Navigation per request */}

                <div className="hidden lg:block">
                    <SystemsUtilityHeader />
                </div>

                {/* Mobile hamburger */}
                <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="xl:hidden flex items-center justify-center w-9 h-9 rounded-xl border transition-all"
                    style={{ borderColor: 'rgba(0,0,0,0.1)', background: isMenuOpen ? 'rgba(0,0,0,0.06)' : 'transparent' }}
                >
                    {isMenuOpen ? <X size={16} style={{ color: 'rgba(0,0,0,0.7)' }} /> : <Menu size={16} style={{ color: 'rgba(0,0,0,0.5)' }} />}
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
                        className="absolute top-full left-0 right-0 border-b z-[90] p-6"
                        style={{
                            background: 'linear-gradient(135deg, #FDFAF5 0%, #F7F2EA 100%)',
                            borderColor: 'rgba(0,0,0,0.07)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                        }}
                    >
                        {/* ── ALL NAV TABS — always visible on PC (before & after login) ── */}
                        <div className="grid grid-cols-2 gap-2 mb-5 pb-5 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="px-4 py-3 rounded-xl text-[10px] font-mono font-black uppercase tracking-[0.25em] transition-all border"
                                    style={{
                                        background: link.active ? 'rgba(0,0,0,0.07)' : 'rgba(0,0,0,0.02)',
                                        borderColor: link.active ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.06)',
                                        color: link.active ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.5)',
                                    }}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                        
                        <div className="flex flex-col items-center w-full">
                            <SystemsUtilityHeader />
                            
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
        </>
    );
}
