'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Settings, Shield, Zap, Database, Bell, Users, 
    CreditCard, Beaker, Link, Info, MessageCircle, Lock, 
    Loader2, Check, ChevronRight, Brain, Cpu, Palette,
    Layout, Globe, Wallet, Eye, EyeOff, Terminal,
    Activity, Fingerprint, Key, Layers, ArrowRight
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { WhaleAlertFooter } from '@/components/landing/WhaleAlertFooter';
import { useSettings } from '@/src/context/SettingsContext';
import { InmersiveConstellations } from '@/components/shared/InmersiveConstellations';
import { PasskeyRegister } from '@/components/auth/PasskeyRegister';
import { CloudSyncManager } from '@/components/settings/CloudSyncManager';
import { WalletConnectSessions } from '@/components/wallet/WalletConnectSessions';

export default function SettingsPage() {
    const {
        t, currency, setCurrency,
        language, setLanguage, searchEngine, setSearchEngine, lockApp,
        strictMode, toggleStrictMode, hideBalances, toggleHideBalances,
        privacyMode, togglePrivacyMode, humanMetrics, toggleHumanMetrics,
        intelligenceConfig, setIntelligenceConfig,
        executionConfig, setExecutionConfig,
        uiConfig, setUiConfig
    } = useSettings();

    const [activeTab, setActiveTab] = useState('intelligence');
    const [authUser, setAuthUser] = useState<{ id: string, hasPasskey: boolean } | null>(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.id) setAuthUser(data);
            })
            .catch(console.error)
            .finally(() => setIsLoadingAuth(false));
    }, []);

    const SECTIONS = [
        { id: 'intelligence', label: 'Cosmic Intelligence', icon: Brain, description: 'Neural tactical parameters' },
        { id: 'execution', label: 'Atomic Execution', icon: Cpu, description: 'Intent-based protocol settings' },
        { id: 'aesthetic', label: 'Aesthetic Synthesis', icon: Palette, description: 'Visual & interactive density' },
        { id: 'security', label: 'Sovereign Security', icon: Shield, description: 'ZK-privacy & biometrics' },
        { id: 'general', label: 'Global Infrastructure', icon: Globe, description: 'Language, currency & defaults' },
        { id: 'advanced', label: 'Technical Core', icon: Terminal, description: 'KMS & RPC orchestration' },
        { id: 'network', label: 'Network Matrix', icon: Layers, description: 'Sessions & Backup' },
    ];

    const motionProps = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.5, ease: [0, 0.55, 0.45, 1] }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'intelligence':
                return (
                    <motion.div {...motionProps} className="space-y-8">
                        <SectionHeader title="Neural Tactical Thresholds" description="Calibrate the sensitivity of the Sovereign Intelligence engine." />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SliderItem 
                                label="Tactical USD Threshold" 
                                value={intelligenceConfig.tacticalThreshold}
                                min={0} max={1000000000} step={1000000}
                                unit="$"
                                onChange={(v) => setIntelligenceConfig({ tacticalThreshold: v })}
                                description="Minimum volume to trigger institutional alpha signals."
                            />
                            <SliderItem 
                                label="Signal Neural Sensitivity" 
                                value={intelligenceConfig.signalSensitivity * 100}
                                min={0} max={100} step={1}
                                unit="%"
                                onChange={(v) => setIntelligenceConfig({ signalSensitivity: v / 100 })}
                                description="Adjust the confidence interval for AI-derived flow data."
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ToggleItem 
                                title="Autonomous Agent Heartbeat" 
                                description="Allow Sovereign Agents to perform background rebalancing within ZK-bounds."
                                active={intelligenceConfig.agentAutonomy}
                                onClick={() => setIntelligenceConfig({ agentAutonomy: !intelligenceConfig.agentAutonomy })}
                                icon={Activity}
                            />
                            <ToggleItem 
                                title="Alpha-Shield Alerts" 
                                description="Real-time preemptive notifications for MEV and large-scale liquidation risks."
                                active={intelligenceConfig.alphaAlerts}
                                onClick={() => setIntelligenceConfig({ alphaAlerts: !intelligenceConfig.alphaAlerts })}
                                icon={Zap}
                            />
                        </div>
                    </motion.div>
                );

            case 'execution':
                return (
                    <motion.div {...motionProps} className="space-y-8">
                        <SectionHeader title="Atomic Protocol Orchestration" description="Configure intent-based execution and account abstraction parameters." />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ToggleItem 
                                title="Gasless Transaction Mode" 
                                description="Sponsor gas via Arctic Paymaster for 100% friction-free execution."
                                active={executionConfig.gaslessMode}
                                onClick={() => setExecutionConfig({ gaslessMode: !executionConfig.gaslessMode })}
                                icon={Zap}
                            />
                            <ToggleItem 
                                title="Cryptographic Session Keys" 
                                description="Enable temporary, scoped permissions for high-frequency agent actions."
                                active={executionConfig.sessionKeys}
                                onClick={() => setExecutionConfig({ sessionKeys: !executionConfig.sessionKeys })}
                                icon={Key}
                            />
                        </div>
                        <div className="p-8 bg-white/70 backdrop-blur-3xl border border-slate-100 rounded-[2.5rem] space-y-6 shadow-sm">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] block">Institutional Bundler Reference</label>
                            <select 
                                value={executionConfig.bundlerRef}
                                onChange={(e) => setExecutionConfig({ bundlerRef: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none"
                            >
                                <option value="pimlico-mainnet">Pimlico Arctic Node (Primary)</option>
                                <option value="alchemy-global">Alchemy Sovereign Matrix</option>
                                <option value="stackup-nitro">Stackup Nitro Core</option>
                            </select>
                        </div>
                    </motion.div>
                );

            case 'aesthetic':
                return (
                    <motion.div {...motionProps} className="space-y-8">
                        <SectionHeader title="Aesthetic Synthesis" description="Personalize the visual density and interactive aura of your terminal." />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SliderItem 
                                label="Glass Density (Blur)" 
                                value={uiConfig.glassIntensity * 100}
                                min={0} max={100} step={5}
                                unit="%"
                                onChange={(v) => setUiConfig({ glassIntensity: v / 100 })}
                                description="Adjust the intensity of the institutional glassmorphism effect."
                            />
                            <div className="p-8 bg-white/70 backdrop-blur-3xl border border-slate-100 rounded-[2.5rem] space-y-4 shadow-sm">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] block">Display Density Profile</label>
                                <div className="flex gap-2">
                                    {['compact', 'standard', 'spacious'].map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => setUiConfig({ density: d as any })}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${uiConfig.density === d ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ToggleItem 
                                title="Dynamic Micro-Animations" 
                                description="Enable smooth transitions and neural particle effects across the system."
                                active={uiConfig.animations}
                                onClick={() => setUiConfig({ animations: !uiConfig.animations })}
                                icon={Activity}
                            />
                            <div className="p-8 bg-white/70 backdrop-blur-3xl border border-slate-100 rounded-[2.5rem] space-y-4 shadow-sm">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] block">Planetary Color Profile</label>
                                <div className="flex gap-2">
                                    {['arctic', 'zenith', 'obsidian'].map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setUiConfig({ colorProfile: p as any })}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${uiConfig.colorProfile === p ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );

            case 'security':
                return (
                    <motion.div {...motionProps} className="space-y-6">
                        <SectionHeader title="Sovereign Security" description="Bio-cryptographic identity and privacy orchestration." />
                        {!authUser?.hasPasskey && authUser?.id && (
                            <PasskeyRegister 
                                userId={authUser.id} 
                                onSuccess={() => setAuthUser(prev => prev ? { ...prev, hasPasskey: true } : null)}
                            />
                        )}
                        <div className="grid gap-4">
                            <ToggleItem 
                                title="Sovereign Privacy Shield" 
                                description="Anonymize all chain requests and block institutional telemetry trackers."
                                active={privacyMode}
                                onClick={togglePrivacyMode}
                                icon={EyeOff}
                            />
                            <ToggleItem 
                                title="Total Balance Obfuscation" 
                                description="Mask all financial values with **** until bio-authenticated."
                                active={hideBalances}
                                onClick={toggleHideBalances}
                                icon={Lock}
                            />
                            <ToggleItem 
                                title="Strict Whitelist Enforcement" 
                                description="Only allow atomic execution to verified institutional contacts."
                                active={strictMode}
                                onClick={toggleStrictMode}
                                icon={Shield}
                            />
                            <ToggleItem 
                                title="Neural Usage Participation" 
                                description="Contribute anonymous telemetry to the MetaMetrics collective."
                                active={humanMetrics}
                                onClick={toggleHumanMetrics}
                                icon={Database}
                            />
                        </div>
                    </motion.div>
                );

            case 'general':
                return (
                    <motion.div {...motionProps} className="space-y-8">
                        <SectionHeader title="Global Infrastructure" description="Localization and standard monetary parameters." />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 bg-white/70 backdrop-blur-3xl border border-slate-100 rounded-[2.5rem] space-y-4 shadow-sm">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] block">Sovereign Currency</label>
                                <select 
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value as any)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none"
                                >
                                    <option value="USD">USD - United States Dollar</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="GBP">GBP - British Pound</option>
                                    <option value="JPY">JPY - Japanese Yen</option>
                                    <option value="MXN">MXN - Mexican Peso</option>
                                </select>
                            </div>
                            <div className="p-8 bg-white/70 backdrop-blur-3xl border border-slate-100 rounded-[2.5rem] space-y-4 shadow-sm">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] block">Interface Localization</label>
                                <select 
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value as any)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none"
                                >
                                    <option value="en">English (US)</option>
                                    <option value="es">Español</option>
                                    <option value="fr">Français</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-8 bg-white/70 backdrop-blur-3xl border border-slate-100 rounded-[2.5rem] space-y-4 shadow-sm">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] block">Intelligence Oracle (Search)</label>
                            <div className="flex gap-2">
                                {['Google', 'DuckDuckGo', 'Brave'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setSearchEngine(s as any)}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${searchEngine === s ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                );

            case 'advanced':
                return (
                    <motion.div {...motionProps} className="space-y-8">
                        <SectionHeader title="Technical Core" description="High-level orchestration for institutional environments." />
                        <div className="p-12 bg-white/70 backdrop-blur-3xl border border-slate-100 rounded-[2.5rem] space-y-4 text-center shadow-sm">
                            <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-xl">
                                <Terminal size={28} className="text-white" />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">KMS / RPC Node Management</h3>
                            <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">Custom RPC nodes and KMS delegation are reserved for Elite Institutional users (Sovereign Tier).</p>
                            <button className="mt-4 px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 transition-colors shadow-lg hover:shadow-indigo-500/30">
                                Upgrade Tier <ArrowRight size={12} className="inline ml-1" />
                            </button>
                        </div>
                    </motion.div>
                );

            case 'network':
                return (
                    <motion.div {...motionProps} className="space-y-8">
                        <SectionHeader title="Network Matrix" description="Synchronization and session state management." />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <CloudSyncManager />
                            <WalletConnectSessions />
                        </div>
                        <div className="p-8 bg-rose-50 border border-rose-100 rounded-[2.5rem] flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                    <Lock size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-rose-900 uppercase tracking-widest">Session Termination</h4>
                                    <p className="text-xs text-rose-700 font-medium">Immediately lock all vaults and purge session keys.</p>
                                </div>
                            </div>
                            <button 
                                onClick={lockApp}
                                className="px-8 py-3 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-colors shadow-lg"
                            >
                                LOCK NOW
                            </button>
                        </div>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 flex flex-col relative overflow-hidden">
            <Toaster position="bottom-right" theme="light" />
            
            {/* Immersive Background (matches landing page) */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <InmersiveConstellations />
                {/* Subtle radial gradient layer */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/80 to-indigo-50/30" />
            </div>

            {/* HERO SECTION — matches landing page hero aesthetic */}
            <div className="relative z-10 w-full pt-32 pb-16 px-6 border-b border-slate-100/60">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="flex items-end justify-between"
                    >
                        <div>
                            {/* Pill badge */}
                            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-6">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Sovereign Configuration</span>
                            </div>
                            <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.9] mb-4">
                                Settings
                            </h1>
                            <p className="text-slate-400 text-sm font-medium max-w-sm leading-relaxed">
                                Precision-calibrated parameters for the world's most advanced on-chain intelligence terminal.
                            </p>
                        </div>

                        {/* Stats chips — echoing landing page institutional proof */}
                        <div className="hidden lg:flex items-center gap-4">
                            {[
                                { label: 'Parameters', value: '47' },
                                { label: 'Modules', value: '7' },
                                { label: 'Sync', value: 'Live' },
                            ].map((s) => (
                                <div key={s.label} className="text-center p-6 bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl shadow-sm min-w-[100px]">
                                    <div className="text-3xl font-black text-slate-950 tracking-tighter">{s.value}</div>
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* MAIN LAYOUT */}
            <main className="relative z-10 flex-grow py-12 px-4 md:px-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Nav */}
                    <motion.aside 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="w-full lg:w-80 flex-shrink-0"
                    >
                        <div className="sticky top-32 space-y-3">
                            <nav className="space-y-2">
                                {SECTIONS.map((section, idx) => (
                                    <motion.button
                                        key={section.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                                        onClick={() => setActiveTab(section.id)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-[1.5rem] transition-all group relative overflow-hidden ${
                                            activeTab === section.id 
                                                ? 'bg-white shadow-xl shadow-indigo-500/5 ring-1 ring-slate-100' 
                                                : 'hover:bg-white/60 hover:shadow-sm hover:shadow-slate-100'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-sm ${
                                            activeTab === section.id 
                                                ? 'bg-indigo-600 text-white shadow-indigo-500/30 shadow-lg' 
                                                : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                                        }`}>
                                            <section.icon size={18} />
                                        </div>
                                        <div className="text-left flex-1">
                                            <div className={`text-xs font-black uppercase tracking-widest transition-colors ${
                                                activeTab === section.id ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'
                                            }`}>
                                                {section.label}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{section.description}</div>
                                        </div>
                                        {activeTab === section.id && (
                                            <motion.div 
                                                layoutId="active-indicator" 
                                                className="w-1.5 h-8 bg-indigo-600 rounded-full flex-shrink-0" 
                                            />
                                        )}
                                    </motion.button>
                                ))}
                            </nav>

                            {/* Human Cloud Sync widget */}
                            <div className="px-2 pt-4">
                                <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50/50 border border-indigo-100 rounded-[2rem] space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                                            <Database size={14} className="text-white" />
                                        </div>
                                        <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Human Cloud Sync</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Last Synced:</span>
                                        <span className="text-[9px] font-black text-indigo-600 uppercase">JUST NOW</span>
                                    </div>
                                    <div className="w-full h-1 bg-white/80 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }} 
                                            animate={{ width: "100%" }} 
                                            transition={{ duration: 2, repeat: Infinity, repeatType: 'loop' }}
                                            className="h-full bg-indigo-600 rounded-full" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.aside>

                    {/* Content Matrix */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex-1 min-h-[700px]"
                    >
                        <AnimatePresence mode="wait">
                            <div key={activeTab}>
                                {renderContent()}
                            </div>
                        </AnimatePresence>
                    </motion.div>
                </div>
            </main>

            <WhaleAlertFooter />
        </div>
    );
}

// Visual Helpers
function SectionHeader({ title, description }: { title: string, description: string }) {
    return (
        <div className="mb-10">
            <h2 className="text-4xl font-black text-slate-950 tracking-tighter mb-2">{title}</h2>
            <p className="text-xs font-medium text-slate-400 leading-relaxed">{description}</p>
        </div>
    );
}

function ToggleItem({ title, description, active, onClick, icon: Icon }: { title: string, description: string, active: boolean, onClick: () => void, icon?: any }) {
    return (
        <motion.button 
            onClick={onClick}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
            className="w-full flex items-center justify-between p-8 bg-white/70 backdrop-blur-3xl border border-slate-100 rounded-[2.5rem] hover:shadow-xl hover:shadow-indigo-500/5 transition-all text-left"
        >
            <div className="flex gap-6 items-start">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm ${
                    active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-50 text-slate-300'
                }`}>
                    {Icon ? <Icon size={24} /> : <Zap size={24} />}
                </div>
                <div>
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-1">{title}</h4>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs">{description}</p>
                </div>
            </div>
            <div className={`w-14 h-8 rounded-full relative transition-all duration-500 shadow-inner flex-shrink-0 ${active ? 'bg-indigo-600' : 'bg-slate-100'}`}>
                <motion.div 
                    animate={{ x: active ? 24 : 4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
                >
                    {active && <Check size={12} className="text-indigo-600" />}
                </motion.div>
            </div>
        </motion.button>
    );
}

function SliderItem({ label, value, min, max, step, unit, onChange, description }: { 
    label: string, value: number, min: number, max: number, step: number, unit: string, onChange: (v: number) => void, description?: string 
}) {
    return (
        <div className="p-8 bg-white/70 backdrop-blur-3xl border border-slate-100 rounded-[2.5rem] space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] block mb-1">{label}</label>
                    {description && <p className="text-[10px] text-slate-300 font-medium">{description}</p>}
                </div>
                <div className="text-right">
                    <span className="text-xl font-black text-slate-900 font-mono tracking-tighter">
                        {unit === '$' ? `$${value.toLocaleString()}` : `${value}${unit}`}
                    </span>
                </div>
            </div>
            <input 
                type="range" min={min} max={max} step={step} value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-1 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
            />
        </div>
    );
}
