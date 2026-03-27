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
        { id: 'notifications', icon: Bell, label: 'Notifications' },
        { id: 'privacy', icon: Eye, label: 'Privacy' },
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
            {/* Utility Icons */}
            <div className="flex items-center gap-5">
                {icons.map((item, i) => (
                    <motion.button
                        key={i}
                        whileHover={{ scale: 1.1, color: 'var(--aztec-orchid)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setActivePanel(activePanel === item.id ? null : item.id as any)}
                        className={`transition-colors p-1 ${activePanel === item.id ? 'text-white' : 'text-white/50 hover:text-white'}`}
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
            <div className="hidden sm:block w-px h-6 bg-white/10" />

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
                    className={`flex items-center gap-3 ${isConnected ? 'bg-[var(--aztec-chartreuse)]' : 'bg-white/5'} backdrop-blur-md border ${isDropdownOpen ? 'border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'border-white/10'} pl-4 pr-1.5 py-1.5 rounded-full shadow-sm cursor-pointer hover:border-white/20 transition-all group`}
                >
                    <div className="flex flex-col items-start leading-none text-left">
                        <span className={`text-[10px] font-aztec-mono font-black uppercase tracking-widest ${isConnected ? 'text-black' : 'text-white'}`}>
                            {isConnected && address ? truncateAddress(address) : 'Disconnected'}
                        </span>
                        <span className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${isConnected ? 'text-black/60' : 'text-[var(--aztec-orchid)]'}`}>
                            {isConnected ? 'CONNECTED WALLET' : 'Connect Terminal'}
                        </span>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isDropdownOpen ? 'bg-white text-black' : 'bg-white/10 border border-white/10 text-white group-hover:bg-white group-hover:text-black'}`}>
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
                            className="absolute top-full right-0 mt-3 w-64 bg-[#0a0a0a] backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl p-4 z-[9999] overflow-hidden"
                        >
                            <div className="absolute inset-0 noise-bg opacity-[0.05]" />
                            
                            <div className="relative z-10 flex flex-col gap-4">
                                <button className="p-4 bg-white/5 border border-white/5 rounded-[1.5rem] flex items-center justify-between group cursor-pointer hover:border-white/20 transition-all w-full text-left" onClick={() => {
                                    if(address) navigator.clipboard.writeText(address);
                                }}>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-white/50 font-aztec-mono uppercase tracking-widest mb-1">Copy Address</span>
                                        <span className="text-[11px] font-aztec-mono font-black text-white">{address}</span>
                                    </div>
                                    <User size={16} className="text-white/30 group-hover:text-white transition-colors flex-shrink-0 ml-2" />
                                </button>

                                <button 
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        disconnect();
                                    }}
                                    className="w-full py-4 bg-[#ff0033]/10 border border-[#ff0033]/20 text-[#ff0033] rounded-2xl text-[10px] font-aztec-mono font-black uppercase tracking-widest hover:bg-[#ff0033]/20 transition-all font-bold"
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
