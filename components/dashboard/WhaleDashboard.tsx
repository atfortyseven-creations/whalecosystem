"use client";

import React, { useState } from 'react';

import { WhaleProShell }          from '@/components/dashboard/WhaleProShell';
import { DashboardErrorBoundary }  from '@/components/dashboard/DashboardErrorBoundary';

// ── Internal panels ───────────────────────────────────────────────────────────
import { PremiumMatrixStack }      from '@/components/premium/PremiumMatrixStack';
import { InstitutionalQuantChart }   from '@/components/premium/InstitutionalQuantChart';
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
import { GoldTicketPanel }         from '@/components/dashboard/GoldTicketPanel';
import { BRCExplorerShell }        from '@/components/bsv/BRCExplorerShell';
import { ZKShieldStation }         from '@/components/dashboard/ZKShieldStation';
import { EntityGraphVis }          from '@/components/dashboard/EntityGraphVis';
import { SovereignVault }          from '@/components/dashboard/SovereignVault';
import { WhaleSupport }            from '@/components/dashboard/WhaleSupport';
import PortfolioDashboard          from '@/components/dashboard/PortfolioDashboard';
import { VirtualizedFirehose }     from '@/components/premium/VirtualizedFirehose';

import "@/app/dashboard/dashboard.css";

type TabId =
    | 'dashboard'
    | 'watchlist'
    | 'alerts'
    | 'whale-events'
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
    | 'brc-explorer'
    | 'gold-ticket'
    | 'zk-shield'
    | 'neural-graph'
    | 'sovereign-vault';

export default function WhaleDashboard() {
    const [activeTab, setActiveTab] = useState<TabId>('dashboard');

    return (
        <WhaleProShell
            activeTab={activeTab}
            onTabChange={(id: string) => setActiveTab(id as TabId)}
            isExternalEmbed={false}
        >
            {/* Unified switch — WhaleProShell handles the AnimatePresence internally */}
            {
                activeTab === 'dashboard'            ? <DashboardErrorBoundary key="dashboard">      <PremiumMatrixStack />   </DashboardErrorBoundary>
              : activeTab === 'watchlist'            ? <DashboardErrorBoundary key="watchlist">      <WatchlistTable />       </DashboardErrorBoundary>
              : activeTab === 'alerts'               ? <DashboardErrorBoundary key="alerts">         <AlertsPanel />          </DashboardErrorBoundary>
              : activeTab === 'whale-events'         ? <DashboardErrorBoundary key="whale-events">    <VirtualizedFirehose />  </DashboardErrorBoundary>
              : activeTab === 'multicharts'          ? <DashboardErrorBoundary key="multicharts">    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 bg-[#020202] rounded-2xl border border-white/8"><InstitutionalQuantChart /></div> </DashboardErrorBoundary>
              : activeTab === 'new-pairs'            ? <DashboardErrorBoundary key="new-pairs">      <NewPairsTable />        </DashboardErrorBoundary>
              : activeTab === 'gainers'              ? <DashboardErrorBoundary key="gainers">        <GainersLosersPanel />   </DashboardErrorBoundary>
              : activeTab === 'whale-portfolio'      ? <DashboardErrorBoundary key="whale-portfolio"><WhalePortfolio />       </DashboardErrorBoundary>
              : activeTab === 'news'                 ? <DashboardErrorBoundary key="news">           <NewsOfToday />          </DashboardErrorBoundary>
              : activeTab === 'omni-explorer'        ? <DashboardErrorBoundary key="omni-explorer">  <OmniExplorer />         </DashboardErrorBoundary>
              : activeTab === 'api'                  ? <DashboardErrorBoundary key="api">            <ApiTerminal />          </DashboardErrorBoundary>
              : activeTab === 'portfolio'            ? <DashboardErrorBoundary key="portfolio">      <LivePortfolio />        </DashboardErrorBoundary>
              : activeTab === 'academy'              ? <DashboardErrorBoundary key="academy">        <WhaleAcademy />         </DashboardErrorBoundary>
              : activeTab === 'brc-explorer'         ? <DashboardErrorBoundary key="brc">            <BRCExplorerShell />     </DashboardErrorBoundary>
              : activeTab === 'support'              ? <DashboardErrorBoundary key="support">        <WhaleSupport />         </DashboardErrorBoundary>
              : activeTab === 'humanidfi-portfolio'  ? <DashboardErrorBoundary key="human-port">     <PortfolioDashboard />   </DashboardErrorBoundary>
              : activeTab === 'gold-ticket'          ? <DashboardErrorBoundary key="gold">           <GoldTicketPanel />      </DashboardErrorBoundary>
              : activeTab === 'zk-shield'            ? <DashboardErrorBoundary key="zk-shield">      <ZKShieldStation />      </DashboardErrorBoundary>
              : activeTab === 'neural-graph'         ? <DashboardErrorBoundary key="neural-graph">   <EntityGraphVis />       </DashboardErrorBoundary>
              : activeTab === 'sovereign-vault'      ? <DashboardErrorBoundary key="sov-vault">      <SovereignVault />       </DashboardErrorBoundary>
              : null
            }
        </WhaleProShell>
    );
}
