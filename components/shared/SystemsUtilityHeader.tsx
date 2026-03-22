"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Bell, Eye, Settings, User } from 'lucide-react';
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useUIStore } from '@/lib/store/ui-store';
import { CurrencySwitcher } from './CurrencySwitcher';

export function SystemsUtilityHeader() {
    const { address, isConnected } = useAccount();
    const { activePanel, setActivePanel, openConnectModal } = useUIStore();
    const { open } = useAppKit();

    const { disconnect } = useDisconnect();

    const icons = [
        { id: 'history', icon: Clock, label: 'History' },
        { id: 'notifications', icon: Bell, label: 'Notifications' },
        { id: 'privacy', icon: Eye, label: 'Privacy' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex flex-wrap justify-center items-center gap-4 relative w-full" ref={dropdownRef}>
            {/* Currency Switcher */}
            <div className="flex items-center">
                <CurrencySwitcher />
            </div>

            {/* Utility Icons */}
            <div className="flex items-center gap-5">
                {icons.map((item, i) => (
                    <motion.button
                        key={i}
                        whileHover={{ scale: 1.1, color: 'var(--aztec-orchid)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setActivePanel(activePanel === item.id ? null : item.id as any)}
                        className={`transition-colors p-1 ${activePanel === item.id ? 'text-[var(--aztec-orchid)]' : 'text-[var(--aztec-ink)] opacity-40 hover:opacity-100 hover:text-[var(--aztec-orchid)]'}`}
                        title={item.label}
                    >
                        <item.icon size={18} strokeWidth={activePanel === item.id ? 2.5 : 1.5} />
                        {item.id === 'notifications' && (
                            <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-[var(--aztec-orchid)] rounded-full animate-pulse shadow-[0_0_8px_rgba(255,45,244,0.8)]" />
                        )}
                    </motion.button>
                ))}
            </div>

            {/* Separator */}
            <div className="hidden sm:block w-px h-6 bg-black/5" />

            {/* Wallet Connection Pill */}
            <div className="relative">
                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isConnected) {
                            setIsDropdownOpen(!isDropdownOpen);
                        } else {
                            openConnectModal();
                        }
                    }}
                    className={`flex items-center gap-3 ${isConnected ? 'bg-[var(--aztec-chartreuse)]' : 'bg-white/40'} backdrop-blur-md border ${isDropdownOpen ? 'border-[var(--aztec-orchid)] shadow-[0_0_15px_rgba(209,37,199,0.1)]' : 'border-black/5'} pl-4 pr-1.5 py-1.5 rounded-full shadow-sm cursor-pointer hover:border-black/10 transition-all group`}
                >
                    <div className="flex flex-col items-start leading-none text-left">
                        <span className="text-[10px] font-aztec-mono font-black text-[var(--aztec-ink)] uppercase tracking-widest">
                            {isConnected && address ? truncateAddress(address) : 'Disconnected'}
                        </span>
                        <span className="text-[8px] font-black text-[var(--aztec-orchid)] uppercase tracking-widest mt-0.5">
                            {isConnected ? 'Sovereign Connected' : 'Connect Terminal'}
                        </span>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isDropdownOpen ? 'bg-[var(--aztec-orchid)] text-white' : 'bg-black/5 border border-black/10 group-hover:bg-[var(--aztec-orchid)] group-hover:text-white'}`}>
                        <User size={14} className="group-hover:scale-110 transition-transform" />
                    </div>
                </motion.button>

                {/* Aztec Dropdown Menu */}
                <AnimatePresence>
                    {isDropdownOpen && isConnected && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full right-0 mt-3 w-64 bg-[var(--aztec-parchment)]/95 backdrop-blur-2xl border border-[var(--aztec-ink)]/10 rounded-[2rem] shadow-2xl shadow-indigo-900/10 p-4 z-stratosphere overflow-hidden"
                        >
                            <div className="absolute inset-0 noise-bg opacity-[0.05]" />
                            
                            <div className="relative z-10 flex flex-col gap-4">
                                <div className="p-4 bg-[var(--aztec-parchment)] border border-[var(--aztec-ink)]/10 rounded-[1.5rem] flex items-center justify-between group cursor-pointer hover:border-[var(--aztec-chartreuse)] transition-all" onClick={() => {
                                    if(address) navigator.clipboard.writeText(address);
                                }}>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-[var(--aztec-ink)]/50 font-aztec-mono uppercase tracking-widest mb-1">Active Sovereign</span>
                                        <span className="text-[11px] font-aztec-mono font-black text-[var(--aztec-ink)]">{truncateAddress(address!)}</span>
                                    </div>
                                    <User size={16} className="text-[var(--aztec-ink)]/30 group-hover:text-[var(--aztec-ink)] transition-colors" />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setActivePanel('history')} className="py-3 px-4 bg-[var(--aztec-ink)]/5 border border-[var(--aztec-ink)]/10 rounded-xl text-[9px] font-aztec-mono font-black text-[var(--aztec-ink)]/50 uppercase tracking-widest hover:bg-[var(--aztec-ink)]/10 hover:text-[var(--aztec-ink)] transition-all flex flex-col items-center gap-2">
                                        <Clock size={14} />
                                        Archive
                                    </button>
                                    <button onClick={() => setActivePanel('settings')} className="py-3 px-4 bg-[var(--aztec-ink)]/5 border border-[var(--aztec-ink)]/10 rounded-xl text-[9px] font-aztec-mono font-black text-[var(--aztec-ink)]/50 uppercase tracking-widest hover:bg-[var(--aztec-ink)]/10 hover:text-[var(--aztec-ink)] transition-all flex flex-col items-center gap-2">
                                        <Settings size={14} />
                                        Settings
                                    </button>
                                </div>

                                <button 
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        disconnect();
                                    }}
                                    className="w-full py-3 bg-[#ff0033]/10 border border-[#ff0033]/20 text-[#ff0033] rounded-xl text-[9px] font-aztec-mono font-black uppercase tracking-widest hover:bg-[#ff0033]/20 transition-all"
                                >
                                    Disconnect Session
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
