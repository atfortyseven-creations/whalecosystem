"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InstitutionalShell } from '@/components/shared/InstitutionalShell';
import { PremiumMatrixStack } from "@/components/premium/PremiumMatrixStack";
import ActivityFeedPanel from '@/components/network/ActivityFeedPanel';
import PolymarketPanel from '@/components/dashboard/PolymarketPanel';
import { CopyTradingArena } from '@/components/premium/CopyTradingArena';
import { LivePortfolio } from '@/components/premium/LivePortfolio';
import { Activity, LayoutGrid, Target, Wallet, BarChart2 } from 'lucide-react';
import "@/app/dashboard/dashboard.css";

type TabId = 'VIP_MATRIX' | 'ACTIVITY' | 'POLYMARKET' | 'DEFI_YIELD' | 'PORTFOLIO';

interface TabDef {
    id: TabId;
    label: string;
    icon: React.ReactNode;
}

const TABS: TabDef[] = [
    { id: 'VIP_MATRIX', label: 'ORDER BOOK', icon: <Target size={14} /> },
    { id: 'ACTIVITY', label: 'WHALE FLOW', icon: <Activity size={14} /> },
    { id: 'POLYMARKET', label: 'MARKETS AVAILABLE', icon: <BarChart2 size={14} /> },
    { id: 'DEFI_YIELD', label: 'COPY TRADING', icon: <LayoutGrid size={14} /> },
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
                                    <PremiumMatrixStack />
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
                                    <CopyTradingArena />
                                </div>
                            )}

                            {activeTab === 'PORTFOLIO' && (
                                <div className="h-full">
                                    <LivePortfolio />
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </InstitutionalShell>
    );
}
