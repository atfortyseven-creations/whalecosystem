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

// Reusable Top Header Component for Perfect Consistency - Institutional Grade Vanguard Aesthetic
const TelemetryHeader = ({ icon: Icon, title, subtitle, isDark = false, themeColor = 'emerald' }: { icon: any, title: string, subtitle: string, isDark?: boolean, themeColor?: string }) => {
    const themeMap = {
        emerald: { text: 'text-[#00C076]', bg: 'bg-[#00C076]', glow: 'shadow-[#00C076]/30', border: 'border-[#00C076]/20' },
        amber:   { text: 'text-[#D4AF37]', bg: 'bg-[#D4AF37]', glow: 'shadow-[#D4AF37]/30', border: 'border-[#D4AF37]/20' },
        purple:  { text: 'text-[#9945FF]', bg: 'bg-[#9945FF]', glow: 'shadow-[#9945FF]/30', border: 'border-[#9945FF]/20' },
        blue:    { text: 'text-[#0052FF]', bg: 'bg-[#0052FF]', glow: 'shadow-[#0052FF]/30', border: 'border-[#0052FF]/20' },
        red:     { text: 'text-[#FF3B30]', bg: 'bg-[#FF3B30]', glow: 'shadow-[#FF3B30]/30', border: 'border-[#FF3B30]/20' }
    };

    const sel = themeMap[themeColor as keyof typeof themeMap] || themeMap.emerald;

    return (
        <div className={`group shrink-0 h-16 mb-4 flex items-center justify-between px-2 relative overflow-hidden transition-all duration-500`}>
            
            {/* Animated Bottom Border Accent */}
            <div className={`absolute bottom-0 left-0 w-full h-[1px] ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                <div className={`absolute top-0 left-0 h-full w-1/3 ${sel.bg} opacity-50 group-hover:opacity-100 transition-all duration-1000 group-hover:w-2/3 ease-in-out`} />
            </div>

            <div className="z-10 flex items-center gap-5">
                {/* Minimalist Icon Container */}
                <div className={`relative flex items-center justify-center w-9 h-9 rounded-[4px] border ${isDark ? 'bg-[#0A0A0A] border-white/10' : 'bg-white border-[#E5E5E5] shadow-sm'}`}>
                    <div className={`absolute inset-0 rounded-[4px] blur-sm opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${sel.bg}`} />
                    <Icon size={14} className={`relative z-10 ${isDark ? 'text-white' : 'text-[#050505]'}`} strokeWidth={1.5} />
                </div>
                
                <div className="flex flex-col justify-center gap-1">
                   <div className="flex items-baseline gap-3">
                       <h2 className={`text-[12px] font-black uppercase tracking-[0.25em] ${isDark ? 'text-white' : 'text-[#050505]'}`}>
                         {title}
                       </h2>
                   </div>
                   <div className="flex items-center gap-2">
                       <span className={`text-[8.5px] font-mono font-bold uppercase tracking-[0.2em] ${sel.text}`}>
                           {subtitle}
                       </span>
                       <div className={`h-[1px] w-4 ${isDark ? 'bg-white/20' : 'bg-black/10'}`} />
                       <span className={`text-[7px] font-mono uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-black/30'}`}>
                           SYS.OP.NORMAL
                       </span>
                   </div>
                </div>
            </div>

            <div className="z-10 hidden md:flex items-center gap-6 text-right">
                {/* Tech grid aesthetic element */}
                <div className="flex gap-[3px]">
                    {[0.15, 0.4, 0.7, 0.3, 0.1].map((op, i) => (
                        <div key={i} className={`w-[2px] h-3 ${isDark ? 'bg-white' : 'bg-black'} transition-opacity duration-500`} style={{ opacity: op }} />
                    ))}
                </div>
                
                <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-[3px] border bg-transparent" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sel.bg} animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.5)] ${sel.glow}`} />
                        <span className={`text-[8.5px] font-mono font-bold uppercase tracking-widest ${isDark ? 'text-white/80' : 'text-[#050505]'}`}>
                            SYNCED
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function WhaleDashboard() {
    const [activeTab, setActiveTab] = useState<string>('news');

    const renderTabContent = () => {
        switch (activeTab) {
            // ── [HIDDEN — re-enable import + sidebar item to restore] ──────────
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
                return <><TelemetryHeader icon={Shield} title="Aztec ZK Shield" subtitle="Rollup Pipeline Mempool" themeColor="purple" /><div className="flex-1 min-h-[850px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="zk-shield"><AztecMempoolSpace /></DashboardErrorBoundary></div></>;

            // ── [ACTIVE PANELS] ────────────────────────────────────────────────
            case 'news':
                return <><TelemetryHeader icon={Newspaper} title="Global News Feed" subtitle="Real-time Briefing" themeColor="emerald" /><div className="h-[750px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="news"><NewsOfToday /></DashboardErrorBoundary></div></>;
            case 'gold':
                return <><TelemetryHeader icon={Ticket} title="Ticket Mint" subtitle="Institutional Clearance" isDark themeColor="amber" /><div className="flex-1 min-h-[950px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="gold"><VossSupremacyPanel /></DashboardErrorBoundary></div></>;
            
            case 'markets':
                return <><TelemetryHeader icon={Globe} title="Market Analytics" subtitle="Top Assets" isDark themeColor="blue" /><div className="h-[700px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="gainers"><GainersLosersPanel /></DashboardErrorBoundary></div></>;
            case 'newpairs':
                return <><TelemetryHeader icon={Flame} title="Discovery Engine" subtitle="New Token Pairs" isDark themeColor="blue" /><div className="h-[700px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="new-pairs"><NewPairsTable /></DashboardErrorBoundary></div></>;
            case 'omniexplorer':
                return <><TelemetryHeader icon={Search} title="Omni Explorer" subtitle="Cross-chain Verification" isDark themeColor="blue" /><div className="flex-1 min-h-[750px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="omni-explorer"><OmniExplorer /></DashboardErrorBoundary></div></>;
            case 'brc':
                return <><TelemetryHeader icon={Layers} title="Bitcoin L2" subtitle="BRC Explorer" isDark themeColor="amber" /><div className="flex-1 min-h-[750px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="brc"><BRCExplorerShell /></DashboardErrorBoundary></div></>;

            case 'inst-ledger':
                return <><TelemetryHeader icon={Book} title="Institutional Ledger" subtitle="Entity Transfers" themeColor="purple" /><div className="h-[700px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="inst-ledger"><InstitutionalLedger /></DashboardErrorBoundary></div></>;
            case 'mass-transfer':
                return <><TelemetryHeader icon={Network} title="Mass Transfers" subtitle="Anomaly Detection" themeColor="purple" /><div className="h-[700px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="mass-transfer"><MassTransferIntel /></DashboardErrorBoundary></div></>;
            case 'graph':
                return <><TelemetryHeader icon={Compass} title="Entity Graph" subtitle="Neural Topography Map" themeColor="purple" /><div className="flex-1 min-h-[900px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="neural-graph"><EntityGraphVis /></DashboardErrorBoundary></div></>;
            case 'defi':
                return <><TelemetryHeader icon={Landmark} title="DeFi Yields" subtitle="Protocol Margins" themeColor="purple" /><div className="flex-1 min-h-[800px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="defi-yield"><DeFiYieldPanel /></DashboardErrorBoundary></div></>;
            case 'polymarket':
                return <><TelemetryHeader icon={BarChart3} title="Polymarket Dashboard" subtitle="Prediction Markets" themeColor="purple" /><div className="flex-1 min-h-[850px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="polymarket"><PolymarketGlassDashboard /></DashboardErrorBoundary></div></>;
            case 'forge':
                return <><TelemetryHeader icon={FlaskConical} title="Cosmic Forge" subtitle="Smart Contract Sandbox" themeColor="purple" /><div className="flex-1 min-h-[800px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="cosmic-forge"><CosmicForgePanel /></DashboardErrorBoundary></div></>;

            case 'portfolio':
                return <><TelemetryHeader icon={Wallet} title="Main Portfolio" subtitle="Asset Execution Node" themeColor="emerald" /><div className="flex-1 min-h-[850px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="human-port"><PortfolioDashboard /></DashboardErrorBoundary></div></>;
            case 'vault':
                return <><TelemetryHeader icon={Lock} title="Sovereign Vault" subtitle="ZK Execution Environment" isDark themeColor="amber" /><div className="h-[650px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="sov-vault"><SovereignVault /></DashboardErrorBoundary></div></>;

            case 'logs':
                return <><TelemetryHeader icon={Database} title="Session Logs" subtitle="Terminal Security Events" isDark themeColor="blue" /><div className="flex-1 min-h-[850px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="session-logs"><SessionLogsPanel /></DashboardErrorBoundary></div></>;

            case 'academy':
                return <><TelemetryHeader icon={BookOpen} title="Sovereign Academy" subtitle="Knowledge Architecture" isDark themeColor="blue" /><div className="flex-1 min-h-[850px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="academy"><WhaleAcademy /></DashboardErrorBoundary></div></>;
            case 'support':
                return <><TelemetryHeader icon={MessageSquare} title="Whale Support" subtitle="Direct Channel" isDark themeColor="blue" /><div className="flex-1 min-h-[800px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="support"><WhaleSupport /></DashboardErrorBoundary></div></>;

            default:
                return null;
        }
    };

    return (
        <WhaleProShell
            activeTab={activeTab}
            onTabChange={(id: string) => setActiveTab(id)}
            isExternalEmbed={false}
        >
            <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto pb-12 h-full">
                {renderTabContent()}
            </div>
        </WhaleProShell>
    );
}
