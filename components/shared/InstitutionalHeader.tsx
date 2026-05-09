"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { SystemsUtilityHeader } from './SystemsUtilityHeader';
import Image from 'next/image';
import { SplashContainer } from '@/components/shared/SplashContainer';

const MENU_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Blockchain", href: "#", subItems: [{ label: "Network Blocks", description: "Real-time block stream.", href: "/network" }, { label: "Ledger", description: "Global ledger history.", href: "/ledger" }] },
  { label: "Intelligence", href: "#", subItems: [{ label: "Data & Charts", description: "On-chain analytics.", href: "/sovereign-intel" }, { label: "Assets", description: "Secure storage.", href: "/portfolio" }] },
  { label: "Forum", href: "/forum" },
  { label: "Ecosystem", href: "#", subItems: [{ label: "News", description: "Global intel.", href: "/news" }, { label: "Academy", description: "Learn.", href: "/academy" }, { label: "Careers", description: "Join us.", href: "/careers" }] },
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
        className="font-mono text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300 flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-black/5"
        style={{ color: "rgba(10,10,10,0.85)" }}
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(10,10,10,1)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(10,10,10,0.85)")}
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
            className="absolute top-[100%] left-0 w-[240px] bg-white border border-black/10 shadow-2xl z-50 p-1 rounded-sm mt-1"
          >
            {item.subItems ? (
              <div className="flex flex-col">
                {item.subItems.map((sub: any, idx: number) => (
                  <Link key={idx} href={sub.href} className="flex flex-col p-3 hover:bg-black/5 transition-colors rounded-sm">
                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#050505]">{sub.label}</span>
                    <span className="font-sans text-[11px] text-[#555] leading-tight mt-1 opacity-80">{sub.description}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <Link href={item.href} className="block p-3 hover:bg-black/5 transition-colors rounded-sm">
                <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#050505] block mb-1">{item.label}</span>
                <span className="font-sans text-[11px] text-[#555] leading-tight opacity-80">{item.description}</span>
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
                            <div className="w-full flex flex-col gap-2 mb-6 pb-6 border-b border-black/10">
                                {MENU_ITEMS.map((item, index) => (
                                    <Link 
                                        key={index} 
                                        href={item.href} 
                                        onClick={() => setIsMenuOpen(false)}
                                        className="font-mono text-[11px] font-black uppercase tracking-[0.2em] py-3 text-center text-[#050505] hover:bg-black/5 rounded-lg transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                            <SystemsUtilityHeader />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
