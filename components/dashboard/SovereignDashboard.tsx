"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    TrendingUp, TrendingDown, Zap, Globe, Shield, BarChart2, 
    RefreshCw, ExternalLink, AlertTriangle, CheckCircle, 
    ArrowUpRight, ArrowDownRight, Activity, Lock, Unlock, Filter
} from 'lucide-react';
import { useAccount } from 'wagmi';

// ────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────

interface PolymarketMarket {
    id: string;
    slug: string;
    question: string;
    description?: string;
    category: string;
    yesPrice: number;
    noPrice: number;
    volume24h: number;
    volumeTotal: number;
    liquidity: number;
    endDate?: string;
    conditionId: string;
    image?: string;
    edge: number;
    evSignal: 'OVERBOUGHT' | 'OVERSOLD' | 'LEAN_YES' | 'LEAN_NO' | 'NEUTRAL';
}

interface DeFiPool {
    pool: string;
    chain: string;
    chainFull?: string;
    project: string;
    symbol: string;
    apy: number;
    apyBase: number;
    apyReward: number;
    tvlUsd: number;
    il7d: number;
    ilRisk: string;
    stablecoin: boolean;
    url: string;
    riskScore: number;
    tier: string;
}

type Tab = 'polymarket' | 'defi' | 'portfolio';
type PolyCategory = 'all' | 'crypto' | 'politics' | 'sports' | 'economics';

// ────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────

const fmt = {
    usd: (n: number) => {
        if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
        if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
        if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
        return `$${n.toFixed(0)}`;
    },
    pct: (n: number) => `${(n * 100).toFixed(1)}%`,
    apy: (n: number) => `${n.toFixed(2)}%`,
};

const EV_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    OVERSOLD: { label: 'STRONG BUY', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30', icon: <ArrowUpRight size={10} /> },
    LEAN_YES:  { label: 'LEAN YES',   color: 'text-emerald-300', bg: 'bg-emerald-300/10 border-emerald-300/20', icon: <ArrowUpRight size={10} /> },
    NEUTRAL:   { label: 'NEUTRAL',    color: 'text-white/40',    bg: 'bg-white/5 border-white/10',             icon: null },
    LEAN_NO:   { label: 'LEAN NO',    color: 'text-rose-300',    bg: 'bg-rose-300/10 border-rose-300/20',      icon: <ArrowDownRight size={10} /> },
    OVERBOUGHT:{ label: 'OVERBOUGHT', color: 'text-rose-400',    bg: 'bg-rose-400/10 border-rose-400/30',      icon: <ArrowDownRight size={10} /> },
};

const RISK_CONFIG: Record<number, { label: string; color: string }> = {
    1: { label: 'SAFE',        color: 'text-emerald-400' },
    2: { label: 'LOW',         color: 'text-emerald-300' },
    3: { label: 'MODERATE',    color: 'text-yellow-400' },
    4: { label: 'HIGH',        color: 'text-orange-400' },
    5: { label: 'AGGRESSIVE',  color: 'text-rose-400' },
};

// ────────────────────────────────────────────────────────────
// POLYMARKET PANEL
// ────────────────────────────────────────────────────────────

function PolymarketPanel() {
    const [markets, setMarkets] = useState<PolymarketMarket[]>([]);
    const [stats, setStats] = useState({ totalVolume: 0, count: 0, topEdge: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [category, setCategory] = useState<PolyCategory>('all');
    const [selected, setSelected] = useState<PolymarketMarket | null>(null);
    const [ts, setTs] = useState(0);

    const CATEGORIES: { id: PolyCategory; label: string }[] = [
        { id: 'all', label: 'ALL' }, { id: 'crypto', label: 'CRYPTO' },
        { id: 'politics', label: 'POLITICS' }, { id: 'sports', label: 'SPORTS' },
        { id: 'economics', label: 'ECONOMICS' },
    ];

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/polymarket/markets?limit=60&category=${category}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setMarkets(data.markets || []);
            setTs(data.timestamp);
            const vol = (data.markets || []).reduce((s: number, m: PolymarketMarket) => s + m.volume24h, 0);
            const topE = (data.markets || []).reduce((mx: number, m: PolymarketMarket) => Math.max(mx, m.edge), 0);
            setStats({ totalVolume: vol, count: data.count, topEdge: topE });
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [category]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => {
        const interval = setInterval(load, 30000);
        return () => clearInterval(interval);
    }, [load]);

    return (
        <div className="flex flex-col h-full gap-0">
            {/* Stats Bar */}
            <div className="grid grid-cols-3 border-b border-white/5 shrink-0">
                {[
                    { label: '24H VOLUME', value: fmt.usd(stats.totalVolume), color: 'text-[#e0ff00]' },
                    { label: 'LIVE MARKETS', value: stats.count, color: 'text-white' },
                    { label: 'MAX EDGE', value: fmt.pct(stats.topEdge), color: 'text-emerald-400' },
                ].map((s) => (
                    <div key={s.label} className="px-4 py-3 border-r border-white/5 last:border-r-0">
                        <div className="text-[9px] font-mono uppercase text-white/30 tracking-widest mb-1">{s.label}</div>
                        <div className={`text-sm font-black font-mono ${s.color}`}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Category Filter */}
            <div className="flex items-center border-b border-white/5 shrink-0 overflow-x-auto">
                {CATEGORIES.map((c) => (
                    <button
                        key={c.id}
                        onClick={() => setCategory(c.id)}
                        className={`px-4 py-2 text-[9px] font-mono font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 border-r border-white/5 ${category === c.id ? 'text-[#e0ff00] bg-[#e0ff00]/5' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                    >
                        {c.label}
                    </button>
                ))}
                <button onClick={load} className="ml-auto px-4 py-2 text-white/30 hover:text-[#e0ff00] transition-colors flex-shrink-0">
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Markets List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="flex items-center gap-2 p-4 text-rose-400 text-[10px] font-mono">
                            <AlertTriangle size={12} /> {error}
                        </div>
                    )}
                    {loading && markets.length === 0 && (
                        <div className="flex items-center justify-center h-32 text-white/20 text-[10px] font-mono uppercase tracking-widest">
                            <RefreshCw size={12} className="animate-spin mr-2" /> Fetching Polymarket Oracle...
                        </div>
                    )}
                    {/* Column Header */}
                    {markets.length > 0 && (
                        <div className="grid grid-cols-[1fr_80px_90px_90px_80px] gap-2 px-4 py-2 text-[9px] font-mono font-black uppercase tracking-widest text-white/20 border-b border-white/5 sticky top-0 bg-[#050505] z-10">
                            <span>MARKET</span>
                            <span className="text-right">YES %</span>
                            <span className="text-right">24H VOL</span>
                            <span className="text-right">LIQUIDITY</span>
                            <span className="text-right">SIGNAL</span>
                        </div>
                    )}
                    <AnimatePresence initial={false}>
                        {markets.map((m) => {
                            const ev = EV_CONFIG[m.evSignal] || EV_CONFIG.NEUTRAL;
                            const isSelected = selected?.id === m.id;
                            return (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    onClick={() => setSelected(isSelected ? null : m)}
                                    className={`grid grid-cols-[1fr_80px_90px_90px_80px] gap-2 px-4 py-3 border-b border-white/[0.03] cursor-pointer transition-all ${isSelected ? 'bg-[#e0ff00]/5 border-[#e0ff00]/20' : 'hover:bg-white/[0.02]'} group relative`}
                                >
                                    <div className={`absolute inset-0 border-l-2 transition-colors ${isSelected ? 'border-[#e0ff00]' : 'border-transparent group-hover:border-white/20'}`} />
                                    <div className="flex flex-col gap-1 pl-1 overflow-hidden">
                                        <span className="text-[11px] text-white/90 leading-tight line-clamp-2 font-medium">{m.question}</span>
                                        <span className="text-[9px] text-white/30 uppercase tracking-wider">{m.category}</span>
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <span className={`text-[12px] font-black font-mono ${m.yesPrice >= 0.5 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {fmt.pct(m.yesPrice)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <span className="text-[11px] font-mono text-white/60">{fmt.usd(m.volume24h)}</span>
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <span className="text-[11px] font-mono text-white/40">{fmt.usd(m.liquidity)}</span>
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <span className={`text-[8px] font-black uppercase px-2 py-1 border ${ev.bg} ${ev.color} flex items-center gap-1`}>
                                            {ev.icon}{ev.label}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Detail Panel */}
                <AnimatePresence>
                    {selected && (
                        <motion.div
                            initial={{ x: 350, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 350, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="w-[300px] border-l border-white/10 bg-black flex flex-col overflow-y-auto custom-scrollbar shrink-0"
                        >
                            <div className="p-4 border-b border-white/10">
                                <div className="text-[9px] font-mono text-[#e0ff00] uppercase tracking-widest mb-2">MARKET INTELLIGENCE</div>
                                <p className="text-[11px] text-white/80 leading-relaxed mb-4">{selected.question}</p>
                                <div className="space-y-3">
                                    {[
                                        { label: 'YES', value: fmt.pct(selected.yesPrice), bar: selected.yesPrice, color: 'bg-emerald-400' },
                                        { label: 'NO',  value: fmt.pct(1 - selected.yesPrice), bar: 1 - selected.yesPrice, color: 'bg-rose-400' },
                                    ].map((outcome) => (
                                        <div key={outcome.label}>
                                            <div className="flex justify-between text-[10px] font-mono mb-1">
                                                <span className="text-white/50">{outcome.label}</span>
                                                <span className="text-white font-black">{outcome.value}</span>
                                            </div>
                                            <div className="h-1.5 bg-white/5 w-full">
                                                <div className={`h-full ${outcome.color}`} style={{ width: `${outcome.bar * 100}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                {[
                                    { label: '24H VOLUME', value: fmt.usd(selected.volume24h) },
                                    { label: 'TOTAL VOLUME', value: fmt.usd(selected.volumeTotal) },
                                    { label: 'LIQUIDITY', value: fmt.usd(selected.liquidity) },
                                    { label: 'CATEGORY', value: selected.category },
                                ].map((row) => (
                                    <div key={row.label} className="flex justify-between text-[10px] font-mono">
                                        <span className="text-white/30">{row.label}</span>
                                        <span className="text-white">{row.value}</span>
                                    </div>
                                ))}
                                <div className="pt-3 border-t border-white/10">
                                    <div className="text-[9px] font-mono text-white/30 mb-2">AI SIGNAL</div>
                                    <div className={`text-[10px] font-black ${EV_CONFIG[selected.evSignal]?.color}`}>
                                        {EV_CONFIG[selected.evSignal]?.label}
                                        {selected.evSignal === 'OVERSOLD' && ' — Market may be significantly undervaluing YES.'}
                                        {selected.evSignal === 'OVERBOUGHT' && ' — Consider fading this outcome.'}
                                        {selected.evSignal === 'NEUTRAL' && ' — Insufficient edge detected. Monitor only.'}
                                        {selected.evSignal === 'LEAN_YES' && ' — Slight YES bias. Moderate position.'}
                                        {selected.evSignal === 'LEAN_NO' && ' — Slight NO bias. Moderate position.'}
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 mt-auto border-t border-white/10">
                                <a
                                    href={`https://polymarket.com/market/${selected.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#e0ff00] text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors"
                                >
                                    OPEN ON POLYMARKET <ExternalLink size={12} />
                                </a>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {ts > 0 && (
                <div className="px-4 py-2 border-t border-white/5 text-[9px] font-mono text-white/20 shrink-0">
                    LAST SYNC: {new Date(ts).toISOString().slice(11, 19)} UTC
                </div>
            )}
        </div>
    );
}

// ────────────────────────────────────────────────────────────
// DEFI YIELD PANEL
// ────────────────────────────────────────────────────────────

function DeFiYieldPanel() {
    const [pools, setPools] = useState<DeFiPool[]>([]);
    const [stats, setStats] = useState({ avgApy: 0, maxApy: 0, stablePools: 0, totalTvl: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState({ stableOnly: false, minApy: 3, chain: 'all', riskMax: 5 });
    const [selected, setSelected] = useState<DeFiPool | null>(null);
    const [ts, setTs] = useState(0);

    const CHAINS = ['all', 'Ethereum', 'Arbitrum', 'Base', 'Optimism', 'Polygon', 'BSC', 'Solana'];

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams({
                limit: '100',
                minApy: String(filter.minApy),
                chain: filter.chain,
            });
            const res = await fetch(`/api/defi/yields?${params}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setStats(data.stats || {});
            setTs(data.timestamp);
            let p: DeFiPool[] = data.pools || [];
            if (filter.stableOnly) p = p.filter(pool => pool.stablecoin);
            if (filter.riskMax < 5) p = p.filter(pool => pool.riskScore <= filter.riskMax);
            setPools(p);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => {
        const i = setInterval(load, 60000);
        return () => clearInterval(i);
    }, [load]);

    return (
        <div className="flex flex-col h-full">
            {/* Stats Bar */}
            <div className="grid grid-cols-4 border-b border-white/5 shrink-0">
                {[
                    { label: 'MAX APY', value: fmt.apy(stats.maxApy), color: 'text-[#e0ff00]' },
                    { label: 'AVG APY', value: fmt.apy(stats.avgApy), color: 'text-white' },
                    { label: 'STABLE POOLS', value: stats.stablePools, color: 'text-emerald-400' },
                    { label: 'TOTAL TVL', value: fmt.usd(stats.totalTvl), color: 'text-white/60' },
                ].map((s) => (
                    <div key={s.label} className="px-4 py-3 border-r border-white/5 last:border-r-0">
                        <div className="text-[9px] font-mono uppercase text-white/30 tracking-widest mb-1">{s.label}</div>
                        <div className={`text-sm font-black font-mono ${s.color}`}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 px-4 py-2 border-b border-white/5 shrink-0 overflow-x-auto">
                <label className="flex items-center gap-2 text-[9px] font-mono uppercase text-white/40 cursor-pointer whitespace-nowrap">
                    <input type="checkbox" checked={filter.stableOnly} onChange={e => setFilter(f => ({ ...f, stableOnly: e.target.checked }))}
                        className="accent-[#e0ff00]" />
                    STABLE ONLY
                </label>
                <div className="flex items-center gap-2 text-[9px] font-mono uppercase text-white/40 whitespace-nowrap">
                    <Filter size={10} /> MIN APY:
                    <select value={filter.minApy} onChange={e => setFilter(f => ({ ...f, minApy: +e.target.value }))}
                        className="bg-black border border-white/10 text-white text-[9px] font-mono px-1 py-0.5">
                        {[3, 5, 8, 10, 15, 20, 30].map(v => <option key={v} value={v}>{v}%</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2 text-[9px] font-mono uppercase text-white/40 whitespace-nowrap">
                    CHAIN:
                    <select value={filter.chain} onChange={e => setFilter(f => ({ ...f, chain: e.target.value }))}
                        className="bg-black border border-white/10 text-white text-[9px] font-mono px-1 py-0.5">
                        {CHAINS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2 text-[9px] font-mono uppercase text-white/40 whitespace-nowrap">
                    MAX RISK:
                    <select value={filter.riskMax} onChange={e => setFilter(f => ({ ...f, riskMax: +e.target.value }))}
                        className="bg-black border border-white/10 text-white text-[9px] font-mono px-1 py-0.5">
                        {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
                <button onClick={load} className="ml-auto text-white/30 hover:text-[#e0ff00] transition-colors flex-shrink-0">
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {error && <div className="flex items-center gap-2 p-4 text-rose-400 text-[10px] font-mono"><AlertTriangle size={12} /> {error}</div>}
                    {loading && pools.length === 0 && (
                        <div className="flex items-center justify-center h-32 text-white/20 text-[10px] font-mono uppercase tracking-widest">
                            <RefreshCw size={12} className="animate-spin mr-2" /> Scanning DeFiLlama Oracle...
                        </div>
                    )}
                    {pools.length > 0 && (
                        <div className="grid grid-cols-[1fr_80px_80px_90px_90px_70px] gap-2 px-4 py-2 text-[9px] font-mono font-black uppercase tracking-widest text-white/20 border-b border-white/5 sticky top-0 bg-[#050505] z-10">
                            <span>POOL</span>
                            <span className="text-right">CHAIN</span>
                            <span className="text-right">APY</span>
                            <span className="text-right">TVL</span>
                            <span className="text-right">TYPE</span>
                            <span className="text-right">RISK</span>
                        </div>
                    )}
                    <AnimatePresence initial={false}>
                        {pools.map((p, i) => {
                            const risk = RISK_CONFIG[p.riskScore] || RISK_CONFIG[5];
                            const isSelected = selected?.pool === p.pool;
                            return (
                                <motion.div
                                    key={p.pool}
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.15, delay: i * 0.01 }}
                                    onClick={() => setSelected(isSelected ? null : p)}
                                    className={`grid grid-cols-[1fr_80px_80px_90px_90px_70px] gap-2 px-4 py-3 border-b border-white/[0.03] cursor-pointer transition-all ${isSelected ? 'bg-[#e0ff00]/5' : 'hover:bg-white/[0.02]'} group relative`}
                                >
                                    <div className={`absolute inset-0 border-l-2 transition-colors ${isSelected ? 'border-[#e0ff00]' : 'border-transparent group-hover:border-white/20'}`} />
                                    <div className="flex flex-col gap-0.5 pl-1 overflow-hidden">
                                        <span className="text-[11px] text-white/90 font-mono truncate font-medium">{p.symbol}</span>
                                        <span className="text-[9px] text-white/30 capitalize">{p.project}</span>
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <span className="text-[10px] font-mono text-white/50">{p.chain}</span>
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <span className={`text-[13px] font-black font-mono ${p.apy >= 20 ? 'text-[#e0ff00]' : p.apy >= 10 ? 'text-emerald-400' : 'text-white/80'}`}>
                                            {fmt.apy(p.apy)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <span className="text-[11px] font-mono text-white/50">{fmt.usd(p.tvlUsd)}</span>
                                    </div>
                                    <div className="flex items-center justify-end">
                                        {p.stablecoin ? (
                                            <span className="text-[8px] font-black px-1.5 py-0.5 bg-emerald-400/10 border border-emerald-400/20 text-emerald-400">STABLE</span>
                                        ) : (
                                            <span className="text-[8px] font-black px-1.5 py-0.5 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400">VOLATILE</span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <span className={`text-[9px] font-black font-mono ${risk.color}`}>{risk.label}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                    {selected && (
                        <motion.div
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 300, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="w-[280px] border-l border-white/10 bg-black flex flex-col overflow-y-auto custom-scrollbar shrink-0"
                        >
                            <div className="p-4 border-b border-white/10">
                                <div className="text-[9px] font-mono text-[#e0ff00] uppercase tracking-widest mb-1">YIELD INTELLIGENCE</div>
                                <div className="text-lg font-black font-mono text-white tracking-tighter">{selected.symbol}</div>
                                <div className="text-[10px] text-white/40 capitalize">{selected.project} · {selected.chainFull || selected.chain}</div>
                            </div>
                            <div className="p-4 space-y-3 flex-1">
                                <div className="bg-[#050505] border border-white/10 p-4 text-center">
                                    <div className="text-[9px] font-mono text-white/30 uppercase mb-1">TOTAL APY</div>
                                    <div className="text-3xl font-black font-mono text-[#e0ff00]">{fmt.apy(selected.apy)}</div>
                                    <div className="flex justify-center gap-4 mt-2 text-[9px] font-mono text-white/30">
                                        <span>BASE: {fmt.apy(selected.apyBase)}</span>
                                        <span>REWARD: {fmt.apy(selected.apyReward)}</span>
                                    </div>
                                </div>
                                {[
                                    { label: 'TVL (Total Value Locked)', value: fmt.usd(selected.tvlUsd) },
                                    { label: 'CHAIN', value: selected.chain },
                                    { label: 'IL RISK', value: selected.ilRisk === 'no' ? 'NONE' : selected.ilRisk },
                                    { label: 'RISK SCORE', value: `${selected.riskScore}/5 — ${RISK_CONFIG[selected.riskScore]?.label}` },
                                    { label: 'ASSET TYPE', value: selected.stablecoin ? 'STABLECOIN (No Price Risk)' : 'VOLATILE ASSET' },
                                ].map(row => (
                                    <div key={row.label} className="flex justify-between text-[10px] font-mono border-b border-white/5 pb-2">
                                        <span className="text-white/30">{row.label}</span>
                                        <span className={`text-white font-medium ${row.label === 'RISK SCORE' ? RISK_CONFIG[selected.riskScore]?.color : ''}`}>{row.value}</span>
                                    </div>
                                ))}
                                <div className="pt-2">
                                    <div className="text-[9px] font-mono text-white/30 mb-2">WHAT YOU EARN</div>
                                    <div className="text-[10px] text-white/60 leading-relaxed">
                                        Depositing $1,000 at <strong className="text-white">{fmt.apy(selected.apy)}</strong> APY earns approximately <strong className="text-[#e0ff00]">{fmt.usd(selected.apy * 10)}</strong>/year or <strong className="text-emerald-400">{fmt.usd(selected.apy * 10 / 12)}</strong>/month.
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border-t border-white/10">
                                <a
                                    href={selected.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#e0ff00] text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors"
                                >
                                    DEPLOY CAPITAL <ExternalLink size={12} />
                                </a>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {ts > 0 && (
                <div className="px-4 py-2 border-t border-white/5 text-[9px] font-mono text-white/20 shrink-0">
                    SOURCE: DEFILLAMA.COM · LAST SYNC: {new Date(ts).toISOString().slice(11, 19)} UTC
                </div>
            )}
        </div>
    );
}

// ────────────────────────────────────────────────────────────
// MASTER DASHBOARD
// ────────────────────────────────────────────────────────────

export default function SovereignDashboard() {
    const { address, isConnected } = useAccount();
    const [tab, setTab] = useState<Tab>('polymarket');

    const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
        { id: 'polymarket', label: 'POLYMARKET ORACLE', icon: <Globe size={12} />, badge: 'LIVE' },
        { id: 'defi',       label: 'YIELD MATRIX',      icon: <BarChart2 size={12} />, badge: 'REAL' },
        { id: 'portfolio',  label: 'PORTFOLIO',          icon: <Shield size={12} /> },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white font-mono selection:bg-[#e0ff00] selection:text-black flex flex-col overflow-hidden">
            {/* ── SOVEREIGN HEADER ── */}
            <header className="h-12 border-b border-white/10 bg-black/80 backdrop-blur-xl flex items-center justify-between px-6 text-[10px] uppercase tracking-widest font-black shrink-0 z-20">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#e0ff00] animate-pulse" />
                        <span className="text-[#e0ff00]">SOVEREIGN INTELLIGENCE TERMINAL</span>
                    </div>
                    <span className="w-px h-4 bg-white/10" />
                    <span className="text-white/20">v4.0 HFT</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Activity size={10} className="text-[#e0ff00] animate-pulse" />
                        <span className="text-white/30">FEEDS:</span>
                        <span className="text-emerald-400">POLYMARKET</span>
                        <span className="text-white/20">+</span>
                        <span className="text-emerald-400">DEFILLAMA</span>
                    </div>
                    <span className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-2">
                        {isConnected ? (
                            <>
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-emerald-400">WALLET: {address?.slice(0,6)}...{address?.slice(-4)}</span>
                            </>
                        ) : (
                            <>
                                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                                <span className="text-white/30">NO WALLET LINKED</span>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* ── TAB NAVIGATION ── */}
            <div className="flex border-b border-white/10 bg-black/40 shrink-0">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
                            tab === t.id
                                ? 'text-[#e0ff00] border-[#e0ff00] bg-[#e0ff00]/5'
                                : 'text-white/30 border-transparent hover:text-white/60 hover:bg-white/5'
                        }`}
                    >
                        {t.icon}
                        {t.label}
                        {t.badge && (
                            <span className={`text-[8px] px-1.5 py-0.5 font-black ${tab === t.id ? 'bg-[#e0ff00] text-black' : 'bg-white/10 text-white/40'}`}>
                                {t.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── CONTENT ── */}
            <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                    {tab === 'polymarket' && (
                        <motion.div key="polymarket" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="h-full">
                            <PolymarketPanel />
                        </motion.div>
                    )}
                    {tab === 'defi' && (
                        <motion.div key="defi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="h-full">
                            <DeFiYieldPanel />
                        </motion.div>
                    )}
                    {tab === 'portfolio' && (
                        <motion.div key="portfolio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex h-full items-center justify-center">
                            <div className="text-center space-y-4">
                                <Shield size={40} className="text-white/10 mx-auto" />
                                <div className="text-[11px] font-mono uppercase tracking-widest text-white/20">
                                    {isConnected ? 'PORTFOLIO TRACKER — ARRIVING IN V4.1' : 'CONNECT WALLET TO ACTIVATE PORTFOLIO TRACKER'}
                                </div>
                                {!isConnected && (
                                    <div className="text-[10px] text-white/30 font-mono">Use the top navigation to link your MetaMask or WalletConnect.</div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
