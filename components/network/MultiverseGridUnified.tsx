"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { LatestBlocks } from './LatestBlocks';
import { MempoolVisualizer } from './MempoolVisualizer';
import { MultiversePortfolio } from './MultiversePortfolio';
import { ChainPulseCard } from './ChainPulseCard';
import { LightningStats } from './LightningStats';
import { TopLightningNodes } from './TopLightningNodes';
import { HashrateVisualizer } from './HashrateVisualizer';
import { MiningPoolDistribution } from './MiningPoolDistribution';
import { DarkForestRadar } from '../omni-grid/DarkForestRadar';
import { PredictionPulseFeed } from '../omni-grid/PredictionPulseFeed';
import { ConcentratedLiquidityMap } from '../omni-grid/ConcentratedLiquidityMap';
import { MigrationHologram } from '../omni-grid/MigrationHologram';
import { OMNI_CHAINS } from '@/lib/blockchain/OmniChainConstants';
import { useQuery } from '@tanstack/react-query';

export function MultiverseGridUnified() {
    const { data: healthData } = useQuery({
        queryKey: ['multiverse', 'health'],
        queryFn: async () => {
            const res = await fetch('/api/network/multiverse/health');
            if (!res.ok) throw new Error('Multiverse Sync Failed');
            return res.json();
        },
        refetchInterval: 10000,
    });

    return (
        <div className="space-y-12">
            {/* Top Tier: Mempool & Blocks - The Core Pulse */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
                <div className="h-[600px]">
                    <LatestBlocks hideHeader={true} />
                </div>
                <div className="space-y-8">
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 h-fit">
                        <MempoolVisualizer hideHeader={true} />
                    </div>
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 h-fit">
                        <LightningStats hideHeader={true} />
                    </div>
                </div>
            </div>

            {/* Second Tier: Portfolio Discovery */}
            <MultiversePortfolio />

            {/* Third Tier: Hashrate & Mining Security */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8">
                    <HashrateVisualizer hideHeader={true} />
                </div>
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8">
                    <MiningPoolDistribution hideHeader={true} />
                </div>
            </div>

            {/* Fourth Tier: Lightning Network Infrastructure */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[4rem] overflow-hidden">
                <TopLightningNodes />
            </div>

            {/* Fifth Tier: The Active Grid (33+ Chains) */}
            <div className="space-y-6">
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

            {/* Sixth Tier: Deep Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <DarkForestRadar />
                <PredictionPulseFeed />
                <ConcentratedLiquidityMap />
                <MigrationHologram />
            </div>
        </div>
    );
}
