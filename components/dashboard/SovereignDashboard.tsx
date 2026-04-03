"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InstitutionalProShell } from '@/components/dashboard/InstitutionalProShell';
import { PremiumMatrixStack } from "@/components/premium/PremiumMatrixStack";
import ActivityFeedPanel from '@/components/network/ActivityFeedPanel';
import PolymarketPanel from '@/components/dashboard/PolymarketPanel';
import { CopyTradingArena } from '@/components/premium/CopyTradingArena';
import { LivePortfolio } from '@/components/premium/LivePortfolio';
import "@/app/dashboard/dashboard.css";

type TabId = 'dashboard' | 'watchlist' | 'alerts' | 'multicharts' | 'new-pairs' | 'gainers' | 'api' | 'portfolio';

export default function SovereignDashboard() {
    const [activeTab, setActiveTab] = useState<TabId>('dashboard');

    return (
        <InstitutionalProShell 
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabId)}
        >
            <div className="w-full h-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full"
                    >
                        {activeTab === 'dashboard' && (
                            <PremiumMatrixStack />
                        )}

                        {activeTab === 'gainers' && (
                            <ActivityFeedPanel />
                        )}

                        {activeTab === 'multicharts' && (
                            <PolymarketPanel />
                        )}

                        {activeTab === 'alerts' && (
                            <div className="flex flex-col items-center justify-center h-[60vh] text-center border-2 border-dashed border-[#E5E5E5] rounded-[3rem] bg-[#FAF9F6]">
                                <span className="text-sm font-black text-[#050505] uppercase tracking-widest mb-2">Neural Alerts System</span>
                                <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">Connect your webhook in settings to activate real-time pulse notifications.</p>
                            </div>
                        )}

                        {activeTab === 'watchlist' && (
                            <div className="flex flex-col items-center justify-center h-[60vh] text-center border-2 border-dashed border-[#E5E5E5] rounded-[3rem] bg-[#FAF9F6]">
                                <span className="text-sm font-black text-[#050505] uppercase tracking-widest mb-2">Institutional Watchlist</span>
                                <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">Star any asset in the dashboard to track it here in high-fidelity.</p>
                            </div>
                        )}

                        {activeTab === 'portfolio' && (
                            <LivePortfolio />
                        )}
                        
                        {/* Fallback for others */}
                        {['new-pairs', 'api'].includes(activeTab) && (
                            <div className="flex flex-col items-center justify-center h-[60vh] text-center border-2 border-dashed border-[#E5E5E5] rounded-[3rem] bg-[#FAF9F6]">
                                <span className="text-sm font-black text-[#050505] uppercase tracking-widest mb-2">{activeTab.replace('-', ' ').toUpperCase()} INTERFACE</span>
                                <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">Integrating on-chain Teranode endpoints for maximal precision...</p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </InstitutionalProShell>
    );
}
