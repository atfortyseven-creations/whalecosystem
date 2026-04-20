"use client";

import React, { useState } from 'react';
import { 
  LayoutDashboard, Globe, Cpu, Lock, BookOpen, Star, Newspaper, 
  Ticket, Zap, Search, Layers, Activity, ShieldAlert, Book, 
  Network, Compass, Landmark, BarChart3, FlaskConical, 
  Wallet, Shield, Database, HeadphonesIcon 
} from 'lucide-react';

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
import { SessionLogsPanel }        from '@/components/dashboard/SessionLogsPanel';
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

// Reusable Top Header Component for Perfect Consistency
const TelemetryHeader = ({ icon: Icon, title, subtitle, isDark = false, themeColor = 'emerald' }: { icon: any, title: string, subtitle: string, isDark?: boolean, themeColor?: string }) => {
    const bgColors = {
        emerald: 'bg-emerald-500',
        amber: 'bg-amber-500',
        purple: 'bg-purple-500',
        blue: 'bg-[#00f5ff]',
        red: 'bg-rose-500'
    };
    
    const textColors = {
        emerald: 'text-emerald-500',
        amber: 'text-amber-500',
        purple: 'text-purple-500',
        blue: 'text-[#00f5ff]',
        red: 'text-rose-500'
    };

    const selBg = bgColors[themeColor as keyof typeof bgColors] || 'bg-emerald-500';
    const selText = textColors[themeColor as keyof typeof textColors] || 'text-emerald-500';

    return (
        <div className={`shrink-0 h-24 border rounded-xl flex items-center justify-between px-6 shadow-sm relative overflow-hidden ${isDark ? 'bg-[#050505] border-white/10' : 'bg-white border-[#E5E5E5]'}`}>
            <div className={`absolute top-0 right-0 w-64 h-64 ${selBg}/10 blur-[80px] rounded-full pointer-events-none transition-all duration-700`} />
            <div className="z-10 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-[#FAF9F6] border border-[#E5E5E5]'}`}>
                    <Icon size={18} className={selText} />
                </div>
                <div>
                   <h2 className={`text-[13px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-[#050505]'}`}>
                     {title}
                   </h2>
                   <p className={`text-[10px] uppercase tracking-[0.2em] mt-1 font-medium ${isDark ? 'text-white/50' : 'text-[#888888]'}`}>{subtitle}</p>
                </div>
            </div>
            <div className="z-10 hidden md:flex flex-col text-right">
                <span className={`text-[8px] uppercase font-black tracking-widest mb-1 ${isDark ? 'text-white/30' : 'text-[#888888]'}`}>Telemetry Node</span>
                <span className={`text-[12px] font-mono font-black ${selText}`}>ACTIVE</span>
            </div>
        </div>
    );
};

export default function WhaleDashboard() {
    const [activeTab, setActiveTab] = useState<string>('dashboard');

    // Centralized Tab Render Function for Maximum Perfection
    const renderTabContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <><TelemetryHeader icon={LayoutDashboard} title="Dashboard Overview" subtitle="System Matrix" themeColor="emerald" /><div className="h-[650px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="dashboard"><PremiumMatrixStack /></DashboardErrorBoundary></div></>;
            case 'watchlist':
                return <><TelemetryHeader icon={Star} title="Institutional Watchlist" subtitle="Market Tracking" themeColor="emerald" /><div className="h-[650px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="watchlist"><WatchlistTable /></DashboardErrorBoundary></div></>;
            case 'news':
                return <><TelemetryHeader icon={Newspaper} title="Global News Feed" subtitle="Real-time Briefing" themeColor="emerald" /><div className="h-[750px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="news"><NewsOfToday /></DashboardErrorBoundary></div></>;
            case 'gold':
                return <><TelemetryHeader icon={Ticket} title="Premium Hub" subtitle="Gold Access Portal" themeColor="amber" /><div className="h-[650px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="gold"><GoldTicketPanel /></DashboardErrorBoundary></div></>;
            
            case 'markets':
                return <><TelemetryHeader icon={Globe} title="Market Analytics" subtitle="Top Assets" isDark themeColor="blue" /><div className="h-[700px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="gainers"><GainersLosersPanel /></DashboardErrorBoundary></div></>;
            case 'newpairs':
                return <><TelemetryHeader icon={Zap} title="Discovery Engine" subtitle="New Token Pairs" isDark themeColor="blue" /><div className="h-[700px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="new-pairs"><NewPairsTable /></DashboardErrorBoundary></div></>;
            case 'omniexplorer':
                return <><TelemetryHeader icon={Search} title="Omni Explorer" subtitle="Cross-chain Verification" isDark themeColor="blue" /><div className="flex-1 min-h-[750px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="omni-explorer"><OmniExplorer /></DashboardErrorBoundary></div></>;
            case 'brc':
                return <><TelemetryHeader icon={Layers} title="Bitcoin L2" subtitle="BRC Explorer" isDark themeColor="amber" /><div className="flex-1 min-h-[750px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="brc"><BRCExplorerShell /></DashboardErrorBoundary></div></>;

            case 'firehose':
                return <><TelemetryHeader icon={Activity} title="Whale Firehose" subtitle="Live Aggregation" themeColor="purple" /><div className="flex-1 min-h-[850px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="whale-events"><VirtualizedFirehose /></DashboardErrorBoundary></div></>;
            case 'sov-intel':
                return <><TelemetryHeader icon={ShieldAlert} title="Sovereign Intel" subtitle="Forensic Operations" themeColor="purple" /><div className="h-[600px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="sovereign-intel"><SovereignIntelTab /></DashboardErrorBoundary></div></>;
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
            case 'live-port':
                return <><TelemetryHeader icon={Activity} title="Quick Portfolio" subtitle="Live Net Worth" themeColor="emerald" /><div className="h-[700px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="portfolio-live"><LivePortfolio /></DashboardErrorBoundary></div></>;
            case 'whale-port':
                return <><TelemetryHeader icon={Star} title="Whale Holdings" subtitle="Tracked Entity Values" themeColor="emerald" /><div className="h-[750px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="whale-portfolio"><WhalePortfolio /></DashboardErrorBoundary></div></>;
            case 'vault':
                return <><TelemetryHeader icon={Lock} title="Sovereign Vault" subtitle="ZK Execution Environment" isDark themeColor="amber" /><div className="h-[650px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="sov-vault"><SovereignVault /></DashboardErrorBoundary></div></>;
            case 'zk':
                return <><TelemetryHeader icon={Shield} title="ZK Shield Station" subtitle="Zero-Knowledge Compliance" isDark themeColor="amber" /><div className="h-[600px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="zk-shield"><ZKShieldStation /></DashboardErrorBoundary></div></>;

            case 'logs':
                return <><TelemetryHeader icon={Database} title="Session Logs" subtitle="Terminal Security Events" isDark themeColor="blue" /><div className="flex-1 min-h-[850px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="session-logs"><SessionLogsPanel /></DashboardErrorBoundary></div></>;

            case 'academy':
                return <><TelemetryHeader icon={BookOpen} title="Sovereign Academy" subtitle="Knowledge Architecture" isDark themeColor="blue" /><div className="flex-1 min-h-[850px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="academy"><WhaleAcademy /></DashboardErrorBoundary></div></>;
            case 'support':
                return <><TelemetryHeader icon={HeadphonesIcon} title="Whale Support" subtitle="Direct Channel" isDark themeColor="blue" /><div className="flex-1 min-h-[800px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="support"><WhaleSupport /></DashboardErrorBoundary></div></>;

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
