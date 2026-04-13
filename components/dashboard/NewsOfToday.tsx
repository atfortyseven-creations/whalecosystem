"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ExternalLink, ShieldCheck, ShieldAlert, Clock } from 'lucide-react';
import { ScrollFloat } from '@/components/ui/ScrollFloat';

interface NewsArticle {
    id: string;
    title: string;
    summary: string;
    url: string;
    source: string;
    publishedAt: string;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    veracityScore: number;
    isFake: boolean;
    tokens: string[];
}

const DEMO_NEWS: NewsArticle[] = [
    {
        id: '1', 
        title: 'Institutional Grade Dark Pools Shift Strategy Ahead of Upcoming Expirations',
        summary: 'Major institutional clearing houses have initiated an unprecedented accumulation phase observed through unmapped liquidity vectors. Proprietary tracing algorithms indicate a direct correlation between these stealth acquisitions and anticipated macro environment policy shifts, effectively cornering retail slippage assumptions.',
        url: 'https://bloomberg.com', 
        source: 'Whale Core Metrics', 
        publishedAt: new Date(Date.now() - 1200000).toISOString(),
        sentiment: 'bullish', 
        veracityScore: 98, 
        isFake: false, 
        tokens: ['BTC', 'ETH'],
    },
    {
        id: '2', 
        title: 'Zero-Knowledge Cryptographic Paradigms Restructure Layer-2 Fee Geometries',
        summary: 'A consortium of primary Ethereum rollup solutions has finalized the deployment of synchronized ZK-SNARK verifiers. This infrastructural update functionally eliminates state-bloat on the L1 sequencer, reducing computational cross-chain overhead by an estimated 92% and accelerating bridging finality for enterprise-scale capital.',
        url: 'https://ethresear.ch', 
        source: 'L2 Architecture Review', 
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        sentiment: 'bullish', 
        veracityScore: 95, 
        isFake: false, 
        tokens: ['ETH', 'STRK', 'ZKS'],
    },
];

function timeAgo(iso: string) {
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
    const [articles, setArticles] = useState<NewsArticle[]>(DEMO_NEWS);
    const [loading, setLoading]   = useState(false);
    const [search, setSearch]     = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [exchanges, setExchanges] = useState(getExchangeStatus());
    
    const mountedRef = React.useRef(true);
    
    useEffect(() => {
        mountedRef.current = true;
        const interval = setInterval(() => {
            setExchanges(getExchangeStatus());
        }, 60000);
        return () => { 
            mountedRef.current = false; 
            clearInterval(interval);
        };
    }, []);

    const refresh = React.useCallback(async () => {
        if (!mountedRef.current) return;
        setLoading(true);
        try {
            const res = await fetch('/api/news');
            if (res.ok) {
                const data = await res.json();
                if (data.articles?.length > 0) {
                    const mappedArticles = data.articles.map((a: any, i: number) => ({
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
                    if (mountedRef.current) setArticles(mappedArticles);
                }
            }
        } catch { /* Keep DEMO_NEWS */ }
        finally {
            setTimeout(() => { if (mountedRef.current) setLoading(false); }, 600);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const filtered = articles.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.source.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="w-full flex justify-center py-4 text-black dark:text-white font-sans transition-colors duration-300">
            <div className="w-full bg-white dark:bg-[#0A0A0A] border-y sm:border sm:rounded-[2px] border-black/10 dark:border-white/10 shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.05)] overflow-hidden">
                
                {/* ── EXCHANGE STATUS TICKER ── */}
                <div className="w-full border-b border-black/5 dark:border-white/5 bg-[#F9F9F9] dark:bg-[#050505] flex items-center px-6 overflow-x-auto whitespace-nowrap scrollbar-hide py-2 gap-8">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50 shrink-0">
                        <Clock size={12} />
                        Global Markets
                    </div>
                    {exchanges.map((ex) => (
                        <div key={ex.name} className="flex items-center gap-2 shrink-0">
                            <div className={`w-1.5 h-1.5 rounded-full ${ex.open ? 'bg-[#00C076] shadow-[0_0_8px_#00C076]' : 'bg-[#FF3B30]/50'}`} />
                            <span className="text-[10px] uppercase font-mono font-bold tracking-wider opacity-80">
                                {ex.name} <span className="opacity-40 font-normal">[{ex.open ? 'OPEN' : 'CLOSED'}]</span>
                            </span>
                        </div>
                    ))}
                </div>

                {/* ── THE POST HEADER: ScrollFloat Integration ── */}
                <div className="px-6 md:px-10 py-10 border-b-4 border-black dark:border-white flex flex-col md:flex-row md:items-end justify-between gap-6 bg-[#FAF9F6] dark:bg-[#080808]">
                    <div className="flex flex-col">
                        <ScrollFloat 
                            containerClassName="mb-0"
                            textClassName="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] text-black dark:text-white"
                            animationDuration={1.2}
                            stagger={0.03}
                        >
                            The Whale Post
                        </ScrollFloat>
                    </div>
                    
                    <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <input 
                                value={search} 
                                onChange={e => setSearch(e.target.value)} 
                                placeholder="Search publications…"
                                className="w-full md:w-64 bg-transparent border-b border-black/10 dark:border-white/20 text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 pb-1 font-serif outline-none focus:border-black dark:focus:border-white transition-all"
                            />
                            <button onClick={refresh} disabled={loading} className="p-2 border border-black/10 dark:border-white/20 rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all disabled:opacity-50 group">
                                <RefreshCw size={14} className={`${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50">Institutional Intelligence Desk</p>
                    </div>
                </div>

                {/* ── NEWS STACK ── */}
                <div className="flex flex-col divide-y divide-black/5 dark:divide-white/5">
                    {filtered.map((a) => {
                        const isExpanded = expandedId === a.id;
                        return (
                            <div key={a.id} className="flex flex-col group">
                                <div onClick={() => setExpandedId(isExpanded ? null : a.id)} className={`flex flex-col md:flex-row md:items-center px-6 md:px-10 py-6 gap-4 md:gap-8 cursor-pointer transition-colors ${isExpanded ? 'bg-black dark:bg-white text-white dark:text-black' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
                                    <div className="w-full md:w-40 shrink-0 flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start gap-1">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isExpanded ? '' : 'opacity-80'}`}>{a.source}</span>
                                        <span className={`text-[11px] font-serif ${isExpanded ? 'opacity-60' : 'opacity-40'}`}>{timeAgo(a.publishedAt)}</span>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h2 className={`font-serif text-xl md:text-2xl font-bold leading-snug tracking-tight ${isExpanded ? '' : 'group-hover:opacity-80'}`}>{a.title}</h2>
                                    </div>
                                    <div className="hidden md:flex shrink-0 w-8 justify-end">
                                        <div className={`w-2 h-2 rounded-full ${a.sentiment === 'bullish' ? 'bg-[#00C076]' : a.sentiment === 'bearish' ? 'bg-[#FF3B30]' : 'bg-current opacity-30'}`} />
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden bg-[#FAF9F6] dark:bg-[#0A0A0A] border-t border-black dark:border-white">
                                            <div className="px-6 md:px-10 py-8 md:pl-[224px] pr-6 md:pr-16 flex flex-col space-y-6">
                                                <p className="font-serif text-lg md:text-xl leading-relaxed text-black/80 dark:text-white/80 first-letter:text-6xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:mt-1">{a.summary}</p>
                                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-6 mt-2 border-t border-black/10 dark:border-white/10">
                                                    <div className="flex items-center gap-4">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${a.isFake ? 'text-[#FF3B30]' : 'text-[#00C076]'}`}>{a.isFake ? 'Unverified' : 'Verified Source'}</span>
                                                        <div className="w-px h-4 bg-black/10 dark:bg-white/10"/>
                                                        <span className="text-[12px] font-mono font-black">Integrity: {a.veracityScore}%</span>
                                                    </div>
                                                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-2 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity">Full Report <ExternalLink size={12}/></a>
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
