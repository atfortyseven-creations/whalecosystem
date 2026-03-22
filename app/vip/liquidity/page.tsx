"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, TrendingUp, TrendingDown, ArrowRightLeft, Activity, Info, AlertCircle, Zap } from 'lucide-react';
import { useVIPStore } from '@/lib/vip-store';
import { useVIPIntelligence } from '@/hooks/useVIPIntelligence';

export default function LiquidityContractionPage() {
    const { fundingRates } = useVIPStore();
    const { stats, isStreaming } = useVIPIntelligence();

    if (!fundingRates || fundingRates.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-stone-400">
                <Waves className="w-12 h-12 animate-bounce mb-4 opacity-20" />
                <p className="font-mono text-xs uppercase tracking-widest animate-pulse">Calculating Funding Arbitrage...</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
            {/* Header section */}
            <div className="mb-10 p-1 bg-stone-100 rounded-[40px] shadow-inner">
                <div className="bg-white rounded-[38px] p-8 md:p-12 border border-stone-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="max-w-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-stone-900 rounded-2xl shadow-lg">
                                    <Waves className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Volatility Matrix Engine</span>
                            </div>
                            <h1 className="text-6xl font-normal tracking-tighter text-stone-900 mb-4">Liquidity Contraction</h1>
                            <p className="text-stone-500 font-light text-lg">Cross-Exchange Funding Rate Differential. Identifying liquidity discrepancies for arbitrage and massive breakout prediction.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 rounded-full border-8 border-emerald-500 flex items-center justify-center relative">
                                <div className="text-xl font-black text-stone-900">{stats.liquidityContraction}%</div>
                                <div className="absolute -bottom-2 bg-stone-900 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">Stability</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Highlights */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-8 border border-stone-200 rounded-[32px] bg-white shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-6 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Global Insight
                        </h3>
                        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 mb-6">
                            <h4 className="text-sm font-bold text-stone-900 mb-2">Global Liquidity: STABLE</h4>
                            <p className="text-[11px] text-stone-500 leading-relaxed">No massive containment walls detected outside the norm. The system detects a sideways accumulation phase.</p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs px-2">
                                <span className="text-stone-400">Max Spread</span>
                                <span className="font-mono font-bold text-stone-900">0.024%</span>
                            </div>
                            <div className="flex items-center justify-between text-xs px-2">
                                <span className="text-stone-400">Stream Status</span>
                                <span className="font-mono text-emerald-500 lowercase flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Block {stats.currentBlock}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 border border-stone-200 rounded-[32px] bg-white shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-6 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                            Anomalías Funding
                        </h3>
                        <div className="flex flex-col items-center py-4">
                            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                                <Activity className="w-6 h-6 text-emerald-500" />
                            </div>
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Normal Rhythm</span>
                        </div>
                    </div>
                </div>

                {/* Main Spread Table */}
                <div className="lg:col-span-3">
                    <div className="p-8 border border-stone-200 rounded-[32px] bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Funding Rate Matrix (Binance vs Bybit)</h3>
                        </div>

                        <div className="space-y-2">
                            <div className="grid grid-cols-5 md:grid-cols-6 items-center px-4 py-3 bg-stone-50 rounded-xl text-[10px] font-bold uppercase tracking-widest text-stone-400">
                                <div className="col-span-1">Symbol</div>
                                <div className="hidden md:block">Binance FR</div>
                                <div className="hidden md:block">Bybit FR</div>
                                <div className="col-span-2 text-center">Spread Delta</div>
                                <div className="text-right">Signal</div>
                            </div>
                            
                            <AnimatePresence>
                                {fundingRates.map((rate, i) => (
                                    <motion.div key={rate.symbol} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                        className="grid grid-cols-5 md:grid-cols-6 items-center px-4 py-5 hover:bg-stone-50 border-b border-stone-100 last:border-0 transition-colors group">
                                        
                                        <div className="col-span-1 font-bold text-stone-900">{rate.symbol}</div>
                                        
                                        <div className="hidden md:block font-mono text-xs text-stone-400">{(rate.binance * 100).toFixed(4)}%</div>
                                        <div className="hidden md:block font-mono text-xs text-stone-400">{(rate.bybit * 100).toFixed(4)}%</div>
                                        
                                        <div className="col-span-2 flex flex-col items-center">
                                            <div className="font-mono text-sm font-black text-stone-900">{(rate.spread * 100).toFixed(4)}%</div>
                                            <div className="text-[8px] font-bold text-stone-400 uppercase tracking-tighter">Annualized: {rate.annualizedPct.toFixed(2)}% APR</div>
                                        </div>

                                        <div className="text-right">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                                                rate.signal === 'CONTRACTION' ? 'bg-red-500 text-white' : 
                                                rate.signal === 'EXPANSION' ? 'bg-emerald-500 text-white' : 
                                                'bg-stone-100 text-stone-500'
                                            }`}>
                                                {rate.signal}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-2 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <Zap className="w-4 h-4 text-emerald-500" />
                            <p className="text-[11px] font-bold text-emerald-800">Arbitrage detected: Use funding spread on SOLUSDT for neutral hedging.</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

