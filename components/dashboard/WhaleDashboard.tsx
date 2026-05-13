"use client";
// WhaleDashboard v2 — Camera & ScannerZone removed, Morpho restored
import React, { useState } from 'react';
import { 
  Globe, Lock, BookOpen, Star, Newspaper, 
  Ticket, Flame, Search, Layers, LineChart, Book,
  Network, Compass, Landmark, BarChart3, FlaskConical,
  Wallet, Shield, Database, MessageSquare,
  LayoutDashboard, MessageCircle, Camera, Fingerprint
} from 'lucide-react';

import { WhaleProShell }          from '@/components/dashboard/WhaleProShell';
import { DashboardErrorBoundary }  from '@/components/dashboard/DashboardErrorBoundary';
import { useSearchParams } from 'next/navigation';

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

// ── Nestr-Style Institutional Panel Header (Lottie-Free, Space-Optimized) ─────────
const PanelHeader = ({
    icon: Icon,
    title,
    description,
    accent = '#050505',
}: {
    icon: any;
    title: string;
    description: string;
    accent?: string;
}) => {
    return (
        <div className="w-full bg-white rounded-[2rem] border border-black/5 shadow-sm p-6 md:p-8 mb-6 flex flex-col md:flex-row items-center gap-6 md:gap-12 relative overflow-hidden">
            {/* Abstract Accent Glow (Lottie Alternative) */}
            <div 
                className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none" 
                style={{ background: accent }} 
            />
            
            {/* Left: Icon & Badge */}
            <div className="shrink-0">
                <div className="w-16 h-16 rounded-[1.25rem] flex items-center justify-center border shadow-sm relative z-10" style={{ background: `${accent}0A`, borderColor: `${accent}20` }}>
                    <Icon size={28} strokeWidth={1.5} style={{ color: accent }} />
                </div>
            </div>

            {/* Center: Title & Mono Tag */}
            <div className="flex-1 min-w-0 relative z-10 w-full text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAFAF8] border border-black/5 rounded-full shadow-sm mb-3">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
                    <span className="font-mono text-[9px] font-bold tracking-[0.3em] uppercase text-slate-500">
                        Sovereign Terminal
                    </span>
                </div>
                <h2 className="text-[28px] md:text-[36px] font-black uppercase text-[#0A0A0A] leading-none tracking-tighter truncate">
                    {title}
                </h2>
            </div>

            {/* Right: Description (Perfectly constrained) */}
            <div className="w-full md:w-[45%] relative z-10">
                <p className="font-serif text-[13px] md:text-[14px] text-slate-500 leading-relaxed md:border-l-2 md:pl-6 text-center md:text-left" style={{ borderColor: `${accent}30` }}>
                    {description}
                </p>
            </div>
        </div>
    );
};

// ── Under Development Panel ───────────────────────────────────────────────────
// Displayed for modules that are being prepared for release.
// Design: premium, minimal, institutional — consistent with the terminal aesthetic.
const UnderDevelopmentPanel = ({
    title,
    subtitle,
    icon: Icon,
    accent = '#050505',
}: {
    title: string;
    subtitle: string;
    icon: any;
    accent?: string;
}) => (
    <div className="flex flex-col items-center justify-center min-h-[520px] w-full select-none">
        {/* Ambient glow */}
        <div
            className="relative flex items-center justify-center mb-10"
            style={{ filter: `drop-shadow(0 0 48px ${accent}30)` }}
        >
            {/* Outer pulse ring */}
            <div
                className="absolute rounded-full animate-ping opacity-[0.06]"
                style={{ width: 96, height: 96, background: accent }}
            />
            {/* Inner static ring */}
            <div
                className="absolute rounded-full opacity-[0.10]"
                style={{ width: 72, height: 72, background: accent }}
            />
            {/* Icon container */}
            <div
                className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                    background: `${accent}0D`,
                    border: `1px solid ${accent}25`,
                }}
            >
                <Icon size={22} strokeWidth={1.4} style={{ color: accent }} />
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
    const initialTab = searchParams.get('tab') || 'gold';
    const [activeTab, setActiveTab] = useState<string>(initialTab);

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
                return <><PanelHeader icon={Ticket} title="Access Pass" description="Mint your institutional clearance pass to unlock advanced analytics, private data feeds, and exclusive platform features." accent="#D4AF37" /><div className="flex-1 min-h-[950px] shrink-0"><DashboardErrorBoundary key={`gold-redirect-${refreshKey}`}><VossSupremacyPanel /></DashboardErrorBoundary></div></>;

            case 'billing':
                return <><PanelHeader icon={LayoutDashboard} title="Billing & Plan" description="Manage your on-chain plan and view cryptographic invoices." accent="#00C076" /><div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`billing-${refreshKey}`}><PlanDashboard /></DashboardErrorBoundary></div></>;

            case 'zk':
                return <><PanelHeader icon={Shield} title="ZK Shield" description="Monitor Aztec Network's zero-knowledge rollup pipeline. Visualise pending proofs and mempool activity." accent="#9945FF" /><div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`zk-shield-${refreshKey}`}><AztecMempoolSpace /></DashboardErrorBoundary></div></>;

            case 'zk-identity':
                return <><PanelHeader icon={Fingerprint} title="ZK Identity & Compliance" description="Zero-knowledge biometric authentication, KYC/KYB document vault, and real-time AML telemetry. No PII is stored." accent="#10B981" /><div className="flex flex-col gap-6 w-full min-h-[950px] shrink-0"><DashboardErrorBoundary key={`zk-identity-${refreshKey}`}><div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full"><div className="flex flex-col gap-6"><ZKBiometricGate /><SovereignAMLOracle /></div><ZkKYBVault /></div></DashboardErrorBoundary></div></>;

            case 'news':
                return <><PanelHeader icon={Newspaper} title="News" description="The latest news and market analysis curated from key sources in crypto and global finance." accent="#050505" /><div className="h-[750px] shrink-0"><DashboardErrorBoundary key={`news-${refreshKey}`}><NewsOfToday /></DashboardErrorBoundary></div></>;

            case 'gold':
                return <><PanelHeader icon={Ticket} title="Access Pass" description="Mint your institutional clearance pass to unlock advanced analytics, private data feeds, and exclusive platform features." accent="#D4AF37" /><div className="flex-1 min-h-[950px] shrink-0"><DashboardErrorBoundary key={`gold-${refreshKey}`}><VossSupremacyPanel /></DashboardErrorBoundary></div></>;

            case 'markets':
                return <><PanelHeader icon={Globe} title="Top Markets" description="Price performance, volume and capitalisation across leading assets." accent="#0052FF" /><div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`markets-${refreshKey}`}><GainersLosersPanel /></DashboardErrorBoundary></div></>;


            case 'newpairs':
                return <><PanelHeader icon={Flame} title="New Listings" description="Tokens recently listed on decentralised exchanges." accent="#FF6B35" /><div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`newpairs-${refreshKey}`}><NewPairsTable /></DashboardErrorBoundary></div></>;


            case 'omniexplorer':
                return <><PanelHeader icon={Search} title="Block Explorer" description="Search any wallet address, transaction, or block across multiple blockchains. Verify on-chain activity instantly." accent="#050505" /><div className="flex-1 min-h-[750px] shrink-0"><DashboardErrorBoundary key={`omni-explorer-${refreshKey}`}><OmniExplorer /></DashboardErrorBoundary></div></>;

            case 'brc':
                return <><PanelHeader icon={Layers} title="Bitcoin Layer 2" description="Explore inscriptions, BRC-20 tokens, and Bitcoin Layer 2 activity. Track ordinals and emerging Bitcoin-native protocols." accent="#F7931A" /><div className="flex-1 min-h-[750px] shrink-0"><DashboardErrorBoundary key={`brc-${refreshKey}`}><BRCExplorerShell /></DashboardErrorBoundary></div></>;

            case 'inst-ledger':
                return <><PanelHeader icon={Book} title="Whale Ledger" description="Large-value transfers made by institutional wallets and known entities. Understand where significant capital is moving." accent="#9945FF" /><div className="h-[700px] shrink-0"><DashboardErrorBoundary key={`inst-ledger-${refreshKey}`}><InstitutionalLedger /></DashboardErrorBoundary></div></>;

            case 'mass-transfer':
                return <><PanelHeader icon={Network} title="Mass Transfers" description="Coordinated or unusually large token movements across multiple wallets. Spot potential market-moving events early." accent="#9945FF" /><div className="h-[700px] shrink-0"><DashboardErrorBoundary key={`mass-transfer-${refreshKey}`}><MassTransferIntel /></DashboardErrorBoundary></div></>;




            case 'defi':
                return <><PanelHeader icon={Landmark} title="DeFi Yields" description="Interest rates and returns across decentralised finance protocols. Find the best places to put your assets to work." accent="#00C076" /><div className="flex-1 min-h-[800px] shrink-0"><DashboardErrorBoundary key={`defi-yield-${refreshKey}`}><DeFiYieldPanel /></DashboardErrorBoundary></div></>;

            case 'polymarket':
                return <><PanelHeader icon={BarChart3} title="Prediction Markets" description="Open prediction markets and their current probabilities. See what the crowd believes will happen in politics, crypto, and world events." accent="#9945FF" /><div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`polymarket-${refreshKey}`}><PolymarketGlassDashboard /></DashboardErrorBoundary></div></>;

            case 'forge':
                return <><PanelHeader icon={FlaskConical} title="Contract Sandbox" description="Deploy and test smart contracts in a safe environment. Experiment with on-chain logic without risk before going to mainnet." accent="#9945FF" /><div className="flex-1 min-h-[800px] shrink-0"><DashboardErrorBoundary key={`cosmic-forge-${refreshKey}`}><CosmicForgePanel /></DashboardErrorBoundary></div></>;

            case 'portfolio':
                return <><PanelHeader icon={Wallet} title="My Portfolio" description="The complete balance and value of all tokens in your connected wallet across every supported blockchain." accent="#00C076" /><div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`human-port-${refreshKey}`}><PortfolioDashboard /></DashboardErrorBoundary></div></>;



            case 'logs':
                return <><PanelHeader icon={Database} title="Activity Log" description="A complete history of all actions taken during your session. Useful for auditing and reviewing your on-chain interactions." accent="#0052FF" /><div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`session-logs-${refreshKey}`}><SessionLogsPanel /></DashboardErrorBoundary></div></>;

            case 'academy':
                return <><PanelHeader icon={BookOpen} title="Academy" description="Learn how blockchain, DeFi, and on-chain analytics work through structured guides written for all experience levels." accent="#050505" /><div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`academy-${refreshKey}`}><WhaleAcademy /></DashboardErrorBoundary></div></>;

            case 'support':
                return <><PanelHeader icon={MessageSquare} title="Support" description="Contact the team directly, report a problem, or ask a question. We respond as quickly as possible to every request." accent="#050505" /><div className="flex-1 min-h-[800px] shrink-0"><DashboardErrorBoundary key={`support-${refreshKey}`}><WhaleSupport /></DashboardErrorBoundary></div></>;


            case 'chat':
                return <><PanelHeader icon={MessageCircle} title="Whale Chat" description="Real-time end-to-end encrypted messaging between wallet addresses. Messages stream instantly across all connected clients." accent="#9945FF" /><div className="flex-1 min-h-[700px] shrink-0"><DashboardErrorBoundary key={`chat-${refreshKey}`}><WhaleChat /></DashboardErrorBoundary></div></>;




            case 'morpho':
                return <><PanelHeader icon={Database} title="Morpho Base Yields" description="Real-time TVL and APY analytics for Morpho Blue liquidity pools on the Base network." accent="#0052FF" /><div className="flex-1 min-h-[700px] shrink-0"><DashboardErrorBoundary key={`morpho-${refreshKey}`}><MorphoYieldDashboard /></DashboardErrorBoundary></div></>;

            default:
                // Fallback: Ticket Mint panel so users always land on the Access Pass
                return <><PanelHeader icon={Ticket} title="Access Pass" description="Mint your institutional clearance pass to unlock advanced analytics, private data feeds, and exclusive platform features." accent="#D4AF37" /><div className="flex-1 min-h-[950px] shrink-0"><DashboardErrorBoundary key={`gold-default-${refreshKey}`}><VossSupremacyPanel /></DashboardErrorBoundary></div></>;
        }
    };

    return (
        <WhaleProShell
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isExternalEmbed={false}
        >
            <div className="flex flex-col gap-6 w-full pb-12 h-full scrollbar-hide" style={{ zoom: 0.80 }}>
                {renderTabContent()}
            </div>
        </WhaleProShell>
    );
}
