'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCookieConsent } from './CookieContext';
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
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0, transition: { duration: 0.5, ease: "anticipate" } }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="fixed bottom-0 left-0 right-0 z-[99999] p-4 sm:p-6 pointer-events-none"
            >
                <div className="w-full max-w-4xl mx-auto bg-[#FDFCF8] text-[#0a0a0a] border border-black/10 rounded-[24px] shadow-[0_30px_60px_rgba(0,0,0,0.1)] p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-12 pointer-events-auto backdrop-blur-2xl relative overflow-hidden">
                    
                    {/* Ambient Background Matrix */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                         style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

                    <div className="flex-1 relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="w-12 h-12 rounded-full border border-black/10 bg-white shadow-sm flex items-center justify-center shrink-0">
                            <img src="/official-whale-monochrome.png" alt="Whale Logo" className="w-6 h-6 object-contain opacity-80" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-[13px] md:text-[14px] font-black uppercase tracking-[0.25em] text-[#0a0a0a]">
                                Institutional Telemetry & Privacy
                            </h3>
                            <p className="text-[10px] md:text-[11px] text-black/50 leading-relaxed font-mono uppercase tracking-[0.1em] max-w-2xl">
                                Whale Alert Network utilizes cryptographic local storage to maintain Sovereign identity sessions (Zero-Knowledge) and standard cookies for platform functionality. You must authorize data retention policies before operating the terminal.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto relative z-10 shrink-0">
                        <button
                            onClick={handleEssential}
                            className="w-full sm:w-auto px-6 py-4 rounded-xl bg-black/5 border border-black/10 text-black/60 text-[10px] font-black uppercase tracking-widest hover:bg-black/10 hover:text-black transition-all active:scale-[0.98]"
                        >
                            Essential Only
                        </button>
                        <button
                            onClick={handleAcceptAll}
                            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-black text-white text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:bg-black/80 hover:shadow-[0_0_30px_rgba(0,0,0,0.2)] transition-all active:scale-[0.98]"
                        >
                            Accept All
                        </button>
                    </div>

                </div>
            </motion.div>
        </AnimatePresence>
    );
}
