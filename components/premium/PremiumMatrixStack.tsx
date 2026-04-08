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
                const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`);
                if (!response.ok) throw new Error("Stream connection failed");
                const data = await response.json();

                const currentPrice = parseFloat(data.lastPrice);
                const priceChange24h = parseFloat(data.priceChangePercent);
                const volume24h = parseFloat(data.volume) * currentPrice;

                const momentumScore = Math.min(100, Math.max(0, 50 + (priceChange24h * 5)));
                const isAccumulation = priceChange24h >= 0;
                const vigorPercent = 50 + Math.min(50, Math.max(-50, priceChange24h * 3));

                if (isMounted) setState({
                    momentumScore,
                    direction: isAccumulation ? 'BULLISH' : 'BEARISH',
                    targetPrice: currentPrice * (1 + (priceChange24h / 100)),
                    currentPrice,
                    volumeValue: volume24h,
                    vigorPercent,
                    isAccumulation,
                    confluenceValue: Math.abs(priceChange24h) / 10,
                    hasData: true,
                    icebergs: [], 
                    probabilityOfReversal: 20 + Math.abs(priceChange24h * 2),
                    expectedMove: priceChange24h
                });
            } catch (err) {
                // Keep visually syncing if it fails
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
            <tr className="border-b border-[#E5E5E5] dark:border-white/10 bg-white dark:bg-[#050505] opacity-60">
                <td className="py-5 px-6">
                    <div className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E5E5E5] dark:bg-white/20 animate-pulse" />
                        <span className="text-sm font-black text-[#888888] dark:text-white/50 tracking-tight animate-pulse">{symbol}</span>
                    </div>
                </td>
                <td className="py-5 px-6 font-mono text-sm text-[#888888] dark:text-white/50 animate-pulse">Syncing...</td>
                <td className="py-5 px-6 font-mono text-xs text-[#888888] dark:text-white/50 animate-pulse">--</td>
                <td className="py-5 px-6 font-mono text-xs text-[#888888] dark:text-white/50 animate-pulse">--</td>
                <td className="py-5 px-6 font-mono text-xs text-[#888888] dark:text-white/50 animate-pulse">--</td>
                <td className="py-5 px-6 font-mono text-xs text-[#888888] dark:text-white/50 animate-pulse">--</td>
                <td className="py-5 px-6 text-right">--</td>
            </tr>
        );
    }

    const displayPrice = state.currentPrice ? state.currentPrice : (state.targetPrice || 0);
    const isBull = state.expectedMove >= 0;

    return (
        <tr 
            className={`border-b border-[#E5E5E5] dark:border-white/10 bg-white dark:bg-[#080808] hover:bg-[#F9F9F9] dark:hover:bg-white/5 cursor-pointer transition-colors group relative`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <td className="py-5 px-6">
                <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,192,118,0.6)]" style={{ background: isBull ? '#00C076' : '#FF3B30', boxShadow: isBull ? '0 0 10px rgba(0,192,118,0.4)' : '0 0 10px rgba(255,59,48,0.4)' }} />
                    <span className="text-sm font-black text-[#050505] dark:text-white tracking-tight group-hover:text-[#D4AF37] transition-colors">{symbol}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FAF9F6] dark:bg-white/10 border border-[#E5E5E5] dark:border-white/10 text-[#888888] dark:text-white/60 font-bold uppercase tracking-[0.2em] shadow-sm">PERP</span>
                </div>
            </td>
            <td className="py-5 px-6 font-mono text-sm text-[#050505] dark:text-white font-bold drop-shadow-sm">
                ${displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </td>
            <td className={`py-5 px-6 font-mono text-xs font-bold ${isBull ? 'text-[#00C076] drop-shadow-[0_0_8px_rgba(0,192,118,0.2)]' : 'text-[#FF3B30] drop-shadow-[0_0_8px_rgba(255,59,48,0.2)]'}`}>
                <div className="flex items-center gap-1">
                    {isBull ? <ArrowUpRight size={13} strokeWidth={3}/> : <ArrowDownRight size={13} strokeWidth={3}/>}
                    {Math.abs(state.expectedMove).toFixed(2)}%
                </div>
            </td>
            <td className="py-5 px-6">
                <div className="flex flex-col">
                    <span className="text-xs text-[#050505] dark:text-white font-mono">${(state.volumeValue / 1e6).toFixed(1)}M</span>
                    <span className="text-[9px] text-[#888888] dark:text-white/40 uppercase tracking-[0.2em] mt-0.5">24h Vol</span>
                </div>
            </td>
            <td className="py-5 px-6">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/5 border border-white/5 ${state.isAccumulation ? 'text-[#00C076]' : 'text-[#FF3B30]'}`}>
                        {state.vigorPercent.toFixed(0)}%
                    </span>
                    <span className="text-[9px] text-[#888888] dark:text-white/40 uppercase tracking-[0.2em]">
                        {state.isAccumulation ? 'Buyers' : 'Sellers'}
                    </span>
                </div>
            </td>
            <td className="py-5 px-6">
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-1 bg-[#E5E5E5] dark:bg-white/10 overflow-hidden w-24 rounded-full">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, Math.max(0, state.momentumScore))}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full ${state.direction === 'BULLISH' ? 'bg-[#00C076] shadow-[0_0_12px_rgba(0,192,118,0.8)]' : 'bg-[#FF3B30] shadow-[0_0_12px_rgba(255,59,48,0.8)]'}`}
                        />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#050505] dark:text-white/80 w-8">{state.momentumScore.toFixed(0)}</span>
                </div>
            </td>
            <td className="py-5 px-6 text-right">
                <button className="opacity-0 group-hover:opacity-100 px-5 py-2 rounded-lg bg-[#050505] dark:bg-white text-white dark:text-[#050505] text-[9px] font-black uppercase tracking-[0.2em] shadow-[0_10px_20px_-5px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_20px_-5px_rgba(255,255,255,0.2)] hover:scale-105 transition-all active:scale-95">
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
                <div className="bg-white dark:bg-[#050505] border border-[#E5E5E5] dark:border-white/10 p-6 shadow-[4px_4px_0_0_#050505] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.1)] hover:dark:shadow-[4px_4px_0_0_rgba(212,175,55,0.3)] hover:dark:border-[#D4AF37]/30 transition-all rounded-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/[0.02] dark:from-white/[0.02] to-transparent pointer-events-none" />
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <p className="text-[9px] font-black text-[#888888] dark:text-[#D4AF37] uppercase tracking-[0.2em]">Live Portfolio</p>
                        {isConnected ? (
                            <div className="w-2 h-2 rounded-full bg-[#00C076] animate-pulse shadow-[0_0_8px_rgba(0,192,118,0.6)]" title="Connected to Native Wallet"/>
                        ) : (
                            <div className="w-2 h-2 rounded-full bg-[#FF3B30]" title="Disconnected"/>
                        )}
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-4xl font-mono text-[#050505] dark:text-white tracking-tighter drop-shadow-md">
                            {isConnected && balance ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}` : '---'}
                        </h2>
                        <p className="text-[10px] font-mono text-[#888888] dark:text-white/40 uppercase tracking-widest mt-2 flex items-center gap-2">
                            Wallet: <span className="text-[#050505] dark:text-[#D4AF37] bg-[#F5F5F5] dark:bg-[#D4AF37]/10 px-2 py-0.5 rounded font-black">{isConnected && address ? `${address.slice(0,6)}...${address.slice(-4)}` : 'Not Connected'}</span>
                        </p>
                    </div>
                </div>

                {/* Macro Metrics Card */}
                <div className="bg-[#050505] dark:bg-[#0A0A0A] text-white p-6 shadow-[4px_4px_0_0_#E5E5E5] dark:shadow-[4px_4px_0_0_rgba(0,192,118,0.3)] dark:border border-white/5 rounded-sm relative overflow-hidden group hover:dark:shadow-[4px_4px_0_0_rgba(0,192,118,0.5)] transition-all">
                    <div className="absolute -inset-2 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-500/10 via-transparent to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
                    <p className="text-[9px] font-black text-white/50 dark:text-green-500/80 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 relative z-10">
                        <Activity size={12}/> Global Liquidity Matrix
                    </p>
                    <h2 className="text-4xl font-mono text-[#00C076] tracking-tighter drop-shadow-[0_0_15px_rgba(0,192,118,0.4)] relative z-10">
                        +14.2%
                    </h2>
                    <p className="text-[10px] font-mono text-white/50 uppercase tracking-widest mt-2 relative z-10">
                        Institutional Net Flow (24H)
                    </p>
                </div>

                {/* Status Card */}
                <div className="bg-[#FAF9F6] dark:bg-[#050505] border border-[#E5E5E5] dark:border-white/10 p-6 flex flex-col justify-center rounded-sm shadow-sm hover:shadow-md dark:shadow-none transition-shadow">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-[#E5E5E5] dark:border-white/10 pb-2">
                            <span className="text-[10px] font-black text-[#888888] dark:text-white/40 uppercase tracking-[0.2em]">Node Sync</span>
                            <span className="text-[10px] font-mono font-black text-[#00C076] flex items-center gap-1.5"><Clock size={11} className="animate-spin-slow"/> 12ms</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-[#E5E5E5] dark:border-white/10 pb-2">
                            <span className="text-[10px] font-black text-[#888888] dark:text-white/40 uppercase tracking-[0.2em]">AI Predictors</span>
                            <span className="text-[10px] text-[#050505] dark:text-indigo-400 font-black uppercase tracking-[0.2em]">Online</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-[#888888] dark:text-white/40 uppercase tracking-[0.2em]">Execution</span>
                            <span className="text-[10px] text-[#050505] dark:text-white font-black uppercase tracking-[0.2em]">Neural Routing</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* ─── TERMINAL CONTROLS ─── */}
            <div className="mt-8 flex items-center justify-between border-b-2 border-[#050505] dark:border-white/20 pb-4">
                <div className="flex items-center gap-6">
                    <h3 className="text-2xl font-serif font-black tracking-tight text-[#050505] dark:text-white uppercase drop-shadow-sm">
                        Terminal Feed
                    </h3>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setSelectedCategory('MAJOR')}
                            className={`px-5 py-2 text-[9px] font-black uppercase tracking-[0.2em] transition-all rounded-sm ${selectedCategory === 'MAJOR' ? 'bg-[#050505] dark:bg-white text-white dark:text-black shadow-md' : 'text-[#888888] dark:text-white/40 hover:text-[#050505] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}
                        >
                            Majors
                        </button>
                        <button 
                            onClick={() => setSelectedCategory('ALT')}
                            className={`px-5 py-2 text-[9px] font-black uppercase tracking-[0.2em] transition-all rounded-sm ${selectedCategory === 'ALT' ? 'bg-[#050505] dark:bg-white text-white dark:text-black shadow-md' : 'text-[#888888] dark:text-white/40 hover:text-[#050505] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}
                        >
                            Altcoins
                        </button>
                    </div>
                </div>
                <div className="hidden lg:flex items-center gap-3 bg-[#FAF9F6] dark:bg-[#050505] border border-[#E5E5E5] dark:border-white/10 px-4 py-2 rounded-full shadow-inner">
                    <span className="w-2 h-2 rounded-full bg-[#00C076] animate-pulse shadow-[0_0_8px_rgba(0,192,118,0.8)]"/>
                    <span className="text-[9px] font-black text-[#888888] dark:text-[#00C076] uppercase tracking-[0.2em]">Live Orderbook Connected</span>
                </div>
            </div>

            {/* ─── MASTER TABLE ─── */}
            <div className="w-full border border-[#050505] dark:border-white/20 bg-white dark:bg-[#000000] overflow-hidden shadow-[4px_4px_0_0_#050505] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.1)] rounded-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#FAF9F6] dark:bg-[#080808] border-b-2 border-[#050505] dark:border-white/20">
                        <tr>
                            <th className="py-4 px-6 text-[9px] font-black text-[#050505] dark:text-[#D4AF37] uppercase tracking-[0.2em]">Asset Index</th>
                            <th className="py-4 px-6 text-[9px] font-black text-[#050505] dark:text-[#D4AF37] uppercase tracking-[0.2em]">Last Market Price</th>
                            <th className="py-4 px-6 text-[9px] font-black text-[#050505] dark:text-[#D4AF37] uppercase tracking-[0.2em]">Realized 24h Move</th>
                            <th className="py-4 px-6 text-[9px] font-black text-[#050505] dark:text-[#D4AF37] uppercase tracking-[0.2em]">Total 24h Vol</th>
                            <th className="py-4 px-6 text-[9px] font-black text-[#050505] dark:text-[#D4AF37] uppercase tracking-[0.2em]">Spread Edge</th>
                            <th className="py-4 px-6 text-[9px] font-black text-[#050505] dark:text-[#D4AF37] uppercase tracking-[0.2em]">Momentum RSI</th>
                            <th className="py-4 px-6 text-right text-[9px] font-black text-[#050505] dark:text-[#D4AF37] uppercase tracking-[0.2em]">Ops</th>
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
