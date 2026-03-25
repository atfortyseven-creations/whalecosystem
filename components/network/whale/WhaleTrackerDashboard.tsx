"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWhaleFeed } from '@/hooks/useWhaleFeed';
import { 
    Landmark, Fingerprint, Activity, Shield, ArrowRightLeft, 
    Cpu, Database, ChevronDown, ChevronUp, Search, 
    TrendingUp, LineChart, Globe, Zap, Scale, BarChart3,
    Newspaper, X, Menu
} from 'lucide-react';
import { InstitutionalHeader } from '@/components/shared/InstitutionalHeader';
import { InmersiveConstellations } from '@/components/shared/InmersiveConstellations';
import { GlobalMarketSessions } from '@/components/premium/GlobalMarketSessions';
import { EliteIntelligenceNews } from '@/components/premium/EliteIntelligenceNews';
import Link from 'next/link';

// ─── Universal Explorer Logic ──────────────────────────────────────────
function getExplorerLink(item: any) {
    const hash = item.hash;
    const chain = (item.chain || 'ETHEREUM').toUpperCase();
    
    if (chain === 'BITCOIN' || chain === 'BTC') {
        return `/network/tx/${hash}`;
    }
    
    if (chain === 'ETHEREUM' || chain === 'ETH') {
        return `https://etherscan.io/tx/${hash}`;
    }
    
    if (chain === 'SOLANA' || chain === 'SOL') {
        return `https://solscan.io/tx/${hash}`;
    }
    
    if (chain === 'BASE') {
        return `https://basescan.org/tx/${hash}`;
    }

    if (chain === 'POLYGON' || chain === 'MATIC') {
        return `https://polygonscan.com/tx/${hash}`;
    }

    if (chain === 'ARBITRUM') {
        return `https://arbiscan.io/tx/${hash}`;
    }

    if (chain === 'OPTIMISM') {
        return `https://optimistic.etherscan.io/tx/${hash}`;
    }
    
    // Default to Etherscan if unknown EVM
    return `https://etherscan.io/tx/${hash}`;
}

// ─── Market Intelligence Row ───────────────────────────────────────────────
function TransactionRow({ item, index }: { item: any, index: number }) {
    const [isOpen, setIsOpen] = useState(false);
    const auditLink = getExplorerLink(item);
    const dateObj = new Date(item.timestamp);
    
    const fullDateTime = dateObj.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    }) + " " + dateObj.toLocaleTimeString(undefined, { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    }) + " UTC";
    
    return (
        <motion.div 
            layout
            className="group border-b border-white/5 last:border-0 bg-transparent hover:bg-white/5 transition-all duration-300"
        >
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 p-6 sm:p-8 cursor-pointer relative"
            >
                {/* Visual Status - Fixed Position on Mobile */}
                <div className="shrink-0 flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-[1.5rem] bg-white flex items-center justify-center border border-slate-200 overflow-hidden relative shadow-sm group-hover:shadow-md transition-shadow">
                         <div className={`absolute inset-0 opacity-5 ${
                             item.type?.includes('SELL') ? 'bg-rose-500' : 
                             item.type?.includes('BUY') ? 'bg-emerald-500' : 
                             'bg-slate-500'
                         }`} />
                        {item.type?.includes('SELL') ? <Scale className="text-rose-600 relative z-10" size={18} /> : 
                         item.type?.includes('BUY') ? <Zap className="text-emerald-500 relative z-10" size={18} /> :
                         <Activity className="text-slate-600 relative z-10" size={18} />}
                    </div>
                    <div className="sm:hidden flex-1">
                        <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.tier?.replace(' tier', '') || 'INST'}</span>
                             <span className={`text-[9px] font-black uppercase tracking-widest ${item.type?.includes('SELL') ? 'text-rose-600' : 'text-emerald-500'}`}>{item.type || 'TX'}</span>
                        </div>
                        <div className="text-[10px] font-mono font-black text-slate-900 mt-0.5">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div className="sm:hidden text-right">
                        <div className="text-sm font-black text-[var(--aztec-ink)]">${item.usdValue.toLocaleString()}</div>
                    </div>
                </div>

                {/* Main Transaction Info */}
                <div className="flex-1 min-w-0 space-y-2 sm:space-y-3 w-full">
                    <div className="hidden sm:flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            {item.tier?.replace(' tier', '') || 'Institutional'}
                        </span>
                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                            item.type?.includes('SELL') ? 'text-rose-600' : 
                            item.type?.includes('BUY') ? 'text-emerald-500' : 
                            'text-slate-500'
                        }`}>
                            {item.type || 'EXCHANGE TRANSFER'}
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                        <span className="text-xl sm:text-3xl font-black tracking-tighter text-slate-950 font-mono">
                            {item.amount.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                            <span className="text-xs sm:text-sm text-slate-400 ml-2 font-black">{item.asset}</span>
                        </span>
                        
                        <div className="flex items-center gap-3 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 w-full sm:w-auto">
                            <span className="text-[9px] sm:text-[11px] font-mono font-bold text-slate-500 truncate flex-1 sm:max-w-[120px]">{item.from}</span>
                            <ArrowRightLeft size={10} className="text-slate-300 shrink-0" />
                            <span className="text-[9px] sm:text-[11px] font-mono font-bold text-slate-500 truncate flex-1 sm:max-w-[120px]">{item.to}</span>
                        </div>
                    </div>
                </div>

                {/* Market Value & Time - Hidden on mobile, moved to visual status div */}
                <div className="hidden sm:block text-right space-y-1 shrink-0">
                    <div className="text-slate-950 text-xl font-black tracking-tighter font-mono">${item.usdValue.toLocaleString()}</div>
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center justify-end gap-2">
                        <Database size={10} /> {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>

                <div className="absolute top-6 right-6 sm:relative sm:top-0 sm:right-0 text-slate-300 group-hover:text-slate-900 transition-colors p-2 rounded-full hover:bg-slate-100">
                    {isOpen ? <ChevronUp size={20} /> : <Menu size={20} className="sm:hidden" />}
                    <div className="hidden sm:block">
                         {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-slate-50/30 px-8 pb-10"
                    >
                                <div className="border-t border-slate-100 pt-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        {/* Left Column: Data Context */}
                                        <div className="space-y-6">
                                            <div className="flex flex-col gap-2">
                                                <div className="text-[10px] font-black text-slate-950 uppercase tracking-[0.3em] bg-slate-100/80 px-4 py-2 rounded-lg border border-slate-200 self-start">
                                                    {fullDateTime}
                                                </div>
                                                <div className="text-[9px] font-mono font-bold text-slate-500 break-all bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                                    {item.hash}
                                                </div>
                                            </div>
                                            
                                            <div className="p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex items-center justify-between">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Execution Fee</div>
                                                <div className="text-sm font-mono font-black text-slate-950">
                                                    {item.gasPriceGwei || (item.chain === 'BITCOIN' ? 'L1 Standard' : '0.00')} <span className="text-[10px] text-slate-300">GWEI</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Right Column: Flow Context */}
                                        <div className="space-y-6 md:border-l md:border-slate-100 md:pl-12">
                                            <div className="space-y-3">
                                                <div className="p-4 bg-slate-50/30 rounded-2xl border border-slate-100">
                                                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-60">Source</div>
                                                    <div className="text-[10px] font-mono font-bold text-slate-950 break-all">{item.from}</div>
                                                </div>
                                                <div className="p-4 bg-slate-50/30 rounded-2xl border border-slate-100">
                                                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-60">Destination</div>
                                                    <div className="text-[10px] font-mono font-bold text-slate-950 break-all">{item.to}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Zone: Centered & Minimalist */}
                                    <div className="mt-12 flex flex-col items-center gap-6">
                                        <div className="text-[11px] font-black text-slate-950 flex items-center gap-2">
                                            <span className="text-slate-400 font-bold tracking-tight">Valuation:</span>
                                            <span>${item.usdValue.toLocaleString()} USD</span>
                                            <span className="text-slate-300 mx-1">|</span>
                                            <span className="text-indigo-600">({(item.usdValue * 0.92).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR)</span>
                                        </div>
                                        
                                        <a 
                                            href={auditLink}
                                            target={auditLink.startsWith('http') ? "_blank" : "_self"}
                                            rel={auditLink.startsWith('http') ? "noopener noreferrer" : ""}
                                            className="w-full max-w-xs flex items-center justify-center gap-4 px-10 py-5 rounded-3xl bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-black hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-slate-200"
                                        >
                                            <Fingerprint size={16} /> Full Audit
                                        </a>
                                    </div>
                                </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export function WhaleTrackerDashboard() {
    const { unifiedWhaleFeed, isLoading } = useWhaleFeed();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');
    const [showNews, setShowNews] = useState(false);

    const filtered = useMemo(() => {
        let result = unifiedWhaleFeed;
        if (activeTab !== 'ALL') {
            if (activeTab === 'TOKENS') {
                result = result.filter(tx => tx.chain !== 'BITCOIN');
            } else if (activeTab === 'BTC') {
                result = result.filter(tx => tx.chain === 'BITCOIN');
            }
        }
        if (searchQuery) {
            result = result.filter(tx => 
                tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tx.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tx.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tx.asset.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return result;
    }, [unifiedWhaleFeed, searchQuery, activeTab]);

    return (
        <div className="relative min-h-screen bg-transparent text-[var(--aztec-ink)] font-sans selection:bg-[var(--aztec-chartreuse)]/20 selection:text-[var(--aztec-ink)] overflow-x-hidden">
            {/* Global wallpaper is provided by ClientLayout */}

            <div className="relative z-10 w-full max-w-[2560px] mx-auto min-h-screen flex flex-col">
                {/* Institutional Header is handled by ClientLayout */}

                {/* Elite News Submenu - Retractable Sidebar */}
                <AnimatePresence>
                    {showNews && (
                        <>
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowNews(false)}
                                className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-[90]"
                            />
                            <motion.div 
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                                className="fixed right-0 top-0 h-full w-full max-w-lg z-[100] shadow-2xl"
                            >
                                <div className="absolute top-8 left-[-4.5rem] z-10">
                                    <button 
                                        onClick={() => setShowNews(false)}
                                        className="p-5 bg-slate-950 text-white rounded-full shadow-2xl hover:bg-black hover:scale-110 transition-all active:scale-90 flex items-center justify-center group"
                                    >
                                        <X size={28} className="group-hover:rotate-90 transition-transform" />
                                    </button>
                                </div>
                                <EliteIntelligenceNews />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <main className="flex-1 max-w-7xl mx-auto w-full pt-32 pb-48 px-8 space-y-32">
                    
                    {/* Header Section */}
                    <div className="flex flex-col items-center text-center space-y-16">
                        <div className="space-y-6">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-80 h-80 flex items-center justify-center mx-auto relative group"
                            >
                                <img 
                                    src="/official-whale-legendary.png" 
                                    className="w-full h-full object-contain transition-transform duration-500 scale-125 group-hover:scale-150 drop-shadow-2xl" 
                                    alt="Whale Alert Pro"
                                />
                            </motion.div>
                            <div className="space-y-4">
                                <h1 className="text-4xl sm:text-8xl font-black uppercase tracking-tighter leading-none text-slate-950">
                                    Search your <span className="text-slate-300">Transaction</span>
                                </h1>
                            </div>
                        </div>

                        {/* Market Precision Intelligence Zone */}
                        <div className="w-full flex justify-center">
                            <GlobalMarketSessions />
                        </div>

                        {/* Professional Search & Intelligence Submenu Toggle */}
                        <div className="w-full max-w-4xl flex gap-8 items-center">
                            <div className="flex-1 relative group">
                                <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none text-slate-300 group-focus-within:text-emerald-600 transition-colors">
                                    <Search size={28} />
                                </div>
                                <input 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="QUERY BY TX HASH / WALLET SIGNATURE / ASSET..."
                                    className="w-full bg-white border border-slate-200 rounded-3xl sm:rounded-[3.5rem] py-6 sm:py-10 pl-16 sm:pl-24 pr-4 sm:pr-40 text-sm sm:text-lg font-bold tracking-tight outline-none focus:border-cyan-500/50 focus:shadow-[0_50px_100px_-20px_rgba(6,182,212,0.15)] transition-all text-slate-950 placeholder:text-slate-300 shadow-xl shadow-slate-200/50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Matrix Controller */}
                    <div className="space-y-16">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-10">
                            <div className="flex items-center gap-6">
                                    {['ALL', 'BTC', 'TOKENS'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-6 sm:px-12 py-3 sm:py-5 rounded-xl sm:rounded-2xl text-[10px] sm:text-[12px] font-black uppercase tracking-[0.25em] transition-all ${
                                                activeTab === tab 
                                                ? 'bg-slate-950 text-white shadow-2xl shadow-slate-400 scale-105' 
                                                : 'bg-white text-slate-400 border border-slate-100 hover:text-slate-900 hover:border-slate-300'
                                            }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                            </div>
                            <div className="flex items-center gap-10">
                                <div className="text-right">
                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Observational Load</div>
                                    <div className="text-base font-mono font-black text-slate-950">{filtered.length} Sequences identified</div>
                                </div>
                                <div className="w-px h-12 bg-slate-200" />
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-[2rem] sm:rounded-[5rem] overflow-hidden shadow-[0_60px_150px_-30px_rgba(0,0,0,0.08)] relative">
                            {isLoading && (
                                <div className="h-[700px] flex flex-col items-center justify-center gap-10">
                                    <div className="w-16 h-16 border-[6px] border-slate-100 border-t-cyan-600 animate-spin rounded-full shadow-lg" />
                                    <div className="text-center space-y-3">
                                        <span className="block text-[12px] uppercase font-black tracking-[0.6em] text-cyan-600 animate-pulse">Synchronizing Block Data</span>
                                        <span className="block text-[10px] font-black text-slate-300 uppercase tracking-widest">Resolving Ledger State</span>
                                    </div>
                                </div>
                            )}

                            {!isLoading && filtered.length > 0 && (
                                <div className="divide-y divide-slate-100">
                                    {filtered.slice(0, 50).map((tx, i) => (
                                        <TransactionRow key={tx.id || i} item={tx} index={i} />
                                    ))}
                                </div>
                            )}

                            {!isLoading && filtered.length === 0 && (
                                <div className="h-[700px] flex flex-col items-center justify-center gap-10 opacity-30">
                                    <div className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100">
                                        <Database size={80} className="text-slate-300" />
                                    </div>
                                    <span className="text-sm uppercase font-black tracking-[0.5em] text-slate-400">Database Empty</span>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                <footer className="h-20 border-t border-[var(--aztec-ink)]/5 flex items-center justify-between px-12 bg-[var(--aztec-parchment)]/30 backdrop-blur-3xl sticky bottom-0 z-50">
                    <div className="flex items-center gap-12">
                         <div className="flex items-center gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                             <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Whale Alert Institutional Access</span>
                         </div>
                    </div>
                </footer>
            </div>
            
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
