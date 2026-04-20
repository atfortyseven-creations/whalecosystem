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
        <div className="w-full h-full min-h-0 p-6 flex flex-col text-[#050505] font-sans overflow-hidden">
            <div className="flex-1 w-full bg-white border border-[#E5E5E5] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col min-h-0">
                
                {/* ── EXCHANGE STATUS TICKER ── */}
                <div className="shrink-0 w-full border-b border-[#E5E5E5] bg-[#FAF9F6] flex items-center px-6 overflow-x-auto whitespace-nowrap scrollbar-hide py-2 gap-8">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#888888] shrink-0">
                        <Clock size={12} />
                        Global Markets
                    </div>
                    {exchanges.map((ex) => (
                        <div key={ex.name} className="flex items-center gap-2 shrink-0">
                            <div className={`w-1.5 h-1.5 rounded-full ${ex.open ? 'bg-[#00C076] shadow-[0_0_8px_#00C076]' : 'bg-[#FF3B30]'}`} />
                            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#050505]">
                                {ex.name} <span className="text-[#888888] font-normal">[{ex.open ? 'OPEN' : 'CLOSED'}]</span>
                            </span>
                        </div>
                    ))}
                </div>

                {/* ── THE POST HEADER ── */}
                <div className="shrink-0 px-6 pt-5 pb-4 border-b border-[#E5E5E5] flex items-center justify-between bg-white">
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-[#050505]">
                                The Whale Post
                            </h1>
                        </div>
                        <p className="text-[10px] text-[#050505]/40 font-bold uppercase tracking-[0.2em] leading-tight">
                            Global macroeconomic signal aggregation and curation.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <input 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                            placeholder="Search publications…"
                            className="w-full md:w-64 bg-transparent border-b border-[#E5E5E5] text-[11px] font-black uppercase tracking-widest text-[#050505] placeholder:text-[#888888] pb-1 outline-none focus:border-[#050505] transition-all"
                        />
                        <button onClick={() => refetch()} disabled={loading} className="p-2 border border-[#E5E5E5] rounded-full hover:bg-[#FAF9F6] text-[#050505] transition-all disabled:opacity-50">
                            <RefreshCw size={14} className={`${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* ── NEWS STACK ── */}
                <div className="flex-1 overflow-y-auto msv-hide-scrollbar flex flex-col divide-y divide-[#E5E5E5]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
                            <Loader2 size={32} className="animate-spin text-[#E5E5E5]" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#888888]">WAITING FOR ON-CHAIN INTEL ENDPOINT</p>
                        </div>
                    ) : filtered.map((a) => {
                        const isExpanded = expandedId === a.id;
                        return (
                            <div key={a.id} className="flex flex-col group">
                                <div onClick={() => setExpandedId(isExpanded ? null : a.id)} className={`flex flex-col md:flex-row md:items-center px-6 md:px-10 py-5 gap-4 md:gap-8 cursor-pointer transition-colors ${isExpanded ? 'bg-[#FAF9F6]' : 'hover:bg-[#FAF9F6]'}`}>
                                    <div className="w-full md:w-40 shrink-0 flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start gap-1">
                                        <span className={`text-[10px] font-black uppercase tracking-widest text-[#050505]`}>{a.source}</span>
                                        <span className={`text-[11px] font-serif text-[#888888]`}>{timeAgo(a.publishedAt)}</span>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h2 className={`font-serif text-lg md:text-xl font-bold leading-tight tracking-tight text-[#050505]`}>{a.title}</h2>
                                    </div>
                                    <div className="hidden md:flex shrink-0 w-8 justify-end">
                                        <div className={`w-2 h-2 rounded-full ${a.sentiment === 'bullish' ? 'bg-[#00C076]' : a.sentiment === 'bearish' ? 'bg-[#FF3B30]' : 'bg-[#E5E5E5]'}`} />
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden bg-white border-t border-[#E5E5E5]">
                                            <div className="px-6 md:px-10 py-6 md:pl-[224px] pr-6 md:pr-16 flex flex-col space-y-4">
                                                <p className="font-serif text-base leading-relaxed text-[#555555]">{a.summary}</p>
                                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-4 mt-2 border-t border-[#E5E5E5]">
                                                    <div className="flex items-center gap-4">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${a.isFake ? 'text-[#FF3B30]' : 'text-[#00C076]'}`}><ShieldCheck size={12}/> {a.isFake ? 'Unverified' : 'Verified Source'}</span>
                                                        <div className="w-px h-4 bg-[#E5E5E5]"/>
                                                        <span className="text-[11px] text-[#050505] font-mono font-black">Integrity: {a.veracityScore}%</span>
                                                    </div>
                                                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2 bg-[#050505] text-[#FAF9F6] rounded-lg text-[9px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity">Full Report <ExternalLink size={12}/></a>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
