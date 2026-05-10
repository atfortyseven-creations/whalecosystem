"use client";

import React, { useState } from 'react';
import { 
  Globe, Lock, BookOpen, Star, Newspaper, 
  Ticket, Flame, Search, Layers, LineChart, Book,
  Network, Compass, Landmark, BarChart3, FlaskConical,
  Wallet, Shield, Database, MessageSquare,
  LayoutDashboard, ShieldAlert, MessageCircle, TrendingUp, Award, Radar
} from 'lucide-react';

import { WhaleProShell }          from '@/components/dashboard/WhaleProShell';
import { DashboardErrorBoundary }  from '@/components/dashboard/DashboardErrorBoundary';
import { useSearchParams } from 'next/navigation';

// ── Active panels (visible to users) ──────────────────────────────────────────
import { NewPairsTable }           from '@/components/dashboard/NewPairsTable';
import { GainersLosersPanel }      from '@/components/dashboard/GainersLosersPanel';
import { NewsOfToday }             from '@/components/dashboard/NewsOfToday';
import { OmniExplorer }            from '@/components/dashboard/OmniExplorer';
import { WhaleAcademy }            from '@/components/dashboard/WhaleAcademy';
import { VossSupremacyPanel }    from '@/components/dashboard/VossSupremacyPanel';
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
import AztecMempoolSpace           from '@/components/premium/AztecMempoolSpace';
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
const SovereignChat = dynamic(
  () => import('@/components/dashboard/SovereignChat').then(m => m.SovereignChat),
  { ssr: false }
);
const HyperliquidExecutionPanel = dynamic(
  () => import('@/components/dashboard/HyperliquidExecutionPanel').then(m => m.HyperliquidExecutionPanel),
  { ssr: false }
);
const MempoolForensicsPanel = dynamic(
  () => import('@/components/dashboard/MempoolForensicsPanel').then(m => m.MempoolForensicsPanel),
  { ssr: false }
);
const ReputationDashboard = dynamic(
  () => import('@/components/dashboard/ReputationDashboard').then(m => m.ReputationDashboard),
  { ssr: false }
);
const MorphoYieldDashboard = dynamic(
  () => import('@/components/dashboard/MorphoYieldDashboard').then(m => m.MorphoYieldDashboard),
  { ssr: false }
);

import "@/app/dashboard/dashboard.css";

// ── Minimal Aztec-style panel header with hover description ───────────────────
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
    const [hovered, setHovered] = React.useState(false);
    return (
        <div
            className="relative shrink-0 flex items-center justify-between mb-6 pb-5 border-b border-black/[0.07] cursor-default select-none"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Left */}
            <div className="flex items-start gap-4">
                <div
                    className="w-8 h-8 rounded-[3px] flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-300"
                    style={{
                        background: `${accent}0D`,
                        border: `1px solid ${accent}20`,
                        transform: hovered ? 'scale(1.08)' : 'scale(1)',
                    }}
                >
                    <Icon size={13} strokeWidth={1.6} style={{ color: accent }} />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                    <h2
                        className="text-[12px] font-black uppercase text-[#050505] leading-none tracking-[0.28em]"
                        style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
                    >
                        {title}
                    </h2>
                    <div
                        className="overflow-hidden transition-all duration-300 ease-out"
                        style={{ maxHeight: hovered ? '48px' : '0px', opacity: hovered ? 1 : 0 }}
                    >
                        <p className="text-[10.5px] text-black/45 font-normal leading-snug max-w-[520px] pt-0.5">
                            {description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Right accent line */}
            <div
                className="hidden md:block h-px flex-1 ml-8 transition-all duration-500"
                style={{ background: hovered ? `linear-gradient(to right, ${accent}40, transparent)` : `linear-gradient(to right, rgba(0,0,0,0.06), transparent)` }}
            />
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

    React.useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

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
    }, []);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'market-data':
                return <><PanelHeader icon={Globe} title="Market Overview" description="Comprehensive real-time global market data and asset tracking." accent="#0052FF" /><div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`market-data-${refreshKey}`}><WatchlistTable /></DashboardErrorBoundary></div></>;


            case 'dashboard':
            case 'watchlist':
            case 'firehose':
            case 'sov-intel':
            case 'live-port':
            case 'whale-port':
                return (
                    <div className="flex flex-col items-center justify-center h-[400px] gap-4 text-black/20">
                        <span className="text-[11px] font-black uppercase tracking-[0.3em]">Module Temporarily Disabled</span>
                        <span className="text-[9px] font-mono">Contact administrator to re-enable this section</span>
                    </div>
                );

            case 'billing':
                return <><PanelHeader icon={LayoutDashboard} title="Billing & Plan" description="Manage your on-chain plan and view cryptographic invoices." accent="#00C076" /><div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`billing-${refreshKey}`}><PlanDashboard /></DashboardErrorBoundary></div></>;

            case 'zk':
                return <><PanelHeader icon={Shield} title="ZK Shield" description="Monitor Aztec Network's zero-knowledge rollup pipeline. Visualise pending proofs and mempool activity." accent="#9945FF" /><div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`zk-shield-${refreshKey}`}><AztecMempoolSpace /></DashboardErrorBoundary></div></>;

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

            case 'graph':
                return <><PanelHeader icon={Compass} title="Entity Graph" description="Interactive network map of wallet relationships and capital flows." accent="#9945FF" /><div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`graph-${refreshKey}`}><EntityGraphVis /></DashboardErrorBoundary></div></>;


            case 'defi':
                return <><PanelHeader icon={Landmark} title="DeFi Yields" description="Interest rates and returns across decentralised finance protocols. Find the best places to put your assets to work." accent="#00C076" /><div className="flex-1 min-h-[800px] shrink-0"><DashboardErrorBoundary key={`defi-yield-${refreshKey}`}><DeFiYieldPanel /></DashboardErrorBoundary></div></>;

            case 'polymarket':
                return <><PanelHeader icon={BarChart3} title="Prediction Markets" description="Open prediction markets and their current probabilities. See what the crowd believes will happen in politics, crypto, and world events." accent="#9945FF" /><div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`polymarket-${refreshKey}`}><PolymarketGlassDashboard /></DashboardErrorBoundary></div></>;

            case 'forge':
                return <><PanelHeader icon={FlaskConical} title="Contract Sandbox" description="Deploy and test smart contracts in a safe environment. Experiment with on-chain logic without risk before going to mainnet." accent="#9945FF" /><div className="flex-1 min-h-[800px] shrink-0"><DashboardErrorBoundary key={`cosmic-forge-${refreshKey}`}><CosmicForgePanel /></DashboardErrorBoundary></div></>;

            case 'portfolio':
                return <><PanelHeader icon={Wallet} title="My Portfolio" description="The complete balance and value of all tokens in your connected wallet across every supported blockchain." accent="#00C076" /><div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`human-port-${refreshKey}`}><PortfolioDashboard /></DashboardErrorBoundary></div></>;

            case 'vault':
                return <><PanelHeader icon={Lock} title="Secure Vault" description="Store sensitive data and private notes in an encrypted environment. Only your wallet signature can unlock what you save here." accent="#D4AF37" /><div className="h-[650px] shrink-0"><DashboardErrorBoundary key={`sov-vault-${refreshKey}`}><SovereignVault /></DashboardErrorBoundary></div></>;

            case 'logs':
                return <><PanelHeader icon={Database} title="Activity Log" description="A complete history of all actions taken during your session. Useful for auditing and reviewing your on-chain interactions." accent="#0052FF" /><div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`session-logs-${refreshKey}`}><SessionLogsPanel /></DashboardErrorBoundary></div></>;

            case 'academy':
                return <><PanelHeader icon={BookOpen} title="Academy" description="Learn how blockchain, DeFi, and on-chain analytics work through structured guides written for all experience levels." accent="#050505" /><div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`academy-${refreshKey}`}><WhaleAcademy /></DashboardErrorBoundary></div></>;

            case 'support':
                return <><PanelHeader icon={MessageSquare} title="Support" description="Contact the team directly, report a problem, or ask a question. We respond as quickly as possible to every request." accent="#050505" /><div className="flex-1 min-h-[800px] shrink-0"><DashboardErrorBoundary key={`support-${refreshKey}`}><WhaleSupport /></DashboardErrorBoundary></div></>;

            case 'chat':
                return <><PanelHeader icon={MessageCircle} title="Sovereign Chat" description="End-to-End encrypted messaging via the XMTP protocol. No server can read your messages. Ever." accent="#9945FF" /><div className="flex-1 min-h-[700px] shrink-0"><DashboardErrorBoundary key={`chat-${refreshKey}`}><SovereignChat /></DashboardErrorBoundary></div></>;

            case 'trade':
                return <><PanelHeader icon={TrendingUp} title="Trading Terminal" description="Execute perpetual futures positions directly on Hyperliquid L1 without leaving the dashboard. Zero-gas institutional execution." accent="#00C076" /><div className="flex-1 min-h-[900px] shrink-0"><DashboardErrorBoundary key={`trade-${refreshKey}`}><HyperliquidExecutionPanel /></DashboardErrorBoundary></div></>;

            case 'forensics':
                return <><PanelHeader icon={Radar} title="Mempool Forensics" description="AI heuristic engine scanning the Ethereum and Optimism mempools in real-time for drainer contracts, MEV sandwiches, and phishing attacks." accent="#FF1744" /><div className="flex-1 min-h-[900px] shrink-0"><DashboardErrorBoundary key={`forensics-${refreshKey}`}><MempoolForensicsPanel /></DashboardErrorBoundary></div></>;

            case 'reputation':
                return <><PanelHeader icon={Award} title="Reputation SBT" description="Your on-chain Soulbound Token passport. A non-transferable proof of your journey, milestones, and contribution to the Sovereign ecosystem." accent="#D4AF37" /><div className="flex-1 min-h-[700px] shrink-0"><DashboardErrorBoundary key={`reputation-${refreshKey}`}><ReputationDashboard /></DashboardErrorBoundary></div></>;

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
            <div className="flex flex-col gap-6 w-full pb-12 h-full">
                {renderTabContent()}
            </div>
        </WhaleProShell>
    );
}
