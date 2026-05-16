"use client";
// WhaleDashboard v3 — 11 tabs, KYC removed
import React, { useState } from 'react';

import { WhaleProShell }         from '@/components/dashboard/WhaleProShell';
import { DashboardErrorBoundary } from '@/components/dashboard/DashboardErrorBoundary';
import { useSearchParams }        from 'next/navigation';
import { useSovereignAccount }    from '@/hooks/useSovereignAccount';
import dynamic                    from 'next/dynamic';

// ── Static imports (lightweight) ──────────────────────────────────────────────
import { GoldTicketPanel }    from '@/components/dashboard/GoldTicketPanel';

// ── Dynamic imports (Heavy tabs, mounted only when clicked) ────────────────────
const LoadingPanel = () => (
  <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-transparent">
    <div className="w-6 h-6 border-2 border-[#050505] dark:border-white border-t-transparent rounded-full animate-spin" />
  </div>
);

const NewPairsTable = dynamic(() => import('@/components/dashboard/NewPairsTable').then(m => ({ default: m.NewPairsTable })), { ssr: false, loading: LoadingPanel });
const OmniExplorer = dynamic(() => import('@/components/dashboard/OmniExplorer').then(m => ({ default: m.OmniExplorer })), { ssr: false, loading: LoadingPanel });
const WhaleSupport = dynamic(() => import('@/components/dashboard/WhaleSupport').then(m => ({ default: m.WhaleSupport })), { ssr: false, loading: LoadingPanel });
const InstitutionalLedger = dynamic(() => import('@/components/dashboard/InstitutionalLedger'), { ssr: false, loading: LoadingPanel });
const MassTransferIntel = dynamic(() => import('@/components/dashboard/MassTransferIntel').then(m => ({ default: m.MassTransferIntel })), { ssr: false, loading: LoadingPanel });
const SessionLogsPanel = dynamic(() => import('@/components/dashboard/SessionLogsPanel').then(m => ({ default: m.SessionLogsPanel })), { ssr: false, loading: LoadingPanel });
const PlanDashboard = dynamic(() => import('@/components/dashboard/PlanDashboard').then(m => ({ default: m.PlanDashboard })), { ssr: false, loading: LoadingPanel });

const AztecMempoolSpace = dynamic(
  () => import('@/components/premium/AztecMempoolSpace'),
  { ssr: false, loading: LoadingPanel }
);

// Dynamic imports (SSR-unsafe or heavy)
const PortfolioDashboard = dynamic(
  () => import('@/components/dashboard/PortfolioDashboard'),
  { ssr: false, loading: LoadingPanel }
);
const GainersLosersPanel = dynamic(
  () => import('@/components/dashboard/GainersLosersPanel').then(m => ({ default: m.GainersLosersPanel })),
  { ssr: false, loading: LoadingPanel }
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

    const PANEL = "flex-1 w-full h-full min-h-0 flex flex-col";

    const renderTabContent = () => {
        switch (activeTab) {
            // Legacy redirects → Gold Ticket
            case 'zk-identity':
                return <div className={PANEL}><DashboardErrorBoundary key={`gold-redirect-${refreshKey}`}><GoldTicketPanel /></DashboardErrorBoundary></div>;

            case 'gold':
                return <div className={PANEL}><DashboardErrorBoundary key={`gold-${refreshKey}`}><GoldTicketPanel /></DashboardErrorBoundary></div>;

            case 'portfolio':
                return <div className={PANEL}><DashboardErrorBoundary key={`human-port-${refreshKey}`}><PortfolioDashboard /></DashboardErrorBoundary></div>;

            case 'billing':
                return <div className={PANEL}><DashboardErrorBoundary key={`billing-${refreshKey}`}><PlanDashboard /></DashboardErrorBoundary></div>;

            case 'markets':
                return <div className={PANEL}><DashboardErrorBoundary key={`markets-${refreshKey}`}><GainersLosersPanel /></DashboardErrorBoundary></div>;

            case 'newpairs':
                return <div className={PANEL}><DashboardErrorBoundary key={`newpairs-${refreshKey}`}><NewPairsTable /></DashboardErrorBoundary></div>;

            case 'inst-ledger':
                return <div className={PANEL}><DashboardErrorBoundary key={`inst-ledger-${refreshKey}`}><InstitutionalLedger /></DashboardErrorBoundary></div>;

            case 'mass-transfer':
                return <div className={PANEL}><DashboardErrorBoundary key={`mass-transfer-${refreshKey}`}><MassTransferIntel /></DashboardErrorBoundary></div>;

            case 'omniexplorer':
                return <div className={PANEL}><DashboardErrorBoundary key={`omni-explorer-${refreshKey}`}><OmniExplorer /></DashboardErrorBoundary></div>;

            case 'zk':
                return <div className={PANEL + " relative"}><DashboardErrorBoundary key={`zk-shield-${refreshKey}`}><AztecMempoolSpace /></DashboardErrorBoundary></div>;

            case 'logs':
                return <div className={PANEL}><DashboardErrorBoundary key={`session-logs-${refreshKey}`}><SessionLogsPanel /></DashboardErrorBoundary></div>;

            case 'support':
                return <div className={PANEL}><DashboardErrorBoundary key={`support-${refreshKey}`}><WhaleSupport /></DashboardErrorBoundary></div>;

            default:
                return <div className={PANEL}><DashboardErrorBoundary key={`gold-default-${refreshKey}`}><GoldTicketPanel /></DashboardErrorBoundary></div>;
        }
    };

    if (isCheckingZK) {
        return (
            <div className="min-h-screen bg-[#FDFCF8] dark:bg-[#0A0A0A] flex items-center justify-center">
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
            <div className="flex flex-col w-full h-full min-h-0">
                {renderTabContent()}
            </div>
        </WhaleProShell>
    );
}
