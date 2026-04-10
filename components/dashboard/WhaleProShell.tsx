"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Star, Bell, BarChart2, Zap,
    TrendingUp, Code, Wallet, Settings,
    ChevronLeft, ChevronRight, Search,
    Globe, Cpu, Shield, ShieldAlert, Newspaper, LifeBuoy,
    GraduationCap, Crown, PieChart, Briefcase, Network, Eye
} from 'lucide-react';
import { useSettingsStore } from '@/lib/store/settings-store';
import { useMarketStream } from '@/context/MarketStreamContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { GlobalCommandPalette } from '@/components/ui/GlobalCommandPalette';

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
    dividerBefore?: string;
}

const SIDEBAR_ITEMS: NavItem[] = [
    // ── Markets ──
    { id: 'dashboard',       label: 'Dashboard',        icon: <LayoutDashboard size={17}/>, dividerBefore: 'Markets' },
    { id: 'watchlist',       label: 'Tactical Watchlist',icon: <Eye size={17}/> },
    { id: 'alerts',          label: 'Smart Alerts',      icon: <Bell size={17}/> },
    { id: 'whale-events',    label: 'Global Firehose',   icon: <TrendingUp size={17}/>,       badge: 'LIVE', badgeColor: '#D4AF37' },
    { id: 'multicharts',     label: 'Quant Charts',      icon: <BarChart2 size={17}/>,       badge: 'NEW', badgeColor: '#00FF55' },
    { id: 'new-pairs',       label: 'New Pairs',         icon: <Zap size={17}/>,              badge: 'Live', badgeColor: '#00C076' },
    { id: 'gainers',         label: 'Gainers & Losers',  icon: <TrendingUp size={17}/> },
    // ── Intelligence ──
    { id: 'whale-portfolio', label: 'Whale Intelligence',  icon: <PieChart size={17}/>,        dividerBefore: 'Intelligence' },
    { id: 'news',            label: 'News of Today',    icon: <Newspaper size={17}/>,       badge: 'New', badgeColor: '#0052FF' },
    { id: 'api',             label: 'API Terminal',     icon: <Code size={17}/> },
    { id: 'zk-shield',       label: 'ZK Shield Station',icon: <Shield size={17}/>,          badge: 'ZKP', badgeColor: '#00FF55' },
    { id: 'neural-graph',    label: 'Neural Graph',     icon: <Network size={17}/>,         badge: 'LIVE', badgeColor: '#0052FF' },
    { id: 'sovereign-vault', label: 'User',            icon: <ShieldAlert size={17}/>,     badge: 'USER', badgeColor: '#0052FF' },
    { id: 'omni-explorer',   label: 'Aztec Explorer',   icon: <Search size={17}/>,          badge: 'ZK', badgeColor: '#00FF55' },
    { id: 'portfolio',       label: 'Portfolio',        icon: <Wallet size={17}/> },
    // ── Learn & Support ──
    { id: 'academy',         label: 'Whale Academy',    icon: <GraduationCap size={17}/>,   dividerBefore: 'Learn & Support' },
    { id: 'brc-explorer',    label: 'BRC Standards',    icon: <Code size={17}/>,            badge: 'BSV', badgeColor: '#E2B33D' },
    { id: 'support',         label: 'Whale Support',    icon: <LifeBuoy size={17}/> },
    { id: 'humanidfi-portfolio', label: 'Whale Portfolio', icon: <Briefcase size={17}/> },
    { id: 'gold-ticket',     label: 'Gold Ticket',      icon: <Crown size={17}/>,           badge: '$5', badgeColor: '#D4AF37' },
];

function LiveMarketBand() {
    const { markets, isConnected: streamConnected } = useMarketStream();

    const btc = markets.get('BTCUSDT');
    const eth = markets.get('ETHUSDT');

    interface StatItem { label: string; value: string; chg: string | null; up: boolean; }

    const items: StatItem[] = [];

    if (btc) {
        const chgPct = parseFloat(btc.priceChangePercent || '0');
        items.push({
            label: 'BTC',
            value: '$' + parseInt(btc.lastPrice || '0').toLocaleString(),
            chg: (chgPct >= 0 ? '+' : '') + chgPct.toFixed(1) + '%',
            up: chgPct >= 0,
        });
    }
    if (eth) {
        const chgPct = parseFloat(eth.priceChangePercent || '0');
        items.push({
            label: 'ETH',
            value: '$' + parseInt(eth.lastPrice || '0').toLocaleString(),
            chg: (chgPct >= 0 ? '+' : '') + chgPct.toFixed(1) + '%',
            up: chgPct >= 0,
        });
    }

    // Loading skeleton while stream connects
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
                    <div className="flex items-baseline gap-1">
                        <span className="text-[10px] font-black font-mono text-white truncate">{item.value}</span>
                        {item.chg && (
                            <span className={`text-[8px] font-black leading-none ${item.up ? 'text-[#00FF55]' : 'text-[#FF3B30]'}`}>
                                {item.chg}
                            </span>
                        )}
                    </div>
                </div>
            ))}
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

    return (
        <>
        <GlobalCommandPalette
            isOpen={isPaletteOpen}
            setIsOpen={setIsPaletteOpen}
            onTabChange={onTabChange}
        />
        <div className="flex h-screen bg-white dark:bg-[#000000] text-black dark:text-white overflow-hidden font-sans selection:bg-[#00FF55]/20 transition-colors duration-300">
            
            {/* ─── Persistent Pro Sidebar ─── */}
            <motion.aside 
                animate={{ width: isCollapsed ? 64 : 260 }}
                className="h-full border-r border-black/10 dark:border-white/10 bg-white dark:bg-[#000000] flex flex-col z-50 relative shadow-none transition-colors duration-300"
            >

                {/* Sidebar Navigation */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden pt-0 pb-4 px-3 space-y-0.5 no-scrollbar">
                    {SIDEBAR_ITEMS.map((item, index) => {
                        const isActive = activeTab === item.id;
                        const isGold   = item.id === 'gold-ticket';
                        return (
                            <div key={item.id}>
                                {item.dividerBefore && !isCollapsed && (
                                    <div className={`px-4 ${index === 0 ? 'pt-3' : 'pt-4'} pb-1`}>
                                        <span className="text-[8px] font-black text-[#CCCCCC] uppercase tracking-[0.2em]">
                                            {item.dividerBefore}
                                        </span>
                                    </div>
                                )}
                                {item.dividerBefore && isCollapsed && (
                                    <div className="my-2 mx-3 h-px bg-black/10 dark:bg-white/10"/>
                                )}
                                <button
                                    onClick={() => onTabChange(item.id)}
                                    title={item.label}
                                    className={`
                                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative
                                        ${isGold && !isActive
                                            ? 'text-[#D4AF37] hover:bg-[#D4AF37]/10 border border-[#D4AF37]/20'
                                            : isActive
                                                ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white shadow-md border border-black/10 dark:border-white/20'
                                                : 'text-[#888888] hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                                        }
                                    `}
                                >
                                    <span className={isActive ? 'text-black dark:text-white' : isGold ? 'text-[#D4AF37]' : ''}>{item.icon}</span>
                                    {!isCollapsed && (
                                        <span className="text-[11px] font-bold uppercase tracking-wider flex-1 text-left leading-none">
                                            {item.label}
                                        </span>
                                    )}
                                    {!isCollapsed && item.badge && (
                                        <span
                                            className="text-[7px] font-black px-1.5 py-0.5 rounded uppercase"
                                            style={isActive
                                                ? { background: 'rgba(255,255,255,0.2)', color: 'white' }
                                                : { background: (item.badgeColor || '#D4AF37') + '18', color: item.badgeColor || '#D4AF37', border: `1px solid ${(item.badgeColor || '#D4AF37')}40` }
                                            }
                                        >
                                            {item.badge}
                                        </span>
                                    )}
                                    {isActive && (
                                        <motion.div layoutId="nav-indicator" className="absolute left-0 w-1 h-5 bg-black dark:bg-white rounded-r-full" />
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="px-3 pb-3 pt-1">
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-full flex items-center justify-center p-2 rounded-xl border border-black/10 dark:border-white/10 text-[#888888] hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                    >
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                </div>
            </motion.aside>

            {/* ─── Main Content Wrapper ─── */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                
                {/* ─── Top Master Bar ─── */}
                <header className="h-[56px] border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#000000] flex items-center justify-between px-6 z-40 shrink-0 shadow-none transition-colors duration-300">
                    <div className="relative w-52 shrink-0">
                        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
                        <input
                            type="text"
                            readOnly
                            onFocus={() => setIsPaletteOpen(true)}
                            onClick={() => setIsPaletteOpen(true)}
                            placeholder="Press ⌘K to search..."
                            className="w-full bg-transparent border border-black/10 dark:border-white/10 text-black dark:text-white rounded-xl pl-9 pr-3 py-2 text-[10px] font-mono outline-none focus:border-[#00FF55] transition-all cursor-pointer"
                        />
                    </div>

                    <div className="hidden lg:flex items-center gap-0 divide-x divide-black/10 dark:divide-white/10 flex-1 mx-6 overflow-hidden">
                        <LiveMarketBand />
                    </div>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <button
                            onClick={() => setSettingsOpen(true)}
                            title="Open Settings"
                            className="shrink-0 p-2.5 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[#888888] hover:text-black dark:hover:text-white transition-all flex items-center justify-center w-10 h-10"
                        >
                            <Settings size={18} />
                        </button>
                    </div>
                </header>

                <main className="flex-1 relative overflow-hidden flex flex-col transition-colors duration-300 bg-[#FAF9F6] dark:bg-[#050810]">
                    <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 perspective-[1000px]">
                        
                        {/* HARDWARE-ACCELERATED IMMERSIVE WATERMARK LAYER — 4K ukiyo-e */}
                        <div 
                            className="fixed inset-0 pointer-events-none -z-20 transition-colors duration-300 hidden dark:block"
                            style={{
                                backgroundImage: `url('/api/checkpoint-image?name=patron-cosmico-4k.png')`,
                                backgroundSize: '280px auto',
                                backgroundPosition: 'center center',
                                backgroundRepeat: 'repeat',
                                transform: 'translateZ(0)',
                                willChange: 'transform',
                                opacity: 0.038,
                                mixBlendMode: 'screen',
                                filter: 'invert(1) hue-rotate(180deg)'
                            }}
                        />
                        <div 
                            className="fixed inset-0 pointer-events-none -z-20 transition-colors duration-300 block dark:hidden"
                            style={{
                                backgroundImage: `url('/api/checkpoint-image?name=patron-cosmico-4k.png')`,
                                backgroundSize: '280px auto',
                                backgroundPosition: 'center center',
                                backgroundRepeat: 'repeat',
                                transform: 'translateZ(0)',
                                willChange: 'transform',
                                opacity: 0.062,
                                mixBlendMode: 'multiply'
                            }}
                        />

                        {/* Immersive radial glow overlay (Preserved from old main background) */}
                        <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,150,255,0.04)_0%,transparent_60%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,150,255,0.08)_0%,transparent_60%)] transition-colors duration-300" />
                        
                        <div className="p-8 max-w-[1600px] mx-auto w-full h-full relative z-10">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 30, scale: 0.98, filter: 'blur(10px)', rotateX: 5 }}
                                    animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', rotateX: 0 }}
                                    exit={{ opacity: 0, y: -30, scale: 0.98, filter: 'blur(10px)', rotateX: -5 }}
                                    transition={{ 
                                        type: "spring", 
                                        stiffness: 400, 
                                        damping: 30, 
                                        mass: 0.8,
                                    }}
                                    style={{ willChange: 'transform, opacity, filter', transformOrigin: 'top center' }}
                                    className="w-full h-full"
                                >
                                    {children}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                </main>

                {/* ─── Status Bar ─── */}
                <footer className="h-8 border-t border-black/10 dark:border-white/10 bg-white dark:bg-[#000000] flex items-center justify-between px-6 shrink-0 transition-colors duration-300">
                    <div className="flex items-center gap-4 text-[9px] font-black text-[#888888] uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Globe size={11} /> Global Latency: 12ms</span>
                        <span className="flex items-center gap-1.5"><Cpu size={11} /> Network Nodes: ACTIVE</span>
                    </div>
                    <div className="flex items-center gap-4 text-[9px] font-black text-[#888888] uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Shield size={11} /> SSL: SECURE</span>
                        <span className="text-[#888888]">© 2026 WHALECOSYSTEM CORP.</span>
                    </div>
                </footer>
            </div>
        </div>
        </>
    );
}
