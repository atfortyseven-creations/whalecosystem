"use client";
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Activity, BarChart3, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
import { useVIPStore } from '@/lib/vip-store';

export default function VolumePage() {
    const { volumeData: data, lastVolumeUpdate } = useVIPStore();

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-stone-200 rounded-[48px] bg-white/30 backdrop-blur-sm">
                <Activity className="w-16 h-16 text-stone-300 animate-pulse mb-6" />
                <p className="text-stone-400 font-mono text-sm tracking-widest uppercase animate-pulse">Synchronizing Mempool Volume Velocity...</p>
            </div>
        );
    }

    const sentimentColor = data.sentiment === 'bullish' ? 'text-emerald-500' : data.sentiment === 'bearish' ? 'text-red-500' : 'text-stone-400';
    const SentimentIcon = data.sentiment === 'bullish' ? ArrowUpRight : data.sentiment === 'bearish' ? ArrowDownRight : Minus;

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full">
            
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-stone-200 pb-10">
                <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-stone-900 rounded-xl shadow-lg">
                            <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">Mempool Velocity Engine</span>
                    </div>
                    <h1 className="text-6xl font-normal tracking-tighter text-stone-900 mb-4">Volume On-Chain</h1>
                    <p className="text-stone-500 font-light text-xl leading-relaxed">Real-time capital inflow/outflow pressure based on fee velocity and latest Bitcoin blocks.</p>
                </div>
                
                <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <Activity className="w-4 h-4 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">mempool.space · Live</span>
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono uppercase">Sync: {new Date(lastVolumeUpdate).toLocaleTimeString()}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Net Flow Score', value: data.netFlowScore.toFixed(1), sub: 'Confidence /100', icon: Zap, color: 'text-stone-900' },
                    { label: 'Fee Velocity', value: `${data.avgFeeSat.toLocaleString()} sat`, sub: 'Average per TX', icon: TrendingUp, color: 'text-emerald-500' },
                    { label: 'Pending Load', value: `${data.mempoolSizeMb} MB`, sub: 'Current Buffer', icon: BarChart3, color: 'text-blue-500' },
                    { label: 'Global Backlog', value: data.totalPendingTxs.toLocaleString(), sub: 'Pending Txs', icon: Activity, color: 'text-stone-400' },
                ].map((stat) => (
                    <div key={stat.label} className="p-8 border border-stone-200 rounded-[32px] bg-white shadow-sm hover:shadow-xl transition-all group">
                        <stat.icon size={20} className={`mb-6 ${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
                        <div className="text-[10px] uppercase font-bold tracking-[0.1em] text-stone-400 mb-1">{stat.label}</div>
                        <div className="text-4xl font-black text-stone-900 tabular-nums">{stat.value}</div>
                        <div className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-2">{stat.sub}</div>
                    </div>
                ))}
            </div>

            {/* Major Sentiment Signal */}
            <div className={`p-12 rounded-[48px] border-l-8 shadow-sm flex items-center justify-between mb-12 bg-white ${
                data.sentiment === 'bullish' ? 'border-l-emerald-500' : data.sentiment === 'bearish' ? 'border-l-red-500' : 'border-l-stone-200'
            }`}>
                <div className="flex items-center gap-8">
                    <div className={`p-6 rounded-3xl ${data.sentiment === 'bullish' ? 'bg-emerald-50' : data.sentiment === 'bearish' ? 'bg-red-50' : 'bg-stone-50'}`}>
                        <SentimentIcon className={`w-12 h-12 ${sentimentColor}`} />
                    </div>
                    <div>
                        <div className={`text-5xl font-black tracking-tight ${sentimentColor} mb-2 uppercase`}>
                            {data.direction.replace(/_/g, ' ')}
                        </div>
                        <p className="text-stone-500 font-light text-lg max-w-xl">
                            Neural signal derived from relative congestion and Elite volume injected in the last 10 blocks.
                        </p>
                    </div>
                </div>
                <div className="hidden lg:block">
                     <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4 text-right">Momentum Strength</div>
                     <div className="w-64 h-2 bg-stone-100 rounded-full overflow-hidden">
                         <div className={`h-full transition-all duration-1000 ${data.sentiment === 'bullish' ? 'bg-emerald-500' : 'bg-red-500'}`} 
                              style={{ width: `${Math.max(15, data.netFlowScore)}%` }} />
                     </div>
                </div>
            </div>

            {/* Historical Feed */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Inflow/Outflow Delta (Last Blocks)
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.historicalPoints.slice(0, 8).map((point, i) => {
                        const total = point.inflow + point.outflow;
                        const inflowPct = total ? (point.inflow / total) * 100 : 50;
                        return (
                            <div key={i} className="p-6 border border-stone-200 rounded-[32px] bg-white/60 hover:bg-white transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-black text-stone-900 bg-stone-100 px-3 py-1 rounded-lg">Block #{point.blockHeight}</span>
                                    <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-emerald-500">Inflow: {(point.inflow/1000).toFixed(1)}k</span>
                                        <span className="text-red-500">Outflow: {(point.outflow/1000).toFixed(1)}k</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-bold text-red-400 uppercase w-8">Out</span>
                                    <div className="flex-1 h-3 rounded-full bg-red-100 overflow-hidden shadow-inner">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${inflowPct}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                                            className="h-full bg-emerald-500 rounded-full" />
                                    </div>
                                    <span className="text-[9px] font-bold text-emerald-500 uppercase w-8 text-right">In</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}

