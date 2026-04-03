"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { InstitutionalProShell } from '@/components/dashboard/InstitutionalProShell';
import { PremiumMatrixStack } from '@/components/premium/PremiumMatrixStack';
import PolymarketPanel from '@/components/dashboard/PolymarketPanel';
import { LivePortfolio } from '@/components/premium/LivePortfolio';
import { WatchlistTable } from '@/components/dashboard/WatchlistTable';
import { NewPairsTable } from '@/components/dashboard/NewPairsTable';
import { ApiTerminal } from '@/components/dashboard/ApiTerminal';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { GainersLosersPanel } from '@/components/dashboard/GainersLosersPanel';
import { WhalePortfolio } from '@/components/dashboard/WhalePortfolio';
import { NewsOfToday } from '@/components/dashboard/NewsOfToday';
import { WhaleSupport } from '@/components/dashboard/WhaleSupport';
import { WhaleAcademy } from '@/components/dashboard/WhaleAcademy';
import { GoldTicketPanel } from '@/components/dashboard/GoldTicketPanel';
import "@/app/dashboard/dashboard.css";

type TabId =
    | 'dashboard'
    | 'watchlist'
    | 'alerts'
    | 'multicharts'
    | 'new-pairs'
    | 'gainers'
    | 'api'
    | 'portfolio'
    | 'whale-portfolio'
    | 'news'
    | 'support'
    | 'academy'
    | 'gold-ticket';

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
                        {activeTab === 'dashboard'       && <PremiumMatrixStack />}
                        {activeTab === 'watchlist'       && <WatchlistTable />}
                        {activeTab === 'alerts'          && <AlertsPanel />}
                        {activeTab === 'multicharts'     && <PolymarketPanel />}
                        {activeTab === 'new-pairs'       && <NewPairsTable />}
                        {activeTab === 'gainers'         && <GainersLosersPanel />}
                        {activeTab === 'api'             && <ApiTerminal />}
                        {activeTab === 'portfolio'       && <LivePortfolio />}
                        {activeTab === 'whale-portfolio' && <WhalePortfolio />}
                        {activeTab === 'news'            && <NewsOfToday />}
                        {activeTab === 'support'         && <WhaleSupport />}
                        {activeTab === 'academy'         && <WhaleAcademy />}
                        {activeTab === 'gold-ticket'     && <GoldTicketPanel />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </InstitutionalProShell>
    );
}
