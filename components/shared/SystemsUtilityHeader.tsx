"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Eye, User } from 'lucide-react';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { useDisconnect } from 'wagmi';
import { useUIStore } from '@/lib/store/ui-store';
import { CurrencySwitcher } from './CurrencySwitcher';

// ─── IVORY SYSTEMS UTILITY HEADER ───
// Perfectly visible on cream/ivory background
export function SystemsUtilityHeader() {
    const { address, isConnected } = useSovereignAccount();
    const { activePanel, setActivePanel, openConnectModal } = useUIStore();
    const { disconnect } = useDisconnect();

    const icons = [
        { id: 'notifications', icon: Bell, label: 'Notifications' },
        { id: 'privacy',       icon: Eye,  label: 'Privacy'        },
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
        <div className="flex items-center gap-3 relative" ref={dropdownRef}>

            {/* Utility icon buttons */}
            <div className="flex items-center gap-1">
                {icons.map((item, i) => (
                    <motion.button
                        key={i}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setActivePanel(activePanel === item.id ? null : item.id as any)}
                        className="relative w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                        style={{
                            background: activePanel === item.id ? 'rgba(0,0,0,0.08)' : 'transparent',
                            color: activePanel === item.id ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.35)',
                        }}
                        title={item.label}
                    >
                        <item.icon size={15} strokeWidth={activePanel === item.id ? 2.5 : 1.8} />
                        {item.id === 'notifications' && (
                            <div
                                className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full animate-pulse"
                                style={{ background: 'rgba(0,0,0,0.6)' }}
                            />
                        )}
                    </motion.button>
                ))}
            </div>

            {/* Separator */}
            <div className="w-px h-5" style={{ background: 'rgba(0,0,0,0.1)' }} />

            {/* Wallet Connection Pill */}
            <div className="relative">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isConnected) {
                            setIsDropdownOpen(!isDropdownOpen);
                        }
                    }}
                    className="flex items-center gap-2.5 pl-3.5 pr-1.5 py-1.5 rounded-full transition-all border cursor-pointer group"
                    style={{
                        background: isConnected ? 'rgba(0,0,0,0.07)' : 'rgba(0,0,0,0.04)',
                        borderColor: isDropdownOpen ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)',
                        boxShadow: isDropdownOpen ? '0 2px 12px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                >
                    <div className="flex flex-col items-start leading-none text-left">
                        <span
                            className="font-mono text-[9px] font-black uppercase tracking-widest"
                            style={{ color: 'rgba(0,0,0,0.75)' }}
                        >
                            {isConnected && address ? truncateAddress(address) : 'Disconnected'}
                        </span>
                        <span
                            className="font-mono text-[7px] font-bold uppercase tracking-widest mt-0.5"
                            style={{ color: 'rgba(0,0,0,0.35)' }}
                        >
                            {isConnected ? 'Connected Wallet' : 'Connect Terminal'}
                        </span>
                    </div>
                    <div
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                        style={{
                            background: isDropdownOpen ? 'rgba(0,0,0,0.88)' : 'rgba(0,0,0,0.08)',
                            color: isDropdownOpen ? '#F7F2EA' : 'rgba(0,0,0,0.5)',
                        }}
                    >
                        <User size={12} />
                    </div>
                </motion.button>

                {/* Ivory Dropdown */}
                <AnimatePresence>
                    {isDropdownOpen && isConnected && (
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute top-full right-0 mt-2 w-64 rounded-2xl border p-3 z-[9999] overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, #FDFAF5, #F4EDE0)',
                                borderColor: 'rgba(0,0,0,0.08)',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
                            }}
                        >
                            {/* Address row */}
                            <button
                                className="w-full p-3.5 rounded-xl border flex items-center justify-between gap-3 hover:border-black/15 transition-all text-left group"
                                style={{ background: 'rgba(0,0,0,0.03)', borderColor: 'rgba(0,0,0,0.06)' }}
                                onClick={() => { if (address) navigator.clipboard.writeText(address); }}
                            >
                                <div className="flex flex-col min-w-0">
                                    <span className="font-mono text-[8px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(0,0,0,0.35)' }}>
                                        Copy Address
                                    </span>
                                    <span className="font-mono text-[10px] font-black truncate" style={{ color: 'rgba(0,0,0,0.75)' }}>
                                        {address}
                                    </span>
                                </div>
                                <User size={14} style={{ color: 'rgba(0,0,0,0.25)', flexShrink: 0 }} />
                            </button>

                            <div className="h-px my-3" style={{ background: 'rgba(0,0,0,0.06)' }} />

                            {/* Disconnect */}
                            <button
                                onClick={() => {
                                    setIsDropdownOpen(false);
                                    disconnect();
                                    document.cookie = 'sovereign_handshake=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                                    window.location.reload();
                                }}
                                className="w-full py-3 rounded-xl font-mono text-[9px] font-black uppercase tracking-widest transition-all border"
                                style={{
                                    background: 'rgba(0,0,0,0.88)',
                                    borderColor: 'rgba(0,0,0,0.88)',
                                    color: '#F7F2EA',
                                }}
                            >
                                Disconnect Session
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
