"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Loader2, AlertCircle, ExternalLink, Activity, Filter, BrainCircuit, Waves } from 'lucide-react';
import { useVIPIntelligence } from '@/hooks/useVIPIntelligence';

export default function AIRiskSignalsPage() {
    const { transactions, stats } = useVIPIntelligence();
    
    const anomalySignals = transactions
        .filter(t => t.aiRiskScore > 40)
        .map(t => ({
            id: `SIG-${t.hash.slice(0, 8)}`,
            type: t.txType,
            action: t.valueEth === 0 ? t.methodName.toUpperCase() : t.txType === 'DEFI_ROUTING' ? 'ROUTING' : 'TRANSFER',
            direction: t.direction,
            token: t.valueEth === 0 ? 'EXECUTION' : 'ETH',
            label: t.from.slice(0, 6) + '...' + t.from.slice(-4),
            dex: t.network,
            ts: t.timestamp,
            amount: t.valueEth > 0 ? t.valueEth.toFixed(4) + ' ETH' : `Fee: $${t.feeUsd.toFixed(2)}`,
            usdValue: t.valueUsd > 0 ? `$${(t.valueUsd / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}K` : 'CONTRACT INVOCATION',
            confidence: t.aiRiskScore,
            hash: t.hash,
            methodHash: t.methodSignature
        }));

    const riskColor = (score: number) => 
        score >= 80 ? 'text-red-500 border-l-red-500 bg-red-50/30' : 
        score >= 60 ? 'text-orange-500 border-l-orange-500 bg-orange-50/30' : 
        'text-blue-500 border-l-blue-500 bg-blue-50/30';

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full">
            {/* Header section */}
            <div className="mb-8 border-b border-stone-200 pb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-stone-900 rounded-2xl shadow-xl shadow-stone-200">
                            <BrainCircuit className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-normal tracking-tight text-stone-900">AI Risk Signals</h1>
                            <p className="text-stone-500 mt-1">Predictive detection of anomalies in the Elite Dark Pool</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-stone-200 bg-white/50 backdrop-blur-sm">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-mono text-stone-600 uppercase tracking-widest">
                                Network Stream: Active
                            </span>
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono">
                            Block Sync: {stats.currentBlock}
                        </span>
                    </div>
                </div>
            </div>

            {/* Metrics overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Risk Score (Avg)', value: anomalySignals.length > 0 ? (anomalySignals.reduce((a, b) => a + b.confidence, 0) / anomalySignals.length).toFixed(1) : '0', desc: stats.systemicRisk, icon: Activity },
                    { label: 'Signal Confidence', value: 'Live', desc: 'Wagmi Streaming', icon: Shield },
                    { label: 'Active Alerts', value: anomalySignals.filter(e => e.confidence > 80).length, desc: 'Critical Threshold', icon: AlertCircle },
                    { label: 'Pool Depth', value: 'Live Tracking', desc: 'Elite Liquidity', icon: Waves },
                ].map((stat, i) => (
                    <div key={i} className="p-5 border border-stone-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-stone-50 rounded-lg"><stat.icon className="w-4 h-4 text-stone-600" /></div>
                            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-tighter">Live</span>
                        </div>
                        <div className="text-2xl font-bold text-stone-900">{stat.value}</div>
                        <div className="text-xs text-stone-500 mt-1">{stat.label}</div>
                        <div className="text-[10px] text-stone-400 mt-1 italic">{stat.desc}</div>
                    </div>
                ))}
            </div>

            {/* Signal log */}
            <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                        <Filter className="w-3 h-3" />
                        Detected Anomalies
                    </h2>
                    <span className="text-[10px] font-mono text-stone-400">Showing last {anomalySignals.length} events</span>
                </div>

                {anomalySignals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-stone-200 rounded-3xl bg-white/30 backdrop-blur-sm">
                        <Loader2 className="w-10 h-10 text-stone-300 animate-spin mb-4" />
                        <p className="text-stone-400 animate-pulse font-mono text-sm tracking-tighter uppercase">Scanning EVM Mempool for Anomalies...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {anomalySignals.map((signal, i) => (
                                <motion.div key={signal.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                    className={`p-6 border border-l-8 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all ${riskColor(signal.confidence)}`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`px-3 py-1 text-white text-[10px] font-bold rounded-full uppercase tracking-widest ${
                                                    signal.direction === 'BUY' ? 'bg-emerald-500' :
                                                    signal.direction === 'SELL' ? 'bg-red-500' :
                                                    'bg-stone-900'
                                                }`}>
                                                    {signal.direction}
                                                </div>
                                                <span className="text-xs font-mono text-stone-400">{signal.id}</span>
                                                <span className="text-[10px] uppercase font-bold text-stone-300">
                                                    {signal.type}
                                                </span>
                                                {signal.methodHash !== '0x' && (
                                                    <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-2 py-0.5 rounded uppercase">
                                                        {signal.methodHash}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                                                {signal.action} {signal.token !== 'EXECUTION' ? `· ${signal.token}` : ''}
                                                <span className="text-stone-400 text-base font-normal">by {signal.label}</span>
                                            </h3>
                                            <p className="text-sm text-stone-500 mt-2 leading-relaxed">
                                                Detection of Elite cluster movement on {signal.dex}. 
                                                Detected {new Date(signal.ts).toLocaleTimeString()} · Amount: {signal.amount}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-black text-stone-900 mb-1">{signal.usdValue}</div>
                                            <div className="flex items-center justify-end gap-2 mb-3">
                                                <span className="text-[10px] font-bold text-stone-400 uppercase">Confidence</span>
                                                <div className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px] font-mono font-bold">
                                                    {signal.confidence}%
                                                </div>
                                            </div>
                                            <a href={`https://etherscan.io/tx/${signal.hash}`} target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors">
                                                Verify On-Chain <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                    
                                    {/* Confidence bar */}
                                    <div className="mt-4 w-full h-1 bg-stone-50 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${signal.confidence}%` }} transition={{ duration: 1, delay: 0.5 }}
                                            className={`h-full ${signal.confidence >= 80 ? 'bg-red-500' : signal.confidence >= 60 ? 'bg-orange-500' : 'bg-stone-900'}`} />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

