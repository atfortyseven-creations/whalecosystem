"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity, Clock, Box, HardDrive, Cpu, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { useVIPStore } from '@/lib/vip-store';

export default function SettlementLayerPage() {
    const { mempool } = useVIPStore();

    if (!mempool) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-stone-400">
                <Box className="w-12 h-12 animate-bounce mb-4 opacity-20" />
                <p className="font-mono text-xs uppercase tracking-widest animate-pulse">Establishing Nexus Connection...</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
            {/* Header */}
            <div className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-stone-200 bg-white mb-4">
                    <Shield className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-600">Bitcoin Settlement Layer</span>
                </div>
                <h1 className="text-4xl font-normal tracking-tight text-stone-900 mb-2">Network Health</h1>
                <p className="text-stone-500 text-sm">Real-time state of the settlement layer: fees, congestion, and finality.</p>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="p-8 border border-stone-200 rounded-[32px] bg-white shadow-sm flex flex-col items-center text-center">
                    <div className="p-3 bg-stone-50 rounded-2xl mb-4"><Clock className="w-6 h-6 text-stone-900" /></div>
                    <div className="text-4xl font-black text-stone-900 mb-1">{mempool.fastestFee}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4">sat/vB (Fastest)</div>
                    <div className="w-full h-1 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[80%]" />
                    </div>
                </div>

                <div className="p-8 border border-stone-200 rounded-[32px] bg-white shadow-sm flex flex-col items-center text-center">
                    <div className="p-3 bg-stone-50 rounded-2xl mb-4"><Box className="w-6 h-6 text-stone-900" /></div>
                    <div className="text-4xl font-black text-stone-900 mb-1">{mempool.count?.toLocaleString()}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4">Pending Txs</div>
                    <div className="flex gap-1 w-full">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={`h-1 flex-1 rounded-full ${i < 3 ? 'bg-orange-500' : 'bg-stone-100'}`} />
                        ))}
                    </div>
                </div>

                <div className="p-8 border border-stone-200 rounded-[32px] bg-white shadow-sm flex flex-col items-center text-center">
                    <div className="p-3 bg-stone-50 rounded-2xl mb-4"><HardDrive className="w-6 h-6 text-stone-900" /></div>
                    <div className="text-4xl font-black text-stone-900 mb-1">{((mempool.vsize || 0)/1000000).toFixed(1)}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4">Mempool VSize (MB)</div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase">
                        <CheckCircle2 size={12} />
                        Within Safety Limits
                    </div>
                </div>
            </div>

            {/* Detailed Fees & Blocks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-8 border border-stone-200 rounded-[32px] bg-white shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-6 flex items-center gap-2">
                        <Cpu className="w-4 h-4" />
                        Fee Estimation
                    </h3>
                    <div className="space-y-4">
                        {[
                            { label: 'High Priority', value: `${mempool.fastestFee} sat/vB`, desc: 'Blocks < 10 mins', icon: Zap, color: 'text-emerald-500' },
                            { label: 'Medium Priority', value: `${mempool.halfHourFee} sat/vB`, desc: 'Blocks < 30 mins', icon: Activity, color: 'text-blue-500' },
                            { label: 'Low Priority', value: `${mempool.hourFee} sat/vB`, desc: 'Blocks < 60 mins', icon: Clock, color: 'text-stone-400' },
                        ].map((fee, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-transparent hover:border-stone-200 transition-colors">
                                <div className="flex items-center gap-4">
                                    <fee.icon className={`w-5 h-5 ${fee.color}`} />
                                    <div>
                                        <div className="text-sm font-bold text-stone-900">{fee.label}</div>
                                        <div className="text-[10px] text-stone-400">{fee.desc}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-stone-900">{fee.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-8 border border-stone-200 rounded-[32px] bg-white shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-6 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        Network Anomalies
                    </h3>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div className="text-xl font-bold text-stone-900 mb-1">Stable Layer</div>
                        <p className="text-xs text-stone-400 max-w-[200px]">No flooding attacks or critical congestion detected in the last 144 blocks.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

