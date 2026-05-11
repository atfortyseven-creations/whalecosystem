"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Skull, Zap, Shield, Database, Lock, Activity } from 'lucide-react';

// --- SHARED ACADEMIC CARD ---
const AcademicCard = ({ title, status, children }: { title: string; status: string; children: React.ReactNode }) => (
    <div className="border border-[#E5E5E5] bg-white p-6 flex flex-col h-full transition-all hover:border-[#050505]/20 group shadow-sm rounded-lg">
        <div className="flex items-center justify-between mb-6">
            <div className="text-[10px] font-bold tracking-[0.2em] text-[#888888] uppercase font-mono">{title}</div>
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00C076] animate-pulse" />
                <div className="text-[8px] text-[#00C076] font-bold uppercase">{status}</div>
            </div>
        </div>
        <div className="flex-1 overflow-hidden">
            {children}
        </div>
        <div className="mt-4 pt-4 border-t border-[#E5E5E5] flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[7px] text-[#A0A0A0] font-mono">PROTOCOL_STABLE // 0xAF47</span>
            <span className="text-[7px] text-[#A0A0A0] font-mono italic">Authentic Telemetry</span>
        </div>
    </div>
);

// 1. HEURISTIC ENTROPY SIMULATOR
export const HeuristicEntropySim = () => {
    const [points, setPoints] = useState<number[]>([]);
    
    useEffect(() => {
        const secureRandom = () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
        const interval = setInterval(() => {
            setPoints(prev => [...prev.slice(-19), secureRandom() * 100]);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            <AcademicCard title="CAPITAL_VARIANCE_MATRIX" status="Monitoring">
                <div className="h-48 flex items-end gap-1 px-2">
                    {points.map((p, i) => (
                        <div 
                            key={i} 
                            className="bg-[#050505]/10 w-full rounded-t-sm" 
                            style={{ height: `${p}%`, transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)' }} 
                        />
                    ))}
                </div>
            </AcademicCard>
            <div className="space-y-4">
                <div className="p-4 border border-[#FF3B30]/20 bg-[#FF3B30]/5 text-[#FF3B30] text-[10px] uppercase font-mono tracking-widest leading-relaxed rounded">
                    Notice: Volatility delta exceeded 0.82. Rebalancing operations detected.
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {[1,2,3,4].map(i => {
                        const secureRandom = () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
                        return (
                        <div key={i} className="p-4 border border-[#E5E5E5] bg-[#FAF9F6] rounded shadow-sm">
                            <div className="text-[8px] text-[#A0A0A0] mb-1">NODE_0x0{i}</div>
                            <div className="text-xl font-bold tracking-tighter text-[#050505]">{(secureRandom() * 10).toFixed(2)}σ</div>
                        </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// 2. ENTITY HEURISTIC SIMULATOR
export const EntityHeuristicSim = () => (
    <div className="space-y-8">
        <div className="flex items-center gap-4 p-4 border border-[#00C076]/20 bg-[#00C076]/5 rounded">
            <Zap size={16} className="text-[#00C076]" />
            <span className="text-[9px] font-bold tracking-[0.2em] text-[#00C076] uppercase">New Capital Flow Identified: BlackRock_Inbound_Buffer</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {['Block_Trade_Aggregates', 'OTC_Desk_Flows', 'Dormant_Institutional_Supply'].map(label => (
                <div key={label} className="p-6 border border-[#E5E5E5] bg-white rounded shadow-sm">
                    <div className="text-[10px] text-[#888888] mb-4 font-bold">{label}</div>
                    <div className="space-y-2">
                        {[1,2,3].map(i => (
                            <div key={i} className="flex justify-between items-center text-[9px] font-mono">
                                <span className="text-[#050505]">AGENT_{i * 88}</span>
                                <span className="text-[#00C076] font-bold">CONF_98%</span>
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
            { date: '2026-04-10', entry: 'Class-A dormant capital (1,200 BTC) reallocated to Custodian Prime.' },
            { date: '2026-04-06', entry: 'Network consensus upgraded to Institutional V1 stable tier.' }
        ].map((item, i) => (
            <div key={i} className="flex gap-6 items-start group">
                <div className="w-24 shrink-0 text-[10px] font-mono text-[#888888] mt-1">{item.date}</div>
                <div className="w-1 px-[1px] bg-[#E5E5E5] relative h-16 group-last:bg-transparent rounded-full">
                    <div className="w-2 h-2 rounded-full bg-[#050505] absolute -left-[3px] top-1" />
                </div>
                <div className="flex-1 pb-8">
                    <div className="text-[11px] text-[#050505] leading-relaxed font-mono tracking-tight uppercase">
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
            { label: 'AUDIT_FEED', val: 'Low_Latency' }
        ].map(item => (
            <div key={item.label} className="p-8 border border-[#E5E5E5] bg-white rounded shadow-sm flex flex-col items-center text-center transition-all hover:shadow-md hover:border-[#050505]/20">
                <Database size={24} className="text-[#888888] mb-4" />
                <div className="text-[8px] text-[#888888] mb-2 uppercase font-bold tracking-widest">{item.label}</div>
                <div className="text-sm font-bold tracking-widest text-[#050505] uppercase">{item.val}</div>
            </div>
        ))}
    </div>
);

// 5. DOCTRINE VIEW
export const DoctrineSim = () => (
    <div className="max-w-3xl mx-auto p-12 border border-[#E5E5E5] bg-white rounded-lg shadow-sm">
        <div className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight uppercase mb-4 text-[#050505]">Vanguard Principles v1.0</h2>
            <div className="w-12 h-[1px] bg-[#050505] mx-auto" />
        </div>
        <div className="space-y-8 font-serif italic text-[#555555] leading-loose text-sm">
            <p>"1. Identity is a cryptographic property, verified through consensus."</p>
            <p>"2. Liquidity represents objective truth across institutional ledgers."</p>
            <p>"3. Transparency is the foremost requirement for capital integrity."</p>
        </div>
    </div>
);

// 6. CLEARANCE PANEL
export const ClearanceSim = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
        <Shield size={64} className="text-[#050505]/20" />
        <div className="text-center">
            <div className="text-3xl font-bold tracking-widest text-[#050505] mb-2">TIER_1_ACCESS</div>
            <div className="text-[10px] text-[#A0A0A0] font-mono tracking-[0.2em] uppercase">Genesis Operator Verified</div>
        </div>
        <div className="flex gap-4">
            <button className="px-8 py-3 border border-[#050505] text-[#050505] text-[9px] font-bold tracking-widest uppercase hover:bg-[#050505] hover:text-white transition-colors rounded">
                Override Protocols
            </button>
            <button className="px-8 py-3 border border-[#E5E5E5] text-[#888888] text-[9px] font-bold tracking-widest uppercase hover:bg-[#FAF9F6] transition-colors rounded hover:text-[#050505]">
                Audit Clearances
            </button>
        </div>
    </div>
);
