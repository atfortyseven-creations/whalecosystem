"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { SystemsUtilityHeader } from './SystemsUtilityHeader';
import Image from 'next/image';
import { SplashContainer } from '@/components/shared/SplashContainer';

const MENU_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Whale Chat", href: "/chat" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Ecosystem", href: "#", subItems: [{ label: "News", description: "Global updates.", href: "/news" }, { label: "Academy", description: "Learn.", href: "/academy" }, { label: "Forum", description: "Discuss.", href: "/forum" }, { label: "Careers", description: "Join us.", href: "/careers" }] },
  { label: "Pricing", href: "/pricing" }
];

function MegaMenuItem({ item }: { item: any }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div 
      className="relative group h-full flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={item.href}
        className="font-mono text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300 flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[#050505]/85 dark:text-white/85 hover:text-[#050505] dark:hover:text-white"
      >
        <span>{item.label}</span>
        {item.subItems && <span className="opacity-40 text-[7px] mt-[1px]">▼</span>}
      </Link>
      
      <AnimatePresence>
        {isHovered && (item.subItems || item.description) && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute top-[100%] left-0 w-[240px] bg-white/40 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border border-black/10 dark:border-white/10 shadow-2xl z-50 p-1 rounded-sm mt-1"
          >
              {item.subItems ? (
              <div className="flex flex-col">
                {item.subItems.map((sub: any, idx: number) => (
                  <Link key={idx} href={sub.href} className="flex flex-col p-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors rounded-sm">
                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#050505] dark:text-white">{sub.label}</span>
                    <span className="font-sans text-[11px] text-[#555] dark:text-[#AAAAAA] leading-tight mt-1 opacity-80">{sub.description}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <Link href={item.href} className="block p-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors rounded-sm">
                <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#050505] dark:text-white block mb-1">{item.label}</span>
                <span className="font-sans text-[11px] text-[#555] dark:text-[#AAAAAA] leading-tight opacity-80">{item.description}</span>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function InstitutionalHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header
            role="banner"
            className="relative flex items-center justify-between w-full border-b border-black/10 dark:border-white/10 sticky top-0 z-[100] transition-colors duration-300 bg-white dark:bg-[#0A0A0A] shadow-[0_1px_0_rgba(0,0,0,0.06),0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-none"
            style={{ minHeight: '68px' }}
        >
            {/* Inner container — centred, full-width up to 4K */}
            <div className="w-full max-w-[2560px] mx-auto px-6 lg:px-10 flex items-center justify-between h-full">
            {/* Paper grain texture overlay */}
            <div className="absolute inset-0 opacity-[0.035] pointer-events-none noise-bg" />

            {/* LEFT: Brand Identity */}
            <div className="flex items-center gap-5 relative z-10 flex-shrink-0 mr-auto">
                <Link href="/" className="flex items-center gap-3.5 group">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        className="relative flex items-center justify-center rounded-xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 overflow-hidden w-[58px] h-[36px]"
                    >
                        <SplashContainer className="w-full h-full flex items-center justify-center">
                            <Image
                                src="/official-whale-monochrome.png"
                                alt="Whale Alert Network Logo"
                                width={52}
                                height={32}
                                className="object-contain w-full h-full p-1 opacity-80 mix-blend-multiply dark:mix-blend-normal dark:invert dark:opacity-100"
                                unoptimized={true}
                            />
                        </SplashContainer>
                    </motion.div>
                    <div className="flex flex-col leading-none text-[#050505] dark:text-white justify-center">
                        <span className="font-aztec-serif text-[18px] font-black uppercase tracking-tighter leading-none">
                            Whale Alert Network
                        </span>
                    </div>
                </Link>
            </div>

            {/* CENTER: Tronscan Inspired Navigation Menu */}
            <div className="hidden lg:flex items-center justify-center absolute left-[50%] translate-x-[-50%] h-full z-20">
                <nav className="flex items-center gap-1 h-full">
                    {MENU_ITEMS.map((item, index) => (
                        <MegaMenuItem key={index} item={item} />
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
                    className="xl:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-black/10 dark:border-white/10 transition-all bg-transparent text-black dark:text-white"
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
                        className="absolute top-full left-0 right-0 z-[90] p-6 shadow-2xl bg-white/40 dark:bg-black/60 backdrop-blur-3xl border-b border-black/10 dark:border-white/10"
                    >
                        <div className="flex flex-col items-center w-full pt-2">
                            <div className="w-full flex flex-col gap-2 pb-4">
                                {MENU_ITEMS.map((item, index) => (
                                    <Link 
                                        key={index} 
                                        href={item.href} 
                                        onClick={() => setIsMenuOpen(false)}
                                        className="font-mono text-[11px] font-black uppercase tracking-[0.2em] py-3 text-center text-[#050505] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            </div>{/* end inner container */}
        </header>
    );
}
