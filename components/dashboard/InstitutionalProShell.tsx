"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Star, Bell, BarChart2, Zap,
    TrendingUp, Code, Wallet, Settings,
    ChevronLeft, ChevronRight, Search,
    Globe, Cpu, Shield, Newspaper, LifeBuoy,
    GraduationCap, Crown, PieChart, Briefcase
} from 'lucide-react';
import { useSettingsStore } from '@/lib/store/settings-store';
import { useMarketStream } from '@/context/MarketStreamContext';

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
    { id: 'dashboard',       label: 'Dashboard',       icon: <LayoutDashboard size={17}/>, dividerBefore: 'Markets' },
    { id: 'watchlist',       label: 'Watchlist',        icon: <Star size={17}/>,            badge: 'Pro' },
    { id: 'alerts',          label: 'Alerts',           icon: <Bell size={17}/> },
    { id: 'multicharts',     label: 'Multicharts',      icon: <BarChart2 size={17}/> },
    { id: 'new-pairs',       label: 'New Pairs',        icon: <Zap size={17}/>,             badge: 'Live', badgeColor: '#00C076' },
    { id: 'gainers',         label: 'Gainers & Losers', icon: <TrendingUp size={17}/> },
    // ── Intelligence ──
    { id: 'whale-portfolio', label: 'Whale Intelligence',  icon: <PieChart size={17}/>,        dividerBefore: 'Intelligence' },
    { id: 'news',            label: 'News of Today',    icon: <Newspaper size={17}/>,       badge: 'New', badgeColor: '#0052FF' },
    { id: 'api',             label: 'API Terminal',     icon: <Code size={17}/> },
    { id: 'portfolio',       label: 'Portfolio',        icon: <Wallet size={17}/> },
    // ── Learn & Support ──
    { id: 'academy',         label: 'Whale Academy',    icon: <GraduationCap size={17}/>,   dividerBefore: 'Learn & Support' },
    { id: 'support',         label: 'Whale Support',    icon: <LifeBuoy size={17}/> },
    { id: 'humanidfi-portfolio', label: 'Whale Portfolio', icon: <Briefcase size={17}/> },
    { id: 'gold-ticket',     label: 'Gold Ticket',      icon: <Crown size={17}/>,           badge: '$5', badgeColor: '#D4AF37' },
];

// Removed EMBEDDED_TABS since all content is now inherently native and perfectly padded.

function LiveMarketBand() {
    const { markets } = useMarketStream();
    
    const [stats, setStats] = useState([
        { label: 'BTC',         value: '---',       chg: null as string|null,  up: true  },
        { label: 'ETH',         value: '---',       chg: null as string|null,  up: false },
        { label: 'Global MCap', value: '$2.84T',    chg: '+2.1%',  up: true  },
        { label: 'DeFi TVL',    value: '$98.7B',    chg: '+0.4%',  up: true  },
        { label: 'BTC.D',       value: '54.2%',     chg: '+0.3%',  up: true  },
        { label: 'ETH Gas',     value: '14 Gwei',   chg: null,     up: true  },
        { label: 'Fear/Greed',  value: '74',        chg: 'GREED',  up: true  },
        { label: 'SOL TPS',     value: '4,218',     chg: null,     up: true  },
    ]);

    React.useEffect(() => {
        if (markets.size > 0) {
            const btc = markets.get('BTCUSDT');
            const eth = markets.get('ETHUSDT');
            if (btc && eth) {
                setStats(prev => {
                    const n = [...prev];
                    n[0] = { label: 'BTC', value: '$' + parseInt(btc.lastPrice || '0').toLocaleString(), chg: (parseFloat(btc.priceChangePercent || '0') >= 0 ? '+' : '') + parseFloat(btc.priceChangePercent || '0').toFixed(1) + '%', up: parseFloat(btc.priceChangePercent || '0') >= 0 };
                    n[1] = { label: 'ETH', value: '$' + parseInt(eth.lastPrice || '0').toLocaleString(), chg: (parseFloat(eth.priceChangePercent || '0') >= 0 ? '+' : '') + parseFloat(eth.priceChangePercent || '0').toFixed(1) + '%', up: parseFloat(eth.priceChangePercent || '0') >= 0 };
                    return n;
                });
            }
        }
    }, [markets]);

    return (
        <>
            {stats.map((item, i) => (
                <div key={i} className="flex flex-col px-3 py-1 min-w-0 shrink-0">
                    <span className="text-[7.5px] font-black text-[#888888] uppercase tracking-[0.15em] leading-none mb-0.5">{item.label}</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-[10px] font-black font-mono text-[#050505] truncate">{item.value}</span>
                        {item.chg && (
                            <span className={`text-[8px] font-black leading-none ${item.label === 'Fear/Greed' ? 'text-[#00C076]' : item.up ? 'text-[#00C076]' : 'text-[#FF3B30]'}`}>
                                {item.chg}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </>
    );
}

export function InstitutionalProShell({ 
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
    const { setSettingsOpen } = useSettingsStore();

    return (
        <div className="flex h-screen bg-[#FAF9F6] text-[#050505] overflow-hidden font-sans selection:bg-[#050505]/10">
            
            {/* ─── Persistent Pro Sidebar ─── */}
            <motion.aside 
                animate={{ width: isCollapsed ? 64 : 260 }}
                className="h-full border-r border-[#E5E5E5] bg-[#FDFDFB] flex flex-col z-50 relative shadow-[10px_0_30px_rgba(0,0,0,0.02)]"
            >

                {/* Sidebar Navigation — tabs start at the very top */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden pt-0 pb-4 px-3 space-y-0.5 no-scrollbar">
                    {SIDEBAR_ITEMS.map((item, index) => {
                        const isActive = activeTab === item.id;
                        const isGold   = item.id === 'gold-ticket';
                        return (
                            <div key={item.id}>
                                {/* Section divider label */}
                                {item.dividerBefore && !isCollapsed && (
                                    <div className={`px-4 ${index === 0 ? 'pt-3' : 'pt-4'} pb-1`}>
                                        <span className="text-[8px] font-black text-[#CCCCCC] uppercase tracking-[0.2em]">
                                            {item.dividerBefore}
                                        </span>
                                    </div>
                                )}
                                {item.dividerBefore && isCollapsed && (
                                    <div className="my-2 mx-3 h-px bg-[#E5E5E5]/60"/>
                                )}
                                <button
                                    onClick={() => onTabChange(item.id)}
                                    title={item.label}
                                    className={`
                                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative
                                        ${isGold && !isActive
                                            ? 'text-[#D4AF37] hover:bg-[#D4AF37]/10 border border-[#D4AF37]/20'
                                            : isActive
                                                ? 'bg-[#050505] text-white shadow-md'
                                                : 'text-[#888888] hover:text-[#050505] hover:bg-[#E5E5E5]/40'
                                        }
                                    `}
                                >
                                    <span className={isActive ? 'text-white' : isGold ? 'text-[#D4AF37]' : ''}>{item.icon}</span>
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
                                        <motion.div layoutId="nav-indicator" className="absolute left-0 w-1 h-5 bg-white rounded-r-full" />
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Collapse toggle — tiny footer */}
                <div className="px-3 pb-3 pt-1">
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-full flex items-center justify-center p-2 rounded-xl border border-[#E5E5E5] text-[#888888] hover:text-[#050505] hover:bg-[#E5E5E5]/30 transition-all"
                    >
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                </div>
            </motion.aside>

            {/* ─── Main Content Wrapper ─── */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                
                {/* ─── Top Master Bar ─── */}
                <header className="h-[56px] border-b border-[#E5E5E5] bg-white flex items-center justify-between px-6 z-40 shrink-0 shadow-sm">
                    {/* Left: Search */}
                    <div className="relative w-52 shrink-0">
                        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
                        <input
                            type="text" value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search markets or addresses…"
                            className="w-full bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl pl-9 pr-3 py-2 text-[10px] font-mono outline-none focus:border-[#050505] transition-all"
                        />
                    </div>

                    {/* Center: Live Dense Market Bar */}
                    <div className="hidden lg:flex items-center gap-0 divide-x divide-[#E5E5E5] flex-1 mx-6 overflow-hidden">
                        <LiveMarketBand />
                    </div>

                    {/* Right: Settings */}
                    <button
                        onClick={() => setSettingsOpen(true)}
                        title="Open Settings"
                        className="shrink-0 p-2 rounded-xl border border-[#E5E5E5] hover:bg-[#E5E5E5]/30 text-[#888888] hover:text-[#050505] transition-all active:scale-95"
                    >
                        <Settings size={16} />
                    </button>
                </header>

                {/* ─── Table / View Area ─── */}
                <main className="flex-1 relative bg-[#FFFFFF] overflow-hidden flex flex-col">
                    {isExternalEmbed ? (
                        /* External embed: fill entire space, no padding */
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {children}
                        </div>
                    ) : (
                        /* Native panel: standard padded container */
                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            <div className="p-8 max-w-[1600px] mx-auto w-full">
                                {children}
                            </div>
                        </div>
                    )}
                </main>

                {/* ─── Pro Status Bar ─── */}
                <footer className="h-8 border-t border-[#E5E5E5] bg-[#FDFDFB] flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-4 text-[9px] font-black text-[#888888] uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Globe size={11} /> Global Latency: 12ms</span>
                        <span className="flex items-center gap-1.5"><Cpu size={11} /> BSV Teranode: ACTIVE</span>
                    </div>
                    <div className="flex items-center gap-4 text-[9px] font-black text-[#888888] uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Shield size={11} /> SSL: SECURE</span>
                        <span className="text-[#050505]">© 2026 WHALECOSYSTEM CORP.</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
