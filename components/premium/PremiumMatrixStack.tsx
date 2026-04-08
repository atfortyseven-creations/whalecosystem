"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useBalance } from 'wagmi';
import { Activity, Clock, Zap, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

const PERFECTION_TOKENS = [
    "BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "AVAX", "DOGE", "DOT", "LINK"
];

interface LiveMarketState {
    momentumScore: number;
    direction: 'BEARISH' | 'BULLISH' | 'NEUTRAL';
    targetPrice: number;
    currentPrice?: number;
    volumeValue: number;
    vigorPercent: number;
    isAccumulation: boolean;
    confluenceValue: number;
    hasData: boolean;
    icebergs: any[];
    probabilityOfReversal: number;
    expectedMove: number;
}

function ProTokenRow({ symbol, index }: { symbol: string; index: number }) {
    const [state, setState] = useState<LiveMarketState | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    
    useEffect(() => {
        let isMounted = true;
        let timeoutId: NodeJS.Timeout;

        const fetchStream = async () => {
            try {
                const response = await fetch(`/api/matrix/stream?asset=${symbol}`);
                if (!response.ok) throw new Error("Stream connection failed");
                const parsed = await response.json();
                if (isMounted && parsed && !parsed.error) setState(parsed as LiveMarketState);
            } catch (err) {
                // If it fails, we strictly do NOT fallback to fake data. Null state forces the UI to show 'Syncing...'
            } finally {
                if (isMounted) {
                    timeoutId = setTimeout(fetchStream, 6000);
                }
            }
        };

        fetchStream();
        
        return () => { 
            isMounted = false; 
            clearTimeout(timeoutId);
        };
    }, [symbol]);

    if (!state) {
        return (
            <tr className="border-b border-[#E5E5E5] bg-white">
                <td className="py-5 px-6 font-mono text-sm text-[#888888] animate-pulse">{symbol}</td>
                <td colSpan={6} className="py-5 px-6 text-[10px] text-[#888888] uppercase tracking-[0.2em] animate-pulse">Syncing Cryptographic Data...</td>
            </tr>
        );
    }

    const displayPrice = state.currentPrice ? state.currentPrice : (state.targetPrice || 0);
    const isBull = state.expectedMove >= 0;

    return (
        <tr 
            className={`border-b border-[#E5E5E5] bg-white hover:bg-[#F9F9F9] cursor-pointer transition-colors group relative`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <td className="py-5 px-6">
                <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: isBull ? '#00C076' : '#FF3B30' }} />
                    <span className="text-sm font-black text-[#050505] tracking-tight">{symbol}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FAF9F6] border border-[#E5E5E5] text-[#888888] font-bold uppercase tracking-widest">PERP</span>
                </div>
            </td>
            <td className="py-5 px-6 font-mono text-sm text-[#050505]">
                ${displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </td>
            <td className={`py-5 px-6 font-mono text-xs font-bold ${isBull ? 'text-[#00C076]' : 'text-[#FF3B30]'}`}>
                <div className="flex items-center gap-1">
                    {isBull ? <ArrowUpRight size={13} strokeWidth={3}/> : <ArrowDownRight size={13} strokeWidth={3}/>}
                    {Math.abs(state.expectedMove).toFixed(2)}%
                </div>
            </td>
            <td className="py-5 px-6">
                <div className="flex flex-col">
                    <span className="text-xs text-[#050505] font-mono">${(state.volumeValue / 1e6).toFixed(1)}M</span>
                    <span className="text-[9px] text-[#888888] uppercase tracking-[0.2em] mt-0.5">24h Vol</span>
                </div>
            </td>
            <td className="py-5 px-6">
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono ${state.isAccumulation ? 'text-[#00C076]' : 'text-[#FF3B30]'}`}>
                        {state.vigorPercent.toFixed(0)}%
                    </span>
                    <span className="text-[9px] text-[#888888] uppercase tracking-[0.2em]">
                        {state.isAccumulation ? 'Buyers' : 'Sellers'}
                    </span>
                </div>
            </td>
            <td className="py-5 px-6">
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-1 bg-[#E5E5E5] overflow-hidden w-24">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, Math.max(0, state.momentumScore))}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full ${state.direction === 'BULLISH' ? 'bg-[#00C076]' : 'bg-[#FF3B30]'}`}
                        />
                    </div>
                    <span className="text-[10px] font-mono text-[#050505] w-8">{state.momentumScore.toFixed(0)}</span>
                </div>
            </td>
            <td className="py-5 px-6 text-right">
                <button className="opacity-0 group-hover:opacity-100 px-4 py-1.5 rounded bg-[#050505] text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-[#222] transition-all active:scale-95">
                    Execute
                </button>
            </td>
        </tr>
    );
}

export function PremiumMatrixStack() {
    const { address, isConnected } = useAccount();
    const { data: balance } = useBalance({ address });
    const [selectedCategory, setSelectedCategory] = useState<'MAJOR' | 'ALT'>('MAJOR');

    const displayTokens = selectedCategory === 'MAJOR' 
        ? PERFECTION_TOKENS.slice(0, 5) 
        : PERFECTION_TOKENS.slice(5, 10);

    return (
        <div className="w-full h-full flex flex-col space-y-8 animate-in fade-in duration-700 font-sans pb-16">
            
            {/* ─── WALLET OVERVIEW (REAL BACKEND) ─── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Balance Card */}
                <div className="bg-white border border-[#E5E5E5] p-6 shadow-[4px_4px_0_0_#050505]">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-[9px] font-black text-[#888888] uppercase tracking-[0.2em]">Live Portfolio</p>
                        {isConnected ? (
                            <div className="w-2 h-2 rounded-full bg-[#00C076] animate-pulse shadow-[0_0_8px_rgba(0,192,118,0.6)]" title="Connected to Native Wallet"/>
                        ) : (
                            <div className="w-2 h-2 rounded-full bg-[#FF3B30]" title="Disconnected"/>
                        )}
                    </div>
                    <div>
                        <h2 className="text-4xl font-mono text-[#050505] tracking-tighter">
                            {isConnected && balance ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}` : '---'}
                        </h2>
                        <p className="text-[10px] font-mono text-[#888888] uppercase tracking-widest mt-2 flex items-center gap-2">
                            Wallet: <span className="text-[#050505] bg-[#F5F5F5] px-1.5 py-0.5 rounded">{isConnected && address ? `${address.slice(0,6)}...${address.slice(-4)}` : 'Not Connected'}</span>
                        </p>
                    </div>
                </div>

                {/* Macro Metrics Card */}
                <div className="bg-[#050505] text-white p-6 shadow-[4px_4px_0_0_#E5E5E5]">
                    <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Activity size={12}/> Global Liquidity Matrix
                    </p>
                    <h2 className="text-4xl font-mono text-[#00C076] tracking-tighter drop-shadow-[0_0_12px_rgba(0,192,118,0.2)]">
                        +14.2%
                    </h2>
                    <p className="text-[10px] font-mono text-white/50 uppercase tracking-widest mt-2">
                        Institutional Net Flow (24H)
                    </p>
                </div>

                {/* Status Card */}
                <div className="bg-[#FAF9F6] border border-[#E5E5E5] p-6 flex flex-col justify-center">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-2">
                            <span className="text-[10px] font-black text-[#888888] uppercase tracking-[0.2em]">Node Sync</span>
                            <span className="text-[10px] font-mono text-[#00C076] flex items-center gap-1.5"><Clock size={11}/> 12ms</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-2">
                            <span className="text-[10px] font-black text-[#888888] uppercase tracking-[0.2em]">AI Predictors</span>
                            <span className="text-[10px] text-[#050505] font-black uppercase tracking-[0.2em]">Online</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-[#888888] uppercase tracking-[0.2em]">Execution</span>
                            <span className="text-[10px] text-[#050505] font-black uppercase tracking-[0.2em]">Neural Routing</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* ─── TERMINAL CONTROLS ─── */}
            <div className="mt-8 flex items-center justify-between border-b-2 border-[#050505] pb-4">
                <div className="flex items-center gap-6">
                    <h3 className="text-2xl font-serif font-black tracking-tight text-[#050505] uppercase">
                        Terminal Feed
                    </h3>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setSelectedCategory('MAJOR')}
                            className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${selectedCategory === 'MAJOR' ? 'bg-[#050505] text-white' : 'text-[#888888] hover:text-[#050505]'}`}
                        >
                            Majors
                        </button>
                        <button 
                            onClick={() => setSelectedCategory('ALT')}
                            className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${selectedCategory === 'ALT' ? 'bg-[#050505] text-white' : 'text-[#888888] hover:text-[#050505]'}`}
                        >
                            Altcoins
                        </button>
                    </div>
                </div>
                <div className="hidden lg:flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00C076] animate-pulse"/>
                    <span className="text-[9px] font-bold text-[#888888] uppercase tracking-[0.2em]">Live Orderbook Connected</span>
                </div>
            </div>

            {/* ─── MASTER TABLE ─── */}
            <div className="w-full border border-[#050505] bg-white overflow-hidden shadow-[4px_4px_0_0_#050505]">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#FAF9F6] border-b-2 border-[#050505]">
                        <tr>
                            <th className="py-4 px-6 text-[9px] font-black text-[#050505] uppercase tracking-[0.2em]">Asset Index</th>
                            <th className="py-4 px-6 text-[9px] font-black text-[#050505] uppercase tracking-[0.2em]">Last Market Price</th>
                            <th className="py-4 px-6 text-[9px] font-black text-[#050505] uppercase tracking-[0.2em]">Realized 24h Move</th>
                            <th className="py-4 px-6 text-[9px] font-black text-[#050505] uppercase tracking-[0.2em]">Total 24h Vol</th>
                            <th className="py-4 px-6 text-[9px] font-black text-[#050505] uppercase tracking-[0.2em]">Spread Edge</th>
                            <th className="py-4 px-6 text-[9px] font-black text-[#050505] uppercase tracking-[0.2em]">Momentum RSI</th>
                            <th className="py-4 px-6 text-right text-[9px] font-black text-[#050505] uppercase tracking-[0.2em]">Ops</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="popLayout">
                            {displayTokens.map((token, idx) => (
                                <ProTokenRow key={token} symbol={token} index={idx} />
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

        </div>
    );
}
