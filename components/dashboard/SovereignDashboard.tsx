"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { InstitutionalProShell }   from '@/components/dashboard/InstitutionalProShell';
import { ExternalEmbed }           from '@/components/dashboard/ExternalEmbed';
import { SovereignContractModal }  from '@/components/dashboard/SovereignContractModal';
import { DashboardErrorBoundary }  from '@/components/dashboard/DashboardErrorBoundary';

// ── Internal panels (no backend changes) ──────────────────────────────────────
import { PremiumMatrixStack }      from '@/components/premium/PremiumMatrixStack';
import PolymarketPanel             from '@/components/dashboard/PolymarketPanel';
import { LivePortfolio }           from '@/components/premium/LivePortfolio';
import { WatchlistTable }          from '@/components/dashboard/WatchlistTable';
import { NewPairsTable }           from '@/components/dashboard/NewPairsTable';
import { ApiTerminal }             from '@/components/dashboard/ApiTerminal';
import { AlertsPanel }             from '@/components/dashboard/AlertsPanel';
import { GainersLosersPanel }      from '@/components/dashboard/GainersLosersPanel';
import { NewsOfToday }             from '@/components/dashboard/NewsOfToday';

// New natively wired institutional components
import { WhalePortfolio }          from '@/components/dashboard/WhalePortfolio';
import { WhaleAcademy }            from '@/components/dashboard/WhaleAcademy';
import { WhaleSupport }            from '@/components/dashboard/WhaleSupport';
import { GoldTicketPanel }         from '@/components/dashboard/GoldTicketPanel';

// ── Icons for embedded pages ──────────────────────────────────────────────────
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

// ── Main router ───────────────────────────────────────────────────────────────
export default function SovereignDashboard() {
    const [activeTab, setActiveTab] = useState<TabId>('dashboard');

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
                            { activeTab === 'dashboard'   ? <PremiumMatrixStack />
                              : activeTab === 'watchlist'   ? <WatchlistTable />
                              : activeTab === 'alerts'      ? <AlertsPanel />
                              : activeTab === 'multicharts' ? <PolymarketPanel />
                              : activeTab === 'new-pairs'   ? <NewPairsTable />
                              : activeTab === 'gainers'     ? <GainersLosersPanel />
                              : activeTab === 'api'         ? <ApiTerminal />
                              : activeTab === 'portfolio'   ? <LivePortfolio />
                              : activeTab === 'news'        ? <NewsOfToday />
                              : activeTab === 'whale-portfolio' ? <WhalePortfolio />
                              : activeTab === 'academy'     ? <WhaleAcademy />
                              : activeTab === 'support'     ? <WhaleSupport />
                              : activeTab === 'gold-ticket' ? <GoldTicketPanel />
                              : null}
                        </motion.div>
                    </AnimatePresence>
                </DashboardErrorBoundary>
            </InstitutionalProShell>
        </>
    );
}
