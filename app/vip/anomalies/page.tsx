"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, AlertTriangle, Activity, Target, ShieldAlert, Cpu, ExternalLink } from 'lucide-react';
import { useVIPStore } from '@/lib/vip-store';

export default function AnomaliesPage() {
    const { whaleEvents, lastWhaleUpdate } = useVIPStore();

    const riskColor = (score: number) =>
        score >= 80 ? 'text-red-600 border-l-red-500 bg-red-50/60' :
        score >= 60 ? 'text-orange-600 border-l-orange-400 bg-orange-50/60' :
        'text-blue-600 border-l-blue-400 bg-blue-50/60';

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="w-full">
            
            <div className="mb-10 border-b border-stone-200 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-stone-900 rounded-lg">
                            <ScanLine className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Neural Risk Engine</span>
                    </div>
                    <h1 className="text-5xl font-normal tracking-tighter text-stone-900 mb-2">Systemic Risk Anomalies</h1>
                    <p className="text-stone-500 font-light max-w-xl">Anomalous patterns detected in Elite capital flow. Real-time Bayesian classification.</p>
                </div>
                
                <div className="text-right">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-stone-200 bg-white/50 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">Etherscan Sync</span>
                    </div>
                    <div className="text-[9px] text-stone-400 font-mono uppercase">Sync: {new Date(lastWhaleUpdate).toLocaleTimeString()}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Score Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-8 border border-stone-200 rounded-[32px] bg-white shadow-sm flex flex-col items-center text-center">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4">Systemic Index</h3>
                        <div className="relative w-32 h-32 mb-4">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                <circle className="text-stone-100 stroke-current" strokeWidth="8" fill="transparent" r="40" cx="50" cy="50" />
                                <circle className="text-red-500 stroke-current transition-all duration-1000" strokeWidth="8" strokeLinecap="round" fill="transparent" r="40" cx="50" cy="50" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * 0.74)} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-stone-900">74%</span>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-red-500 uppercase">Elevated Risk</span>
                    </div>

                    <div className="p-8 border border-stone-200 rounded-[32px] bg-white shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-6 flex items-center gap-2">
                            <Cpu className="w-4 h-4" />
                            Model Status
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-stone-500">Bayesian Filter</span>
                                <span className="text-[10px] font-bold text-emerald-500 uppercase">Active</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-stone-500">Neural Weights</span>
                                <span className="text-[10px] font-bold text-stone-900 uppercase">v2.41r1</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Anomalies Stream */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4" />
                            Detected Anomaly Buffer
                        </h2>
                    </div>

                    {whaleEvents.length === 0 ? (
                        <div className="flex items-center gap-3 text-stone-400 text-sm p-20 border-2 border-dashed border-stone-100 rounded-[32px] justify-center bg-stone-50/50">
                            <Activity className="w-4 h-4 animate-pulse" />
                            Scanning patterns in whale wallets...
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <AnimatePresence>
                                {whaleEvents.slice(0, 10).map((signal, i) => (
                                    <motion.div key={signal.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                        className={`p-6 border border-l-4 rounded-3xl group hover:shadow-xl hover:-translate-y-1 transition-all ${riskColor(signal.confidence)}`}>
                                        <div className="flex items-start gap-4">
                                            <AlertTriangle className={`w-6 h-6 shrink-0 mt-0.5 ${signal.confidence >= 80 ? 'text-red-500' : 'text-orange-500'}`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="font-black text-stone-900 text-lg uppercase tracking-tight">{signal.type} Detected</span>
                                                    <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md uppercase tracking-widest">Confidence {signal.confidence}%</span>
                                                </div>
                                                <div className="text-xs text-stone-500 font-mono mb-2 uppercase tracking-tighter">
                                                    {signal.wallet} · {signal.token} · {signal.action}
                                                </div>
                                                <p className="text-xs text-stone-400 leading-relaxed max-w-lg">
                                                    This anomaly represents an Elite exit pattern from a known {signal.tier} group. 
                                                    Recommended action: monitor liquidations in cockpit for imminent price volatility.
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                                <div className="text-2xl font-black text-stone-900">{signal.usdValue}</div>
                                                <div className="text-[9px] text-stone-400 font-mono mt-2">{new Date(signal.ts).toLocaleTimeString()}</div>
                                                <a href={`https://etherscan.io/tx/${signal.hash}`} target="_blank" rel="noopener noreferrer"
                                                    className="mt-3 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors">
                                                    Evidence <ExternalLink size={10} />
                                                </a>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

