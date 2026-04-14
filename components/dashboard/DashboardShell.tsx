"use client";

import React, { useState, lazy, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Wallet, Activity, Settings, QrCode, X,
    Plus, Cpu, Bot, Link as LinkIcon, ChevronRight, Circle,
    Zap, TrendingUp, TrendingDown, AlertTriangle, Terminal, RefreshCw, Home,
    Save, Search, Shield, BookOpen, GraduationCap, Link2, Globe,
    Database, Bell, CheckCircle2, AlertCircle, Lock, BarChart2, Newspaper,
    Star, Eye, ArrowUpRight, ArrowDownRight, Flame, Layers,
    Hash, Activity as ActivityIcon, Clock, Users, DollarSign, LifeBuoy
} from 'lucide-react';
import { SovereignBridge } from '@/components/premium/SovereignBridge';
import { WhaleLogo } from '../shared/WhaleLogo';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';
import { useAccount } from 'wagmi';
import { create } from 'zustand';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { toast } from 'sonner';

// ─── Color tokens ──────────────────────────────────────────────────────────────
const T = {
    bg:       '#0B0E11',
    surface:  'rgba(255,255,255,0.03)',
    border:   'rgba(255,255,255,0.07)',
    teal:     '#00F2EA',
    green:    '#00C076',
    gold:     '#D4AF37',
    red:      '#FF3B30',
    blue:     '#627EEA',
};

// ─── State ─────────────────────────────────────────────────────────────────────
interface Log { id: string; time: string; msg: string; type: 'info'|'success'|'warning'|'error'; }
interface DashboardState { logs: Log[]; addLog: (msg:string, type?:Log['type'])=>void; clearLogs:()=>void; }
const useDashboardStore = create<DashboardState>((set) => ({
    logs: [],
    addLog: (msg, type='info') => set((s) => ({
        logs: [{ id: Math.random().toString(36).slice(7), time: new Date().toLocaleTimeString(), msg, type }, ...s.logs].slice(0,50)
    })),
    clearLogs: () => set({ logs: [] }),
}));

// ─── Lazy Panels ───────────────────────────────────────────────────────────────
const SovereignIntelTab  = lazy(() => import('./SovereignIntelTab'));
const OmniExplorer       = lazy(() => import('./OmniExplorer').then(m=>({default:m.OmniExplorer})));
const GoldTicketPanel    = lazy(() => import('./GoldTicketPanel').then(m=>({default:m.GoldTicketPanel})));
const WhaleAcademy       = lazy(() => import('./WhaleAcademy').then(m=>({default:m.WhaleAcademy})));
const SecurityScanner    = lazy(() => import('./SecurityScanner'));
const WhaleSupport       = lazy(() => import('./WhaleSupport').then(m=>({default:m.WhaleSupport})));
const BitcoinPrimitives  = lazy(() => import('./BitcoinPrimitives'));
const ConnectExchange    = lazy(() => import('./ConnectExchange'));
const NewPairsTable      = lazy(() => import('./NewPairsTable').then(m=>({default:m.NewPairsTable})));
const GainersLosersPanel = lazy(() => import('./GainersLosersPanel').then(m=>({default:m.GainersLosersPanel})));
const PortfolioDashboard = lazy(() => import('./PortfolioDashboard'));
const ApiTerminal        = lazy(() => import('./ApiTerminal').then(m=>({default:m.ApiTerminal})));
const AkashicLedger      = lazy(() => import('./AkashicLedger'));
const MassTransferIntel  = lazy(() => import('./MassTransferIntel'));

// ─── Tab type ──────────────────────────────────────────────────────────────────
type DashboardTab =
    | 'dashboard' | 'watchlist' | 'alerts' | 'live-txs' | 'multicharts'
    | 'new-pairs' | 'gainers-losers' | 'whale-tracker' | 'market-news'
    | 'api' | 'security' | 'visual-graph' | 'vault' | 'block-explorer'
    | 'portfolio' | 'academy' | 'bitcoin-net' | 'support' | 'exchange' | 'premium' | 'library';

// ─── Sidebar nav data ──────────────────────────────────────────────────────────
const NAV_GROUPS = [
    {
        label: 'Platform Core',
        items: [
            { id: 'dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'watchlist',     icon: Star,             label: 'Watchlist' },
            { id: 'alerts',        icon: Bell,             label: 'Alerts' },
            { id: 'live-txs',      icon: ActivityIcon,     label: 'Live Transactions' },
            { id: 'multicharts',   icon: BarChart2,        label: 'Multicharts' },
            { id: 'new-pairs',     icon: Plus,             label: 'New Pairs' },
            { id: 'gainers-losers',icon: TrendingUp,       label: 'Gainers & Losers' },
        ],
    },
    {
        label: 'Analysis',
        items: [
            { id: 'whale-tracker', icon: Globe,     label: 'Whale Tracker' },
            { id: 'market-news',   icon: Newspaper, label: 'Market News' },
            { id: 'api',           icon: Terminal,  label: 'API Access' },
            { id: 'security',      icon: Shield,    label: 'Security Center' },
            { id: 'visual-graph',  icon: Layers,    label: 'Visual Graph' },
        ],
    },
    {
        label: 'Secure Vault',
        items: [
            { id: 'vault',         icon: Database, label: 'Secure Vault' },
            { id: 'block-explorer',icon: Hash,     label: 'Block Explorer' },
            { id: 'portfolio',     icon: Wallet,   label: 'My Portfolio' },
        ],
    },
    {
        label: 'Premium',
        items: [
            { id: 'premium', icon: Zap, label: 'Premium Pass', gold: true },
        ],
    },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function TabLoader() {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0B0E11]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-[#00F2EA] animate-spin" />
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
                    Loading Module...
                </p>
            </div>
        </div>
    );
}

function NavItem({ item, active, onClick }: { item: any; active: boolean; onClick: ()=>void }) {
    const Icon = item.icon;
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[11px] font-bold transition-all duration-150 uppercase tracking-widest group"
            style={{
                background: active ? 'rgba(0,242,234,0.09)' : 'transparent',
                color: active ? '#FFFFFF' : 'rgba(255,255,255,0.35)',
                border: active ? '1px solid rgba(0,242,234,0.18)' : '1px solid transparent',
            }}
            onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
            <Icon
                size={14}
                style={{ color: active ? T.teal : item.gold ? T.gold : 'rgba(255,255,255,0.35)', flexShrink: 0 }}
            />
            <span className="truncate" style={item.gold ? { color: T.gold } : {}}>{item.label}</span>
            {active && <ChevronRight size={11} className="ml-auto shrink-0" style={{ color: T.teal, opacity: 0.6 }} />}
        </button>
    );
}

function CategoryLabel({ label }: { label: string }) {
    return (
        <div className="px-3 pt-5 pb-1.5 text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.18)' }}>
            {label}
        </div>
    );
}

// ─── Stat Card ─
function StatCard({ label, value, change, icon: Icon, color = T.teal }: any) {
    const pos = !change || change >= 0;
    return (
        <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</span>
                <Icon size={14} style={{ color, opacity: 0.7 }} />
            </div>
            <div className="font-black font-mono text-2xl text-white tracking-tighter">{value}</div>
            {change !== undefined && (
                <div className="flex items-center gap-1 text-[11px] font-bold" style={{ color: pos ? T.green : T.red }}>
                    {pos ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
                    {Math.abs(change)}% <span style={{ color: 'rgba(255,255,255,0.25)' }}>24h</span>
                </div>
            )}
        </div>
    );
}

// ─── INLINE TABS ───────────────────────────────────────────────────────────────

function DashboardOverview() {
    const stats = [
        { label: 'Total Volume', value: '$4.2B', change: 3.2, icon: DollarSign, color: T.teal },
        { label: 'Active Wallets', value: '847K', change: 1.8, icon: Users, color: T.blue },
        { label: 'Whale Alerts', value: '142', change: -5.1, icon: AlertTriangle, color: T.gold },
        { label: 'Avg Gas', value: '28 gwei', change: -12.4, icon: Zap, color: T.green },
    ];
    const feed = [
        { time: '08:31', msg: '14,200 ETH transferred · Kraken → Unknown', type: 'alert' },
        { time: '08:29', msg: 'New pair PEPE/USDC detected on Uniswap v3', type: 'info' },
        { time: '08:24', msg: 'BTC mempool cleared — next block estimated 6s', type: 'success' },
        { time: '08:18', msg: 'Liquidation: $2.1M WBTC on Aave v3', type: 'warning' },
        { time: '08:11', msg: '500K USDC bridge: Arbitrum → Ethereum', type: 'info' },
    ];
    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-1">Dashboard</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Institutional intelligence overview</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map(s => <StatCard key={s.label} {...s} />)}
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                <div className="px-5 py-3 border-b" style={{ borderColor: T.border }}>
                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Live Intelligence Feed</span>
                </div>
                <div className="divide-y" style={{ borderColor: T.border }}>
                    {feed.map((f, i) => (
                        <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                            <span className="font-mono text-[10px] shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>{f.time}</span>
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{
                                background: f.type==='alert'? T.red : f.type==='success'? T.green : f.type==='warning'? T.gold : T.teal
                            }} />
                            <span className="text-[11px] font-medium text-white/70 leading-tight">{f.msg}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function WatchlistPanel() {
    const items = [
        { sym: 'ETH',  name: 'Ethereum',   price: '$3,284.50', change: 2.4,  vol: '$18.2B' },
        { sym: 'BTC',  name: 'Bitcoin',     price: '$68,412.00',change: 1.1,  vol: '$34.8B' },
        { sym: 'SOL',  name: 'Solana',      price: '$182.33',   change: -3.2, vol: '$4.1B'  },
        { sym: 'ARB',  name: 'Arbitrum',    price: '$1.24',     change: 5.7,  vol: '$820M'  },
        { sym: 'MATIC',name: 'Polygon',     price: '$0.98',     change: -1.8, vol: '$640M'  },
        { sym: 'LINK', name: 'Chainlink',   price: '$17.44',    change: 3.9,  vol: '$390M'  },
    ];
    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-1">Watchlist</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Tracked assets · Real-time</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-[10px] font-black uppercase tracking-widest text-white transition-all"
                    style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                    <Plus size={12}/> Add Asset
                </button>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
                <div className="grid grid-cols-4 px-5 py-3 text-[9px] font-black uppercase tracking-widest border-b" style={{ color: 'rgba(255,255,255,0.2)', borderColor: T.border, background: T.surface }}>
                    <span>Asset</span><span className="text-right">Price</span><span className="text-right">24H</span><span className="text-right">Volume</span>
                </div>
                {items.map((item, i) => {
                    const pos = item.change >= 0;
                    return (
                        <div key={i} className="grid grid-cols-4 px-5 py-4 items-center border-b hover:bg-white/[0.03] transition-colors cursor-pointer" style={{ borderColor: T.border }}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black" style={{ background: `${T.teal}18`, color: T.teal, border: `1px solid ${T.teal}30` }}>{item.sym.slice(0,3)}</div>
                                <div>
                                    <div className="font-black text-white text-sm">{item.sym}</div>
                                    <div className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{item.name}</div>
                                </div>
                            </div>
                            <div className="text-right font-mono font-black text-white text-sm">{item.price}</div>
                            <div className={`text-right font-black text-sm flex items-center justify-end gap-1`} style={{ color: pos ? T.green : T.red }}>
                                {pos ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
                                {Math.abs(item.change)}%
                            </div>
                            <div className="text-right font-mono text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.vol}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function AlertsPanel() {
    const { logs } = useDashboardStore();
    const alerts = [
        { time: 'Just now', title: 'MEV Protection Active', desc: 'Secure RPC routing enabled. No front-running detected.', type: 'success' },
        { time: '2m ago',   title: 'Whale Detected',        desc: '14,000 ETH transferred to Binance cold wallet.', type: 'alert' },
        { time: '15m ago',  title: 'Network Congestion',    desc: 'Gas fees elevated. Current: 45 gwei. Threshold: 30.', type: 'warning' },
        { time: '1h ago',   title: 'New Token Launch',      desc: 'PYUSD/USDC pair with $12M initial liquidity detected.', type: 'info' },
        { time: '2h ago',   title: 'Flash Loan Event',      desc: '$8.4M flash loan executed via Aave v3 on Arbitrum.', type: 'alert' },
    ];
    const colors: Record<string, string> = { success: T.green, alert: T.red, warning: T.gold, info: T.teal };
    return (
        <div className="p-6 space-y-4">
            <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-1">Alerts</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Event telemetry · Live infrastructure audit</p>
            </div>
            <div className="space-y-2">
                {alerts.map((a, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i*0.05 }}
                        className="flex items-start gap-4 p-4 rounded-2xl" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 animate-pulse" style={{ background: colors[a.type] }} />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="font-black text-white text-[12px] uppercase tracking-tight">{a.title}</span>
                                <span className="text-[9px] font-mono shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>{a.time}</span>
                            </div>
                            <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{a.desc}</p>
                        </div>
                        <div className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shrink-0"
                            style={{ background: `${colors[a.type]}18`, color: colors[a.type], border: `1px solid ${colors[a.type]}30` }}>
                            {a.type}
                        </div>
                    </motion.div>
                ))}
                {logs.map(log => (
                    <div key={log.id} className="flex gap-4 p-4 rounded-2xl" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        <span className="text-[10px] font-bold shrink-0 w-20 font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>{log.time}</span>
                        <span className="text-[11px] font-bold text-white/60 leading-relaxed">{log.msg}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function LiveTransactionsPanel() {
    const txs = [
        { hash: '0x4a2f...d91e', from: '0xd8dA...6045', to: '0xBit...cold', value: '14,200 ETH', usd: '$46.6M', chain: 'ETH', time: '2s ago', type: 'TRANSFER' },
        { hash: '0x9c1b...a3f7', from: '0xUni...pool', to: '0xB0b...1234', value: '500K USDC',  usd: '$500K',  chain: 'ARB', time: '5s ago', type: 'SWAP' },
        { hash: '0x2e8a...7c0d', from: '0xAav...e3',   to: '0x0000', value: '120 WBTC',   usd: '$8.2M',  chain: 'ETH', time: '8s ago', type: 'LIQUIDATION' },
        { hash: '0x7f3c...1a2b', from: '0xMak...er',   to: '0xD4i...fin', value: '2.4M DAI',   usd: '$2.4M',  chain: 'ETH', time: '11s ago', type: 'BRIDGE' },
        { hash: '0x1d9e...4b5c', from: '0xBin...ance', to: '0xCo...ld1', value: '8,400 ETH',  usd: '$27.6M', chain: 'ETH', time: '14s ago', type: 'TRANSFER' },
    ];
    const typeColor: Record<string,string> = { TRANSFER: T.teal, SWAP: T.blue, LIQUIDATION: T.red, BRIDGE: T.gold };
    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-1">Live Transactions</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Mempool capture · Sub-15ms latency</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest" style={{ background: `${T.green}15`, color: T.green, border: `1px solid ${T.green}30` }}>
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.green }} /> Live
                </div>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
                <div className="grid grid-cols-5 px-5 py-3 text-[9px] font-black uppercase tracking-widest border-b" style={{ color: 'rgba(255,255,255,0.2)', borderColor: T.border, background: T.surface }}>
                    <span>Hash</span><span>From → To</span><span className="text-right">Value</span><span className="text-right">Type</span><span className="text-right">Time</span>
                </div>
                {txs.map((tx, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i*0.07 }}
                        className="grid grid-cols-5 px-5 py-4 items-center border-b hover:bg-white/[0.03] cursor-pointer transition-colors" style={{ borderColor: T.border }}>
                        <span className="font-mono text-[11px]" style={{ color: T.teal }}>{tx.hash}</span>
                        <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{tx.from.slice(0,8)} → {tx.to.slice(0,8)}</span>
                        <div className="text-right">
                            <div className="font-black text-white text-sm">{tx.value}</div>
                            <div className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>{tx.usd}</div>
                        </div>
                        <div className="text-right">
                            <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest"
                                style={{ background: `${typeColor[tx.type]}18`, color: typeColor[tx.type], border: `1px solid ${typeColor[tx.type]}30` }}>
                                {tx.type}
                            </span>
                        </div>
                        <div className="text-right font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{tx.time}</div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function MultichartsPanel() {
    const pairs = ['ETH/USDT','BTC/USDT','SOL/USDT','ARB/USDT'];
    return (
        <div className="p-6 space-y-4">
            <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-1">Multicharts</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Multi-pair analysis · Real-time candlesticks</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {pairs.map((pair, i) => {
                    const bars = Array.from({length: 24}, (_, j) => ({ h: 30 + Math.random()*60, pos: Math.random()>0.45 }));
                    return (
                        <div key={pair} className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: T.border }}>
                                <span className="font-black text-white text-sm uppercase">{pair}</span>
                                <span className="text-[10px] font-bold" style={{ color: T.green }}>+{(1+Math.random()*5).toFixed(2)}%</span>
                            </div>
                            <div className="p-4 flex items-end gap-0.5 h-28">
                                {bars.map((b, j) => (
                                    <div key={j} className="flex-1 rounded-sm transition-all" style={{ height: `${b.h}%`, background: b.pos ? `${T.green}90` : `${T.red}90` }} />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function MarketNewsPanel() {
    const news = [
        { time: '08:30', tag: 'Macro',   headline: 'Fed signals potential rate cut in Q3 2025 — Crypto markets rally on dovish tone', impact: 'bullish' },
        { time: '08:15', tag: 'DeFi',    headline: 'Uniswap v4 launches hooks architecture — $2.1B TVL migrating in 48 hours', impact: 'bullish' },
        { time: '07:55', tag: 'Whale',   headline: '14,000 ETH moved from unknown wallet to Binance — possible distribution signal', impact: 'bearish' },
        { time: '07:40', tag: 'L2',      headline: 'Arbitrum sequencer downtime resolved after 12-minute outage — no funds lost', impact: 'neutral' },
        { time: '07:20', tag: 'Solana',  headline: 'Solana validators vote on SIMD-0228 — validator rewards overhaul incoming', impact: 'bullish' },
        { time: '06:50', tag: 'Macro',   headline: 'BlackRock ETH ETF records largest single-day inflow: $480M', impact: 'bullish' },
    ];
    const impactColor: Record<string,string> = { bullish: T.green, bearish: T.red, neutral: 'rgba(255,255,255,0.3)' };
    return (
        <div className="p-6 space-y-4">
            <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-1">Market News</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Institutional intelligence · Curated feed</p>
            </div>
            <div className="space-y-2">
                {news.map((n, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.06 }}
                        className="flex gap-4 p-4 rounded-2xl cursor-pointer hover:bg-white/[0.03] transition-colors" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        <div className="flex flex-col gap-2 shrink-0 items-end w-14">
                            <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{n.time}</span>
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase" style={{ background: `${T.teal}15`, color: T.teal }}>{n.tag}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-white leading-snug">{n.headline}</p>
                        </div>
                        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: impactColor[n.impact] }} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function VisualGraphPanel() {
    return (
        <div className="p-6 space-y-4">
            <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-1">Visual Graph</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>On-chain topology · Wallet relationship mapping</p>
            </div>
            <div className="rounded-3xl flex flex-col items-center justify-center py-24 gap-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                {/* Mini decorative graph */}
                <svg width="240" height="140" viewBox="0 0 240 140" className="opacity-60">
                    <circle cx="120" cy="70" r="20" fill={`${T.teal}30`} stroke={T.teal} strokeWidth="1.5"/>
                    <circle cx="40"  cy="40" r="14" fill={`${T.blue}30`} stroke={T.blue} strokeWidth="1.5"/>
                    <circle cx="200" cy="40" r="14" fill={`${T.gold}30`} stroke={T.gold} strokeWidth="1.5"/>
                    <circle cx="60"  cy="110"r="12" fill={`${T.green}30`}stroke={T.green}strokeWidth="1.5"/>
                    <circle cx="180" cy="110"r="12" fill={`${T.red}30`}  stroke={T.red}  strokeWidth="1.5"/>
                    <line x1="120" y1="70" x2="40"  y2="40"  stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                    <line x1="120" y1="70" x2="200" y2="40"  stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                    <line x1="120" y1="70" x2="60"  y2="110" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                    <line x1="120" y1="70" x2="180" y2="110" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                </svg>
                <div className="text-center space-y-2">
                    <p className="font-black text-white uppercase tracking-widest text-sm">Graph Engine Ready</p>
                    <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Connect a wallet to map on-chain topology and trace capital flows.</p>
                </div>
                <button className="px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] text-white transition-all hover:scale-105"
                    style={{ background: `${T.teal}20`, border: `1px solid ${T.teal}40`, color: T.teal }}>
                    Initialize Graph
                </button>
            </div>
        </div>
    );
}

function AcademyPanel() {
    const courses = [
        { level: '01', title: 'DeFi Fundamentals',      desc: 'AMMs, liquidity pools, impermanent loss, and yield strategies.',      tag: 'Beginner' },
        { level: '02', title: 'Mempool Intelligence',   desc: 'How to read pending transactions, MEV, and gas optimization.',         tag: 'Intermediate' },
        { level: '03', title: 'Whale Tracking Methods', desc: 'Identifying large wallets, tracing capital, and reading on-chain signals.', tag: 'Advanced' },
        { level: '04', title: 'Smart Contract Auditing',desc: 'Vulnerability classes, static analysis, and formal verification.',     tag: 'Expert' },
    ];
    return (
        <div className="p-6 space-y-4">
            <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-1">Academy</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Institutional-grade education · On-chain mastery</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-3">
                {courses.map((c) => (
                    <div key={c.level} className="p-5 rounded-2xl hover:scale-[1.01] transition-all cursor-pointer" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        <div className="flex items-center justify-between mb-3">
                            <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest"
                                style={{ background: T.surface, color: T.teal, border: `1px solid ${T.teal}30` }}>
                                LVL {c.level}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>{c.tag}</span>
                        </div>
                        <h3 className="font-black text-white text-[14px] uppercase tracking-tight mb-2">{c.title}</h3>
                        <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{c.desc}</p>
                        <div className="mt-4 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest" style={{ color: T.teal }}>
                            Start Module <ArrowUpRight size={11}/>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── NodeData type ──
interface NodeData { id:string; type:'wallet'|'bot'|'contract'|'api'; x:number; y:number; title:string; status:'active'|'syncing'|'error'; latency:number; data?:any; }

// ─── Tab router ────────────────────────────────────────────────────────────────
function renderTabContent(tab: DashboardTab) {
    switch(tab) {
        case 'dashboard':     return <DashboardOverview />;
        case 'watchlist':     return <WatchlistPanel />;
        case 'alerts':        return <AlertsPanel />;
        case 'live-txs':      return <LiveTransactionsPanel />;
        case 'multicharts':   return <MultichartsPanel />;
        case 'new-pairs':     return <NewPairsTable />;
        case 'gainers-losers':return <GainersLosersPanel />;
        case 'whale-tracker': return <SovereignIntelTab />;
        case 'market-news':   return <MarketNewsPanel />;
        case 'api':           return <ApiTerminal />;
        case 'security':      return <SecurityScanner />;
        case 'visual-graph':  return <VisualGraphPanel />;
        case 'vault':         return <AkashicLedger />;
        case 'block-explorer':return <OmniExplorer />;
        case 'portfolio':     return <PortfolioDashboard />;
        case 'academy':       return <WhaleAcademy />;
        case 'library':       return <WhaleAcademy />; // Library content handled within Academy framework
        case 'bitcoin-net':   return <BitcoinPrimitives />;
        case 'support':       return <WhaleSupport />;
        case 'exchange':      return <ConnectExchange />;
        case 'premium':       return <GoldTicketPanel />;
        default:
            return (
                <div className="p-12 text-center text-white/20 uppercase font-black text-[10px] tracking-widest">
                    Module Not Found
                </div>
            );
    }
}

const TAB_LABELS: Record<DashboardTab, string> = {
    'dashboard':'Dashboard','watchlist':'Watchlist','alerts':'Alerts','live-txs':'Live Transactions',
    'multicharts':'Multicharts','new-pairs':'New Pairs','gainers-losers':'Gainers & Losers',
    'whale-tracker':'Whale Tracker','market-news':'Market News','api':'API Access',
    'security':'Security Center','visual-graph':'Visual Graph','vault':'Secure Vault',
    'block-explorer':'Block Explorer','portfolio':'My Portfolio','academy':'Academy',
    'bitcoin-net':'Bitcoin Network','support':'Support Hub','exchange':'Connect Exchange','premium':'Premium Pass',
    'library': 'The Library'
};

// ─── Main Shell ────────────────────────────────────────────────────────────────
export function DashboardShell() {
    const [tab, setTabRaw]  = useState<DashboardTab>('dashboard');
    const [bridgeOpen, setBridgeOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isIdle, setIsIdle]   = useState(false);
    const [lastActivity, setLastActivity] = useState(Date.now());

    const notifications = [
        { id: 1, title: 'MEV Protection Active', desc: 'Secure RPC routing enabled.', time: 'Just now', type: 'success' },
        { id: 2, title: 'Whale Detected', desc: '14,000 ETH transferred to Binance.', time: '2m ago', type: 'alert' },
        { id: 3, title: 'Network Congestion', desc: 'Gas fees are currently high (45 gwei).', time: '15m ago', type: 'warning' },
    ];

    useEffect(() => {
        const saved = localStorage.getItem('dsv_tab') as DashboardTab;
        if (saved) setTabRaw(saved);

        const kmap: Record<string, DashboardTab> = {
            '1':'dashboard','2':'alerts','3':'whale-tracker','4':'portfolio','5':'vault'
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            if (kmap[e.key] && document.activeElement?.tagName !== 'INPUT') setTabRaw(kmap[e.key]);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const setTab = (t: DashboardTab) => { setTabRaw(t); localStorage.setItem('dsv_tab', t); };

    useEffect(() => {
        const reset = () => setLastActivity(Date.now());
        ['mousemove','keydown','scroll','click'].forEach(e => window.addEventListener(e, reset));
        const iv = setInterval(() => { if (Date.now()-lastActivity > 600_000) setIsIdle(true); }, 10_000);
        return () => {
            ['mousemove','keydown','scroll','click'].forEach(e => window.removeEventListener(e, reset));
            clearInterval(iv);
        };
    }, [lastActivity]);

    return (
        <div
            data-dashboard="true"
            style={{ position:'fixed', inset:0, zIndex:100, width:'100vw', height:'100vh', overflow:'hidden', backgroundColor: T.bg }}
        >
            {/* Subtle grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
                style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 60px)' }} />

            {/* Command Palette */}
            <CommandPalette onNavigate={(t) => setTab(t as DashboardTab)} onBridgeOpen={() => setBridgeOpen(true)} />
            <WelcomeModal />

            {/* Idle overlay */}
            <AnimatePresence>
                {isIdle && (
                    <motion.div
                        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                        className="absolute inset-0 z-[999] flex flex-col items-center justify-center text-center"
                        style={{ background:'rgba(11,14,17,0.92)', backdropFilter:'blur(30px)' }}
                    >
                        <Lock size={56} className="mb-6" style={{ color:'rgba(255,255,255,0.6)', strokeWidth:1 }}/>
                        <h2 className="text-3xl font-black text-white uppercase tracking-[0.2em] mb-3">Session Locked</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-8" style={{ color:'rgba(255,255,255,0.3)' }}>
                            Zero-Trust protocol — 10 min inactivity
                        </p>
                        <button
                            onClick={() => { setIsIdle(false); setLastActivity(Date.now()); }}
                            className="px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] text-black transition-all hover:scale-105 shadow-2xl"
                            style={{ background:'#fff', boxShadow:'0 20px 60px rgba(255,255,255,0.1)' }}
                        >
                            <Shield size={14} className="inline mr-2"/> Unlock Terminal
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main UI */}
            <div className={`relative z-10 flex w-full h-full overflow-hidden transition-all duration-500 ${isIdle ? 'scale-[0.98] opacity-10 pointer-events-none' : ''}`}>

                {/* ── SIDEBAR ── */}
                <aside className="w-[220px] shrink-0 flex flex-col overflow-hidden" style={{ borderRight:`1px solid ${T.border}`, background:'rgba(13,16,20,0.95)', backdropFilter:'blur(20px)' }}>

                    {/* Brand */}
                    <div className="px-5 py-5 flex items-center gap-3" style={{ borderBottom:`1px solid ${T.border}` }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background:'#050505', border:`1px solid rgba(255,255,255,0.08)` }}>
                            <WhaleLogo className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                            <div className="font-black text-white text-[13px] uppercase tracking-tight leading-none truncate">Whale Alert</div>
                            <div className="text-[8px] font-black uppercase tracking-[0.3em] mt-1" style={{ color:'rgba(255,255,255,0.2)' }}>Network v4.0</div>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5 scrollbar-hide">
                        {NAV_GROUPS.map(group => (
                            <div key={group.label}>
                                <CategoryLabel label={group.label} />
                                {group.items.map(item => (
                                    <NavItem
                                        key={item.id}
                                        item={item}
                                        active={tab === item.id}
                                        onClick={() => setTab(item.id as DashboardTab)}
                                    />
                                ))}
                            </div>
                        ))}
                    </nav>

                    {/* Bridge */}
                    <div className="p-3" style={{ borderTop:`1px solid ${T.border}` }}>
                        <button
                            onClick={() => setBridgeOpen(!bridgeOpen)}
                            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-white/[0.05]"
                            style={{ background:'rgba(255,255,255,0.03)', color:'rgba(255,255,255,0.3)', border:`1px solid ${T.border}` }}
                        >
                            Device Bridge
                            <QrCode size={13} style={{ color:'rgba(255,255,255,0.2)' }}/>
                        </button>
                    </div>
                </aside>

                {/* ── CONTENT ── */}
                <main className="flex-1 flex flex-col min-w-0" style={{ background:'transparent' }}>

                    {/* Top bar */}
                    <header className="h-13 shrink-0 flex items-center justify-between px-6 py-3" style={{ borderBottom:`1px solid ${T.border}`, background:'rgba(11,14,17,0.7)', backdropFilter:'blur(16px)' }}>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color:'rgba(255,255,255,0.2)' }}>
                                Module //
                            </span>
                            <span className="font-black text-white uppercase tracking-tight text-[12px]">
                                {TAB_LABELS[tab] ?? tab}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Status */}
                            <div className="hidden md:flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest" style={{ color: T.green }}>
                                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.green }}/>
                                System Nominal
                            </div>
                            <div className="h-4 w-px" style={{ background: T.border }}/>

                            {/* Notifications */}
                            <div className="relative">
                                <button onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-2 rounded-xl hover:bg-white/[0.06] transition-all"
                                    style={{ color:'rgba(255,255,255,0.4)' }}>
                                    <Bell size={16}/>
                                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: T.teal, boxShadow:`0 0 6px ${T.teal}` }}/>
                                </button>
                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div
                                            initial={{ opacity:0, y:8, scale:0.96 }}
                                            animate={{ opacity:1, y:0, scale:1 }}
                                            exit={{ opacity:0, y:8, scale:0.96 }}
                                            className="absolute top-full right-0 mt-2 w-80 rounded-2xl overflow-hidden shadow-2xl z-50"
                                            style={{ background:'#161A1E', border:`1px solid ${T.border}`, boxShadow:'0 25px 60px rgba(0,0,0,0.5)' }}
                                        >
                                            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom:`1px solid ${T.border}` }}>
                                                <h4 className="text-[11px] font-black uppercase tracking-widest text-white">Notifications</h4>
                                                <button onClick={() => setShowNotifications(false)} style={{ color:'rgba(255,255,255,0.3)' }}><X size={14}/></button>
                                            </div>
                                            <div className="max-h-64 overflow-y-auto">
                                                {notifications.map(n => {
                                                    const c = n.type==='success'?T.green:n.type==='alert'?T.red:T.gold;
                                                    return (
                                                        <div key={n.id} className="flex gap-3 px-5 py-4 hover:bg-white/[0.03] cursor-pointer transition-colors" style={{ borderBottom:`1px solid ${T.border}` }}>
                                                            <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background:c }}/>
                                                            <div>
                                                                <div className="text-[11px] font-black text-white mb-0.5">{n.title}</div>
                                                                <div className="text-[10px]" style={{ color:'rgba(255,255,255,0.4)' }}>{n.desc}</div>
                                                                <div className="text-[9px] font-black uppercase tracking-widest mt-1" style={{ color:'rgba(255,255,255,0.2)' }}>{n.time}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="px-5 py-3 text-center text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-white/[0.03] transition-colors" style={{ color:'rgba(255,255,255,0.3)', borderTop:`1px solid ${T.border}` }}>
                                                Mark all as read
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Whale logo badge */}
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6"><WhaleLogo className="w-full h-full"/></div>
                                <span className="text-[9px] font-black uppercase tracking-widest hidden lg:block" style={{ color:'rgba(255,255,255,0.2)' }}>
                                    Institutional v4.0
                                </span>
                            </div>
                        </div>
                    </header>

                    {/* Tab content */}
                    <div className="flex-1 overflow-y-auto relative bg-[#0B0E11] scrollbar-hide">
                        <Suspense fallback={<TabLoader/>}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={tab}
                                    initial={{ opacity:0, y:6 }}
                                    animate={{ opacity:1, y:0 }}
                                    exit={{ opacity:0, y:-6 }}
                                    transition={{ duration:0.18, ease:'easeOut' }}
                                >
                                    {renderTabContent(tab)}
                                </motion.div>
                            </AnimatePresence>
                        </Suspense>
                    </div>
                </main>
            </div>

            {/* Bridge drawer */}
            <AnimatePresence>
                {bridgeOpen && (
                    <motion.aside
                        initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
                        transition={{ type:'spring', damping:28, stiffness:220 }}
                        className="absolute right-0 top-0 h-full w-80 z-50 flex flex-col"
                        style={{ background:'rgba(13,16,20,0.97)', backdropFilter:'blur(40px)', borderLeft:`1px solid ${T.border}` }}
                    >
                        <div className="p-5 flex items-center justify-between" style={{ borderBottom:`1px solid ${T.border}` }}>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Physical Bridge</span>
                            <button onClick={() => setBridgeOpen(false)} className="p-1.5 rounded-lg hover:bg-white/[0.08] transition-all" style={{ color:'rgba(255,255,255,0.4)' }}>
                                <X size={16}/>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
                            <SovereignBridge />
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </div>
    );
}
