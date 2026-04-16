"use client";

import React, { useState } from 'react';

import { WhaleProShell }          from '@/components/dashboard/WhaleProShell';
import { DashboardErrorBoundary }  from '@/components/dashboard/DashboardErrorBoundary';

// ── Internal panels ────────────────────────────────────────────────────────────
import { PremiumMatrixStack }      from '@/components/premium/PremiumMatrixStack';
import { WatchlistTable }          from '@/components/dashboard/WatchlistTable';
import { NewPairsTable }           from '@/components/dashboard/NewPairsTable';
import { GainersLosersPanel }      from '@/components/dashboard/GainersLosersPanel';
import { NewsOfToday }             from '@/components/dashboard/NewsOfToday';
import { WhalePortfolio }          from '@/components/dashboard/WhalePortfolio';
import { OmniExplorer }            from '@/components/dashboard/OmniExplorer';
import { WhaleAcademy }            from '@/components/dashboard/WhaleAcademy';
import { GoldTicketPanel }         from '@/components/dashboard/GoldTicketPanel';
import { ZKShieldStation }         from '@/components/dashboard/ZKShieldStation';
import { EntityGraphVis }          from '@/components/dashboard/EntityGraphVis';
import { SovereignVault }          from '@/components/dashboard/SovereignVault';
import { WhaleSupport }            from '@/components/dashboard/WhaleSupport';
import SovereignIntelTab           from '@/components/dashboard/SovereignIntelTab';
import InstitutionalLedger         from '@/components/dashboard/InstitutionalLedger';
import { MassTransferIntel }       from '@/components/dashboard/MassTransferIntel';
import { VirtualizedFirehose }     from '@/components/premium/VirtualizedFirehose';
import { LivePortfolio }           from '@/components/premium/LivePortfolio';
import dynamic from 'next/dynamic';

// Heavy / SSR-unsafe dynamic imports
const PortfolioDashboard = dynamic(
  () => import('@/components/dashboard/PortfolioDashboard'),
  { ssr: false }
);
const DeFiYieldPanel = dynamic(
  () => import('@/components/dashboard/DeFiYieldPanel'),
  { ssr: false }
);
const PolymarketGlassDashboard = dynamic(
  () => import('@/components/dashboard/PolymarketGlassDashboard'),
  { ssr: false }
);
const BRCExplorerShell = dynamic(
  () => import('@/components/bsv/BRCExplorerShell'),
  { ssr: false }
);

import "@/app/dashboard/dashboard.css";

type TabId =
    | 'dashboard'
    | 'watchlist'
    | 'whale-events'
    | 'new-pairs'
    | 'gainers'
    | 'portfolio'
    | 'whale-portfolio'
    | 'news'
    | 'omni-explorer'
    | 'humanidfi-portfolio'
    | 'brc-explorer'
    | 'gold-ticket'
    | 'zk-shield'
    | 'neural-graph'
    | 'sovereign-vault'
    | 'sovereign-intel'
    | 'institutional-ledger'
    | 'mass-transfer'
    | 'defi-yield'
    | 'polymarket'
    | 'academy'
    | 'support';

export default function WhaleDashboard() {
    const [activeTab, setActiveTab] = useState<TabId>('dashboard');

    return (
        <WhaleProShell
            activeTab={activeTab}
            onTabChange={(id: string) => setActiveTab(id as TabId)}
            isExternalEmbed={false}
        >
            {
                activeTab === 'dashboard'             ? <DashboardErrorBoundary key="dashboard">       <PremiumMatrixStack />           </DashboardErrorBoundary>
              : activeTab === 'gold-ticket'           ? <DashboardErrorBoundary key="gold">            <GoldTicketPanel />              </DashboardErrorBoundary>
              : activeTab === 'news'                  ? <DashboardErrorBoundary key="news">            <NewsOfToday />                  </DashboardErrorBoundary>
              : activeTab === 'watchlist'             ? <DashboardErrorBoundary key="watchlist">       <WatchlistTable />               </DashboardErrorBoundary>
              : activeTab === 'whale-events'          ? <DashboardErrorBoundary key="whale-events">    <VirtualizedFirehose />          </DashboardErrorBoundary>
              : activeTab === 'gainers'               ? <DashboardErrorBoundary key="gainers">         <GainersLosersPanel />           </DashboardErrorBoundary>
              : activeTab === 'new-pairs'             ? <DashboardErrorBoundary key="new-pairs">       <NewPairsTable />                </DashboardErrorBoundary>
              : activeTab === 'omni-explorer'         ? <DashboardErrorBoundary key="omni-explorer">   <OmniExplorer />                 </DashboardErrorBoundary>
              : activeTab === 'brc-explorer'          ? <DashboardErrorBoundary key="brc">             <BRCExplorerShell />             </DashboardErrorBoundary>
              : activeTab === 'neural-graph'          ? <DashboardErrorBoundary key="neural-graph">    <EntityGraphVis />               </DashboardErrorBoundary>
              : activeTab === 'sovereign-intel'       ? <DashboardErrorBoundary key="sovereign-intel"> <SovereignIntelTab />            </DashboardErrorBoundary>
              : activeTab === 'institutional-ledger'  ? <DashboardErrorBoundary key="inst-ledger">     <InstitutionalLedger />          </DashboardErrorBoundary>
              : activeTab === 'mass-transfer'         ? <DashboardErrorBoundary key="mass-transfer">   <MassTransferIntel />            </DashboardErrorBoundary>
              : activeTab === 'defi-yield'            ? <DashboardErrorBoundary key="defi-yield">      <DeFiYieldPanel />               </DashboardErrorBoundary>
              : activeTab === 'polymarket'            ? <DashboardErrorBoundary key="polymarket">      <PolymarketGlassDashboard />     </DashboardErrorBoundary>
              : activeTab === 'portfolio'             ? <DashboardErrorBoundary key="portfolio">       <LivePortfolio />                </DashboardErrorBoundary>
              : activeTab === 'sovereign-vault'       ? <DashboardErrorBoundary key="sov-vault">       <SovereignVault />               </DashboardErrorBoundary>
              : activeTab === 'zk-shield'             ? <DashboardErrorBoundary key="zk-shield">       <ZKShieldStation />              </DashboardErrorBoundary>
              : activeTab === 'whale-portfolio'       ? <DashboardErrorBoundary key="whale-portfolio"> <WhalePortfolio />               </DashboardErrorBoundary>
              : activeTab === 'humanidfi-portfolio'   ? <DashboardErrorBoundary key="human-port">      <PortfolioDashboard />           </DashboardErrorBoundary>
              : activeTab === 'academy'               ? <DashboardErrorBoundary key="academy">         <WhaleAcademy />                 </DashboardErrorBoundary>
              : activeTab === 'support'               ? <DashboardErrorBoundary key="support">         <WhaleSupport />                 </DashboardErrorBoundary>
              : null
            }
        </WhaleProShell>
    );
}
