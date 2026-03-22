"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, TrendingDown, ArrowRight, Gauge, AlertCircle, Info, Maximize2 } from 'lucide-react';
import { useVIPStore } from '@/lib/vip-store';
import { useVIPIntelligence } from '@/hooks/useVIPIntelligence';

export default function ExchangeCockpitPage() {
    const { ethPrice, btcPrice } = useVIPStore();
    const { stats, isStreaming } = useVIPIntelligence();
    const gasGwei = stats.baseFee;
    const blockNumber = stats.currentBlock;

    if (!ethPrice || !blockNumber) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-stone-400">
                <Gauge className="w-12 h-12 animate-spin mb-4 opacity-20" />
                <p className="font-mono text-xs uppercase tracking-widest animate-pulse">Establishing Secure RPC Connection...</p>
            </div>
        );
    }

    // We removed all fake liquidation logic
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
            {/* Header Content */}
            <div className="mb-8 border-b border-stone-200 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-[#00ff9d]/10 border border-[#00ff9d]/20 rounded-lg">
                            <Target className="w-5 h-5 text-[#00ff9d]" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-[#00ff9d]">L1 Mainnet Stream</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-white mb-2">Master Matrix</h1>
                    <p className="text-gray-400 font-medium max-w-xl">Scanning capital gravity in the current block. Connection injected via Chainlink Price Feeds and resilient RPC Nodes.</p>
                </div>
                
                <div className="text-right flex items-center justify-end gap-12">
                     <div className="text-right">
                        <div className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] mb-1">Last Block</div>
                        <div className="text-4xl font-black text-[#00ff9d] font-mono">{blockNumber.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] mb-1">Index Price (ETH)</div>
                        <div className="text-4xl font-black text-white">${ethPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className="text-[9px] text-gray-500 font-mono mt-1 uppercase flex items-center justify-end gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse" />
                            Stream Active via Wagmi (Block {blockNumber})
                        </div>
                    </div>
                </div>
            </div>

            {/* Core Metrics Gauges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="p-8 border border-white/5 rounded-[32px] bg-black/40 backdrop-blur-3xl shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Métricas de Red Activa</h3>
                        <Gauge className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center space-y-8">
                        <div>
                           <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">Presión de Red (Gwei)</div>
                           <div className="flex items-end gap-4">
                               <div className="text-5xl font-black text-white font-mono">{gasGwei.toFixed(2)}</div>
                               <div className="text-sm font-bold text-gray-400 mb-1">Gwei Base Fee</div>
                           </div>
                           <div className="mt-4 w-full h-2 bg-white/5 rounded-full overflow-hidden">
                               <motion.div 
                                   animate={{ width: `${Math.min(100, (gasGwei / 100) * 100)}%` }} 
                                   className={`h-full ${gasGwei > 40 ? 'bg-red-500' : gasGwei > 20 ? 'bg-amber-500' : 'bg-[#00ff9d]'}`} 
                               />
                           </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 border border-white/5 rounded-[32px] bg-black/40 backdrop-blur-3xl shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="w-5 h-5 text-[#00ff9d]" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Cotizaciones Oráculo (Chainlink)</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#627eea] flex items-center justify-center">
                                    <span className="text-white font-black text-xs">ETH</span>
                                </div>
                                <div>
                                    <div className="text-xs font-black text-white">Ethereum</div>
                                    <div className="text-[10px] font-mono text-gray-500 uppercase">ETH/USD</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-black text-white font-mono">${ethPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                <div className="text-[10px] text-[#00ff9d] font-bold uppercase tracking-widest">Oráculo Activo</div>
                            </div>
                        </div>

                        <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#f7931a] flex items-center justify-center">
                                    <span className="text-white font-black text-xs">BTC</span>
                                </div>
                                <div>
                                    <div className="text-xs font-black text-white">Bitcoin</div>
                                    <div className="text-[10px] font-mono text-gray-500 uppercase">BTC/USD</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-black text-white font-mono">${btcPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                <div className="text-[10px] text-[#00ff9d] font-bold uppercase tracking-widest">Oráculo Activo</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

