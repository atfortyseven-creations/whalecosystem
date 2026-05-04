"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { SystemsUtilityHeader } from './SystemsUtilityHeader';
import Image from 'next/image';
import { SplashContainer } from '@/components/shared/SplashContainer';

export function InstitutionalHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                    <div className="flex flex-col leading-none text-[#050505] justify-center">
                        <span className="font-aztec-serif text-[18px] font-black uppercase tracking-tighter leading-none">
                            Whale Alert Network
                        </span>
                    </div>
                </Link>

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
                        <div className="flex flex-col items-center w-full pt-2">
                            <SystemsUtilityHeader />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
