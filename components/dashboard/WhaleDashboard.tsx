"use client";

import React, { useState } from 'react';
import { 
  Globe, Lock, BookOpen, Star, Newspaper, 
  Ticket, Flame, Search, Layers, LineChart, Book,
  Network, Compass, Landmark, BarChart3, FlaskConical,
  Wallet, Shield, Database, MessageSquare,
  LayoutDashboard, ShieldAlert
} from 'lucide-react';

import { WhaleProShell }          from '@/components/dashboard/WhaleProShell';
import { DashboardErrorBoundary }  from '@/components/dashboard/DashboardErrorBoundary';

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

// ── Hidden panels (commented out — re-enable with sidebar items) ───────────────
// import { PremiumMatrixStack }   from '@/components/premium/PremiumMatrixStack';
// import { WatchlistTable }       from '@/components/dashboard/WatchlistTable';
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

export default function WhaleDashboard() {
    const [activeTab, setActiveTab] = useState<string>('news');

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
                return <><PanelHeader icon={Globe} title="Market Overview" description="Real-time global crypto market data — prices, volume, dominance and key metrics from top assets across all major chains." accent="#0052FF" /><div className="flex flex-col gap-6 h-auto shrink-0"><DashboardErrorBoundary key={`market-gainers-${refreshKey}`}><GainersLosersPanel /></DashboardErrorBoundary><DashboardErrorBoundary key={`market-news-${refreshKey}`}><NewsOfToday /></DashboardErrorBoundary></div></>;

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

            case 'zk':
                return <><PanelHeader icon={Shield} title="ZK Shield" description="Monitor Aztec Network's zero-knowledge rollup pipeline. Visualise pending proofs and mempool activity." accent="#9945FF" /><div className="flex-1 min-h-[850px] shrink-0"><DashboardErrorBoundary key={`zk-shield-${refreshKey}`}><AztecMempoolSpace /></DashboardErrorBoundary></div></>;

            case 'news':
                return <><PanelHeader icon={Newspaper} title="News" description="The latest news and market analysis curated from key sources in crypto and global finance." accent="#050505" /><div className="h-[750px] shrink-0"><DashboardErrorBoundary key={`news-${refreshKey}`}><NewsOfToday /></DashboardErrorBoundary></div></>;

            case 'gold':
                return <><PanelHeader icon={Ticket} title="Access Pass" description="Mint your institutional clearance pass to unlock advanced analytics, private data feeds, and exclusive platform features." accent="#D4AF37" /><div className="flex-1 min-h-[950px] shrink-0"><DashboardErrorBoundary key={`gold-${refreshKey}`}><VossSupremacyPanel /></DashboardErrorBoundary></div></>;

            case 'markets':
                return <><PanelHeader icon={Globe} title="Markets" description="Top performing and worst performing crypto assets. Price changes, volume, and market capitalisation at a glance." accent="#0052FF" /><div className="h-[700px] shrink-0"><DashboardErrorBoundary key={`gainers-${refreshKey}`}><GainersLosersPanel /></DashboardErrorBoundary></div></>;

            case 'newpairs':
                return <><PanelHeader icon={Flame} title="New Listings" description="Tokens listed on decentralised exchanges in the last 24 hours. Be among the first to spot new trading opportunities." accent="#FF6B35" /><div className="h-[700px] shrink-0"><DashboardErrorBoundary key={`new-pairs-${refreshKey}`}><NewPairsTable /></DashboardErrorBoundary></div></>;

            case 'omniexplorer':
                return <><PanelHeader icon={Search} title="Block Explorer" description="Search any wallet address, transaction, or block across multiple blockchains. Verify on-chain activity instantly." accent="#050505" /><div className="flex-1 min-h-[750px] shrink-0"><DashboardErrorBoundary key={`omni-explorer-${refreshKey}`}><OmniExplorer /></DashboardErrorBoundary></div></>;

            case 'brc':
                return <><PanelHeader icon={Layers} title="Bitcoin Layer 2" description="Explore inscriptions, BRC-20 tokens, and Bitcoin Layer 2 activity. Track ordinals and emerging Bitcoin-native protocols." accent="#F7931A" /><div className="flex-1 min-h-[750px] shrink-0"><DashboardErrorBoundary key={`brc-${refreshKey}`}><BRCExplorerShell /></DashboardErrorBoundary></div></>;

            case 'inst-ledger':
                return <><PanelHeader icon={Book} title="Whale Ledger" description="Large-value transfers made by institutional wallets and known entities. Understand where significant capital is moving." accent="#9945FF" /><div className="h-[700px] shrink-0"><DashboardErrorBoundary key={`inst-ledger-${refreshKey}`}><InstitutionalLedger /></DashboardErrorBoundary></div></>;

            case 'mass-transfer':
                return <><PanelHeader icon={Network} title="Mass Transfers" description="Coordinated or unusually large token movements across multiple wallets. Spot potential market-moving events early." accent="#9945FF" /><div className="h-[700px] shrink-0"><DashboardErrorBoundary key={`mass-transfer-${refreshKey}`}><MassTransferIntel /></DashboardErrorBoundary></div></>;

            case 'graph':
                return <><PanelHeader icon={Compass} title="Entity Graph" description="The connections between wallets and entities as an interactive network map. Understand relationships and fund flows visually." accent="#9945FF" /><div className="flex-1 min-h-[900px] shrink-0"><DashboardErrorBoundary key={`neural-graph-${refreshKey}`}><EntityGraphVis /></DashboardErrorBoundary></div></>;

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

            default:
                // Fallback: news panel so users never see a blank screen
                return <><PanelHeader icon={Newspaper} title="News" description="The latest news and market analysis curated from key sources in crypto and global finance." accent="#050505" /><div className="h-[750px] shrink-0"><DashboardErrorBoundary key={`news-default-${refreshKey}`}><NewsOfToday /></DashboardErrorBoundary></div></>;
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
