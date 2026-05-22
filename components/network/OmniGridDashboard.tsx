"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Globe, Search, Zap } from 'lucide-react';
import { OMNI_CHAINS } from '@/lib/blockchain/OmniChainConstants';
import { ChainPulseCard } from './ChainPulseCard';
import { ForensicHistoryVisualizer } from './ForensicHistoryVisualizer';
import { MultiversePortfolio } from './MultiversePortfolio';
import { DarkForestRadar } from '../omni-grid/DarkForestRadar';
import { PredictionPulseFeed } from '../omni-grid/PredictionPulseFeed';
import { ConcentratedLiquidityMap } from '../omni-grid/ConcentratedLiquidityMap';
import { MigrationHologram } from '../omni-grid/MigrationHologram';

export function OmniGridDashboard() {
    const { data: healthData, isLoading } = useQuery({
        queryKey: ['multiverse', 'health'],
        queryFn: async () => {
            const res = await fetch('/api/network/multiverse/health');
            if (!res.ok) throw new Error('Multiverse Sync Failed');
            return res.json();
        },
        refetchInterval: 10000,
    });

    const activeCount = healthData?.filter((h: any) => h.isLive).length || 0;

    return (
        <div className="space-y-12 relative z-10">
            {/* Massive Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-12 gap-8">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                            <Globe size={24} className="text-indigo-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Research Wallet</span>
                    </div>
                </div>
            </div>

            {/* Multichain Portfolio Scanner */}
            <MultiversePortfolio />

            {/* The Grid of 33+ Chains */}
            <div className="space-y-6 pt-6">
                <div className="flex items-center gap-3 px-2">
                    <Zap size={18} className="text-amber-400" />
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Active Nodes</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {OMNI_CHAINS.map((chain, idx) => {
                        const metrics = healthData?.find((h: any) => h.id === chain.id);
                        return (
                            <ChainPulseCard 
                                key={chain.id} 
                                chain={chain} 
                                metrics={metrics}
                                delay={idx * 0.02} 
                            />
                        );
                    })}
                </div>
            </div>

            {/* Dark Data Grid: MEV, Whales, Liquidity, Bridges */}
            <div className="space-y-6 pt-6 relative z-10">
                <div className="flex items-center gap-3 px-2">
                    <Globe size={18} className="text-cyan-400" />
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Deep Liquidity & Analytics</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <DarkForestRadar />
                    <PredictionPulseFeed />
                    <ConcentratedLiquidityMap />
                    <MigrationHologram />
                </div>
            </div>

            {/* Forensic History Visualizer */}
            <ForensicHistoryVisualizer />

            {/* Legend / Status Footer */}
            <div className="flex flex-wrap items-center justify-center gap-12 pt-12 border-t border-white/10 opacity-70">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">L1 Settlement</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">L2 Compression</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">EVM Equivalence</span>
                </div>
                <div className="flex items-center gap-2">
                    <Zap size={10} className="text-orange-400" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">Zero-Knowledge Active</span>
                </div>
            </div>
        </div>
    );
}
