"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVIPStore, WhaleEvent } from '@/lib/vip-store';
import { ShieldAlert, Zap, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';

/**
 * AlphaToaster
 * 
 * High-fidelity institutional alert system.
 * Monitors the VIP store for "MEGA" level whale transactions ($10M+)
 * and displays a premium Aztecs-style notification.
 */
export function AlphaToaster() {
    const whaleEvents = useVIPStore(state => state.whaleEvents);
    const [activeAlert, setActiveAlert] = useState<WhaleEvent | null>(null);

    useEffect(() => {
        if (whaleEvents.length > 0) {
            const latest = whaleEvents[0];
            // Only trigger for MEGA whales (> $10M) or high confidence alpha moves
            if (latest.tier === 'MEGA' || latest.confidence > 98) {
                // Prevent duplicate alerts for the same event
                if (activeAlert?.id !== latest.id) {
                    setActiveAlert(latest);
                    const timer = setTimeout(() => setActiveAlert(null), 8000);
                    return () => clearTimeout(timer);
                }
            }
        }
    }, [whaleEvents, activeAlert?.id]);

    return (
        <div className="fixed bottom-12 right-6 z-[100] pointer-events-none flex flex-col gap-3">
            <AnimatePresence>
                {activeAlert && (
                    <motion.div
                        initial={{ opacity: 0, x: 100, scale: 0.9, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, x: 20, scale: 0.95, filter: 'blur(5px)' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="pointer-events-auto group"
                    >
                        <div className="relative w-80 bg-white/95 dark:bg-[#050505]/95 backdrop-blur-xl border border-black/10 dark:border-[#00FF55]/20 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(0,255,85,0.1)]">
                            
                            {/* Accent Glow */}
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00FF55] to-transparent animate-pulse" />
                            
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-[#00FF55]/10 border border-[#00FF55]/30 rounded-lg">
                                            <ShieldAlert size={14} className="text-[#00FF55]" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00FF55]">
                                            Alpha Clearance Alert
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[8px] font-mono text-[#888888] uppercase tracking-widest">
                                        <Zap size={10} className="text-[#00FF55] animate-pulse" /> Live
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[14px] font-black tracking-tight text-black dark:text-white">
                                            {activeAlert.label}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            {activeAlert.action === 'SELL' ? (
                                                <TrendingDown size={14} className="text-[#FF3B30]" />
                                            ) : (
                                                <TrendingUp size={14} className="text-[#00C076]" />
                                            )}
                                            <span className={`text-[12px] font-black ${activeAlert.action === 'SELL' ? 'text-[#FF3B30]' : 'text-[#00C076]'}`}>
                                                {activeAlert.usdValue} {activeAlert.action}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-[10px] font-mono border-t border-black/5 dark:border-white/5 pt-2">
                                        <div className="flex flex-col">
                                            <span className="text-[#888888] uppercase text-[7px] mb-0.5">Asset</span>
                                            <span className="text-black dark:text-gray-300 font-bold">{activeAlert.amount} {activeAlert.token}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[#888888] uppercase text-[7px] mb-0.5">Validation</span>
                                            <span className="text-[#00C076] font-bold">{activeAlert.confidence}% Confirmed</span>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => window.open(`https://etherscan.io/tx/${activeAlert.hash}`, '_blank')}
                                    className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/5 dark:border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-[#888888] hover:text-black dark:hover:text-white"
                                >
                                    Verify on Cipher <ExternalLink size={10} />
                                </button>
                            </div>

                            {/* Decorative Grid Progress Bar */}
                            <motion.div 
                                initial={{ width: "100%" }}
                                animate={{ width: "0%" }}
                                transition={{ duration: 8, ease: "linear" }}
                                className="h-0.5 bg-[#00FF55]/40"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
