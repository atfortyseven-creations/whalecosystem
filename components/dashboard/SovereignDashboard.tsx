"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InstitutionalProShell } from '@/components/dashboard/InstitutionalProShell';
import { PremiumMatrixStack } from '@/components/premium/PremiumMatrixStack';
import PolymarketPanel from '@/components/dashboard/PolymarketPanel';
import { LivePortfolio } from '@/components/premium/LivePortfolio';
import { WatchlistTable } from '@/components/dashboard/WatchlistTable';
import { NewPairsTable } from '@/components/dashboard/NewPairsTable';
import { ApiTerminal } from '@/components/dashboard/ApiTerminal';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { GainersLosersPanel } from '@/components/dashboard/GainersLosersPanel';
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
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="w-full h-full"
                    >
                        {/* ─────────── DASHBOARD ─────────── */}
                        {activeTab === 'dashboard' && (
                            <PremiumMatrixStack />
                        )}

                        {/* ─────────── WATCHLIST ─────────── */}
                        {activeTab === 'watchlist' && (
                            <WatchlistTable />
                        )}

                        {/* ─────────── ALERTS ─────────── */}
                        {activeTab === 'alerts' && (
                            <AlertsPanel />
                        )}

                        {/* ─────────── MULTICHARTS ─────────── */}
                        {activeTab === 'multicharts' && (
                            <PolymarketPanel />
                        )}

                        {/* ─────────── NEW PAIRS ─────────── */}
                        {activeTab === 'new-pairs' && (
                            <NewPairsTable />
                        )}

                        {/* ─────────── GAINERS & LOSERS ─────────── */}
                        {activeTab === 'gainers' && (
                            <GainersLosersPanel />
                        )}

                        {/* ─────────── API TERMINAL ─────────── */}
                        {activeTab === 'api' && (
                            <ApiTerminal />
                        )}

                        {/* ─────────── PORTFOLIO ─────────── */}
                        {activeTab === 'portfolio' && (
                            <LivePortfolio />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </InstitutionalProShell>
    );
}
