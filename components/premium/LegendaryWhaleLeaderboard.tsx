"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useVIPStore } from '@/lib/vip-store';
import { Copy, Check, ExternalLink } from 'lucide-react';

export function LegendaryWhaleLeaderboard() {
    const { whaleEvents } = useVIPStore();
    const [copied, setCopied] = React.useState<string | null>(null);
    const [isExpanded, setIsExpanded] = React.useState(false);

    const rankings = React.useMemo(() => {
        const stats: Record<string, { wallet: string; volume: number; trades: number; pnl: number }> = {};
        whaleEvents?.slice(0, 500).forEach(e => {
            if (!stats[e.wallet]) stats[e.wallet] = { wallet: e.wallet, volume: 0, trades: 0, pnl: 0 };
            stats[e.wallet].volume += e.usdNum;
            stats[e.wallet].trades += 1;
            stats[e.wallet].pnl += 0; // Simulated PNL eradicated. Awaiting on-chain performance indexing.
        });
        return Object.values(stats)
            .sort((a, b) => b.volume - a.volume)
            .slice(0, isExpanded ? 500 : 50); // Show 50 by default, 500 max
    }, [whaleEvents, isExpanded]);

    const copyToClipboard = (wallet: string) => {
        navigator.clipboard.writeText(wallet);
        setCopied(wallet);
        setTimeout(() => setCopied(null), 2000);
    };

    const formatEuros = (usdFormat: number) => {
        // Simplified EUR conversion for display
        return `€${(usdFormat / 1.09 / 1000000).toFixed(2)}M`;
    };

    const getLatestTxForWallet = (wallet: string) => {
        return whaleEvents?.find(e => e.wallet === wallet);
    }

    return (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 group h-full transition-all duration-500 hover:border-cyan-500/30">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yearly Performance</span>
            </div>
            
            <div className={`divide-y divide-slate-100 overflow-y-auto custom-scrollbar transition-all duration-500 ${isExpanded ? 'max-h-[800px]' : 'max-h-[400px]'}`}>
                {rankings.map((rank, i) => {
                    const latestTx = getLatestTxForWallet(rank.wallet);
                    
                    return (
                        <div key={rank.wallet} className="p-4 flex items-center gap-6 hover:bg-slate-50 transition-colors group/row">
                            <span className="text-xl font-black text-slate-200 group-hover/row:text-[var(--aave-teal)]/20 transition-colors w-8">
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            
                            <div className="flex items-center gap-2 min-w-[200px]">
                                <span className="text-sm font-black font-mono text-slate-900">{rank.wallet.slice(0, 8)}...{rank.wallet.slice(-6)}</span>
                                <button 
                                    onClick={() => copyToClipboard(rank.wallet)}
                                    className="p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-300 hover:text-[var(--aave-teal)]"
                                >
                                    {copied === rank.wallet ? <Check size={12} /> : <Copy size={12} />}
                                </button>
                            </div>

                            <div className="flex-1 flex items-center justify-between gap-8">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume (Yearly)</span>
                                    <span className="text-sm font-black text-slate-900 font-mono tracking-tighter">
                                        {formatEuros(rank.volume)}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Latest Transfer</span>
                                    <span className="text-sm font-black text-[var(--aave-teal)] font-mono tracking-tighter">
                                        {latestTx ? `${formatEuros(latestTx.usdNum)} ${latestTx.token}` : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Active</span>
                                    <span className="text-xs font-bold text-slate-600">
                                        {latestTx ? new Date(latestTx.ts).toLocaleString() : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {rankings.length === 0 && (
                <div className="p-12 text-center space-y-4">
                    <Activity className="mx-auto text-slate-200 animate-pulse" size={40} />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Scanning Blockchain for Whales...</p>
                </div>
            )}

            {!isExpanded && rankings.length > 0 && (
                <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                    <button 
                        onClick={() => setIsExpanded(true)}
                        className="w-full py-4 border border-dashed border-slate-200 bg-white rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-cyan-500 hover:text-[var(--aave-teal)] transition-all flex items-center justify-center gap-2 group/btn"
                    >
                        View Full Expanded System (+450 Records)
                        <ExternalLink size={12} className="group-hover/btn:translate-y-1 transition-transform" />
                    </button>
                </div>
            )}
            {isExpanded && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">System Limit Reached: 500 Whales Displayed</span>
                </div>
            )}
        </div>
    );
}

import { Activity } from 'lucide-react';
