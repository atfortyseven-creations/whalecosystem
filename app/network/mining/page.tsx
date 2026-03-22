"use client";

import { useQuery } from '@tanstack/react-query';
import { motion, useMotionValue, animate } from 'framer-motion';
import { Pickaxe, Activity, Clock, TrendingUp, Cpu, Flame, Shield, Hash, BarChart2, Zap, Globe } from 'lucide-react';
import { InstitutionalHeader } from '@/components/shared/InstitutionalHeader';
import { NetworkTabs } from '@/components/network/NetworkTabs';
import { HalvingCountdown } from '@/components/network/HalvingCountdown';
import { MiningPoolDistribution } from '@/components/network/MiningPoolDistribution';
import { UniversalChainDistribution } from '@/components/network/UniversalChainDistribution';
import { UniversalEliteWallpaper } from '@/components/shared/UniversalEliteWallpaper';
import { safeToFixed } from '@/lib/utils/number-format';
import { useEffect, useRef, useState } from 'react';
import {
    AreaChart, Area, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedNumber({ value, decimals = 1 }: { value: number; decimals?: number }) {
    const mv = useMotionValue(0);
    const [disp, setDisp] = useState('0');
    useEffect(() => {
        if (!value) return;
        const ctrl = animate(mv, value, { duration: 1.8, ease: 'easeOut' });
        const unsub = mv.on('change', v => setDisp(v.toFixed(decimals)));
        return () => { ctrl.stop(); unsub(); };
    }, [value]);
    return <span>{disp}</span>;
}

// ─── Spinning Hash Ring ────────────────────────────────────────────────────
function HashRing({ hashrate }: { hashrate: number | null }) {
    const level = hashrate ? Math.min((hashrate / 800) * 100, 100) : 50;
    const ticks = 60;
    return (
        <div className="relative w-64 h-64 mx-auto">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                {/* Outer ring */}
                {Array.from({ length: ticks }).map((_, i) => {
                    const angle = (i / ticks) * Math.PI * 2 - Math.PI / 2;
                    const r1 = 92, r2 = i % 5 === 0 ? 84 : 88;
                    const active = i < (level / 100) * ticks;
                    return (
                        <line key={i}
                            x1={100 + Math.cos(angle) * r1} y1={100 + Math.sin(angle) * r1}
                            x2={100 + Math.cos(angle) * r2} y2={100 + Math.sin(angle) * r2}
                            stroke={active ? '#f97316' : 'rgba(255,255,255,0.06)'}
                            strokeWidth={i % 5 === 0 ? 2 : 1}
                            strokeLinecap="round"
                            style={active ? { filter: 'drop-shadow(0 0 3px rgba(249,115,22,0.6))' } : undefined}
                        />
                    );
                })}
                {/* Progress arc */}
                <circle cx="100" cy="100" r="78" fill="none" stroke="rgba(249,115,22,0.08)" strokeWidth="12" />
                <motion.circle cx="100" cy="100" r="78" fill="none" stroke="#f97316" strokeWidth="12"
                    strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 78}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 78 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 78 * (1 - level / 100) }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                    style={{ transformOrigin: '100px 100px', transform: 'rotate(-90deg)', filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.4))' }}
                />
            </svg>
            {/* Center value */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-black font-mono text-white leading-none">
                    {hashrate ? <AnimatedNumber value={hashrate} decimals={1} /> : '—'}
                </div>
                <div className="text-[10px] font-black text-orange-400/70 uppercase tracking-widest mt-1">EH/s</div>
                <div className="text-[9px] text-white/20 uppercase tracking-widest mt-1">Hashrate</div>
            </div>
            {/* Rotating dot */}
            <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-orange-400"
                    style={{ boxShadow: '0 0 10px rgba(249,115,22,0.8)' }} />
            </motion.div>
        </div>
    );
}

// ─── Particle Background ────────────────────────────────────────────────────
function MiningParticles() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
                <motion.div key={i}
                    className="absolute w-1 h-1 rounded-full bg-orange-400/30"
                    style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                    animate={{ y: [-20, 20], x: [-10, 10], opacity: [0, 0.6, 0] }}
                    transition={{ duration: 3 + Math.random() * 4, delay: Math.random() * 5, repeat: Infinity, ease: 'easeInOut' }}
                />
            ))}
        </div>
    );
}

// ─── Difficulty Gauge ────────────────────────────────────────────────────────
function DifficultyGauge({ difficulty, change }: { difficulty: number; change: number }) {
    const normalized = Math.min((difficulty / 1e14) * 100, 100);
    const isUp = change >= 0;
    return (
        <div className="relative bg-white border border-slate-100 rounded-[2.5rem] p-8 text-center shadow-sm overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="flex items-center gap-3 mb-4 justify-center">
                <TrendingUp size={16} className={isUp ? 'text-rose-600' : 'text-emerald-600'} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Difficulty</span>
            </div>
            <div className="text-4xl font-black font-mono text-slate-900 mb-2">
                <AnimatedNumber value={difficulty / 1e12} decimals={2} /> <span className="text-lg text-slate-300">T</span>
            </div>
            <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden my-4">
                <motion.div className="absolute inset-y-0 left-0 rounded-full bg-indigo-600"
                    initial={{ width: 0 }} animate={{ width: `${normalized}%` }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                    style={{ boxShadow: '0 0 15px rgba(79,70,229,0.3)' }} />
            </div>
            <div className={`text-sm font-black ${isUp ? 'text-rose-600' : 'text-emerald-600'}`}>
                {isUp ? '▲' : '▼'} {Math.abs(change).toFixed(2)}% vs last epoch
            </div>
        </div>
    );
}

// ─── Block Time Meter ────────────────────────────────────────────────────────
function BlockTimeMeter({ minutes }: { minutes: number | null }) {
    const ideal = 10;
    const diff = minutes ? minutes - ideal : 0;
    const color = Math.abs(diff) < 0.5 ? '#059669' : Math.abs(diff) < 1.5 ? '#d97706' : '#e11d48';
    return (
        <div className="relative bg-white border border-slate-100 rounded-[2.5rem] p-8 text-center shadow-sm overflow-hidden group">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{ background: `radial-gradient(circle at 50% 100%, ${color}08, transparent)` }} />
            <div className="flex items-center gap-3 mb-4 justify-center">
                <Clock size={16} style={{ color }} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Block Time</span>
            </div>
            <div className="text-4xl font-black font-mono mb-2" style={{ color }}>
                {minutes ? <><AnimatedNumber value={minutes} decimals={2} /> <span className="text-lg text-slate-300">min</span></> : '—'}
            </div>
            <div className="text-xs font-black uppercase tracking-widest mt-2" style={{ color: `${color}80` }}>
                {!minutes ? 'Loading...' : Math.abs(diff) < 0.5 ? '✓ Ideal Pace' : diff > 0 ? `▲ +${diff.toFixed(1)}m Slow` : `▼ ${diff.toFixed(1)}m Fast`}
            </div>
            {/* Target indicator */}
            <div className="flex items-center justify-center gap-2 mt-3 text-[9px] text-slate-300 uppercase tracking-widest">
                <div className="w-1 h-1 rounded-full bg-slate-200" />
                Target: 10 min
            </div>
        </div>
    );
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const HashTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl px-4 py-3 text-xs shadow-xl">
            <div className="text-slate-400 font-black uppercase tracking-widest mb-1">
                {new Date(label).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
            <div className="text-indigo-600 font-black font-mono text-base">
                {payload[0]?.value?.toFixed(1)} EH/s
            </div>
        </div>
    );
};

// ─── Page Component ──────────────────────────────────────────────────────────
export default function MiningPage() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['network', 'mining'],
        queryFn: async () => {
            const [diffRes, hashrateRes] = await Promise.all([
                fetch('/api/network/v1/difficulty-adjustment'),
                fetch('/api/network/v1/hashrate'),
            ]);
            const diffData = await diffRes.json();
            const hashrateData = hashrateRes.ok ? await hashrateRes.json() : null;
            return {
                difficulty: {
                    current: diffData.difficulty,
                    change: diffData.difficultyChange || 0,
                    history: Array.from({ length: 14 }, (_, i) => ({
                        time: Date.now() - (13 - i) * 24 * 60 * 60 * 1000,
                        difficulty: diffData.difficulty * (1 + (diffData.difficultyChange / 100) * (i / 13))
                    }))
                },
                hashrate: {
                    current: hashrateData?.current ?? null,
                    history: hashrateData?.history ?? [],
                },
                avgBlockTimeMin: hashrateData?.avgBlockTimeMin ?? null,
            };
        },
        refetchInterval: 60000,
    });

    return (
        <div className="relative min-h-screen text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
            <UniversalEliteWallpaper />

            <div className="relative z-10 w-full max-w-[1920px] mx-auto min-h-screen flex flex-col">

                <main className="flex-1 max-w-7xl mx-auto w-full pt-12 pb-32 px-6 space-y-16">
                    <NetworkTabs />

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-[3rem] overflow-hidden border border-slate-100 bg-white/70 backdrop-blur-3xl p-10 shadow-sm">
                    <MiningParticles />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                        <HashRing hashrate={stats?.hashrate.current} />
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm">
                                    <Pickaxe size={22} className="text-indigo-600" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-[0.4em] text-indigo-600/80">Proof of Work</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-slate-950 tracking-tighter leading-none mb-4 uppercase">
                                Mining<br /><span className="text-indigo-600">Dashboard</span>
                            </h1>
                            <p className="text-slate-500 text-lg leading-relaxed max-w-xl font-medium">
                                Real-time Bitcoin network security metrics. Hashrate tracking, difficulty epochs, block cadence, and institutional mining pool distribution.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-8">
                                {[
                                    { label: 'SHA-256' },
                                    { label: 'Layer 0 Security' },
                                    { label: 'Institutional Grade' },
                                ].map(b => (
                                    <span key={b.label} className="px-3 py-1.5 rounded-xl border border-slate-100 bg-slate-50 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                                        {b.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Halving Countdown */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
                    <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3">
                        <Zap size={16} className="text-indigo-600" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Halving Protocol Status</span>
                    </div>
                    <div className="p-8">
                        <HalvingCountdown />
                    </div>
                </motion.div>

                {/* Key Stats Grid */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Hashrate big card */}
                    <div className="relative bg-white border border-slate-100 rounded-[2.5rem] p-8 text-center shadow-sm overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="flex items-center gap-3 mb-4 justify-center">
                            <Activity size={16} className="text-indigo-600" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Hash Rate Authority</span>
                        </div>
                        <div className="text-5xl font-black font-mono text-slate-950">
                            {stats?.hashrate.current ? <AnimatedNumber value={stats.hashrate.current} decimals={1} /> : '—'}
                            <span className="text-xl text-slate-300 ml-2 uppercase">eh/s</span>
                        </div>
                        <div className="mt-3 text-[10px] text-slate-300 font-black uppercase tracking-[0.2em]">
                            Verification Power Certified
                        </div>
                    </div>
                    <DifficultyGauge difficulty={stats?.difficulty.current || 0} change={stats?.difficulty.change || 0} />
                    <BlockTimeMeter minutes={stats?.avgBlockTimeMin || null} />
                </motion.div>

                {/* Secondary Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Block Subsidy', value: '3.125 BTC', color: '#4f46e5' },
                        { label: 'Revenue Yield', value: stats?.hashrate.current ? `$${(3.125 * 104000).toLocaleString(undefined, {maximumFractionDigits:0})}` : '—', color: '#059669' },
                        { label: 'Network Security', value: stats?.hashrate.current ? `High Density` : '—', color: '#7c3aed' },
                        { label: 'Daily Emissions', value: '450 BTC', color: '#ea580c' },
                    ].map(m => (
                        <div key={m.label} className="bg-white/60 backdrop-blur-xl border border-slate-100 rounded-[1.5rem] p-5 shadow-sm hover:border-slate-300 transition-all">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.color }} />
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">{m.label}</span>
                            </div>
                            <div className="font-black text-slate-900 text-lg tracking-tight">{m.value}</div>
                        </div>
                    ))}
                </div>

                {/* Hashrate Chart */}
                {stats?.hashrate.history?.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="bg-white/80 backdrop-blur-2xl border border-slate-100 rounded-[3rem] overflow-hidden shadow-sm">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
                            <Activity size={16} className="text-indigo-600" />
                            <div>
                                <div className="font-black text-slate-950 uppercase tracking-tight">Computing Power Projection</div>
                                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Historical Verification Cycle • EH/s</div>
                            </div>
                        </div>
                        <div className="p-8 h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats?.hashrate.history || []}>
                                    <defs>
                                        <linearGradient id="hashGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
                                    <XAxis dataKey="time"
                                        tickFormatter={t => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        stroke="transparent" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} dy={8} />
                                    <YAxis stroke="transparent" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                                        tickFormatter={v => `${v}`} dx={-6} />
                                    <Tooltip content={<HashTooltip />} />
                                    <Area type="monotone" dataKey="hashrate" stroke="#4f46e5" strokeWidth={3}
                                        fill="url(#hashGrad)" dot={false}
                                        activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 3 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}

                {/* Pool Distribution */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="bg-white/80 backdrop-blur-3xl rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
                    <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3">
                        <BarChart2 size={16} className="text-indigo-600" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Institutional Resource Allocation Map</span>
                    </div>
                    <div className="p-10">
                        <MiningPoolDistribution hideHeader={true} />
                    </div>
                </motion.div>

                {/* Multiverse Security Mapping (33 chains) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="bg-white/80 backdrop-blur-3xl rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
                    <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3">
                        <Globe size={16} className="text-indigo-600" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Multiverse Security Hierarchy • 33 Verified Chains</span>
                    </div>
                    <div className="p-10">
                        <UniversalChainDistribution />
                    </div>
                </motion.div>
                </main>
            </div>
        </div>
    );
}
