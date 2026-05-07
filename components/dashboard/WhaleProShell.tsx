"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Wallet, Settings,
    ChevronLeft, ChevronRight, Search,
    Globe, Cpu, Shield,
    Network, Ticket, Flame, Menu,
    BookOpen, Database, MessageSquare,
    Landmark, Compass,
    LineChart, Lock, Book, Info, X, ArrowUpRight, CreditCard
} from 'lucide-react';
import { MODULE_EXPLANATIONS } from './ModuleExplanations';
import { useSettingsStore } from '@/lib/store/useSettingsStore';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useMarketStream } from '@/context/MarketStreamContext';
import { GlobalCommandPalette } from '@/components/ui/GlobalCommandPalette';
import { InstitutionalErrorBoundary } from '@/components/ui/InstitutionalErrorBoundary';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { toast } from 'sonner';
import { useDisconnect } from 'wagmi';

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
    dividerBefore?: string;
    externalUrl?: string;
}

const SIDEBAR_ITEMS: NavItem[] = [
    { id: 'gold',          label: 'Ticket Mint',       icon: <Ticket size={17}/>,    dividerBefore: 'Overview' },
    { id: 'portfolio',     label: 'Main Portfolio',    icon: <Wallet size={17}/> },
    { id: 'billing',       label: 'Billing & Plan',    icon: <CreditCard size={17}/> },

    { id: 'market-data',  label: 'Market Data',       icon: <Globe size={17}/>,     dividerBefore: 'Intelligence' },
    { id: 'markets',      label: 'Top Markets',       icon: <LayoutDashboard size={17}/> },
    { id: 'newpairs',     label: 'New Listings',      icon: <Search size={17}/> },
    { id: 'graph',        label: 'Entity Graph',      icon: <Compass size={17}/> },

    { id: 'inst-ledger',  label: 'Whale Ledger',      icon: <Book size={17}/>,      dividerBefore: 'On-Chain Intel' },
    { id: 'mass-transfer',label: 'Mass Transfers',    icon: <Network size={17}/> },
    { id: 'omniexplorer', label: 'Block Explorer',    icon: <Search size={17}/> },
    { id: 'defi',         label: 'DeFi Yields',       icon: <Landmark size={17}/> },

    { id: 'zk',           label: 'Aztec Pipeline',    icon: <Shield size={17}/>,   dividerBefore: 'ZK Layer' },

    { id: 'vault',        label: 'Sovereign Vault',   icon: <Lock size={17}/>,      dividerBefore: 'Execution' },
    { id: 'logs',         label: 'Session Logs',      icon: <Database size={17}/>,  dividerBefore: 'System' },
    { id: 'support',      label: 'Support',           icon: <MessageSquare size={17}/> },
];

const RESTRICTED_TABS = [
    'firehose', 'sov-intel', 'inst-ledger', 'mass-transfer', 'graph', 'defi', 'polymarket', 'forge',
    'portfolio', 'live-port', 'whale-port', 'vault', 'zk', 'logs'
];

function PriceFlash({ value, children }: { value: string | number; children: React.ReactNode }) {
    const [flash, setFlash] = useState<'up' | 'down' | null>(null);
    const prevValue = React.useRef(value);

    React.useEffect(() => {
        if (value !== prevValue.current) {
            const v = parseFloat(String(value).replace(/[^0-9.-]+/g, ""));
            const p = parseFloat(String(prevValue.current).replace(/[^0-9.-]+/g, ""));
            if (!isNaN(v) && !isNaN(p)) {
                setFlash(v > p ? 'up' : 'down');
                const timer = setTimeout(() => setFlash(null), 600);
                prevValue.current = value;
                return () => clearTimeout(timer);
            }
            prevValue.current = value;
        }
    }, [value]);

    return (
        <div className="relative">
            <AnimatePresence>
                {flash && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 0.15, scale: 1.05 }}
                        exit={{ opacity: 0 }}
                        className={`absolute inset-0 -m-1 rounded-sm blur-md ${flash === 'up' ? 'bg-[#00FF55]' : 'bg-[#FF3B30]'}`}
                    />
                )}
            </AnimatePresence>
            <div className="relative z-10 transition-colors duration-300">
                {children}
            </div>
        </div>
    );
}



// Convert autoDisconnectTimer setting string to milliseconds
function timerToMs(t: '15m' | '1h' | '24h' | 'never'): number | null {
    if (t === '15m')   return 15  * 60 * 1000;
    if (t === '1h')    return 60  * 60 * 1000;
    if (t === '24h')   return 24  * 60 * 60 * 1000;
    return null; // 'never'
}

function AztecSidebarItem({ item, isActive, isCollapsed, onClick }: { item: NavItem, isActive: boolean, isCollapsed: boolean, onClick: () => void }) {
    const itemRef = useRef<HTMLButtonElement>(null);
    const [mouse, setMouse] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!itemRef.current) return;
        const rect = itemRef.current.getBoundingClientRect();
        setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    // Aztec Network Magnetic 3D transform calculations
    const rotateX = isHovered ? (mouse.y - 24) / -6 : 0;
    const rotateY = isHovered ? (mouse.x - 100) / 15 : 0;

    return (
        <motion.button
            ref={itemRef}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={false}
            animate={{
                rotateX,
                rotateY,
                z: isHovered ? 20 : isActive ? 8 : 0,
                scale: isHovered ? 1.03 : isActive ? 1.01 : 1,
            }}
            transition={{ type: "spring", stiffness: 450, damping: 20, mass: 0.8 }}
            style={{ transformStyle: "preserve-3d" }}
            className={`relative w-full flex items-center justify-between py-2.5 px-3 rounded-xl group select-none outline-none ${
                isActive 
                    ? 'bg-[#050505] shadow-[0_12px_40px_rgba(0,0,0,0.25)] border border-[#1A1A1A]' 
                    : 'bg-transparent border border-transparent hover:bg-black/[0.03]'
            }`}
        >
            {/* Dynamic Volumetric Lighting Layer */}
            {isHovered && !isActive && (
                <div 
                    className="absolute inset-0 rounded-xl pointer-events-none opacity-50 transition-opacity duration-300"
                    style={{ background: `radial-gradient(circle 50px at ${mouse.x}px ${mouse.y}px, rgba(0,0,0,0.06), transparent 100%)` }}
                />
            )}
            
            {/* Aztec Emerald Glow for Active Item */}
            {isActive && (
                <div 
                    className="absolute inset-0 rounded-xl pointer-events-none opacity-40 transition-opacity duration-300"
                    style={{
                        background: isHovered ? `radial-gradient(circle 90px at ${mouse.x}px ${mouse.y}px, #00C076, transparent 100%)` : 'none',
                        mixBlendMode: 'screen'
                    }}
                />
            )}

            {/* Front Extrusion Layer */}
            <motion.div 
                className="relative flex items-center w-full"
                animate={{ z: isHovered ? 12 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* Active Neon Indicator */}
                <AnimatePresence>
                    {isActive && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 18 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="absolute left-[-13px] top-1/2 -translate-y-1/2 w-[3px] bg-[#00C076] rounded-r-full shadow-[0_0_12px_#00C076]"
                        />
                    )}
                </AnimatePresence>

                <span className={`shrink-0 transition-colors duration-300 ${isActive ? 'text-[#00C076] drop-shadow-[0_0_5px_rgba(0,192,118,0.5)]' : 'text-[#888888] group-hover:text-[#050505]'}`}>
                    {item.icon}
                </span>

                {!isCollapsed && (
                    <span className={`ml-3 text-[11px] font-black uppercase tracking-widest flex-1 text-left leading-none truncate transition-colors duration-300 ${isActive ? 'text-[#FAF9F6]' : 'text-[#555555] group-hover:text-[#050505]'}`}>
                        {item.label}
                    </span>
                )}

                {!isCollapsed && item.badge && (
                    <span className={`ml-2 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-[4px] border shrink-0 transition-colors ${isActive ? 'bg-[#00C076]/20 text-[#00C076] border-[#00C076]/30 shadow-[0_0_10px_rgba(0,192,118,0.2)]' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                        {item.badge}
                    </span>
                )}
                {!isCollapsed && item.externalUrl && (
                    <ArrowUpRight size={12} className={`ml-2 transition-colors ${isActive ? 'text-[#00C076]' : 'text-[#A0A0A0] group-hover:text-[#050505]'}`} />
                )}
            </motion.div>
        </motion.button>
    );
}

export function WhaleProShell({ 
    children, 
    activeTab, 
    onTabChange,
    isExternalEmbed = false,
}: { 
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (id: string) => void;
    isExternalEmbed?: boolean;
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isPaletteOpen, setIsPaletteOpen] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [isSessionLocked, setIsSessionLocked] = useState(false);
    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── True Desktop Detection ────────────────────────────────────────────────
    // Uses hardware screen.width (not viewport) so narrowing the browser window
    // on a PC does NOT trigger the mobile nav. Only real mobile devices (screen
    // width < 1024px on physical hardware) see the bottom navigation bar.
    const [isTrueDesktop, setIsTrueDesktop] = useState(true);
    useEffect(() => {
        const check = () => setIsTrueDesktop(window.screen.width >= 1024);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const { setSettingsOpen, autoDisconnectTimer, stealthMode } = useSettingsStore();
    const router = useRouter();
    const { disconnect } = useDisconnect();

    const currentExplanation = MODULE_EXPLANATIONS[activeTab] || {
        title: 'MODULE IN DEVELOPMENT',
        subtitle: 'BETA RELEASE',
        overview: 'This module is under active deployment. Full telemetry and analytical functions will be detailed once production-grade stability is achieved.',
        features: []
    };

    const { latency, isConnected: streamConnected, mode } = useMarketStream();
    const { connector, isConnected: isWalletConnected, isSovereignHandshake } = useSovereignAccount();

    // ── Inactivity Session Lock — driven by autoDisconnectTimer from settings ──
    useEffect(() => {
        const ms = timerToMs(autoDisconnectTimer);
        if (!ms) return; // 'never' — no timer

        const reset = () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            idleTimerRef.current = setTimeout(() => {
                setIsSessionLocked(true);
            }, ms);
        };

        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
        events.forEach(e => window.addEventListener(e, reset, { passive: true }));
        reset(); // start timer

        return () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            events.forEach(e => window.removeEventListener(e, reset));
        };
    }, [autoDisconnectTimer]);

    const unlockSession = async () => {
        try {
            // Re-verify session cryptographically with the server before unlocking UI
            const res = await fetch('/api/auth/session', { cache: 'no-store' });
            if (!res.ok) throw new Error('Session Expired');
            const data = await res.json();
            if (!data?.user?.userId) throw new Error('No valid session');
            
            setIsSessionLocked(false);
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        } catch (e) {
            toast.error("Session Expired", { description: "Your cryptographic lease has timed out." });
            disconnect();
            router.push('/connect');
        }
    };

    const handleTabChange = (id: string) => {
        const item = SIDEBAR_ITEMS.find(i => i.id === id);
        if (item?.externalUrl) {
            window.open(item.externalUrl, '_blank', 'noopener,noreferrer');
            return;
        }

        if (id === 'developer') {
            window.location.href = '/developers';
            return;
        }

        if (RESTRICTED_TABS.includes(id)) {
            if (!isWalletConnected) {
                toast.error("Connection Required", {
                    description: "You must connect a wallet to access execution and forensic layers.",
                    duration: 4000
                });
                router.push('/connect');
                return;
            }
        }
        onTabChange(id);
    };

    // Active clearance ejection monitor
    useEffect(() => {
        if (RESTRICTED_TABS.includes(activeTab)) {
            if (!isWalletConnected) {
                onTabChange('market-data');
                toast.error("Session Lost", { description: "You have been disconnected." });
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isWalletConnected, activeTab]);



    return (
        <>
        <GlobalCommandPalette
            isOpen={isPaletteOpen}
            setIsOpen={setIsPaletteOpen}
            onTabChange={onTabChange}
        />

        {/* ─── Session Lock Overlay ─── */}
        <AnimatePresence>
            {isSessionLocked && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center text-center"
                    style={{ background: 'rgba(250,249,246,0.97)', backdropFilter: 'blur(24px)' }}
                >
                    <Lock size={48} className="mb-6 text-black/20" strokeWidth={1} />
                    <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-[#050505] mb-2">Session Locked</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-8">
                        Auto-lock after {autoDisconnectTimer} of inactivity
                    </p>
                    <button
                        onClick={unlockSession}
                        className="px-8 py-3.5 bg-[#050505] text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-black/80 transition-all active:scale-[0.98]"
                    >
                        <Shield size={13} className="inline mr-2 mb-0.5" />
                        Resume Session
                    </button>
                </motion.div>
            )}
        </AnimatePresence>

        <div className={`flex fixed inset-0 bg-[#FAF9F6] text-[#050505] font-sans selection:bg-[#00FF55]/20 group/shell overflow-hidden transition-all duration-300 ${isSessionLocked ? 'scale-[0.99] pointer-events-none' : ''}`}>

            
            {/* ─── Persistent Pro Sidebar (True Desktop Only) ─── */}
            {/* isTrueDesktop uses screen.width (hardware), not viewport, so     */}
            {/* narrowing the browser window on a PC keeps the sidebar visible.  */}
            <motion.aside 
                animate={{ width: isCollapsed ? 64 : 240 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={`${isTrueDesktop ? 'flex' : 'hidden'} sticky top-0 h-full border-r border-[#E5E5E5] bg-[#FAF9F6] flex-col z-50 shrink-0`}
            >
                {/* Logo area */}
                {!isCollapsed && (
                    <div className="px-4 pt-4 pb-2 shrink-0">
                        <div className="flex items-center gap-2.5 px-3 py-2">
                            <img src="/official-whale-monochrome.png" className="w-6 h-6 shrink-0" alt="WAN" />
                            <div className="flex flex-col leading-tight">
                                <span className="text-[11px] font-black uppercase tracking-tighter text-[#050505]">Whale Alert</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#050505]/30">Network</span>
                            </div>
                        </div>
                    </div>
                )}
                {isCollapsed && <div className="pt-4 pb-2 shrink-0 flex justify-center">
                    <img src="/official-whale-monochrome.png" className="w-6 h-6" alt="WAN" />
                </div>}

                {/* Sidebar Navigation */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain pt-1 pb-4 px-2 space-y-0.5 no-scrollbar" style={{ overscrollBehavior: 'contain', touchAction: 'pan-y', contain: 'strict' }}>
                    {SIDEBAR_ITEMS.map((item, index) => {
                        const isActive = activeTab === item.id;
                        return (
                            <div key={item.id} style={{ perspective: 1200 }}>
                                {item.dividerBefore && !isCollapsed && (
                                    <div className={`px-3 ${index === 0 ? 'pt-1' : 'pt-5'} pb-2`}>
                                        <span className="text-[9px] font-black text-[#A0A0A0] uppercase tracking-[0.25em]">
                                            {item.dividerBefore}
                                        </span>
                                    </div>
                                )}
                                {item.dividerBefore && isCollapsed && (
                                    <div className="my-3 mx-3 h-px bg-black/10"/>
                                )}
                                <AztecSidebarItem item={item} isActive={isActive} isCollapsed={isCollapsed} onClick={() => handleTabChange(item.id)} />
                            </div>
                        );
                    })}

                    {!isCollapsed && (
                        <div className="px-4 py-6 mt-4">
                            <div className="w-full h-px bg-black/10 mb-4" />
                            <p className="text-[9px] font-serif leading-relaxed text-[#888] text-justify opacity-80">
                                Foundational document on pure mathematical abstraction, zero-knowledge cryptographic mechanisms, and deterministic heuristic paradigms that cement the immutable global infrastructure.
                            </p>
                        </div>
                    )}
                </div>

                <div className="px-2 pb-3 pt-1 shrink-0">
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-full flex items-center justify-center p-2 rounded-xl border border-black/10 text-[#888888] hover:text-black hover:bg-black/5 transition-all"
                    >
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                </div>
            </motion.aside>

            {/* ─── Main Content Wrapper ─── */}
            <div className="flex-1 flex flex-col min-w-0 relative h-full">
                
                {/* ─── Top Master Bar ─── */}
                <header className="sticky top-0 h-[56px] border-b border-black/[0.06] bg-white/70 backdrop-blur-2xl flex items-center justify-between px-6 z-40 shrink-0 shadow-[0_4px_30px_rgba(0,0,0,0.02)] transition-colors duration-300">
                    <button
                        onClick={() => setIsPaletteOpen(true)}
                        className="group flex items-center gap-2.5 h-8 px-3 rounded-full border border-black/[0.08] bg-white hover:bg-black/[0.02] hover:border-black/20 hover:shadow-sm transition-all duration-200 cursor-pointer shrink-0"
                    >
                        <Search size={12} className="text-[#AAAAAA] group-hover:text-[#555] transition-colors shrink-0" />
                        <span className="text-[10px] text-[#AAAAAA] group-hover:text-[#555] font-medium transition-colors hidden sm:block pr-1">Search</span>
                        <span className="hidden sm:flex items-center gap-1 ml-0.5">
                            <kbd className="text-[9px] font-black font-mono text-[#AAAAAA] bg-black/[0.04] border border-black/[0.08] rounded px-1.5 py-0.5 leading-none">⌘K</kbd>
                        </span>
                    </button>

                    <div className="hidden lg:flex items-center gap-0 divide-x divide-black/10 flex-1 mx-6 overflow-hidden">
                        {/* Removed LiveMarketBand */}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowInfoModal(true)}
                            title="Module Information"
                            className="shrink-0 p-2.5 rounded-full border border-black/10 hover:bg-black/5 hover:scale-105 hover:shadow-sm text-[#888888] hover:text-[#050505] transition-all flex items-center justify-center w-10 h-10"
                        >
                            <Info size={18} />
                        </button>
                        <button
                            onClick={() => setSettingsOpen(true)}
                            title="Open Settings"
                            className="shrink-0 p-2.5 rounded-full border border-black/10 hover:bg-black/5 hover:scale-105 hover:shadow-sm text-[#888888] hover:text-[#050505] transition-all flex items-center justify-center w-10 h-10"
                        >
                            <Settings size={18} />
                        </button>
                    </div>
                </header>

                <main className="flex-1 flex flex-col min-h-0 transition-colors duration-300 bg-[#EFEFEF] relative">
                    {/* Background gradient — does NOT create a scroll stacking ctx */}
                    <div className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(250,249,246,0.5)_0%,transparent_80%)]" />

                    {/* Scroll container: flex-1 + min-h-0 = bounded by parent, never bleeds to document */}
                    <div
                        id="main-scroll-container"
                        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col no-scrollbar"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            overscrollBehavior: 'contain',
                            touchAction: 'pan-y',
                        }}
                    >
                        {/* pb-20 on mobile = clears the 64px bottom nav + safe area */}
                        <div className="p-4 md:p-5 pb-20 md:pb-5 w-full flex-1 flex flex-col relative z-10">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                    className="w-full flex-1 flex flex-col"
                                >
                                    <InstitutionalErrorBoundary moduleName="Processing Execution Node">
                                        {children}
                                    </InstitutionalErrorBoundary>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </main>

                {/* ─── Bottom Tab Navigation (Mobile Only) ─── */}
                {/* Only renders on real mobile hardware (screen.width < 1024).  */}
                {/* Narrowing a PC browser window will NOT show this nav bar.    */}
                <nav className={`${isTrueDesktop ? 'hidden' : 'flex'} h-16 border-t border-black/10 bg-white items-center justify-around px-2 shrink-0 z-50`} style={{ minHeight: '64px', maxHeight: '64px' }}>
                    {[
                        { id: 'market-data', icon: <Globe size={20} />, label: 'Markets' },
                        { id: 'markets',     icon: <LayoutDashboard size={20} />, label: 'Top' },
                        { id: 'portfolio',   icon: <Wallet size={20} />, label: 'Portfolio' },
                        { id: 'menu',        icon: <Menu size={20} />, label: 'Menu' },
                    ].map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => tab.id === 'menu' ? setIsPaletteOpen(true) : handleTabChange(tab.id)}
                                style={{ minHeight: 0, minWidth: 0 }}
                                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                                    isActive ? 'text-black' : 'text-[#888888] hover:text-black'
                                }`}
                            >
                                {tab.icon}
                                <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-60'}`}>{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* ─── Status Bar ─── */}
                <footer className="hidden md:flex h-7 border-t border-black/10 bg-white items-center justify-between px-6 shrink-0 transition-colors duration-300">
                    <div className="flex items-center gap-4 text-[9px] font-black text-[#888888] uppercase tracking-widest">
                    <span className="flex items-center gap-1.5 min-w-[120px]">
                            <Globe size={11} /> Global Latency: 
                            <span className={latency > 150 ? 'text-[#FF3B30]' : latency > 0 ? 'text-[#00FF55]' : 'text-[#888888]'}>
                                {latency > 0 ? `${latency}ms` : 'SYNCING'}
                            </span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Cpu size={11} /> Nodes: 
                            <span className="text-[#00FF55]">
                                OPERATIONAL
                            </span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-[9px] font-black text-[#888888] uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Shield size={11} /> Protocol: Live</span>
                        <span className="text-[#888888]">© 2026 WHALECOSYSTEM CORP.</span>
                    </div>
                </footer>
            </div>
        </div>

        {/* INFO MODAL ENHANCED MULTIDIMENSIONAL */}
        <AnimatePresence>
        {showInfoModal && (
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/40 backdrop-blur-md flex items-center justify-center p-5"
            >
            <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                className="w-full max-w-3xl bg-[#FAF9F6] rounded-[24px] shadow-2xl overflow-hidden flex flex-col border border-black/10"
            >
                <div className="flex items-center justify-between px-8 py-6 border-b border-black/10 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black text-[#FAF9F6] flex items-center justify-center">
                            <Info size={18} />
                        </div>
                        <div>
                            <h3 className="text-[15px] font-black uppercase tracking-widest text-[#050505] leading-none mb-1">{currentExplanation.title}</h3>
                            <p className="text-[9px] font-black text-black/40 uppercase tracking-[0.2em]">{currentExplanation.subtitle}</p>
                        </div>
                    </div>
                    <button onClick={() => setShowInfoModal(false)} className="p-2.5 bg-black/5 hover:bg-black/10 rounded-full transition-colors text-black/40 hover:text-black">
                        <X size={18} />
                    </button>
                </div>
                
                <div className="px-8 py-8 flex flex-col gap-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
                    <div className="bg-white p-6 border border-black/10 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 rounded-bl-full -z-0 pointer-events-none" />
                        <p className="text-[13px] text-[#050505] leading-relaxed font-medium relative z-10 text-justify">
                            {currentExplanation.overview}
                        </p>
                    </div>

                    {currentExplanation.features.length > 0 && (
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-4 px-1">Technical Capabilities & Implementation</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {currentExplanation.features.map((feat, idx) => (
                                    <div key={idx} className="bg-white border border-black/10 rounded-xl p-4 flex flex-col gap-2 hover:border-black/30 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full bg-black/5 flex justify-center items-center shrink-0">
                                                <div className="w-1.5 h-1.5 rounded-full bg-black" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-black flex-1 line-clamp-1">{feat.title}</span>
                                        </div>
                                        <p className="text-[11px] text-black/60 leading-relaxed font-mono">
                                            {feat.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="p-6 border-t border-black/10 bg-white flex justify-end">
                    <button onClick={() => setShowInfoModal(false)} className="px-8 py-3.5 rounded-xl border border-black/10 bg-white text-[#050505] text-[11px] font-black uppercase tracking-widest hover:bg-black/5 hover:border-black/30 transition-all shadow-none active:scale-[0.98] duration-200">
                        Return to Terminal
                    </button>
                </div>
            </motion.div>
            </motion.div>
        )}
        </AnimatePresence>
        </>
    );
}
