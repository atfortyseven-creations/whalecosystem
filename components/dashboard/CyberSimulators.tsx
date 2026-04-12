"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Skull, Zap, Shield, Database, Lock, Activity } from 'lucide-react';

// --- SHARED ACADEMIC CARD ---
const AcademicCard = ({ title, status, children }: { title: string; status: string; children: React.ReactNode }) => (
    <div className="border border-white/5 bg-white/[0.02] p-6 flex flex-col h-full transform-gpu transition-all hover:border-white/10 group">
        <div className="flex items-center justify-between mb-6">
            <div className="text-[10px] font-black tracking-widest text-white/40 uppercase font-mono">{title}</div>
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <div className="text-[8px] text-emerald-400 font-mono uppercase">{status}</div>
            </div>
        </div>
        <div className="flex-1 overflow-hidden">
            {children}
        </div>
        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[7px] text-white/10 font-mono">PROTOCOL_STABLE // 0xAF47</span>
            <span className="text-[7px] text-white/20 font-mono italic">Authentic Telemetry</span>
        </div>
    </div>
);

// 1. HEURISTIC ENTROPY SIMULATOR
export const HeuristicEntropySim = () => {
    const [points, setPoints] = useState<number[]>([]);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setPoints(prev => [...prev.slice(-19), Math.random() * 100]);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            <AcademicCard title="Thermal_Variance_Matrix" status="Monitoring">
                <div className="h-48 flex items-end gap-1 px-2">
                    {points.map((p, i) => (
                        <div 
                            key={i} 
                            className="bg-emerald-500/20 w-full" 
                            style={{ height: `${p}%`, transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)' }} 
                        />
                    ))}
                </div>
            </AcademicCard>
            <div className="space-y-4">
                <div className="p-4 border border-white/5 bg-rose-500/5 text-rose-400/80 text-[10px] uppercase font-mono tracking-widest leading-relaxed">
                    Warning: Market entropy delta exceeded 0.82. Stochastic anomalies detected in regional L2 nodes.
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="p-4 border border-white/5 bg-white/[0.01]">
                            <div className="text-[8px] text-white/20 mb-1">NODE_0x0{i}</div>
                            <div className="text-xl font-bold tracking-tighter text-white/80">{(Math.random() * 10).toFixed(2)}σ</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// 2. ENTITY HEURISTIC SIMULATOR
export const EntityHeuristicSim = () => (
    <div className="space-y-8">
        <div className="flex items-center gap-4 p-4 border border-white/10 bg-emerald-500/5 animate-pulse">
            <Zap size={16} className="text-emerald-400" />
            <span className="text-[9px] font-black tracking-[0.3em] text-emerald-400 uppercase">New Cluster Identified: BlackRock_Inbound_Buffer</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {['Whale_Cluster_Alpha', 'Exchanges_Hot', 'Dormant_Supply'].map(label => (
                <div key={label} className="p-6 border border-white/5 bg-white/[0.02]">
                    <div className="text-[10px] text-white/40 mb-4">{label}</div>
                    <div className="space-y-2">
                        {[1,2,3].map(i => (
                            <div key={i} className="flex justify-between items-center text-[9px] font-mono">
                                <span className="text-white/20">AGENT_{i * 88}</span>
                                <span className="text-emerald-400/60">CONF_98%</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// 3. CHRONO CIPHER SIMULATOR
export const ChronoCipherSim = () => (
    <div className="max-w-4xl mx-auto space-y-6">
        {[
            { date: '2026-04-12', entry: 'Institutional liquidity pivot detected in Polygon zkEVM.' },
            { date: '2026-04-10', entry: 'BTC dormant for 12 years (1,200 BTC) moved to Coinbase Prime.' },
            { date: '2026-04-06', entry: 'Network consensus upgraded to Genesis V1 stable tier.' }
        ].map((item, i) => (
            <div key={i} className="flex gap-6 items-start group">
                <div className="w-24 shrink-0 text-[10px] font-mono text-white/20 mt-1">{item.date}</div>
                <div className="w-1 px-[1px] bg-white/5 relative h-16 group-last:bg-transparent">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 absolute -left-[3px] top-1" />
                </div>
                <div className="flex-1 pb-8">
                    <div className="text-[11px] text-white/60 leading-relaxed font-mono tracking-tight uppercase">
                        {item.entry}
                    </div>
                </div>
            </div>
        ))}
    </div>
);

// 4. STATE PROTOCOL SIMULATOR
export const StateProtocolSim = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
            { label: 'RPC_RELAY', val: 'Optimal' },
            { label: 'L2_GATEWAY', val: 'Synchronized' },
            { label: 'ZK_VALIDATOR', val: 'Active' },
            { label: 'ORACLE_FEED', val: 'Low_Latency' }
        ].map(item => (
            <div key={item.label} className="p-8 border border-white/5 bg-white/[0.02] flex flex-col items-center text-center">
                <Database size={24} className="text-white/10 mb-4" />
                <div className="text-[8px] text-white/20 mb-2 uppercase font-black">{item.label}</div>
                <div className="text-sm font-bold tracking-widest text-[#D4AF37] uppercase">{item.val}</div>
            </div>
        ))}
    </div>
);

// 5. DOCTRINE VIEW
export const DoctrineSim = () => (
    <div className="max-w-3xl mx-auto p-12 border border-white/5 bg-white/[0.01]">
        <div className="text-center mb-12">
            <h2 className="text-2xl font-black tracking-tighter uppercase mb-4">Sovereign Doctrine v1.0</h2>
            <div className="w-12 h-[1px] bg-[#D4AF37] mx-auto" />
        </div>
        <div className="space-y-8 font-serif italic text-white/40 leading-loose text-sm">
            <p>"1. Identity is a cryptographic property, not a government grant."</p>
            <p>"2. Liquidity is the global objective truth. Price is a local hallucination."</p>
            <p>"3. Transparency is the only defense against institutional entropy."</p>
        </div>
    </div>
);

// 6. CLEARANCE PANEL
export const ClearanceSim = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
        <Shield size={64} className="text-emerald-500/20" />
        <div className="text-center">
            <div className="text-3xl font-black tracking-widest text-emerald-400 mb-2">ACCESS_LEVEL_6</div>
            <div className="text-[10px] text-white/20 font-mono tracking-[0.5em] uppercase">Genesis Operator Confirmed</div>
        </div>
        <div className="flex gap-4">
            <button className="px-8 py-3 border border-emerald-500/40 text-emerald-400 text-[9px] font-black tracking-widest uppercase hover:bg-emerald-500/10 transition-colors">
                Override Protocols
            </button>
            <button className="px-8 py-3 border border-white/10 text-white/40 text-[9px] font-black tracking-widest uppercase hover:bg-white/5 transition-colors">
                Audit Clearances
            </button>
        </div>
    </div>
);
