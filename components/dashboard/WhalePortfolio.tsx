"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw,
    Activity, DollarSign, Zap, Search, Clock, AlertCircle
} from 'lucide-react';
import { useAccount } from 'wagmi';
import useSWR from 'swr';

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

const CHAIN_COLORS: Record<string, string> = {
    ethereum: '#627EEA', solana: '#9945FF', bsc: '#F0B90B',
    arbitrum: '#12AAFF', base: '#0052FF', polygon: '#8247E5',
};

const fmt = (n: number) => {
    if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    return `$${n.toFixed(2)}`;
};
const pctColor = (v: number) => v >= 0 ? 'text-[#00C076]' : 'text-[#FF3B30]';
const pctFmt   = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;

const fetcher = (url: string) => fetch(url).then(r => r.json());

// ── Main component ────────────────────────────────────────────────────────────
export function WhalePortfolio() {
    const [view, setView] = useState<'leaderboard' | 'portfolio'>('leaderboard');
    const [search, setSearch] = useState('');
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [liveWhaleCount, setLiveWhaleCount] = useState(0); // EP2 live counter

    // Real wallet address from wagmi
    const { address, isConnected } = useAccount();

    const { data: whaleData, isLoading: whaleLoading, mutate: mutateWhales } = useSWR(
        '/api/intelligence/whales', fetcher,
        { refreshInterval: 12000, suspense: false }
    );

    // Real on-chain portfolio — EP1 — only fetches when wallet is connected
    const { data: portfolioData, isLoading: portfolioLoading, mutate: mutatePortfolio } = useSWR(
        isConnected && address ? `/api/user/portfolio?address=${address}` : null,
        fetcher,
        { refreshInterval: 30000, suspense: false }
    );

    // EP4: Real on-chain prices from UniswapV3 slot0()
    const { data: priceData } = useSWR(
        '/api/market/prices', fetcher,
        { refreshInterval: 60000, suspense: false }
    );

    // Enrich portfolio tokens with EP4 on-chain prices where available
    const ep4Prices: Record<string, number> = priceData?.prices || {};

    const whales: WhaleEntity[] = whaleData?.entities || [];

    // Map real portfolio tokens from on-chain response (EP1), enriched with EP4 prices
    const PORTFOLIO_TOKENS: PortfolioToken[] = (portfolioData?.tokens || []).map((t: any) => {
        const onChainPrice = ep4Prices[t.symbol];
        const priceUSD = onChainPrice || t.usdPrice || 0;
        const valueUSD = t.balance * priceUSD;
        return {
            symbol: t.symbol || '?',
            name: t.name || t.symbol,
            balance: parseFloat(t.balance || '0'),
            priceUSD,
            valueUSD,
            change24h: t.change24h || 0,
            allocation: t.portfolioPct || 0,
            chain: (t.chain || 'ethereum').toLowerCase(),
        };
    });

    const totalValue = PORTFOLIO_TOKENS.reduce((s, t) => s + t.valueUSD, 0);

    // Recalculate allocation after EP4 price enrichment
    if (totalValue > 0) {
        PORTFOLIO_TOKENS.forEach(t => { t.allocation = (t.valueUSD / totalValue) * 100; });
    }

    // EP2 Polling: count live whale transfers in real time
    useEffect(() => {
        let isMounted = true;
        let timeoutId: NodeJS.Timeout;
        
        const fetchWhaleTx = async () => {
            if (!isMounted) return;
            try {
                const res = await fetch('/api/whales/sse');
                if (res.ok) {
                    const parsed = await res.json();
                    if (parsed && parsed.type === 'WHALE_TX') {
                        setLiveWhaleCount(c => c + 1);
                        setLastUpdated(new Date());
                    }
                }
            } catch {}
            finally {
                if (isMounted) {
                    timeoutId = setTimeout(fetchWhaleTx, 4000); // 4s poll
                }
            }
        };
        fetchWhaleTx();
        return () => { 
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, []);

    // Derive dynamic stats from real whale data
    const totalAUM    = whales.reduce((s, w) => s + (w.netWorthUSD || 0), 0);
    const avgAlpha    = whales.length > 0 ? whales.reduce((s, w) => s + (w.alphaScore || 0), 0) / whales.length : 0;
    const netFlowsUSD = whales.reduce((s, w) => s + (w.change24h >= 0 ? w.netWorthUSD * w.change24h / 100 : 0), 0);
    const totalTxns   = whales.reduce((s, w) => s + (w.txCount30d || 0), 0);

    const refresh = () => {
        mutateWhales();
        mutatePortfolio();
        setLastUpdated(new Date());
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
                    { label: 'Total Whale AUM',   value: whaleLoading ? '…' : fmt(totalAUM),
                      sub: `Top ${whales.length} on-chain entities`, color: '#050505', icon: <DollarSign size={16}/> },
                    { label: 'Whale Txns 30d',    value: whaleLoading ? '…' : totalTxns.toLocaleString(),
                      sub: 'Summed across entities', color: '#00C076', icon: <Activity size={16}/> },
                    { label: 'Smart Money Inflow', value: whaleLoading ? '…' : fmt(netFlowsUSD),
                      sub: 'Net long exposure 24h', color: '#00C076', icon: <TrendingUp size={16}/> },
                    { label: 'Avg Alpha Score',   value: whaleLoading ? '…' : avgAlpha.toFixed(1),
                      sub: 'Out of 100 · live calc', color: '#D4AF37', icon: <Zap size={16}/> },
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

            {/* ── Card ── */}
            <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm">

                {/* ── Toolbar ── */}
                <div className="px-5 py-3 border-b border-[#E5E5E5] bg-[#FAF9F6] flex items-center gap-3 flex-wrap">
                    <div className="flex bg-[#F0F0F0] p-1 rounded-xl border border-[#E5E5E5]">
                        {(['leaderboard', 'portfolio'] as const).map(v => (
                            <button key={v} onClick={() => setView(v)}
                                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-white text-[#050505] shadow-sm border border-[#E5E5E5]' : 'text-[#888888] hover:text-[#050505]'}`}>
                                {v === 'leaderboard' ? '🐋 Leaderboard' : '📊 Portfolio View'}
                            </button>
                        ))}
                    </div>
                    {/* EP2 Live whale counter badge */}
                    {liveWhaleCount > 0 && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg text-[9px] font-black text-[#D4AF37] uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"/>
                            {liveWhaleCount} live · EP2
                        </span>
                    )}
                    <div className="relative flex-1 min-w-[160px] max-w-xs">
                        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]"/>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search whale or entity…"
                            className="w-full bg-white border border-[#E5E5E5] rounded-lg pl-8 pr-3 py-1.5 text-[10px] font-mono text-[#050505] outline-none focus:border-[#050505]"
                        />
                    </div>
                    <button onClick={refresh} disabled={whaleLoading}
                        className="ml-auto p-1.5 rounded-lg border border-[#E5E5E5] text-[#888888] hover:text-[#050505] disabled:opacity-50 transition-colors">
                        <RefreshCw size={13} className={whaleLoading ? 'animate-spin' : ''}/>
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
                            {filteredWhales.length === 0 && (
                                <div className="py-16 text-center text-[10px] font-mono text-[#888888]">
                                    {whaleLoading ? 'Scanning on-chain whale activity…' : 'No whale entities found'}
                                </div>
                            )}
                            {filteredWhales.map((w, i) => (
                                <motion.div key={w.rank}
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                                    className="grid hover:bg-[#FAF9F6] transition-colors items-center cursor-pointer"
                                    style={{ gridTemplateColumns: '0.4fr 2.5fr 1.2fr 1.2fr 0.8fr 1fr 1fr 1fr 1fr 0.8fr' }}>
                                    <div className="px-3 py-3 text-[10px] font-black text-[#888888]">
                                        {w.rank <= 3 ? ['🥇','🥈','🥉'][w.rank - 1] : `#${w.rank}`}
                                    </div>
                                    <div className="px-3 py-3 flex items-center gap-2 min-w-0">
                                        <div className="w-7 h-7 rounded-full bg-[#050505] flex items-center justify-center text-[8px] font-black text-white shrink-0">
                                            {w.label[0]}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[11px] font-black text-[#050505] truncate">{w.label}</div>
                                            <div className="text-[8px] font-mono text-[#888888] truncate">{w.address.slice(0,8)}…{w.address.slice(-4)}</div>
                                        </div>
                                    </div>
                                    <div className="px-3 py-3 text-right text-[10px] font-black font-mono text-[#050505]">{fmt(w.netWorthUSD)}</div>
                                    <div className={`px-3 py-3 text-right text-[10px] font-black font-mono flex items-center justify-end gap-0.5 ${pctColor(w.change24h)}`}>
                                        {w.change24h >= 0 ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}
                                        {pctFmt(w.change24h)}
                                    </div>
                                    <div className="px-3 py-3 text-right">
                                        <span className="text-[7px] px-1.5 py-0.5 rounded bg-[#E5E5E5] text-[#888888] font-black uppercase">{w.category}</span>
                                    </div>
                                    <div className="px-3 py-3 text-right">
                                        <div className="text-[10px] font-black text-[#050505]">{w.topHolding}</div>
                                        <div className="text-[8px] text-[#888888]">{w.topHoldingPct}% of portfolio</div>
                                    </div>
                                    <div className={`px-3 py-3 text-right text-[10px] font-black font-mono ${w.winRate > 65 ? 'text-[#00C076]' : 'text-[#888888]'}`}>
                                        {w.winRate}%
                                    </div>
                                    <div className={`px-3 py-3 text-right text-[10px] font-black font-mono ${pctColor(w.pnl30d)}`}>
                                        {fmt(Math.abs(w.pnl30d))}
                                    </div>
                                    <div className="px-3 py-3 text-right">
                                        <span className={`text-[10px] font-black flex items-center justify-end gap-0.5 ${w.alphaScore > 70 ? 'text-[#D4AF37]' : 'text-[#888888]'}`}>
                                            <Zap size={9}/>{w.alphaScore}
                                        </span>
                                    </div>
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
                        {!isConnected ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <div className="w-14 h-14 rounded-2xl bg-[#050505] flex items-center justify-center">
                                    <Wallet size={24} className="text-white"/>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-sm font-black text-[#050505] uppercase tracking-widest">Connect Your Wallet</h3>
                                    <p className="text-[10px] text-[#888888] mt-1 max-w-xs">Connect your Web3 wallet to view your real on-chain portfolio balances across Ethereum, Base and more.</p>
                                </div>
                                <div className="flex items-center gap-2 text-[9px] font-mono text-[#888888] border border-[#E5E5E5] rounded-lg px-3 py-2 bg-[#FAF9F6]">
                                    <AlertCircle size={11}/>
                                    Use the Connect button in the top-right corner
                                </div>
                            </div>
                        ) : portfolioLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="flex flex-col items-center gap-3 text-[#888888]">
                                    <RefreshCw size={20} className="animate-spin"/>
                                    <span className="text-[10px] font-mono uppercase tracking-widest">Scanning on-chain balances…</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Aggregate stats */}
                                <div className="grid grid-cols-3 divide-x divide-[#E5E5E5] border-b border-[#E5E5E5] bg-white">
                                    {[
                                        { label: 'Total Portfolio Value', value: fmt(totalValue),                          color: '#050505' },
                                        { label: '24h Change',            value: fmt(PORTFOLIO_TOKENS.reduce((s, t) => s + (t.valueUSD * t.change24h / 100), 0)), color: '#00C076' },
                                        { label: 'Active Positions',      value: PORTFOLIO_TOKENS.length.toString(),        color: '#050505' },
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
                                                    {t.symbol} {t.allocation.toFixed(1)}%
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Token table header */}
                                <div className="grid text-[9px] font-black text-[#888888] uppercase tracking-[0.18em] bg-[#FAF9F6] border-b border-[#E5E5E5]"
                                    style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 0.8fr' }}>
                                    {['Token', 'Balance', 'Price', '24h %', 'Value', 'Allocation', 'Chain'].map((h, i) => (
                                        <div key={h} className={`px-4 py-2.5 ${i >= 1 ? 'text-right' : ''}`}>{h}</div>
                                    ))}
                                </div>

                                {/* Token rows */}
                                <div className="divide-y divide-[#F0F0F0]">
                                    {PORTFOLIO_TOKENS.length === 0 && (
                                        <div className="py-12 text-center text-[10px] font-mono text-[#888888]">
                                            No tokens found for this wallet
                                        </div>
                                    )}
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
                                                    <span className="text-[9px] font-black text-[#888888]">{t.allocation.toFixed(1)}%</span>
                                                </div>
                                            </div>
                                            <div className="px-4 py-3 text-right">
                                                <span className="text-[7px] px-1.5 py-0.5 rounded font-bold uppercase"
                                                    style={{ color: CHAIN_COLORS[t.chain] || '#888', background: (CHAIN_COLORS[t.chain] || '#888') + '20' }}>
                                                    {t.chain.slice(0, 4).toUpperCase()}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="px-5 py-2 border-t border-[#E5E5E5] bg-[#FAF9F6] text-[9px] font-black text-[#888888] uppercase tracking-widest">
                                    {PORTFOLIO_TOKENS.length} positions · Total: {fmt(totalValue)} · {address?.slice(0,6)}…{address?.slice(-4)} · {lastUpdated.toTimeString().slice(0,8)}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
