"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Loader2, Star, Plus, Wallet, Coins, Trash2,
    TrendingUp, TrendingDown, Users, Activity, ArrowUpRight, ArrowDownRight, Zap,
    X, Check
} from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
const List = dynamic<any>(
    () => import('react-window').then(m => (m as any).FixedSizeList),
    { ssr: false }
);
const AutoSizer = dynamic(() => import('react-virtualized-auto-sizer'), { ssr: false });
import { useMarketStream } from '@/context/MarketStreamContext';
import { useAccount } from 'wagmi';

// ── XSS Sanitization ────────────────────────────────────────────────────────────
// Strips HTML/script injection vectors before any user input touches
// localStorage or the D3 graph visualizer (EntityGraphVis).
const sanitize = (s: string) =>
    s.replace(/[<>"'`/\\{}\[\]]/g, '').trim().slice(0, 80);

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
    const { address } = useAccount();
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
        const safeValue = sanitize(value);
        const safeLabel = sanitize(label);
        try {
            const body = type === 'TOKENS'
                ? { type: 'TOKEN',  address: safeValue, symbol: safeValue.toUpperCase() }
                : { type: 'WALLET', address: safeValue, label: safeLabel || safeValue.slice(0, 8) + '…' };
            const res = await fetch('/api/watchlist', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ symbol: body.symbol || body.address, chain: 'ethereum' }),
            });
            if (res.ok) {
                toast.success('Added to watchlist', { id: tid });
            } else {
                saveToLocal(body, address);
                toast.success('Added locally', { id: tid });
            }
            onAdded();
            onClose();
        } catch {
            saveToLocal({ type: 'TOKEN', address: safeValue, symbol: safeValue.toUpperCase() }, address);
            toast.success('Added locally', { id: tid });
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
    const { address } = useAccount();
    const [data, setData]       = useState<{ tokens: any[], wallets: any[] }>({ tokens: [], wallets: [] });
    const [loading, setLoading] = useState(true);
    const [search, setSearch]   = useState('');
    const [view, setView]       = useState<'TOKENS' | 'WALLETS'>('TOKENS');
    const [showAdd, setShowAdd] = useState(false);
    
    const effectiveAddress = address || 'DEFAULT_WALLET';
    
    // DexScreener Global Search
    const [globalSearchTokens, setGlobalSearchTokens] = useState<any[]>([]);
    const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);

    useEffect(() => {
        if (search.length < 2 || view !== 'TOKENS') {
            setGlobalSearchTokens([]);
            return;
        }
        const delayDebounceFn = setTimeout(async () => {
            setIsSearchingGlobal(true);
            try {
                const res = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${search}`);
                const json = await res.json();
                if (json.pairs) {
                    const uniquePairs = new Map();
                    // Deduplicate by baseToken address taking the highest liquidity pair
                    json.pairs.forEach((p: any) => {
                        const addr = p.baseToken.address;
                        if (!uniquePairs.has(addr) || (p.liquidity?.usd || 0) > (uniquePairs.get(addr).liquidity?.usd || 0)) {
                            uniquePairs.set(addr, p);
                        }
                    });
                    
                    const mapped = Array.from(uniquePairs.values()).slice(0, 30).map((p: any) => ({
                        id: p.pairAddress,
                        type: 'TOKEN',
                        symbol: p.baseToken.symbol,
                        name: p.baseToken.name,
                        chain: p.chainId,
                        entryPrice: null,
                        marketData: {
                            currentPrice: parseFloat(p.priceUsd || '0'),
                            change24h: p.priceChange?.h24 || 0,
                            vol24h: p.volume?.h24 || 0,
                            mcap: p.fdv || p.liquidity?.usd || 0,
                            roi: null,
                            whaleConcentration: null
                        }
                    }));
                    setGlobalSearchTokens(mapped);
                }
            } catch (e) {
                console.error("Global search failed:", e);
            } finally {
                setIsSearchingGlobal(false);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [search, view]);
    
    const fetchWatchlist = async () => {
        try {
            const res = await fetch('/api/watchlist');
            if (res.ok) {
                const json = await res.json();
                const serverData = Array.isArray(json.data) ? json.data : [];
                const serverTokens: any[] = serverData.map((item: any) => ({
                    id: item.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)),
                    type: 'TOKEN',
                    symbol: item.symbol,
                    name: item.symbol + ' Token',
                    chain: item.chain || 'ethereum',
                    entryPrice: null,
                    marketData: {}
                }));

                const serverSymbols = new Set(serverTokens.map((t: any) => t.symbol));

                // Only add local tokens the server doesn't know about yet
                let localTokens: any[] = [];
                try {
                    const prefix = `SOV_WL_${effectiveAddress.toLowerCase()}`;
                    const localStr = (typeof window !== 'undefined') ? localStorage.getItem(`${prefix}_TOKENS`) : null;
                    if (localStr) {
                         const parsed = JSON.parse(localStr);
                         if (Array.isArray(parsed)) localTokens = parsed;
                    }
                } catch(e) {}
                const onlyLocalTokens = localTokens.filter((t: any) => t && !serverSymbols.has(t.symbol));

                setData({ tokens: [...serverTokens, ...onlyLocalTokens], wallets: [] });
            } else {
                // Fallback entirely to local
                let localTokens: any[] = [];
                try {
                    const prefix = `SOV_WL_${effectiveAddress.toLowerCase()}`;
                    const localStr = (typeof window !== 'undefined') ? localStorage.getItem(`${prefix}_TOKENS`) : null;
                    if (localStr) {
                         const parsed = JSON.parse(localStr);
                         if (Array.isArray(parsed)) localTokens = parsed;
                    }
                } catch(e) {}
                setData({ tokens: localTokens, wallets: [] });
            }
        } catch (e) {
            console.error('Error fetching watchlist', e);
            let localTokens: any[] = [];
            try {
                const prefix = `SOV_WL_${effectiveAddress.toLowerCase()}`;
                const localStr = (typeof window !== 'undefined') ? localStorage.getItem(`${prefix}_TOKENS`) : null;
                if (localStr) {
                     const parsed = JSON.parse(localStr);
                     if (Array.isArray(parsed)) localTokens = parsed;
                }
            } catch(e) {}
            setData({ tokens: localTokens, wallets: [] });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchWatchlist(); 
    }, [effectiveAddress]);

    const handleDelete = async (id: string, type: 'TOKEN' | 'WALLET') => {
        const tid = toast.loading('Removing from watchlist…');
        const tokenInfo = data.tokens.find(t => t.id === id);
        try {
            const sym = tokenInfo ? tokenInfo.symbol : id;
            const res = await fetch(`/api/watchlist?symbol=${sym}`, { method: 'DELETE' });
            if (res.ok) { 
                removeFromLocal(id, type, address);
                removeFromLocal(sym, type, address);
                toast.success('Removed', { id: tid }); 
                fetchWatchlist(); 
            } else {
                removeFromLocal(id, type, address);
                removeFromLocal(sym, type, address);
                if (type === 'TOKEN') setData(prev => ({ ...prev, tokens: prev.tokens.filter(t => t.id !== id && t.symbol !== sym) }));
                if (type === 'WALLET') setData(prev => ({ ...prev, wallets: prev.wallets.filter(w => w.id !== id) }));
                toast.success('Removed locally', { id: tid });
            }
        } catch { 
            removeFromLocal(id, type, address);
            if (type === 'TOKEN') setData(prev => ({ ...prev, tokens: prev.tokens.filter(t => t.id !== id) }));
            if (type === 'WALLET') setData(prev => ({ ...prev, wallets: prev.wallets.filter(w => w.id !== id) }));
            toast.success('Removed locally', { id: tid });
        }
    };

    // FIX: Memoize filtered arrays so they only recompute when data or
    // search term changes — NOT on every WebSocket market-stream tick.
    // Previously, re-renders from useMarketStream() caused filter() to run
    // thousands of times/minute, draining 40-50% CPU on low-end laptops.
    const tokensFiltered = useMemo(() =>
        search.length >= 2
            ? globalSearchTokens
            : (data.tokens || []).filter(t =>
                t != null &&
                ((t.symbol ?? '').toLowerCase().includes(search.toLowerCase()) ||
                (t.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
                (t.address ?? '').toLowerCase().includes(search.toLowerCase()))
              ),
        [data.tokens, search, globalSearchTokens]
    );

    const walletsFiltered = useMemo(() =>
        (data.wallets || []).filter(w =>
            w != null &&
            ((w.label ?? '').toLowerCase().includes(search.toLowerCase()) ||
            (w.address ?? '').toLowerCase().includes(search.toLowerCase()))
        ),
        [data.wallets, search]
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
        <div className="w-full h-full flex flex-col p-4 overflow-hidden">
        <div className="flex flex-col w-full flex-1 min-h-0 bg-[#FFFFFF] rounded-2xl border border-[#E5E5E5] shadow-sm overflow-hidden">

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

            {view === 'TOKENS' && (
                <div className="flex-1 overflow-auto flex flex-col min-h-0">
                    <div className="min-w-[1200px] flex flex-col h-full">
                        <div className="sticky top-0 z-10 grid bg-[#FAF9F6] border-b border-[#E5E5E5] text-[9px] font-black text-[#888888] uppercase tracking-[0.18em]"
                            style={{ gridTemplateColumns: '2.5fr 1.5fr 1fr 1fr 1.2fr 1fr 1fr 1fr 0.8fr' }}>
                            {['Token', 'Current Price', '24h Chg', 'Entry Price', 'ROI', 'MCap', 'Vol 24h', 'Top-10 Hold.', ''].map((h, i) => (
                                <div key={i} className={`px-3 py-2.5 ${i >= 2 ? 'text-right' : ''}`}>{h}</div>
                            ))}
                        </div>
                        <div className="w-full flex-1 min-h-0 h-full">
                            {loading || isSearchingGlobal ? (
                                <div className="p-12 text-center text-[#888888] text-xs font-mono flex flex-col items-center"><Loader2 className="animate-spin mb-3" size={20}/> {isSearchingGlobal ? 'Searching Global DEX Database…' : 'Fetching…'}</div>
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
                                                    ...(t.marketData || {}),
                                                    currentPrice: tick.lastPrice ? parseFloat(tick.lastPrice) : null,
                                                    change24h: tick.priceChangePercent ? parseFloat(tick.priceChangePercent) : null,
                                                    vol24h: tick.quoteVolume ? parseFloat(tick.quoteVolume) : null,
                                                    // MCap not available from Binance ticker — show '—' not a fake number
                                                    mcap: t.marketData?.mcap ?? null
                                                } : (t.marketData || {});

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

                                                            {/* Delete / Save */}
                                                            <div className="px-3 flex justify-end">
                                                                {search.length >= 2 ? (
                                                                    <button onClick={() => {
                                                                        const newItem = { ...t, type: 'TOKEN', marketData: md };
                                                                        saveToLocal(newItem, address);
                                                                        setData(prev => ({ ...prev, tokens: [...prev.tokens, newItem] }));
                                                                        setSearch('');
                                                                        toast.success(`${t.symbol} saved to watchlist`);
                                                                    }} className="p-1.5 text-[#00C076] hover:bg-[#00C076]/10 rounded-lg transition-colors font-bold text-[9px] uppercase tracking-widest border border-transparent hover:border-[#00C076]/30">
                                                                        ADD
                                                                    </button>
                                                                ) : (
                                                                    <button onClick={() => handleDelete(t.id, 'TOKEN')}
                                                                        className="p-1.5 text-[#888888] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-lg transition-colors">
                                                                        <Trash2 size={14}/>
                                                                    </button>
                                                                )}
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
                <div className="flex-1 overflow-auto flex flex-col min-h-0">
                    <div className="min-w-[1200px] flex flex-col h-full">
                        <div className="sticky top-0 z-10 grid bg-[#FAF9F6] border-b border-[#E5E5E5] text-[9px] font-black text-[#888888] uppercase tracking-[0.18em]"
                            style={{ gridTemplateColumns: '2.2fr 2fr 1fr 1fr 1fr 1fr 1fr 1fr 0.8fr' }}>
                            {['Entity', 'Address', 'Net Worth', 'PnL 30d', 'Win Rate', 'DEX Ratio', 'Alpha Score', 'Last Active', ''].map((h, i) => (
                                <div key={i} className={`px-3 py-2.5 ${i >= 2 ? 'text-right' : ''}`}>{h}</div>
                            ))}
                        </div>
                        <div className="w-full flex-1 min-h-0 h-full">
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
                                                                <button onClick={() => handleDelete(w.id, 'WALLET')}
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
            <div className="px-6 py-4 border-t border-[#E5E5E5] bg-[#FAF9F6] rounded-b-2xl flex items-center justify-between text-[9px] font-black text-[#888888] uppercase tracking-widest">
                <span>{view === 'TOKENS' ? tokensFiltered.length : walletsFiltered.length} items · Enriched with market data</span>
                <span>Data refreshes on page load</span>
            </div>
        </div>
        </div>
        </>
    );
}
// ── Helpers ─────────────────────────────────────────────────────────

function saveToLocal(item: any, address?: string) {
    if (typeof window === 'undefined') return;
    const effectiveAddress = address || 'DEFAULT_WALLET';
    const prefix = `SOV_WL_${effectiveAddress.toLowerCase()}`;
    const key = item.type === 'TOKEN' ? `${prefix}_TOKENS` : `${prefix}_WALLETS`;
    let existing: any[] = [];
    try { existing = JSON.parse(localStorage.getItem(key) || '[]'); } catch(e) {}
    if (!existing.some((e: any) => e.address === item.address || e.symbol === item.symbol)) {
        localStorage.setItem(key, JSON.stringify([...existing, { ...item, id: crypto.randomUUID?.() ?? Date.now().toString(36), marketData: {}, chain: item.chain || 'ethereum', entryPrice: null }]));
    }
}

function removeFromLocal(idOrSymbol: string, type: 'TOKEN' | 'WALLET', address?: string) {
    if (typeof window === 'undefined') return;
    const effectiveAddress = address || 'DEFAULT_WALLET';
    const prefix = `SOV_WL_${effectiveAddress.toLowerCase()}`;
    const key = type === 'TOKEN' ? `${prefix}_TOKENS` : `${prefix}_WALLETS`;
    let existing: any[] = [];
    try { existing = JSON.parse(localStorage.getItem(key) || '[]'); } catch(e) {}
    const filtered = existing.filter((e: any) => e.address !== idOrSymbol && e.id !== idOrSymbol && e.symbol !== idOrSymbol);
    localStorage.setItem(key, JSON.stringify(filtered));
}
