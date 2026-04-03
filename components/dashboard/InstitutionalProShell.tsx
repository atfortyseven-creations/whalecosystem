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
                <header className="h-[72px] border-b border-[#E5E5E5] bg-white flex items-center justify-between px-8 z-40 shrink-0 shadow-sm">
                    {/* Search / Status */}
                    <div className="flex items-center gap-8 flex-1">
                        <div className="relative max-w-sm w-full">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888]" />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search markets, nodes or addresses..."
                                className="w-full bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl pl-11 pr-4 py-2.5 text-xs font-bold outline-none focus:border-[#050505] transition-all"
                            />
                        </div>
                        
                        <div className="hidden lg:flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-[#888888] uppercase tracking-widest">Global Vol.</span>
                                <span className="text-xs font-bold text-[#050505]">$24.8B <span className="text-[#00C076]">+4.2%</span></span>
                            </div>
                            <div className="w-px h-6 bg-[#E5E5E5]" />
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-[#888888] uppercase tracking-widest">TXNS (24h)</span>
                                <span className="text-xs font-bold text-[#050505]">3.4M</span>
                            </div>
                            <div className="w-px h-6 bg-[#E5E5E5]" />
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-[#888888] uppercase tracking-widest">Sentiment</span>
                                <span className="text-xs font-bold text-[#00C076] uppercase">Greed (74)</span>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Utility */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E5E5E5] bg-[#FAF9F6]">
                            <div className="w-2 h-2 rounded-full bg-[#00C076] animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">System Live</span>
                        </div>
                        <button className="p-2.5 rounded-xl border border-[#E5E5E5] hover:border-[#050505] text-[#888888] hover:text-[#050505] transition-all">
                            <Settings size={18} />
                        </button>
                    </div>
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
