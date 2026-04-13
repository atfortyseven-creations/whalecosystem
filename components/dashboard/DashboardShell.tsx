"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    LayoutDashboard, Wallet, Activity, Settings, QrCode, X,
    Plus, Cpu, Bot, Link as LinkIcon, ChevronRight, Circle,
    Zap, TrendingUp, AlertTriangle, Terminal, RefreshCw, Home,
    Save, Search, Shield, BookOpen, GraduationCap, Link2, Globe
} from 'lucide-react';
import { SovereignBridge } from '@/components/premium/SovereignBridge';
import { lazy, Suspense } from 'react';
import { WhaleLogo } from '../shared/WhaleLogo';
import { useAccount, useBalance } from 'wagmi';
import { create } from 'zustand';

// ─────────────────────────────────────────
// State Management
// ─────────────────────────────────────────
interface Log {
    id: string;
    time: string;
    msg: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

interface DashboardState {
    logs: Log[];
    addLog: (msg: string, type?: Log['type']) => void;
    clearLogs: () => void;
}

const useDashboardStore = create<DashboardState>((set) => ({
    logs: [],
    addLog: (msg, type = 'info') => set((state) => ({
        logs: [{
            id: Math.random().toString(36).substring(7),
            time: new Date().toLocaleTimeString(),
            msg,
            type
        }, ...state.logs].slice(0, 50)
    })),
    clearLogs: () => set({ logs: [] })
}));

// ─────────────────────────────────────────
// Lazy Components
// ─────────────────────────────────────────
const SovereignIntelTab = lazy(() => import('./SovereignIntelTab'));
const OmniExplorer = lazy(() => import('./OmniExplorer'));
const GoldTicketPanel = lazy(() => import('./GoldTicketPanel'));
const WhaleAcademy = lazy(() => import('./WhaleAcademy'));
const SecurityScanner = lazy(() => import('./SecurityScanner'));
const WhaleSupport = lazy(() => import('./WhaleSupport'));
const BitcoinPrimitives = lazy(() => import('./BitcoinPrimitives'));
const ConnectExchange = lazy(() => import('./ConnectExchange'));
const NewPairsTable = lazy(() => import('./NewPairsTable'));
const GainersLosersPanel = lazy(() => import('./GainersLosersPanel'));
const PortfolioDashboard = lazy(() => import('./PortfolioDashboard'));
const ApiTerminal = lazy(() => import('./ApiTerminal'));

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────
type Category = 'TERMINAL' | 'MARKET' | 'VAULT' | 'ACADEMY' | 'MEMBERSHIP';
type DashboardTab = 
    | 'explorer' | 'alerts' | 'live-txs'
    | 'tracker' | 'new-pairs' | 'gainers-losers' | 'api' | 'topography'
    | 'portfolio' | 'security'
    | 'bitcoin-net' | 'support' | 'exchange'
    | 'gold-whale';

type NodeType = 'wallet' | 'bot' | 'contract' | 'api';

interface NodeData {
    id: string;
    type: NodeType;
    x: number;
    y: number;
    title: string;
    status: 'active' | 'syncing' | 'error';
    latency: number;
    data?: any;
}

interface EdgeData {
    id: string;
    source: string;
    target: string;
}

const STATUS_COLOR: Record<string, string> = {
    active: '#00C076',
    syncing: '#00F2EA',
    error: '#FF3B30',
};

// ─────────────────────────────────────────
// Sidebar Components
// ─────────────────────────────────────────
function NavItem({ icon, label, active, onClick }: {
    icon: React.ReactNode; label: string; active: boolean; onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] transition-all duration-200 uppercase tracking-widest font-black ${
                active
                    ? 'bg-black text-white shadow-lg shadow-black/10'
                    : 'text-black/40 hover:text-black hover:bg-black/5'
            }`}
        >
            <span className={`shrink-0 ${active ? 'text-[#00F2EA]' : 'text-current opacity-40'}`}>{icon}</span>
            <span className="truncate">{label}</span>
            {active && <ChevronRight size={12} className="ml-auto text-white/40" />}
        </button>
    );
}

function CategoryHeader({ label }: { label: string }) {
    return (
        <div className="px-3 pt-6 pb-2 text-[9px] font-black text-black/20 uppercase tracking-[0.3em]">
            {label}
        </div>
    );
}

// ─────────────────────────────────────────
// Main Shell
// ─────────────────────────────────────────
export function DashboardShell() {
    const [tab, setTab] = useState<DashboardTab>('explorer');
    const [bridgeOpen, setBridgeOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [nodes, setNodes] = useState<NodeData[]>([]);

    const selectedNode = nodes.find(n => n.id === selectedId);

    const handleNodeUpdate = (updatedNode: NodeData) => {
        setNodes(prev => prev.map(n => n.id === updatedNode.id ? updatedNode : n));
    };

    return (
        <div
            data-dashboard="true"
            className="flex text-black font-sans"
            style={{
                position: 'fixed', inset: 0, zIndex: 100,
                width: '100vw', height: '100vh', overflow: 'hidden',
                backgroundColor: '#FAF9F6' // Institutional Background
            }}
        >
            {/* ── COSMIC PATTERN BACKGROUND ── */}
            <div
                className="absolute inset-0 pointer-events-none bg-[url('/api/checkpoint-image?name=patron-cosmico-4k.png')] bg-repeat bg-left-top"
                style={{
                    backgroundSize: 'clamp(100px, 18vw, 320px)',
                    opacity: 0.08,
                    zIndex: 0,
                }}
            />

            {/* ── DASHBOARD UI LAYER ── */}
            <div className="relative z-10 flex w-full h-full overflow-hidden">
                
                {/* ── SIDEBAR ── */}
                <aside 
                    className="w-64 shrink-0 flex flex-col border-r border-black/[0.06] bg-white/40 backdrop-blur-xl"
                >
                    <div className="px-6 py-8 border-b border-black/[0.06] flex items-center gap-3">
                        <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center text-white">
                            <WhaleLogo size={24} color="white" />
                        </div>
                        <div>
                            <span className="text-sm font-black uppercase tracking-tighter block text-black">Sovereign</span>
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-black/20 -mt-1 block">Terminal</span>
                        </div>
                    </div>

                    <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
                        <CategoryHeader label="Terminal" />
                        <NavItem id="explorer" icon={<Search size={14}/>} label="Block Explorer" active={tab==='explorer'} onClick={()=>setTab('explorer')} />
                        <NavItem id="alerts" icon={<Activity size={14}/>} label="Live Alerts" active={tab==='alerts'} onClick={()=>setTab('alerts')} />
                        <NavItem id="live-txs" icon={<RefreshCw size={14}/>} label="Live Transactions" active={tab==='live-txs'} onClick={()=>setTab('live-txs')} />

                        <CategoryHeader label="Market Intelligence" />
                        <NavItem id="tracker" icon={<Globe size={14}/>} label="Whale Tracker" active={tab==='tracker'} onClick={()=>setTab('tracker')} />
                        <NavItem id="new-pairs" icon={<Plus size={14}/>} label="New Pairs" active={tab==='new-pairs'} onClick={()=>setTab('new-pairs')} />
                        <NavItem id="gainers-losers" icon={<TrendingUp size={14}/>} label="Gainers & Losers" active={tab==='gainers-losers'} onClick={()=>setTab('gainers-losers')} />
                        <NavItem id="topography" icon={<LayoutDashboard size={14}/>} label="Visual Graph" active={tab==='topography'} onClick={()=>setTab('topography')} />
                        <NavItem id="api" icon={<Terminal size={14}/>} label="API Access" active={tab==='api'} onClick={()=>setTab('api')} />

                        <CategoryHeader label="Secure Vault" />
                        <NavItem id="portfolio" icon={<Wallet size={14}/>} label="My Portfolio" active={tab==='portfolio'} onClick={()=>setTab('portfolio')} />
                        <NavItem id="security" icon={<Shield size={14}/>} label="Security Center" active={tab==='security'} onClick={()=>setTab('security')} />

                        <CategoryHeader label="Academy" />
                        <NavItem id="bitcoin-net" icon={<Cpu size={14}/>} label="Bitcoin Network" active={tab==='bitcoin-net'} onClick={()=>setTab('bitcoin-net')} />
                        <NavItem id="support" icon={<GraduationCap size={14}/>} label="Support Center" active={tab==='support'} onClick={()=>setTab('support')} />
                        <NavItem id="exchange" icon={<Link2 size={14}/>} label="Connect Exchange" active={tab==='exchange'} onClick={()=>setTab('exchange')} />

                        <CategoryHeader label="Membership" />
                        <NavItem id="gold-whale" icon={<Zap size={14} className="text-[#D4AF37]"/>} label="Gold Whale Network" active={tab==='gold-whale'} onClick={()=>setTab('gold-whale')} />
                    </nav>

                    <div className="p-4 border-t border-black/[0.06]">
                        <button 
                            onClick={() => setBridgeOpen(!bridgeOpen)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-black/5 hover:bg-black/10 rounded-2xl transition-all group"
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest text-black/40 group-hover:text-black">Device Bridge</span>
                            <QrCode size={14} className="text-black/20 group-hover:text-black" />
                        </button>
                    </div>
                </aside>

                {/* ── CONTENT AREA ── */}
                <main className="flex-1 flex flex-col min-w-0 bg-transparent relative">
                    <header className="h-16 shrink-0 border-b border-black/[0.06] bg-white/20 backdrop-blur-md px-8 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em]">Module // </span>
                            <span className="text-xs font-black uppercase tracking-tighter text-black">{tab.replace('-', ' ')}</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-[9px] font-black uppercase tracking-widest text-black/20">Operational Status</span>
                                <span className="text-[10px] font-black text-[#00C076] uppercase tracking-widest flex items-center gap-1.5">
                                    <Circle size={6} fill="#00C076" strokeWidth={0} /> System Stable
                                </span>
                            </div>
                            <div className="h-8 w-[1px] bg-black/[0.06]" />
                            <div className="flex items-center gap-4 text-black/30 hover:text-black transition-colors cursor-pointer">
                                <span className="text-[10px] font-black uppercase tracking-widest uppercase">Institutional v2.4</span>
                            </div>
                        </div>
                    </header>

                    <div className="flex-1 overflow-hidden relative">
                        <Suspense fallback={
                            <div className="absolute inset-0 flex items-center justify-center bg-white/20">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-10 h-10 border-2 border-black/5 border-t-black rounded-full animate-spin" />
                                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-black/20">Establishing Synchronous Link...</p>
                                </div>
                            </div>
                        }>
                            {renderTabContent(tab, {
                                selectedId, setSelectedId,
                                nodes, setNodes,
                                selectedNode,
                                handleNodeUpdate
                            })}
                        </Suspense>
                    </div>
                </main>
            </div>

            {/* ── BRIDGE DRAWER ── */}
            <AnimatePresence>
                {bridgeOpen && (
                    <motion.aside
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="w-80 border-l border-black/[0.06] bg-white/95 backdrop-blur-3xl z-50 shadow-2xl flex flex-col"
                    >
                        <div className="p-6 border-b border-black/[0.06] flex items-center justify-between">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Physical Bridge</div>
                            <button onClick={()=>setBridgeOpen(false)} className="p-2 hover:bg-black/5 rounded-xl transition-all">
                                <X size={16} className="text-black/40" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                            <SovereignBridge />
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─────────────────────────────────────────
// Tab Router Logic
// ─────────────────────────────────────────
function renderTabContent(tab: DashboardTab, props: any) {
    switch (tab) {
        // TERMINAL
        case 'explorer': return <OmniExplorer />;
        case 'alerts': return <ActivityTab />;
        case 'live-txs': return <LiveTransactions />;
        
        // MARKET
        case 'tracker': return <SovereignIntelTab />;
        case 'new-pairs': return <NewPairsTable />;
        case 'gainers-losers': return <GainersLosersPanel />;
        case 'topography': return <VisualTopography />;
        case 'api': return <ApiTerminal />;

        // VAULT
        case 'portfolio': return <PortfolioDashboard />;
        case 'security': return <SecurityScanner />;

        // ACADEMY
        case 'bitcoin-net': return <BitcoinPrimitives />;
        case 'support': return <WhaleSupport />;
        case 'exchange': return <ConnectExchange />;

        // MEMBERSHIP
        case 'gold-whale': return <GoldTicketPanel />;
        
        default: return <div className="p-12 text-center text-black/20 uppercase font-black text-[10px] tracking-widest">Component Protocol Not Found</div>;
    }
}

// ─────────────────────────────────────────
// Mock Activity / Logs (Internal for Shell)
// ─────────────────────────────────────────
function ActivityTab() {
    const { logs } = useDashboardStore();
    return (
        <div className="p-8 h-full overflow-y-auto font-mono scrollbar-hide">
            <div className="mb-8">
                <h2 className="text-xl font-black text-black uppercase tracking-tighter">Event Telemetry</h2>
                <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest mt-1">Live infrastructure audit log</p>
            </div>
            <div className="space-y-3">
                {logs.map(log => (
                    <div key={log.id} className="flex gap-4 p-4 bg-white border border-black/[0.04] rounded-2xl group hover:border-black/10 transition-all">
                        <span className="text-[10px] font-bold text-black/20 shrink-0 w-20">{log.time}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border shrink-0 ${
                            log.type === 'success' ? 'bg-[#00C076]/10 text-[#00C076] border-[#00C076]/20' :
                            log.type === 'error' ? 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20' :
                            'bg-black/5 text-black/40 border-black/10'
                        }`}>
                            {log.type}
                        </span>
                        <span className="text-[11px] font-bold text-black/70 leading-relaxed">{log.msg}</span>
                    </div>
                ))}
                {logs.length === 0 && (
                    <div className="py-20 text-center border-2 border-dashed border-black/[0.05] rounded-[2.5rem]">
                        <p className="text-[11px] font-black text-black/10 uppercase tracking-[0.4em]">No Telemetry Recorded</p>
                    </div>
                )}
            </div>
        </div>
    );
}
