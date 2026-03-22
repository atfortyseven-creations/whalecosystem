"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Activity, ShieldCheck, Droplets, TrendingUp, TrendingDown } from 'lucide-react';
import { WhaleMomentumChart } from '@/components/network/whale/WhaleMomentumChart';
import { useVIPStore, EMPTY_ARRAY } from '@/lib/vip-store';

interface OverlayProps {
    symbol: string;
    onClose: () => void;
}

export const TokenChartOverlay = ({ symbol, onClose }: OverlayProps) => {
    const s = symbol.toUpperCase().trim();
    const tokenEvents = useVIPStore(state => state.tokenFeeds[s] || EMPTY_ARRAY);
    const candles = useVIPStore(state => state.candleFeeds[s] || EMPTY_ARRAY);
    
    const lastPrice = candles.length > 0 ? candles[0].haClose : 0;
    const isBull = candles.length > 1 ? candles[0].haClose >= candles[1].haClose : true;

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
    const fmtVol = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-2xl flex flex-col p-4 md:p-10 safe-top safe-bottom"
            >
                {/* Immersive Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/20 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/10 blur-[120px] rounded-full" />
                </div>

                {/* Header Section */}
                <div className="flex items-center justify-between z-10 mb-8">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <div className="flex items-baseline gap-3">
                                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase">{s}</h1>
                                <span className={`text-xl font-mono font-bold ${isBull ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {fmt(lastPrice)}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                    <Activity className="w-3 h-3 text-cyan-400" />
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Live Matrix</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    Immersive Heikin-Ashi Analysis
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={onClose}
                        className="p-4 hover:bg-white/10 rounded-full transition-colors text-white group"
                    >
                        <X className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                {/* Main Viewport */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 overflow-hidden z-10">
                    
                    {/* Immersive Chart (Left 3/4) */}
                    <div className="lg:col-span-3 flex flex-col bg-white/[0.02] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
                        <div className="flex-1 p-6 relative">
                            <WhaleMomentumChart symbol={s} showAxes={true} />
                        </div>
                    </div>

                    {/* Metadata & Signals (Right 1/4) */}
                    <div className="flex flex-col gap-8 h-full overflow-hidden">
                        
                        {/* Token Core Metrics */}
                        <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-6 space-y-6">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                <span>Core Telemetry</span>
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">Volume (1H)</span>
                                    <p className="text-xl font-black text-white font-mono">${fmtVol(candles.reduce((acc, c) => acc + c.volume, 0))}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">Trend Strength</span>
                                    <p className={`text-xl font-black font-mono ${isBull ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {isBull ? 'STRONG' : 'WEAK'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Large Transfers (Specific to this Token) */}
                        <div className="flex-1 flex flex-col bg-white/[0.03] border border-white/10 rounded-[32px] overflow-hidden">
                            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-white tracking-[0.2em]">Live Flow</span>
                                <Droplets className="w-4 h-4 text-cyan-400 animate-pulse" />
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                {tokenEvents.length > 0 ? (
                                    <div className="space-y-3">
                                        {tokenEvents.slice(0, 20).map((e, i) => (
                                            <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-mono text-cyan-400">{e.wallet.slice(0, 8)}...</span>
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${e.action === 'BUY' ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'}`}>
                                                        {e.action}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-baseline">
                                                    <span className="text-[14px] font-black text-white font-mono">{fmt(e.usdNum)}</span>
                                                    <span className="text-[10px] text-slate-500 font-bold">{e.token}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center opacity-30">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white">No Flow Detected</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="mt-8 flex justify-center items-center gap-10 opacity-40 hover:opacity-100 transition-opacity z-10 text-white">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Heikin-Ashi v1.02</span>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-rose-500" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Persistent Sync Active</span>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
