"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    TrendingUp, Wallet, Settings,
    ChevronLeft, ChevronRight, Search,
    Globe, Cpu, Shield, ShieldAlert, Newspaper,
    Star, Rocket, Network, Ticket, Zap, Menu,
    BookOpen, Database, HeadphonesIcon, BarChart3,
    Landmark, Layers, FlaskConical, Compass,
    Activity, Lock, Book
} from 'lucide-react';
import { useSettingsStore } from '@/lib/store/settings-store';
import { useUIStore } from '@/lib/store/ui-store';
import { useEffect } from 'react';
import { useMarketStream } from '@/context/MarketStreamContext';
import { GlobalCommandPalette } from '@/components/ui/GlobalCommandPalette';
import { InstitutionalErrorBoundary } from '@/components/ui/InstitutionalErrorBoundary';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { toast } from 'sonner';

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
    dividerBefore?: string;
}

const SIDEBAR_ITEMS: NavItem[] = [
    // ── Command ──
    { id: 'dashboard',           label: 'Dashboard',          icon: <LayoutDashboard size={17}/>,  dividerBefore: 'Overview' },
    { id: 'news',                label: 'Whale News',         icon: <Newspaper size={17}/> },
    { id: 'watchlist',           label: 'Watchlist',          icon: <Star size={17}/> },
    { id: 'gold-ticket',         label: 'Ticket Mint',        icon: <Ticket size={17}/> },

    // ── Markets ──
    { id: 'whale-events',        label: 'Whale Tracker',      icon: <Globe size={17}/>,            dividerBefore: 'Markets' },
    { id: 'gainers',             label: 'Gainers / Losers',   icon: <TrendingUp size={17}/> },
    { id: 'new-pairs',           label: 'New Tokens',         icon: <Rocket size={17}/> },
    { id: 'omni-explorer',       label: 'Block Explorer',     icon: <Compass size={17}/> },
    { id: 'brc-explorer',        label: 'BRC-20',             icon: <Layers size={17}/> },

    // ── Intelligence ──
    { id: 'neural-graph',        label: 'Entity Map',         icon: <Network size={17}/>,          dividerBefore: 'Intelligence' },
    { id: 'sovereign-intel',     label: 'Smart Signals',      icon: <Zap size={17}/> },
    { id: 'institutional-ledger',label: 'Event Ledger',       icon: <Landmark size={17}/>,         badge: 'NEW' },
    { id: 'mass-transfer',       label: 'Mass Transfers',     icon: <Activity size={17}/> },
    { id: 'defi-yield',          label: 'DeFi Yield',         icon: <FlaskConical size={17}/> },
    { id: 'polymarket',          label: 'Predictions',        icon: <BarChart3 size={17}/> },

    // ── Wallet & Vault ──
    { id: 'portfolio',           label: 'My Wallet',          icon: <Wallet size={17}/>,           dividerBefore: 'Wallet' },
    { id: 'sovereign-vault',     label: 'Cold Storage',       icon: <Lock size={17}/> },
    { id: 'zk-shield',           label: 'ZK Privacy',         icon: <ShieldAlert size={17}/> },
    { id: 'whale-portfolio',     label: 'Whale Wallets',      icon: <Database size={17}/> },
    { id: 'humanidfi-portfolio', label: 'HumanID Wallet',     icon: <Shield size={17}/> },

    // ── Learn & Support ──
    { id: 'academy',             label: 'Academy',            icon: <Book size={17}/>,             dividerBefore: 'Resources' },
    { id: 'support',             label: 'Support',            icon: <HeadphonesIcon size={17}/> },
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

function LiveMarketBand() {
    const { markets, isConnected: streamConnected, mode } = useMarketStream();

    const btc = markets.get('BTCUSDT');
    const eth = markets.get('ETHUSDT');

    interface StatItem { label: string; value: string; chg: string | null; up: boolean; rawValue: number; }

    const items: StatItem[] = [];

    if (btc) {
        const chgPct = parseFloat(btc.priceChangePercent || '0');
        items.push({
            label: 'BTC',
            value: '$' + parseInt(btc.lastPrice || '0').toLocaleString(),
            chg: (chgPct >= 0 ? '+' : '') + chgPct.toFixed(1) + '%',
            up: chgPct >= 0,
            rawValue: parseFloat(btc.lastPrice || '0'),
        });
    }
    if (eth) {
        const chgPct = parseFloat(eth.priceChangePercent || '0');
        items.push({
            label: 'ETH',
            value: '$' + parseInt(eth.lastPrice || '0').toLocaleString(),
            chg: (chgPct >= 0 ? '+' : '') + chgPct.toFixed(1) + '%',
            up: chgPct >= 0,
            rawValue: parseFloat(eth.lastPrice || '0'),
        });
    }

    if (items.length === 0) {
        return (
            <>
                {['BTC', 'ETH'].map(label => (
                    <div key={label} className="flex flex-col px-3 py-1 min-w-0 shrink-0">
                        <span className="text-[7.5px] font-black text-[#888888] uppercase tracking-[0.15em] leading-none mb-0.5">{label}</span>
                        <div className="h-3 w-14 bg-white/10 rounded animate-pulse" />
                    </div>
                ))}
            </>
        );
    }

    return (
        <>
            {items.map((item, i) => (
                <div key={i} className="flex flex-col px-3 py-1 min-w-0 shrink-0">
                    <span className="text-[7.5px] font-black text-[#888888] uppercase tracking-[0.15em] leading-none mb-0.5">{item.label}</span>
                    <PriceFlash value={item.rawValue}>
                        <div className="flex items-baseline gap-1">
                            <span className="text-[10px] font-black font-mono text-white truncate">{item.value}</span>
                            {item.chg && (
                                <span className={`text-[8px] font-black leading-none ${item.up ? 'text-[#00FF55]' : 'text-[#FF3B30]'}`}>
                                    {item.chg}
                                </span>
                            )}
                        </div>
                    </PriceFlash>
                </div>
            ))}
            <div className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border ml-4 ${mode === 'live' ? 'bg-[#00FF55]/10 border-[#00FF55]/30 text-[#00FF55]' : 'bg-[#FF9500]/10 border-[#FF9500]/30 text-[#FF9500]'}`}>
                {mode} mode
            </div>
        </>
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
    const [searchQuery, setSearchQuery] = useState('');
    const [isPaletteOpen, setIsPaletteOpen] = useState(false);
    const { setSettingsOpen } = useSettingsStore();
    const { openConnectModal } = useUIStore();

    const { latency, isConnected: streamConnected, mode } = useMarketStream();
    const { connector, isConnected: isWalletConnected, isSovereignHandshake } = useSovereignAccount();

    const handleTabChange = (id: string) => {
        const restrictedTabs = ['gold-ticket', 'institutional-ledger', 'sovereign-vault'];
        
        if (restrictedTabs.includes(id)) {
            if (!isWalletConnected) {
                toast.error("Sovereign Connection Required", {
                    description: "You must link a Web3 wallet or authenticate to access restricted modules.",
                    duration: 4000
                });
                openConnectModal();
                return;
            } else if (
                (connector?.id && (connector.id === 'auth' || connector.id.toLowerCase().includes('google') || connector.id === 'w3mAuth')) ||
                (isSovereignHandshake && ['gold-ticket', 'sovereign-vault'].includes(id))
            ) {
                toast.error("Execution Clearance Required", {
                    description: "This module requires active EVM signing capabilities. Disconnect your remote session and use a native wallet.",
                    duration: 6000
                });
                return;
            }
        }
        onTabChange(id);
    };

    // Active clearance ejection monitor
    useEffect(() => {
        const restrictedTabs = ['gold-ticket', 'institutional-ledger', 'sovereign-vault'];
        if (restrictedTabs.includes(activeTab)) {
            if (!isWalletConnected) {
                onTabChange('dashboard');
                toast.error("Session Lost", { description: "You have been ejected from the secure perimeter." });
            } else if (
                (connector?.id && (connector.id === 'auth' || connector.id.toLowerCase().includes('google') || connector.id === 'w3mAuth')) ||
                (isSovereignHandshake && ['gold-ticket', 'sovereign-vault'].includes(activeTab))
            ) {
                onTabChange('dashboard');
                toast.error("Clearance Revoked", { description: "Remote/Google Sessions cannot reside in execution perimeters." });
            }
        }
    }, [isWalletConnected, connector?.id, activeTab, onTabChange]);

    return (
        <>
        <GlobalCommandPalette
            isOpen={isPaletteOpen}
            setIsOpen={setIsPaletteOpen}
            onTabChange={onTabChange}
        />
        <div className="flex fixed inset-0 bg-[#FAF9F6] text-[#050505] font-sans selection:bg-[#00FF55]/20 group/shell overflow-hidden">
            
            {/* ─── Persistent Pro Sidebar (Desktop Only) ─── */}
            <motion.aside 
                animate={{ width: isCollapsed ? 64 : 240 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="hidden md:flex sticky top-0 h-full border-r border-[#E5E5E5] bg-[#FAF9F6] flex-col z-50 shrink-0"
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
                <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain pt-1 pb-4 px-2 space-y-0.5 no-scrollbar" style={{ contain: 'strict', willChange: 'scroll-position' }}>
                    {SIDEBAR_ITEMS.map((item, index) => {
                        const isActive = activeTab === item.id;
                        return (
                            <div key={item.id}>
                                {item.dividerBefore && !isCollapsed && (
                                    <div className={`px-3 ${index === 0 ? 'pt-1' : 'pt-4'} pb-1`}>
                                        <span className="text-[8px] font-black text-[#CCCCCC] uppercase tracking-[0.2em]">
                                            {item.dividerBefore}
                                        </span>
                                    </div>
                                )}
                                {item.dividerBefore && isCollapsed && (
                                    <div className="my-2 mx-3 h-px bg-black/10"/>
                                )}
                                <button
                                    key={item.id}
                                    onClick={() => handleTabChange(item.id)}
                                    className={`relative w-full flex items-center justify-between py-2 px-3 rounded-lg group transition-all duration-200 ${
                                        isActive
                                                ? 'bg-black/5 text-black shadow-none border border-black/10'
                                                : 'text-[#888888] hover:text-black hover:bg-black/[0.04]'
                                        }
                                    `}
                                >
                                    {/* ── Static in-place active indicator — NO layoutId ── */}
                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.div
                                                key="indicator"
                                                initial={{ opacity: 0, scaleY: 0.3 }}
                                                animate={{ opacity: 1, scaleY: 1 }}
                                                exit={{ opacity: 0, scaleY: 0.3 }}
                                                transition={{ duration: 0.12, ease: 'easeOut' }}
                                                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[#050505] rounded-r-full"
                                            />
                                        )}
                                    </AnimatePresence>
                                    <span className={`shrink-0 ${isActive ? 'text-[#050505]' : 'text-[#888888]'}`}>{item.icon}</span>
                                    {!isCollapsed && (
                                        <span className={`text-[11px] font-bold uppercase tracking-wider flex-1 text-left leading-none truncate ${isActive ? 'text-[#050505]' : 'text-[#555555]'}`}>
                                            {item.label}
                                        </span>
                                    )}
                                    {!isCollapsed && item.badge && (
                                        <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            </div>
                        );
                    })}
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
                <header className="sticky top-0 h-[52px] border-b border-black/10 bg-white/90 backdrop-blur-md flex items-center justify-between px-6 z-40 shrink-0 shadow-none transition-colors duration-300">
                    <div className="relative w-52 shrink-0">
                        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
                        <input
                            type="text"
                            readOnly
                            onFocus={() => setIsPaletteOpen(true)}
                            onClick={() => setIsPaletteOpen(true)}
                            placeholder="Press ⌘K to search..."
                            className="w-full bg-transparent border border-black/10 text-black rounded-xl pl-9 pr-3 py-2 text-[10px] font-mono outline-none focus:border-[#000000] transition-all cursor-pointer"
                        />
                    </div>

                    <div className="hidden lg:flex items-center gap-0 divide-x divide-black/10 flex-1 mx-6 overflow-hidden">
                        <LiveMarketBand />
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSettingsOpen(true)}
                            title="Open Settings"
                            className="shrink-0 p-2.5 rounded-full border border-black/10 hover:bg-black/5 text-[#888888] hover:text-black transition-all flex items-center justify-center w-10 h-10"
                        >
                            <Settings size={18} />
                        </button>
                    </div>
                </header>

                <main className="flex-1 relative flex flex-col transition-colors duration-300 bg-[#EFEFEF] overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(250,249,246,0.5)_0%,transparent_80%)]" />

                    {/* Scrollable content layer — allows vertical scroll within the tab */}
                    <div
                        className="absolute inset-0 overflow-y-auto overflow-x-hidden flex flex-col"
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(0,0,0,0.12) transparent',
                            overscrollBehavior: 'contain',
                        }}
                    >
                        <div className="p-4 md:p-5 w-full flex-1 flex flex-col relative z-10" style={{ transform: 'translateZ(0)' }}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.18 }}
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
                <nav className="md:hidden h-16 border-t border-black/10 bg-white flex items-center justify-around px-2 shrink-0 z-50">
                    {[
                        { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Home' },
                        { id: 'whale-events', icon: <TrendingUp size={20} />, label: 'Radar' },
                        { id: 'portfolio', icon: <Wallet size={20} />, label: 'Vault' },
                        { id: 'menu', icon: <Menu size={20} />, label: 'Menu' },
                    ].map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => tab.id === 'menu' ? setIsPaletteOpen(true) : handleTabChange(tab.id)}
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
                            <span className={streamConnected ? 'text-[#00FF55]' : 'text-[#FF3B30]'}>
                                {streamConnected ? 'ACTIVE' : 'DEGRADED'}
                            </span>
                            {mode === 'synthetic' && <span className="ml-1 text-[7px] border border-[#FF9500]/50 text-[#FF9500] px-1 rounded-sm">INTERNAL FALLBACK</span>}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-[9px] font-black text-[#888888] uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Shield size={11} /> {mode === 'live' ? 'Protocol: Live' : 'Protocol: Simulated'}</span>
                        <span className="text-[#888888]">© 2026 WHALECOSYSTEM CORP.</span>
                    </div>
                </footer>
            </div>
        </div>
        </>
    );
}
