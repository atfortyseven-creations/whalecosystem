"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, ChevronDown, Check } from 'lucide-react';
import { useAccount, useSwitchChain } from 'wagmi';

export interface NetworkGroup {
    id: number;
    name: string;
    icon: string;
    isPopular?: boolean;
}

const NETWORKS: NetworkGroup[] = [
    { id: 1, name: 'Ethereum', icon: '/system-shots/logostoken/ethereum-eth-logo-colored.svg', isPopular: true },
    { id: 59144, name: 'Linea', icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/linea.svg', isPopular: true },
    { id: 8453, name: 'Base', icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/base.svg', isPopular: true },
    { id: 42161, name: 'Arbitrum', icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/arbitrum.svg', isPopular: true },
    { id: 56, name: 'BNB Chain', icon: '/system-shots/logostoken/bnb-bnb-logo.png', isPopular: true },
    { id: 10, name: 'OP', icon: '/system-shots/logostoken/optimism-ethereum-op-logo.png', isPopular: true },
    { id: 137, name: 'Polygon', icon: '/system-shots/logostoken/polygon-matic-logo.png', isPopular: true },
    { id: 43114, name: 'Avalanche', icon: '/system-shots/logostoken/avalanche-avax-logo.png', isPopular: true },
    
    // Additional networks
    { id: 250, name: 'Fantom', icon: '/system-shots/logostoken/fantom-ftm-logo.png' },
    { id: 42220, name: 'Celo', icon: '/system-shots/logostoken/celo-celo-logo.png' },
    { id: 534352, name: 'Scroll', icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/scroll.svg' },
    { id: 81457, name: 'Blast', icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/blast.svg' },
    { id: 324, name: 'ZkSync', icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/zksync.svg' },
    { id: 1329, name: 'Sei', icon: '/system-shots/logostoken/sei-sei-logo.png' }
];

export function MetaMaskNetworkSelector({ activeNetworkId, onNetworkChange }: { activeNetworkId?: number, onNetworkChange?: (id: number) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [tab, setTab] = useState<'popular' | 'custom'>('popular');
    
    const { chainId } = useAccount();
    const { switchChain } = useSwitchChain();
    
    const currentId = activeNetworkId || chainId || 1;
    const currentNetwork = NETWORKS.find(n => n.id === currentId) || NETWORKS[0];
    const popularNetworks = NETWORKS.filter(n => n.isPopular);
    const customNetworks = NETWORKS.filter(n => !n.isPopular);
    
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (id: number) => {
        if (onNetworkChange) onNetworkChange(id);
        else if (switchChain) switchChain({ chainId: id });
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block" ref={popoverRef}>
            {/* Trigger Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-black/[0.03] hover:bg-black/[0.06] border border-black/10 px-3 py-1.5 rounded-full transition-colors"
            >
                <div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                    {currentNetwork.icon ? (
                        <img src={currentNetwork.icon} alt={currentNetwork.name} className="w-full h-full object-contain" />
                    ) : (
                        <div className="w-full h-full bg-black/20" />
                    )}
                </div>
                <span className="text-[12px] font-bold text-black font-sans">{currentNetwork.name}</span>
                <ChevronDown size={14} className="text-black/50" />
            </button>

            {/* Dropdown Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full mt-2 left-0 sm:right-0 sm:left-auto w-[320px] bg-white rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-black/5 z-50 overflow-hidden font-sans"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-4 border-b border-black/5">
                            <span className="font-bold text-sm text-black flex-1 text-center pl-6">Select network</span>
                            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-black/5 rounded-md transition-colors">
                                <X size={16} className="text-black/50" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-black/5 px-2">
                            <button 
                                onClick={() => setTab('popular')}
                                className={`flex-1 py-3 text-[13px] font-bold transition-colors relative ${tab === 'popular' ? 'text-black' : 'text-black/50 hover:text-black/80'}`}
                            >
                                Popular
                                {tab === 'popular' && <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-blue-600 rounded-t-md" />}
                            </button>
                            <button 
                                onClick={() => setTab('custom')}
                                className={`flex-1 py-3 text-[13px] font-bold transition-colors relative ${tab === 'custom' ? 'text-black' : 'text-black/50 hover:text-black/80'}`}
                            >
                                Custom
                                {tab === 'custom' && <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-blue-600 rounded-t-md" />}
                            </button>
                        </div>

                        {/* Network List */}
                        <div className="max-h-[380px] overflow-y-auto py-2 custom-scrollbar">
                            {tab === 'popular' && (
                                <button 
                                    className="w-full flex items-center px-4 py-3 hover:bg-black/[0.03] transition-colors"
                                    onClick={() => handleSelect(1)}
                                >
                                    <div className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center mr-3 shrink-0">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                                    </div>
                                    <span className="text-[14px] font-normal text-black flex-1 text-left">Todas las redes populares</span>
                                </button>
                            )}

                            {(tab === 'popular' ? popularNetworks : customNetworks).map(net => (
                                <button 
                                    key={net.id}
                                    onClick={() => handleSelect(net.id)}
                                    className="w-full flex items-center px-4 py-2 hover:bg-black/[0.03] transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 shrink-0 overflow-hidden">
                                        {net.icon ? (
                                            <img src={net.icon} alt={net.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="w-full h-full bg-black/10" />
                                        )}
                                    </div>
                                    <span className="text-[14px] font-medium text-black flex-1 text-left">{net.name}</span>
                                    {currentId === net.id ? (
                                        <Check size={16} className="text-blue-600" />
                                    ) : (
                                        <div className="w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-1 h-1 bg-black/40 rounded-full mx-[1px]" />
                                            <div className="w-1 h-1 bg-black/40 rounded-full mx-[1px]" />
                                            <div className="w-1 h-1 bg-black/40 rounded-full mx-[1px]" />
                                        </div>
                                    )}
                                </button>
                            ))}

                            {tab === 'popular' && (
                                <div className="mt-2">
                                    <div className="flex items-center gap-1 px-4 py-2">
                                        <span className="text-[13px] text-black/50 font-medium">Redes adicionales</span>
                                        <Info size={12} className="text-black/40" />
                                    </div>
                                    {customNetworks.slice(0,3).map(net => (
                                        <button 
                                            key={net.id}
                                            onClick={() => handleSelect(net.id)}
                                            className="w-full flex items-center px-4 py-2 hover:bg-black/[0.03] transition-colors group"
                                        >
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 shrink-0 overflow-hidden bg-black/5">
                                                {net.icon ? (
                                                    <img src={net.icon} alt={net.name} className="w-6 h-6 object-contain" />
                                                ) : (
                                                    <div className="w-full h-full bg-black/10" />
                                                )}
                                            </div>
                                            <span className="text-[14px] font-medium text-black flex-1 text-left">{net.name}</span>
                                            <span className="text-xl font-light text-black/30 group-hover:text-black/60">+</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
