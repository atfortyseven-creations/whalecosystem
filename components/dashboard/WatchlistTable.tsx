"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Search, Loader2, Star, Plus, Wallet, Coins, Trash2,
    TrendingUp, TrendingDown, Users, Activity, ArrowUpRight, ArrowDownRight, Zap
} from 'lucide-react';
import { toast } from 'sonner';

const fmt = (n: number) => {
    if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3)  return `$${(n / 1e3).toFixed(1)}K`;
    return `$${n.toFixed(2)}`;
};

const pctColor = (v: number) => v >= 0 ? 'text-[#00C076]' : 'text-[#FF3B30]';
const pctFmt   = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;

const CHAIN_COLORS: Record<string, string> = {
    ethereum: '#627EEA',
    solana:   '#9945FF',
    base:     '#0052FF',
    arbitrum: '#12AAFF',
    bsc:      '#F0B90B',
};

export function WatchlistTable() {
    const [data, setData]     = useState<{ tokens: any[], wallets: any[] }>({ tokens: [], wallets: [] });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [view, setView]     = useState<'TOKENS' | 'WALLETS'>('TOKENS');

    const fetchWatchlist = async () => {
        try {
            const res = await fetch('/api/user/watchlist');
            if (res.ok) setData(await res.json());
        } catch (e) {
            console.error('Error fetching watchlist', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchWatchlist(); }, []);

    const handleDelete = async (id: string, type: 'TOKEN' | 'WALLET') => {
        const tid = toast.loading('Removing from watchlist…');
        try {
            const res = await fetch(`/api/user/watchlist?id=${id}&type=${type}`, { method: 'DELETE' });
            if (res.ok) { toast.success('Removed', { id: tid }); fetchWatchlist(); }
            else         throw new Error();
        } catch { toast.error('Error removing', { id: tid }); }
    };

    const tokensFiltered = data.tokens.filter(t =>
        t.symbol.toLowerCase().includes(search.toLowerCase()) ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.address?.toLowerCase().includes(search.toLowerCase())
    );

    const walletsFiltered = data.wallets.filter(w =>
        w.label.toLowerCase().includes(search.toLowerCase()) ||
        w.address?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-[#FFFFFF] rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-sm">

            {/* ── Toolbar ── */}
            <div className="px-4 py-3 border-b border-[#E5E5E5] bg-[#FAF9F6] flex items-center gap-4 flex-wrap">
                {/* View toggle */}
                <div className="flex bg-[#F0F0F0] p-1 rounded-xl border border-[#E5E5E5]">
                    {(['TOKENS', 'WALLETS'] as const).map(v => (
                        <button key={v} onClick={() => setView(v)}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all ${view === v ? 'bg-white text-[#050505] shadow-sm border border-[#E5E5E5]' : 'text-[#888888] hover:text-[#050505]'}`}>
                            {v === 'TOKENS' ? <Coins size={12}/> : <Wallet size={12}/>} {v}
                        </button>
                    ))}
                </div>
                {/* Search */}
                <div className="relative flex-1 min-w-[180px] max-w-xs">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter watchlist…"
                        className="w-full bg-white border border-[#E5E5E5] rounded-lg pl-8 pr-3 py-1.5 text-[11px] font-mono text-[#050505] outline-none focus:border-[#050505] transition-all"
                    />
                </div>
                {/* Add New */}
                <button className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-[#050505] text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-[#050505]/85 transition-colors">
                    <Plus size={13}/> Add
                </button>
            </div>

            {/* ── Token Table ── */}
            {view === 'TOKENS' && (
                <div className="flex-1 overflow-auto">
                    <div className="min-w-[1200px]">
                        <div className="sticky top-0 z-10 grid bg-[#FAF9F6] border-b border-[#E5E5E5] text-[9px] font-black text-[#888888] uppercase tracking-[0.18em]"
                            style={{ gridTemplateColumns: '2.5fr 1.5fr 1fr 1fr 1.2fr 1fr 1fr 1fr 0.8fr' }}>
                            {['Token', 'Current Price', '24h Chg', 'Entry Price', 'ROI', 'MCap', 'Vol 24h', 'Top-10 Hold.', ''].map((h, i) => (
                                <div key={i} className={`px-3 py-2.5 ${i >= 2 ? 'text-right' : ''}`}>{h}</div>
                            ))}
                        </div>
                        <div className="divide-y divide-[#F0F0F0]">
                            {loading ? (
                                <div className="p-12 text-center text-[#888888] text-xs font-mono flex flex-col items-center"><Loader2 className="animate-spin mb-3" size={20}/> Fetching…</div>
                            ) : tokensFiltered.length === 0 ? (
                                <div className="p-12 text-center text-[#888888] text-[10px] font-mono">NO TOKENS WATCHED · Click Add to begin</div>
                            ) : tokensFiltered.map((t, i) => {
                                const md = t.marketData || {};
                                return (
                                    <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                        className="grid hover:bg-[#FAF9F6] transition-colors items-center"
                                        style={{ gridTemplateColumns: '2.5fr 1.5fr 1fr 1fr 1.2fr 1fr 1fr 1fr 0.8fr' }}>

                                        {/* Token */}
                                        <div className="px-3 py-3 flex items-center gap-2.5">
                                            <Star size={12} className="text-[#D4AF37] fill-[#D4AF37] shrink-0" />
                                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0"
                                                style={{ background: CHAIN_COLORS[t.chain] || '#888' }}>
                                                {t.symbol?.[0]}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[11px] font-black text-[#050505] truncate">{t.symbol}</span>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[8px] text-[#888888] font-mono truncate">{t.name}</span>
                                                    <span className="text-[7px] px-1 py-0.5 rounded border font-bold uppercase" style={{ color: CHAIN_COLORS[t.chain], borderColor: CHAIN_COLORS[t.chain] + '55' }}>{t.chain}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Current Price */}
                                        <div className="px-3 py-3 text-right">
                                            <span className="text-[11px] font-black font-mono text-[#050505]">${md.currentPrice?.toFixed(6) ?? '—'}</span>
                                        </div>

                                        {/* 24h Chg */}
                                        <div className={`px-3 py-3 text-right text-[10px] font-black font-mono flex items-center justify-end gap-0.5 ${pctColor(md.change24h ?? 0)}`}>
                                            {(md.change24h ?? 0) >= 0 ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}
                                            {pctFmt(md.change24h ?? 0)}
                                        </div>

                                        {/* Entry Price */}
                                        <div className="px-3 py-3 text-right">
                                            <span className="text-[10px] font-bold font-mono text-[#888888]">{t.entryPrice ? `$${t.entryPrice.toFixed(6)}` : '—'}</span>
                                        </div>

                                        {/* ROI */}
                                        <div className={`px-3 py-3 text-right text-[10px] font-black font-mono ${pctColor(md.roi ?? 0)}`}>
                                            {md.roi != null ? pctFmt(md.roi) : '—'}
                                        </div>

                                        {/* MCap */}
                                        <div className="px-3 py-3 text-right text-[10px] font-bold font-mono text-[#050505]">
                                            {md.mcap ? fmt(md.mcap) : '—'}
                                        </div>

                                        {/* Vol 24h */}
                                        <div className="px-3 py-3 text-right text-[10px] font-bold font-mono text-[#050505]">
                                            {md.vol24h ? fmt(md.vol24h) : '—'}
                                        </div>

                                        {/* Top10 holders */}
                                        <div className={`px-3 py-3 text-right text-[10px] font-black font-mono ${(md.whaleConcentration ?? 0) > 40 ? 'text-[#FF9500]' : 'text-[#050505]'}`}>
                                            {md.whaleConcentration ? `${md.whaleConcentration}%` : '—'}
                                        </div>

                                        {/* Delete */}
                                        <div className="px-3 py-3 flex justify-end">
                                            <button onClick={() => handleDelete(t.id, 'TOKEN')}
                                                className="p-1.5 text-[#888888] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-lg transition-colors">
                                                <Trash2 size={14}/>
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Wallet / Entity Table ── */}
            {view === 'WALLETS' && (
                <div className="flex-1 overflow-auto">
                    <div className="min-w-[1200px]">
                        <div className="sticky top-0 z-10 grid bg-[#FAF9F6] border-b border-[#E5E5E5] text-[9px] font-black text-[#888888] uppercase tracking-[0.18em]"
                            style={{ gridTemplateColumns: '2.2fr 2fr 1fr 1fr 1fr 1fr 1fr 1fr 0.8fr' }}>
                            {['Entity', 'Address', 'Net Worth', 'PnL 30d', 'Win Rate', 'DEX Ratio', 'Alpha Score', 'Last Active', ''].map((h, i) => (
                                <div key={i} className={`px-3 py-2.5 ${i >= 2 ? 'text-right' : ''}`}>{h}</div>
                            ))}
                        </div>
                        <div className="divide-y divide-[#F0F0F0]">
                            {loading ? (
                                <div className="p-12 text-center text-[#888888] text-xs font-mono flex flex-col items-center"><Loader2 className="animate-spin mb-3" size={20}/> Fetching…</div>
                            ) : walletsFiltered.length === 0 ? (
                                <div className="p-12 text-center text-[#888888] text-[10px] font-mono">NO ENTITIES WATCHED</div>
                            ) : walletsFiltered.map((w, i) => {
                                const an = w.analytics || {};
                                const lastActive = an.lastActiveMinsAgo < 60
                                    ? `${an.lastActiveMinsAgo}m ago`
                                    : an.lastActiveMinsAgo < 1440
                                        ? `${Math.floor(an.lastActiveMinsAgo / 60)}h ago`
                                        : `${Math.floor(an.lastActiveMinsAgo / 1440)}d ago`;

                                return (
                                    <motion.div key={w.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                        className="grid hover:bg-[#FAF9F6] transition-colors items-center"
                                        style={{ gridTemplateColumns: '2.2fr 2fr 1fr 1fr 1fr 1fr 1fr 1fr 0.8fr' }}>

                                        {/* Entity */}
                                        <div className="px-3 py-3 flex items-center gap-2">
                                            <Star size={12} className="text-[#D4AF37] fill-[#D4AF37] shrink-0" />
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-[#050505]">{w.label}</span>
                                                <div className="flex gap-1 mt-0.5">
                                                    {w.isWhale && <span className="text-[7px] px-1 py-0.5 rounded bg-[#627EEA]/10 text-[#627EEA] border border-[#627EEA]/20 font-black uppercase">Whale</span>}
                                                    {w.isSmart && <span className="text-[7px] px-1 py-0.5 rounded bg-[#00C076]/10 text-[#00C076] border border-[#00C076]/20 font-black uppercase">Smart</span>}
                                                    {w.alertsEnabled && <span className="text-[7px] px-1 py-0.5 rounded bg-[#FF9500]/10 text-[#FF9500] border border-[#FF9500]/20 font-black uppercase">Alert</span>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Address */}
                                        <div className="px-3 py-3">
                                            <span className="text-[9px] font-mono text-[#888888]">
                                                {w.address ? `${w.address.slice(0,8)}…${w.address.slice(-6)}` : '—'}
                                            </span>
                                        </div>

                                        {/* Net Worth */}
                                        <div className="px-3 py-3 text-right text-[10px] font-black font-mono text-[#050505]">
                                            {an.netWorthUSD ? fmt(an.netWorthUSD) : '—'}
                                        </div>

                                        {/* PnL 30d */}
                                        <div className={`px-3 py-3 text-right text-[10px] font-black font-mono ${pctColor(an.pnl30d ?? 0)}`}>
                                            {an.pnl30d != null ? fmt(Math.abs(an.pnl30d)) : '—'}
                                        </div>

                                        {/* Win Rate */}
                                        <div className={`px-3 py-3 text-right text-[10px] font-black font-mono ${(an.winRate ?? 0) > 65 ? 'text-[#00C076]' : 'text-[#888888]'}`}>
                                            {an.winRate ? `${an.winRate}%` : '—'}
                                        </div>

                                        {/* DEX Ratio */}
                                        <div className="px-3 py-3 text-right">
                                            <div className="flex flex-col items-end gap-0.5">
                                                <span className="text-[10px] font-bold font-mono text-[#050505]">{an.dexCexRatio ? `${(an.dexCexRatio * 100).toFixed(0)}% DEX` : '—'}</span>
                                                {an.topProtocol && <span className="text-[8px] text-[#888888]">{an.topProtocol}</span>}
                                            </div>
                                        </div>

                                        {/* Alpha Score */}
                                        <div className="px-3 py-3 text-right">
                                            <span className={`text-[10px] font-black font-mono flex items-center justify-end gap-1 ${(an.alphaScore ?? 0) > 70 ? 'text-[#D4AF37]' : 'text-[#888888]'}`}>
                                                <Zap size={10}/>{an.alphaScore ?? '—'}
                                            </span>
                                        </div>

                                        {/* Last Active */}
                                        <div className="px-3 py-3 text-right text-[9px] font-mono text-[#888888]">
                                            <Activity size={9} className="inline mr-1"/> {lastActive}
                                        </div>

                                        {/* Delete */}
                                        <div className="px-3 py-3 flex justify-end">
                                            <button onClick={() => handleDelete(w.id, 'WALLET')}
                                                className="p-1.5 text-[#888888] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-lg transition-colors">
                                                <Trash2 size={14}/>
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Footer ── */}
            <div className="px-6 py-2 border-t border-[#E5E5E5] bg-[#FAF9F6] flex items-center justify-between text-[9px] font-black text-[#888888] uppercase tracking-widest">
                <span>{view === 'TOKENS' ? tokensFiltered.length : walletsFiltered.length} items · Enriched with market data</span>
                <span>Data refreshes on page load</span>
            </div>
        </div>
    );
}
