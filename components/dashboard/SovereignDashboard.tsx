"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Globe, BarChart2, Shield, Activity, RefreshCw,
    ExternalLink, AlertTriangle, ArrowUpRight, ArrowDownRight,
    Filter, Wallet, TrendingUp, Zap, Info, CheckCircle2, MessageSquare
} from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { useRealTimeFeed } from '@/hooks/useRealTimeFeed';
import SecurityScanner from '@/components/dashboard/SecurityScanner';
import TelegramSettings from '@/components/dashboard/TelegramSettings';
import { CurrencySwitcher } from '@/components/shared/CurrencySwitcher';
import { SovereignIdentityCard } from '@/components/bsv/SovereignIdentityCard';
import { SovereignMessenger } from '@/components/bsv/SovereignMessenger';
import { useCurrencyStore } from '@/lib/store/currency-store';
import '@/app/dashboard/dashboard.css';

// ─── TYPES ──────────────────────────────────────────────────

interface PolyMarket {
    id: string; slug: string; question: string; category: string;
    yesPrice: number; noPrice: number; volume24h: number; volumeTotal: number;
    liquidity: number; endDate?: string; edge: number;
    evSignal: 'OVERBOUGHT' | 'OVERSOLD' | 'LEAN_YES' | 'LEAN_NO' | 'NEUTRAL';
    active?: boolean; closed?: boolean;
}

interface DeFiPool {
    pool: string; chain: string; chainFull?: string; project: string;
    symbol: string; apy: number; apyBase: number; apyReward: number;
    tvlUsd: number; ilRisk: string; stablecoin: boolean;
    url: string; riskScore: number; tier: string;
}

type Tab = 'polymarket' | 'defi' | 'portfolio' | 'security';
type PolyCategory = 'all' | 'crypto' | 'politics' | 'sports' | 'economics';

// ─── FORMAT UTILS ────────────────────────────────────────────

const fmtUsd = (n: number) => {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    return `$${n.toFixed(0)}`;
};
const fmtPct  = (n: number) => `${(n * 100).toFixed(1)}%`;
const fmtApy  = (n: number) => `${n.toFixed(2)}%`;
const fmtTime = () => new Date().toISOString().slice(11, 19) + ' UTC';

// ─── EV / RISK CONFIG ────────────────────────────────────────

const EV: Record<string, { label: string; cls: string }> = {
    OVERSOLD:   { label: 'STRONG BUY', cls: 'az-badge az-badge-emerald' },
    LEAN_YES:   { label: 'LEAN YES',   cls: 'az-badge az-badge-lime' },
    NEUTRAL:    { label: 'NEUTRAL',    cls: 'az-badge az-badge-ghost' },
    LEAN_NO:    { label: 'LEAN NO',    cls: 'az-badge az-badge-amber' },
    OVERBOUGHT: { label: 'OVERBOUGHT', cls: 'az-badge az-badge-rose' },
};

const RISK: Record<number, { label: string; color: string }> = {
    1: { label: 'SAFE',        color: 'var(--az-emerald)' },
    2: { label: 'LOW',         color: 'var(--az-emerald)' },
    3: { label: 'MODERATE',    color: 'var(--az-amber)' },
    4: { label: 'HIGH',        color: '#ff7a3c' },
    5: { label: 'AGGRESSIVE',  color: 'var(--az-rose)' },
};

const CHAIN_CLS: Record<string, string> = {
    Ethereum: 'az-chain-pill az-chain-eth',
    Arbitrum: 'az-chain-pill az-chain-arb',
    Base:     'az-chain-pill az-chain-base',
    Optimism: 'az-chain-pill az-chain-op',
    BSC:      'az-chain-pill az-chain-bnb',
    Solana:   'az-chain-pill az-chain-sol',
};
const chainCls = (c: string) => CHAIN_CLS[c] || 'az-chain-pill az-badge-ghost';

// ─── SKELETON ROW ────────────────────────────────────────────

function SkeletonRows({ n = 8 }: { n?: number }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {Array.from({ length: n }).map((_, i) => (
                <div key={i} style={{ padding: '12px 16px', display: 'flex', gap: 12 }}>
                    <div className="az-skeleton" style={{ flex: 1, height: 10, borderRadius: 0 }} />
                    <div className="az-skeleton" style={{ width: 60, height: 10 }} />
                    <div className="az-skeleton" style={{ width: 70, height: 10 }} />
                    <div className="az-skeleton" style={{ width: 50, height: 10 }} />
                </div>
            ))}
        </div>
    );
}

// ─── EXPLAINER BLOCK ─────────────────────────────────────────

function Explainer({ title, children }: { title: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ margin: '0 0 0 0' }}>
            <button
                onClick={() => setOpen(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 16px', width: '100%', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            >
                <Info size={11} color="var(--az-ink-3)" />
                <span className="az-label">{title}</span>
                <span className="az-label" style={{ marginLeft: 'auto', color: 'var(--az-ink-3)' }}>{open ? '▲ HIDE' : '▼ HOW DOES THIS WORK?'}</span>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div className="az-explainer" style={{ margin: '0 16px 16px', borderRadius: 0 }}>
                            <div className="az-explainer-title">{title}</div>
                            <div className="az-explainer-body">{children}</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── PHASE 3: POLYMARKET PANEL ────────────────────────────────

function PolymarketPanel() {
    const [markets, setMarkets] = useState<PolyMarket[]>([]);
    const [stats, setStats] = useState({ vol: 0, count: 0, edge: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cat, setCat] = useState<PolyCategory>('all');
    const [selected, setSelected] = useState<PolyMarket | null>(null);
    const [ts, setTs] = useState('');

    const CATS: { id: PolyCategory; label: string }[] = [
        { id: 'all', label: 'ALL MARKETS' },
        { id: 'crypto', label: 'CRYPTO' },
        { id: 'politics', label: 'POLITICS' },
        { id: 'sports', label: 'SPORTS' },
        { id: 'economics', label: 'ECONOMICS' },
    ];

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const r = await fetch(`/api/polymarket/markets?limit=100&category=${cat}`);
            const d = await r.json();
            if (d.error) throw new Error(d.error);
            setMarkets(d.markets || []);
            setTs(new Date(d.timestamp).toISOString().slice(11, 19));
            const ms: PolyMarket[] = d.markets || [];
            setStats({
                vol:   ms.reduce((s, m) => s + m.volume24h, 0),
                count: d.count,
                edge:  ms.reduce((mx, m) => Math.max(mx, m.edge), 0),
            });
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    }, [cat]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { const i = setInterval(load, 30000); return () => clearInterval(i); }, [load]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* Stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                {[
                    { label: '24H VOLUME',   value: fmtUsd(stats.vol),         color: 'var(--az-lime)' },
                    { label: 'MERCADOS LIVE', value: stats.count,              color: 'var(--az-ink)' },
                    { label: 'EDGE MÁXIMO',  value: fmtPct(stats.edge),       color: 'var(--az-emerald)' },
                ].map(s => (
                    <div key={s.label} className="az-stat-card">
                        <div className="az-label">{s.label}</div>
                        <div className="az-value-lg" style={{ color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="az-tab-bar" style={{ borderTop: 'none', fontSize: 8 }}>
                {CATS.map(c => (
                    <button key={c.id} onClick={() => setCat(c.id)}
                        className={`az-tab${cat === c.id ? ' active' : ''}`}
                        style={{ fontSize: 8, padding: '10px 14px' }}
                    >{c.label}</button>
                ))}
                <button onClick={load} className="az-btn-ghost" style={{ marginLeft: 'auto', padding: '8px 14px', border: 'none', borderLeft: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                    <RefreshCw size={11} className={loading ? 'animate-spin' : ''} color="currentColor" />
                </button>
            </div>

            {/* Table */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <div style={{ flex: 1, overflowY: 'auto' }} className="az-scroll">
                    {error && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', color: 'var(--az-rose)', fontSize: 11 }}>
                            <AlertTriangle size={12} /> <span style={{ color: 'var(--az-rose)' }}>{error}</span>
                        </div>
                    )}

                    {/* Column headers */}
                    {!loading && markets.length > 0 && (
                        <div className="az-col-header" style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 90px 100px', gap: 8 }}>
                            <span>MERCADO</span>
                            <span style={{ textAlign: 'right' }}>YES %</span>
                            <span style={{ textAlign: 'right' }}>VOL 24H</span>
                            <span style={{ textAlign: 'right' }}>LIQUID.</span>
                            <span style={{ textAlign: 'right' }}>SEÑAL EV</span>
                        </div>
                    )}

                    {loading && <SkeletonRows />}

                    <AnimatePresence initial={false}>
                        {markets.map(m => {
                            const ev = EV[m.evSignal] || EV.NEUTRAL;
                            const isActive = selected?.id === m.id;
                            return (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}
                                    className={`az-data-row${isActive ? ' active' : ''}`}
                                    style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 90px 100px', gap: 8 }}
                                    onClick={() => setSelected(isActive ? null : m)}
                                >
                                    <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            {(!m.active || m.closed) && (
                                                <span className="az-badge az-badge-rose" style={{ fontSize: 7, padding: '2px 4px', flexShrink: 0 }}>CERRADO</span>
                                            )}
                                            <span style={{ fontSize: 11, color: (!m.active || m.closed) ? 'var(--az-ink-3)' : 'var(--az-ink)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', textOverflow: 'ellipsis', fontWeight: 600 }}>{m.question}</span>
                                        </div>
                                        <span className="az-label" style={{ fontSize: 8 }}>{m.category}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                        <span className={`az-value-md${m.yesPrice >= 0.5 ? ' az-emerald' : ' az-rose'}`}>{fmtPct(m.yesPrice)}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                        <span className="az-value-sm">{fmtUsd(m.volume24h)}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                        <span className="az-value-sm" style={{ color: 'var(--az-ink-3)', fontWeight: 600 }}>{fmtUsd(m.liquidity)}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                        <span className={ev.cls}>{ev.label}</span>
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
                            initial={{ x: 310, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 310, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                            className="az-detail-panel"
                        >
                            <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <div className="az-label-lime" style={{ marginBottom: 8 }}>DETAILS</div>
                                <p style={{ fontSize: 12, color: 'var(--az-ink)', lineHeight: 1.6, marginBottom: 16, fontWeight: 700 }}>{selected.question}</p>
                                {/* Probability bars */}
                                {[
                                    { label: 'YES', val: selected.yesPrice, fill: 'az-bar-fill-emerald' },
                                    { label: 'NO',  val: 1 - selected.yesPrice, fill: 'az-bar-fill-rose' },
                                ].map(o => (
                                    <div key={o.label} style={{ marginBottom: 12 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                            <span className="az-label">{o.label}</span>
                                            <span className="az-value-md" style={{ fontSize: 13 }}>{fmtPct(o.val)}</span>
                                        </div>
                                        <div className="az-bar-track" style={{ height: 4 }}>
                                            <div className={o.fill} style={{ width: `${o.val * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ padding: '16px', flex: 1 }}>
                                {[
                                    { l: 'VOLUMEN 24H',  v: fmtUsd(selected.volume24h) },
                                    { l: 'VOLUMEN TOTAL', v: fmtUsd(selected.volumeTotal) },
                                    { l: 'LIQUIDEZ',     v: fmtUsd(selected.liquidity) },
                                    { l: 'CATEGORÍA',    v: selected.category },
                                ].map(row => (
                                    <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <span className="az-label">{row.l}</span>
                                        <span className="az-value-sm">{row.v}</span>
                                    </div>
                                ))}
                                <div style={{ marginTop: 16 }}>
                                    <div className="az-label" style={{ marginBottom: 6 }}>SIGNAL</div>
                                    <span className={(EV[selected.evSignal] || EV.NEUTRAL).cls} style={{ fontSize: 9 }}>
                                        {(EV[selected.evSignal] || EV.NEUTRAL).label}
                                    </span>
                                    <p style={{ marginTop: 8, fontSize: 11, color: 'var(--az-ink-3)', lineHeight: 1.6, fontWeight: 600 }}>
                                        {selected.evSignal === 'OVERSOLD' && 'El mercado puede estar subestimando significativamente la probabilidad YES. Potencial alta recompensa.'}
                                        {selected.evSignal === 'OVERBOUGHT' && 'La probabilidad YES está sobrevalorada. Considera la posición NO.'}
                                        {selected.evSignal === 'NEUTRAL' && 'Mercado equilibrado. Monitorizar cambios de volumen.'}
                                        {selected.evSignal === 'LEAN_YES' && 'Ligero sesgo hacia YES. Posición moderada si tiene información adicional.'}
                                        {selected.evSignal === 'LEAN_NO' && 'Ligero sesgo hacia NO. Posición moderada si tiene información adicional.'}
                                    </p>
                                </div>
                            </div>
                            <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                {(!selected.active || selected.closed) ? (
                                    <div className="az-surface-2" style={{ padding: 12, textAlign: 'center', color: 'var(--az-rose)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>
                                        MERCADO CERRADO
                                    </div>
                                ) : (
                                    <>
                                        <a
                                            href={`https://polymarket.com/market/${selected.slug}`}
                                            target="_blank" rel="noopener noreferrer"
                                            className="az-btn-primary"
                                            style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
                                        >
                                            TRADE <ExternalLink size={11} />
                                        </a>
                                        <p style={{ marginTop: 8, fontSize: 9, color: 'var(--az-ink-3)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                                            Requiere USDC en Polygon. Se abrirá MetaMask para confirmar.
                                        </p>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {ts && <div className="az-label" style={{ padding: '6px 16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>ÚLTIMO SYNC: {ts} UTC · Auto-refresh 30s</div>}
        </div>
    );
}

// ─── PHASE 4: DEFI YIELD PANEL ────────────────────────────────

function DeFiYieldPanel() {
    const [pools, setPools] = useState<DeFiPool[]>([]);
    const [stats, setStats] = useState({ avgApy: 0, maxApy: 0, stablePools: 0, totalTvl: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stableOnly, setStableOnly] = useState(false);
    const [minApy, setMinApy] = useState(3);
    const [chain, setChain] = useState('all');
    const [riskMax, setRiskMax] = useState(5);
    const [selected, setSelected] = useState<DeFiPool | null>(null);
    const [ts, setTs] = useState('');

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const r = await fetch(`/api/defi/yields?limit=100&minApy=${minApy}&chain=${chain}`);
            const d = await r.json();
            if (d.error) throw new Error(d.error);
            setStats(d.stats || {});
            setTs(new Date(d.timestamp).toISOString().slice(11, 19));
            let p: DeFiPool[] = d.pools || [];
            if (stableOnly) p = p.filter(x => x.stablecoin);
            if (riskMax < 5) p = p.filter(x => x.riskScore <= riskMax);
            setPools(p);
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    }, [minApy, chain, stableOnly, riskMax]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { const i = setInterval(load, 60000); return () => clearInterval(i); }, [load]);

    const CHAINS = ['all', 'Ethereum', 'Arbitrum', 'Base', 'Optimism', 'Polygon', 'BSC', 'Solana'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                {[
                    { label: 'APY MÁXIMO',    value: fmtApy(stats.maxApy),              color: 'var(--az-lime)' },
                    { label: 'APY PROMEDIO',  value: fmtApy(stats.avgApy),              color: 'var(--az-ink)' },
                    { label: 'POOLS STABLE',  value: stats.stablePools,                color: 'var(--az-emerald)' },
                    { label: 'TVL TOTAL',     value: fmtUsd(stats.totalTvl),            color: 'rgba(26, 20, 0, 0.50)' },
                ].map(s => (
                    <div key={s.label} className="az-stat-card">
                        <div className="az-label">{s.label}</div>
                        <div className="az-value-lg" style={{ color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input type="checkbox" checked={stableOnly} onChange={e => setStableOnly(e.target.checked)} style={{ accentColor: 'var(--az-lime)' }} />
                    <span className="az-label">STABLE ONLY</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Filter size={10} color="var(--az-ink-3)" />
                    <span className="az-label">APY MIN:</span>
                    <select value={minApy} onChange={e => setMinApy(+e.target.value)} className="az-select">
                        {[3,5,8,10,15,20,30].map(v => <option key={v} value={v}>{v}%</option>)}
                    </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="az-label">CADENA:</span>
                    <select value={chain} onChange={e => setChain(e.target.value)} className="az-select">
                        {CHAINS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="az-label">RIESGO MAX:</span>
                    <select value={riskMax} onChange={e => setRiskMax(+e.target.value)} className="az-select">
                        {[1,2,3,4,5].map(v => <option key={v} value={v}>{v} — {RISK[v]?.label}</option>)}
                    </select>
                </div>
                <button onClick={load} className="az-btn-ghost" style={{ marginLeft: 'auto', padding: '6px 12px', fontSize: 10 }}>
                    <RefreshCw size={11} className={loading ? 'animate-spin' : ''} /> ACTUALIZAR
                </button>
            </div>

            {/* Table */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <div style={{ flex: 1, overflowY: 'auto' }} className="az-scroll">
                    {error && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', color: 'var(--az-rose)', fontSize: 11 }}>
                            <AlertTriangle size={12} /> <span style={{ color: 'var(--az-rose)' }}>{error}</span>
                        </div>
                    )}
                    {!loading && pools.length > 0 && (
                        <div className="az-col-header" style={{ display: 'grid', gridTemplateColumns: '1fr 70px 80px 90px 80px 70px', gap: 8 }}>
                            <span>POOL</span>
                            <span style={{ textAlign: 'right' }}>CADENA</span>
                            <span style={{ textAlign: 'right' }}>APY</span>
                            <span style={{ textAlign: 'right' }}>TVL</span>
                            <span style={{ textAlign: 'right' }}>TIPO</span>
                            <span style={{ textAlign: 'right' }}>RIESGO</span>
                        </div>
                    )}
                    {loading && <SkeletonRows />}
                    <AnimatePresence initial={false}>
                        {pools.map((p, i) => {
                            const risk = RISK[p.riskScore] || RISK[5];
                            const isActive = selected?.pool === p.pool;
                            return (
                                <motion.div
                                    key={p.pool}
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15, delay: i * 0.008 }}
                                    className={`az-data-row${isActive ? ' active' : ''}`}
                                    style={{ display: 'grid', gridTemplateColumns: '1fr 70px 80px 90px 80px 70px', gap: 8 }}
                                    onClick={() => setSelected(isActive ? null : p)}
                                >
                                    <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <span className="az-value-sm" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.symbol}</span>
                                        <span className="az-label" style={{ fontSize: 8, textTransform: 'lowercase' }}>{p.project}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                        <span className={chainCls(p.chainFull || p.chain)}>{p.chain}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                        <span className="az-value-md" style={{ color: p.apy >= 20 ? 'var(--az-lime)' : p.apy >= 10 ? 'var(--az-emerald)' : 'var(--az-ink)', fontFamily: 'var(--font-mono)' }}>
                                            {fmtApy(p.apy)}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                        <span className="az-value-sm">{fmtUsd(p.tvlUsd)}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                        <span className={`az-badge ${p.stablecoin ? 'az-badge-emerald' : 'az-badge-amber'}`}>
                                            {p.stablecoin ? 'STABLE' : 'VOLATILE'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                        <span className="az-label" style={{ color: risk.color, fontWeight: 800 }}>{risk.label}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Detail panel */}
                <AnimatePresence>
                    {selected && (
                        <motion.div
                            initial={{ x: 310, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 310, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                            className="az-detail-panel"
                        >
                            <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <div className="az-label-lime" style={{ marginBottom: 4 }}>DETAILS</div>
                                <div className="az-header-lg" style={{ fontFamily: 'var(--font-mono)', marginBottom: 2 }}>{selected.symbol}</div>
                                <div className="az-label" style={{ marginBottom: 16 }}>{selected.project} · {selected.chainFull || selected.chain}</div>
                                {/* APY hero */}
                                <div style={{ background: 'rgba(0,0,0,0.50)', border: '1px solid rgba(255,255,255,0.06)', padding: '20px', textAlign: 'center', marginBottom: 16 }}>
                                    <div className="az-label" style={{ marginBottom: 4 }}>APY TOTAL</div>
                                    <div className="az-hero-stat-value az-lime az-glow-lime">{fmtApy(selected.apy)}</div>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8 }}>
                                        <div><span className="az-label">BASE</span> <span className="az-value-sm">{fmtApy(selected.apyBase)}</span></div>
                                        <div><span className="az-label">REWARD</span> <span className="az-value-sm">{fmtApy(selected.apyReward)}</span></div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }} className="az-scroll">
                                {[
                                    { l: 'TVL',           v: fmtUsd(selected.tvlUsd) },
                                    { l: 'CADENA',        v: selected.chainFull || selected.chain },
                                    { l: 'IL RISK',       v: selected.ilRisk === 'no' ? 'NINGUNO' : selected.ilRisk },
                                    { l: 'RISK SCORE',    v: `${selected.riskScore}/5 — ${RISK[selected.riskScore]?.label}` },
                                    { l: 'TIPO DE ACTIVO', v: selected.stablecoin ? 'STABLECOIN (sin riesgo de precio)' : 'ACTIVO VOLÁTIL' },
                                ].map(row => (
                                    <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <span className="az-label">{row.l}</span>
                                        <span className="az-value-sm">{row.v}</span>
                                    </div>
                                ))}
                                {/* Earning calculator */}
                                <div style={{ marginTop: 16, background: 'rgba(0,0,0,0.40)', border: '1px solid rgba(255,255,255,0.06)', padding: 14 }}>
                                    <div className="az-label" style={{ marginBottom: 8 }}>CALCULADORA</div>
                                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.50)', lineHeight: 1.7 }}>
                                        <strong style={{ color: 'var(--az-emerald)' }}>{fmtUsd(selected.apy * 10 / 365)}</strong> / día
                                    </p>
                                </div>
                            </div>
                            <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <a href={selected.url} target="_blank" rel="noopener noreferrer"
                                    className="az-btn-primary" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>
                                    DEPOSIT <ExternalLink size={11} />
                                </a>
                                <p style={{ marginTop: 8, fontSize: 9, color: 'rgba(255,255,255,0.25)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                                    MetaMask pedirá aprobación ERC-20 + depósito.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {ts && <div className="az-label" style={{ padding: '6px 16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>FUENTE: DEFILLAMA · SYNC: {ts} UTC · Auto-refresh 60s</div>}
        </div>
    );
}

// ─── PHASE 5: PORTFOLIO / WALLET PANEL ───────────────────────

function PortfolioPanel() {
    const { address, isConnected } = useAccount();
    const { data: ethBalance } = useBalance({ address });
    const { currency, rates } = useCurrencyStore();

    // REAL ERC-20 BALANCES
    const { data: usdc } = useBalance({ address, token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' });
    const { data: usdt } = useBalance({ address, token: '0xdAC17F958D2ee523a2206206994597C13D831ec7' });
    const { data: weth } = useBalance({ address, token: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' });
    const { data: link } = useBalance({ address, token: '0x514910771AF9Ca656af840dff83E8264EcF986CA' });

    if (!isConnected) {
        return (
            <div className="az-loading-center">
                <Wallet size={36} color="rgba(255,255,255,0.08)" />
                <div style={{ textAlign: 'center' }}>
                    <div className="az-label" style={{ marginBottom: 8 }}>WALLET NO CONECTADO</div>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)', maxWidth: 280, lineHeight: 1.6 }}>
                        Conecta tu wallet para ver tu portfolio en tiempo real. Los datos se leen directamente de la blockchain.
                    </p>
                </div>
            </div>
        );
    }

    const CUR_SYMBOLS: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', CHF: 'Fr', SEK: 'kr', NOK: 'kr', DKK: 'kr. ', PLN: 'zł', TRY: '₺', BTC: '₿' };
    const curSymbol = CUR_SYMBOLS[currency] || '$';
    const rate = rates[currency] || 1;

    const tokens = [
        { s: 'ETH',  n: 'Ethereum',     b: ethBalance?.formatted || '0.00', p: 3500 },
        { s: 'USDC', n: 'USD Coin',     b: usdc?.formatted || '0.00',       p: 1 },
        { s: 'USDT', n: 'Tether USD',   b: usdt?.formatted || '0.00',       p: 1 },
        { s: 'WETH', n: 'Wrapped Ether', b: weth?.formatted || '0.00',      p: 3500 },
        { s: 'LINK', n: 'Chainlink',     b: link?.formatted || '0.00',      p: 18 },
    ].map(t => ({
        ...t,
        val: parseFloat(t.b) * t.p * rate
    }));

    const totalVal = tokens.reduce((s, t) => s + t.val, 0);

    return (
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }} className="az-scroll">
            {/* VALUATION HERO */}
            <div className="az-surface-2" style={{ padding: '24px', borderLeft: '4px solid var(--az-lime)', background: 'linear-gradient(90deg, var(--az-ink-2) 0%, transparent 100%)' }}>
                <div className="az-label" style={{ marginBottom: 8, letterSpacing: '0.4em' }}>TOTAL PORTFOLIO VALUATION</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                    <div className="az-hero-stat-value az-lime az-glow-lime" style={{ fontSize: 42 }}>
                        {curSymbol}{totalVal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                    <div className="az-label" style={{ fontSize: 12, opacity: 0.5 }}>{currency}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* [PILLAR 2] Sovereign Identity Profile */}
                    <SovereignIdentityCard handle="ceo@humanidfi.com" />

                    {/* Valuta Anchor */}
                    <div className="az-surface-2" style={{ padding: 16, borderLeft: '3px solid var(--az-lime)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <div className="az-label" style={{ fontSize: 10, color: 'var(--az-ink)' }}>GLOBAL ANCHOR</div>
                            <CurrencySwitcher />
                        </div>
                        <p style={{ fontSize: 9, color: 'var(--az-ink)', opacity: 0.4, lineHeight: 1.5, textTransform: 'uppercase', fontStyle: 'italic' }}>
                            All asset valuations across the terminal are translated in real-time to the selected valuta.
                        </p>
                    </div>

                    {/* Connected wallet info */}
                    <div className="az-surface-2" style={{ padding: 16 }}>
                        <div className="az-label" style={{ marginBottom: 8 }}>DIRECCIÓN ACTIVA</div>
                        <div className="az-value-sm" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, wordBreak: 'break-all', color: 'var(--az-lime)' }}>{address}</div>
                    </div>

                    {/* ETH Balance */}
                    {ethBalance && (
                        <div className="az-surface-2 az-accent-left" style={{ padding: 16 }}>
                            <div className="az-label" style={{ marginBottom: 8 }}>BALANCE NATIVO (ETH)</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                                <div className="az-hero-stat-value" style={{ color: 'var(--az-lime)' }}>{parseFloat(ethBalance.formatted).toFixed(4)}</div>
                                <div className="az-label">{ethBalance.symbol}</div>
                            </div>
                        </div>
                    )}

                    {/* Telegram Alerts */}
                    <TelegramSettings wallet={address || ''} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="az-surface-2" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: 16, borderBottom: '1px solid var(--az-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="az-label" style={{ fontSize: 11, color: 'var(--az-ink)' }}>ACTIVOS DETECTADOS</div>
                            <RefreshCw size={10} color="var(--az-ink-3)" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {tokens.map(t => (
                                <div key={t.s} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--az-border-2)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10`}>
                                            <span className="text-[10px] font-black">{t.s.slice(0, 1)}</span>
                                        </div>
                                        <div>
                                            <div className="az-value-sm" style={{ fontWeight: 700 }}>{t.s}</div>
                                            <div className="az-label" style={{ fontSize: 8, textTransform: 'none' }}>{t.n}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div className="az-value-sm">{curSymbol}{t.val.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                        <div className="az-label" style={{ fontSize: 8 }}>{t.b} {t.s}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ padding: 12, borderTop: '1px solid var(--az-border)', textAlign: 'center' }}>
                            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>
                                Datos consultados vía Web3 Provider + ForeX Index.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── MASTER DASHBOARD ─────────────────────────────────────────

export default function SovereignDashboard() {
    const { address, isConnected } = useAccount();
    const { tickerList, connected: wsConnected } = useRealTimeFeed();
    const [tab, setTab] = useState<Tab>('polymarket');
    const [clock, setClock] = useState(fmtTime());
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        const i = setInterval(() => setClock(fmtTime()), 1000);
        return () => clearInterval(i);
    }, []);

    const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
        { id: 'polymarket', label: 'MARKETS',  icon: <Globe size={12} /> },
        { id: 'defi',       label: 'EARN',       icon: <BarChart2 size={12} /> },
        { id: 'security',   label: 'SCANNER',   icon: <Shield size={12} /> },
        { id: 'portfolio',  label: 'PORTFOLIO',           icon: <Wallet size={12} /> },
    ];

    return (
        <div className="dash-root">
            {/* ─── SOVEREIGN HEADER ─── */}
            <header className="glass-aztek" style={{
                height: 48, borderBottom: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 24px', flexShrink: 0, zIndex: 'var(--z-header)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <span className="az-label">{clock}</span>
                </div>

                {/* LIVE TICKERS */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, justifyContent: 'center', overflow: 'hidden' }}>
                    {tickerList.map(t => (
                        <div key={t.symbol} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="az-label" style={{ fontSize: 8, opacity: 0.5 }}>{t.symbol}</span>
                            <span className="az-value-sm" style={{ fontSize: 10, fontFamily: 'var(--font-mono)' }}>
                                {t.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                            <span style={{ fontSize: 8, fontWeight: 800 }} className={t.changePct24h >= 0 ? 'az-emerald' : 'az-rose'}>
                                {t.changePct24h >= 0 ? '▲' : '▼'}{Math.abs(t.changePct24h).toFixed(1)}%
                            </span>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {isConnected ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Wallet size={11} color="var(--az-lime)" />
                            <span className="az-label-lime">{address?.slice(0,6)}…{address?.slice(-4)}</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="az-dot-error" />
                            <span className="az-label">SIN WALLET</span>
                        </div>
                    )}
                </div>
            </header>

            {/* ─── TAB NAV ─── */}
            <div className="az-tab-bar glass-aztek">
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} className={`az-tab${tab === t.id ? ' active' : ''}`}>
                        {t.icon}
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ─── CONTENT ─── */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <AnimatePresence mode="wait">
                    {tab === 'polymarket' && (
                        <motion.div key="pm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <PolymarketPanel />
                        </motion.div>
                    )}
                    {tab === 'defi' && (
                        <motion.div key="defi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <DeFiYieldPanel />
                        </motion.div>
                    )}
                    {tab === 'security' && (
                        <motion.div key="sec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <SecurityScanner />
                        </motion.div>
                    )}
                    {tab === 'portfolio' && (
                        <motion.div key="pf" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} style={{ flex: 1, overflowY: 'auto' }} className="az-scroll">
                            <PortfolioPanel />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* [PILLAR 3] Sovereign Messenger Floating UI */}
            <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
                <AnimatePresence>
                    {showChat && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9, rotate: -2 }}
                            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, y: 50, scale: 0.9, rotate: -2 }}
                            className="w-[380px] h-[550px] shadow-[0_32px_64px_rgba(0,0,0,0.8)] border border-[var(--aztec-orchid)]/20 rounded-[2.5rem] overflow-hidden bg-black"
                        >
                            <SovereignMessenger />
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowChat(!showChat)}
                    className={`relative w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all duration-500 z-10 ${showChat ? 'bg-[var(--aztec-orchid)] text-black rotate-90' : 'bg-black border border-white/10 text-[var(--aztec-orchid)]'}`}
                >
                    <MessageSquare size={24} />
                    {!showChat && (
                         <div className="absolute top-0 right-0 w-4 h-4 bg-[var(--aztec-orchid)] rounded-full border-4 border-black animate-ping" />
                    )}
                </motion.button>
            </div>
        </div>
    );
}
