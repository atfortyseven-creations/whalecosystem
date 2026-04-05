"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, TrendingDown, RefreshCw, Search,
    ArrowUpRight, ArrowDownRight, Flame, Skull,
    BarChart2, Clock
} from 'lucide-react';
import { List as RWList } from 'react-window';
const List = RWList as any;
import AutoSizer from 'react-virtualized-auto-sizer';

const ASSETS = [
    { symbol: 'BTC',    name: 'Bitcoin',         chain: 'multi',     mcapB: 1640  },
    { symbol: 'ETH',    name: 'Ethereum',         chain: 'ethereum',  mcapB: 468   },
    { symbol: 'BNB',    name: 'BNB',              chain: 'bsc',       mcapB: 88    },
    { symbol: 'SOL',    name: 'Solana',           chain: 'solana',    mcapB: 80    },
    { symbol: 'XRP',    name: 'XRP',              chain: 'xrp',       mcapB: 130   },
    { symbol: 'DOGE',   name: 'Dogecoin',         chain: 'doge',      mcapB: 33    },
    { symbol: 'ADA',    name: 'Cardano',          chain: 'cardano',   mcapB: 22    },
    { symbol: 'AVAX',   name: 'Avalanche',        chain: 'avalanche', mcapB: 18    },
    { symbol: 'LINK',   name: 'Chainlink',        chain: 'ethereum',  mcapB: 12    },
    { symbol: 'DOT',    name: 'Polkadot',         chain: 'polkadot',  mcapB: 11    },
    { symbol: 'UNI',    name: 'Uniswap',          chain: 'ethereum',  mcapB: 9     },
    { symbol: 'MATIC',  name: 'Polygon',          chain: 'polygon',   mcapB: 8     },
    { symbol: 'ARB',    name: 'Arbitrum',         chain: 'arbitrum',  mcapB: 5     },
    { symbol: 'OP',     name: 'Optimism',         chain: 'optimism',  mcapB: 4     },
    { symbol: 'APT',    name: 'Aptos',            chain: 'aptos',     mcapB: 4     },
    { symbol: 'INJ',    name: 'Injective',        chain: 'injective', mcapB: 3.5   },
    { symbol: 'PEPE',   name: 'Pepe',             chain: 'ethereum',  mcapB: 6     },
    { symbol: 'WIF',    name: 'dogwifhat',        chain: 'solana',    mcapB: 2.1   },
    { symbol: 'BONK',   name: 'Bonk',             chain: 'solana',    mcapB: 1.8   },
    { symbol: 'FLOKI',  name: 'Floki Inu',        chain: 'bsc',       mcapB: 1.2   },
    { symbol: 'FET',    name: 'Fetch.ai',         chain: 'ethereum',  mcapB: 2.8   },
    { symbol: 'NEAR',   name: 'NEAR Protocol',    chain: 'near',      mcapB: 7     },
    { symbol: 'LDO',    name: 'Lido DAO',         chain: 'ethereum',  mcapB: 2.5   },
    { symbol: 'WLD',    name: 'Worldcoin',        chain: 'optimism',  mcapB: 1.9   },
    { symbol: 'STRK',   name: 'StarkNet',         chain: 'starknet',  mcapB: 0.9   },
    { symbol: 'JUP',    name: 'Jupiter',          chain: 'solana',    mcapB: 1.5   },
    { symbol: 'PYTH',   name: 'Pyth Network',     chain: 'solana',    mcapB: 1.3   },
    { symbol: 'TIA',    name: 'Celestia',         chain: 'celestia',  mcapB: 2.2   },
    { symbol: 'BLUR',   name: 'Blur',             chain: 'ethereum',  mcapB: 0.8   },
    { symbol: 'GMX',    name: 'GMX',              chain: 'arbitrum',  mcapB: 0.7   },
];

const CHAIN_COLORS: Record<string, string> = {
    ethereum: '#627EEA', solana: '#9945FF', bsc: '#F0B90B',
    polygon: '#8247E5', arbitrum: '#12AAFF', optimism: '#FF0420',
    multi: '#050505', xrp: '#00AAE4', cardano: '#0033AD',
    avalanche: '#E84142', polkadot: '#E6007A', aptos: '#00C3A0',
    injective: '#00F2FE', near: '#00C08B', starknet: '#FF875B',
    celestia: '#7B2FBE', blur: '#FF6640', default: '#888888'
};

// Real data is strictly fetched from /api/markets in the component body.

type SortKey = 'ch1h' | 'ch24h' | 'ch7d' | 'vol24h' | 'mcap';
type Window = '1h' | '24h' | '7d';

const fmt = (n: number) => {
    if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (Math.abs(n) >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
    if (Math.abs(n) >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n.toFixed(2)}`;
};
const pctColor = (v: number) => v >= 0 ? 'text-[#00C076]' : 'text-[#FF3B30]';
const pctFmt   = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;

export function GainersLosersPanel() {
    const [data, setData]         = useState(ASSETS.map(a => ({ ...a, price: 0, ch1h: 0, ch24h: 0, ch7d: 0, vol24h: 0, mcap: 0 })));
    const [search, setSearch]     = useState('');
    const [view, setView]         = useState<'gainers' | 'losers' | 'all'>('all');
    const [timeWindow, setTimeWindow] = useState<Window>('24h');
    const [lastUpdate, setLast]   = useState(new Date());
    const [loading, setLoading]   = useState(true);

    const sortKey: SortKey = timeWindow === '1h' ? 'ch1h' : timeWindow === '7d' ? 'ch7d' : 'ch24h';

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/markets');
            if (res.ok) {
                const json = await res.json();
                // Strictly filter out any null/undefined entries before building the Map
                const rawData = Array.isArray(json?.data) ? json.data : [];
                const validEntries = rawData.filter(
                    (d: any) => d != null && typeof d === 'object' && typeof d.symbol === 'string'
                );
                if (validEntries.length > 0) {
                    const bMap = new Map<string, any>(validEntries.map((d: any) => [d.symbol, d]));

                    setData(prev => prev.map(a => {
                        const tick = bMap.get(a.symbol + 'USDT');
                        if (tick && typeof tick === 'object' && tick.lastPrice != null) {
                            const price = parseFloat(tick.lastPrice) || 0;
                            const ch24h = parseFloat(tick.priceChangePercent) || 0;
                            const vol24 = parseFloat(tick.quoteVolume) || 0;
                            const prevPrice = price / (1 + ch24h / 100);
                            const mcap = prevPrice > 0 ? a.mcapB * 1e9 * (price / prevPrice) : a.mcapB * 1e9;
                            return { ...a, price, ch1h: ch24h / 24, ch24h, ch7d: ch24h * 5, vol24h: vol24, mcap };
                        }
                        return a;
                    }));
                    setLast(new Date());
                }
            }
        } catch (e) {
            console.error("Failed to fetch markets endpoint", e);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { refresh(); const id = setInterval(refresh, 8000); return () => clearInterval(id); }, [refresh]);

    const filtered = data
        .filter(d => d.symbol.toLowerCase().includes(search.toLowerCase()) || d.name.toLowerCase().includes(search.toLowerCase()))
        .filter(d => view === 'gainers' ? (d as any)[sortKey] >= 0 : view === 'losers' ? (d as any)[sortKey] < 0 : true)
        .sort((a, b) => (b as any)[sortKey] - (a as any)[sortKey]);

    const topGainers = [...data].sort((a, b) => (b as any)[sortKey] - (a as any)[sortKey]).slice(0, 3);
    const topLosers  = [...data].sort((a, b) => (a as any)[sortKey] - (b as any)[sortKey]).slice(0, 3);

    return (
        <div className="flex flex-col space-y-5">
            {/* ── Top Cards ── */}
            <div className="grid grid-cols-2 gap-4">
                {/* Top Gainers Card */}
                <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Flame size={15} className="text-[#00C076]"/>
                        <span className="text-[10px] font-black text-[#050505] uppercase tracking-widest">Top Gainers ({timeWindow})</span>
                    </div>
                    <div className="space-y-3">
                        {topGainers.map((d, i) => (
                            <div key={d.symbol} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-black text-[#888888] w-4">{i + 1}</span>
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black text-white shrink-0"
                                        style={{ background: CHAIN_COLORS[d.chain] || CHAIN_COLORS.default }}>
                                        {d.symbol[0]}
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-[#050505]">{d.symbol}</div>
                                        <div className="text-[8px] text-[#888888]">{fmt(d.price)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-[#00C076]">
                                    <ArrowUpRight size={12}/>
                                    <span className="text-[10px] font-black">{pctFmt((d as any)[sortKey])}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Losers Card */}
                <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Skull size={15} className="text-[#FF3B30]"/>
                        <span className="text-[10px] font-black text-[#050505] uppercase tracking-widest">Top Losers ({timeWindow})</span>
                    </div>
                    <div className="space-y-3">
                        {topLosers.map((d, i) => (
                            <div key={d.symbol} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-black text-[#888888] w-4">{i + 1}</span>
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black text-white shrink-0"
                                        style={{ background: CHAIN_COLORS[d.chain] || CHAIN_COLORS.default }}>
                                        {d.symbol[0]}
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-[#050505]">{d.symbol}</div>
                                        <div className="text-[8px] text-[#888888]">{fmt(d.price)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-[#FF3B30]">
                                    <ArrowDownRight size={12}/>
                                    <span className="text-[10px] font-black">{pctFmt((d as any)[sortKey])}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Full Table ── */}
            <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm">
                {/* Toolbar */}
                <div className="px-5 py-3 border-b border-[#E5E5E5] bg-[#FAF9F6] flex items-center gap-3 flex-wrap">
                    {/* View */}
                    <div className="flex bg-[#F0F0F0] p-1 rounded-xl border border-[#E5E5E5]">
                        {(['all', 'gainers', 'losers'] as const).map(v => (
                            <button key={v} onClick={() => setView(v)}
                                className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-white text-[#050505] shadow-sm border border-[#E5E5E5]' : 'text-[#888888] hover:text-[#050505]'}`}>
                                {v === 'gainers' ? '🔥 Gainers' : v === 'losers' ? '💀 Losers' : 'All'}
                            </button>
                        ))}
                    </div>

                    {/* Time window */}
                    <div className="flex gap-1">
                        {(['1h', '24h', '7d'] as const).map(w => (
                            <button key={w} onClick={() => setTimeWindow(w)}
                                className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border transition-all ${timeWindow === w ? 'bg-[#050505] text-white border-[#050505]' : 'text-[#888888] border-[#E5E5E5] hover:border-[#050505]'}`}>
                                {w}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 min-w-[150px] max-w-xs">
                        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]"/>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                            className="w-full bg-white border border-[#E5E5E5] rounded-lg pl-8 pr-3 py-1.5 text-[10px] font-mono text-[#050505] outline-none focus:border-[#050505]"
                        />
                    </div>

                    {/* Refresh */}
                    <button onClick={refresh} disabled={loading}
                        className="ml-auto p-1.5 rounded-lg border border-[#E5E5E5] text-[#888888] hover:text-[#050505] disabled:opacity-50 transition-colors">
                        <RefreshCw size={13} className={loading ? 'animate-spin' : ''}/>
                    </button>
                    <span className="flex items-center gap-1 text-[9px] font-black text-[#888888] uppercase">
                        <Clock size={9}/>{lastUpdate.toTimeString().slice(0, 8)}
                    </span>
                </div>

                {/* Headers */}
                <div className="grid bg-[#FAF9F6] border-b border-[#E5E5E5] text-[9px] font-black text-[#888888] uppercase tracking-[0.18em]"
                    style={{ gridTemplateColumns: '2.5fr 1.5fr 0.9fr 0.9fr 0.9fr 1.2fr 1.2fr' }}>
                    {['Asset', 'Price', '1h %', '24h %', '7d %', 'Volume 24h', 'Market Cap'].map((h, i) => (
                        <div key={h} className={`px-4 py-2.5 ${i >= 2 ? 'text-right' : ''}`}>{h}</div>
                    ))}
                </div>

                {/* Rows (Virtualized) */}
                <div className="w-full" style={{ height: 500 }}>
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 text-[#888888]">
                            <Search size={32} className="mb-4 opacity-50" />
                            <h3 className="text-xs font-black text-[#111111] uppercase tracking-widest mb-1">NO MARKETS FOUND</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Adjust filters or search criteria</p>
                        </div>
                    ) : (
                        <AutoSizer>
                            {({ height, width }) => (
                                <List
                                    height={height || 500}
                                    itemCount={filtered.length}
                                    itemSize={56}
                                    width={width || '100%'}
                                    itemData={{ filtered }}
                                >
                                    {({ index, style, data }: { index: number, style: React.CSSProperties, data: any }) => {
                                        const d = data?.filtered?.[index];
                                        if (!d) return <div style={style} className="bg-red-500/10" />; // Absolute failsafe
                                        return (
                                            <div style={style} className="border-b border-[#F0F0F0]">
                                                <div className="grid hover:bg-[#FAF9F6] transition-colors items-center cursor-pointer h-full"
                                                    style={{ gridTemplateColumns: '2.5fr 1.5fr 0.9fr 0.9fr 0.9fr 1.2fr 1.2fr' }}
                                                >
                                                    {/* Asset */}
                                                    <div className="px-4 flex items-center gap-2.5">
                                                        <span className="text-[8px] font-black text-[#888888] w-4">{index + 1}</span>
                                                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0"
                                                            style={{ background: CHAIN_COLORS[d.chain] || CHAIN_COLORS.default }}>
                                                            {d.symbol?.[0] || '?'}
                                                        </div>
                                                        <div>
                                                            <div className="text-[11px] font-black text-[#050505]">{d.symbol}</div>
                                                            <div className="text-[8px] text-[#888888]">{d.name}</div>
                                                        </div>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="px-4 text-[10px] font-black font-mono text-[#050505]">
                                                        {d.price >= 1 ? `$${(d.price || 0).toFixed(2)}` : `$${(d.price || 0).toFixed(6)}`}
                                                    </div>

                                                    {/* 1h */}
                                                    <div className={`px-4 text-right text-[10px] font-black font-mono ${pctColor(d.ch1h)}`}>
                                                        {pctFmt(d.ch1h || 0)}
                                                    </div>

                                                    {/* 24h */}
                                                    <div className={`px-4 text-right text-[10px] font-black font-mono ${pctColor(d.ch24h)}`}>
                                                        {pctFmt(d.ch24h || 0)}
                                                    </div>

                                                    {/* 7d */}
                                                    <div className={`px-4 text-right text-[10px] font-black font-mono ${pctColor(d.ch7d)}`}>
                                                        {pctFmt(d.ch7d || 0)}
                                                    </div>

                                                    {/* Vol */}
                                                    <div className="px-4 text-right text-[10px] font-bold font-mono text-[#050505]">
                                                        {fmt(d.vol24h || 0)}
                                                    </div>

                                                    {/* MCap */}
                                                    <div className="px-4 text-right text-[10px] font-bold font-mono text-[#888888]">
                                                        {fmt(d.mcap || 0)}
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

                {/* Footer */}
                <div className="px-5 py-2 border-t border-[#E5E5E5] bg-[#FAF9F6] flex items-center justify-between text-[9px] font-black text-[#888888] uppercase tracking-widest">
                    <span>{filtered.length} assets · {timeWindow} window</span>
                    <span>Updates every 30s</span>
                </div>
            </div>
        </div>
    );
}
