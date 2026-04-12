'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, RefreshCcw, TrendingUp, Wallet, Loader2, PieChart, Activity, Globe, Zap, Eye, ArrowRight, ChevronDown, Check, UserPlus } from 'lucide-react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { usePortfolioStore } from '@/lib/portfolio/store';
import { useWalletStore } from '@/lib/store/wallet-store';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useIsMobile';

import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';

// Helper to format wallet address in TXO format
function formatTXO(address: string | undefined, symbol: string): string {
    if (!address) return 'UNKNOWN';
    if (symbol === 'ETH' || symbol === 'MATIC' || symbol === 'BNB') return 'NATIVE COIN';
    return 'ERC-20 TOKEN';
}

export default function PortfolioDashboard({ walletAddress }: { walletAddress?: string }) {
    const { open } = useAppKit();
    const { isConnected: isWeb3Connected, address: web3Address } = useAppKitAccount();
    const isMobile = useIsMobile();
    
    // Integration with Sovereign Managed Identities
    const { address: sovereignAddress, accounts, switchAccount } = useWalletStore();
    
    // Prioritize: 1. Passed Prop, 2. Web3 Connection, 3. Sovereign Managed Active Account
    const effectiveAddress = walletAddress || web3Address || sovereignAddress;
    const isConnected = !!effectiveAddress;

    const { 
        getPortfolio, 
        fetchPortfolio 
    } = usePortfolioStore();

    // Select state based on current address
    const { 
        assets, 
        totalValue, 
        totalChange24h, 
        isLoading 
    } = getPortfolio(effectiveAddress || '');

    const [previousAssets, setPreviousAssets] = useState<string[]>([]);
    const [newAssetIds, setNewAssetIds] = useState<Set<string>>(new Set());
    const [mounted, setMounted] = useState(false);
    const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    // 1. SYNC DATA
    useEffect(() => {
        if (effectiveAddress) {
            fetchPortfolio(effectiveAddress);
            const interval = setInterval(() => fetchPortfolio(effectiveAddress), 30000); 
            return () => clearInterval(interval);
        }
    }, [effectiveAddress, fetchPortfolio]);

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

    const isProfit = totalChange24h >= 0;

    if (!mounted) return null;
    
    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl" />
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full animate-pulse" />
                    <div className="relative p-8 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-blue-400 border border-blue-500/20">
                        <Wallet size={80} strokeWidth={1.5} />
                    </div>
                </div>
                <div className="space-y-3 max-w-md relative">
                    <h2 className="text-4xl font-black text-white tracking-tight bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                        VAULT ACCESS
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium">
                        Connect your Web3 identity or generate a Sovereign wallet to unlock Elite-grade portfolio surveillance.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => open()}
                        className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl"
                    >
                        CONNECT WALLET
                    </button>
                    <button
                        onClick={() => useWalletStore.getState().createWallet()}
                        className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all"
                    >
                        CREATE SOVEREIGN
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full relative space-y-8">
            {/* 🔥 DASHBOARD HEADER & ACCOUNT SWITCHER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <PieChart size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight uppercase">Intelligence Dashboard</h2>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Identity Monitoring</p>
                    </div>
                </div>

                {/* Account Switcher Pill */}
                <div className="relative">
                    <button 
                        onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                        className="flex items-center gap-3 px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
                    >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-black text-white">
                            {effectiveAddress.slice(2, 4).toUpperCase()}
                        </div>
                        <div className="text-left">
                            <div className="text-[10px] font-black text-white tracking-tight truncate max-w-[100px]">
                                {accounts.find(a => a.address.toLowerCase() === effectiveAddress.toLowerCase())?.label || 'External Wallet'}
                            </div>
                            <div className="text-[8px] font-mono text-white/30 truncate max-w-[80px]">
                                {effectiveAddress.slice(0, 6)}...{effectiveAddress.slice(-4)}
                            </div>
                        </div>
                        <ChevronDown size={14} className={cn("text-white/20 transition-transform", isSwitcherOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                        {isSwitcherOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full right-0 mt-2 w-64 bg-[#1a1c24] border border-white/10 rounded-2xl shadow-2xl z-50 p-2 space-y-1"
                            >
                                <div className="px-3 py-1.5 text-[8px] font-black text-white/20 uppercase tracking-widest">Switch Identity</div>
                                {accounts.map((acc) => (
                                    <button
                                        key={acc.address}
                                        onClick={() => {
                                            switchAccount(acc.address);
                                            setIsSwitcherOpen(false);
                                        }}
                                        className={cn(
                                            "w-full flex items-center justify-between p-2.5 rounded-xl transition-all group",
                                            effectiveAddress.toLowerCase() === acc.address.toLowerCase() ? "bg-indigo-500/10 border border-indigo-500/20" : "hover:bg-white/5 border border-transparent"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-white">
                                                {acc.address.slice(2, 4).toUpperCase()}
                                            </div>
                                            <div className="text-left">
                                                <div className="text-[10px] font-bold text-white uppercase">{acc.label}</div>
                                                <div className="text-[8px] font-mono text-white/30">{acc.address.slice(0, 6)}...{acc.address.slice(-4)}</div>
                                            </div>
                                        </div>
                                        {effectiveAddress.toLowerCase() === acc.address.toLowerCase() && <Check size={14} className="text-indigo-400" />}
                                    </button>
                                ))}
                                <div className="h-px bg-white/5 my-1" />
                                <button 
                                    onClick={() => {
                                        useWalletStore.getState().createWallet();
                                        setIsSwitcherOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-500/10 text-emerald-400 transition-all border border-transparent hover:border-emerald-500/20"
                                >
                                    <UserPlus size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">New Identity</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* 🔥 HERO BALANCE CARD */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                    "relative p-10 rounded-3xl border border-white/10 overflow-hidden group",
                    isMobile 
                        ? "bg-slate-900/80" 
                        : "bg-gradient-to-br from-slate-900/50 via-slate-800/30 to-slate-900/50 backdrop-blur-xl"
                )}
            >
                <div className="relative z-10 flex justify-between items-start">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <TrendingUp size={16} className="text-blue-400" strokeWidth={2.5} />
                            </div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.25em]">
                                Total Net Worth
                            </h3>
                        </div>
                        
                        <div className="flex items-baseline gap-6">
                            <motion.span 
                                key={totalValue}
                                initial={{ scale: 1.05 }}
                                animate={{ scale: 1 }}
                                className="text-7xl font-black text-white tracking-tight font-mono"
                            >
                                ${safeToLocaleString(totalValue, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </motion.span>
                            
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-full font-black text-base backdrop-blur-sm",
                                    isProfit 
                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                                )}
                            >
                                {isProfit ? <ArrowUpRight size={18} strokeWidth={3} /> : <ArrowDownRight size={18} strokeWidth={3} />}
                                {safeToFixed(Math.abs(totalChange24h), 2)}%
                            </motion.div>
                        </div>

                        <div className="flex gap-8 mt-8">
                            <div className="space-y-1">
                                <div className="text-gray-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                    <PieChart size={12} />
                                    Active Assets
                                </div>
                                <div className="text-3xl font-black text-white font-mono">{assets.length}</div>
                            </div>
                            
                            <div className="w-px bg-white/10" />
                            
                            <div className="space-y-1">
                                <div className="text-gray-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                    <Globe size={12} />
                                    Networks
                                </div>
                                <div className="text-3xl font-black text-white font-mono">
                                    {new Set(assets.map(a => a.network)).size}
                                </div>
                            </div>

                            <div className="w-px bg-white/10" />
                            
                            <div className="space-y-1">
                                <div className="text-gray-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                    <Activity size={12} />
                                    Sync Status
                                </div>
                                <div className="text-3xl font-black text-emerald-400 font-mono flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    LIVE
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => effectiveAddress && fetchPortfolio(effectiveAddress)}
                        className="p-4 hover:bg-white/5 rounded-2xl transition-all text-gray-400 hover:text-white border border-white/0 hover:border-white/10 group"
                    >
                        <RefreshCcw size={20} className={cn(isLoading && "animate-spin")} strokeWidth={2} />
                    </button>
                </div>
            </motion.div>

            {/* 🔥 ASSET LIST */}
            <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/50 via-slate-800/30 to-slate-900/50 backdrop-blur-xl overflow-hidden">
                <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Activity size={18} className="text-emerald-400" strokeWidth={2.5} />
                            <h4 className="text-base font-black text-white uppercase tracking-widest">On-Chain Holdings</h4>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-tight">Real-Time Oracle Feed</span>
                </div>
                
                <div className="divide-y divide-white/[0.05]">
                    <AnimatePresence mode="popLayout">
                        {assets.map((asset, idx) => {
                            const assetId = `${asset.symbol}-${asset.network}`;
                            const isNew = newAssetIds.has(assetId);
                            
                            return (
                                <motion.div
                                    key={assetId}
                                    initial={isNew ? { opacity: 0, x: -20, backgroundColor: 'rgba(16, 185, 129, 0.1)' } : false}
                                    animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(0, 0, 0, 0)' }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="px-8 py-6 flex items-center justify-between hover:bg-white/[0.02] transition-all group relative cursor-pointer"
                                >
                                    <div className="flex items-center gap-5 relative z-10 flex-1">
                                        <div className="relative w-12 h-12 rounded-xl flex items-center justify-center font-black text-base border-2 bg-blue-500/10 border-blue-500/20 text-blue-400">
                                            {asset.symbol.slice(0, 3)}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-white font-black text-base tracking-tight">{asset.symbol}</div>
                                            <div className="text-xs text-gray-500 font-mono font-bold">{asset.network}</div>
                                        </div>
                                        <ArrowRight size={16} className="text-gray-700 ml-auto mr-4" strokeWidth={2} />
                                    </div>
                                    
                                    <div className="text-right mx-8 relative z-10">
                                        <div className="text-white font-mono font-black text-2xl tracking-tight">
                                            ${safeToLocaleString(asset.value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                        <div className="text-xs text-gray-600 font-mono mt-1">
                                            {safeToFixed(asset.balance, 6)} {asset.symbol}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="text-right space-y-1">
                                            <div className="text-gray-400 font-mono text-sm font-bold">
                                                {formatTXO(effectiveAddress, asset.symbol)}
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                            <span className="text-amber-400 font-black text-xs">{idx + 1}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    
                    {assets.length === 0 && !isLoading && (
                        <div className="py-24 text-center space-y-4">
                            <Eye size={48} className="text-gray-700 mx-auto" strokeWidth={1.5} />
                            <p className="text-gray-600 text-sm font-bold uppercase tracking-widest">
                                No assets detected for this identity
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

