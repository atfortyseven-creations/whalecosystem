"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, TrendingUp, TrendingDown, Clock, BarChart3, Globe, ShieldCheck } from 'lucide-react';
import { useVIPStore } from '@/lib/vip-store';

export default function PulsoIAPage() {
    const { whaleEvents, ethPrice, mempool, lastWhaleUpdate } = useVIPStore();

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="w-full">
            {/* Main Header */}
            <div className="mb-8 p-8 rounded-3xl bg-stone-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-stone-800 rounded-full blur-3xl opacity-50 transform translate-x-20 -translate-y-20" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-500 rounded-lg">
                                <Zap className="w-5 h-5 text-stone-900" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-500">Megalodon Whale Pulse</span>
                        </div>
                        <h1 className="text-5xl font-normal tracking-tight mb-2">Pulso IA</h1>
                        <p className="text-stone-400 font-light max-w-md">Monitoreo neural de la red Ethereum: precios, mempool y actividad de ballenas alfa.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-stone-800 rounded-2xl border border-stone-700">
                            <div className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">ETH Price</div>
                            <div className="text-2xl font-bold">${ethPrice?.toLocaleString() || '—'}</div>
                        </div>
                        <div className="p-4 bg-stone-800 rounded-2xl border border-stone-700">
                            <div className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Mempool Count</div>
                            <div className="text-2xl font-bold">{mempool?.count?.toLocaleString() || '—'}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Alerts */}
                <div className="space-y-6">
                    {/* Network Health */}
                    <div className="p-6 border border-stone-200 rounded-3xl bg-white shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2">
                            <Globe className="w-3 h-3" />
                            Network Health
                        </h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Priority Fee', value: `${mempool?.fastestFee || 0} sat/vB`, trend: 'Normal' },
                                { label: 'Pending VSize', value: `${((mempool?.vsize || 0)/1000000).toFixed(1)} MB`, trend: 'Stable' },
                                { label: 'Mega Txs Pending', value: mempool?.pendingMegaTxs || 0, trend: 'Medium' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                                    <span className="text-xs text-stone-500">{item.label}</span>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-stone-900">{item.value}</div>
                                        <div className="text-[9px] text-emerald-500 font-bold uppercase">{item.trend}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Sentiment Buffer */}
                    <div className="p-6 border border-stone-200 rounded-3xl bg-white shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2">
                            <BarChart3 className="w-3 h-3" />
                            AI Pulse Sentiment
                        </h3>
                        <div className="flex flex-col items-center py-6">
                            <div className="text-5xl font-black text-stone-900 mb-2">Neutral</div>
                            <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden mt-4">
                                <div className="h-full bg-stone-900 w-[52%]" />
                            </div>
                            <div className="flex justify-between w-full mt-2 text-[10px] text-stone-400 uppercase font-bold">
                                <span>Fear</span>
                                <span>Greed</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Column: Live Events */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Live Pulse Stream
                        </h2>
                        <span className="text-[10px] font-mono text-stone-400">Synced: {new Date(lastWhaleUpdate).toLocaleTimeString()}</span>
                    </div>

                    <div className="space-y-3">
                        <AnimatePresence>
                            {whaleEvents.slice(0, 10).map((event, i) => (
                                <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                    className="p-5 border border-stone-200 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-between group hover:border-stone-400 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl ${event.action === 'COMPRA' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                            {event.action === 'COMPRA' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-stone-900">{event.label}</span>
                                                <span className="text-[10px] font-mono text-stone-400 px-1.5 py-0.5 border border-stone-100 rounded-md">
                                                    {event.tier}
                                                </span>
                                            </div>
                                            <div className="text-xs text-stone-500 mt-0.5">
                                                {event.action} de {event.amount} {event.token} en {event.dex}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-stone-900">{event.usdValue}</div>
                                        <div className="flex items-center justify-end gap-2">
                                            <ShieldCheck size={10} className="text-emerald-500" />
                                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Verified Alpha</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

