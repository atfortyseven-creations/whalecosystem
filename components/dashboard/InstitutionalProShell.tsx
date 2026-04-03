"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, Star, Bell, BarChart2, Zap, 
    TrendingUp, Code, Wallet, Settings, Menu, X,
    ChevronLeft, ChevronRight, Search, Activity, 
    Globe, Cpu, Shield
} from 'lucide-react';
import { CorporateWhaleLogo } from "@/components/bsv/CorporateWhaleLogo";
import Link from 'next/link';

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: string;
}

const SIDEBAR_ITEMS: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'watchlist', label: 'Watchlist', icon: <Star size={18} />, badge: 'Pro' },
    { id: 'alerts', label: 'Alerts', icon: <Bell size={18} /> },
    { id: 'multicharts', label: 'Multicharts', icon: <BarChart2 size={18} /> },
    { id: 'new-pairs', label: 'New Pairs', icon: <Zap size={18} />, badge: 'Live' },
    { id: 'gainers', label: 'Gainers & Losers', icon: <TrendingUp size={18} /> },
    { id: 'api', label: 'API Terminal', icon: <Code size={18} /> },
    { id: 'portfolio', label: 'Portfolio', icon: <Wallet size={18} /> },
];

export function InstitutionalProShell({ 
    children, 
    activeTab, 
    onTabChange 
}: { 
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (id: string) => void;
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="flex h-screen bg-[#FAF9F6] text-[#050505] overflow-hidden font-sans selection:bg-[#050505]/10">
            
            {/* ─── Persistent Pro Sidebar ─── */}
            <motion.aside 
                animate={{ width: isCollapsed ? 80 : 280 }}
                className="h-full border-r border-[#E5E5E5] bg-[#FDFDFB] flex flex-col z-50 relative shadow-[10px_0_30px_rgba(0,0,0,0.02)]"
            >
                {/* Sidebar Header */}
                <div className="p-6 flex items-center justify-between border-b border-[#E5E5E5]/50">
                    {!isCollapsed && (
                        <div className="flex items-center gap-3">
                            <div className="relative w-8 h-8">
                                <CorporateWhaleLogo />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black tracking-tighter uppercase leading-none">WHALE ALERT</span>
                                <span className="text-[10px] font-bold text-[#888888] tracking-widest uppercase">SOVEREIGN NETWORK</span>
                            </div>
                        </div>
                    )}
                    {isCollapsed && (
                        <div className="relative w-8 h-8 mx-auto">
                            <CorporateWhaleLogo />
                        </div>
                    )}
                </div>

                {/* Sidebar Navigation */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 space-y-1 no-scrollbar">
                    {SIDEBAR_ITEMS.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                className={`
                                    w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all relative
                                    ${isActive 
                                        ? 'bg-[#050505] text-white shadow-lg' 
                                        : 'text-[#888888] hover:text-[#050505] hover:bg-[#E5E5E5]/30'}
                                `}
                            >
                                <span className={isActive ? 'text-white' : ''}>{item.icon}</span>
                                {!isCollapsed && (
                                    <span className="text-xs font-bold uppercase tracking-widest flex-1 text-left">
                                        {item.label}
                                    </span>
                                )}
                                {!isCollapsed && item.badge && (
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${isActive ? 'bg-white/20 text-white' : 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20'} uppercase`}>
                                        {item.badge}
                                    </span>
                                )}
                                {isActive && !isCollapsed && (
                                    <motion.div layoutId="nav-glow" className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-[#E5E5E5]/50">
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-full flex items-center justify-center p-3 rounded-xl border border-[#E5E5E5] text-[#888888] hover:text-[#050505] hover:bg-[#E5E5E5]/30 transition-all"
                    >
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
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

                    {/* Center: Dense Market Bar */}
                    <div className="hidden lg:flex items-center gap-0 divide-x divide-[#E5E5E5] flex-1 mx-6 overflow-hidden">
                        {[
                            { label: 'BTC',         value: '$83,241',   chg: '+1.2%',  up: true  },
                            { label: 'ETH',         value: '$3,812',    chg: '-0.8%',  up: false },
                            { label: 'Global MCap', value: '$2.84T',    chg: '+2.1%',  up: true  },
                            { label: 'DeFi TVL',    value: '$98.7B',    chg: '+0.4%',  up: true  },
                            { label: 'BTC.D',       value: '54.2%',     chg: '+0.3%',  up: true  },
                            { label: 'ETH Gas',     value: '14 Gwei',   chg: null,     up: true  },
                            { label: 'Fear/Greed',  value: '74',        chg: 'GREED',  up: true  },
                            { label: 'SOL TPS',     value: '4,218',     chg: null,     up: true  },
                        ].map((item, i) => (
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
                    </div>

                    {/* Right: Settings */}
                    <button className="shrink-0 p-2 rounded-xl border border-[#E5E5E5] hover:bg-[#E5E5E5]/30 text-[#888888] hover:text-[#050505] transition-all">
                        <Settings size={16} />
                    </button>
                </header>

                {/* ─── Table / View Area ─── */}
                <main className="flex-1 overflow-y-auto no-scrollbar relative bg-[#FFFFFF]">
                    <div className="p-8 max-w-[1600px] mx-auto w-full h-full">
                        {children}
                    </div>
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
