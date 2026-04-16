"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Search, ArrowUpRight, ArrowDownRight, Clock, Wifi, WifiOff } from 'lucide-react';
import { useMarketStream } from '@/context/MarketStreamContext';

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

// ── Asset metadata map (Binance symbol → display info) ───────────────────────
const ASSET_META: Record<string, { name: string; network: string; mcapRankHint: number }> = {
    BTCUSDT:  { name: 'Bitcoin',         network: 'bitcoin',   mcapRankHint: 1  },
    ETHUSDT:  { name: 'Ethereum',        network: 'ethereum',  mcapRankHint: 2  },
    BNBUSDT:  { name: 'BNB',             network: 'bsc',       mcapRankHint: 3  },
    SOLUSDT:  { name: 'Solana',          network: 'solana',    mcapRankHint: 4  },
    XRPUSDT:  { name: 'XRP',             network: 'xrp',       mcapRankHint: 5  },
    ADAUSDT:  { name: 'Cardano',         network: 'cardano',   mcapRankHint: 6  },
    DOGEUSDT: { name: 'Dogecoin',        network: 'ethereum',  mcapRankHint: 7  },
    SHIBUSDT: { name: 'Shiba Inu',       network: 'ethereum',  mcapRankHint: 8  },
    DOTUSDT:  { name: 'Polkadot',        network: 'polkadot',  mcapRankHint: 9  },
    AVAXUSDT: { name: 'Avalanche',       network: 'avalanche', mcapRankHint: 10 },
    LINKUSDT: { name: 'Chainlink',       network: 'ethereum',  mcapRankHint: 11 },
    MATICUSDT:{ name: 'Polygon',         network: 'polygon',   mcapRankHint: 12 },
    UNIUSDT:  { name: 'Uniswap',         network: 'ethereum',  mcapRankHint: 13 },
    ARBUSDT:  { name: 'Arbitrum',        network: 'arbitrum',  mcapRankHint: 14 },
    OPUSDT:   { name: 'Optimism',        network: 'optimism',  mcapRankHint: 15 },
    APTUSDT:  { name: 'Aptos',           network: 'aptos',     mcapRankHint: 16 },
    INJUSDT:  { name: 'Injective',       network: 'injective', mcapRankHint: 17 },
    PEPEUSDT: { name: 'Pepe',            network: 'ethereum',  mcapRankHint: 18 },
    WIFUSDT:  { name: 'dogwifhat',       network: 'solana',    mcapRankHint: 19 },
    BONKUSDT: { name: 'Bonk',            network: 'solana',    mcapRankHint: 20 },
    FLOKIUSDT:{ name: 'Floki Inu',       network: 'bsc',       mcapRankHint: 21 },
    FETUSDT:  { name: 'Fetch.ai',        network: 'ethereum',  mcapRankHint: 22 },
    NEARUSDT: { name: 'NEAR Protocol',   network: 'near',      mcapRankHint: 23 },
    LDOUSDT:  { name: 'Lido DAO',        network: 'ethereum',  mcapRankHint: 24 },
    WLDUSDT:  { name: 'Worldcoin',       network: 'ethereum',  mcapRankHint: 25 },
    STRKUSDT: { name: 'StarkNet',        network: 'starknet',  mcapRankHint: 26 },
    JUPUSDT:  { name: 'Jupiter',         network: 'solana',    mcapRankHint: 27 },
    PYTHUSDT: { name: 'Pyth Network',    network: 'solana',    mcapRankHint: 28 },
    TIAUSDT:  { name: 'Celestia',        network: 'celestia',  mcapRankHint: 29 },
    BLURUSDT: { name: 'Blur',            network: 'ethereum',  mcapRankHint: 30 },
    GMXUSDT:  { name: 'GMX',             network: 'arbitrum',  mcapRankHint: 31 },
    SUIUSDT:  { name: 'Sui',             network: 'sui',       mcapRankHint: 32 },
    SEIUSDT:  { name: 'Sei',             network: 'sei',       mcapRankHint: 33 },
    TONUSDT:  { name: 'Toncoin',         network: 'ton',       mcapRankHint: 34 },
};

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
function AssetRow({ rank, symbol, data, pctKey }: {
    rank: number;
    symbol: string;
    data: any;
    pctKey: string;
}) {
    const meta  = ASSET_META[symbol] || { name: symbol, network: 'ethereum', mcapRankHint: 999 };
    const price = parseFloat(data.lastPrice) || 0;
    const pct   = parseFloat(data[pctKey] || data.priceChangePercent) || 0;
    const vol   = parseFloat(data.quoteVolume) || 0;
    const ticker = stripUSDT(symbol);
    const netColor = NETWORK_COLORS[meta.network] || NETWORK_COLORS.default;

    return (
        <div
            className="grid border-b border-[#F0F0F0] hover:bg-[#FAF9F6] transition-colors items-center cursor-pointer"
            style={{ gridTemplateColumns: '36px 2.8fr 1.8fr 1.1fr 1.1fr 1.5fr 0.9fr' }}
        >
            {/* Rank */}
            <div className="px-2 text-[10px] font-black text-[#888888] text-center">{rank}</div>

            {/* Asset */}
            <div className="px-3 flex items-center gap-2.5 py-3">
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
                    style={{ background: netColor }}
                >
                    {ticker[0]}
                </div>
                <div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-black text-[#050505]">{ticker}</span>
                        <span
                            className="text-[8px] px-1.5 py-0.5 rounded font-black uppercase border"
                            style={{ color: netColor, borderColor: netColor + '44', background: netColor + '11' }}
                        >
                            {meta.network}
                        </span>
                        {(data as any).getblockVerified && (
                            <span className="text-[7px] px-1 py-0.5 rounded font-black uppercase bg-[#00C076]/10 text-[#00C076] border border-[#00C076]/30">
                                ✓ ON-CHAIN
                            </span>
                        )}
                    </div>
                    <div className="text-[9px] text-[#888888] font-medium mt-0.5">{meta.name}</div>
                </div>
            </div>

            {/* Price */}
            <div className="px-3">
                <div className="text-[11px] font-black font-mono text-[#050505]">{fmtPrice(price)}</div>
                {(data as any).onChainPrice && (
                    <div className="text-[8px] font-mono text-[#888888] mt-0.5">
                        On-chain: ${parseFloat((data as any).onChainPrice).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </div>
                )}
            </div>

            {/* 24h % */}
            <div className="px-3 text-right text-[11px] font-black font-mono" style={{ color: pctColor(pct) }}>
                {pctFmt(pct)}
            </div>

            {/* % with arrow */}
            <div className="px-3 flex justify-end items-center gap-1" style={{ color: pctColor(pct) }}>
                {pct >= 0 ? <ArrowUpRight size={13}/> : <ArrowDownRight size={13}/>}
                <span className="text-[10px] font-black">{Math.abs(pct).toFixed(2)}%</span>
            </div>

            {/* Volume */}
            <div className="px-3 text-right text-[11px] font-bold font-mono text-[#050505]">{fmt(vol)}</div>

            {/* Perps badge */}
            <div className="px-3 flex justify-center">
                <span className="text-[8px] px-2 py-0.5 rounded border border-[#E5E5E5] text-[#888888] font-black uppercase">PERP</span>
            </div>
        </div>
    );
}

// ── Main Panel ────────────────────────────────────────────────────────────────
export function GainersLosersPanel() {
    const { markets, isConnected, lastUpdate } = useMarketStream();

    const [search, setSearch]       = useState('');
    const [view, setView]           = useState<ViewMode>('all');
    const [timeWindow, setTimeWindow] = useState<TimeWindow>('24h');
    const [network, setNetwork]     = useState<FilterNetwork>('all');

    // Map market stream data to display rows
    const allRows = useMemo(() => {
        const rows: Array<{ symbol: string; data: any; pct: number; vol: number; meta: any }> = [];
        markets.forEach((data, symbol) => {
            if (!symbol.endsWith('USDT')) return;
            if (!ASSET_META[symbol]) return;
            const meta = ASSET_META[symbol];
            const pct = parseFloat(data.priceChangePercent) || 0;
            const vol = parseFloat(data.quoteVolume) || 0;
            rows.push({ symbol, data, pct, vol, meta });
        });
        return rows.sort((a, b) => a.meta.mcapRankHint - b.meta.mcapRankHint);
    }, [markets]);

    const pctKey = ''; // Binance 24hr endpoint only has priceChangePercent (24h)

    const filtered = useMemo(() => {
        return allRows
            .filter(r => network === 'all' || r.meta.network === network)
            .filter(r => {
                const ticker = stripUSDT(r.symbol).toLowerCase();
                const name = r.meta.name.toLowerCase();
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

    const hasData = allRows.length > 0;

    return (
        <div className="w-full h-full min-h-0 flex flex-col p-4 space-y-5 overflow-hidden text-[#050505] font-sans">
            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-2 gap-4 shrink-0">
                {/* Top Gainers */}
                <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[11px] font-black text-[#050505] uppercase tracking-widest">
                            Top Gainers — 24h
                        </span>
                        <TrendingUp size={14} className="text-[#00C076]"/>
                    </div>
                    <div className="space-y-3">
                        {!hasData ? (
                            <div className="text-[10px] text-[#888888] font-mono text-center py-3">
                                Connecting to GetBlock stream…
                            </div>
                        ) : topGainers.map((r, i) => (
                            <div key={r.symbol} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-[#888888] w-4">{i + 1}</span>
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black text-white shrink-0"
                                        style={{ background: NETWORK_COLORS[r.meta.network] || NETWORK_COLORS.default }}>
                                        {stripUSDT(r.symbol)[0]}
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-black text-[#050505]">{stripUSDT(r.symbol)}</div>
                                        <div className="text-[9px] text-[#888888]">{fmtPrice(parseFloat(r.data.lastPrice))}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1" style={{ color: '#00C076' }}>
                                    <ArrowUpRight size={12}/>
                                    <span className="text-[11px] font-black">{pctFmt(r.pct)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Losers */}
                <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[11px] font-black text-[#050505] uppercase tracking-widest">
                            Top Losers — 24h
                        </span>
                        <TrendingDown size={14} className="text-[#FF3B30]"/>
                    </div>
                    <div className="space-y-3">
                        {!hasData ? (
                            <div className="text-[10px] text-[#888888] font-mono text-center py-3">
                                Connecting to GetBlock stream…
                            </div>
                        ) : topLosers.map((r, i) => (
                            <div key={r.symbol} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-[#888888] w-4">{i + 1}</span>
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black text-white shrink-0"
                                        style={{ background: NETWORK_COLORS[r.meta.network] || NETWORK_COLORS.default }}>
                                        {stripUSDT(r.symbol)[0]}
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-black text-[#050505]">{stripUSDT(r.symbol)}</div>
                                        <div className="text-[9px] text-[#888888]">{fmtPrice(parseFloat(r.data.lastPrice))}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1" style={{ color: '#FF3B30' }}>
                                    <ArrowDownRight size={12}/>
                                    <span className="text-[11px] font-black">{pctFmt(r.pct)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Full Table ── */}
            <div className="flex-1 min-h-0 bg-white border border-[#E5E5E5] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col">

                {/* Toolbar Row 1 */}
                <div className="shrink-0 px-5 py-3 border-b border-[#E5E5E5] bg-[#FAF9F6] flex items-center gap-3 flex-wrap">
                    {/* View toggle */}
                    <div className="flex bg-[#F0F0F0] p-1 rounded-xl border border-[#E5E5E5]">
                        {(['all', 'gainers', 'losers'] as ViewMode[]).map(v => (
                            <button key={v} onClick={() => setView(v)}
                                className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-white text-[#050505] shadow-sm border border-[#E5E5E5]' : 'text-[#888888] hover:text-[#050505]'}`}>
                                {v === 'gainers' ? 'Gainers' : v === 'losers' ? 'Losers' : 'All'}
                            </button>
                        ))}
                    </div>

                    {/* Time window (cosmetic — Binance gives 24h, future WS gives real-time) */}
                    <div className="flex gap-1">
                        {(['1h', '24h', '7d'] as TimeWindow[]).map(w => (
                            <button key={w} onClick={() => setTimeWindow(w)}
                                className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border transition-all ${timeWindow === w ? 'bg-[#050505] text-white border-[#050505]' : 'text-[#888888] border-[#E5E5E5] hover:border-[#050505]'}`}>
                                {w}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 min-w-[140px] max-w-xs">
                        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]"/>
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search symbol or name…"
                            className="w-full bg-white border border-[#E5E5E5] rounded-lg pl-8 pr-3 py-1.5 text-[10px] font-mono text-[#050505] outline-none focus:border-[#050505]"/>
                    </div>

                    {/* Stream status */}
                    <div className="flex items-center gap-2 ml-auto">
                        {isConnected ? <Wifi size={13} className="text-[#00C076]"/> : <WifiOff size={13} className="text-[#FF3B30] animate-pulse"/>}
                        <span className="text-[9px] font-black text-[#888888] uppercase font-mono flex items-center gap-1">
                            <Clock size={9}/>
                            {lastUpdate instanceof Date && !isNaN(lastUpdate.getTime())
                                ? lastUpdate.toTimeString().slice(0, 8)
                                : '—'}
                        </span>
                    </div>
                </div>

                {/* Toolbar Row 2 — Network selector */}
                <div className="shrink-0 px-5 py-2 border-b border-[#E5E5E5] bg-white flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-black text-[#888888] uppercase tracking-widest mr-1">Network:</span>
                    {ALL_NETWORKS.map(n => (
                        <button key={n} onClick={() => setNetwork(n)}
                            className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border transition-all`}
                            style={network === n
                                ? { background: n === 'all' ? '#050505' : NETWORK_COLORS[n] || '#050505', color: '#fff', borderColor: 'transparent' }
                                : { color: '#888888', borderColor: '#E5E5E5', background: 'transparent' }}>
                            {n === 'all' ? 'All Networks' : n.charAt(0).toUpperCase() + n.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Column Headers */}
                <div className="shrink-0 grid bg-[#FAF9F6] border-b border-[#E5E5E5] text-[9px] font-black text-[#888888] uppercase tracking-[0.18em]"
                    style={{ gridTemplateColumns: '36px 2.8fr 1.8fr 1.1fr 1.1fr 1.5fr 0.9fr' }}>
                    {['#', 'Asset', 'Price (USD)', '24H %', 'Trend', 'Volume 24H', 'Type'].map((h, i) => (
                        <div key={h} className={`px-3 py-2.5 ${i >= 3 && i <= 4 ? 'text-right' : i === 0 ? 'text-center' : ''}`}>{h}</div>
                    ))}
                </div>

                {/* Rows */}
                <div className="flex-1 w-full overflow-y-auto msv-hide-scrollbar">
                    {!hasData ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-[#888888]">
                            <div className="w-8 h-8 rounded-full border-2 border-[#050505] border-t-transparent animate-spin mb-3"/>
                            <p className="text-[11px] font-black uppercase tracking-widest">
                                Streaming from GetBlock EP1–EP4…
                            </p>
                            <p className="text-[9px] font-mono text-[#888888] mt-2">
                                go.getblock.io · Binance 24h Ticker
                            </p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 text-[#888888]">
                            <Search size={28} className="mb-3 opacity-40"/>
                            <p className="text-[11px] font-black text-[#111] uppercase tracking-widest mb-1">No assets found</p>
                            <p className="text-[10px] uppercase tracking-widest opacity-60">Adjust filters or search term</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {filtered.map((r, i) => (
                                <AssetRow
                                    key={r.symbol}
                                    rank={i + 1}
                                    symbol={r.symbol}
                                    data={r.data}
                                    pctKey="priceChangePercent"
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 px-5 py-2 border-t border-[#E5E5E5] bg-[#FAF9F6] flex items-center justify-between text-[9px] font-black text-[#888888] uppercase tracking-widest">
                    <span>{filtered.length} assets · {network === 'all' ? 'All Networks' : network} · {timeWindow} window</span>
                    <span>
                        {isConnected ? '● LIVE' : '○ RECONNECTING'} · GetBlock EP1–EP4 + Binance 24H
                    </span>
                </div>
            </div>
        </div>
    );
}
