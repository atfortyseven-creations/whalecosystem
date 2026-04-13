"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Wallet, Activity, Settings, QrCode, X,
    Plus, Cpu, Bot, Link as LinkIcon, ChevronRight, Circle,
    Zap, TrendingUp, AlertTriangle, Terminal, RefreshCw, Home,
    Save, Search, Shield, BookOpen, GraduationCap, Link2, Globe,
    Database, Bell, CheckCircle2, AlertCircle, Lock
} from 'lucide-react';
import { SovereignBridge } from '@/components/premium/SovereignBridge';
import { lazy, Suspense, useEffect } from 'react';
import { WhaleLogo } from '../shared/WhaleLogo';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';
import { useAccount, useBalance } from 'wagmi';
import { create } from 'zustand';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { toast } from 'sonner';

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
const SovereignIntelTab  = lazy(() => import('./SovereignIntelTab'));
const OmniExplorer       = lazy(() => import('./OmniExplorer'));
const GoldTicketPanel    = lazy(() => import('./GoldTicketPanel'));
const WhaleAcademy       = lazy(() => import('./WhaleAcademy'));
const SecurityScanner    = lazy(() => import('./SecurityScanner'));
const WhaleSupport       = lazy(() => import('./WhaleSupport'));
const BitcoinPrimitives  = lazy(() => import('./BitcoinPrimitives'));
const ConnectExchange    = lazy(() => import('./ConnectExchange'));
const NewPairsTable      = lazy(() => import('./NewPairsTable'));
const GainersLosersPanel = lazy(() => import('./GainersLosersPanel'));
const PortfolioDashboard = lazy(() => import('./PortfolioDashboard'));
const ApiTerminal        = lazy(() => import('./ApiTerminal'));
const AkashicLedger      = lazy(() => import('./AkashicLedger').then(m => ({ default: m.AkashicLedger ?? m.default })));
const MassTransferIntel  = lazy(() => import('./MassTransferIntel').then(m => ({ default: m.MassTransferIntel ?? m.default })));

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────
type DashboardTab =
    | 'explorer' | 'alerts' | 'live-txs'
    | 'tracker' | 'new-pairs' | 'gainers-losers' | 'api' | 'topography'
    | 'portfolio' | 'security'
    | 'akashic' | 'mass-transfer'
    | 'bitcoin-net' | 'support' | 'exchange'
    | 'gold-whale';

interface NodeData {
    id: string;
    type: 'wallet' | 'bot' | 'contract' | 'api';
    x: number;
    y: number;
    title: string;
    status: 'active' | 'syncing' | 'error';
    latency: number;
    data?: any;
}

// ─────────────────────────────────────────
// Sidebar Components
// ─────────────────────────────────────────
function NavItem({ id, icon, label, active, onClick }: {
    id?: string;
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            id={id}
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] transition-all duration-150 uppercase tracking-widest font-black ${
                active
                    ? 'bg-black text-white shadow-lg shadow-black/10'
                    : 'text-black/40 hover:text-black hover:bg-black/5'
            }`}
        >
            <span className={`shrink-0 ${active ? 'text-[#00F2EA]' : 'text-current opacity-40'}`}>
                {icon}
            </span>
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
// Animated Cosmic Pattern Background
// Slow drift animation at 30s cycle — visible but not distracting
// ─────────────────────────────────────────
function AnimatedCosmicPattern() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
            <motion.div
                className="absolute inset-[-20%] w-[140%] h-[140%]"
                style={{
                    backgroundImage: "url('/api/checkpoint-image?name=patron-cosmico-4k.png')",
                    backgroundSize: 'clamp(80px, 14vw, 260px) auto',
                    backgroundRepeat: 'repeat',
                    opacity: 0.07,
                }}
                animate={{
                    x: [0, 40, 0],
                    y: [0, 25, 0],
                }}
                transition={{
                    duration: 28,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    repeatType: 'mirror',
                }}
            />
        </div>
    );
}

// ─────────────────────────────────────────
// Suspense fallback
// ─────────────────────────────────────────
function TabLoader() {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-5">
                <div
                    className="w-10 h-10 rounded-full border-2 animate-spin"
                    style={{ borderColor: 'rgba(0,0,0,0.05)', borderTopColor: 'rgba(0,0,0,0.5)' }}
                />
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-black/20">
                    Establishing Synchronous Link...
                </p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────
// Main Shell
// ─────────────────────────────────────────
export function DashboardShell() {
    const [tab, setTabState]      = useState<DashboardTab>('explorer');
    const [bridgeOpen, setBridgeOpen] = useState(false);
    const [nodes, setNodes]       = useState<NodeData[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isIdle, setIsIdle]     = useState(false);
    const [lastActivity, setLastActivity] = useState(Date.now());

    // Mock Notifications for the Panel
    const notifications = [
        { id: 1, title: 'MEV Protection Active', desc: 'Secure RPC routing enabled.', time: 'Just now', type: 'success' },
        { id: 2, title: 'Whale Detected', desc: '14,000 ETH transferred to Binance.', time: '2m ago', type: 'alert' },
        { id: 3, title: 'Network Congestion', desc: 'Gas fees are currently high (45 gwei).', time: '15m ago', type: 'warning' },
    ];

    // Persistencia de Tab y Notificaciones
    useEffect(() => {
        const savedTab = localStorage.getItem('dashboard_active_tab') as DashboardTab;
        if (savedTab) setTabState(savedTab);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            const keyToTab: Record<string, DashboardTab> = {
                '1': 'explorer', '2': 'alerts', '3': 'tracker', '4': 'portfolio', '5': 'akashic'
            };
            if (keyToTab[e.key] && document.activeElement?.tagName !== 'INPUT') {
                setTabState(keyToTab[e.key]);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const setTab = (newTab: DashboardTab) => {
        setTabState(newTab);
        localStorage.setItem('dashboard_active_tab', newTab);
    };

    // Idle Session Tracker
    useEffect(() => {
        const timeoutMs = 600_000; // 10 minutes inactivity
        const resetTimer = () => setLastActivity(Date.now());
        
        ['mousemove', 'keydown', 'scroll', 'click'].forEach(evt => 
            window.addEventListener(evt, resetTimer)
        );

        const interval = setInterval(() => {
            if (Date.now() - lastActivity > timeoutMs) {
                setIsIdle(true);
            }
        }, 10_000);

        return () => {
            ['mousemove', 'keydown', 'scroll', 'click'].forEach(evt => 
                window.removeEventListener(evt, resetTimer)
            );
            clearInterval(interval);
        };
    }, [lastActivity]);

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
                backgroundColor: '#FAF9F6',
            }}
        >
            {/* ── ANIMATED COSMIC PATTERN ─────────────────────────────────────── */}
            <AnimatedCosmicPattern />

            {/* ── COMMAND PALETTE (Cmd+K) ─────────────────────────────────────── */}
            <CommandPalette onNavigate={setTab} onBridgeOpen={() => setBridgeOpen(true)} />

            {/* ── FIRST LAUNCH WELCOME (Modal) ────────────────────────────────── */}
            <WelcomeModal />

            {/* ── IDLE SESSION OVERLAY ────────────────────────────────────────── */}
            <AnimatePresence>
                {isIdle && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(30px)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        className="absolute inset-0 z-[999] flex flex-col items-center justify-center bg-black/40 text-center"
                    >
                        <Lock size={64} className="text-white/80 mb-6" strokeWidth={1} />
                        <h2 className="text-3xl font-black text-white uppercase tracking-[0.2em] mb-4 drop-shadow-2xl">
                            Institutional Session Halted
                        </h2>
                        <p className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-8">
                            Zero-Trust protocol activated due to 10 minutes of inactivity.
                        </p>
                        <button
                            onClick={() => { setIsIdle(false); setLastActivity(Date.now()); }}
                            className="px-8 py-4 rounded-xl bg-white text-black text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl"
                        >
                            <Shield size={14} className="inline-block mr-2" />
                            Unlock Data Feed
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── DASHBOARD UI LAYER ──────────────────────────────────────────── */}
            <div className={`relative z-10 flex w-full h-full overflow-hidden transition-all duration-700 ${isIdle ? 'scale-[0.98] blur-xl opacity-20 pointer-events-none' : ''}`}>

                {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
                <aside className="w-64 shrink-0 flex flex-col border-r border-black/[0.06] bg-white/50 backdrop-blur-xl">

                    {/* Brand Identity */}
                    <div className="px-5 py-6 border-b border-black/[0.06] flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden"
                            style={{ background: '#050505' }}
                        >
                            <div className="w-7 h-7">
                                <WhaleLogo className="w-full h-full" />
                            </div>
                        </div>
                        <div>
                            <span className="text-sm font-black uppercase tracking-tighter block text-black leading-none">
                                Sovereign
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-black/25 block mt-1">
                                Terminal v4.0
                            </span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                        <CategoryHeader label="Terminal" />
                        <NavItem id="nav-explorer"    icon={<Search size={14}/>}          label="Block Explorer"    active={tab==='explorer'}       onClick={() => setTab('explorer')} />
                        <NavItem id="nav-alerts"      icon={<Activity size={14}/>}         label="Live Alerts"       active={tab==='alerts'}         onClick={() => setTab('alerts')} />
                        <NavItem id="nav-live-txs"    icon={<RefreshCw size={14}/>}        label="Live Transactions" active={tab==='live-txs'}       onClick={() => setTab('live-txs')} />

                        <CategoryHeader label="Market Intelligence" />
                        <NavItem id="nav-tracker"     icon={<Globe size={14}/>}            label="Whale Tracker"     active={tab==='tracker'}        onClick={() => setTab('tracker')} />
                        <NavItem id="nav-new-pairs"   icon={<Plus size={14}/>}             label="New Pairs"         active={tab==='new-pairs'}      onClick={() => setTab('new-pairs')} />
                        <NavItem id="nav-gainers"     icon={<TrendingUp size={14}/>}       label="Gainers & Losers"  active={tab==='gainers-losers'} onClick={() => setTab('gainers-losers')} />
                        <NavItem id="nav-topography"  icon={<LayoutDashboard size={14}/>}  label="Visual Graph"      active={tab==='topography'}     onClick={() => setTab('topography')} />
                        <NavItem id="nav-api"         icon={<Terminal size={14}/>}         label="API Access"        active={tab==='api'}            onClick={() => setTab('api')} />

                        <CategoryHeader label="Secure Vault" />
                        <NavItem id="nav-portfolio"   icon={<Wallet size={14}/>}           label="My Portfolio"      active={tab==='portfolio'}      onClick={() => setTab('portfolio')} />
                        <NavItem id="nav-security"    icon={<Shield size={14}/>}           label="Security Center"   active={tab==='security'}       onClick={() => setTab('security')} />

                        <CategoryHeader label="Intelligence" />
                        <NavItem id="nav-akashic"        icon={<Database size={14}/>}         label="Akashic Ledger"      active={tab==='akashic'}        onClick={() => setTab('akashic')} />
                        <NavItem id="nav-mass-transfer"  icon={<AlertTriangle size={14}/>}    label="Mass Transfers"       active={tab==='mass-transfer'}  onClick={() => setTab('mass-transfer')} />

                        <CategoryHeader label="Academy" />
                        <NavItem id="nav-bitcoin"     icon={<Cpu size={14}/>}              label="Bitcoin Network"   active={tab==='bitcoin-net'}    onClick={() => setTab('bitcoin-net')} />
                        <NavItem id="nav-support"     icon={<GraduationCap size={14}/>}    label="Support Center"    active={tab==='support'}        onClick={() => setTab('support')} />
                        <NavItem id="nav-exchange"    icon={<Link2 size={14}/>}            label="Connect Exchange"  active={tab==='exchange'}       onClick={() => setTab('exchange')} />

                        <CategoryHeader label="Membership" />
                        <NavItem
                            id="nav-gold"
                            icon={<Zap size={14} style={{ color: '#D4AF37' }} />}
                            label="Gold Whale Network"
                            active={tab==='gold-whale'}
                            onClick={() => setTab('gold-whale')}
                        />
                    </nav>

                    {/* Bridge button */}
                    <div className="p-4 border-t border-black/[0.06]">
                        <button
                            onClick={() => setBridgeOpen(!bridgeOpen)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group"
                            style={{ background: 'rgba(0,0,0,0.04)' }}
                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.08)'}
                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.04)'}
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest text-black/35">
                                Device Bridge
                            </span>
                            <QrCode size={14} className="text-black/20" />
                        </button>
                    </div>
                </aside>

                {/* ── CONTENT AREA ─────────────────────────────────────────────── */}
                <main className="flex-1 flex flex-col min-w-0 relative bg-transparent">

                    {/* Top bar */}
                    <header
                        className="h-14 shrink-0 border-b border-black/[0.06] px-8 flex items-center justify-between"
                        style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(16px)' }}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em]">
                                Module //
                            </span>
                            <span className="text-[11px] font-black uppercase tracking-tighter text-black">
                                {tab.replace(/-/g, ' ')}
                            </span>
                        </div>
                        <div className="flex items-center gap-5">
                            <div className="hidden md:flex flex-col items-end leading-none">
                                <span className="text-[9px] font-black uppercase tracking-widest text-black/20 mb-0.5">
                                    Operational Status
                                </span>
                                <span
                                    className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
                                    style={{ color: '#00C076' }}
                                >
                                    <Circle size={6} fill="#00C076" strokeWidth={0} />
                                    System Stable
                                </span>
                            </div>
                            <div className="h-7 w-px bg-black/[0.06]" />

                            {/* Notifications & Badge */}
                            <div className="relative flex items-center gap-4">
                                <button 
                                    className="relative text-black/40 hover:text-black transition-colors" 
                                    onClick={() => setShowNotifications(!showNotifications)}
                                >
                                    <Bell size={18} />
                                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#00F2EA]" style={{ boxShadow: '0 0 5px rgba(0, 242, 234, 0.5)' }}></span>
                                </button>
                                
                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-12 right-0 w-80 bg-white border border-black/[0.06] shadow-2xl rounded-2xl overflow-hidden z-50 flex flex-col"
                                        >
                                            <div className="px-5 py-4 border-b border-black/[0.06] flex items-center justify-between">
                                                <h4 className="text-[11px] font-black uppercase tracking-widest text-black">Notifications</h4>
                                                <button onClick={() => setShowNotifications(false)} className="text-black/30 hover:text-black">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                            <div className="max-h-[300px] overflow-y-auto divide-y divide-black/[0.04]">
                                                {notifications.map(notif => (
                                                    <div key={notif.id} className="p-4 hover:bg-black/[0.02] cursor-pointer transition-colors flex gap-3">
                                                        <div className="mt-0.5">
                                                            {notif.type === 'success' && <CheckCircle2 size={14} className="text-[#00C076]" />}
                                                            {notif.type === 'alert' && <AlertCircle size={14} className="text-[#FF3B30]" />}
                                                            {notif.type === 'warning' && <AlertTriangle size={14} className="text-[#D4AF37]" />}
                                                        </div>
                                                        <div>
                                                            <div className="text-[11px] font-black uppercase tracking-tight text-black mb-0.5">{notif.title}</div>
                                                            <div className="text-[10px] text-black/40 leading-tight">{notif.desc}</div>
                                                            <div className="text-[9px] font-black uppercase tracking-widest text-black/20 mt-1">{notif.time}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="px-5 py-3 border-t border-black/[0.06] bg-black/[0.02] cursor-pointer hover:bg-black/[0.04] transition-colors text-center text-[9px] font-black uppercase tracking-widest text-black/40">
                                                Mark all as read
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                
                                {/* Logo badge in header */}
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 relative">
                                        <WhaleLogo className="w-full h-full" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-black/25">
                                        Institutional v4.0
                                    </span>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Tab content */}
                    <div className="flex-1 overflow-hidden relative">
                        <Suspense fallback={<TabLoader />}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={tab}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                    className="absolute inset-0 overflow-y-auto scrollbar-hide"
                                >
                                    {renderTabContent(tab, {
                                        selectedId, setSelectedId,
                                        nodes, setNodes,
                                        selectedNode,
                                        handleNodeUpdate,
                                    })}
                                </motion.div>
                            </AnimatePresence>
                        </Suspense>
                    </div>
                </main>
            </div>

            {/* ── BRIDGE DRAWER ────────────────────────────────────────────────── */}
            <AnimatePresence>
                {bridgeOpen && (
                    <motion.aside
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                        className="absolute right-0 top-0 h-full w-80 border-l border-black/[0.06] z-50 flex flex-col"
                        style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(40px)' }}
                    >
                        <div className="p-6 border-b border-black/[0.06] flex items-center justify-between">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-black">
                                Physical Bridge
                            </div>
                            <button
                                onClick={() => setBridgeOpen(false)}
                                className="p-2 rounded-xl transition-all"
                                style={{ background: 'transparent' }}
                                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.05)'}
                                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                            >
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
// Tab Router
// ─────────────────────────────────────────
function renderTabContent(tab: DashboardTab, props: any) {
    switch (tab) {
        case 'explorer':       return <OmniExplorer />;
        case 'alerts':         return <ActivityTab />;
        case 'live-txs':       return <LiveTransactions />;
        case 'tracker':        return <SovereignIntelTab />;
        case 'new-pairs':      return <NewPairsTable />;
        case 'gainers-losers': return <GainersLosersPanel />;
        case 'topography':     return <VisualTopography />;
        case 'api':            return <ApiTerminal />;
        case 'portfolio':      return <PortfolioDashboard />;
        case 'security':       return <SecurityScanner />;
        case 'akashic':        return <AkashicLedger />;
        case 'mass-transfer':  return <MassTransferIntel />;
        case 'bitcoin-net':    return <BitcoinPrimitives />;
        case 'support':        return <WhaleSupport />;
        case 'exchange':       return <ConnectExchange />;
        case 'gold-whale':     return <GoldTicketPanel />;
        default:
            return (
                <div className="p-12 text-center text-black/20 uppercase font-black text-[10px] tracking-widest">
                    Component Protocol Not Found
                </div>
            );
    }
}

// ─────────────────────────────────────────
// Activity Tab — Event Telemetry Log
// ─────────────────────────────────────────
function ActivityTab() {
    const { logs } = useDashboardStore();
    return (
        <div className="p-8 h-full font-mono">
            <div className="mb-8">
                <h2 className="text-xl font-black text-black uppercase tracking-tighter">Event Telemetry</h2>
                <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest mt-1">
                    Live infrastructure audit log
                </p>
            </div>
            <div className="space-y-3">
                {logs.map(log => (
                    <div
                        key={log.id}
                        className="flex gap-4 p-4 rounded-2xl transition-all"
                        style={{
                            background: '#fff',
                            border: '1px solid rgba(0,0,0,0.04)',
                        }}
                    >
                        <span className="text-[10px] font-bold text-black/20 shrink-0 w-20">{log.time}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border shrink-0 ${
                            log.type === 'success' ? 'bg-[#00C076]/10 text-[#00C076] border-[#00C076]/20' :
                            log.type === 'error'   ? 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20' :
                            'bg-black/5 text-black/40 border-black/10'
                        }`}>
                            {log.type}
                        </span>
                        <span className="text-[11px] font-bold text-black/70 leading-relaxed">{log.msg}</span>
                    </div>
                ))}
                {logs.length === 0 && (
                    <div
                        className="py-24 text-center rounded-[2.5rem]"
                        style={{ border: '2px dashed rgba(0,0,0,0.05)' }}
                    >
                        <p className="text-[11px] font-black text-black/10 uppercase tracking-[0.4em]">
                            No Telemetry Recorded
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────
// Stub components
// ─────────────────────────────────────────
function LiveTransactions() {
    return (
        <div className="p-8 h-full flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 opacity-10">
                    <WhaleLogo className="w-full h-full" />
                </div>
                <p className="text-[11px] font-black text-black/15 uppercase tracking-[0.4em]">
                    Live Transactions Feed
                </p>
                <p className="text-[9px] font-bold text-black/10 uppercase tracking-widest mt-2">
                    Module initializing...
                </p>
            </div>
        </div>
    );
}

function VisualTopography() {
    return (
        <div className="p-8 h-full flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 opacity-10">
                    <WhaleLogo className="w-full h-full" />
                </div>
                <p className="text-[11px] font-black text-black/15 uppercase tracking-[0.4em]">
                    Visual Topography Graph
                </p>
                <p className="text-[9px] font-bold text-black/10 uppercase tracking-widest mt-2">
                    Module initializing...
                </p>
            </div>
        </div>
    );
}
