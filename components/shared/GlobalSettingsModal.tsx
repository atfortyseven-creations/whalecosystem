"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/lib/store/useSettingsStore';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { 
    X, LogOut, AlertTriangle, EyeOff, Volume2, Box, Cpu, HardDrive,
    Landmark, Monitor, Zap, Network, Shield, Fingerprint, Lock, 
    ActivitySquare, Crosshair, BarChart2, Radio, Server, CheckCircle
} from 'lucide-react';
import { useSovereignSignOut } from '@/hooks/useSovereignSignOut';

type TabKey = 'general' | 'network' | 'sonar' | 'privacy' | 'execution' | 'display';

export function GlobalSettingsModal() {
    const { 
        theme, currency, layoutDensity, testnetMode,
        audioAlerts, 
        stealthMode, showBalances, allowAnalytics, autoDisconnectTimer,
        hardwareAcceleration, isSettingsOpen,
        
        setCurrency, setLayoutDensity, setTestnetMode,
        setAudioAlerts, 
        setStealthMode, setShowBalances, setAllowAnalytics, setAutoDisconnectTimer,
        setHardwareAcceleration, setSettingsOpen, clearAppData
    } = useSettingsStore();

    // Wrapped setters that also fire a confirmation toast
    const set = <T,>(fn: (v: T) => void, label: string) => (v: T) => {
        fn(v);
        toast.success(`${label} updated`, { duration: 1800, position: 'bottom-right' });
    };

    const { nuclearDisconnect } = useSovereignSignOut();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<TabKey>('general');
    const [confirmDisconnect, setConfirmDisconnect] = useState(false);
    
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    const handleDisconnect = async () => {
        setConfirmDisconnect(false);
        setSettingsOpen(false);
        await nuclearDisconnect();
    };

    return (
        <AnimatePresence>
            {isSettingsOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setSettingsOpen(false)}
                        className="fixed inset-0 bg-[#0A0A0A]/60 backdrop-blur-sm z-[100]"
                    />

                    <motion.div
                        initial={{ x: '100%', opacity: 0.5 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0.5 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-4xl bg-[#FAF9F6] border-l border-[#E5E5E5] z-[101] shadow-2xl flex flex-col md:flex-row overflow-hidden"
                    >
                        <div className="md:w-[280px] bg-white border-r border-[#E5E5E5] flex flex-col h-full shrink-0">
                            <div className="flex items-center gap-3 p-6 border-b border-[#E5E5E5]">
                                <div className="w-8 h-8 rounded-lg bg-[#050505] flex items-center justify-center">
                                    <Cpu size={16} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-[12px] font-black text-[#050505] uppercase tracking-widest">Settings</h2>
                                    <p className="text-[9px] text-[#888888] font-mono">Core Parameters</p>
                                </div>
                                <button onClick={() => setSettingsOpen(false)} className="md:hidden ml-auto p-2"><X size={18} /></button>
                            </div>

                            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                                <TabButton id="general" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Box size={14}/>} label="1. General Settings" />
                                <TabButton id="network" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Network size={14}/>} label="2. Network & RPC" />
                                <TabButton id="sonar" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Volume2 size={14}/>} label="3. Sonar Alerts" />
                                <TabButton id="privacy" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Shield size={14}/>} label="4. Privacy & Security" />
                                <TabButton id="execution" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Zap size={14}/>} label="5. Execution Rules" />
                                <TabButton id="display" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Monitor size={14}/>} label="6. Display & Hardware" />
                            </nav>
                            <div className="p-4 border-t border-[#E5E5E5] bg-[#FAF9F6]">
                                <span className="text-[9px] font-bold text-[#888888] uppercase tracking-widest leading-relaxed">
                                    Sovereign Version 3.1.5<br/>Connected to Core Network
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto relative h-full"> 
                            <button onClick={() => setSettingsOpen(false)} className="hidden md:flex absolute top-6 right-6 p-2 bg-white border border-[#E5E5E5] rounded-full hover:bg-black/5 transition-colors z-10">
                                <X size={16} className="text-black" />
                            </button>

                            <div className="p-8 pb-32 max-w-2xl">
                                <AnimatePresence mode="wait">
                                    
                                    {activeTab === 'general' && (
                                        <TabContentWrapper key="general">
                                            <SectionTitle title="General Settings" subtitle="Control the terminal's core localization and environment." />
                                            <div className="space-y-4">
                                                {/* 1 */}
                                                <div className="p-4 bg-white border border-[#E5E5E5] mb-2 rounded-xl">
                                                    <label className="text-[10px] font-black uppercase text-[#888888] tracking-widest mb-3 block">Theme System (Locked)</label>
                                                    <div className="flex items-center gap-2 px-3 py-2 bg-[#FAF9F6] border border-[#E5E5E5] rounded-lg">
                                                        <Shield size={12} className="text-black/40" />
                                                        <span className="text-[11px] font-bold uppercase tracking-wider text-black opacity-50">Sovereign Ivory Mode Only</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    {/* 2 */}
                                                    <div className="flex-1 p-4 bg-white border border-[#E5E5E5] rounded-xl">
                                                        <label className="text-[10px] font-black uppercase text-[#888888] tracking-widest mb-3 block">Base Currency</label>
                                                         <SelectBox value={currency} onChange={(e) => set(setCurrency, 'Currency')(e.target.value as any)}>
                                                            <option value="USD">USD — US Dollar</option>
                                                            <option value="EUR">EUR — Euro</option>
                                                            <option value="GBP">GBP — British Pound</option>
                                                            <option value="CHF">CHF — Swiss Franc</option>
                                                        </SelectBox>
                                                    </div>
                                                </div>
                                                {/* 4 */}
                                                <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                       <div className="p-2 border border-[#E5E5E5] bg-[#FAF9F6] rounded"><ActivitySquare size={14}/></div>
                                                       <div>
                                                         <span className="text-[11px] font-black text-[#050505] uppercase tracking-wider block">UI Density</span>
                                                         <span className="text-[10px] text-[#888888] block mt-1">Component spacing</span>
                                                       </div>
                                                    </div>
                                                    <div className="flex bg-[#FAF9F6] border border-[#E5E5E5] rounded-lg p-1">
                                                        {(['relaxed', 'compact', 'dense'] as const).map(d => (
                                                            <button key={d} onClick={() => { setLayoutDensity(d); toast.success(`Density: ${d}`, { duration: 1600, position: 'bottom-right' }); }} className={`px-3 py-1 rounded text-[9px] font-black uppercase transition-all ${layoutDensity === d ? 'bg-black text-white shadow' : 'text-[#888888] hover:text-black'}`}>{d}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </TabContentWrapper>
                                    )}

                                    {activeTab === 'network' && (
                                        <TabContentWrapper key="network">
                                            <SectionTitle title="Network Intelligence" subtitle="Configure Web3 providers and fallback rules." />
                                            <div className="space-y-4">
                                                {/* 5 */}
                                                <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl flex items-center justify-between">
                                                    <div>
                                                        <span className="text-[11px] font-black text-[#050505] uppercase tracking-wider block flex items-center gap-2">Testnet Analytics <span className="text-[8px] px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-black tracking-widest">RELOAD</span></span>
                                                        <span className="text-[10px] text-[#888888] block mt-1">Index Sepolia/Goerli</span>
                                                    </div>
                                                    <Toggle enabled={testnetMode} setEnabled={(v) => { setTestnetMode(v); toast.success(`Testnet mode ${v ? 'enabled' : 'disabled'} — reload to apply`, { duration: 3000, position: 'bottom-right' }); }} />
                                                </div>
                                            </div>
                                        </TabContentWrapper>
                                    )}

                                    {activeTab === 'sonar' && (
                                        <TabContentWrapper key="sonar">
                                            <SectionTitle title="Sonar Configuration" subtitle="Define limits for whale transaction tracking." />
                                            <div className="space-y-4">
                                                {/* 8 */}
                                                <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                       <div className="p-2 border border-[#E5E5E5] bg-[#FAF9F6] rounded"><Volume2 size={14}/></div>
                                                       <div>
                                                           <span className="text-[11px] font-black text-[#050505] uppercase tracking-wider block">Radar Audio Alerts</span>
                                                           <span className="text-[10px] text-[#888888] block mt-1">Play beep on trigger</span>
                                                       </div>
                                                    </div>
                                                    <Toggle enabled={audioAlerts} setEnabled={(v) => { setAudioAlerts(v); toast.success(`Audio alerts ${v ? 'enabled' : 'muted'}`, { duration: 1800, position: 'bottom-right' }); }} />
                                                </div>
                                            </div>
                                        </TabContentWrapper>
                                    )}

                                    {activeTab === 'privacy' && (
                                        <TabContentWrapper key="privacy">
                                            <SectionTitle title="Privacy & Security" subtitle="Local institutional barriers & cache management." />
                                            <div className="space-y-4">
                                                {/* 11 */}
                                                <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-black rounded"><EyeOff size={14} className="text-white" /></div>
                                                        <div><span className="text-[11px] font-black text-[#050505] uppercase tracking-wider block">Stealth Mode</span><span className="text-[10px] text-[#888888] block mt-1">Blur all balance values (hover to reveal)</span></div>
                                                    </div>
                                                    <Toggle enabled={stealthMode} setEnabled={(v) => { setStealthMode(v); toast.success(`Stealth mode ${v ? 'on — balances blurred' : 'off'}`, { duration: 2000, position: 'bottom-right' }); }} />
                                                </div>
                                                {/* 12 */}
                                                <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 border border-[#E5E5E5] rounded"><LogOut size={14} className="text-black" /></div>
                                                        <div><span className="text-[11px] font-black text-[#050505] uppercase tracking-wider block">Show Balances</span><span className="text-[10px] text-[#888888] block mt-1">Display balances on load</span></div>
                                                    </div>
                                                    <Toggle enabled={showBalances} setEnabled={(v) => { setShowBalances(v); toast.success(`Balances ${v ? 'visible' : 'hidden'}`, { duration: 1800, position: 'bottom-right' }); }} />
                                                </div>
                                                {/* 13 */}
                                                <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 border border-[#E5E5E5] rounded"><Shield size={14} className="text-black" /></div>
                                                        <div><span className="text-[11px] font-black text-[#050505] uppercase tracking-wider block">Analytics Sharing</span><span className="text-[10px] text-[#888888] block mt-1">Send diagnostic errors</span></div>
                                                    </div>
                                                    <Toggle enabled={allowAnalytics} setEnabled={(v) => { setAllowAnalytics(v); toast.success(`Analytics ${v ? 'enabled' : 'disabled'}`, { duration: 1800, position: 'bottom-right' }); }} />
                                                </div>
                                                {/* 14 (Action) */}
                                                <div className="pt-4 border-t border-[#E5E5E5]">
                                                    <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl flex items-center justify-between">
                                                       <div className="flex items-center gap-3"><div className="p-2 border border-[#E5E5E5] rounded bg-[#FAF9F6]"><HardDrive size={14}/></div><div><span className="text-[11px] font-black text-[#050505] uppercase tracking-wider block">Clear Terminal Cache</span><span className="text-[10px] text-[#888888] block mt-1">Purge graph queries & cache</span></div></div>
                                                       <button onClick={() => { if(confirm("Purge application cache?")) clearAppData(); }} className="px-4 py-2 border border-[#FF3B30] text-[#FF3B30] text-[9px] font-black uppercase rounded-lg hover:bg-[#FF3B30] hover:text-white transition-all">Purge</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabContentWrapper>
                                    )}

                                    {activeTab === 'execution' && (
                                        <TabContentWrapper key="execution">
                                            <SectionTitle title="Execution Rules" subtitle="Automated trading guardrails and gas constraints." />
                                            <div className="space-y-4">
                                                 {/* 16 */}
                                                 <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl">
                                                    <label className="text-[10px] font-black uppercase text-[#888888] tracking-widest mb-3 block">Auto-Disconnect Security</label>
                                                    <div className="flex bg-[#FAF9F6] border border-[#E5E5E5] rounded-lg p-1 w-full text-center">
                                                        {(['15m', '1h', '24h', 'never'] as const).map(d => (
                                                            <button key={d} onClick={() => { setAutoDisconnectTimer(d); toast.success(`Auto-lock: ${d}`, { duration: 1800, position: 'bottom-right' }); }} className={`flex-1 py-2 rounded text-[10px] font-black uppercase transition-all ${autoDisconnectTimer === d ? 'bg-black text-white shadow' : 'text-[#888888] hover:text-black'}`}>{d}</button>
                                                        ))}
                                                    </div>
                                                </div>

                                            </div>
                                        </TabContentWrapper>
                                    )}

                                    {activeTab === 'display' && (
                                        <TabContentWrapper key="display">
                                            <SectionTitle title="Display & Hardware" subtitle="Graphics rendering and chart visualization settings." />
                                            <div className="space-y-4">
                                                {/* 17 */}
                                                <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                       <div className="p-2 border border-[#E5E5E5] bg-[#FAF9F6] rounded"><Monitor size={14}/></div><div><span className="text-[11px] font-black text-[#050505] uppercase tracking-wider block">Hardware Acceleration</span><span className="text-[10px] text-[#888888] block mt-1">Allow WebGL / GPU graph</span></div>
                                                    </div>
                                                    <Toggle enabled={hardwareAcceleration} setEnabled={(v) => { setHardwareAcceleration(v); toast.success(`Hardware accel ${v ? 'enabled' : 'disabled'}`, { duration: 1800, position: 'bottom-right' }); }} />
                                                </div>

                                                 {/* Action Disconnect moved to Bottom of Display or separate */}
                                                 <div className="pt-8 border-t border-[#E5E5E5] mt-8">
                                                    {!confirmDisconnect ? (
                                                        <div className="p-4 bg-[#FFF5F5] border border-[#FF3B30]/20 rounded-xl flex justify-between items-center transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <LogOut size={14} className="text-[#FF3B30]" />
                                                                <span className="text-[11px] font-black text-[#FF3B30] uppercase tracking-wider block">Disconnect Session</span>
                                                            </div>
                                                            <button onClick={() => setConfirmDisconnect(true)} className="px-4 py-2 bg-[#FF3B30] text-white text-[9px] font-black uppercase rounded-lg shadow-sm hover:bg-[#D32F2F] transition-all">Disconnect</button>
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 bg-white border border-[#FF3B30] shadow-[0_0_15px_rgba(255,59,48,0.1)] rounded-xl flex flex-col gap-3">
                                                            <div className="flex items-center gap-2 text-[#FF3B30] text-[11px] font-black uppercase tracking-widest"><AlertTriangle size={14} /> Protocol Disconnect</div>
                                                            <p className="text-[10px] text-[#888888] font-mono leading-relaxed">Ending this session severs the WebSocket mesh. Re-authentication via ECDSA will be required.</p>
                                                            <div className="flex gap-2">
                                                                <button onClick={() => setConfirmDisconnect(false)} className="flex-1 py-2 border border-[#E5E5E5] text-[#888888] text-[10px] font-black uppercase rounded-lg hover:border-black hover:text-black transition-all">Cancel</button>
                                                                <button onClick={handleDisconnect} className="flex-1 py-2 bg-[#FF3B30] text-white text-[10px] font-black uppercase rounded-lg hover:bg-[#D32F2F] transition-all">Confirm Disconnect</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TabContentWrapper>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function TabButton({ id, activeTab, setActiveTab, icon, label }: { id: TabKey, activeTab: TabKey, setActiveTab: (id: TabKey) => void, icon: React.ReactNode, label: string }) {
    const isActive = activeTab === id;
    return (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center justify-start gap-4 px-4 py-3.5 rounded-xl transition-all font-black uppercase tracking-wider text-[10px] ${isActive ? 'bg-black text-white shadow-md' : 'text-[#888888] hover:bg-black/5 hover:text-black'}`}
        >
            <div className={`flex items-center justify-center shrink-0 ${isActive ? 'text-white' : 'text-inherit'}`}>{icon}</div>
            {label}
        </button>
    );
}

function TabContentWrapper({ children }: { children: React.ReactNode }) {
    return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>{children}</motion.div>;
}

function SectionTitle({ title, subtitle }: { title: string, subtitle: string }) {
    return (
        <div className="mb-6">
            <h3 className="text-xl font-aztec-serif font-black uppercase tracking-tighter text-[#050505]">{title}</h3>
            <p className="text-[11px] text-[#888888] mt-1">{subtitle}</p>
        </div>
    );
}

function SelectBox(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <div className="relative">
            <select {...props} className="w-full appearance-none bg-[#FAF9F6] border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-[11px] font-bold text-black outline-none focus:border-black transition-colors" />
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] pointer-events-none" width="12" height="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
    );
}

function RadioOption({ group, id, label, subtitle, checked, onChange }: any) {
    return (
        <label className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${checked ? 'border-black bg-[#FAF9F6] shadow-sm' : 'border-transparent hover:bg-[#FAF9F6]'}`}>
            <input type="radio" name={group} id={id} checked={checked} onChange={onChange} className="mt-1 accent-black" />
            <div>
                <span className={`block text-[11px] font-black uppercase tracking-wider ${checked ? 'text-black' : 'text-[#888888]'}`}>{label}</span>
                <span className="block text-[9.5px] text-[#888888] mt-0.5">{subtitle}</span>
            </div>
        </label>
    );
}

function Toggle({ enabled, setEnabled, emergency = false }: { enabled: boolean, setEnabled: (val: boolean) => void, emergency?: boolean }) {
    return (
        <button onClick={() => setEnabled(!enabled)} className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ${enabled ? (emergency ? 'bg-[#FF3B30]' : 'bg-[#050505]') : 'bg-[#E5E5E5] shadow-inner'}`}>
            <motion.div layout initial={false} animate={{ left: enabled ? '22px' : '2px' }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="w-4 h-4 rounded-full bg-white absolute top-0.5 shadow-sm" />
        </button>
    );
}
