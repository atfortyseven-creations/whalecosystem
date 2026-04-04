"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Search, Loader2, ShieldCheck, ShieldAlert,
    ArrowUpRight, ArrowDownRight, Clock, Filter,
    Users, Zap, AlertTriangle, RefreshCw
} from 'lucide-react';

type Chain = 'all' | 'solana' | 'base' | 'ethereum' | 'arbitrum' | 'bsc';

const CHAIN_COLORS: Record<string, string> = {
    solana:   '#9945FF',
    base:     '#0052FF',
    ethereum: '#627EEA',
    arbitrum: '#12AAFF',
    bsc:      '#F0B90B',
};

export function NewPairsTable() {
    const [pairs, setPairs]       = useState<any[]>([]);
    const [loading, setLoading]   = useState(true);
    const [search, setSearch]     = useState('');
    const [chainFilter, setChainFilter] = useState<Chain>('all');
    const [rugFilter, setRugFilter]     = useState<'all' | 'verified' | 'risky'>('all');
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    const fetchPairs = useCallback(async () => {
        try {
            const res = await fetch('/api/market/new-pairs?limit=25');
            if (res.ok) {
                const data = await res.json();
                setPairs(data.pairs || []);
                setLastRefresh(new Date());
            }
        } catch (e) {
            console.error('Error fetching pairs', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPairs();
        const interval = setInterval(fetchPairs, 8000);
        return () => clearInterval(interval);
    }, [fetchPairs]);

    const fmt = (n: number) => {
        if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
        if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
        if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
        return `$${n.toFixed(0)}`;
    };

    const pctColor = (v: number) => v >= 0 ? 'text-[#00C076]' : 'text-[#FF3B30]';
    const pctFmt   = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;

    const getAge = (ms: number) => {
        const diff = Date.now() - ms;
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m`;
        return `${Math.floor(mins / 60)}h ${mins % 60}m`;
    };

    const filtered = pairs
        .filter(p => chainFilter === 'all' || p.chain === chainFilter)
        .filter(p => {
            if (rugFilter === 'verified') return p.security.score >= 65;
            if (rugFilter === 'risky')    return p.security.score < 65;
            return true;
        })
        .filter(p =>
            p.baseToken.symbol.toLowerCase().includes(search.toLowerCase()) ||
            p.baseToken.name.toLowerCase().includes(search.toLowerCase()) ||
            p.chain.toLowerCase().includes(search.toLowerCase())
        );

    const chains: Chain[] = ['all', 'solana', 'base', 'ethereum', 'arbitrum', 'bsc'];

    return (
        <div className="flex flex-col h-full bg-[#FFFFFF] rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-sm">

            {/* ── Toolbar ── */}
            <div className="px-4 py-3 border-b border-[#E5E5E5] bg-[#FAF9F6] flex items-center gap-3 flex-wrap">
                {/* Search */}
                <div className="relative flex-1 min-w-[180px] max-w-xs">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Symbol, chain…"
                        className="w-full bg-white border border-[#E5E5E5] rounded-lg pl-8 pr-3 py-1.5 text-[11px] font-mono text-[#050505] outline-none focus:border-[#050505] transition-all"
                    />
                </div>

                {/* Chain filter pills */}
                <div className="flex gap-1 flex-wrap">
                    {chains.map(c => (
                        <button key={c}
                            onClick={() => setChainFilter(c)}
                            className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border transition-all ${chainFilter === c ? 'bg-[#050505] text-white border-[#050505]' : 'text-[#888888] border-[#E5E5E5] hover:border-[#050505] hover:text-[#050505]'}`}
                        >
                            {c === 'all' ? 'ALL' : c.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* Rug filter */}
                <div className="flex gap-1">
                    {(['all', 'verified', 'risky'] as const).map(f => (
                        <button key={f}
                            onClick={() => setRugFilter(f)}
                            className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border transition-all ${rugFilter === f
                                ? f === 'verified' ? 'bg-[#00C076] text-white border-[#00C076]'
                                : f === 'risky'    ? 'bg-[#FF3B30] text-white border-[#FF3B30]'
                                : 'bg-[#050505] text-white border-[#050505]'
                                : 'text-[#888888] border-[#E5E5E5] hover:border-[#050505]'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Refresh + status */}
                <div className="ml-auto flex items-center gap-3">
                    <button onClick={fetchPairs} className="p-1.5 rounded-lg border border-[#E5E5E5] text-[#888888] hover:text-[#050505] transition-colors">
                        <RefreshCw size={13} />
                    </button>
                    <span className="flex items-center gap-1.5 text-[9px] font-black tracking-widest uppercase text-[#00C076]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00C076] animate-pulse" /> LIVE · {lastRefresh.toTimeString().slice(0,8)}
                    </span>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="flex-1 overflow-auto relative">
                <div className="min-w-[1400px]">

                    {/* Column Headers */}
                    <div className="sticky top-0 z-10 grid bg-[#FAF9F6] border-b border-[#E5E5E5] text-[9px] font-black text-[#888888] uppercase tracking-[0.18em]"
                        style={{ gridTemplateColumns: '2.4fr 1.4fr 0.7fr 0.9fr 0.9fr 0.9fr 0.9fr 0.9fr 0.9fr 1fr 1fr 1.4fr' }}
                    >
                        {['Token / Dex', 'Price USD', 'Age', '5m %', '1h %', '6h %', '24h %', 'Liquidity', 'MCap', 'FDV', 'Makers', 'Security'].map((h, idx) => (
                            <div key={h} className={`px-3 py-2.5 ${idx > 2 ? 'text-right' : ''}`}>{h}</div>
                        ))}
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-[#F0F0F0]">
                        {loading && pairs.length === 0 ? (
                            <div className="p-12 text-center text-[#888888] text-xs font-mono flex flex-col items-center">
                                <Loader2 className="animate-spin mb-3" size={22} /> Scanning mempool streams…
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="p-12 text-center text-[#888888] text-[10px] font-mono">NO PAIRS MATCH FILTERS</div>
                        ) : filtered.map((p, i) => {
                            const isRug = p.security.score < 65;
                            const score = p.security.score;
                            return (
                                <motion.div key={p.id}
                                    initial={{ opacity: 0, y: -3 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.025 }}
                                    className="grid hover:bg-[#FAF9F6] transition-colors items-center cursor-pointer"
                                    style={{ gridTemplateColumns: '2.4fr 1.4fr 0.7fr 0.9fr 0.9fr 0.9fr 0.9fr 0.9fr 0.9fr 1fr 1fr 1.4fr' }}
                                >
                                    {/* Token / Dex */}
                                    <div className="px-3 py-3 flex items-center gap-2.5 overflow-hidden">
                                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0"
                                            style={{ background: CHAIN_COLORS[p.chain] || '#888' }}>
                                            {p.baseToken.symbol[0]}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[11px] font-black text-[#050505] truncate">{p.baseToken.symbol}</span>
                                                <span className="text-[8px] font-mono text-[#888888]">/ {p.quoteToken.symbol}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-[8px] font-bold text-[#888888] truncate">{p.baseToken.name}</span>
                                                <span className="text-[7px] px-1.5 py-0.5 rounded border border-[#E5E5E5] text-[#888888]" style={{ borderColor: CHAIN_COLORS[p.chain] + '55', color: CHAIN_COLORS[p.chain] }}>{p.chain}</span>
                                                <span className="text-[7px] text-[#888888]">{p.dex}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="px-3 py-3">
                                        <div className="text-[11px] font-black font-mono text-[#050505]">${p.priceUsd}</div>
                                        <div className="flex gap-2 mt-0.5 text-[9px] font-mono">
                                            <span className="text-[#00C076] flex items-center gap-0.5"><ArrowUpRight size={9}/>{p.txns.m5.buys}B</span>
                                            <span className="text-[#FF3B30] flex items-center gap-0.5"><ArrowDownRight size={9}/>{p.txns.m5.sells}S</span>
                                        </div>
                                    </div>

                                    {/* Age */}
                                    <div className="px-3 py-3 text-right text-[10px] font-mono font-bold text-[#050505] flex items-center justify-end gap-1">
                                        <Clock size={10} className="text-[#888888]" />{getAge(p.pairCreatedAt)}
                                    </div>

                                    {/* 5m % */}
                                    <div className={`px-3 py-3 text-right text-[10px] font-black font-mono ${pctColor(p.priceChange.m5)}`}>
                                        {pctFmt(p.priceChange.m5)}
                                    </div>

                                    {/* 1h % */}
                                    <div className={`px-3 py-3 text-right text-[10px] font-black font-mono ${pctColor(p.priceChange.h1)}`}>
                                        {pctFmt(p.priceChange.h1)}
                                    </div>

                                    {/* 6h % */}
                                    <div className={`px-3 py-3 text-right text-[10px] font-black font-mono ${pctColor(p.priceChange.h6)}`}>
                                        {pctFmt(p.priceChange.h6)}
                                    </div>

                                    {/* 24h % */}
                                    <div className={`px-3 py-3 text-right text-[10px] font-black font-mono ${pctColor(p.priceChange.h24)}`}>
                                        {pctFmt(p.priceChange.h24)}
                                    </div>

                                    {/* Liquidity */}
                                    <div className="px-3 py-3 text-right text-[10px] font-bold font-mono text-[#050505]">
                                        {fmt(p.liquidity.usd)}
                                    </div>

                                    {/* MCap */}
                                    <div className="px-3 py-3 text-right text-[10px] font-bold font-mono text-[#050505]">
                                        {fmt(p.mcap)}
                                    </div>

                                    {/* FDV */}
                                    <div className="px-3 py-3 text-right text-[10px] font-bold font-mono text-[#888888]">
                                        {fmt(p.fdv)}
                                    </div>

                                    {/* Makers */}
                                    <div className="px-3 py-3 text-right">
                                        <div className="flex flex-col items-end gap-0.5">
                                            <span className="text-[10px] font-black font-mono text-[#050505] flex items-center gap-1">
                                                <Users size={9} className="text-[#888888]" />{p.traders.makers}
                                            </span>
                                            {p.traders.snipers > 0 && (
                                                <span className="text-[8px] font-bold text-[#FF3B30] flex items-center gap-0.5">
                                                    <Zap size={8}/>{p.traders.snipers} snipers
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Security Score */}
                                    <div className="px-3 py-3">
                                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider border w-fit ml-auto ${
                                            isRug
                                                ? 'bg-[#FF3B30]/10 border-[#FF3B30]/30 text-[#FF3B30]'
                                                : 'bg-[#00C076]/10 border-[#00C076]/30 text-[#00C076]'
                                        }`}>
                                            {isRug ? <ShieldAlert size={10}/> : <ShieldCheck size={10}/>}
                                            <span>{score}/100</span>
                                            {p.security.honeypotRisk && <AlertTriangle size={9} className="text-[#FF9500]" />}
                                        </div>
                                        <div className="flex gap-1.5 justify-end mt-1">
                                            {p.security.lpBurned     && <span className="text-[7px] font-black text-[#00C076]">LP✓</span>}
                                            {p.security.mintRevoked  && <span className="text-[7px] font-black text-[#00C076]">MINT✓</span>}
                                            {p.taxes.buy  > 0 && <span className="text-[7px] font-bold text-[#888888]">B:{p.taxes.buy}%</span>}
                                            {p.taxes.sell > 0 && <span className="text-[7px] font-bold text-[#888888]">S:{p.taxes.sell}%</span>}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Status Footer ── */}
            <div className="px-6 py-2 border-t border-[#E5E5E5] bg-[#FAF9F6] flex items-center justify-between text-[9px] font-black text-[#888888] uppercase tracking-widest">
                <span>{filtered.length} pairs shown · refreshes every 8s</span>
                <span>Security powered by Whale Alert Network Engine</span>
            </div>
        </div>
    );
}
