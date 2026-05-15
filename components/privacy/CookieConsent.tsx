'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCookieConsent } from './CookieContext';

export function CookieConsent() {
    const { showBanner, acceptAll, rejectAll } = useCookieConsent();

    if (!showBanner) return null;

    const handleEssential = async () => {
        rejectAll();
        try {
            await fetch('/api/cookies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ consent: { essential: true, analytics: false, marketing: false } })
            });
        } catch(e) {}
    };

    const handleAcceptAll = async () => {
        acceptAll();
        try {
            await fetch('/api/cookies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ consent: { essential: true, analytics: true, marketing: true } })
            });
        } catch(e) {}
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 120, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 120, opacity: 0, transition: { duration: 0.4, ease: 'easeIn' } }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="fixed bottom-0 left-0 right-0 z-[99999] p-3 sm:p-5 pointer-events-none"
            >
                {/* ── Outer glow halo ── */}
                <div className="w-full max-w-3xl mx-auto pointer-events-auto relative">

                    {/* Ambient glow ring */}
                    <div className="absolute -inset-[1px] rounded-[22px] bg-gradient-to-r from-[#00f5ff]/20 via-[#9f00ff]/20 to-[#00f5ff]/20 blur-sm pointer-events-none" />

                    {/* Card */}
                    <div
                        className="relative rounded-[20px] overflow-hidden"
                        style={{
                            background: 'rgba(10, 10, 10, 0.90)',
                            backdropFilter: 'blur(40px)',
                            WebkitBackdropFilter: 'blur(40px)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
                        }}
                    >
                        {/* Top accent line */}
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00f5ff]/60 to-transparent" />

                        {/* Grid texture */}
                        <div
                            className="absolute inset-0 pointer-events-none opacity-[0.025]"
                            style={{
                                backgroundImage: 'linear-gradient(rgba(0,245,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,1) 1px, transparent 1px)',
                                backgroundSize: '32px 32px'
                            }}
                        />

                        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 sm:p-6">

                            {/* Icon */}
                            <div className="shrink-0 w-10 h-10 rounded-xl bg-[#00f5ff]/10 border border-[#00f5ff]/20 flex items-center justify-center">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00f5ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                    <path d="M9 12l2 2 4-4"/>
                                </svg>
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-black uppercase tracking-[0.25em] text-white mb-1">
                                    Data &amp; Privacy Protocol
                                </p>
                                <p className="text-[10px] text-white/40 leading-relaxed font-mono tracking-wide">
                                    We use essential cookies for session integrity and optional analytics to improve the platform. Your identity data is never sold or shared.
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                                <button
                                    onClick={handleEssential}
                                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 active:scale-[0.97]"
                                    style={{
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.10)',
                                        color: 'rgba(255,255,255,0.50)',
                                    }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.10)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.80)'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.50)'; }}
                                >
                                    Essential
                                </button>
                                <button
                                    onClick={handleAcceptAll}
                                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 active:scale-[0.97] relative overflow-hidden group"
                                    style={{
                                        background: 'linear-gradient(135deg, #00f5ff, #9f00ff)',
                                        color: '#fff',
                                        boxShadow: '0 0 20px rgba(0,245,255,0.25)',
                                    }}
                                >
                                    <span className="relative z-10">Accept All</span>
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
