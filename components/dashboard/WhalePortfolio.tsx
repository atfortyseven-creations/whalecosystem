"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Wallet, TrendingUp, TrendingDown, BarChart2,
    Layers, ArrowUpRight, ArrowDownRight, RefreshCw,
    Activity, DollarSign, Zap, Globe, Shield, PieChart,
    Search, ExternalLink, Clock
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────
interface WhaleEntity {
    rank: number;
    label: string;
    address: string;
    category: string;
    netWorthUSD: number;
    change24h: number;
    topHolding: string;
    topHoldingPct: number;
    winRate: number;
    pnl30d: number;
    txCount30d: number;
    chains: string[];
    alphaScore: number;
}

interface PortfolioToken {
    symbol: string;
    name: string;
    balance: number;
    priceUSD: number;
    valueUSD: number;
    change24h: number;
    allocation: number;
    chain: string;
}

// ── Mock data generators ─────────────────────────────────────────────────────
const CHAIN_COLORS: Record<string, string> = {
    ethereum: '#627EEA', solana: '#9945FF', bsc: '#F0B90B',
    arbitrum: '#12AAFF', base: '#0052FF', polygon: '#8247E5',
};

const CATEGORIES = ['Exchange', 'Whale', 'DAO', 'MEV Bot', 'Smart Money', 'Institutional', 'Fund'];

function generateWhale(rank: number): WhaleEntity {
    const labels = [
        'Vitalik Buterin', 'Binance Hot Wallet', 'Coinbase Prime', 'Jump Trading',
        'Three Arrows Capital', 'a16z Crypto', 'Paradigm Capital', 'BlackRock DeFi',
        'Cumberland DRW', 'Alameda Research', 'Wintermute Trading', 'GSR Markets',
    ];
    const chains = ['ethereum', 'solana', 'arbitrum', 'base', 'bsc', 'polygon'];
    const tokens = ['BTC', 'ETH', 'SOL', 'ARB', 'BNB', 'USDC', 'USDT', 'LINK', 'UNI', 'AVAX'];
    const nw = Math.random() * 2_000_000_000 + 10_000_000;
    const ch = parseFloat(((Math.random() - 0.45) * 15).toFixed(2));
    const wr = parseFloat((Math.random() * 35 + 55).toFixed(1));
    const pnl = parseFloat(((Math.random() - 0.4) * 5_000_000).toFixed(0));
    return {
        rank,
        label:  labels[rank - 1] || `Whale #${rank}`,
        address: `0x${Math.random().toString(16).slice(2, 42)}`,
        category: CATEGORIES[rank % CATEGORIES.length],
        netWorthUSD: nw,
        change24h: ch,
        topHolding: tokens[rank % tokens.length],
        topHoldingPct: parseFloat((Math.random() * 60 + 10).toFixed(1)),
        winRate: wr,
        pnl30d: pnl,
        txCount30d: Math.floor(Math.random() * 3000 + 50),
        chains: chains.slice(0, Math.floor(Math.random() * 4) + 1),
        alphaScore: Math.floor(wr * 1.1 - 5 + Math.random() * 10),
    };
}

const WHALES = Array.from({ length: 20 }, (_, i) => generateWhale(i + 1));

const PORTFOLIO_TOKENS: PortfolioToken[] = [
    { symbol: 'BTC',  name: 'Bitcoin',         balance: 142.5,    priceUSD: 83241,  valueUSD: 11859244, change24h: 1.2,  allocation: 38.4, chain: 'ethereum'  },
    { symbol: 'ETH',  name: 'Ethereum',         balance: 2840,     priceUSD: 3812,   valueUSD: 10826080, change24h: -0.8, allocation: 35.1, chain: 'ethereum'  },
    { symbol: 'SOL',  name: 'Solana',           balance: 14200,    priceUSD: 155,    valueUSD: 2201000,  change24h: 3.4,  allocation: 7.1,  chain: 'solana'    },
    { symbol: 'ARB',  name: 'Arbitrum',         balance: 420000,   priceUSD: 1.22,   valueUSD: 512400,   change24h: -2.1, allocation: 1.7,  chain: 'arbitrum'  },
    { symbol: 'LINK', name: 'Chainlink',        balance: 18500,    priceUSD: 14.8,   valueUSD: 273800,   change24h: 5.6,  allocation: 0.9,  chain: 'ethereum'  },
    { symbol: 'USDC', name: 'USD Coin',         balance: 4800000,  priceUSD: 1.0,    valueUSD: 4800000,  change24h: 0.0,  allocation: 15.6, chain: 'ethereum'  },
    { symbol: 'USDT', name: 'Tether',           balance: 620000,   priceUSD: 1.0,    valueUSD: 620000,   change24h:  0.0, allocation: 2.0,  chain: 'ethereum'  },
    { symbol: 'PEPE', name: 'Pepe',             balance: 500000000,priceUSD: 0.0000082,valueUSD: 4100,   change24h: 12.3, allocation: 0.0,  chain: 'ethereum'  },
];

const fmt = (n: number) => {
    if (Math.abs(n) >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
    if (Math.abs(n) >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
    if (Math.abs(n) >= 1e3)  return `$${(n / 1e3).toFixed(1)}K`;
    return `$${n.toFixed(2)}`;
};
const pctColor = (v: number) =>  v >= 0 ? 'text-[#00C076]' : 'text-[#FF3B30]';
const pctFmt   = (v: number) =>  `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
const totalValue = PORTFOLIO_TOKENS.reduce((s, t) => s + t.valueUSD, 0);

// ── Main component ────────────────────────────────────────────────────────────
export function WhalePortfolio() {
    const [view, setView]     = useState<'leaderboard' | 'portfolio'>('leaderboard');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [whales, setWhales] = useState(WHALES);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const refresh = () => {
        setLoading(true);
        setTimeout(() => {
            setWhales(Array.from({ length: 20 }, (_, i) => generateWhale(i + 1)));
            setLastUpdated(new Date());
            setLoading(false);
        }, 700);
    };

    const filteredWhales = whales.filter(w =>
        w.label.toLowerCase().includes(search.toLowerCase()) ||
        w.category.toLowerCase().includes(search.toLowerCase()) ||
        w.address.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col space-y-5">
            {/* ── Header Stats ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Whale AUM',  value: '$2.84T',   sub: 'Top 20 entities',   color: '#050505', icon: <DollarSign size={16}/> },
                    { label: 'Whale Txns 24h',   value: '41,820',   sub: '+12.4% vs yesterday',color: '#00C076', icon: <Activity size={16}/> },
                    { label: 'Smart Money Flows', value: '+$1.2B',   sub: 'Net inflow 24h',    color: '#00C076', icon: <TrendingUp size={16}/> },
                    { label: 'Avg Alpha Score',  value: '78.4',      sub: 'Out of 100',        color: '#D4AF37', icon: <Zap size={16}/> },
                ].map((s, i) => (
                    <div key={i} className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <span style={{ color: s.color }}>{s.icon}</span>
                            <span className="text-[9px] font-black text-[#888888] uppercase tracking-widest">{s.label}</span>
                        </div>
                        <div className="text-2xl font-black font-mono" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-[9px] text-[#888888] mt-0.5">{s.sub}</div>
                    </div>
                ))}
            </div>

            {/* ── Toolbar ── */}
            <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-3 border-b border-[#E5E5E5] bg-[#FAF9F6] flex items-center gap-3 flex-wrap">
                    <div className="flex bg-[#F0F0F0] p-1 rounded-xl border border-[#E5E5E5]">
                        {(['leaderboard', 'portfolio'] as const).map(v => (
                            <button key={v} onClick={() => setView(v)}
                                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-white text-[#050505] shadow-sm border border-[#E5E5E5]' : 'text-[#888888] hover:text-[#050505]'}`}>
                                {v === 'leaderboard' ? '🐋 Leaderboard' : '📊 Portfolio View'}
                            </button>
                        ))}
                    </div>
                    <div className="relative flex-1 min-w-[160px] max-w-xs">
                        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]"/>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search whale or entity…"
                            className="w-full bg-white border border-[#E5E5E5] rounded-lg pl-8 pr-3 py-1.5 text-[10px] font-mono text-[#050505] outline-none focus:border-[#050505]"
                        />
                    </div>
                    <button onClick={refresh} disabled={loading}
                        className="ml-auto p-1.5 rounded-lg border border-[#E5E5E5] text-[#888888] hover:text-[#050505] disabled:opacity-50 transition-colors">
                        <RefreshCw size={13} className={loading ? 'animate-spin' : ''}/>
                    </button>
                    <span className="text-[9px] font-black text-[#888888] uppercase flex items-center gap-1">
                        <Clock size={9}/>{lastUpdated.toTimeString().slice(0, 8)}
                    </span>
                </div>

                {/* ── LEADERBOARD VIEW ── */}
                {view === 'leaderboard' && (
                    <>
                        <div className="grid text-[9px] font-black text-[#888888] uppercase tracking-[0.18em] bg-[#FAF9F6] border-b border-[#E5E5E5]"
                            style={{ gridTemplateColumns: '0.4fr 2.5fr 1.2fr 1.2fr 0.8fr 1fr 1fr 1fr 1fr 0.8fr' }}>
                            {['#', 'Entity', 'Net Worth', '24h Chg', 'Category', 'Top Hold.', 'Win Rate', 'PnL 30d', 'Alpha', 'Chains'].map((h, i) => (
                                <div key={h} className={`px-3 py-2.5 ${i >= 2 ? 'text-right' : ''}`}>{h}</div>
                            ))}
                        </div>
                        <div className="divide-y divide-[#F0F0F0]">
                            {filteredWhales.map((w, i) => (
                                <motion.div key={w.rank}
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                                    className="grid hover:bg-[#FAF9F6] transition-colors items-center cursor-pointer"
                                    style={{ gridTemplateColumns: '0.4fr 2.5fr 1.2fr 1.2fr 0.8fr 1fr 1fr 1fr 1fr 0.8fr' }}>
                                    {/* Rank */}
                                    <div className="px-3 py-3 text-[10px] font-black text-[#888888]">
                                        {w.rank <= 3 ? ['🥇','🥈','🥉'][w.rank - 1] : `#${w.rank}`}
                                    </div>
                                    {/* Entity */}
                                    <div className="px-3 py-3 flex items-center gap-2 min-w-0">
                                        <div className="w-7 h-7 rounded-full bg-[#050505] flex items-center justify-center text-[8px] font-black text-white shrink-0">
                                            {w.label[0]}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[11px] font-black text-[#050505] truncate">{w.label}</div>
                                            <div className="text-[8px] font-mono text-[#888888] truncate">{w.address.slice(0,8)}…{w.address.slice(-4)}</div>
                                        </div>
                                    </div>
                                    {/* Net Worth */}
                                    <div className="px-3 py-3 text-right text-[10px] font-black font-mono text-[#050505]">{fmt(w.netWorthUSD)}</div>
                                    {/* 24h */}
                                    <div className={`px-3 py-3 text-right text-[10px] font-black font-mono flex items-center justify-end gap-0.5 ${pctColor(w.change24h)}`}>
                                        {w.change24h >= 0 ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}
                                        {pctFmt(w.change24h)}
                                    </div>
                                    {/* Category */}
                                    <div className="px-3 py-3 text-right">
                                        <span className="text-[7px] px-1.5 py-0.5 rounded bg-[#E5E5E5] text-[#888888] font-black uppercase">{w.category}</span>
                                    </div>
                                    {/* Top Holding */}
                                    <div className="px-3 py-3 text-right">
                                        <div className="text-[10px] font-black text-[#050505]">{w.topHolding}</div>
                                        <div className="text-[8px] text-[#888888]">{w.topHoldingPct}% of portfolio</div>
                                    </div>
                                    {/* Win Rate */}
                                    <div className={`px-3 py-3 text-right text-[10px] font-black font-mono ${w.winRate > 65 ? 'text-[#00C076]' : 'text-[#888888]'}`}>
                                        {w.winRate}%
                                    </div>
                                    {/* PnL 30d */}
                                    <div className={`px-3 py-3 text-right text-[10px] font-black font-mono ${pctColor(w.pnl30d)}`}>
                                        {fmt(Math.abs(w.pnl30d))}
                                    </div>
                                    {/* Alpha Score */}
                                    <div className="px-3 py-3 text-right">
                                        <span className={`text-[10px] font-black flex items-center justify-end gap-0.5 ${w.alphaScore > 70 ? 'text-[#D4AF37]' : 'text-[#888888]'}`}>
                                            <Zap size={9}/>{w.alphaScore}
                                        </span>
                                    </div>
                                    {/* Chains */}
                                    <div className="px-3 py-3 flex flex-wrap justify-end gap-0.5">
                                        {w.chains.slice(0, 3).map(c => (
                                            <div key={c} className="w-3 h-3 rounded-full" style={{ background: CHAIN_COLORS[c] || '#888' }} title={c}/>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}

                {/* ── PORTFOLIO VIEW ── */}
                {view === 'portfolio' && (
                    <>
                        {/* Aggregate stats */}
                        <div className="grid grid-cols-3 divide-x divide-[#E5E5E5] border-b border-[#E5E5E5] bg-white">
                            {[
                                { label: 'Total Portfolio Value', value: fmt(totalValue), color: '#050505' },
                                { label: '24h Change',            value: '+$284K (+0.9%)', color: '#00C076' },
                                { label: 'Active Positions',      value: PORTFOLIO_TOKENS.length.toString(), color: '#050505' },
                            ].map((s, i) => (
                                <div key={i} className="px-6 py-4 flex flex-col">
                                    <span className="text-[9px] font-black text-[#888888] uppercase tracking-widest mb-1">{s.label}</span>
                                    <span className="text-xl font-black font-mono" style={{ color: s.color }}>{s.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Allocation bar */}
                        <div className="px-5 py-3 border-b border-[#E5E5E5] bg-[#FAF9F6]">
                            <div className="text-[9px] font-black text-[#888888] uppercase tracking-widest mb-2">Portfolio Allocation</div>
                            <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                                {PORTFOLIO_TOKENS.filter(t => t.allocation > 0).map((t, i) => {
                                    const colors = ['#050505','#627EEA','#9945FF','#12AAFF','#F0B90B','#00C076','#D4AF37','#FF3B30'];
                                    return <div key={t.symbol} style={{ width: `${t.allocation}%`, background: colors[i % colors.length] }} title={`${t.symbol}: ${t.allocation}%`}/>;
                                })}
                            </div>
                            <div className="flex flex-wrap gap-3 mt-2">
                                {PORTFOLIO_TOKENS.filter(t => t.allocation > 0).map((t, i) => {
                                    const colors = ['#050505','#627EEA','#9945FF','#12AAFF','#F0B90B','#00C076','#D4AF37','#FF3B30'];
                                    return (
                                        <span key={t.symbol} className="flex items-center gap-1 text-[8px] font-black text-[#888888]">
                                            <div className="w-2 h-2 rounded-full" style={{ background: colors[i % colors.length] }}/>
                                            {t.symbol} {t.allocation}%
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Token table */}
                        <div className="grid text-[9px] font-black text-[#888888] uppercase tracking-[0.18em] bg-[#FAF9F6] border-b border-[#E5E5E5]"
                            style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 0.8fr' }}>
                            {['Token', 'Balance', 'Price', '24h %', 'Value', 'Allocation', 'Chain'].map((h, i) => (
                                <div key={h} className={`px-4 py-2.5 ${i >= 1 ? 'text-right' : ''}`}>{h}</div>
                            ))}
                        </div>
                        <div className="divide-y divide-[#F0F0F0]">
                            {PORTFOLIO_TOKENS.map((t, i) => (
                                <motion.div key={t.symbol} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                                    className="grid hover:bg-[#FAF9F6] transition-colors items-center"
                                    style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 0.8fr' }}>
                                    <div className="px-4 py-3 flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0"
                                            style={{ background: CHAIN_COLORS[t.chain] || '#888' }}>
                                            {t.symbol[0]}
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-black text-[#050505]">{t.symbol}</div>
                                            <div className="text-[8px] text-[#888888]">{t.name}</div>
                                        </div>
                                    </div>
                                    <div className="px-4 py-3 text-right text-[10px] font-mono font-bold text-[#050505]">
                                        {t.balance >= 1e6 ? `${(t.balance/1e6).toFixed(2)}M` : t.balance.toLocaleString()}
                                    </div>
                                    <div className="px-4 py-3 text-right text-[10px] font-mono font-black text-[#050505]">
                                        {t.priceUSD >= 1 ? `$${t.priceUSD.toLocaleString()}` : `$${t.priceUSD.toFixed(8)}`}
                                    </div>
                                    <div className={`px-4 py-3 text-right text-[10px] font-black font-mono ${pctColor(t.change24h)}`}>
                                        {pctFmt(t.change24h)}
                                    </div>
                                    <div className="px-4 py-3 text-right text-[10px] font-black font-mono text-[#050505]">
                                        {fmt(t.valueUSD)}
                                    </div>
                                    <div className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <div className="w-12 h-1 bg-[#E5E5E5] rounded-full overflow-hidden">
                                                <div className="h-full bg-[#050505] rounded-full" style={{ width: `${Math.min(100, t.allocation)}%` }}/>
                                            </div>
                                            <span className="text-[9px] font-black text-[#888888]">{t.allocation}%</span>
                                        </div>
                                    </div>
                                    <div className="px-4 py-3 text-right">
                                        <span className="text-[7px] px-1.5 py-0.5 rounded font-bold uppercase" style={{ color: CHAIN_COLORS[t.chain], background: CHAIN_COLORS[t.chain] + '15' }}>
                                            {t.chain.slice(0, 4).toUpperCase()}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="px-5 py-2 border-t border-[#E5E5E5] bg-[#FAF9F6] text-[9px] font-black text-[#888888] uppercase tracking-widest">
                            {PORTFOLIO_TOKENS.length} positions · Total: {fmt(totalValue)} · Refreshed {lastUpdated.toTimeString().slice(0,8)}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
