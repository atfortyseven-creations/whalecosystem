"use client";

import React, { useMemo } from 'react';
import { useVIPStore } from '@/lib/vip-store';

interface TacticalMetric {
    label: string;
    value: string;
    intensity: number; // 0 to 1
    trend: 'up' | 'down' | 'neutral';
    description: string;
}

export const TacticalPulseIntelligence: React.FC = () => {
    const { whaleEvents } = useVIPStore();

    const { metrics } = useMemo(() => {
        const events = whaleEvents || [];
        const recent = events.slice(0, 100);
        
        const buyVolume = recent.filter(e => e.action === 'BUY').reduce((acc, e) => acc + e.usdNum, 0);
        const sellVolume = recent.filter(e => e.action === 'SELL').reduce((acc, e) => acc + e.usdNum, 0);
        const totalVolume = buyVolume + sellVolume;
        const whaleVigor = totalVolume > 0 ? (buyVolume / totalVolume) * 100 : 50;
        
        // Dynamic Concentration (Top 3 as % of total)
        const sorted = [...recent].sort((a, b) => b.usdNum - a.usdNum);
        const top3Volume = sorted.slice(0, 3).reduce((acc, e) => acc + e.usdNum, 0);
        const concentration = totalVolume > 0 ? (top3Volume / totalVolume) : 0.45;

        // Dynamic Volatility (Std Dev of values)
        const avg = totalVolume / (recent.length || 1);
        const variance = recent.reduce((acc, e) => acc + Math.pow(e.usdNum - avg, 2), 0) / (recent.length || 1);
        const stdDev = Math.sqrt(variance);
        const volIntensity = Math.min(stdDev / 1_000_000, 1);

        // Dynamic Confidence (Buy ratio + Frequency)
        const buyRatio = totalVolume > 0 ? buyVolume / totalVolume : 0.5;
        const confidence = Math.min(500 + (buyRatio * 500), 999);

        const derivedMetrics: TacticalMetric[] = [
            { label: 'Whale Activity', value: `${whaleVigor.toFixed(1)}%`, intensity: whaleVigor/100, trend: whaleVigor > 50 ? 'up' : 'down', description: 'Real-time observation of large-scale buy and sell pressure.' },
            { label: 'Market Sentiment', value: buyVolume > sellVolume ? 'BULLISH' : 'BEARISH', intensity: buyRatio, trend: buyRatio > 0.5 ? 'up' : 'down', description: 'The prevailing bias derived from high-volume transaction clusters.' },
            { label: 'Order Concentration', value: concentration.toFixed(2), intensity: concentration, trend: concentration > 0.6 ? 'up' : 'neutral', description: 'Distribution density of pending large-block trade operations.' },
            { label: 'Market Volatility', value: volIntensity > 0.7 ? 'EXTREME' : (volIntensity > 0.4 ? 'DYNAMIC' : 'STABLE'), intensity: volIntensity, trend: volIntensity > 0.5 ? 'up' : 'neutral', description: 'Calculated deviation in price action and liquidity depth.' },
            { label: 'Whale Confidence', value: Math.floor(confidence).toString(), intensity: confidence/1000, trend: confidence > 800 ? 'up' : 'neutral', description: 'The absolute conviction level of non-retail participants.' }
        ];

        return { metrics: derivedMetrics };
    }, [whaleEvents]);

    return (
        <div className="flex flex-col gap-6 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {metrics.map((m, idx) => (
                    <div key={idx} className="group relative flex flex-col p-6 rounded-[2rem] border border-slate-100 hover:border-cyan-500/30 transition-all duration-500 bg-white shadow-xl shadow-slate-200/40">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[11px] text-slate-400 uppercase tracking-[0.2em] font-black">{m.label}</span>
                            <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px] ${m.trend === 'up' ? 'bg-[var(--aave-teal)] shadow-[var(--aave-teal)]/50' : m.trend === 'down' ? 'bg-rose-600 shadow-rose-600/50' : 'bg-slate-300'}`} />
                        </div>
                        
                        <div className="text-3xl font-black font-mono text-slate-900 tracking-tighter group-hover:text-[var(--aave-teal)] transition-colors duration-500">
                            {m.value}
                        </div>

                        <div className="mt-4 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-[var(--aave-teal)] via-[var(--aave-purple)] to-[var(--aave-teal)] transition-all duration-[1500ms] ease-out shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                                style={{ width: `${m.intensity * 100}%` }}
                            />
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-50 transition-all duration-500">
                            <p className="text-[8px] font-black uppercase leading-relaxed tracking-wider text-slate-400">
                                <span className="text-[var(--aave-teal)] block mb-1">Strategic Logic:</span>
                                {m.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};
