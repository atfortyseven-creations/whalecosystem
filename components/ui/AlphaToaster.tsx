"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVIPStore, WhaleEvent } from '@/lib/vip-store';
import { ExternalLink, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

/**
 * AlphaToaster 
 * 
 * Minimalist, high-fidelity notification system.
 * Designed for absolute perfection and elegance.
 */
export function AlphaToaster() {
    const whaleEvents = useVIPStore(state => state.whaleEvents);
    const [activeAlert, setActiveAlert] = useState<WhaleEvent | null>(null);

    // Fixed conversion rate (approximate for display perfection)
    const USD_TO_EUR = 0.93;

    useEffect(() => {
        if (whaleEvents.length > 0) {
            const latest = whaleEvents[0];
            // Only trigger for MEGA whales (> $10M) or high confidence alpha moves
            if (latest.tier === 'MEGA' || latest.confidence > 98) {
                if (activeAlert?.id !== latest.id) {
                    setActiveAlert(latest);
                    const timer = setTimeout(() => setActiveAlert(null), 10000);
                    return () => clearTimeout(timer);
                }
            }
        }
    }, [whaleEvents, activeAlert?.id]);

    const formatEUR = (usd: number) => {
        const eur = usd * USD_TO_EUR;
        if (eur >= 1_000_000) return `${(eur / 1_000_000).toFixed(2)}M€`;
        if (eur >= 1000) return `${(eur / 1000).toFixed(1)}K€`;
        return `${eur.toFixed(2)}€`;
    };

    const isBuy = (action: string) => 
        action.toUpperCase().includes('BUY') || 
        action.toUpperCase().includes('COMPRA');

    // Stratospheric Sanitization: Replace tacky backend labels with institutional terminology
    const sanitizeLabel = (label: string) => {
        const tacky = ["ALPHA CLEARANCE", "LIVE ALERT", "CLEARANCE ALERT"];
        const upperLabel = label.toUpperCase();
        if (tacky.some(t => upperLabel.includes(t))) return "Institutional Signal";
        return label;
    };

    return (
        <div className="fixed top-8 right-8 z-[100] pointer-events-none flex flex-col items-end">
            <AnimatePresence mode="wait">
                {activeAlert && (
                    <motion.div
                        key={activeAlert.id}
                        initial={{ opacity: 0, scale: 0.98, y: -20, filter: 'blur(12px)' }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.95, y: -10, filter: 'blur(8px)' }}
                        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                        className="pointer-events-auto"
                    >
                        <div className="relative group overflow-hidden bg-white/5 dark:bg-black/60 backdrop-blur-3xl border border-white/10 dark:border-white/5 rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex flex-col min-w-[340px]">
                            
                            {/* Subtle Ambient Glow */}
                            <div className={`absolute -top-[50%] -right-[50%] w-[100%] h-[100%] blur-[80px] rounded-full opacity-30 pointer-events-none transition-colors duration-700 ${
                                isBuy(activeAlert.action) ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                            }`} />
                            
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">
                                            Sovereign Signal
                                        </span>
                                        <h3 className="text-[16px] font-bold text-white tracking-tight">
                                            {sanitizeLabel(activeAlert.label)}
                                        </h3>
                                    </div>
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                                        isBuy(activeAlert.action) 
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                    }`}>
                                        {isBuy(activeAlert.action) ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                                        <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                                            {isBuy(activeAlert.action) ? 'COMPRA' : 'VENTA'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-10 mb-6">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-medium uppercase tracking-widest text-white/20">Valoración</span>
                                        <span className="text-[17px] font-mono font-black text-white tracking-wide">
                                            {formatEUR(activeAlert.usdNum)}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1 items-end text-right">
                                        <span className="text-[9px] font-medium uppercase tracking-widest text-white/20">Asset</span>
                                        <span className="text-[14px] font-mono font-bold text-white tracking-wide truncate max-w-[120px]">
                                            {Number(activeAlert.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-[11px] text-white/50">{activeAlert.token}</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-5 border-t border-white/5">
                                    <a 
                                        href={`https://etherscan.io/tx/${activeAlert.hash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group/link flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors duration-300"
                                    >
                                        VERIFY ON CIPHER
                                        <ExternalLink size={11} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform duration-300" />
                                    </a>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-mono text-white/20 uppercase tracking-tighter">
                                            {activeAlert.hash.slice(0, 6)}...{activeAlert.hash.slice(-4)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Minimal Progress Bar */}
                            <div className="h-[2px] w-full bg-white/5">
                                <motion.div 
                                    initial={{ width: "100%" }}
                                    animate={{ width: "0%" }}
                                    transition={{ duration: 10, ease: "linear" }}
                                    className={`h-full ${isBuy(activeAlert.action) ? 'bg-emerald-500/40' : 'bg-rose-500/40'}`}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

