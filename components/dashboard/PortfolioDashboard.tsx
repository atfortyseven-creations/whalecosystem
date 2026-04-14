'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, RefreshCcw, TrendingUp, Wallet, Loader2, PieChart, Activity, Globe, Zap, Eye, ArrowRight, ChevronDown, Check, UserPlus, Github, Twitter } from 'lucide-react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { usePortfolioStore } from '@/lib/portfolio/store';
import { useWalletStore } from '@/lib/store/wallet-store';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useIsMobile';
import { PortfolioSkeleton } from '@/components/ui/skeleton-loader';
import { AnimatedCounter } from '@/components/ui/animated-counter';

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
    
    // Integration with Encrypted Managed Identities
    const { address: sovereignAddress, accounts, switchAccount } = useWalletStore();
    
    // Prioritize: 1. Passed Prop, 2. Web3 Connection, 3. Encrypted Managed Active Account
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
    const [isEyesOff, setIsEyesOff] = useState(false);

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
            <div className="flex flex-col items-center justify-center min-h-[600px] text-center space-y-12 relative overflow-hidden rounded-[2.5rem] border border-black/[0.06] bg-white shadow-xl">
                <img
                    src="/api/checkpoint-image?name=olas-hokusai-4k.png"
                    alt="Hokusai Waves"
                    className="absolute inset-0 w-full h-full object-cover opacity-[0.03] mix-blend-multiply pointer-events-none"
                    style={{ transform: "translateZ(0)", willChange: "transform" }}
                />
                
                <div className="relative z-10">
                    <div className="relative p-10 rounded-full bg-black/5 text-black/20 border border-black/[0.06]">
                        <Wallet size={80} strokeWidth={1.5} />
                    </div>
                </div>
                <div className="space-y-4 max-w-md relative z-10">
                    <h2 className="text-5xl font-black text-black tracking-tighter uppercase leading-none">
                        VAULT ACCESS
                    </h2>
                    <p className="text-black/40 text-sm leading-relaxed font-bold uppercase tracking-widest">
                        Connect your Web3 identity or generate an encrypted wallet to unlock tier-1 portfolio surveillance.
                    </p>
                </div>
                <div className="flex gap-4 relative z-10">
                    <button
                        onClick={() => open()}
                        className="px-10 py-5 bg-black text-white font-black rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-black/20 uppercase tracking-[0.2em] text-[11px]"
                    >
                        CONNECT WALLET
                    </button>
                    <button
                        onClick={() => useWalletStore.getState().createWallet()}
                        className="px-10 py-5 bg-black/5 border border-black/[0.06] text-black/60 font-black rounded-2xl hover:bg-black/10 transition-all uppercase tracking-[0.2em] text-[11px]"
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-black/5 border border-black/[0.08] flex items-center justify-center text-black/40">
                        <PieChart size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-black tracking-tight uppercase">Intelligence Dashboard</h2>
                        <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">Active Identity Monitoring</p>
                    </div>
                </div>

                {/* Account Switcher Pill */}
                <div className="relative">
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
                            <div className="text-[8px] font-mono text-black/30 truncate max-w-[80px]">
                                {effectiveAddress.slice(0, 6)}...{effectiveAddress.slice(-4)}
                            </div>
                        </div>
                        <ChevronDown size={14} className={cn("text-black/20 transition-transform", isSwitcherOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                        {isSwitcherOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full right-0 mt-2 w-64 bg-white border border-black/[0.08] rounded-2xl shadow-2xl z-50 p-2 space-y-1"
                                style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}
                            >
                                <div className="px-3 py-1.5 text-[8px] font-black text-black/25 uppercase tracking-widest">Switch Identity</div>
                                {accounts.map((acc) => (
                                    <button
                                        key={acc.address}
                                        onClick={() => {
                                            switchAccount(acc.address);
                                            setIsSwitcherOpen(false);
                                        }}
                                        className={cn(
                                            "w-full flex items-center justify-between p-2.5 rounded-xl transition-all group",
                                            effectiveAddress.toLowerCase() === acc.address.toLowerCase() ? "bg-black/[0.05] border border-black/[0.08]" : "hover:bg-black/[0.03] border border-transparent"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-[10px] font-black text-black/60">
                                                {acc.address.slice(2, 4).toUpperCase()}
                                            </div>
                                            <div className="text-left">
                                                <div className="text-[10px] font-bold text-black uppercase">{acc.label}</div>
                                                <div className="text-[8px] font-mono text-black/30">{acc.address.slice(0, 6)}...{acc.address.slice(-4)}</div>
                                            </div>
                                        </div>
                                        {effectiveAddress.toLowerCase() === acc.address.toLowerCase() && <Check size={14} className="text-black/40" />}
                                    </button>
                                ))}
                                <div className="h-px bg-black/[0.05] my-1" />
                                <button 
                                    onClick={() => {
                                        useWalletStore.getState().createWallet();
                                        setIsSwitcherOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#00C076]/5 text-[#00C076] transition-all border border-transparent hover:border-[#00C076]/20"
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
                className="relative p-12 rounded-[2.5rem] border border-black/[0.06] overflow-hidden group bg-white shadow-xl"
            >
                <div className="relative z-10 flex justify-between items-start">
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-black/5 border border-black/[0.06]">
                                    <TrendingUp size={16} className="text-black" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-[11px] font-black text-black/30 uppercase tracking-[0.3em]">
                                    DISPOSABLE NET WORTH
                                </h3>
                            </div>
                            <button 
                                onClick={() => setIsEyesOff(!isEyesOff)}
                                className="text-black/20 hover:text-black/60 transition-colors"
                            >
                                <Eye size={16} />
                            </button>
                        </div>
                        
                        <div className="flex items-baseline gap-8">
                            <motion.span 
                                key={isEyesOff ? 'hidden' : totalValue}
                                initial={{ scale: 1.02 }}
                                animate={{ scale: 1 }}
                                className="text-8xl font-black text-black tracking-tighter font-mono flex items-center"
                            >
                                <span className="mr-1 text-[0.8em] text-black/50">$</span>
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
                                    "flex items-center gap-2 px-6 py-2 rounded-full font-black text-lg transition-colors",
                                    isProfit 
                                        ? "bg-[#00C076]/10 text-[#00C076] border border-[#00C076]/20" 
                                        : "bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20"
                                )}
                            >
                                {isProfit ? <ArrowUpRight size={20} strokeWidth={3} /> : <ArrowDownRight size={20} strokeWidth={3} />}
                                {isEyesOff ? "****" : safeToFixed(Math.abs(totalChange24h), 2)}%
                            </motion.div>
                        </div>

                        <div className="flex gap-10 mt-10">
                            <div className="space-y-1">
                                <div className="text-black/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <PieChart size={12} />
                                    ACTIVE ASSETS
                                </div>
                                <div className="text-4xl font-black text-black font-mono flex items-center justify-between gap-4">
                                    {isEyesOff ? "***" : <AnimatedCounter value={assets.length} />}
                                    <div className="w-10 h-10 opacity-30 mt-1">
                                        <svg viewBox="0 0 32 32" className="w-full h-full -rotate-90">
                                            <circle r="16" cx="16" cy="16" fill="#e5e5e5" />
                                            <circle r="16" cx="16" cy="16" fill="black" strokeDasharray="60 100" strokeWidth="32" />
                                            <circle r="16" cx="16" cy="16" fill="#00C076" strokeDasharray="15 100" strokeDashoffset="-60" strokeWidth="32" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="w-px bg-black/[0.06]" />
                            
                            <div className="space-y-1">
                                <div className="text-black/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <Globe size={12} />
                                    NETWORK NODES
                                </div>
                                <div className="text-4xl font-black text-black font-mono">14</div>
                            </div>
                            
                            <div className="w-px bg-black/[0.06]" />
                            
                            <div className="space-y-1">
                                <div className="text-black/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <Activity size={12} />
                                    SYNC STATUS
                                </div>
                                <div className="text-4xl font-black text-[#00C076] font-mono flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#00C076] animate-pulse" />
                                    SYNCED
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => effectiveAddress && fetchPortfolio(effectiveAddress)}
                        className="p-5 hover:bg-black/5 rounded-[1.5rem] transition-all text-black/20 hover:text-black border border-transparent hover:border-black/[0.06] group"
                    >
                        <RefreshCcw size={24} className={cn(isLoading && "animate-spin")} strokeWidth={2.5} />
                    </button>
                </div>
            </motion.div>

            {/* 🔥 ASSET LIST */}
            <div className="relative rounded-[2.5rem] border border-black/[0.06] bg-white shadow-xl overflow-hidden">
                <div className="px-10 py-8 border-b border-black/[0.06] flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-4 bg-[#00C076] rounded-full" />
                            <h4 className="text-xl font-black text-black uppercase tracking-tighter">On-Chain Holdings</h4>
                        </div>
                    </div>
                    <span className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em]">Institutional Feed // Live</span>
                </div>
                
                <div className="divide-y divide-black/[0.03]">
                    {isLoading && assets.length === 0 ? (
                        <div className="p-8">
                            <PortfolioSkeleton />
                        </div>
                    ) : (
                        <>
                        <AnimatePresence mode="popLayout">
                        {assets.map((asset, idx) => {
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
                                        <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg border bg-black/5 border-black/[0.06] text-black/40 group-hover:bg-black group-hover:text-white transition-all">
                                            {asset.symbol.slice(0, 3)}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-lg font-black text-black tracking-tight">{asset.symbol}</div>
                                            <div className="text-[10px] text-black/40 font-bold uppercase tracking-widest">{asset.network}</div>
                                        </div>
                                        <ArrowRight size={18} className="text-black/10 ml-auto mr-6 group-hover:text-[#00F2EA] transition-all" strokeWidth={2.5} />
                                    </div>
                                    
                                    <div className="text-right mx-10 relative z-10">
                                        <div className="text-black font-mono font-black text-3xl tracking-tighter">
                                            {isEyesOff ? "***.**" : `$${safeToLocaleString(asset.value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                        </div>
                                        <div className="text-[10px] text-black/30 font-bold uppercase tracking-widest mt-1">
                                            {isEyesOff ? "**" : safeToFixed(asset.balance, 6)} {asset.symbol}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 relative z-10">
                                        <div className="text-right">
                                            <div className="text-black/40 font-black text-[10px] uppercase tracking-widest">
                                                {formatTXO(effectiveAddress, asset.symbol)}
                                            </div>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-black/5 border border-black/[0.06] flex items-center justify-center group-hover:border-[#D4AF37]/40 transition-all">
                                            <span className="text-black/30 font-black text-xs group-hover:text-[#D4AF37]">{idx + 1}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    
                    {assets.length === 0 && !isLoading && (
                        <div className="py-24 text-center space-y-4">
                            <Eye size={48} className="text-black/10 mx-auto" strokeWidth={1.5} />
                            <p className="text-black/30 text-sm font-bold uppercase tracking-widest">
                                No assets detected for this identity
                            </p>
                        </div>
                    )}
                        </>
                    )}
                </div>
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
                    <div className="max-w-[840px] mx-auto px-8 flex flex-col items-center gap-8 bg-white/40 backdrop-blur-md rounded-3xl py-8 border border-white/40 shadow-2xl">
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
                            <a href="/docs/privacy-policy" className="text-[11px] font-black uppercase tracking-[0.2em] text-[#050505] hover:text-[#00F2EA] transition-colors">Privacy Policy</a>
                            <a href="/docs/terms-of-service" className="text-[11px] font-black uppercase tracking-[0.2em] text-[#050505] hover:text-[#00F2EA] transition-colors">Terms of Service</a>
                            <a href="/docs/risk-disclosure" className="text-[11px] font-black uppercase tracking-[0.2em] text-[#050505] hover:text-[#00F2EA] transition-colors">Risk Disclosure</a>
                            <a href="/docs/cookie-policy" className="text-[11px] font-black uppercase tracking-[0.2em] text-[#050505] hover:text-[#00F2EA] transition-colors">Cookie Policy</a>
                        </div>

                        {/* Copyright */}
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-4 opacity-50 text-black text-center">
                            © {new Date().getFullYear()} Whale Alert Network · All rights reserved
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
}

