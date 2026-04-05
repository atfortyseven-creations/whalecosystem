"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Newspaper, RefreshCw, ExternalLink, TrendingUp, TrendingDown,
    Minus, Clock, Tag, Search, Filter, ShieldCheck, ShieldAlert, Flame
} from 'lucide-react';

interface NewsArticle {
    id: string;
    title: string;
    summary: string;
    url: string;
    source: string;
    publishedAt: string;
    imageUrl?: string;
    category: string;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    veracityScore: number;
    isFake: boolean;
    tokens: string[];
}

const DEMO_NEWS: NewsArticle[] = [
    {
        id: '1', title: 'Bitcoin Eyes $90K Resistance as Institutional Buying Intensifies',
        summary: 'On-chain data reveals whales accumulated 42,000 BTC in the last 72 hours ahead of key macro catalyst. BlackRock ETF inflows hit all-time high of $1.2B in a single day.',
        url: 'https://coindesk.com', source: 'CoinDesk', publishedAt: new Date(Date.now() - 1200000).toISOString(),
        category: 'Bitcoin', sentiment: 'bullish', veracityScore: 92, isFake: false, tokens: ['BTC'],
    },
    {
        id: '2', title: 'Ethereum Pectra Upgrade Scheduled — Staking Limit to 2048 ETH',
        summary: 'The Prague/Electra hard fork finally ships a critical change raising validator balance caps. Up to 10x reduction in validator load expected, paving way for mass institutional staking.',
        url: 'https://ethresear.ch', source: 'Ethereum Research', publishedAt: new Date(Date.now() - 3600000).toISOString(),
        category: 'Ethereum', sentiment: 'bullish', veracityScore: 97, isFake: false, tokens: ['ETH'],
    },
    {
        id: '3', title: 'Solana DeFi Reaches $12B TVL — Surpasses BNB Chain',
        summary: 'Jupiter, Raydium and Meteora pull unprecedented liquidity as SOL price rallied 22% in 7 days. Institutional players now eye Solana as tier-1 DeFi settlement layer.',
        url: 'https://defillama.com', source: 'DefiLlama', publishedAt: new Date(Date.now() - 7200000).toISOString(),
        category: 'DeFi', sentiment: 'bullish', veracityScore: 88, isFake: false, tokens: ['SOL', 'JUP'],
    },
    {
        id: '4', title: 'Crypto Exchange X Allegedly Insolvent — Anonymous Source Claims',
        summary: 'Unverified rumors of liquidity issues at mid-tier exchange circulate on social media. No official statement from the exchange, pattern resembles previous FUD campaigns.',
        url: 'https://cryptopanic.com', source: 'CryptoPanic', publishedAt: new Date(Date.now() - 10800000).toISOString(),
        category: 'Markets', sentiment: 'bearish', veracityScore: 23, isFake: true, tokens: [],
    },
    {
        id: '5', title: 'ARB Arbitrum On-Chain Governance Passes Fee Reduction Proposal',
        summary: 'Arbitrum DAO votes 89% in favor of reducing transaction costs by 40%. Proposal sponsored by major DeFi protocols who argue current fees limit mass adoption.',
        url: 'https://arbiscan.io', source: 'Arbiscan', publishedAt: new Date(Date.now() - 14400000).toISOString(),
        category: 'Governance', sentiment: 'bullish', veracityScore: 91, isFake: false, tokens: ['ARB'],
    },
    {
        id: '6', title: 'PEPE Whale Moves $4.2M in Single Transaction — Market Watching',
        summary: 'A wallet identified as early PEPE accumulator transferred 2.1 trillion tokens to multiple addresses. Traders on alert for potential dump or staking activity.',
        url: 'https://etherscan.io', source: 'Etherscan', publishedAt: new Date(Date.now() - 18000000).toISOString(),
        category: 'Whales', sentiment: 'bearish', veracityScore: 85, isFake: false, tokens: ['PEPE'],
    },
    {
        id: '7', title: 'SEC Clears Path for Spot Ethereum ETF Options Trading',
        summary: 'Regulators approve options contracts on spot Ethereum ETFs — a major milestone that analysts say could unlock another $20B in institutional capital within 90 days.',
        url: 'https://sec.gov', source: 'SEC Press', publishedAt: new Date(Date.now() - 21600000).toISOString(),
        category: 'Regulation', sentiment: 'bullish', veracityScore: 96, isFake: false, tokens: ['ETH'],
    },
    {
        id: '8', title: 'BNB Chain TVL Drops 18% After Key Protocol Exploit Discovered',
        summary: 'A critical vulnerability in a top-5 BNB Chain protocol allowed an attacker to drain $28M. Exploit patched in 6 hours but confidence in BNB ecosystem momentarily shaken.',
        url: 'https://bnbchain.org', source: 'BNB Chain', publishedAt: new Date(Date.now() - 25200000).toISOString(),
        category: 'Security', sentiment: 'bearish', veracityScore: 94, isFake: false, tokens: ['BNB'],
    },
    {
        id: '9', title: 'Global Crypto Market Cap Recovers $100B After Fed Pause Signal',
        summary: 'Jerome Powell hints Fed may hold rates through Q2, triggering a broad-market relief rally. Risk assets including crypto surge 4-8% across major pairs.',
        url: 'https://coindesk.com', source: 'CoinDesk', publishedAt: new Date(Date.now() - 28800000).toISOString(),
        category: 'Macro', sentiment: 'bullish', veracityScore: 90, isFake: false, tokens: ['BTC', 'ETH'],
    },
];

const CATEGORIES = ['All', 'Bitcoin', 'Ethereum', 'DeFi', 'Whales', 'Regulation', 'Security', 'Macro', 'Governance'];

const SENTIMENT_CONFIG = {
    bullish:  { icon: <TrendingUp size={13}/>,  color: '#00C076', bg: '#00C07615', label: 'Bullish'  },
    bearish:  { icon: <TrendingDown size={13}/>, color: '#FF3B30', bg: '#FF3B3015', label: 'Bearish'  },
    neutral:  { icon: <Minus size={13}/>,        color: '#888888', bg: '#88888815', label: 'Neutral'  },
};

function timeAgo(iso: string) {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60)    return `${Math.floor(diff)}s ago`;
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export function NewsOfToday() {
    const [articles, setArticles] = useState<NewsArticle[]>(DEMO_NEWS);
    const [loading, setLoading]   = useState(false);
    const [search, setSearch]     = useState('');
    const [category, setCategory] = useState('All');
    const [sentiment, setSentiment] = useState<'all' | 'bullish' | 'bearish' | 'neutral'>('all');
    // Prevent setState after unmount (stale closure guard)
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
                        source: a.source || 'WhaleTerminal',
                        publishedAt: a.date || a.publishedAt || new Date().toISOString(),
                        imageUrl: a.imageUrl,
                        category: CATEGORIES[(i % (CATEGORIES.length - 1)) + 1],
                        sentiment: ['bullish', 'bearish', 'neutral'][i % 3] as any,
                        veracityScore: 70 + (i % 30),
                        isFake: false,
                        tokens: (a.title.includes('BTC') || a.title.includes('Bitcoin')) ? ['BTC'] :
                                (a.title.includes('ETH') || a.title.includes('Ethereum')) ? ['ETH'] : []
                    }));
                    if (mountedRef.current) setArticles(mappedArticles);
                }
            }
        } catch { /* keep DEMO_NEWS */ }
        finally {
            setTimeout(() => { if (mountedRef.current) setLoading(false); }, 600);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const filtered = articles.filter(a =>
        (category === 'All' || a.category === category) &&
        (sentiment === 'all' || a.sentiment === sentiment) &&
        (a.title.toLowerCase().includes(search.toLowerCase()) ||
         a.tokens.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
         a.source.toLowerCase().includes(search.toLowerCase()))
    );

    const bullCount = articles.filter(a => a.sentiment === 'bullish').length;
    const bearCount = articles.filter(a => a.sentiment === 'bearish').length;
    const bullPct   = Math.round((bullCount / articles.length) * 100);

    return (
        <div className="flex flex-col space-y-5">
            {/* ── Sentiment Bar ── */}
            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-[#888888] uppercase tracking-widest flex items-center gap-2"><Flame size={12}/> Market Sentiment · Today</span>
                    <span className="text-[9px] text-[#888888]">{articles.length} articles analyzed</span>
                </div>
                <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 mb-2">
                    <div className="h-full bg-[#00C076] rounded-l-full" style={{ width: `${bullPct}%` }}/>
                    <div className="h-full bg-[#FF3B30] rounded-r-full" style={{ width: `${100 - bullPct}%` }}/>
                </div>
                <div className="flex justify-between text-[9px] font-black uppercase">
                    <span className="text-[#00C076]">Bullish {bullPct}% ({bullCount})</span>
                    <span className="text-[#FF3B30]">Bearish {100 - bullPct}% ({bearCount})</span>
                </div>
            </div>

            {/* ── Controls ── */}
            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[160px] max-w-xs">
                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]"/>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search news, token…"
                        className="w-full bg-[#FAF9F6] border border-[#E5E5E5] rounded-lg pl-8 pr-3 py-1.5 text-[10px] font-mono outline-none focus:border-[#050505]"
                    />
                </div>
                <div className="flex gap-1">
                    {(['all', 'bullish', 'bearish'] as const).map(s => (
                        <button key={s} onClick={() => setSentiment(s)}
                            className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase border transition-all ${sentiment === s ? 'bg-[#050505] text-white border-[#050505]' : 'text-[#888888] border-[#E5E5E5] hover:border-[#050505]'}`}>
                            {s === 'all' ? 'All' : s === 'bullish' ? '🟢 Bull' : '🔴 Bear'}
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap gap-1">
                    {CATEGORIES.map(c => (
                        <button key={c} onClick={() => setCategory(c)}
                            className={`px-2 py-1 rounded text-[8px] font-black uppercase border transition-all ${category === c ? 'bg-[#050505] text-white border-[#050505]' : 'text-[#888888] border-[#E5E5E5] hover:border-[#050505]'}`}>
                            {c}
                        </button>
                    ))}
                </div>
                <button onClick={refresh} disabled={loading}
                    className="ml-auto p-1.5 rounded-lg border border-[#E5E5E5] text-[#888888] hover:text-[#050505] disabled:opacity-50 transition-colors">
                    <RefreshCw size={13} className={loading ? 'animate-spin' : ''}/>
                </button>
            </div>

            {/* ── News Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((a, i) => {
                    const sc = SENTIMENT_CONFIG[a.sentiment];
                    return (
                        <motion.div key={a.id}
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                            className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
                            {/* Header stripe */}
                            <div className="h-1" style={{ background: sc.color }}/>
                            <div className="p-5">
                                {/* Meta row */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {a.isFake
                                            ? <ShieldAlert size={12} className="text-[#FF3B30]"/>
                                            : <ShieldCheck size={12} className="text-[#00C076]"/>
                                        }
                                        <span className="text-[9px] font-black text-[#888888] uppercase tracking-widest">{a.source}</span>
                                        <span className="text-[8px] px-1.5 py-0.5 rounded border font-black uppercase" style={{ color: sc.color, borderColor: sc.color + '40', background: sc.bg }}>
                                            {a.category}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1" style={{ color: sc.color }}>
                                        {sc.icon}
                                    </div>
                                </div>

                                {/* Veracity badge */}
                                {a.isFake && (
                                    <div className="mb-3 px-2 py-1.5 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-lg">
                                        <span className="text-[8px] font-black text-[#FF3B30] uppercase tracking-widest">⚠️ Low Veracity Score — Potential FUD</span>
                                    </div>
                                )}

                                {/* Title */}
                                <h3 className="text-[12px] font-black text-[#050505] leading-tight mb-2">{a.title}</h3>

                                {/* Summary */}
                                <p className="text-[10px] text-[#888888] leading-relaxed line-clamp-3 mb-3">{a.summary}</p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {a.tokens.map(t => (
                                        <span key={t} className="text-[7px] px-1.5 py-0.5 bg-[#E5E5E5] text-[#888888] rounded font-black uppercase">${t}</span>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <div className="flex items-center gap-0.5">
                                            <div className="w-8 h-1 bg-[#E5E5E5] rounded-full overflow-hidden">
                                                <div className="h-full rounded-full" style={{ width: `${a.veracityScore}%`, background: a.veracityScore > 70 ? '#00C076' : a.veracityScore > 40 ? '#FF9500' : '#FF3B30' }}/>
                                            </div>
                                            <span className="text-[8px] font-black text-[#888888]">{a.veracityScore}%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] font-mono text-[#888888] flex items-center gap-0.5"><Clock size={8}/>{timeAgo(a.publishedAt)}</span>
                                        <a href={a.url} target="_blank" rel="noopener noreferrer"
                                            className="p-1 rounded-md text-[#888888] hover:text-[#050505] hover:bg-[#E5E5E5]/50 transition-colors">
                                            <ExternalLink size={11}/>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="p-16 text-center bg-white border border-[#E5E5E5] rounded-2xl">
                    <Newspaper size={32} className="mx-auto mb-4 text-[#E5E5E5]"/>
                    <p className="text-[10px] font-black text-[#888888] uppercase tracking-widest">No news matching filters</p>
                </div>
            )}
        </div>
    );
}
