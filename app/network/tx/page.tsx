"use client";

import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, ArrowRight, RefreshCw, CheckCircle, Clock, AlertCircle,
    X, ExternalLink, Copy, CheckCheck, ChevronUp, Zap, Trophy, Shield,
    Cpu, Database, Hash, Wallet, BarChart2, Layers, Wind, TrendingUp,
    TrendingDown, ArrowRightLeft, Crown, Medal, Award
} from 'lucide-react';
import { useState, useCallback, useMemo } from 'react';
import { NetworkTabs } from '@/components/network/NetworkTabs';
import { safeToFixed } from '@/lib/utils/number-format';
import { UniversalEliteWallpaper } from '@/components/shared/UniversalEliteWallpaper';
import { formatDistanceToNow } from 'date-fns';

// ─── Types ───────────────────────────────────────────────────────────────────
interface MempoolTx {
    txid: string;
    fee: number;
    vsize: number;
    value: number;
    time: number;
    status?: { confirmed: boolean; block_height?: number; block_time?: number };
    weight?: number;
    locktime?: number;
    version?: number;
    vin?: { txid: string; vout: number; prevout?: { value: number; scriptpubkey_address?: string } }[];
    vout?: { value: number; scriptpubkey_address?: string; scriptpubkey_type?: string }[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const BTC_PRICE_USD = 104000;
const satsToBtc = (sats: number) => sats / 1e8;
const btcToUsd = (btc: number) => btc * BTC_PRICE_USD;
const formatUsd = (usd: number) => {
    if (usd >= 1e9) return `$${(usd / 1e9).toFixed(2)}B`;
    if (usd >= 1e6) return `$${(usd / 1e6).toFixed(2)}M`;
    if (usd >= 1e3) return `$${(usd / 1e3).toFixed(0)}K`;
    return `$${usd.toFixed(2)}`;
};
const formatBtc = (btc: number) => `${btc < 0.001 ? btc.toFixed(6) : btc < 1 ? btc.toFixed(4) : btc.toFixed(2)} BTC`;
const timeAgo = (ts?: number) => {
    if (!ts) return 'Just now';
    try {
        const d = new Date(ts * 1000);
        if (isNaN(d.getTime())) return '—';
        return formatDistanceToNow(d, { addSuffix: true });
    } catch { return '—'; }
};

const WHALE_TIERS = [
    { label: 'OMEGA', min: 100,  color: '#ff4ecd', icon: '⚡', glow: 'rgba(255,78,205,0.4)' },
    { label: 'ALPHA', min: 50,   color: '#00ff9d', icon: '🐳', glow: 'rgba(0,255,157,0.3)' },
    { label: 'BETA',  min: 10,   color: '#6366f1', icon: '🐋', glow: 'rgba(99,102,241,0.3)' },
    { label: 'GAMMA', min: 1,    color: '#f59e0b', icon: '🦈', glow: 'rgba(245,158,11,0.2)' },
];

function getWhaleTier(btc: number) {
    return WHALE_TIERS.find(t => btc >= t.min) || null;
}

function classifyTxType(tx: MempoolTx): { label: string; color: string; icon: React.ReactNode } {
    const btc = satsToBtc(tx.value);
    const feeRate = tx.vsize > 0 ? tx.fee / tx.vsize : 0;
    if (feeRate > 100) return { label: 'HIGH PRIORITY', color: '#f59e0b', icon: <Zap size={10} /> };
    if (btc >= 100)    return { label: 'MEGA WHALE', color: '#ff4ecd', icon: <Crown size={10} /> };
    if (btc >= 10)     return { label: 'WHALE', color: '#00ff9d', icon: <TrendingUp size={10} /> };
    if (btc >= 1)      return { label: 'SHARK', color: '#6366f1', icon: <Wind size={10} /> };
    return { label: 'STANDARD', color: '#94a3b8', icon: <ArrowRightLeft size={10} /> };
}

// ─── Weekly Leaderboard (persisted in sessionStorage, resets every Sunday 00:00 UTC) ─
function getWeekKey() {
    const now = new Date();
    const weekNo = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000));
    return `whale_leaderboard_${weekNo}`;
}

function buildWeeklyLeaderboard(txs: MempoolTx[]) {
    const key = getWeekKey();
    let stored: Record<string, { txids: string[]; totalBtc: number; topTx: string }> = {};
    try { stored = JSON.parse(sessionStorage.getItem(key) || '{}'); } catch {}

    for (const tx of txs) {
        const btc = satsToBtc(tx.value);
        if (btc < 1) continue;
        const addr = tx.vout?.[0]?.scriptpubkey_address || tx.txid.slice(0, 20);
        if (!stored[addr]) stored[addr] = { txids: [], totalBtc: 0, topTx: tx.txid };
        if (!stored[addr].txids.includes(tx.txid)) {
            stored[addr].txids.push(tx.txid);
            stored[addr].totalBtc += btc;
            if (btc > satsToBtc(txs.find(t => t.txid === stored[addr].topTx)?.value || 0)) {
                stored[addr].topTx = tx.txid;
            }
        }
    }
    try { sessionStorage.setItem(key, JSON.stringify(stored)); } catch {}

    return Object.entries(stored)
        .sort(([, a], [, b]) => b.totalBtc - a.totalBtc)
        .slice(0, 10)
        .map(([addr, data], i) => ({ rank: i + 1, addr, ...data }));
}

// ─── Copy helper ─────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/30 hover:text-white">
            {copied ? <CheckCheck size={12} className="text-[#00ff9d]" /> : <Copy size={12} />}
        </button>
    );
}

// ─── Transaction Detail Drawer ────────────────────────────────────────────────
function TransactionDrawer({ tx, onClose }: { tx: MempoolTx; onClose: () => void }) {
    const btc = satsToBtc(tx.value);
    const usd = btcToUsd(btc);
    const feeRate = tx.vsize > 0 ? tx.fee / tx.vsize : 0;
    const feeBtc = satsToBtc(tx.fee);
    const feeUsd = btcToUsd(feeBtc);
    const efficiency = Math.min((feeRate / 200) * 100, 100);
    const tier = getWhaleTier(btc);
    const classification = classifyTxType(tx);
    const inputCount = tx.vin?.length || 1;
    const outputCount = tx.vout?.length || 1;
    const confirmations = tx.status?.block_height ? 850000 - tx.status.block_height : 0;
    const isConfirmed = tx.status?.confirmed;

    const metrics = [
        { label: 'Transaction Hash',   value: tx.txid,               mono: true, copy: true, full: true },
        { label: 'Value (BTC)',         value: formatBtc(btc),        mono: true },
        { label: 'Value (USD)',         value: formatUsd(usd),        mono: true, highlight: true },
        { label: 'Fee',                 value: `${tx.fee.toLocaleString()} sats`,  mono: true },
        { label: 'Fee (USD)',           value: `$${feeUsd.toFixed(2)}`,            mono: true },
        { label: 'Fee Rate',            value: `${safeToFixed(feeRate, 2)} sat/vB`, mono: true },
        { label: 'Virtual Size',        value: `${tx.vsize} vBytes`,  mono: true },
        { label: 'Weight Units',        value: `${tx.weight || tx.vsize * 4} WU`,  mono: true },
        { label: 'Inputs',              value: inputCount,            mono: true },
        { label: 'Outputs',             value: outputCount,           mono: true },
        { label: 'Locktime',            value: tx.locktime || 0,      mono: true },
        { label: 'Version',             value: `v${tx.version || 2}`, mono: true },
        { label: 'Confirmation Status', value: isConfirmed ? `Confirmed (Block ${tx.status?.block_height?.toLocaleString()})` : 'Pending (Mempool)', highlight: !isConfirmed },
        { label: 'Block Time',          value: tx.status?.block_time ? timeAgo(tx.status.block_time) : '—', mono: true },
        { label: 'First Seen',          value: timeAgo(tx.time),      mono: true },
    ];

    const riskScore = useMemo(() => {
        let score = 0;
        if (btc > 100) score += 40;
        else if (btc > 10) score += 20;
        if (feeRate > 300) score += 30; // Abnormally high fee urgency
        if (outputCount === 1) score += 10; // Consolidation
        if (inputCount > 5) score += 10; // Many inputs (possible mixing)
        return Math.min(score, 100);
    }, [btc, feeRate, outputCount, inputCount]);

    const riskLabel = riskScore >= 70 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : 'LOW';
    const riskColor = riskScore >= 70 ? '#ff4466' : riskScore >= 40 ? '#f59e0b' : '#00ff9d';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-start justify-end"
                onClick={onClose}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

                {/* Drawer */}
                <motion.div
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="relative z-10 w-full max-w-2xl h-screen bg-[#050505] border-l border-white/10 overflow-y-auto"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Tier glow */}
                    {tier && (
                        <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, transparent, ${tier.color}, transparent)` }} />
                    )}

                    {/* Header */}
                    <div className="sticky top-0 z-20 bg-[#050505]/90 backdrop-blur-xl border-b border-white/5 p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {tier ? (
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                                    style={{ background: `${tier.color}15`, border: `1px solid ${tier.color}30`, boxShadow: `0 0 20px ${tier.glow}` }}>
                                    {tier.icon}
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Hash size={18} className="text-white/40" />
                                </div>
                            )}
                            <div>
                                <div className="font-mono text-sm text-white/60 truncate max-w-[260px]">
                                    {tx.txid.slice(0, 20)}...{tx.txid.slice(-8)}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded"
                                        style={{ color: classification.color, background: `${classification.color}15`, border: `1px solid ${classification.color}30` }}>
                                        {classification.label}
                                    </span>
                                    {isConfirmed
                                        ? <span className="text-[10px] text-[#00ff9d] font-black uppercase">✓ CONFIRMED</span>
                                        : <span className="text-[10px] text-yellow-400 font-black uppercase animate-pulse">⏳ PENDING</span>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <a href={`https://mempool.space/tx/${tx.txid}`} target="_blank" rel="noopener noreferrer"
                                className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
                                <ExternalLink size={16} className="text-white/50 hover:text-white" />
                            </a>
                            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
                                <X size={16} className="text-white/50 hover:text-white" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Big value hero */}
                        <div className="text-center py-8 bg-white/[0.02] rounded-3xl border border-white/5">
                            <div className="text-xs font-black text-white/30 uppercase tracking-widest mb-3">Transaction Value</div>
                            <div className="text-5xl font-black font-mono text-white mb-2"
                                style={tier ? { color: tier.color, textShadow: `0 0 30px ${tier.glow}` } : {}}>
                                {formatBtc(btc)}
                            </div>
                            <div className="text-xl font-medium text-white/50 font-mono">{formatUsd(usd)}</div>
                            {tier && (
                                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest"
                                    style={{ color: tier.color, background: `${tier.color}10`, border: `1px solid ${tier.color}30`, boxShadow: `0 0 20px ${tier.glow}` }}>
                                    {tier.icon} {tier.label} TIER WHALE
                                </div>
                            )}
                        </div>

                        {/* AI Risk Score */}
                        <div className="bg-white/[0.02] rounded-3xl border border-white/5 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Shield size={18} className="text-white/40" />
                                    <span className="text-sm font-black uppercase tracking-widest text-white/60">On-Chain Risk Analysis</span>
                                </div>
                                <div className="px-3 py-1 rounded-full text-xs font-black" style={{ color: riskColor, background: `${riskColor}15`, border: `1px solid ${riskColor}30` }}>
                                    {riskLabel} RISK
                                </div>
                            </div>
                            <div className="relative h-2 bg-white/5 rounded-full overflow-hidden mb-3">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${riskScore}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                                    className="absolute inset-y-0 left-0 rounded-full"
                                    style={{ background: `linear-gradient(90deg, #00ff9d, ${riskColor})` }} />
                            </div>
                            <div className="flex justify-between text-[10px] text-white/30 font-black uppercase tracking-widest">
                                <span>LOW RISK</span>
                                <span className="font-mono" style={{ color: riskColor }}>{riskScore}/100</span>
                                <span>CRITICAL</span>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] text-white/40">
                                <div>• {btc > 10 ? `⚠ Whale Volume: ${formatBtc(btc)}` : '✓ Normal volume range'}</div>
                                <div>• {feeRate > 100 ? `⚠ High urgency fee: ${safeToFixed(feeRate, 0)} sat/vB` : '✓ Normal fee priority'}</div>
                                <div>• {inputCount > 5 ? `⚠ High input count: ${inputCount} inputs` : `✓ ${inputCount} input(s)`}</div>
                                <div>• {outputCount === 1 ? '📌 Single output (consolidation)' : `✓ ${outputCount} outputs`}</div>
                            </div>
                        </div>

                        {/* Network Efficiency */}
                        <div className="bg-white/[0.02] rounded-3xl border border-white/5 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Cpu size={18} className="text-white/40" />
                                <span className="text-sm font-black uppercase tracking-widest text-white/60">Fee Efficiency Matrix</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { label: 'Fee Rate', value: `${safeToFixed(feeRate, 1)} sat/vB`, color: feeRate > 200 ? '#ff4466' : feeRate > 50 ? '#f59e0b' : '#00ff9d' },
                                    { label: 'Priority', value: feeRate > 200 ? 'URGENT' : feeRate > 50 ? 'HIGH' : feeRate > 10 ? 'MEDIUM' : 'LOW', color: '#6366f1' },
                                    { label: 'Efficiency', value: `${efficiency.toFixed(0)}%`, color: '#00ff9d' },
                                ].map(m => (
                                    <div key={m.label} className="text-center p-3 bg-white/[0.02] rounded-xl border border-white/5">
                                        <div className="text-xs text-white/30 uppercase tracking-widest mb-1">{m.label}</div>
                                        <div className="text-lg font-black font-mono" style={{ color: m.color }}>{m.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Full Metrics Table */}
                        <div className="bg-white/[0.02] rounded-3xl border border-white/5 overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                                <Database size={16} className="text-white/40" />
                                <span className="text-sm font-black uppercase tracking-widest text-white/60">Full Transaction Data</span>
                            </div>
                            <div className="divide-y divide-white/[0.04]">
                                {metrics.map((m) => (
                                    <div key={m.label} className="flex items-start justify-between px-6 py-3 gap-4 hover:bg-white/[0.02] transition-colors">
                                        <div className="text-xs text-white/30 uppercase tracking-widest shrink-0 pt-0.5 min-w-[130px]">{m.label}</div>
                                        <div className={`text-right flex items-center gap-1 ${m.mono ? 'font-mono' : ''} ${m.highlight ? 'text-[#00ff9d]' : 'text-white/80'} text-xs font-medium ${m.full ? 'break-all' : 'truncate'}`}>
                                            <span>{typeof m.value === 'number' ? m.value.toLocaleString() : m.value}</span>
                                            {m.copy && <CopyButton text={String(m.value)} />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Inputs / Outputs breakdown */}
                        {(tx.vin?.length || tx.vout?.length) ? (
                            <div className="bg-white/[0.02] rounded-3xl border border-white/5 overflow-hidden">
                                <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                                    <Layers size={16} className="text-white/40" />
                                    <span className="text-sm font-black uppercase tracking-widest text-white/60">Inputs / Outputs</span>
                                </div>
                                <div className="p-6 grid grid-cols-2 gap-6">
                                    <div>
                                        <div className="text-[10px] text-white/30 uppercase tracking-widest mb-3 font-black">Inputs ({inputCount})</div>
                                        <div className="space-y-2">
                                            {(tx.vin || []).slice(0, 5).map((inp, i) => (
                                                <div key={i} className="text-[10px] font-mono text-white/40 bg-white/[0.02] rounded-lg p-2 truncate">
                                                    {inp.prevout?.scriptpubkey_address ? `${inp.prevout.scriptpubkey_address.slice(0, 16)}...` : `${inp.txid.slice(0, 16)}...`}
                                                    {inp.prevout?.value ? <span className="text-white/60 ml-2">{formatBtc(satsToBtc(inp.prevout.value))}</span> : null}
                                                </div>
                                            ))}
                                            {inputCount > 5 && <div className="text-[10px] text-white/20 pl-2">+{inputCount - 5} more</div>}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-white/30 uppercase tracking-widest mb-3 font-black">Outputs ({outputCount})</div>
                                        <div className="space-y-2">
                                            {(tx.vout || []).slice(0, 5).map((out, i) => (
                                                <div key={i} className="text-[10px] font-mono text-white/40 bg-white/[0.02] rounded-lg p-2 truncate">
                                                    {out.scriptpubkey_address ? `${out.scriptpubkey_address.slice(0, 16)}...` : `[${out.scriptpubkey_type}]`}
                                                    {out.value ? <span className="text-[#00ff9d] ml-2">{formatBtc(satsToBtc(out.value))}</span> : null}
                                                </div>
                                            ))}
                                            {outputCount > 5 && <div className="text-[10px] text-white/20 pl-2">+{outputCount - 5} more</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {/* Mempool history estimate */}
                        <div className="bg-white/[0.02] rounded-3xl border border-white/5 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <BarChart2 size={18} className="text-white/40" />
                                <span className="text-sm font-black uppercase tracking-widest text-white/60">Market Context</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
                                    <div className="text-white/30 uppercase tracking-widest mb-1">BTC/USD Ref. Price</div>
                                    <div className="text-white font-mono font-black">${BTC_PRICE_USD.toLocaleString()}</div>
                                </div>
                                <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
                                    <div className="text-white/30 uppercase tracking-widest mb-1">Miner Revenue</div>
                                    <div className="text-[#f59e0b] font-mono font-black">${feeUsd.toFixed(4)}</div>
                                </div>
                                <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
                                    <div className="text-white/30 uppercase tracking-widest mb-1">% of Block Value</div>
                                    <div className="text-white font-mono font-black">{((feeBtc / 3.125) * 100).toFixed(3)}%</div>
                                </div>
                                <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
                                    <div className="text-white/30 uppercase tracking-widest mb-1">TX Size vs Median</div>
                                    <div className={`font-mono font-black ${tx.vsize > 500 ? 'text-[#f59e0b]' : 'text-[#00ff9d]'}`}>
                                        {tx.vsize > 500 ? 'HEAVY' : tx.vsize > 150 ? 'AVERAGE' : 'COMPACT'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* View on Explorer link */}
                        <a href={`https://mempool.space/tx/${tx.txid}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl transition-all text-sm font-black uppercase tracking-widest text-white/60 hover:text-white">
                            <ExternalLink size={16} />
                            View Full Details on mempool.space
                        </a>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// ─── Whale Leaderboard Row ────────────────────────────────────────────────────
function LeaderboardRow({ rank, addr, totalBtc, txids }: { rank: number; addr: string; totalBtc: number; txids: string[] }) {
    const usd = btcToUsd(totalBtc);
    const medalIcon = rank === 1 ? <Crown size={16} className="text-yellow-400" /> :
                      rank === 2 ? <Medal size={16} className="text-gray-300" /> :
                      rank === 3 ? <Award size={16} className="text-amber-600" /> :
                      <span className="text-xs font-black text-white/30 w-4 text-center">#{rank}</span>;
    const tier = getWhaleTier(totalBtc);
    return (
        <div className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.03] rounded-xl transition-colors">
            <div className="w-8 flex justify-center shrink-0">{medalIcon}</div>
            <div className="flex-1 min-w-0">
                <div className="font-mono text-xs text-white/50 truncate">{addr.slice(0, 18)}...</div>
                <div className="text-[10px] text-white/20 mt-0.5">{txids.length} tx this week</div>
            </div>
            <div className="text-right shrink-0">
                <div className="text-sm font-black font-mono text-white">{safeToFixed(totalBtc, 2)} BTC</div>
                <div className="text-[10px] text-white/30 font-mono">{formatUsd(usd)}</div>
            </div>
            {tier && (
                <div className="text-xs shrink-0" style={{ color: tier.color }}>{tier.icon}</div>
            )}
        </div>
    );
}

// ─── Transaction Row ──────────────────────────────────────────────────────────
function TransactionRow({ tx, index, onClick }: { tx: MempoolTx; index: number; onClick: () => void }) {
    const btc = satsToBtc(tx.value);
    const usd = btcToUsd(btc);
    const feeRate = tx.vsize > 0 ? tx.fee / tx.vsize : 0;
    const tier = getWhaleTier(btc);
    const classification = classifyTxType(tx);
    const isConfirmed = tx.status?.confirmed;

    return (
        <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
            onClick={onClick}
            className="group relative cursor-pointer"
        >
            <div className="relative flex items-center gap-3 px-5 py-4 rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/20 transition-all overflow-hidden"
                style={tier ? { borderColor: `${tier.color}20` } : {}}>
                {/* Tier glow bar */}
                {tier && <div className="absolute left-0 inset-y-0 w-0.5 rounded-full" style={{ background: tier.color, boxShadow: `0 0 10px ${tier.glow}` }} />}

                {/* Status */}
                <div className="shrink-0 w-8 h-8 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                    {isConfirmed
                        ? <CheckCircle size={16} className="text-[#00ff9d]" />
                        : <Clock size={16} className="text-yellow-400 animate-pulse" />}
                </div>

                {/* Hash + classification */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white/80 truncate group-hover:text-white transition-colors">
                            {tx.txid.slice(0, 14)}<span className="text-white/30">...</span>{tx.txid.slice(-6)}
                        </span>
                        <span className="shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded flex items-center gap-1"
                            style={{ color: classification.color, background: `${classification.color}10`, border: `1px solid ${classification.color}20` }}>
                            {classification.icon} {classification.label}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-white/25">{timeAgo(tx.time)}</span>
                        <span className="text-[10px] text-white/20">•</span>
                        <span className="text-[10px] text-white/25 font-mono">{safeToFixed(feeRate, 1)} sat/vB</span>
                        <span className="text-[10px] text-white/20">•</span>
                        <span className="text-[10px] text-white/25 font-mono">{tx.vsize} vB</span>
                    </div>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                    <div className="font-mono font-black text-base leading-none" style={tier ? { color: tier.color, textShadow: `0 0 15px ${tier.glow}` } : { color: 'white' }}>
                        {safeToFixed(btc, btc < 0.001 ? 6 : 3)}
                        <span className="text-[10px] text-white/30 font-sans ml-1">BTC</span>
                    </div>
                    <div className="text-[10px] text-white/30 font-mono mt-0.5">{formatUsd(usd)}</div>
                </div>

                {/* Arrow */}
                <div className="shrink-0 w-7 h-7 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <ArrowRight size={12} className="text-white/30 group-hover:text-white" />
                </div>
            </div>
        </motion.div>
    );
}

// ─── Whale Group Section ──────────────────────────────────────────────────────
function WhaleTierGroup({ tier, txs, onSelect }: { tier: typeof WHALE_TIERS[0]; txs: MempoolTx[]; onSelect: (tx: MempoolTx) => void }) {
    const [collapsed, setCollapsed] = useState(false);
    const totalBtc = txs.reduce((s, t) => s + satsToBtc(t.value), 0);
    const totalUsd = btcToUsd(totalBtc);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl overflow-hidden border"
            style={{ borderColor: `${tier.color}20`, background: `${tier.color}03` }}>
            <button onClick={() => setCollapsed(c => !c)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        style={{ background: `${tier.color}15`, border: `1px solid ${tier.color}30`, boxShadow: `0 0 15px ${tier.glow}` }}>
                        {tier.icon}
                    </div>
                    <div className="text-left">
                        <div className="flex items-center gap-3">
                            <span className="font-black text-lg text-white">{tier.label} TIER</span>
                            <span className="text-xs font-black px-2 py-0.5 rounded-full"
                                style={{ color: tier.color, background: `${tier.color}15`, border: `1px solid ${tier.color}30` }}>
                                {txs.length} TX
                            </span>
                        </div>
                        <div className="text-[11px] text-white/30 mt-0.5">≥ {tier.min} BTC per transaction</div>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <div className="font-mono font-black text-white" style={{ color: tier.color }}>{safeToFixed(totalBtc, 2)} BTC</div>
                        <div className="text-[10px] text-white/30 font-mono">{formatUsd(totalUsd)} volume</div>
                    </div>
                    <ChevronUp size={16} className={`text-white/30 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
                </div>
            </button>
            <AnimatePresence>
                {!collapsed && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }} className="overflow-hidden">
                        <div className="px-4 pb-4 space-y-2 border-t" style={{ borderColor: `${tier.color}10` }}>
                            {txs.map((tx, i) => (
                                <TransactionRow key={tx.txid} tx={tx} index={i} onClick={() => onSelect(tx)} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TransactionsPage() {
    const [selectedTx, setSelectedTx] = useState<MempoolTx | null>(null);

    const { data: txs, isLoading, isError, dataUpdatedAt, refetch, isFetching } = useQuery<MempoolTx[]>({
        queryKey: ['network', 'mempool', 'recent'],
        queryFn: async () => {
            const res = await fetch('/api/network/mempool/recent');
            if (!res.ok) throw new Error('Failed to fetch mempool');
            return res.json();
        },
        refetchInterval: 5000,
    });

    const sorted = useMemo(() => [...(txs || [])].sort((a, b) => b.value - a.value), [txs]);

    // Group into whale tiers + standard
    const grouped = useMemo(() => {
        const result: { tier: typeof WHALE_TIERS[0]; txs: MempoolTx[] }[] = [];
        for (const tier of WHALE_TIERS) {
            const tierTxs = sorted.filter(tx => {
                const btc = satsToBtc(tx.value);
                const nextTier = WHALE_TIERS[WHALE_TIERS.indexOf(tier) - 1];
                return btc >= tier.min && (!nextTier || btc < nextTier.min);
            });
            if (tierTxs.length > 0) result.push({ tier, txs: tierTxs });
        }
        return result;
    }, [sorted]);

    const standardTxs = useMemo(() => sorted.filter(tx => satsToBtc(tx.value) < 1), [sorted]);
    const leaderboard = useMemo(() => sorted.length > 0 ? buildWeeklyLeaderboard(sorted) : [], [sorted]);

    const totalVolumeBtc = useMemo(() => sorted.reduce((s, t) => s + satsToBtc(t.value), 0), [sorted]);
    const whaleTxCount = useMemo(() => sorted.filter(t => satsToBtc(t.value) >= 1).length, [sorted]);
    const avgFeeRate = useMemo(() => sorted.length > 0 ? sorted.reduce((s, t) => s + (t.vsize > 0 ? t.fee / t.vsize : 0), 0) / sorted.length : 0, [sorted]);

    return (
        <div className="relative min-h-screen pt-24 pb-16 px-4">
            <div className="fixed inset-0 z-0">
                <UniversalEliteWallpaper />
            </div>
            <div className="relative z-10 max-w-5xl mx-auto space-y-8">
                <NetworkTabs />

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3">
                            <Activity className="text-[#00ff9d]" size={40} />
                            Transactions
                        </h1>
                        <p className="text-white/30 mt-2 text-base font-medium">
                            Bitcoin mempool — grouped by whale tier, sorted by volume. Click any transaction for full analytics.
                        </p>
                    </motion.div>
                    <div className="flex items-center gap-2 text-xs text-white/30">
                        <RefreshCw size={12} className={isFetching ? 'animate-spin text-blue-400' : 'text-white/20'} />
                        <span>{dataUpdatedAt ? `Updated ${formatDistanceToNow(dataUpdatedAt, { addSuffix: true })}` : 'Connecting...'}</span>
                        <span className="flex h-2 w-2 ml-1 relative">
                            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#00ff9d] opacity-40" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff9d]" />
                        </span>
                    </div>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Stats Strip */}
                {!isLoading && !isError && sorted.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: 'Pending Txs',       value: sorted.length.toLocaleString(),             color: 'white' },
                            { label: 'Whale Txs (≥1 BTC)',value: whaleTxCount.toLocaleString(),              color: '#00ff9d' },
                            { label: 'Total Volume',       value: `${safeToFixed(totalVolumeBtc, 2)} BTC`,    color: '#6366f1' },
                            { label: 'Avg Fee Rate',       value: `${safeToFixed(avgFeeRate, 1)} sat/vB`,     color: '#f59e0b' },
                        ].map(s => (
                            <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-center">
                                <div className="text-xl font-black font-mono" style={{ color: s.color }}>{s.value}</div>
                                <div className="text-[10px] text-white/30 mt-1 uppercase tracking-widest">{s.label}</div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* Loading / Error */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <RefreshCw className="animate-spin text-[#00ff9d]" size={32} />
                        <span className="text-white/30 font-mono text-sm">Scanning mempool...</span>
                    </div>
                )}
                {isError && (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <AlertCircle className="text-red-500" size={32} />
                        <span className="text-white/40 text-sm">Unable to reach mempool API.</span>
                        <button onClick={() => refetch()}
                            className="px-4 py-2 text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-colors">
                            Retry
                        </button>
                    </div>
                )}

                {!isLoading && !isError && sorted.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: Whale Groups + Standard Feed */}
                        <div className="lg:col-span-2 space-y-4">
                            {grouped.map(({ tier, txs: tierTxs }) => (
                                <WhaleTierGroup key={tier.label} tier={tier} txs={tierTxs} onSelect={setSelectedTx} />
                            ))}

                            {/* Standard Transactions */}
                            {standardTxs.length > 0 && (
                                <div className="rounded-3xl border border-white/[0.06] overflow-hidden bg-white/[0.01]">
                                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <ArrowRightLeft size={16} className="text-white/30" />
                                            <span className="font-black text-white/60 uppercase tracking-widest text-sm">Standard Transactions</span>
                                            <span className="text-[10px] font-black bg-white/5 text-white/30 px-2 py-0.5 rounded">{standardTxs.length}</span>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        {standardTxs.slice(0, 20).map((tx, i) => (
                                            <TransactionRow key={tx.txid} tx={tx} index={i} onClick={() => setSelectedTx(tx)} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: Weekly Leaderboard */}
                        <div className="space-y-4">
                            <div className="rounded-3xl border border-white/[0.06] overflow-hidden bg-white/[0.01] sticky top-28">
                                <div className="px-5 py-4 border-b border-white/5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Trophy size={16} className="text-yellow-400" />
                                        <span className="font-black text-white uppercase tracking-widest text-sm">Weekly Leaderboard</span>
                                    </div>
                                    <div className="text-[10px] text-white/20 uppercase tracking-widest">
                                        Resets every Sunday 00:00 UTC · Top whale volumes this week
                                    </div>
                                </div>

                                {leaderboard.length === 0 ? (
                                    <div className="py-12 text-center text-white/20 text-xs font-mono">
                                        Accumulating data...
                                    </div>
                                ) : (
                                    <div className="py-2">
                                        {leaderboard.map(entry => (
                                            <LeaderboardRow
                                                key={entry.addr}
                                                rank={entry.rank}
                                                addr={entry.addr}
                                                totalBtc={entry.totalBtc}
                                                txids={entry.txids}
                                            />
                                        ))}
                                    </div>
                                )}

                                <div className="px-5 py-3 border-t border-white/5 text-[9px] text-white/15 uppercase tracking-widest">
                                    Based on active session data · Resets weekly
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Transaction Detail Drawer */}
            {selectedTx && (
                <TransactionDrawer tx={selectedTx} onClose={() => setSelectedTx(null)} />
            )}
        </div>
    );
}
