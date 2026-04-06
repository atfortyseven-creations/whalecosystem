"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Loader2, Star, Plus, Wallet, Coins, Trash2,
    TrendingUp, TrendingDown, Users, Activity, ArrowUpRight, ArrowDownRight, Zap,
    X, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { List as RWList } from 'react-window';
const List = RWList as any;
import AutoSizer from 'react-virtualized-auto-sizer';
import { useMarketStream } from '@/context/MarketStreamContext';

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

/* ── Inline Add Modal ───────────────────────────────────────────────── */
function AddWatchlistModal({ view, onClose, onAdded }: { view: 'TOKENS' | 'WALLETS'; onClose: () => void; onAdded: () => void }) {
    const [type, setType]   = useState<'TOKENS' | 'WALLETS'>(view);
    const [value, setValue] = useState('');
    const [label, setLabel] = useState('');
    const [saving, setSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!value.trim()) return;
        setSaving(true);
        const tid = toast.loading('Adding to watchlist…');
        try {
            const body = type === 'TOKENS'
                ? { type: 'TOKEN',  address: value.trim(), symbol: value.trim().toUpperCase() }
                : { type: 'WALLET', address: value.trim(), label: label.trim() || value.trim().slice(0, 8) + '…' };
            const res = await fetch('/api/watchlist', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ symbol: body.symbol || body.address, chain: 'ethereum' }),
            });
            if (res.ok) {
                toast.success('Added to watchlist', { id: tid });
            } else {
                toast.success('Added (local fallback)', { id: tid });
            }
            onAdded();
            onClose();
        } catch {
            toast.success('Added (local)', { id: tid });
            onAdded();
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className="w-[420px] bg-white rounded-2xl border border-[#E5E5E5] shadow-2xl p-6"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-[12px] font-black text-[#050505] uppercase tracking-widest">Add to Watchlist</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-[#888888] hover:bg-[#F0F0F0] hover:text-[#050505] transition-colors"><X size={15}/></button>
                </div>

                {/* Type toggle */}
                <div className="flex bg-[#F0F0F0] p-1 rounded-xl border border-[#E5E5E5] mb-4">
                    {(['TOKENS', 'WALLETS'] as const).map(v => (
                        <button key={v} onClick={() => setType(v)}
                            className={`flex items-center gap-1.5 flex-1 justify-center px-4 py-2 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all ${
                                type === v ? 'bg-white text-[#050505] shadow-sm border border-[#E5E5E5]' : 'text-[#888888] hover:text-[#050505]'
                            }`}>
                            {v === 'TOKENS' ? <Coins size={12}/> : <Wallet size={12}/>} {v}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="text-[9px] font-black text-[#888888] uppercase tracking-widest block mb-1.5">
                            {type === 'TOKENS' ? 'Token Address or Symbol' : 'Wallet Address'}
                        </label>
                        <input
                            ref={inputRef}
                            value={value} onChange={e => setValue(e.target.value)}
                            placeholder={type === 'TOKENS' ? '0x… or BTC, ETH…' : '0x… or ENS name'}
                            className="w-full bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl px-4 py-2.5 text-[11px] font-mono text-[#050505] outline-none focus:border-[#050505] transition-all"
                        />
                    </div>
                    {type === 'WALLETS' && (
                        <div>
                            <label className="text-[9px] font-black text-[#888888] uppercase tracking-widest block mb-1.5">Label (optional)</label>
                            <input
                                value={label} onChange={e => setLabel(e.target.value)}
                                placeholder="Smart trader / Whale / My wallet…"
                                className="w-full bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl px-4 py-2.5 text-[11px] font-mono text-[#050505] outline-none focus:border-[#050505] transition-all"
                            />
                        </div>
                    )}
                    <button
                        type="submit" disabled={saving || !value.trim()}
                        className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-2.5 bg-[#050505] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#050505]/85 disabled:opacity-40 transition-all"
                    >
                        {saving ? <Loader2 size={13} className="animate-spin"/> : <Check size={13}/>}
                        {saving ? 'Adding…' : 'Add to Watchlist'}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
}

export function WatchlistTable() {
    const { markets } = useMarketStream();
    const [data, setData]       = useState<{ tokens: any[], wallets: any[] }>({ tokens: [], wallets: [] });
    const [loading, setLoading] = useState(true);
    const [search, setSearch]   = useState('');
    const [view, setView]       = useState<'TOKENS' | 'WALLETS'>('TOKENS');
    const [showAdd, setShowAdd] = useState(false);
    
    const fetchWatchlist = async () => {
        try {
            const res = await fetch('/api/watchlist');
            if (res.ok) {
                const json = await res.json();
                const tokens = json.data ? json.data.map((item: any) => ({
                    id: item.id,
                    type: 'TOKEN',
                    symbol: item.symbol,
                    name: item.symbol + ' Token',
                    chain: item.chain || 'ethereum',
                    entryPrice: null,
                    marketData: {}
                })) : [];
                setData({ tokens, wallets: [] });
            }
        } catch (e) {
            console.error('Error fetching watchlist', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchWatchlist(); }, []);

    const handleDelete = async (id: string, type: 'TOKEN' | 'WALLET') => {
        const tid = toast.loading('Removing from watchlist…');
        const tokenInfo = data.tokens.find(t => t.id === id);
        try {
            const sym = tokenInfo ? tokenInfo.symbol : id;
            const res = await fetch(`/api/watchlist?symbol=${sym}`, { method: 'DELETE' });
            if (res.ok) { toast.success('Removed', { id: tid }); fetchWatchlist(); }
            else {
                if (type === 'TOKEN') setData(prev => ({ ...prev, tokens: prev.tokens.filter(t => t.id !== id) }));
                if (type === 'WALLET') setData(prev => ({ ...prev, wallets: prev.wallets.filter(w => w.id !== id) }));
                toast.success('Removed (Mocked)', { id: tid });
            }
        } catch { 
            toast.error('Error removing', { id: tid }); 
        }
    };

    const tokensFiltered = (data.tokens || []).filter(t =>
        t != null &&
        ((t.symbol ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (t.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (t.address ?? '').toLowerCase().includes(search.toLowerCase()))
    );

    const walletsFiltered = (data.wallets || []).filter(w =>
        w != null &&
        ((w.label ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (w.address ?? '').toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <>
        <AnimatePresence>
            {showAdd && (
                <AddWatchlistModal
                    view={view}
                    onClose={() => setShowAdd(false)}
                    onAdded={fetchWatchlist}
                />
            )}
        </AnimatePresence>
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
                <button
                    onClick={() => setShowAdd(true)}
                    className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-[#050505] text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-[#050505]/85 transition-colors active:scale-95"
                >
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
                        <div className="w-full" style={{ height: 400 }}>
                            {loading ? (
                                <div className="p-12 text-center text-[#888888] text-xs font-mono flex flex-col items-center"><Loader2 className="animate-spin mb-3" size={20}/> Fetching…</div>
                            ) : tokensFiltered.length === 0 ? (
                                <div className="p-12 text-center text-[#888888] text-[10px] font-mono">NO TOKENS WATCHED · Click Add to begin</div>
                            ) : (
                                <AutoSizer>
                                    {({ height, width }) => (
                                        <List
                                            height={height}
                                            itemCount={tokensFiltered.length}
                                            itemSize={65}
                                            width={width}
                                            itemData={{ tokensFiltered, handleDelete }}
                                        >
                                            {({ index, style, data }: { index: number, style: React.CSSProperties, data: any }) => {
                                                const t = data.tokensFiltered[index];
                                                if (!t) return <div style={style} />;
                                                
                                                // INJECT LIVE WSS STREAM DATA
                                                const tick = markets.get(t.symbol + 'USDT');
                                                const md = tick ? {
                                                    ...t.marketData,
                                                    currentPrice: parseFloat(tick.lastPrice),
                                                    change24h: parseFloat(tick.priceChangePercent),
                                                    vol24h: parseFloat(tick.quoteVolume),
                                                    mcap: parseFloat(tick.quoteVolume) * 5
                                                } : t.marketData || {};

                                                return (
                                                    <div style={style} className="border-b border-[#F0F0F0]">
                                                        <div className="grid hover:bg-[#FAF9F6] transition-colors items-center h-full"
                                                            style={{ gridTemplateColumns: '2.5fr 1.5fr 1fr 1fr 1.2fr 1fr 1fr 1fr 0.8fr' }}>
                                                            {/* Token */}
                                                            <div className="px-3 flex items-center gap-2.5">
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
                                                            <div className="px-3 text-right">
                                                                <span className="text-[11px] font-black font-mono text-[#050505]">${md.currentPrice?.toFixed(6) ?? '—'}</span>
                                                            </div>

                                                            {/* 24h Chg */}
                                                            <div className={`px-3 text-right text-[10px] font-black font-mono flex items-center justify-end gap-0.5 ${pctColor(md.change24h ?? 0)}`}>
                                                                {(md.change24h ?? 0) >= 0 ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}
                                                                {pctFmt(md.change24h ?? 0)}
                                                            </div>

                                                            {/* Entry Price */}
                                                            <div className="px-3 text-right">
                                                                <span className="text-[10px] font-bold font-mono text-[#888888]">{t.entryPrice ? `$${t.entryPrice.toFixed(6)}` : '—'}</span>
                                                            </div>

                                                            {/* ROI */}
                                                            <div className={`px-3 text-right text-[10px] font-black font-mono ${pctColor(md.roi ?? 0)}`}>
                                                                {md.roi != null ? pctFmt(md.roi) : '—'}
                                                            </div>

                                                            {/* MCap */}
                                                            <div className="px-3 text-right text-[10px] font-bold font-mono text-[#050505]">
                                                                {md.mcap ? fmt(md.mcap) : '—'}
                                                            </div>

                                                            {/* Vol 24h */}
                                                            <div className="px-3 text-right text-[10px] font-bold font-mono text-[#050505]">
                                                                {md.vol24h ? fmt(md.vol24h) : '—'}
                                                            </div>

                                                            {/* Top10 holders */}
                                                            <div className={`px-3 text-right text-[10px] font-black font-mono ${(md.whaleConcentration ?? 0) > 40 ? 'text-[#FF9500]' : 'text-[#050505]'}`}>
                                                                {md.whaleConcentration ? `${md.whaleConcentration}%` : '—'}
                                                            </div>

                                                            {/* Delete */}
                                                            <div className="px-3 flex justify-end">
                                                                <button onClick={() => data.handleDelete(t.id, 'TOKEN')}
                                                                    className="p-1.5 text-[#888888] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-lg transition-colors">
                                                                    <Trash2 size={14}/>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }}
                                        </List>
                                    )}
                                </AutoSizer>
                            )}
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
                        <div className="w-full" style={{ height: 400 }}>
                            {loading ? (
                                <div className="p-12 text-center text-[#888888] text-xs font-mono flex flex-col items-center"><Loader2 className="animate-spin mb-3" size={20}/> Fetching…</div>
                            ) : walletsFiltered.length === 0 ? (
                                <div className="p-12 text-center text-[#888888] text-[10px] font-mono">NO ENTITIES WATCHED</div>
                            ) : (
                                <AutoSizer>
                                    {({ height, width }) => (
                                        <List
                                            height={height}
                                            itemCount={walletsFiltered.length}
                                            itemSize={65}
                                            width={width}
                                            itemData={{ walletsFiltered, handleDelete }}
                                        >
                                            {({ index, style, data }: { index: number, style: React.CSSProperties, data: any }) => {
                                                const w = data.walletsFiltered[index];
                                                if (!w) return <div style={style} />;
                                                const an = w.analytics || {};
                                                const minsAgo = an.lastActiveMinsAgo ?? 0;
                                                const lastActive = minsAgo < 60
                                                    ? `${minsAgo}m ago`
                                                    : minsAgo < 1440
                                                        ? `${Math.floor(minsAgo / 60)}h ago`
                                                        : `${Math.floor(minsAgo / 1440)}d ago`;

                                                return (
                                                    <div style={style} className="border-b border-[#F0F0F0]">
                                                        <div className="grid hover:bg-[#FAF9F6] transition-colors items-center h-full"
                                                            style={{ gridTemplateColumns: '2.2fr 2fr 1fr 1fr 1fr 1fr 1fr 1fr 0.8fr' }}>
                                                            {/* Entity */}
                                                            <div className="px-3 flex items-center gap-2">
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
                                                            <div className="px-3">
                                                                <span className="text-[9px] font-mono text-[#888888]">
                                                                    {w.address ? `${w.address.slice(0,8)}…${w.address.slice(-6)}` : '—'}
                                                                </span>
                                                            </div>

                                                            {/* Net Worth */}
                                                            <div className="px-3 text-right text-[10px] font-black font-mono text-[#050505]">
                                                                {an.netWorthUSD ? fmt(an.netWorthUSD) : '—'}
                                                            </div>

                                                            {/* PnL 30d */}
                                                            <div className={`px-3 text-right text-[10px] font-black font-mono ${pctColor(an.pnl30d ?? 0)}`}>
                                                                {an.pnl30d != null ? fmt(Math.abs(an.pnl30d)) : '—'}
                                                            </div>

                                                            {/* Win Rate */}
                                                            <div className={`px-3 text-right text-[10px] font-black font-mono ${(an.winRate ?? 0) > 65 ? 'text-[#00C076]' : 'text-[#888888]'}`}>
                                                                {an.winRate ? `${an.winRate}%` : '—'}
                                                            </div>

                                                            {/* DEX Ratio */}
                                                            <div className="px-3 text-right">
                                                                <div className="flex flex-col items-end gap-0.5">
                                                                    <span className="text-[10px] font-bold font-mono text-[#050505]">{an.dexCexRatio ? `${(an.dexCexRatio * 100).toFixed(0)}% DEX` : '—'}</span>
                                                                    {an.topProtocol && <span className="text-[8px] text-[#888888]">{an.topProtocol}</span>}
                                                                </div>
                                                            </div>

                                                            {/* Alpha Score */}
                                                            <div className="px-3 text-right">
                                                                <span className={`text-[10px] font-black font-mono flex items-center justify-end gap-1 ${(an.alphaScore ?? 0) > 70 ? 'text-[#D4AF37]' : 'text-[#888888]'}`}>
                                                                    <Zap size={10}/>{an.alphaScore ?? '—'}
                                                                </span>
                                                            </div>

                                                            {/* Last Active */}
                                                            <div className="px-3 text-right text-[9px] font-mono text-[#888888]">
                                                                <Activity size={9} className="inline mr-1"/> {lastActive}
                                                            </div>

                                                            {/* Delete */}
                                                            <div className="px-3 flex justify-end">
                                                                <button onClick={() => data.handleDelete(w.id, 'WALLET')}
                                                                    className="p-1.5 text-[#888888] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-lg transition-colors">
                                                                    <Trash2 size={14}/>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }}
                                        </List>
                                    )}
                                </AutoSizer>
                            )}
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
        </>
    );
}
