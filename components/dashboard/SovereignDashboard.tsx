"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InstitutionalShell } from '@/components/shared/InstitutionalShell';
import { MasterMatrix as MasterMatrixComponent } from "@/components/premium/MasterMatrix";
import ActivityFeedPanel from '@/components/network/ActivityFeedPanel';
import PolymarketPanel from '@/components/dashboard/PolymarketPanel';
import DeFiYieldPanel from '@/components/dashboard/DeFiYieldPanel';
import { TokenPortfolio } from '@/components/dashboard/TokenPortfolio';
import { Activity, LayoutGrid, Target, Wallet, BarChart2 } from 'lucide-react';
import "@/app/dashboard/dashboard.css";

type TabId = 'VIP_MATRIX' | 'ACTIVITY' | 'POLYMARKET' | 'DEFI_YIELD' | 'PORTFOLIO';

interface TabDef {
    id: TabId;
    label: string;
    icon: React.ReactNode;
}

const TABS: TabDef[] = [
    { id: 'VIP_MATRIX', label: 'VIP MATRIX', icon: <Target size={14} /> },
    { id: 'ACTIVITY', label: 'NETWORK ACTIVITY', icon: <Activity size={14} /> },
    { id: 'POLYMARKET', label: 'PREDICTION MARKETS', icon: <BarChart2 size={14} /> },
    { id: 'DEFI_YIELD', label: 'DEFI YIELD', icon: <LayoutGrid size={14} /> },
    { id: 'PORTFOLIO', label: 'PORTFOLIO', icon: <Wallet size={14} /> },
];

export default function SovereignDashboard() {
    const [activeTab, setActiveTab] = useState<TabId>('VIP_MATRIX');

    return (
        <InstitutionalShell 
            title="SYSTEM HUB" 
            subtitle="Sovereign Control Center" 
            badge="LIVE" 
            badgeVariant="orchid"
            fullWidth={true}
        >
            <div className="w-full flex flex-col bg-[#050505]">
                {/* ─── Premium Horizontal Tab Bar ─── */}
                <div className="border-b border-white/10 bg-[#0a0a0a] sticky top-[65px] z-40 px-6 pt-6">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-[-1px]">
                        {TABS.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        relative px-6 py-3 flex items-center gap-2 text-[11px] font-mono tracking-[0.15em] uppercase transition-all whitespace-nowrap
                                        ${isActive ? 'text-white' : 'text-white/40 hover:text-white/70'}
                                    `}
                                >
                                    {isActive && (
                                        <motion.div 
                                            layoutId="system-active-tab"
                                            className="absolute inset-0 bg-white/[0.05] border-t-2 border-[#a855f7] rounded-t-lg z-0"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        <span className={isActive ? 'text-[#a855f7]' : ''}>{tab.icon}</span>
                                        <span className="font-bold">{tab.label}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ─── Main Content Area ─── */}
                <div className="w-full relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="w-full min-h-full"
                        >
                            {activeTab === 'VIP_MATRIX' && (
                                <div className="p-0">
                                    <MasterMatrixComponent />
                                </div>
                            )}

                            {activeTab === 'ACTIVITY' && (
                                <div className="p-6 max-w-[1600px] mx-auto">
                                    <ActivityFeedPanel />
                                </div>
                            )}

                            {activeTab === 'POLYMARKET' && (
                                <div className="h-full">
                                    <PolymarketPanel />
                                </div>
                            )}

                            {activeTab === 'DEFI_YIELD' && (
                                <div className="h-full">
                                    <DeFiYieldPanel />
                                </div>
                            )}

                            {activeTab === 'PORTFOLIO' && (
                                <div className="p-6 max-w-4xl mx-auto mt-10">
                                    <div className="text-center mb-8">
                                        <h2 className="text-3xl font-bold font-mono text-white mb-2 tracking-tight">CUSTODIA SEGURA</h2>
                                        <p className="text-sm font-mono text-white/40 uppercase tracking-widest">Verificación On-Chain en Tiempo Real</p>
                                    </div>
                                    <TokenPortfolio />
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </InstitutionalShell>
    );
}
