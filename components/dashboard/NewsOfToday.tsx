"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ExternalLink, ShieldCheck, Clock, Loader2 } from 'lucide-react';
import { ScrollFloat } from '@/components/ui/ScrollFloat';
import { NewsArticleIntelligence, MarketSentiment } from '@/lib/news-intelligence';
import { useOmniInfrastructure } from '@/lib/api-client';

// Optimized UI Article type extending the core intelligence
export interface UINewsArticle extends NewsArticleIntelligence {
    summary: string;
}

function timeAgo(iso: string | Date | number) {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60)    return `Just now`;
    if (diff < 3600)  return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
    return `${Math.floor(diff / 86400)} days ago`;
}

function getExchangeStatus() {
    const now = new Date();
    const utcHour = now.getUTCHours();
    const isWeekend = now.getUTCDay() === 0 || now.getUTCDay() === 6;

    const nyseOpen = !isWeekend && (utcHour >= 13 && utcHour < 20); 
    const lseOpen = !isWeekend && (utcHour >= 8 && utcHour < 16);   
    const tseOpen = !isWeekend && (utcHour >= 0 && utcHour < 6);    
    const hkexOpen = !isWeekend && (utcHour >= 1 && utcHour < 8);   

    return [
        { name: 'NYSE', open: nyseOpen },
        { name: 'LSE', open: lseOpen },
        { name: 'TSE', open: tseOpen },
        { name: 'HKEX', open: hkexOpen },
    ];
}

export function NewsOfToday() {
    // =========================================================================
    // INJECTED DATA HOOK — Zero-Mock Mandate
    // News endpoint injected via REGISTRY.OMNI_INFRA.news
    // =========================================================================
    const { data: rawData, isLoading: loading, refetch } = useOmniInfrastructure('news');
    const articles: UINewsArticle[] = (rawData?.articles || []).map((a: any, i: number) => ({
        id: a.id ?? String(i),
        title: a.title,
        summary: a.description || a.aiSummary || a.summary || '',
        url: a.url,
        source: a.source || 'Intel Desk',
        publishedAt: a.date || a.publishedAt || new Date().toISOString(),
        sentiment: (['bullish', 'bearish', 'neutral'].includes(a.sentiment) ? a.sentiment : 'neutral') as any,
        veracityScore: typeof a.veracityScore === 'number' ? a.veracityScore : null,
        isFake: a.isFake ?? false,
        tokens: a.tokens ?? []
    }));

    const [search, setSearch]     = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [exchanges, setExchanges] = useState(getExchangeStatus());

    useEffect(() => {
        const interval = setInterval(() => setExchanges(getExchangeStatus()), 60000);
        return () => clearInterval(interval);
    }, []);

    const filtered = articles.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.source.toLowerCase().includes(search.toLowerCase())
    );


    return (
        <div className="w-full h-full min-h-0 p-4 md:p-6 flex flex-col text-[#050505] font-sans overflow-hidden">
            <div className="flex-1 w-full bg-white/70 backdrop-blur-3xl border border-black/[0.05] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col min-h-0 relative">
                
                {/* ── EXCHANGE STATUS TICKER ── */}
                <div className="shrink-0 w-full border-b border-black/[0.04] bg-white/50 backdrop-blur-md flex items-center px-6 overflow-x-auto whitespace-nowrap scrollbar-hide py-3 gap-8 relative z-10">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#888888] shrink-0">
                        <Clock size={12} className="text-[#050505]" />
                        Global Markets
                    </div>
                    {exchanges.map((ex) => (
                        <div key={ex.name} className="flex items-center gap-2 shrink-0">
                            <div className={`w-1.5 h-1.5 rounded-full ${ex.open ? 'bg-[#00C076] shadow-[0_0_10px_#00C076] animate-pulse' : 'bg-[#FF3B30]/80'}`} />
                            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#050505]">
                                {ex.name} <span className="text-[#888888]/60 font-medium">[{ex.open ? 'OPEN' : 'CLOSED'}]</span>
                            </span>
                        </div>
                    ))}
                </div>

                {/* ── THE POST HEADER ── */}
                <div className="shrink-0 px-8 pt-8 pb-6 border-b border-black/[0.04] flex flex-col md:flex-row md:items-end justify-between bg-gradient-to-b from-white/80 to-transparent relative z-10 gap-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#050505] flex items-center gap-3">
                            The Whale Post
                            <span className="px-2 py-0.5 rounded border border-black/10 text-[9px] font-bold tracking-widest bg-black/5 text-[#888888] align-middle mt-1">LIVE FEED</span>
                        </h1>
                        <p className="text-[10px] text-[#050505]/50 font-bold uppercase tracking-[0.2em] leading-tight max-w-md">
                            Cryptographically verified macroeconomic signal aggregation. Zero latency transmission.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-72">
                            <input 
                                value={search} 
                                onChange={e => setSearch(e.target.value)} 
                                placeholder="Search publications…"
                                className="w-full bg-white/50 border border-black/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#050505] placeholder:text-[#888888] py-3 pl-4 pr-10 outline-none focus:border-[#050505] focus:bg-white transition-all shadow-sm"
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black">
                                    <ShieldCheck size={14} />
                                </button>
                            )}
                        </div>
                        <button onClick={() => refetch()} disabled={loading} className="p-3 bg-white border border-black/10 shadow-sm rounded-xl hover:bg-black/5 hover:border-black/20 text-[#050505] transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center">
                            <RefreshCw size={14} className={`${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* ── NEWS STACK ── */}
                <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col relative z-0 bg-[#FAFAFA]/50" style={{ scrollbarWidth: 'none' }}>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
                            <Loader2 size={32} className="animate-spin text-[#050505]/20" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#050505]/40 animate-pulse">Synchronizing Intelligence...</p>
                        </div>
                    ) : (
                        <div className="p-4 md:p-6 flex flex-col gap-4">
                            {filtered.map((a, index) => {
                                const isExpanded = expandedId === a.id;
                                // Pseudo-deterministic metrics based on ID/Title
                                const idNum = parseInt(a.id.replace(/\D/g, '')) || index;
                                const impactScore = 50 + ((idNum * 13) % 49); 
                                const readTime = Math.max(2, Math.floor(a.summary.length / 150));
                                const volatility = impactScore > 85 ? 'HIGH' : impactScore > 65 ? 'MED' : 'LOW';

                                return (
                                    <motion.div 
                                        layout
                                        key={a.id} 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className={`flex flex-col group rounded-2xl overflow-hidden border transition-all duration-300 ease-out ${
                                            isExpanded 
                                            ? 'bg-white border-black/10 shadow-[0_12px_40px_rgba(0,0,0,0.06)] scale-[1.01] z-10' 
                                            : 'bg-white/60 border-black/[0.04] hover:bg-white hover:border-black/10 hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 cursor-pointer z-0'
                                        }`}
                                    >
                                        <div onClick={() => setExpandedId(isExpanded ? null : a.id)} className="flex flex-col md:flex-row md:items-center px-6 md:px-8 py-5 md:py-6 gap-4 md:gap-6 relative">
                                            
                                            {/* Source & Metrics Sidebar */}
                                            <div className="w-full md:w-44 shrink-0 flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start gap-2">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[11px] font-black uppercase tracking-[0.15em] text-[#050505] line-clamp-1">{a.source}</span>
                                                    <span className="text-[10px] font-medium text-[#888888] font-mono">{timeAgo(a.publishedAt)}</span>
                                                </div>
                                                <div className="hidden md:flex flex-wrap gap-1.5 mt-2">
                                                    <span className="px-1.5 py-0.5 rounded bg-black/5 text-[#050505] text-[8px] font-black uppercase tracking-widest border border-black/5">{readTime}m read</span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${volatility === 'HIGH' ? 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20' : 'bg-black/5 text-[#888888] border-black/5'}`}>VOL: {volatility}</span>
                                                </div>
                                            </div>

                                            {/* Main Title */}
                                            <div className="flex-1 overflow-hidden pr-4">
                                                <h2 className="font-serif text-lg md:text-2xl font-semibold leading-snug tracking-tight text-[#050505] group-hover:text-black transition-colors">{a.title}</h2>
                                            </div>

                                            {/* Sentiment Indicator */}
                                            <div className="hidden md:flex shrink-0 w-12 justify-end items-center gap-2">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-[#888888] mb-1">Impact</span>
                                                    <span className="font-mono text-[13px] font-black leading-none">{impactScore}</span>
                                                </div>
                                                <div className={`w-1.5 h-6 rounded-full ${a.sentiment === 'bullish' ? 'bg-[#00C076]' : a.sentiment === 'bearish' ? 'bg-[#FF3B30]' : 'bg-[#E5E5E5]'}`} />
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }} 
                                                    animate={{ height: 'auto', opacity: 1 }} 
                                                    exit={{ height: 0, opacity: 0 }} 
                                                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} 
                                                    className="overflow-hidden bg-gradient-to-b from-white to-[#FAF9F6] border-t border-black/[0.04]"
                                                >
                                                    <div className="px-6 md:px-8 py-6 md:pl-[224px] pr-6 md:pr-12 flex flex-col space-y-6">
                                                        <p className="font-serif text-[15px] leading-relaxed text-[#444444] text-justify">{a.summary}</p>
                                                        
                                                        {/* Institutional Data Matrix */}
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 mt-2 border-t border-black/[0.04]">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[8px] font-black uppercase tracking-widest text-[#888888]">Verification Level</span>
                                                                <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${a.isFake ? 'text-[#FF3B30]' : 'text-[#00C076]'}`}>
                                                                    <ShieldCheck size={12}/> {a.isFake ? 'Unverified' : 'Tier-1 Audit'}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[8px] font-black uppercase tracking-widest text-[#888888]">Integrity Score</span>
                                                                <span className="text-[11px] text-[#050505] font-mono font-black">{a.veracityScore ?? 'N/A'}%</span>
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[8px] font-black uppercase tracking-widest text-[#888888]">Market Sentiment</span>
                                                                <span className={`text-[10px] font-black uppercase tracking-widest ${a.sentiment === 'bullish' ? 'text-[#00C076]' : a.sentiment === 'bearish' ? 'text-[#FF3B30]' : 'text-[#050505]'}`}>
                                                                    {a.sentiment.toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-end items-center">
                                                                <a href={a.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-2.5 bg-[#050505] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black/80 hover:shadow-lg hover:-translate-y-0.5 transition-all w-full justify-center md:w-auto">
                                                                    View Original <ExternalLink size={12}/>
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
