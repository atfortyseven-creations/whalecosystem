"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { WhaleProShell }          from '@/components/dashboard/WhaleProShell';
import { ExternalEmbed }           from '@/components/dashboard/ExternalEmbed';
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
import { OmniExplorer }            from '@/components/dashboard/OmniExplorer';

import { WhaleAcademy }            from '@/components/dashboard/WhaleAcademy';
import { WhaleSupport }            from '@/components/dashboard/WhaleSupport';
import { GoldTicketPanel }         from '@/components/dashboard/GoldTicketPanel';

// ── Icons for external-embed pages ────────────────────────────────────────────
import { Crown, GraduationCap, LifeBuoy, PieChart, Briefcase } from 'lucide-react';

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
    | 'omni-explorer'
    | 'support'
    | 'humanidfi-portfolio'
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
    'humanidfi-portfolio': {
        url:         'https://www.humanidfi.com/portfolio',
        title:       'Whale Portfolio',
        icon:        <Briefcase size={16}/>,
        accentColor: '#00C076',
        description: 'Manage and connect your premium portfolio directly via HumanIDFi.',
    },
    'gold-ticket': {
        url:         'https://www.humanidfi.com/ticket',
        title:       'Whale Access Ticket',
        icon:        <Crown size={16}/>,
        accentColor: '#D4AF37',
        description: 'Claim your one-time permanent pass granting lifetime access to the entire platform.',
    },
};

export default function WhaleDashboard() {
    const [activeTab, setActiveTab] = useState<TabId>('dashboard');

    return (
        <WhaleProShell
            activeTab={activeTab}
            onTabChange={(id: string) => setActiveTab(id as TabId)}
            isExternalEmbed={false}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="w-full h-full flex flex-col"
                >
                    {
                        activeTab === 'dashboard'            ? <DashboardErrorBoundary key="dashboard">      <PremiumMatrixStack />   </DashboardErrorBoundary>
                      : activeTab === 'watchlist'            ? <DashboardErrorBoundary key="watchlist">      <WatchlistTable />       </DashboardErrorBoundary>
                      : activeTab === 'alerts'               ? <DashboardErrorBoundary key="alerts">         <AlertsPanel />          </DashboardErrorBoundary>
                      : activeTab === 'multicharts'          ? <DashboardErrorBoundary key="multicharts">    <PolymarketPanel />      </DashboardErrorBoundary>
                      : activeTab === 'new-pairs'            ? <DashboardErrorBoundary key="new-pairs">      <NewPairsTable />        </DashboardErrorBoundary>
                      : activeTab === 'gainers'              ? <DashboardErrorBoundary key="gainers">        <GainersLosersPanel />   </DashboardErrorBoundary>
                      : activeTab === 'whale-portfolio'      ? <DashboardErrorBoundary key="whale-portfolio"><WhalePortfolio />       </DashboardErrorBoundary>
                      : activeTab === 'news'                 ? <DashboardErrorBoundary key="news">           <NewsOfToday />          </DashboardErrorBoundary>
                      : activeTab === 'omni-explorer'        ? <DashboardErrorBoundary key="omni-explorer">  <OmniExplorer />         </DashboardErrorBoundary>
                      : activeTab === 'api'                  ? <DashboardErrorBoundary key="api">            <ApiTerminal />          </DashboardErrorBoundary>
                      : activeTab === 'portfolio'            ? <DashboardErrorBoundary key="portfolio">      <LivePortfolio />        </DashboardErrorBoundary>
                      : activeTab === 'academy'              ? <DashboardErrorBoundary key="academy">        <WhaleAcademy />         </DashboardErrorBoundary>
                      : activeTab === 'support'              ? <DashboardErrorBoundary key="support">        <WhaleSupport />         </DashboardErrorBoundary>
                      : activeTab === 'humanidfi-portfolio'  ? <DashboardErrorBoundary key="human-port">     <WhalePortfolio />       </DashboardErrorBoundary>
                      : activeTab === 'gold-ticket'          ? <DashboardErrorBoundary key="gold">           <GoldTicketPanel />      </DashboardErrorBoundary>
                      : null
                    }
                </motion.div>
            </AnimatePresence>
        </WhaleProShell>
    );
}
