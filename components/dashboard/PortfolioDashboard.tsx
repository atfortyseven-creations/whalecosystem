'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, Globe, Zap, Eye, ArrowRight, ChevronDown, Check, UserPlus, Github, Twitter, Copy, ExternalLink, ArrowDownLeft, ArrowLeftRight, Network, X, Loader2 } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { useWalletStore } from '@/lib/store/wallet-store';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useIsMobile';
import { PortfolioSkeleton } from '@/components/ui/skeleton-loader';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { useRealWalletData } from '@/hooks/useRealWalletData';
import ReceiveModal from '@/components/wallet/ReceiveModal';
import UnifiedWalletModal from '@/components/wallet/UnifiedWalletModal';
import { TokenLogo } from '@/components/ui/TokenLogo';
import TransactionHistory from '@/components/wallet/TransactionHistory';
import { useChainId, useChains, useSwitchChain } from 'wagmi';
import { toast } from 'sonner';

import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';

// Helper to format wallet address in TXO format
function formatTXO(address: string, symbol: string | undefined): string {
    const time = new Date().getTime().toString().slice(-4);
    const symStr = typeof symbol === 'string' ? symbol : 'UNK';
    const sym = symStr.substring(0, 3).toUpperCase();
    const addr = typeof address === 'string' && address.length >= 6 ? address.substring(2, 6).toUpperCase() : 'XXXX';
    return `TXO-${addr}-${sym}-${time}`;
}

export default function PortfolioDashboard({ walletAddress }: { walletAddress?: string }) {
    const { open } = useAppKit();
    const { address: web3Address } = useSovereignAccount();
    const isMobile = useIsMobile();

    // ── Real-Time Chain Detection (replaces hardcoded 'Ethereum Mainnet')
    const currentChainId = useChainId();
    const allChains = useChains();
    const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
    const activeChainName = allChains.find(c => c.id === currentChainId)?.name || 'Unknown Network';
    
    // Integration with Encrypted Managed Identities
    const { accounts, switchAccount } = useWalletStore();
    
    // Prioritize: 1. Passed Prop, 2. Unified Connection
    const effectiveAddress = walletAddress || web3Address;
    const isConnected = !!effectiveAddress;

    const {
        assets = [],
        totalBalance: totalValueStr,
        change24hUSD: totalChange24h = 0,
        isLoading
    } = useRealWalletData([], effectiveAddress ?? undefined);

    const totalValue = parseFloat(totalValueStr || '0');

    const [previousAssets, setPreviousAssets] = useState<string[]>([]);
    const [newAssetIds, setNewAssetIds] = useState<Set<string>>(new Set());
    const [mounted, setMounted] = useState(false);
    const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
    const [isEyesOff, setIsEyesOff] = useState(false);
    // Network switcher mini-modal state
    const [isNetworkSwitcherOpen, setIsNetworkSwitcherOpen] = useState(false);
    
    // Modal states
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const [walletModalTab, setWalletModalTab] = useState<"SEND" | "SWAP" | "BRIDGE" | "BUY">("SEND");
    const [isReceiveOpen, setIsReceiveOpen] = useState(false);

    // MetaMask Parity States
    const [activeTab, setActiveTab] = useState<'tokens' | 'activity'>('tokens');
    const [copied, setCopied] = useState(false);

    // Real on-chain network switch handler
    const handleNetworkSwitch = useCallback(async (chainId: number) => {
        try {
            await switchChainAsync({ chainId });
            setIsNetworkSwitcherOpen(false);
            toast.success(`Switched to ${allChains.find(c => c.id === chainId)?.name}`);
        } catch (e: any) {
            toast.error(e.shortMessage || 'Failed to switch network');
        }
    }, [switchChainAsync, allChains]);

    // Real vault account creation handler
    const handleCreateVault = useCallback(async () => {
        try {
            await useWalletStore.getState().createWallet();
            toast.success('New encrypted vault created and activated.');
            setIsSwitcherOpen(false);
        } catch (e: any) {
            toast.error(e.message || 'Failed to create vault.');
        }
    }, []);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(effectiveAddress || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => { setMounted(true); }, []);

    // 2. DETECT NEW ASSETS
    useEffect(() => {
        const currentAssetIds = assets.map(a => `${a.symbol}-${a.network}`);
        const newIds = currentAssetIds.filter(id => !previousAssets.includes(id));
        
        let clearTimer: ReturnType<typeof setTimeout> | null = null;
        if (newIds.length > 0 && previousAssets.length > 0) {
            setNewAssetIds(new Set(newIds));
            clearTimer = setTimeout(() => setNewAssetIds(new Set()), 3000);
        }
        
        setPreviousAssets(currentAssetIds);
        return () => { if (clearTimer) clearTimeout(clearTimer); };
    }, [assets]);

    const displayAssets = isMobile ? assets.slice(0, 100) : assets;

    const isProfit = totalChange24h >= 0;

    if (!mounted) return null;
    
    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] text-center space-y-12 relative overflow-hidden rounded-[2.5rem] border border-black/[0.06] dark:border-white/10 bg-white/80 dark:bg-[#0A0A0A]/40 backdrop-blur-3xl shadow-xl">
                <img
                    src="/api/checkpoint-image?name=olas-hokusai-4k.png"
                    alt="Hokusai Waves"
                    className="absolute inset-0 w-full h-full object-cover opacity-[0.03] dark:opacity-10 mix-blend-multiply pointer-events-none"
                    style={{ transform: "translateZ(0)", willChange: "transform" }}
                />
                
                <div className="relative z-10">
                    <div className="relative p-10 rounded-full bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/40 border border-black/[0.06] dark:border-white/10">
                        <Wallet size={80} strokeWidth={1.5} />
                    </div>
                </div>
                <div className="space-y-4 max-w-md relative z-10">
                    <h2 className="text-5xl font-bold text-[#050505] dark:text-white tracking-tighter uppercase leading-none">
                        SECURE TERMINAL
                    </h2>
                    <p className="text-black/60 dark:text-white/60 text-sm leading-relaxed font-bold uppercase tracking-widest">
                        Connect your Web3 identity or generate an encrypted wallet to unlock tier-1 portfolio surveillance.
                    </p>
                </div>
                <div className="flex gap-4 relative z-10">
                    <button
                        onClick={() => open()}
                        className="px-10 py-5 bg-[#050505] dark:bg-white text-white dark:text-[#050505] font-black rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl uppercase tracking-[0.2em] text-[11px]"
                    >
                        CONNECT WALLET
                    </button>
                    <button
                        onClick={() => useWalletStore.getState().createWallet()}
                        className="px-10 py-5 bg-black/5 dark:bg-white/5 border border-black/[0.06] dark:border-white/10 text-[#050505]/60 dark:text-white/60 font-black rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 transition-all uppercase tracking-[0.2em] text-[11px]"
                    >
                        CREATE VAULT
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full relative space-y-8">
            {/* 🔥 DASHBOARD HEADER & ACCOUNT SWITCHER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                {/* Real-time chain indicator with network switcher */}
                <div className="relative">
                    <button
                        onClick={() => setIsNetworkSwitcherOpen(!isNetworkSwitcherOpen)}
                        className="flex items-center gap-3 bg-white/50 dark:bg-black/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-black/[0.05] shadow-sm hover:bg-white/70 transition-all"
                    >
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                        <span className="text-sm font-black text-[#050505] dark:text-white uppercase tracking-tight">{activeChainName}</span>
                        <ChevronDown size={14} className={cn("text-black/40 transition-transform", isNetworkSwitcherOpen && "rotate-180")} />
                    </button>
                    <AnimatePresence>
                        {isNetworkSwitcherOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                className="absolute top-full left-0 mt-2 w-64 bg-white border border-black/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                            >
                                <div className="px-4 py-3 border-b border-black/5 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-black/50 uppercase tracking-widest">Switch Network</span>
                                    <button onClick={() => setIsNetworkSwitcherOpen(false)} className="text-black/30 hover:text-black transition-colors"><X size={14} /></button>
                                </div>
                                {allChains.map(chain => (
                                    <button
                                        key={chain.id}
                                        onClick={() => handleNetworkSwitch(chain.id)}
                                        disabled={isSwitchingChain}
                                        className={cn(
                                            "w-full text-left px-4 py-3 flex items-center justify-between text-[11px] font-black uppercase tracking-widest transition-colors",
                                            chain.id === currentChainId ? "bg-black/5 text-black" : "text-black/50 hover:bg-black/[0.03] hover:text-black"
                                        )}
                                    >
                                        {chain.name}
                                        {chain.id === currentChainId && <Check size={14} className="text-emerald-500" />}
                                        {isSwitchingChain && chain.id !== currentChainId && <Loader2 size={14} className="animate-spin opacity-30" />}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Account Switcher Pill */}
                <div className="relative z-50">
                    <button 
                        onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                        className="flex items-center gap-3 px-4 py-2.5 bg-black/[0.04] border border-black/[0.08] rounded-2xl hover:bg-black/[0.07] transition-all group"
                    >
                        <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-[10px] font-black text-white">
                            {effectiveAddress.slice(2, 4).toUpperCase()}
                        </div>
                        <div className="text-left">
                            <div className="text-[10px] font-black text-black tracking-tight truncate max-w-[100px]">
                                {accounts.find(a => a.address.toLowerCase() === effectiveAddress.toLowerCase())?.label || 'External Wallet'}
                            </div>
                            <div className="text-[8px] font-mono text-black/60 truncate max-w-[80px]">
                                {effectiveAddress.slice(0, 6)}...{effectiveAddress.slice(-4)}
                            </div>
                        </div>
                        <ChevronDown size={14} className={cn("text-black/50 transition-transform ml-2", isSwitcherOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                        {isSwitcherOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full right-0 mt-2 w-72 bg-white border border-black/[0.08] rounded-3xl shadow-2xl z-50 p-3 space-y-1 overflow-hidden"
                                style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}
                            >
                                <div className="flex items-center justify-between px-3 py-2">
                                    <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">Select Account</span>
                                </div>
                                {accounts.map((acc) => (
                                    <button
                                        key={acc.address}
                                        onClick={() => {
                                            switchAccount(acc.address);
                                            setIsSwitcherOpen(false);
                                        }}
                                        className={cn(
                                            "w-full flex items-center justify-between p-3 rounded-2xl transition-all group",
                                            effectiveAddress.toLowerCase() === acc.address.toLowerCase() ? "bg-black/[0.05] border border-black/[0.08] shadow-sm" : "hover:bg-black/[0.03] border border-transparent"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1F1F1F] to-black flex items-center justify-center text-xs font-black text-white shadow-inner">
                                                {acc.address.slice(2, 4).toUpperCase()}
                                            </div>
                                            <div className="text-left">
                                                <div className="text-sm font-black text-black tracking-tight">{acc.label}</div>
                                                <div className="text-[10px] font-mono text-black/50 font-bold">{acc.address.slice(0, 6)}...{acc.address.slice(-4)}</div>
                                            </div>
                                        </div>
                                        {effectiveAddress.toLowerCase() === acc.address.toLowerCase() && <Check size={16} className="text-[#00C076]" />}
                                    </button>
                                ))}
                                
                                <div className="h-px bg-black/[0.05] my-2 mx-2" />
                                
                                <div className="grid grid-cols-2 gap-2 p-1">
                                    <button 
                                        onClick={handleCopy}
                                        className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl hover:bg-black/5 text-black/60 hover:text-black transition-all"
                                    >
                                        {copied ? <Check size={16} className="text-[#00C076]" /> : <Copy size={16} />}
                                        <span className="text-[9px] font-black uppercase tracking-widest">{copied ? 'Copied' : 'Copy'}</span>
                                    </button>
                                    <a 
                                        href={`https://etherscan.io/address/${effectiveAddress}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl hover:bg-black/5 text-black/60 hover:text-black transition-all"
                                    >
                                        <ExternalLink size={16} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Explorer</span>
                                    </a>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* 🔥 HERO BALANCE CARD */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] border border-black/[0.06] dark:border-white/10 overflow-hidden group bg-white/80 dark:bg-[#111111]/40 backdrop-blur-3xl shadow-xl mx-4 md:mx-0"
            >
                <div className="relative z-10 flex justify-between items-start">
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-black/5 border border-black/[0.06]">
                                    <TrendingUp size={16} className="text-black" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-[11px] font-bold text-black/70 uppercase tracking-[0.2em]">
                                    LIQUID CAPITAL
                                </h3>
                            </div>
                            <button 
                                onClick={() => setIsEyesOff(!isEyesOff)}
                                className="text-black/50 hover:text-black/60 transition-colors"
                            >
                                <Eye size={16} />
                            </button>
                        </div>
                        
                        <div className="flex items-baseline gap-8">
                            <motion.span 
                                key={isEyesOff ? 'hidden' : totalValue}
                                initial={{ scale: 1.02 }}
                                animate={{ scale: 1 }}
                                className="text-4xl md:text-7xl font-bold text-[#050505] dark:text-white tracking-tighter font-mono flex items-center flex-wrap"
                                data-balance
                            >
                                <span className="mr-1 text-[0.8em] text-black/50 dark:text-white/50">$</span>
                                {isEyesOff ? (
                                    <span>******</span>
                                ) : (
                                    <AnimatedCounter 
                                        value={totalValue} 
                                        format={(val) => safeToLocaleString(val, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                                    />
                                )}
                            </motion.span>
                            
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2 rounded font-bold text-lg transition-colors",
                                    isProfit 
                                        ? "bg-[#00C076]/10 text-[#00C076] border border-[#00C076]/20" 
                                        : "bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20"
                                )}
                                data-balance
                            >
                                {isProfit ? <ArrowUpRight size={20} strokeWidth={3} /> : <ArrowDownRight size={20} strokeWidth={3} />}
                                {isEyesOff ? "****" : safeToFixed(Math.abs(totalChange24h), 2)}%
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* 🔥 ON-CHAIN ACTION BUTTONS - CENTER WRAP RESPONSIVE GRID STYLE */}
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 mt-12 relative z-10 w-full py-2">
                    <ActionButton 
                        icon={<ArrowUpRight size={20} />} 
                        label="Send" 
                        onClick={() => { setWalletModalTab("SEND"); setIsWalletModalOpen(true); }} 
                        primary
                    />
                    <ActionButton 
                        icon={<ArrowDownLeft size={20} />} 
                        label="Receive" 
                        onClick={() => setIsReceiveOpen(true)} 
                    />
                    <ActionButton 
                        icon={<ArrowLeftRight size={20} />} 
                        label="Swap" 
                        onClick={() => { setWalletModalTab("SWAP"); setIsWalletModalOpen(true); }} 
                    />
                    <ActionButton 
                        icon={<Globe size={20} />} 
                        label="Bridge" 
                        onClick={() => { setWalletModalTab("BRIDGE"); setIsWalletModalOpen(true); }} 
                    />
                    <ActionButton 
                        icon={<Zap size={20} />} 
                        label="Buy" 
                        onClick={() => { setWalletModalTab("BUY"); setIsWalletModalOpen(true); }} 
                    />
                    <ActionButton 
                        icon={<Network size={20} />} 
                        label="Network" 
                        onClick={() => setIsNetworkSwitcherOpen(true)} 
                    />
                    <ActionButton 
                        icon={<UserPlus size={20} />} 
                        label="New Account" 
                        onClick={handleCreateVault} 
                    />
                </div>
            </motion.div>

            {/* 🔥 TABS: TOKENS | ACTIVITY */}
            <div className="w-full max-w-[1400px] mx-auto px-2">
                <div className="flex items-center gap-8 border-b border-black/[0.06] dark:border-white/10 mb-6">
                    <button
                        onClick={() => setActiveTab('tokens')}
                        className={cn(
                            "pb-4 text-sm font-black uppercase tracking-widest transition-all border-b-2",
                            activeTab === 'tokens' ? "text-[#050505] border-[#050505]" : "text-black/40 border-transparent hover:text-black/70"
                        )}
                    >
                        Tokens
                    </button>
                    <button
                        onClick={() => setActiveTab('activity')}
                        className={cn(
                            "pb-4 text-sm font-black uppercase tracking-widest transition-all border-b-2",
                            activeTab === 'activity' ? "text-[#050505] border-[#050505]" : "text-black/40 border-transparent hover:text-black/70"
                        )}
                    >
                        Activity
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'tokens' ? (
                        <motion.div
                            key="tokens"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white/80 dark:bg-[#111111]/40 backdrop-blur-3xl rounded-[2.5rem] border border-black/[0.06] dark:border-white/10 shadow-xl overflow-hidden"
                        >
                <div className="px-10 py-8 border-b border-black/[0.06] dark:border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-4 bg-[#00C076] rounded-full" />
                            <h4 className="text-lg font-bold text-[#050505] dark:text-white uppercase tracking-[0.1em]">ON-CHAIN HOLDINGS</h4>
                        </div>
                    </div>
                    <span className="text-[10px] font-black text-black/50 uppercase tracking-[0.3em]">Institutional Feed // Live</span>
                </div>
                
                <div className="divide-y divide-black/[0.03]">
                    {isLoading && displayAssets.length === 0 ? (
                        <div className="p-8">
                            <PortfolioSkeleton />
                        </div>
                    ) : (
                        <>
                        <AnimatePresence mode="popLayout">
                        {displayAssets.map((asset, idx) => {
                            const assetId = `${asset.symbol}-${asset.network}`;
                            const isNew = newAssetIds.has(assetId);
                            
                            return (
                                <motion.div
                                    key={assetId}
                                    initial={isNew ? { opacity: 0, x: -20, backgroundColor: 'rgba(0, 192, 118, 0.05)' } : false}
                                    animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(255, 255, 255, 1)' }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="px-10 py-8 flex items-center justify-between hover:bg-black/[0.01] transition-all group relative cursor-pointer"
                                >
                                    <div className="flex items-center gap-6 relative z-10 flex-1">
                                        <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center border bg-black/5 dark:bg-white/5 border-black/[0.06] dark:border-white/10 group-hover:bg-[#050505] group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-[#050505] transition-all overflow-hidden">
                                            <TokenLogo 
                                                symbol={asset.symbol || ''} 
                                                address={asset.address} 
                                                logoURI={asset.logoURI} 
                                                className="w-8 h-8 rounded-full" 
                                                fallbackClassName="w-full h-full rounded-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-lg font-black text-[#050505] dark:text-white tracking-tight">{asset.symbol || 'Unknown'}</div>
                                            <div className="text-[10px] text-black/70 dark:text-white/40 font-bold uppercase tracking-widest">{asset.network}</div>
                                        </div>
                                        <ArrowRight size={18} className="text-black/10 dark:text-white/10 ml-auto mr-6 group-hover:text-[#00F2EA] transition-all" strokeWidth={2.5} />
                                    </div>
                                    
                                    <div className="text-right mx-10 relative z-10">
                                        <div className="text-[#050505] dark:text-white font-mono font-black text-3xl tracking-tighter" data-balance>
                                            {isEyesOff ? "***.**" : `$${safeToLocaleString(asset.valueUSD || 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                        </div>
                                        <div className="text-[10px] text-black/60 font-bold uppercase tracking-widest mt-1" data-balance>
                                            {isEyesOff ? "**" : safeToFixed(asset.balanceNumeric || asset.balance || 0, 6)} {asset.symbol}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 relative z-10">
                                        <div className="text-right">
                                            <div className="text-black/70 font-black text-[10px] uppercase tracking-widest">
                                                {formatTXO(effectiveAddress, asset.symbol)}
                                            </div>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-black/5 border border-black/[0.06] flex items-center justify-center group-hover:border-[#D4AF37]/40 transition-all">
                                            <span className="text-black/60 font-black text-xs group-hover:text-[#D4AF37]">{idx + 1}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    
                    {displayAssets.length === 0 && !isLoading && (
                        <div className="py-24 text-center space-y-4">
                            <Eye size={48} className="text-black/10 mx-auto" strokeWidth={1.5} />
                            <p className="text-black/60 text-sm font-bold uppercase tracking-widest">
                                No assets detected for this identity
                            </p>
                        </div>
                    )}
                        </>
                    )}
                </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="activity"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white/80 dark:bg-[#111111]/40 backdrop-blur-3xl rounded-[2.5rem] border border-black/[0.06] dark:border-white/10 shadow-xl overflow-hidden min-h-[600px] p-6"
                        >
                            <TransactionHistory authUserId={effectiveAddress} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── UNIFIED WAVE & DOWNHEAD FOOTER ── */}
            <div className="relative w-full min-h-[500px] flex flex-col justify-end overflow-hidden pt-32 mt-16 rounded-[2.5rem] border border-black/5" style={{ background: '#FAF9F6' }}>
                {/* Massive Wave Background */}
                <img 
                    src="/olas-hokusai-4k.png" 
                    alt="The Great Wave" 
                    className="absolute bottom-0 left-0 w-full h-[120%] object-cover object-bottom opacity-95 z-0"
                    style={{ transform: "translateZ(0)", willChange: "transform" }}
                />
                
                {/* Protective Top Fades */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#FAF9F6] via-transparent to-transparent z-[1]" />
                
                {/* Footer Real Estate */}
                <footer className="relative z-10 w-full pb-12 pt-32 mt-auto">
                    <div className="max-w-[840px] mx-auto px-8 flex flex-col items-center gap-8 bg-white/80 backdrop-blur-md rounded-3xl py-8 border border-white/40 shadow-2xl">
                        {/* Social and Central Whale */}
                        <div className="flex items-center justify-center gap-8">
                            <a href="https://twitter.com/WhaleAlertNetwork" target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/50 border border-black/10 rounded-2xl flex items-center justify-center hover:bg-white transition-all shadow-sm">
                                <Twitter size={20} style={{ color: '#050505', opacity: 0.8 }} />
                            </a>
                            <div className="w-16 h-16 flex items-center justify-center bg-white/60 rounded-3xl shadow-lg border border-white/50">
                                <img src="/official-whale-monochrome.png" className="w-10 h-10 opacity-100" alt="Whale" />
                            </div>
                            <a href="https://github.com/atfortyseven-creations/whalecosystem" target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/50 border border-black/10 rounded-2xl flex items-center justify-center hover:bg-white transition-all shadow-sm">
                                <Github size={20} style={{ color: '#050505', opacity: 0.8 }} />
                            </a>
                        </div>

                        {/* Legal links */}
                        <div className="flex flex-wrap justify-center gap-8 items-center mt-4">
                            <a href="/docs/legal/privacy-policy" className="text-[11px] font-black uppercase tracking-[0.2em] text-[#050505] hover:text-[#00F2EA] transition-colors">Privacy Policy</a>
                            <a href="/docs/legal/terms-of-service" className="text-[11px] font-black uppercase tracking-[0.2em] text-[#050505] hover:text-[#00F2EA] transition-colors">Terms of Service</a>
                            <a href="/docs/legal/risk-disclosure" className="text-[11px] font-black uppercase tracking-[0.2em] text-[#050505] hover:text-[#00F2EA] transition-colors">Risk Disclosure</a>
                            <a href="/docs/legal/cookie-policy" className="text-[11px] font-black uppercase tracking-[0.2em] text-[#050505] hover:text-[#00F2EA] transition-colors">Cookie Policy</a>
                        </div>

                        {/* Copyright */}
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-4 opacity-50 text-black text-center">
                            © {new Date().getFullYear()} Whale Alert Network · All rights reserved
                        </p>
                    </div>
                </footer>
            </div>
            
            {/* Modal Integrations */}
            <UnifiedWalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} initialTab={walletModalTab} userAssets={assets} />
            <ReceiveModal isOpen={isReceiveOpen} onClose={() => setIsReceiveOpen(false)} userAssets={assets} />
        </div>
    );
}

function ActionButton({ icon, label, onClick, primary = false }: { icon: React.ReactNode, label: string, onClick: () => void, primary?: boolean }) {
    return (
        <div className="flex flex-col items-center gap-3">
            <button
                onClick={onClick}
                className={cn(
                    "w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 group",
                    primary 
                        ? "bg-[#050505] text-white hover:bg-black/80" 
                        : "bg-white/90 text-[#050505] hover:bg-white border border-black/[0.05]"
                )}
            >
                <div className="group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                    {icon}
                </div>
            </button>
            <span className="text-[11px] font-black text-[#050505] uppercase tracking-widest">{label}</span>
        </div>
    );
}

