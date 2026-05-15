"use client";
// WhaleDashboard v3 — 11 tabs, KYC removed
import React, { useState } from 'react';

import { WhaleProShell }         from '@/components/dashboard/WhaleProShell';
import { DashboardErrorBoundary } from '@/components/dashboard/DashboardErrorBoundary';
import { useSearchParams }        from 'next/navigation';
import { useSovereignAccount }    from '@/hooks/useSovereignAccount';
import dynamic                    from 'next/dynamic';

// ── Static imports (lightweight) ──────────────────────────────────────────────
import { NewPairsTable }     from '@/components/dashboard/NewPairsTable';
import { OmniExplorer }      from '@/components/dashboard/OmniExplorer';
import { VossSupremacyPanel } from '@/components/dashboard/VossSupremacyPanel';
import { WhaleSupport }      from '@/components/dashboard/WhaleSupport';
import InstitutionalLedger   from '@/components/dashboard/InstitutionalLedger';
import { MassTransferIntel } from '@/components/dashboard/MassTransferIntel';
import { SessionLogsPanel }  from '@/components/dashboard/SessionLogsPanel';
import { PlanDashboard }     from '@/components/dashboard/PlanDashboard';

const AztecMempoolSpace = dynamic(
  () => import('@/components/premium/AztecMempoolSpace'),
  { ssr: false }
);

// Dynamic imports (SSR-unsafe or heavy)
const PortfolioDashboard = dynamic(
  () => import('@/components/dashboard/PortfolioDashboard'),
  { ssr: false }
);
const GainersLosersPanel = dynamic(
  () => import('@/components/dashboard/GainersLosersPanel').then(m => ({ default: m.GainersLosersPanel })),
  { ssr: false }
);

import "@/app/dashboard/dashboard.css";



export default function WhaleDashboard() {
    const searchParams = useSearchParams();
    const { address, isConnected, isZkVerified: hasPassedZK, isChecking: isCheckingZK } = useSovereignAccount();
    const initialTab = searchParams.get('tab') || 'gold';
    const [activeTab, setActiveTab] = useState<string>(initialTab);

    // [SOVEREIGN-GATE] Cryptographic verification is now handled centrally via useSovereignAccount
    // which polls the server in the background for mobile handoff completion.

    // ── Sync URL param to state ──────────────────────────────────────────
    React.useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // ── Enforce valid tabs (Legacy Redirects) ───────────────────────────
    React.useEffect(() => {
        const LEGACY_TABS = [
            'dashboard', 'watchlist', 'firehose', 'sov-intel', 'live-port',
            'whale-port', 'graph', 'vault', 'trade', 'forensics',
            'reputation', 'scanner'
        ];
        if (LEGACY_TABS.includes(activeTab)) {
            setActiveTab('gold');
            window.history.replaceState(null, '', '?tab=gold');
        }
    }, [activeTab]);


    // ── Panel Refresh Key ────────────────────────────────────────────────
    // Every time the user switches tabs OR returns to the page after it was
    // hidden (phone lock, switching apps, long idle), refreshKey increments.
    // This key is appended to every DashboardErrorBoundary, forcing React to
    // unmount the old panel and mount a fresh one with a new API fetch cycle.
    // This is the definitive fix for "all tabs blank after long idle".
    const [refreshKey, setRefreshKey] = useState(0);

    // Increment refreshKey when the document becomes visible again after being hidden
    React.useEffect(() => {
        let wasHidden = false;
        const handleVisibility = () => {
            if (document.hidden) {
                wasHidden = true;
            } else if (wasHidden) {
                wasHidden = false;
                setRefreshKey(k => k + 1);
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, []);

    // KYC permanently disabled per institutional request

    // Also increment refreshKey on every tab change to guarantee fresh mounts
    const handleTabChange = React.useCallback((id: string) => {
        setActiveTab(id);
        setRefreshKey(k => k + 1);
        window.history.pushState(null, '', `?tab=${id}`);
    }, []);

    const renderTabContent = () => {
        switch (activeTab) {
            // Legacy redirects → Ticket Mint
            case 'dashboard':
            case 'watchlist':
            case 'firehose':
            case 'sov-intel':
            case 'live-port':
            case 'whale-port':
            case 'graph':
            case 'vault':
            case 'trade':
            case 'forensics':
            case 'reputation':
            case 'scanner':
            case 'zk-identity': // KYC permanently removed
                return <div className="flex-1 min-h-[950px] shrink-0"><DashboardErrorBoundary key={`gold-redirect-${refreshKey}`}><VossSupremacyPanel /></DashboardErrorBoundary></div>;

            case 'gold':
                return <div className="flex-1 min-h-[950px] shrink-0"><DashboardErrorBoundary key={`gold-${refreshKey}`}><VossSupremacyPanel /></DashboardErrorBoundary></div>;

            case 'portfolio':
                return <div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`human-port-${refreshKey}`}><PortfolioDashboard /></DashboardErrorBoundary></div>;

            case 'billing':
                return <div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`billing-${refreshKey}`}><PlanDashboard /></DashboardErrorBoundary></div>;

            case 'markets':
                return <div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`markets-${refreshKey}`}><GainersLosersPanel /></DashboardErrorBoundary></div>;

            case 'newpairs':
                return <div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`newpairs-${refreshKey}`}><NewPairsTable /></DashboardErrorBoundary></div>;

            case 'inst-ledger':
                return <div className="h-[700px] shrink-0"><DashboardErrorBoundary key={`inst-ledger-${refreshKey}`}><InstitutionalLedger /></DashboardErrorBoundary></div>;

            case 'mass-transfer':
                return <div className="h-[700px] shrink-0"><DashboardErrorBoundary key={`mass-transfer-${refreshKey}`}><MassTransferIntel /></DashboardErrorBoundary></div>;

            case 'omniexplorer':
                return <div className="flex-1 min-h-[750px] shrink-0"><DashboardErrorBoundary key={`omni-explorer-${refreshKey}`}><OmniExplorer /></DashboardErrorBoundary></div>;

            case 'zk':
                return <div className="flex-1 min-h-[850px] shrink-0 relative"><DashboardErrorBoundary key={`zk-shield-${refreshKey}`}><AztecMempoolSpace /></DashboardErrorBoundary></div>;

            case 'logs':
                return <div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`session-logs-${refreshKey}`}><SessionLogsPanel /></DashboardErrorBoundary></div>;

            case 'support':
                return <div className="flex-1 min-h-[800px] shrink-0"><DashboardErrorBoundary key={`support-${refreshKey}`}><WhaleSupport /></DashboardErrorBoundary></div>;

            default:
                return <div className="flex-1 min-h-[950px] shrink-0"><DashboardErrorBoundary key={`gold-default-${refreshKey}`}><VossSupremacyPanel /></DashboardErrorBoundary></div>;
        }
    };

    if (isCheckingZK) {
        return (
            <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // ZK gate bypass

    return (
        <WhaleProShell
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isExternalEmbed={false}
            isZkVerified={true}
        >
            <div className="flex flex-col gap-6 w-full pb-12 h-full scrollbar-hide pt-4">
                {renderTabContent()}
            </div>
        </WhaleProShell>
    );
}
