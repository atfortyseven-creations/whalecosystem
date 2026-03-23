"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Eye, Settings, ShieldAlert, Fingerprint, Zap, Laptop, MapPin, Smartphone, Globe, Shield, ArrowUpRight, ArrowDownLeft, Lock } from 'lucide-react';
import { useUIStore } from '@/lib/store/ui-store';
import { useSettings } from '@/src/context/SettingsContext';
import useSWR from 'swr';
import { useVIPStore, VIPStoreState, WhaleEvent } from '@/lib/vip-store'; 
import { useAccount } from 'wagmi';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function UtilityPanels() {
    const { activePanel, setActivePanel } = useUIStore();
    const { address } = useAccount();

    const {
        theme, setTheme, currency, setCurrency,
        privacyMode, togglePrivacyMode,
        walletStealthMode, toggleWalletStealthMode,
        hideBalances, toggleHideBalances,
        pushNotifications, togglePushNotifications,
        transactionAlerts, toggleTransactionAlerts,
        autoLockDuration, setAutoLockDuration
    } = useSettings();

    // Data Fetching
    const { data: sessionData, isLoading: sessionsLoading } = useSWR('/api/user/sessions', fetcher);
    const sessions = sessionData?.sessions || [];

    const { data: txData, isLoading: txLoading } = useSWR(address ? `/api/wallet/transactions?authUserId=${address}` : null, fetcher);
    const transactions = txData?.transactions || [];

    if (!activePanel) return null;

    const panels = {
        notifications: (
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-aztec-mono font-black uppercase tracking-[0.2em] text-[var(--aztec-parchment)]">Log Session</h3>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${sessionsLoading ? 'bg-slate-600' : 'bg-[var(--aztec-chartreuse)] animate-pulse shadow-[0_0_10px_var(--aztec-chartreuse)]'}`} />
                        <span className="text-[10px] font-mono font-bold text-[var(--aztec-parchment)]/50 uppercase tracking-widest">{sessionsLoading ? 'Syncing...' : 'Encrypted Connect'}</span>
                    </div>
                </div>
                
                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {sessions.map((session: any) => (
                        <div key={session.id} className={`p-4 border rounded-2xl transition-all group ${session.current ? 'bg-[var(--aztec-orchid)]/10 border-[var(--aztec-orchid)]' : 'bg-white/5 border-white/5 hover:border-[var(--aztec-orchid)]/30'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${session.current ? 'bg-[var(--aztec-orchid)] text-white shadow-[0_0_10px_var(--aztec-orchid)]' : 'bg-white/10 text-white/50'}`}>
                                    {session.current ? 'ACTIVE SESSION' : 'VERIFIED LOG'}
                                </span>
                                <span className="text-[9px] font-mono font-bold text-[var(--aztec-parchment)]/30">
                                    {new Date(session.lastActive).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                                </span>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-xl ${session.current ? 'bg-[var(--aztec-orchid)]/20 text-[var(--aztec-orchid)]' : 'bg-black/50 text-[var(--aztec-parchment)]/40'}`}>
                                    {session.device.toLowerCase().includes('mobile') ? <Smartphone size={14} /> : <Laptop size={14} />}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xs font-black text-[var(--aztec-parchment)] leading-tight">
                                        {session.device} • {session.browser}
                                    </h4>
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={10} className="text-[var(--aztec-parchment)]/40" />
                                            <span className="text-[10px] font-bold text-[var(--aztec-parchment)]/60">{session.location}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Globe size={10} className="text-[var(--aztec-parchment)]/40" />
                                            <span className="text-[10px] font-mono font-bold text-[var(--aztec-orchid)]">{session.ip}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-[var(--aztec-parchment)]/10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-1">
                                    <Clock size={10} className="text-[var(--aztec-parchment)]/40" />
                                    <span className="text-[9px] font-black text-[var(--aztec-parchment)]/40 uppercase tracking-widest font-mono">
                                        {new Date(session.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                </div>
                                <Shield size={12} className="text-[var(--aztec-chartreuse)]" />
                            </div>
                        </div>
                    ))}
                    
                    {!sessionsLoading && sessions.length === 0 && (
                        <div className="py-20 text-center">
                            <Zap size={24} className="mx-auto text-[var(--aztec-parchment)]/20 mb-4 animate-pulse" />
                            <p className="text-[10px] font-black uppercase text-[var(--aztec-parchment)]/30 tracking-widest">No Active Connections</p>
                        </div>
                    )}
                </div>
            </div>
        ),
        history: (
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-aztec-mono font-black uppercase tracking-[0.2em] text-[var(--aztec-chartreuse)]">Global Ledger</h3>
                    <div className="flex items-center gap-2">
                        {address && <span className="px-2 py-0.5 bg-[var(--aztec-chartreuse)]/20 text-[var(--aztec-chartreuse)] font-mono text-[9px] font-black rounded-sm border border-[var(--aztec-chartreuse)]/50 tracking-widest uppercase shadow-[0_0_10px_var(--aztec-chartreuse)]">Connected</span>}
                    </div>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                    {txLoading && (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse bg-white/5 h-16 rounded-2xl border border-white/5" />
                            ))}
                        </div>
                    )}
                    
                    {!txLoading && (!address || transactions.length === 0) && (
                         <div className="text-center py-20 opacity-40">
                              <Zap className="mx-auto mb-4" size={32} />
                              <p className="text-[10px] font-mono uppercase tracking-widest font-black text-white/50">{!address ? 'Awaiting Wallet Connection' : 'No historical signals detected'}</p>
                         </div>
                    )}

                    {!txLoading && transactions.map((tx: any) => (
                        <div key={tx.hash} className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 transition-colors rounded-2xl flex items-center justify-between group">
                            <div className="flex gap-3 items-center">
                                 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'DEPOSIT' || tx.type === 'RECEIVE' ? 'bg-[var(--aztec-chartreuse)]/20 text-[var(--aztec-chartreuse)]' : 'bg-white/10 text-white'}`}>
                                      {tx.type === 'DEPOSIT' || tx.type === 'RECEIVE' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                                 </div>
                                 <div>
                                      <div className="text-sm font-black font-mono tracking-tighter">
                                          {tx.value} <span className="text-[10px] opacity-60 ml-1">{tx.tokenSymbol || 'ETH'}</span>
                                      </div>
                                      <div className="text-[9px] font-mono opacity-40 uppercase tracking-widest mt-0.5 group-hover:text-[var(--aztec-chartreuse)] transition-colors">{tx.hash.slice(0, 10)}...{tx.hash.slice(-4)}</div>
                                 </div>
                            </div>
                            <div className="text-right">
                                 <div className={`text-[9px] font-black uppercase tracking-widest ${tx.status === 'CONFIRMED' || tx.status === 'SUCCESS' ? 'text-[var(--aztec-chartreuse)] shadow-[0_0_10px_var(--aztec-chartreuse)]' : 'text-slate-500'}`}>
                                     {tx.status || 'CONFIRMED'}
                                 </div>
                                 <div className="text-[9px] opacity-40 font-mono mt-1">{new Date(tx.timestamp).toLocaleDateString()}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ),
        privacy: (
            <div className="space-y-6">
                <h3 className="text-sm font-aztec-mono font-black uppercase tracking-[0.2em] text-[var(--aztec-orchid)] flex items-center gap-2">
                    <ShieldAlert size={16} /> Fortress Privacy
                </h3>
                
                <div className="p-6 border border-[var(--aztec-orchid)]/30 rounded-3xl bg-[var(--aztec-orchid)]/10 relative overflow-hidden group mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--aztec-orchid)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-duration-500 pointer-events-none" />
                    <div className="relative z-10">
                        <h4 className="font-aztec-serif font-black text-white text-xl mb-1 italic">Zero-Knowledge Shield</h4>
                        <p className="text-[10px] text-white/50 font-mono uppercase tracking-widest mb-6">Cryptographic blinding of public endpoints</p>

                        <div className="space-y-3">
                            <SettingToggle 
                                label="Balance Obfuscation" 
                                description="Replace numeric wealth with hashes" 
                                active={hideBalances} 
                                onToggle={toggleHideBalances} 
                                color="orchid"
                            />
                            <SettingToggle 
                                label="Node RPC Blinding" 
                                description="Route transactions via Tor relays" 
                                active={privacyMode} 
                                onToggle={togglePrivacyMode} 
                                color="orchid"
                            />
                            <SettingToggle 
                                label="Header Stealth" 
                                description="Disable structural nav detection" 
                                active={walletStealthMode} 
                                onToggle={toggleWalletStealthMode} 
                                color="orchid"
                            />
                        </div>
                    </div>
                </div>
            </div>
        ),
        settings: (
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                    <h3 className="text-sm font-aztec-mono font-black uppercase tracking-[0.2em] text-[var(--aztec-parchment)]">System Core</h3>
                    <Settings size={16} className="text-[var(--aztec-parchment)]/30 animate-spin-slow" />
                </div>

                <div className="space-y-6 max-h-[450px] overflow-y-auto custom-scrollbar pr-2 pb-4">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-aztec-mono font-black text-[var(--aztec-chartreuse)] uppercase tracking-widest drop-shadow-[0_0_8px_var(--aztec-chartreuse)]">Global Architecture</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest font-mono">UI Variables</label>
                                <select 
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value as any)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-[11px] font-black font-mono text-white focus:outline-none focus:border-[var(--aztec-chartreuse)] transition-all uppercase tracking-wider appearance-none"
                                >
                                    <option value="light">Arctic Light</option>
                                    <option value="dark">Void Dark</option>
                                    <option value="auto">System OS</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest font-mono">Fiat Anchor</label>
                                <select 
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value as any)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-[11px] font-black font-mono text-white focus:outline-none focus:border-[var(--aztec-chartreuse)] transition-all uppercase tracking-wider appearance-none"
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-[10px] font-aztec-mono font-black text-[var(--aztec-chartreuse)] uppercase tracking-widest drop-shadow-[0_0_8px_var(--aztec-chartreuse)]">Intelligence Relays</h4>
                        <SettingToggle 
                            label="Push Alerts" 
                            description="Instant browser signal injection" 
                            active={pushNotifications} 
                            onToggle={togglePushNotifications} 
                            color="chartreuse"
                        />
                        <SettingToggle 
                            label="TX Surveillance" 
                            description="Notify on every block inclusion" 
                            active={transactionAlerts} 
                            onToggle={toggleTransactionAlerts} 
                            color="chartreuse"
                        />
                        <div className="pt-4 mt-2 border-t border-white/5 space-y-3">
                             <div className="flex justify-between items-center text-[9px] font-black uppercase text-white/40 font-mono tracking-widest">
                                 <span>Session Timeout Hash</span>
                                 <span className="text-[var(--aztec-chartreuse)]">{autoLockDuration} Min</span>
                             </div>
                             <input 
                                type="range" min="1" max="60" 
                                value={autoLockDuration}
                                onChange={(e) => setAutoLockDuration(Number(e.target.value))}
                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer border-none outline-none" 
                             />
                             <div className="flex justify-between text-[8px] font-bold text-white/20 font-mono">
                                <span>1m</span>
                                <span>60m</span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] pointer-events-none">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setActivePanel(null)}
                    className="absolute inset-0 bg-[var(--aztec-ink)]/60 backdrop-blur-md pointer-events-auto"
                />
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="absolute top-24 right-6 w-[420px] bg-[var(--aztec-ink)]/95 backdrop-blur-3xl border border-[var(--aztec-parchment)]/10 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] p-8 pointer-events-auto overflow-hidden text-[var(--aztec-parchment)] font-sans"
                >
                    <div className="absolute top-0 right-0 p-6 z-50">
                        <button 
                            onClick={() => setActivePanel(null)}
                            className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                        >
                            <X size={14} className="text-white/60" />
                        </button>
                    </div>

                    <div className="relative z-10">
                        {panels[activePanel]}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

function SettingToggle({ label, description, active, onToggle, color = 'chartreuse' }: { label: string, description: string, active: boolean, onToggle: () => void, color?: 'chartreuse' | 'orchid' }) {
    const activeColor = color === 'orchid' ? 'bg-[var(--aztec-orchid)] shadow-[0_0_15px_var(--aztec-orchid)]' : 'bg-[var(--aztec-chartreuse)] shadow-[0_0_15px_var(--aztec-chartreuse)]';
    const activeText = color === 'orchid' ? 'text-[var(--aztec-orchid)]' : 'text-[var(--aztec-chartreuse)]';

    return (
        <div className="flex items-center justify-between p-3.5 bg-black/40 border border-white/5 rounded-2xl hover:border-white/20 transition-all cursor-pointer group" onClick={onToggle}>
            <div>
                <h5 className={`text-[11px] font-black uppercase tracking-widest font-mono transition-colors ${active ? activeText : 'text-white/80 group-hover:text-white'}`}>{label}</h5>
                <p className="text-[9px] text-white/40 font-medium font-sans mt-0.5">{description}</p>
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-all duration-300 border ${active ? 'border-transparent ' + activeColor : 'bg-white/5 border-white/10'}`}>
                <div className={`absolute top-[3px] w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300 ${active ? 'left-[22px]' : 'left-[3px] opacity-60'}`} />
            </div>
        </div>
    );
}

export function $1BWhaleNotification() {
    const whaleEvents = useVIPStore((state: VIPStoreState) => state.whaleEvents);
    const [activeTransfers, setActiveTransfers] = useState<WhaleEvent[]>([]);

    useEffect(() => {
        if (!whaleEvents) return;
        
        const checkWhales = () => {
            const data = whaleEvents.filter(w => w.usdNum >= 1000000000);
            if (data.length > 0) {
                setActiveTransfers(prev => {
                    const existingIds = new Set(prev.map(item => item.id));
                    const newWhales = data.filter(w => !existingIds.has(w.id));
                    if (newWhales.length === 0) return prev;
                    
                    return [...newWhales, ...prev].slice(0, 5);
                });
            }
        };

        const interval = setInterval(checkWhales, 15000); 
        return () => clearInterval(interval);
    }, [whaleEvents]);

    return (
        <div className="fixed bottom-10 right-10 z-[200] flex flex-col gap-4 items-end pointer-events-none">
            <AnimatePresence mode="popLayout">
                {activeTransfers.map((whale) => (
                    <motion.div
                        key={whale.id}
                        layout
                        initial={{ x: 400, opacity: 0, clipPath: 'inset(0% 100% 0% 0%)' }}
                        animate={{ x: 0, opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
                        exit={{ x: 400, opacity: 0, filter: 'blur(10px)' }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="w-[420px] bg-[var(--aztec-ink)] border border-white/10 border-l-4 border-l-[var(--aztec-chartreuse)] p-6 pointer-events-auto relative shadow-2xl"
                    >
                        {/* Static Brutalist Grid Background */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                        
                        <div className="relative z-10 flex flex-col gap-6 h-full">
                            
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="bg-[var(--aztec-chartreuse)] text-black p-2 flex items-center justify-center relative">
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-white" />
                                        <Zap size={16} className="fill-black" />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="font-aztec-mono font-black text-sm text-white tracking-widest uppercase leading-none">
                                            $1B+ TRANSFER DETECTED
                                        </h3>
                                        <div className="text-[10px] font-aztec-mono text-[var(--aztec-parchment)]/50 tracking-[0.2em] mt-1.5 uppercase">
                                            ON-CHAIN SIGNATURE CONFIRMED
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setActiveTransfers(prev => prev.filter(t => t.id !== whale.id))}
                                    className="p-1.5 hover:bg-white/10 transition-colors text-white/40 hover:text-white border border-transparent hover:border-white/20"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            {/* Core Metrics Block */}
                            <div className="bg-black border border-white/10 p-5 space-y-5">
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[10px] font-aztec-mono text-[var(--aztec-orchid)] uppercase tracking-widest">Global Asset Volume</span>
                                    <div className="flex items-baseline gap-3 flex-wrap">
                                        <span className="font-aztec-mono text-3xl font-black text-white tracking-tighter break-all">
                                            {whale.amount}
                                        </span>
                                        <span className="text-xs font-black text-[var(--aztec-chartreuse)] uppercase tracking-widest">{whale.token}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed border-white/10">
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-[9px] font-aztec-mono uppercase text-white/40 tracking-widest flex items-center gap-1.5">
                                            <Globe size={10} /> USD EQUIVALENT
                                        </span>
                                        <span className="font-aztec-mono text-xs font-black text-[var(--aztec-parchment)]">${(whale.usdNum / 1000000000).toFixed(2)}B USD</span>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-[9px] font-aztec-mono uppercase text-white/40 tracking-widest flex items-center gap-1.5">
                                            <Globe size={10} /> EUR EQUIVALENT
                                        </span>
                                        <span className="font-aztec-mono text-xs font-black text-[var(--aztec-parchment)]">€{((whale.usdNum * 0.92) / 1000000000).toFixed(2)}B EUR</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer / Trace */}
                            <div className="flex items-center justify-between border-t border-white/10 pt-5">
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-1.5 text-[9px] font-aztec-mono uppercase text-[var(--aztec-chartreuse)] tracking-widest">
                                        <Fingerprint size={12} /> SENDER TRACE
                                    </div>
                                    <span className="font-aztec-mono text-[11px] text-white/60 bg-white/5 py-1 px-2 border border-white/10">{whale.wallet.slice(0, 16)}...</span>
                                </div>
                                <button className="px-6 py-2.5 bg-[#e0ff00] text-black font-aztec-mono text-[10px] font-black uppercase tracking-widest border border-transparent hover:border-[#e0ff00] hover:bg-black hover:text-[#e0ff00] transition-colors leading-tight text-center">
                                    EXECUTE <br/> AUDIT
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

