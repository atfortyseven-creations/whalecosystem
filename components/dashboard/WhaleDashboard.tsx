"use client";
// WhaleDashboard v2 — Camera & ScannerZone removed, Morpho restored
import React, { useState } from 'react';
import { 
    Lock
} from 'lucide-react';

import { InstitutionalErrorBoundary } from '@/components/ui/InstitutionalErrorBoundary';

import { WhaleProShell }          from '@/components/dashboard/WhaleProShell';
import { DashboardErrorBoundary }  from '@/components/dashboard/DashboardErrorBoundary';
import { useSearchParams } from 'next/navigation';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

// ── Active panels (visible to users) ──────────────────────────────────────────
import { ScannerZone }             from '@/components/dashboard/ScannerZone';
import { NewPairsTable }           from '@/components/dashboard/NewPairsTable';
import { GainersLosersPanel }      from '@/components/dashboard/GainersLosersPanel';
import { NewsOfToday }             from '@/components/dashboard/NewsOfToday';
import { OmniExplorer }            from '@/components/dashboard/OmniExplorer';
import { WhaleAcademy }            from '@/components/dashboard/WhaleAcademy';
import { VossSupremacyPanel }      from '@/components/dashboard/VossSupremacyPanel';
import { EntityGraphVis }          from '@/components/dashboard/EntityGraphVis';
import { SovereignVault }          from '@/components/dashboard/SovereignVault';
import { WhaleSupport }            from '@/components/dashboard/WhaleSupport';
import InstitutionalLedger         from '@/components/dashboard/InstitutionalLedger';
import { MassTransferIntel }       from '@/components/dashboard/MassTransferIntel';
import { SessionLogsPanel }        from '@/components/dashboard/SessionLogsPanel';
import { PlanDashboard }           from '@/components/dashboard/PlanDashboard';

// ── Hidden panels (commented out — re-enable with sidebar items) ───────────────
// import { PremiumMatrixStack }   from '@/components/premium/PremiumMatrixStack';
import { WatchlistTable }       from '@/components/dashboard/WatchlistTable';
// import { WhalePortfolio }       from '@/components/dashboard/WhalePortfolio';
// import { ZKShieldStation }      from '@/components/dashboard/ZKShieldStation';
// import SovereignIntelTab        from '@/components/dashboard/SovereignIntelTab';
// import { VirtualizedFirehose }  from '@/components/premium/VirtualizedFirehose';
// import { LivePortfolio }        from '@/components/premium/LivePortfolio';

const AztecMempoolSpace = dynamic(
  () => import('@/components/premium/AztecMempoolSpace'),
  { ssr: false }
);

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
const CosmicForgePanel = dynamic(
  () => import('@/components/forge/CosmicForgePanel').then(m => m.CosmicForgePanel),
  { ssr: false }
);
const WhaleChat = dynamic(
  () => import('@/components/dashboard/WhaleChat').then(m => m.WhaleChat),
  { ssr: false }
);
const MorphoYieldDashboard = dynamic(
  () => import('@/components/dashboard/MorphoYieldDashboard').then(m => m.MorphoYieldDashboard),
  { ssr: false }
);
const SovereignAMLOracle = dynamic(
  () => import('@/components/dashboard/SovereignAMLOracle').then(m => m.SovereignAMLOracle),
  { ssr: false }
);
const ZkKYBVault = dynamic(
  () => import('@/components/dashboard/ZkKYBVault').then(m => m.ZkKYBVault),
  { ssr: false }
);
const ZKBiometricGate = dynamic(
  () => import('@/components/security/ZKBiometricGate').then(m => m.ZKBiometricGate),
  { ssr: false }
);

import "@/app/dashboard/dashboard.css";

// ── Nestr-Style Institutional Panel Header (REMOVED) ─────────
// (PanelHeader removed per user request)

// ── Under Development Panel ───────────────────────────────────────────────────
// Displayed for modules that are being prepared for release.
// Design: premium, minimal, institutional — consistent with the terminal aesthetic.
const UnderDevelopmentPanel = ({
    title,
    subtitle,
    accent = '#050505',
}: {
    title: string;
    subtitle: string;
    accent?: string;
}) => (
    <div className="flex flex-col items-center justify-center min-h-[520px] w-full select-none">
        {/* Ambient glow */}
        <div
            className="relative flex items-center justify-center mb-10"
        >
            {/* Icon container */}
            <div
                className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                    background: `${accent}0D`,
                    border: `1px solid ${accent}25`,
                }}
            >
            </div>
        </div>

        {/* Text block */}
        <div className="flex flex-col items-center gap-3 max-w-[380px] text-center">
            <p
                className="text-[9px] font-black uppercase tracking-[0.35em] mb-1"
                style={{ color: `${accent}99` }}
            >
                Module Status
            </p>
            <h2
                className="text-[22px] font-black tracking-tight leading-none text-[#050505]"
                style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
            >
                {title}
            </h2>
            <p className="text-[12px] text-[#050505]/40 font-medium leading-relaxed">
                {subtitle}
            </p>

            {/* Divider */}
            <div className="w-8 h-px bg-black/10 my-2" />

            {/* Formal notice */}
            <div className="px-5 py-3.5 rounded-xl border border-black/[0.07] bg-white/70 text-[10px] font-medium text-[#050505]/50 leading-relaxed">
                This module is currently under development and is not yet available.
                It will be released in a forthcoming platform update.
            </div>
        </div>
    </div>
);

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
            // All other legacy/removed tabs — fall to default (Access Pass)
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
                // The useEffect will catch this and update state/URL cleanly.
                // In the meantime, render the fallback pass.
                return <div className="flex-1 min-h-[950px] shrink-0"><DashboardErrorBoundary key={`gold-redirect-${refreshKey}`}><VossSupremacyPanel /></DashboardErrorBoundary></div>;

            case 'billing':
                return <div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`billing-${refreshKey}`}><PlanDashboard /></DashboardErrorBoundary></div>;

            case 'zk':
                return <div className="flex-1 min-h-[850px] shrink-0 relative"><DashboardErrorBoundary key={`zk-shield-${refreshKey}`}><AztecMempoolSpace /></DashboardErrorBoundary></div>;

            case 'zk-identity':
                return <div className="flex flex-col gap-6 w-full min-h-[950px] shrink-0"><DashboardErrorBoundary key={`zk-identity-${refreshKey}`}><div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full"><div className="flex flex-col gap-6"><SovereignAMLOracle /></div><ZkKYBVault /></div></DashboardErrorBoundary></div>;

            case 'news':
                return <div className="h-[750px] shrink-0"><DashboardErrorBoundary key={`news-${refreshKey}`}><NewsOfToday /></DashboardErrorBoundary></div>;

            case 'gold':
                return <div className="flex-1 min-h-[950px] shrink-0"><DashboardErrorBoundary key={`gold-${refreshKey}`}><VossSupremacyPanel /></DashboardErrorBoundary></div>;

            case 'markets':
                return <div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`markets-${refreshKey}`}><GainersLosersPanel /></DashboardErrorBoundary></div>;


            case 'newpairs':
                return <div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`newpairs-${refreshKey}`}><NewPairsTable /></DashboardErrorBoundary></div>;


            case 'omniexplorer':
                return <div className="flex-1 min-h-[750px] shrink-0"><DashboardErrorBoundary key={`omni-explorer-${refreshKey}`}><OmniExplorer /></DashboardErrorBoundary></div>;

            case 'brc':
                return <div className="flex-1 min-h-[750px] shrink-0"><DashboardErrorBoundary key={`brc-${refreshKey}`}><BRCExplorerShell /></DashboardErrorBoundary></div>;

            case 'inst-ledger':
                return <div className="h-[700px] shrink-0"><DashboardErrorBoundary key={`inst-ledger-${refreshKey}`}><InstitutionalLedger /></DashboardErrorBoundary></div>;

            case 'mass-transfer':
                return <div className="h-[700px] shrink-0"><DashboardErrorBoundary key={`mass-transfer-${refreshKey}`}><MassTransferIntel /></DashboardErrorBoundary></div>;




            case 'defi':
                return <div className="flex-1 min-h-[800px] shrink-0"><DashboardErrorBoundary key={`defi-yield-${refreshKey}`}><DeFiYieldPanel /></DashboardErrorBoundary></div>;

            case 'polymarket':
                return <div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`polymarket-${refreshKey}`}><PolymarketGlassDashboard /></DashboardErrorBoundary></div>;

            case 'forge':
                return <div className="flex-1 min-h-[800px] shrink-0"><DashboardErrorBoundary key={`cosmic-forge-${refreshKey}`}><CosmicForgePanel /></DashboardErrorBoundary></div>;

            case 'portfolio':
                return <div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`human-port-${refreshKey}`}><PortfolioDashboard /></DashboardErrorBoundary></div>;



            case 'logs':
                return <div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`session-logs-${refreshKey}`}><SessionLogsPanel /></DashboardErrorBoundary></div>;

            case 'academy':
                return <div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`academy-${refreshKey}`}><WhaleAcademy /></DashboardErrorBoundary></div>;

            case 'support':
                return <div className="flex-1 min-h-[800px] shrink-0"><DashboardErrorBoundary key={`support-${refreshKey}`}><WhaleSupport /></DashboardErrorBoundary></div>;


            case 'chat':
                return <div className="flex-1 min-h-[700px] shrink-0"><DashboardErrorBoundary key={`chat-${refreshKey}`}><WhaleChat /></DashboardErrorBoundary></div>;




            case 'morpho':
                return <div className="flex-1 min-h-[700px] shrink-0"><DashboardErrorBoundary key={`morpho-${refreshKey}`}><MorphoYieldDashboard /></DashboardErrorBoundary></div>;

            default:
                // Fallback: Ticket Mint panel so users always land on the Access Pass
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
            isZkVerified={hasPassedZK}
        >
            <div className="flex flex-col gap-6 w-full pb-12 h-full scrollbar-hide pt-4">
                {renderTabContent()}
            </div>
        </WhaleProShell>
    );
}
