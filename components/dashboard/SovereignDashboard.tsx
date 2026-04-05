"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { InstitutionalProShell }   from '@/components/dashboard/InstitutionalProShell';
import { ExternalEmbed }           from '@/components/dashboard/ExternalEmbed';
import { SovereignContractModal }  from '@/components/dashboard/SovereignContractModal';
import { DashboardErrorBoundary }  from '@/components/dashboard/DashboardErrorBoundary';

// ── Internal panels ───────────────────────────────────────────────────────────
import { PremiumMatrixStack }      from '@/components/premium/PremiumMatrixStack';
import PolymarketPanel             from '@/components/dashboard/PolymarketPanel';
import { LivePortfolio }           from '@/components/premium/LivePortfolio';
import { WatchlistTable }          from '@/components/dashboard/WatchlistTable';
import { NewPairsTable }           from '@/components/dashboard/NewPairsTable';
import { ApiTerminal }             from '@/components/dashboard/ApiTerminal';
import { AlertsPanel }             from '@/components/dashboard/AlertsPanel';
import { GainersLosersPanel }      from '@/components/dashboard/GainersLosersPanel';
import { NewsOfToday }             from '@/components/dashboard/NewsOfToday';
import { WhalePortfolio }          from '@/components/dashboard/WhalePortfolio';

// ── Icons for external-embed pages ────────────────────────────────────────────
import { Crown, GraduationCap, LifeBuoy, PieChart } from 'lucide-react';

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

// ── External page definitions ─────────────────────────────────────────────────
const EXTERNAL_PAGES: Partial<Record<TabId, {
    url:         string;
    title:       string;
    icon:        React.ReactNode;
    accentColor: string;
    description: string;
}>> = {
    'academy': {
        url:         'https://www.humanidfi.com/academy',
        title:       'Whale Academy',
        icon:        <GraduationCap size={16}/>,
        accentColor: '#627EEA',
        description: 'Professional-grade crypto education: whale intelligence, DeFi, API tools, and portfolio management.',
    },
    'support': {
        url:         'https://www.humanidfi.com/support',
        title:       'Whale Support',
        icon:        <LifeBuoy size={16}/>,
        accentColor: '#0052FF',
        description: 'Open tickets, browse the FAQ, and reach the support team directly.',
    },
    'gold-ticket': {
        url:         'https://www.humanidfi.com/ticket',
        title:       'Gold Ticket',
        icon:        <Crown size={16}/>,
        accentColor: '#D4AF37',
        description: 'Claim your one-time $5 NFT pass granting lifetime Sovereign access to the entire platform.',
    },
};

// ── Main router ───────────────────────────────────────────────────────────────
export default function SovereignDashboard() {
    const [activeTab, setActiveTab] = useState<TabId>('dashboard');

    const externalPage = EXTERNAL_PAGES[activeTab];

    return (
        <>
            <SovereignContractModal />
            <InstitutionalProShell
                activeTab={activeTab}
                onTabChange={(id) => setActiveTab(id as TabId)}
            >
                <DashboardErrorBoundary>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className="w-full h-full"
                        >
                            {/* ── External pages rendered via ExternalEmbed ── */}
                            {externalPage ? (
                                <ExternalEmbed {...externalPage} />

                            /* ── Internal panels ── */
                            ) : activeTab === 'dashboard'       ? <PremiumMatrixStack />
                              : activeTab === 'watchlist'        ? <WatchlistTable />
                              : activeTab === 'alerts'           ? <AlertsPanel />
                              : activeTab === 'multicharts'      ? <PolymarketPanel />
                              : activeTab === 'new-pairs'        ? <NewPairsTable />
                              : activeTab === 'gainers'          ? <GainersLosersPanel />
                              : activeTab === 'api'              ? <ApiTerminal />
                              : activeTab === 'portfolio'        ? <LivePortfolio />
                              : activeTab === 'news'             ? <NewsOfToday />
                              : activeTab === 'whale-portfolio'  ? <WhalePortfolio />
                              : null}
                        </motion.div>
                    </AnimatePresence>
                </DashboardErrorBoundary>
            </InstitutionalProShell>
        </>
    );
}
