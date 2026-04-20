"use client";

import React, { useState } from 'react';
import { LayoutDashboard, Globe, Cpu, Lock, BookOpen } from 'lucide-react';

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

type TabId =
    | 'dashboard'
    | 'markets'
    | 'intelligence'
    | 'wallet'
    | 'resources';

export default function WhaleDashboard() {
    const [activeTab, setActiveTab] = useState<TabId>('dashboard');

    return (
        <WhaleProShell
            activeTab={activeTab}
            onTabChange={(id: string) => setActiveTab(id as TabId)}
            isExternalEmbed={false}
        >
                activeTab === 'dashboard' ? (
                    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto pb-12">
                        {/* Telemetry Header */}
                        <div className="shrink-0 h-28 bg-white border border-[#E5E5E5] rounded-2xl flex items-center justify-between px-6 md:px-8 shadow-sm relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none transition-all duration-700 group-hover:bg-emerald-500/10" />
                           <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-[#050505]/5 blur-[60px] rounded-full pointer-events-none" />
                           <div className="z-10">
                              <h2 className="text-[12px] md:text-[14px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[#050505] flex items-center gap-3">
                                <LayoutDashboard size={16} className="text-[#888888]" /> Command Center
                              </h2>
                              <p className="text-[10px] text-[#888888] uppercase tracking-[0.2em] mt-1.5 font-medium">Aggregated Omni-layer Market Dynamics</p>
                           </div>
                           <div className="z-10 hidden md:flex items-center gap-8">
                              <div className="flex flex-col text-right">
                                 <span className="text-[8px] uppercase font-black text-[#888888] tracking-widest mb-1">Global AI Consensus</span>
                                 <span className="text-[16px] font-mono font-black text-emerald-600">OPTIMAL</span>
                              </div>
                              <div className="w-px h-8 bg-black/10" />
                              <div className="flex flex-col text-right">
                                 <span className="text-[8px] uppercase font-black text-[#888888] tracking-widest mb-1">Processing Power</span>
                                 <span className="text-[14px] font-mono font-black text-[#050505]">900T FLOPS</span>
                              </div>
                           </div>
                        </div>

                        <div className="h-[550px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="dashboard"><PremiumMatrixStack /></DashboardErrorBoundary></div>
                        <div className="h-[450px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="news"><NewsOfToday /></DashboardErrorBoundary></div>
                        <div className="h-[450px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="watchlist"><WatchlistTable /></DashboardErrorBoundary></div>
                        <div className="h-[450px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="gold"><GoldTicketPanel /></DashboardErrorBoundary></div>
                    </div>
                ) : activeTab === 'markets' ? (
                    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto pb-12">
                        {/* Telemetry Header */}
                        <div className="shrink-0 h-28 bg-[#050505] border border-white/10 rounded-2xl flex items-center justify-between px-6 md:px-8 shadow-sm relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-80 h-80 bg-[#00f5ff]/10 blur-[100px] rounded-full pointer-events-none transition-all duration-700 group-hover:bg-[#00f5ff]/20" />
                           <div className="z-10">
                              <h2 className="text-[12px] md:text-[14px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-white flex items-center gap-3">
                                <Globe size={16} className="text-[#00f5ff]" /> Market Analytics
                              </h2>
                              <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] mt-1.5 font-medium">Real-time Topographic Orderbook Scanning</p>
                           </div>
                           <div className="z-10 hidden md:flex items-center gap-8">
                              <div className="flex flex-col text-right">
                                 <span className="text-[8px] uppercase font-black text-white/30 tracking-widest mb-1">Network Entropy</span>
                                 <span className="text-[16px] font-mono font-black text-[#00f5ff]">HIGH VOLATILITY</span>
                              </div>
                           </div>
                        </div>

                        <div className="h-[600px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="gainers"><GainersLosersPanel /></DashboardErrorBoundary></div>
                        <div className="h-[550px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="new-pairs"><NewPairsTable /></DashboardErrorBoundary></div>
                        <div className="h-[600px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="whale-events"><VirtualizedFirehose /></DashboardErrorBoundary></div>
                        <div className="h-[650px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="omni-explorer"><OmniExplorer /></DashboardErrorBoundary></div>
                        <div className="h-[600px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="brc"><BRCExplorerShell /></DashboardErrorBoundary></div>
                    </div>
                ) : activeTab === 'intelligence' ? (
                    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto pb-12">
                        {/* Telemetry Header */}
                        <div className="shrink-0 h-28 bg-[#FAF9F6] border border-[#d4d4d4] rounded-2xl flex items-center justify-between px-6 md:px-8 shadow-[inset_0_2px_20px_rgba(0,0,0,0.02)] relative overflow-hidden group">
                           <div className="absolute -top-12 -right-12 w-64 h-64 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none transition-all duration-1000 group-hover:bg-purple-500/20" />
                           <div className="z-10">
                              <h2 className="text-[12px] md:text-[14px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[#050505] flex items-center gap-3">
                                <Cpu size={16} className="text-purple-600" /> Forensic Intelligence
                              </h2>
                              <p className="text-[10px] text-[#050505]/50 uppercase tracking-[0.2em] mt-1.5 font-medium">On-Chain Latent Graph Extraction Protocol</p>
                           </div>
                           <div className="z-10 hidden md:flex items-center gap-8">
                              <div className="flex flex-col text-right">
                                 <span className="text-[8px] uppercase font-black text-[#050505]/40 tracking-widest mb-1">Algorithmic Confidence</span>
                                 <span className="text-[16px] font-mono font-black text-purple-700">99.998%</span>
                              </div>
                           </div>
                        </div>

                        <div className="h-[500px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="sovereign-intel"><SovereignIntelTab /></DashboardErrorBoundary></div>
                        <div className="h-[600px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="inst-ledger"><InstitutionalLedger /></DashboardErrorBoundary></div>
                        <div className="h-[550px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="mass-transfer"><MassTransferIntel /></DashboardErrorBoundary></div>
                        <div className="h-[750px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="neural-graph"><EntityGraphVis /></DashboardErrorBoundary></div>
                        <div className="h-[700px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="cosmic-forge"><CosmicForgePanel /></DashboardErrorBoundary></div>
                        <div className="h-[600px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="defi-yield"><DeFiYieldPanel /></DashboardErrorBoundary></div>
                        <div className="h-[650px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="polymarket"><PolymarketGlassDashboard /></DashboardErrorBoundary></div>
                    </div>
                ) : activeTab === 'wallet' ? (
                    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto pb-12">
                        {/* Telemetry Header */}
                        <div className="shrink-0 h-28 bg-white border border-[#E5E5E5] rounded-2xl flex items-center justify-between px-6 md:px-8 shadow-sm relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none transition-all duration-700 group-hover:bg-amber-500/15" />
                           <div className="z-10">
                              <h2 className="text-[12px] md:text-[14px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[#050505] flex items-center gap-3">
                                <Lock size={16} className="text-amber-500" /> Executive Vault
                              </h2>
                              <p className="text-[10px] text-[#888888] uppercase tracking-[0.2em] mt-1.5 font-medium">Zero-Knowledge Financial Execution Layer</p>
                           </div>
                           <div className="z-10 hidden md:flex items-center gap-8">
                              <div className="flex flex-col text-right">
                                 <span className="text-[8px] uppercase font-black text-[#888888] tracking-widest mb-1">Encryption Status</span>
                                 <span className="text-[16px] font-mono font-black text-amber-600">MILITARY GRADE</span>
                              </div>
                           </div>
                        </div>

                        <div className="h-[550px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="portfolio"><LivePortfolio /></DashboardErrorBoundary></div>
                        <div className="h-[500px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="sov-vault"><SovereignVault /></DashboardErrorBoundary></div>
                        <div className="h-[500px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="zk-shield"><ZKShieldStation /></DashboardErrorBoundary></div>
                        <div className="h-[550px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="whale-portfolio"><WhalePortfolio /></DashboardErrorBoundary></div>
                        <div className="h-[650px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="human-port"><PortfolioDashboard /></DashboardErrorBoundary></div>
                        <div className="h-[450px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="session-logs"><SessionLogsPanel /></DashboardErrorBoundary></div>
                    </div>
                ) : activeTab === 'resources' ? (
                    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto pb-12">
                        {/* Telemetry Header */}
                        <div className="shrink-0 h-28 bg-[#050505] border border-white/10 rounded-2xl flex items-center justify-between px-6 md:px-8 shadow-sm relative overflow-hidden group">
                           <div className="z-10">
                              <h2 className="text-[12px] md:text-[14px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-white flex items-center gap-3">
                                <BookOpen size={16} className="text-white/50" /> Ecosystem Resources
                              </h2>
                              <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-1.5 font-medium">Documentation, Support & Sovereign Academy</p>
                           </div>
                        </div>

                        <div className="h-[750px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="academy"><WhaleAcademy /></DashboardErrorBoundary></div>
                        <div className="h-[500px] shrink-0 drop-shadow-sm"><DashboardErrorBoundary key="support"><WhaleSupport /></DashboardErrorBoundary></div>
                    </div>
                ) : null
        </WhaleProShell>
    );
}
