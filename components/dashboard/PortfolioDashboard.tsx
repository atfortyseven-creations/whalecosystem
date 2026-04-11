'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, RefreshCcw, TrendingUp, Wallet, Loader2, PieChart, Activity, Globe, Zap, Eye, ArrowRight } from 'lucide-react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { usePortfolioStore } from '@/lib/portfolio/store';
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
    
    // Prioritize passed address (Added Wallet) over connected Web3 address
    const effectiveAddress = walletAddress || web3Address;
    const isConnected = !!effectiveAddress; // Virtual connection for added wallets

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

    useEffect(() => { setMounted(true); }, []);

    // 1. SYNC DATA
    useEffect(() => {
        if (effectiveAddress) {
            fetchPortfolio(effectiveAddress);
            const interval = setInterval(() => fetchPortfolio(effectiveAddress), 30000); // 30s refresh
            return () => clearInterval(interval);
        }
    }, [effectiveAddress, fetchPortfolio]);

    // 2. DETECT NEW ASSETS FOR ANIMATION (with leak-safe cleanup)
    useEffect(() => {
        const currentAssetIds = assets.map(a => `${a.symbol}-${a.network}`);
        const newIds = currentAssetIds.filter(id => !previousAssets.includes(id));
        
        let clearTimer: ReturnType<typeof setTimeout> | null = null;
        if (newIds.length > 0 && previousAssets.length > 0) {
            setNewAssetIds(new Set(newIds));
            // Clear animation after 3 seconds — MUST be cleaned up on unmount
            clearTimer = setTimeout(() => setNewAssetIds(new Set()), 3000);
        }
        
        setPreviousAssets(currentAssetIds);
        return () => { if (clearTimer) clearTimeout(clearTimer); };
    }, [assets]);

    const isProfit = totalChange24h >= 0;

    // 3. MOUNT & DISCONNECTED STATE
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
                        Connect your Web3 identity to unlock Elite-grade portfolio intelligence and real-time asset surveillance.
                    </p>
                </div>
                <button
                    onClick={() => open()}
                    className="group relative px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:shadow-[0_0_60px_rgba(59,130,246,0.5)]"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity" />
                    <span className="relative">CONNECT WALLET</span>
                </button>
            </div>
        );
    }

    // 4. LOADING STATE — GPU-safe, zero blur filters
    if (isLoading && assets.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-[500px] flex flex-col items-center justify-center rounded-3xl relative overflow-hidden"
                style={{ background: 'rgba(11,14,17,0.97)' }}
            >
                {/* Subtle dot-grid — no blur, no animate-pulse, pure CSS */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.04]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.9) 1px, transparent 0)',
                        backgroundSize: '32px 32px',
                    }}
                />

                {/* Center content */}
                <div className="relative z-10 flex flex-col items-center gap-8 px-8 text-center">
                    {/* Shield icon — CSS border-spin only, zero blur */}
                    <div className="relative w-20 h-20">
                        <div
                            className="absolute inset-0 rounded-full border-2 border-indigo-500/20"
                            style={{ animation: 'spin 3s linear infinite' }}
                        />
                        <div
                            className="absolute inset-2 rounded-full border-2 border-purple-500/30"
                            style={{ animation: 'spin 2s linear infinite reverse' }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M12 2L4 6V12C4 16.418 7.582 20.5 12 22C16.418 20.5 20 16.418 20 12V6L12 2Z"
                                    stroke="rgba(99,102,241,0.9)"
                                    strokeWidth="1.5"
                                    fill="rgba(79,70,229,0.15)"
                                />
                                <path
                                    d="M9 12L11 14L15 10"
                                    stroke="rgba(129,140,248,0.9)"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white/90">
                            SINCRONIZANDO PORTAFOLIO
                        </h2>
                        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-indigo-400/70">
                            MAXIMUM SECURITY ENCRYPTION
                        </p>
                    </div>

                    {/* Progress lines — transform only, no layout triggers */}
                    <div className="w-64 md:w-72 space-y-3">
                        {['Conectando nodos RPC', 'Indexando cadenas', 'Calculando posiciones'].map((label, i) => (
                            <motion.div
                                key={label}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.15 }}
                                className="flex items-center gap-3"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                                <div className="flex-1 h-px bg-white/10 relative overflow-hidden rounded-full">
                                    <motion.div
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-400"
                                        initial={{ width: '0%' }}
                                        animate={{ width: ['0%', '100%', '0%'] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.35, ease: 'easeInOut' }}
                                    />
                                </div>
                                <span className="text-[9px] font-mono text-white/30 uppercase tracking-wider">{label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <style jsx global>{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to   { transform: rotate(360deg); }
                    }
                `}</style>
            </motion.div>
        );
    }

    // 5. MAIN DASHBOARD - LEGENDARY DESIGN
    
    return (
        <div className="w-full relative space-y-8">
            {/* 🔥 HERO BALANCE CARD */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                    "relative p-10 rounded-3xl border border-white/10 overflow-hidden group",
                    isMobile 
                        ? "bg-slate-900/80" // Standard background on mobile
                        : "bg-gradient-to-br from-slate-900/50 via-slate-800/30 to-slate-900/50 backdrop-blur-xl" // Heavy effects on desktop
                )}
            >
                {/* ZERO BLUR ORBS — removed for iPad GPU performance */}
                
                <div className="relative z-10 flex justify-between items-start">
                    <div className="space-y-6">
                        {/* Label */}
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <TrendingUp size={16} className="text-blue-400" strokeWidth={2.5} />
                            </div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.25em]">
                                Total Portfolio Value
                            </h3>
                        </div>
                        
                        {/* Amount */}
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

                        {/* Stats Grid */}
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

                    {/* Refresh Button */}
                    <button
                        onClick={() => effectiveAddress && fetchPortfolio(effectiveAddress)}
                        className="p-4 hover:bg-white/5 rounded-2xl transition-all text-gray-400 hover:text-white border border-white/0 hover:border-white/10 group"
                    >
                        <RefreshCcw size={20} className={cn(isLoading && "animate-spin")} strokeWidth={2} />
                    </button>
                </div>
            </motion.div>

            {/* 🔥 ÚLTIMOS MOVIMIENTOS - WHALE TRACKER STYLE */}
            <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/50 via-slate-800/30 to-slate-900/50 backdrop-blur-xl overflow-hidden">
                {/* Header */}
                <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Activity size={18} className="text-emerald-400" strokeWidth={2.5} />
                            <h4 className="text-base font-black text-white uppercase tracking-widest">Portfolio Holdings</h4>
                        </div>
                        {newAssetIds.size > 0 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black flex items-center gap-1"
                            >
                                <Zap size={12} />
                                Live Update
                            </motion.div>
                        )}
                    </div>
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-tight">Real-Time Oracle Feed</span>
                </div>
                
                {/* Asset List */}
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
                                    transition={{ duration: 0.3 }}
                                    className="px-8 py-6 flex items-center justify-between hover:bg-white/[0.02] transition-all group relative"
                                >
                                    {/* Pulse effect for new items */}
                                    {isNew && (
                                        <motion.div
                                            initial={{ opacity: 1 }}
                                            animate={{ opacity: 0 }}
                                            transition={{ duration: 3 }}
                                            className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent"
                                        />
                                    )}

                                    {/* Left: Icon + Symbol */}
                                    <div className="flex items-center gap-5 relative z-10 flex-1">
                                        <div className="relative">
                                            {isNew && (
                                                <motion.div
                                                    animate={{ scale: [1, 1.3, 1] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"
                                                />
                                            )}
                                            <div className={cn(
                                                "relative w-12 h-12 rounded-xl flex items-center justify-center font-black text-base border-2 transition-all",
                                                isNew 
                                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                                    : "bg-blue-500/10 border-blue-500/20 text-blue-400 group-hover:border-blue-500/40"
                                            )}>
                                                {asset.symbol.slice(0, 3)}
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-1">
                                            <div className="text-white font-black text-base tracking-tight">{asset.symbol}</div>
                                            <div className="text-xs text-gray-500 font-mono font-bold">{asset.network}</div>
                                        </div>

                                        <ArrowRight size={16} className="text-gray-700 ml-auto mr-4" strokeWidth={2} />
                                    </div>
                                    
                                    {/* Center: Value */}
                                    <div className="text-right mx-8 relative z-10">
                                        <motion.div 
                                            key={asset.value}
                                            initial={{ scale: 1.05 }}
                                            animate={{ scale: 1 }}
                                            className="text-white font-mono font-black text-2xl tracking-tight"
                                        >
                                            ${safeToLocaleString(asset.value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </motion.div>
                                        <div className="text-xs text-gray-600 font-mono mt-1">
                                            {safeToFixed(asset.balance, 6)} {asset.symbol}
                                        </div>
                                    </div>

                                    {/* Right: TXO Address */}
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="text-right space-y-1">
                                            <div className="text-gray-400 font-mono text-sm font-bold">
                                                {formatTXO(effectiveAddress, asset.symbol)}
                                            </div>
                                            <div className="text-[10px] text-gray-600 font-mono uppercase tracking-wider">
                                                TYPE・{asset.network}
                                            </div>
                                        </div>
                                        
                                        {/* Badge */}
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
                            <div className="flex justify-center">
                                <div className="p-6 rounded-full bg-gray-800/50">
                                    <Eye size={48} className="text-gray-700" strokeWidth={1.5} />
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm font-bold uppercase tracking-widest">
                                No assets detected on connected chains
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

