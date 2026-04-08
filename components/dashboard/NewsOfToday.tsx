"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ExternalLink, ShieldCheck, ShieldAlert } from 'lucide-react';

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
        id: '1', title: 'Bitcoin Eyes $90K Resistance as Institutional Buying Intensifies',
        summary: 'On-chain data reveals whales accumulated 42,000 BTC in the last 72 hours ahead of key macro catalyst. BlackRock ETF inflows hit all-time high of $1.2B in a single day, signaling unprecedented institutional appetite.',
        url: 'https://coindesk.com', source: 'The Block', publishedAt: new Date(Date.now() - 1200000).toISOString(),
        sentiment: 'bullish', veracityScore: 92, isFake: false, tokens: ['BTC'],
    },
    {
        id: '2', title: 'Ethereum Pectra Upgrade Scheduled — Staking Limit to 2048 ETH',
        summary: 'The Prague/Electra hard fork finally ships a critical change raising validator balance caps. Up to 10x reduction in validator load expected, paving way for mass institutional staking with fewer nodes overhead.',
        url: 'https://ethresear.ch', source: 'ETH Research', publishedAt: new Date(Date.now() - 3600000).toISOString(),
        sentiment: 'bullish', veracityScore: 97, isFake: false, tokens: ['ETH'],
    },
    {
        id: '3', title: 'Solana DeFi Reaches $12B TVL — Surpasses Counterparts',
        summary: 'Top decentralized exchanges on the network pull unprecedented liquidity. Institutional players now eye the architecture as a tier-1 settlement layer due to high throughput and low fee characteristics.',
        url: 'https://defillama.com', source: 'Crypto Insights', publishedAt: new Date(Date.now() - 7200000).toISOString(),
        sentiment: 'neutral', veracityScore: 88, isFake: false, tokens: ['SOL'],
    },
    {
        id: '4', title: 'Major Exchange Allegedly Insolvent — Anonymous Source Claims',
        summary: 'Unverified rumors of liquidity issues at mid-tier exchange circulate on social media. No official statement has been released. Historical data suggests a pattern resembling organized disinformation campaigns.',
        url: 'https://cryptopanic.com', source: 'Market Rumors', publishedAt: new Date(Date.now() - 10800000).toISOString(),
        sentiment: 'bearish', veracityScore: 23, isFake: true, tokens: [],
    },
    {
        id: '5', title: 'On-Chain Governance Passes Strategic Fee Reduction Proposal',
        summary: 'A major DAO votes overwhelmingly in favor of reducing transaction costs by 40%. The proposal, sponsored by leading DeFi protocols, argues that current fee structures limit mass retail adoption.',
        url: 'https://arbiscan.io', source: 'Governance Daily', publishedAt: new Date(Date.now() - 14400000).toISOString(),
        sentiment: 'bullish', veracityScore: 91, isFake: false, tokens: ['ARB'],
    },
    {
        id: '6', title: 'SEC Clears Path for Spot Ethereum ETF Options Trading',
        summary: 'Regulators approve options contracts on spot ETFs — a major milestone that analysts project could unlock significant institutional capital within the next 90 days of trading.',
        url: 'https://sec.gov', source: 'Regulatory Watch', publishedAt: new Date(Date.now() - 21600000).toISOString(),
        sentiment: 'bullish', veracityScore: 96, isFake: false, tokens: ['ETH'],
    },
    {
        id: '7', title: 'Global Market Cap Recovers After Federal Reserve Pause Signal',
        summary: 'The central bank hints at holding rates steady through the second quarter, triggering a broad-market relief rally. Risk assets across the board experience a surge in relative valuation.',
        url: 'https://wsj.com', source: 'Macro Desk', publishedAt: new Date(Date.now() - 28800000).toISOString(),
        sentiment: 'bullish', veracityScore: 90, isFake: false, tokens: ['BTC', 'ETH'],
    },
];

function timeAgo(iso: string) {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60)    return `Just now`;
    if (diff < 3600)  return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
    return `${Math.floor(diff / 86400)} days ago`;
}

export function NewsOfToday() {
    const [articles, setArticles] = useState<NewsArticle[]>(DEMO_NEWS);
    const [loading, setLoading]   = useState(false);
    const [search, setSearch]     = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    
    const mountedRef = React.useRef(true);
    React.useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
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
                        sentiment: ['bullish', 'bearish', 'neutral'][i % 3] as any,
                        veracityScore: 70 + (i % 30),
                        isFake: false,
                        tokens: []
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
        <div className="w-full flex justify-center py-4 text-[#050505] font-sans">
            <div className="w-full bg-white border-y sm:border sm:rounded-[2px] border-[#050505] shadow-[4px_4px_0_0_#050505] overflow-hidden">
                
                {/* ── THE POST HEADER ── */}
                <div className="px-6 md:px-10 py-8 border-b-4 border-[#050505] flex flex-col md:flex-row md:items-end justify-between gap-6 bg-[#FAF9F6]">
                    <div className="flex flex-col">
                        <p className="font-serif italic text-sm text-[#888888] mb-1">Vol. 42 — Final Edition</p>
                        <h1 className="font-serif text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85] text-[#050505]">
                            The <br/>Terminal Post
                        </h1>
                    </div>
                    
                    <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <input 
                                value={search} 
                                onChange={e => setSearch(e.target.value)} 
                                placeholder="Search publications…"
                                className="w-full md:w-64 bg-transparent border-b border-[#E5E5E5] text-[#050505] placeholder:text-[#888888] pb-1 font-serif italic outline-none focus:border-[#050505] transition-all"
                            />
                            <button onClick={refresh} disabled={loading} className="p-2 border border-[#E5E5E5] rounded-full hover:bg-[#050505] hover:text-white transition-all disabled:opacity-50 group">
                                <RefreshCw size={14} className={`${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#888888]">Institutional Intelligence Desk</p>
                    </div>
                </div>

                {/* ── INBOX STACK / NEWSPAPER LIST ── */}
                <div className="flex flex-col divide-y divide-[#E5E5E5]">
                    {filtered.map((a) => {
                        const isExpanded = expandedId === a.id;
                        
                        return (
                            <div key={a.id} className="flex flex-col group">
                                {/* ROW (Clickable) */}
                                <div 
                                    onClick={() => setExpandedId(isExpanded ? null : a.id)}
                                    className={`flex flex-col md:flex-row md:items-center px-6 md:px-10 py-5 gap-4 md:gap-8 cursor-pointer transition-colors ${isExpanded ? 'bg-[#050505] text-white' : 'hover:bg-[#f2f2f2] text-[#050505]'}`}
                                >
                                    {/* Source & Time Column */}
                                    <div className="w-full md:w-40 shrink-0 flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start gap-1">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isExpanded ? 'text-white' : 'text-[#050505]'}`}>
                                            {a.source}
                                        </span>
                                        <span className={`text-[11px] font-serif italic ${isExpanded ? 'text-white/60' : 'text-[#888888]'}`}>
                                            {timeAgo(a.publishedAt)}
                                        </span>
                                    </div>

                                    {/* Headline Column */}
                                    <div className="flex-1 overflow-hidden">
                                        <h2 className={`font-serif text-xl md:text-2xl font-bold leading-snug tracking-tight ${isExpanded ? 'text-white' : 'text-[#050505] group-hover:text-black'}`}>
                                            {a.title}
                                        </h2>
                                    </div>

                                    {/* Minimal Indicator */}
                                    <div className="hidden md:flex shrink-0 w-8 justify-end">
                                        {a.sentiment === 'bullish' && <div className={`w-2 h-2 rounded-full ${isExpanded ? 'bg-[#00C076]' : 'bg-[#00C076]/80'}`} title="Bullish"/>}
                                        {a.sentiment === 'bearish' && <div className={`w-2 h-2 rounded-full ${isExpanded ? 'bg-[#FF3B30]' : 'bg-[#FF3B30]/80'}`} title="Bearish"/>}
                                        {a.sentiment === 'neutral' && <div className={`w-2 h-2 rounded-full ${isExpanded ? 'bg-white/30' : 'bg-[#E5E5E5]'}`} title="Neutral"/>}
                                    </div>
                                </div>

                                {/* EXPANDED CONTENT */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            className="overflow-hidden bg-[#FAF9F6] border-t border-[#050505]"
                                        >
                                            <div className="px-6 md:px-10 py-8 md:pl-[224px] pr-6 md:pr-16 flex flex-col space-y-6">
                                                
                                                {/* Article Body */}
                                                <div>
                                                    <p className="font-serif text-lg md:text-xl leading-relaxed text-[#333333] first-letter:text-6xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:mt-1">
                                                        {a.summary}
                                                    </p>
                                                </div>

                                                {/* Meta Info & Actions */}
                                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-6 mt-2 border-t border-[#E5E5E5]">
                                                    <div className="flex items-center gap-4">
                                                        {a.isFake ? (
                                                            <div className="flex items-center gap-1.5 text-[#FF3B30]">
                                                                <ShieldAlert size={14}/>
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Unverified Source</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5 text-[#00C076]">
                                                                <ShieldCheck size={14}/>
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Verified Intelligence</span>
                                                            </div>
                                                        )}
                                                        <div className="w-px h-4 bg-[#E5E5E5]"/>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] uppercase font-bold text-[#888888] tracking-widest">Signal Integrity:</span>
                                                            <span className={`text-[12px] font-mono font-black ${a.veracityScore > 80 ? 'text-[#00C076]' : 'text-[#FF3B30]'}`}>
                                                                {a.veracityScore}%
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <a 
                                                        href={a.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 px-4 py-2 bg-[#050505] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#222] transition-colors"
                                                    >
                                                        Read Full Report <ExternalLink size={12}/>
                                                    </a>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filtered.length === 0 && (
                    <div className="py-24 text-center">
                        <p className="font-serif italic text-[#888888] text-lg">"No publications met the criteria."</p>
                    </div>
                )}
                
                {/* Footer Strip */}
                <div className="bg-[#050505] px-6 py-2 flex justify-between items-center text-white">
                    <span className="text-[8px] font-mono opacity-50">END OF FEED</span>
                    <span className="text-[8px] font-mono opacity-50">THE TERMINAL POST © {new Date().getFullYear()}</span>
                </div>
                
            </div>
        </div>
    );
}
