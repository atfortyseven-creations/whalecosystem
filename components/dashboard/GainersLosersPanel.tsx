"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { RefreshCw, Search, Clock, Wifi, WifiOff, Loader2, AlertTriangle } from 'lucide-react';
import { ModuleHeader } from './ModuleHeader';
import { useMarketData } from '@/lib/api-client';
import { TokenInfoModal, TokenInfoPayload } from '@/components/ui/TokenInfoModal';

// ── Formatters ────────────────────────────────────────────────────────────────
const fmt = (n: number) => {
    if (!n || isNaN(n)) return '—';
    if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (Math.abs(n) >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
    if (Math.abs(n) >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
    if (Math.abs(n) >= 1e3)  return `$${(n / 1e3).toFixed(1)}K`;
    return `$${n.toFixed(2)}`;
};
const fmtPrice = (n: number) => {
    if (!n || isNaN(n)) return '—';
    if (n >= 1000) return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (n >= 1)    return `$${n.toFixed(4)}`;
    if (n >= 0.01) return `$${n.toFixed(6)}`;
    return `$${n.toFixed(8)}`;
};
const pctColor = (v: number) => (v >= 0 ? '#00C076' : '#FF3B30');
const pctFmt   = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;


const NETWORK_COLORS: Record<string, string> = {
    bitcoin: '#F7931A', ethereum: '#627EEA', bsc: '#F0B90B',
    solana: '#9945FF', avalanche: '#E84142', arbitrum: '#12AAFF',
    polygon: '#8247E5', optimism: '#FF0420', near: '#00C08B',
    cardano: '#0033AD', polkadot: '#E6007A', aptos: '#00C3A0',
    injective: '#00F2FE', starknet: '#FF875B', celestia: '#7B2FBE',
    sui: '#4DA2FF', sei: '#9B5DE5', ton: '#0088CC',
    xrp: '#00AAE4', default: '#888888',
};

const ALL_NETWORKS = ['all', 'ethereum', 'solana', 'bsc', 'avalanche', 'arbitrum', 'polygon'] as const;
type FilterNetwork = typeof ALL_NETWORKS[number];
type TimeWindow = '1h' | '24h' | '7d';
type ViewMode = 'all' | 'gainers' | 'losers';

// ── Helper: strip USDT suffix to get ticker symbol ───────────────────────────
function stripUSDT(binanceSymbol: string): string {
    return binanceSymbol.replace('USDT', '').replace('BUSD', '');
}

// ── Row Component ─────────────────────────────────────────────────────────────
function AssetRow({ rank, symbol, data, pctKey, currency, eurRate, dominance, onClick }: {
    rank: number;
    symbol: string;
    data: any;
    pctKey: string;
    currency: 'USD' | 'EUR';
    eurRate: number;
    dominance: number;
    onClick: () => void;
}) {
    const meta  = data.meta || { name: symbol, network: 'ethereum', mcapRankHint: 999 };
    const price = parseFloat(data.lastPrice) || 0;
    const pct   = parseFloat(data[pctKey] || data.priceChangePercent) || 0;
    const vol   = parseFloat(data.quoteVolume) || 0;
    const ticker = stripUSDT(symbol);
    const netColor = NETWORK_COLORS[meta.network] || NETWORK_COLORS.default;
    const rate  = currency === 'EUR' ? eurRate : 1;
    const sym   = currency === 'EUR' ? '€' : '$';

    const fmtCurrency = (n: number) => {
        const v = n * rate;
        if (!v || isNaN(v)) return `${sym}—`;
        if (v >= 1e12) return `${sym}${(v / 1e12).toFixed(2)}T`;
        if (v >= 1e9)  return `${sym}${(v / 1e9).toFixed(2)}B`;
        if (v >= 1e6)  return `${sym}${(v / 1e6).toFixed(2)}M`;
        if (v >= 1e3)  return `${sym}${(v / 1e3).toFixed(1)}K`;
        return `${sym}${v.toFixed(2)}`;
    };
    const fmtCurrencyPrice = (n: number) => {
        const v = n * rate;
        if (!v || isNaN(v)) return `${sym}—`;
        if (v >= 1000) return `${sym}${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        if (v >= 1)    return `${sym}${v.toFixed(4)}`;
        if (v >= 0.01) return `${sym}${v.toFixed(6)}`;
        return `${sym}${v.toFixed(8)}`;
    };

    return (
        <div
            className="grid border-b border-black/[0.03] hover:bg-black/[0.02] hover:shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:scale-[1.002] hover:z-10 relative transition-all items-center cursor-pointer bg-transparent"
            style={{ gridTemplateColumns: '40px 2.8fr 1.6fr 1.1fr 1.5fr 1.2fr 1fr' }}
            onClick={onClick}
        >
            {/* Rank */}
            <div className="px-3 text-[10px] font-black text-[#888888] text-center">{rank}</div>

            {/* Asset */}
            <div className="px-3 flex items-center gap-3 py-3.5">
                <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0 shadow-sm"
                    style={{ background: netColor }}
                >
                    {ticker[0]}
                </div>
                <div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-black text-[#050505] tracking-tight">{ticker}</span>
                        <span
                            className="text-[8px] px-1.5 py-0.5 rounded font-black uppercase border"
                            style={{ color: netColor, borderColor: netColor + '44', background: netColor + '11' }}
                        >
                            {meta.network}
                        </span>
                        {(data as any).getblockVerified && (
                            <span className="text-[7px] px-1.5 py-0.5 rounded font-black uppercase bg-[#00C076]/10 text-[#00C076] border border-[#00C076]/30 shadow-[0_0_8px_rgba(0,192,118,0.2)]">
                                ✓ VERIFIED
                            </span>
                        )}
                    </div>
                    <div className="text-[10px] text-[#888888] font-medium mt-0.5 tracking-wide">{meta.name}</div>
                </div>
            </div>

            {/* Price */}
            <div className="px-3 flex flex-col justify-center">
                <span className="text-[12px] font-black font-mono text-[#050505]">{fmtCurrencyPrice(price)}</span>
                {(data as any).onChainPrice && (
                    <span className="text-[9px] font-mono text-[#888888] mt-0.5">
                        Oracle: {fmtCurrencyPrice(parseFloat((data as any).onChainPrice))}
                    </span>
                )}
            </div>

            {/* 24h % */}
            <div className="px-3 text-right flex flex-col items-end gap-0.5">
                <span className="text-[12px] font-black font-mono flex items-center gap-1" style={{ color: pctColor(pct) }}>
                    {pctFmt(pct)}
                </span>
            </div>

            {/* Volume */}
            <div className="px-3 text-right text-[11px] font-bold font-mono text-[#050505]">{fmtCurrency(vol)}</div>

            {/* Dominance (Calculated Mathematically) */}
            <div className="px-3 text-right text-[11px] font-bold font-mono text-[#888888]">
                {dominance.toFixed(2)}%
            </div>

            {/* Volatility */}
            <div className="px-3 flex justify-center">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${Math.abs(pct) > 10 ? 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20' : Math.abs(pct) > 5 ? 'bg-[#F7931A]/10 text-[#F7931A] border-[#F7931A]/20' : 'bg-black/5 text-[#888888] border-black/5'}`}>
                    {Math.abs(pct) > 10 ? 'HIGH' : Math.abs(pct) > 5 ? 'MED' : 'LOW'}
                </span>
            </div>
        </div>
    );
}

// ── Main Panel ────────────────────────────────────────────────────────────────
export function GainersLosersPanel() {
    const { data: rawData, isLoading, error } = useMarketData('gainersLosers');
    const markets = Array.isArray(rawData) ? rawData : rawData?.data || [];

    const isConnected = !isLoading && !error;
    const lastUpdate = new Date();

    const [search, setSearch]       = useState('');
    const [view, setView]           = useState<ViewMode>('all');
    const [timeWindow, setTimeWindow] = useState<TimeWindow>('24h');
    const [network, setNetwork]     = useState<FilterNetwork>('all');
    const [currency, setCurrency]   = useState<'USD' | 'EUR'>('USD');
    const [eurRate, setEurRate]     = useState(0.92);
    const [selectedToken, setSelectedToken] = useState<TokenInfoPayload | null>(null);

    // Fetch live EUR/USD rate once on mount
    useEffect(() => {
        fetch('https://api.exchangerate-api.com/v4/latest/USD')
            .then(r => r.json())
            .then(d => { if (d?.rates?.EUR) setEurRate(d.rates.EUR); })
            .catch(() => {}); // silently use default 0.92
    }, []);

    const handleRowClick = useCallback((symbol: string, data: any) => {
        const meta = data.meta || { name: symbol, network: 'ethereum', mcapRankHint: 999 };
        const netColor = NETWORK_COLORS[meta.network] || NETWORK_COLORS.default;
        setSelectedToken({
            symbol: stripUSDT(symbol),
            name: meta.name,
            network: meta.network,
            netColor,
            price: parseFloat(data.lastPrice) || 0,
            pct: parseFloat(data.priceChangePercent) || 0,
            volume: parseFloat(data.quoteVolume) || 0,
            onChainPrice: data.onChainPrice ? parseFloat(data.onChainPrice) : undefined,
            getblockVerified: !!data.getblockVerified,
        });
    }, []);

    // Map market stream data to display rows
    const allRows = useMemo(() => {
        const rows: Array<{ symbol: string; data: any; pct: number; vol: number; meta: any }> = [];
        markets.forEach((marketData: any) => {
            const { symbol } = marketData;
            if (!symbol?.endsWith('USDT')) return;
            const meta = marketData.meta || { name: symbol, network: 'ethereum', mcapRankHint: 999 };
            const pct = parseFloat(marketData.priceChangePercent) || 0;
            const vol = parseFloat(marketData.quoteVolume) || 0;
            rows.push({ symbol, data: marketData, pct, vol, meta });
        });
        return rows.sort((a, b) => a.meta.mcapRankHint - b.meta.mcapRankHint);
    }, [markets]);

    const pctKey = 'priceChangePercent';
    const totalVolume = useMemo(() => allRows.reduce((sum, r) => sum + r.vol, 0), [allRows]);

    const filtered = useMemo(() => {
        return allRows
            .filter(r => network === 'all' || r.meta.network === network)
            .filter(r => {
                const ticker = (r.symbol ? stripUSDT(r.symbol) : '').toLowerCase();
                const name = (r.meta?.name || '').toLowerCase();
                const q = search.toLowerCase();
                return ticker.includes(q) || name.includes(q);
            })
            .filter(r => {
                if (view === 'gainers') return r.pct >= 0;
                if (view === 'losers')  return r.pct < 0;
                return true;
            })
            .sort((a, b) => {
                if (view === 'gainers') return b.pct - a.pct;
                if (view === 'losers')  return a.pct - b.pct;
                return a.meta.mcapRankHint - b.meta.mcapRankHint;
            });
    }, [allRows, view, network, search]);

    const topGainers = useMemo(() =>
        [...allRows].sort((a, b) => b.pct - a.pct).slice(0, 3), [allRows]);
    const topLosers  = useMemo(() =>
        [...allRows].sort((a, b) => a.pct - b.pct).slice(0, 3), [allRows]);

    return (
        <div className="w-full h-full min-h-0 flex flex-col p-4 md:p-6 space-y-6 overflow-hidden text-[#050505] font-sans">
            <ModuleHeader moduleId="markets" />
            
            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                {/* Top Gainers */}
                <div className="bg-white/70 backdrop-blur-3xl border border-black/[0.05] rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] transition-shadow">
                    <div className="flex items-center justify-between mb-5 pb-3 border-b border-black/[0.04]">
                        <span className="text-[11px] font-black text-[#050505] uppercase tracking-[0.15em] flex items-center gap-2">
                            24H GAINERS
                        </span>
                    </div>
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-6 text-[#888888]">
                                <Loader2 className="animate-spin mb-3" size={20} />
                                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#050505]/40 animate-pulse">SYNCHRONIZING TELEMETRY</span>
                            </div>
                        ) : topGainers.map((r, i) => (
                            <div key={r.symbol} className="flex items-center justify-between group cursor-default">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-[#050505]/20 w-4 group-hover:text-[#050505]/40 transition-colors">{i + 1}</span>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-sm"
                                        style={{ background: NETWORK_COLORS[r.meta.network] || NETWORK_COLORS.default }}>
                                        {stripUSDT(r.symbol)[0]}
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <div className="text-[12px] font-black text-[#050505] leading-none mb-1">{stripUSDT(r.symbol)}</div>
                                        <div className="text-[10px] font-mono text-[#888888] leading-none">{fmtPrice(parseFloat(r.data.lastPrice))}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 bg-[#00C076]/10 px-2 py-1 rounded-md border border-[#00C076]/20" style={{ color: '#00C076' }}>
                                    <span className="text-[12px] font-black font-mono">{pctFmt(r.pct)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Losers */}
                <div className="bg-white/70 backdrop-blur-3xl border border-black/[0.05] rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] transition-shadow">
                    <div className="flex items-center justify-between mb-5 pb-3 border-b border-black/[0.04]">
                        <span className="text-[11px] font-black text-[#050505] uppercase tracking-[0.15em] flex items-center gap-2">
                            24H LOSERS
                        </span>
                    </div>
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-6 text-[#888888]">
                                <Loader2 className="animate-spin mb-3" size={20} />
                                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#050505]/40 animate-pulse">SYNCHRONIZING TELEMETRY</span>
                            </div>
                        ) : topLosers.map((r, i) => (
                            <div key={r.symbol} className="flex items-center justify-between group cursor-default">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-[#050505]/20 w-4 group-hover:text-[#050505]/40 transition-colors">{i + 1}</span>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-sm"
                                        style={{ background: NETWORK_COLORS[r.meta.network] || NETWORK_COLORS.default }}>
                                        {stripUSDT(r.symbol)[0]}
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <div className="text-[12px] font-black text-[#050505] leading-none mb-1">{stripUSDT(r.symbol)}</div>
                                        <div className="text-[10px] font-mono text-[#888888] leading-none">{fmtPrice(parseFloat(r.data.lastPrice))}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 bg-[#FF3B30]/10 px-2 py-1 rounded-md border border-[#FF3B30]/20" style={{ color: '#FF3B30' }}>
                                    <span className="text-[12px] font-black font-mono">{pctFmt(r.pct)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Full Ledger Table ── */}
            <div className="flex-1 min-h-0 bg-white/70 backdrop-blur-3xl border border-black/[0.05] shadow-[0_8px_40px_rgba(0,0,0,0.03)] rounded-2xl overflow-hidden flex flex-col relative">
                
                {/* Background Gradient for Ledger */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/40 to-transparent -z-10" />

                {/* Toolbar Row 1 */}
                <div className="shrink-0 px-6 py-4 border-b border-black/[0.04] bg-white/50 backdrop-blur-md flex items-center gap-4 flex-wrap z-10">
                    {/* View toggle */}
                    <div className="flex bg-black/[0.03] p-1 rounded-xl border border-black/[0.05]">
                        {(['all', 'gainers', 'losers'] as ViewMode[]).map(v => (
                            <button key={v} onClick={() => setView(v)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-white text-[#050505] shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-black/[0.05] scale-[1.02]' : 'text-[#888888] hover:text-[#050505]'}`}>
                                {v === 'gainers' ? 'Gainers' : v === 'losers' ? 'Losers' : 'All Ledger'}
                            </button>
                        ))}
                    </div>

                    {/* Time window */}
                    <div className="flex gap-1.5">
                        {(['1h', '24h', '7d'] as TimeWindow[]).map(w => (
                            <button key={w} onClick={() => setTimeWindow(w)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${timeWindow === w ? 'bg-[#050505] text-white border-[#050505]' : 'text-[#888888] border-black/10 hover:border-black/30 bg-white/50'}`}>
                                {w}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 min-w-[160px] max-w-sm">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A0A0A0]"/>
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="SEARCH TICKER OR NAME..."
                            className="w-full bg-white border border-black/10 shadow-sm rounded-xl pl-10 pr-4 py-2.5 text-[10px] font-mono font-bold uppercase tracking-[0.1em] text-[#050505] outline-none focus:border-[#050505] transition-all"/>
                    </div>

                    {/* Currency Toggle */}
                    <div className="flex items-center gap-2 ml-auto">
                        <div className="flex border border-black/10 rounded-lg overflow-hidden bg-white">
                            {(['USD', 'EUR'] as const).map(c => (
                                <button
                                    key={c}
                                    onClick={() => setCurrency(c)}
                                    className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all"
                                    style={currency === c
                                        ? { background: '#050505', color: '#fff' }
                                        : { background: 'transparent', color: '#888888' }
                                    }
                                >
                                    {c === 'USD' ? '$' : '€'} {c}
                                </button>
                            ))}
                        </div>
                        {/* Stream status */}
                        <div className="flex items-center gap-2 border-l border-black/10 pl-3">
                            <span className="text-[10px] font-mono font-black text-[#A0A0A0] uppercase tracking-widest">
                                Data Stream
                            </span>
                        </div>
                    </div>
                </div>

                {/* Toolbar Row 2 — Network selector */}
                <div className="shrink-0 px-6 py-2.5 border-b border-black/[0.04] bg-white/30 backdrop-blur-sm flex items-center gap-2.5 flex-wrap z-10">
                    <span className="text-[9px] font-black text-[#050505]/40 uppercase tracking-[0.2em] mr-2">Topology:</span>
                    {ALL_NETWORKS.map(n => (
                        <button key={n} onClick={() => setNetwork(n)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all shadow-sm`}
                            style={network === n
                                ? { background: n === 'all' ? '#050505' : NETWORK_COLORS[n] || '#050505', color: '#fff', borderColor: 'transparent' }
                                : { color: '#888888', borderColor: 'rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.8)' }}>
                            {n === 'all' ? 'All Networks' : n.charAt(0).toUpperCase() + n.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Column Headers */}
                <div className="shrink-0 grid bg-black/[0.02] border-b border-black/[0.04] text-[9px] font-black text-[#888888] uppercase tracking-[0.2em] shadow-inner z-10"
                    style={{ gridTemplateColumns: '40px 2.8fr 1.6fr 1.1fr 1.5fr 1.2fr 1fr' }}>
                    {['#', 'Asset Name', 'Oracle Price', '24H %', 'Volume 24H', 'Dominance', 'Volatility'].map((h, i) => (
                        <div key={h} className={`px-3 py-3 ${i >= 3 && i <= 5 ? 'text-right' : i === 0 || i === 6 ? 'text-center' : ''}`}>{h}</div>
                    ))}
                </div>

                {/* Rows */}
                <div className="flex-1 w-full overflow-y-auto no-scrollbar relative z-0" style={{ scrollbarWidth: 'none' }}>
                    {isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-[#888888] h-full p-12">
                            <Loader2 className="animate-spin mb-4" size={36} />
                            <p className="text-[12px] font-black text-[#050505] uppercase tracking-[0.2em]">INITIALIZING LEDGER MATRIX</p>
                            <p className="text-[10px] mt-2 tracking-widest opacity-60">Zero-Mock Protocol Enforced</p>
                        </div>
                    ) : error ? (
                        <div className="h-full flex flex-col items-center justify-center p-12">
                            <AlertTriangle size={32} className="text-black/20 mb-4" />
                            <p className="text-[12px] font-black text-[#050505]/40 uppercase tracking-[0.3em]">
                                Telemetry Disconnected
                            </p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-12 text-[#888888]">
                            <Search size={32} className="mb-4 opacity-30"/>
                            <p className="text-[12px] font-black text-[#111] uppercase tracking-[0.2em] mb-2">No intelligence found</p>
                            <p className="text-[10px] uppercase tracking-widest opacity-60">Refine parameters</p>
                        </div>
                    ) : (
                        <div className="flex flex-col pb-6">
                            {filtered.map((r, i) => (
                                <AssetRow
                                    key={r.symbol}
                                    rank={i + 1}
                                    symbol={r.symbol}
                                    data={r.data}
                                    pctKey="priceChangePercent"
                                    currency={currency}
                                    eurRate={eurRate}
                                    dominance={totalVolume > 0 ? (r.vol / totalVolume) * 100 : 0}
                                    onClick={() => handleRowClick(r.symbol, r.data)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 px-6 py-3 border-t border-black/[0.04] bg-white/50 backdrop-blur-md flex items-center justify-between text-[10px] font-black text-[#050505]/40 uppercase tracking-[0.15em] z-10">
                    <span>{filtered.length} VERIFIED ASSETS · {network === 'all' ? 'OMNI-CHAIN' : network.toUpperCase()} · {timeWindow}</span>
                    <span className="font-mono tracking-[0.2em] flex items-center gap-2"> SECURE CONNECTION</span>
                </div>
            </div>

            {/* ── Token Info Modal ── */}
            <TokenInfoModal
                token={selectedToken}
                currency={currency}
                eurRate={eurRate}
                onClose={() => setSelectedToken(null)}
            />
        </div>
    );
}
