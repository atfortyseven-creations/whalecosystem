"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/lib/store/settings-store';
import { useTheme } from 'next-themes';
import { signOut } from 'next-auth/react';
import { 
    X, Moon, Sun, DollarSign, Globe2, Shield, 
    Network, ChevronRight, Settings2, Laptop, LogOut, Trash2, AlertTriangle
} from 'lucide-react';
import { useDisconnect } from 'wagmi';


export function GlobalSettingsModal() {
    const { 
        theme, currency, language, showBalances, allowAnalytics, testnetMode, isSettingsOpen,
        setTheme, setCurrency, setLanguage, setShowBalances, setAllowAnalytics, setTestnetMode,
        setSettingsOpen, clearAppData
    } = useSettingsStore();

    const { setTheme: setNextTheme } = useTheme();
    const { disconnect } = useDisconnect();

    const [mounted, setMounted] = useState(false);
    const [confirmDisconnect, setConfirmDisconnect] = useState(false);
    useEffect(() => setMounted(true), []);

    // Sync Zustand theme with next-themes DOM
    useEffect(() => {
        if (mounted) {
            setNextTheme(theme);
        }
    }, [theme, mounted, setNextTheme]);

    if (!mounted) return null;

    const handleDisconnect = async () => {
        // Step 1: Mark disconnect intent BEFORE clearing storage
        // ConnectPage reads this to skip auto-redirect back to dashboard
        try { sessionStorage.setItem('__disconnected__', '1'); } catch {}

        // Step 2: Wagmi disconnect
        try { disconnect(); } catch {}

        // Step 3: Clear only AUTH-related state.
        // FIX Bug 19: localStorage.clear() was previously wiping ALL keys including
        // SOVEREIGN_WATCHLIST_TOKENS/WALLETS — permanently destroying weeks of
        // curated watchlist data in a single click.
        // Now we surgically remove only session/auth keys, preserving user data.
        const AUTH_KEYS_TO_REMOVE = [
            'wagmi.store',
            'wagmi.cache',
            'WCM_VERSION',
            '__WC_MODAL_WEB3MODAL__',
            'nextauth.message',
            'hasReadDocs',
        ];
        try {
            AUTH_KEYS_TO_REMOVE.forEach(k => { try { localStorage.removeItem(k); } catch {} });
        } catch {}

        // Step 4: Clear auth cookies only (not all cookies)
        try {
            const authCookiePattern = /^(next-auth|session|__Secure|__Host)/;
            document.cookie.split(';').forEach(c => {
                const name = c.split('=')[0].trim();
                if (authCookiePattern.test(name)) {
                    document.cookie = `${name}=;expires=${new Date(0).toUTCString()};path=/`;
                }
            });
        } catch {}

        try { await signOut({ redirect: false }); } catch {}

        setConfirmDisconnect(false);
        setSettingsOpen(false);

        // Step 5: Hard navigate to /connect — do NOT use router.push (wagmi may re-trigger)
        window.location.replace('/connect');
    };

    return (
        <AnimatePresence>
            {isSettingsOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSettingsOpen(false)}
                        className="fixed inset-0 bg-[#050505]/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer (Right Side) */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0.5 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0.5 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-[#FAF9F6] border-l border-[#E5E5E5] z-[101] shadow-2xl overflow-y-auto"
                    >
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5] bg-white sticky top-0 z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#050505] flex items-center justify-center">
                                        <Settings2 size={16} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-black text-[#050505] uppercase tracking-widest">Settings</h2>
                                        <p className="text-[10px] text-[#888888] font-mono">Terminal Environment Variables</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSettingsOpen(false)}
                                    className="p-2 hover:bg-[#F0F0F0] rounded-full transition-colors"
                                >
                                    <X size={18} className="text-[#050505]" />
                                </button>
                            </div>

                            <div className="p-6 space-y-8 flex-1">
                                {/* 1. Preferencias */}
                                <section className="space-y-4">
                                    <h3 className="text-[10px] font-black text-[#888888] uppercase tracking-[0.2em]">Preferences</h3>
                                    
                                    {/* Tema */}
                                    <div className="bg-white rounded-xl border border-[#E5E5E5] p-1 shadow-sm">
                                        <div className="flex items-center justify-between p-3 border-b border-[#F0F0F0]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-md bg-[#FAF9F6] border border-[#E5E5E5] flex items-center justify-center">
                                                    <Sun size={14} className="text-[#050505]" />
                                                </div>
                                                <span className="text-[11px] font-black text-[#050505] uppercase tracking-wider">Theme</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-1 p-2">
                                            {[
                                                { id: 'light', label: 'Light', icon: <Sun size={12}/> },
                                                { id: 'dark', label: 'Dark', icon: <Moon size={12}/> },
                                                { id: 'system', label: 'System', icon: <Laptop size={12}/> }
                                            ].map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setTheme(t.id as any)}
                                                    className={`py-2 flex flex-col items-center justify-center gap-1.5 rounded-lg border transition-all text-[9px] font-black uppercase tracking-wider ${theme === t.id ? 'bg-[#050505] text-[#FAF9F6] border-[#050505]' : 'bg-transparent text-[#888888] border-transparent hover:bg-[#FAF9F6]'}`}
                                                >
                                                    {t.icon}
                                                    {t.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Moneda & Idioma */}
                                    <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-sm divide-y divide-[#F0F0F0]">
                                        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#FAF9F6] transition-colors rounded-t-xl" onClick={() => setCurrency(currency === 'USD' ? 'EUR' : 'USD')}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-md bg-[#FAF9F6] border border-[#E5E5E5] flex items-center justify-center">
                                                    <DollarSign size={14} className="text-[#050505]" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-[#050505] uppercase tracking-wider">Local Currency</span>
                                                    <span className="text-[9px] text-[#888888] font-mono">{currency}</span>
                                                </div>
                                            </div>
                                            <ChevronRight size={14} className="text-[#888888]" />
                                        </div>
                                        
                                        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#FAF9F6] transition-colors rounded-b-xl" onClick={() => setLanguage(language === 'es-ES' ? 'en-US' : 'es-ES')}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-md bg-[#FAF9F6] border border-[#E5E5E5] flex items-center justify-center">
                                                    <Globe2 size={14} className="text-[#050505]" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-[#050505] uppercase tracking-wider">Language</span>
                                                    <span className="text-[9px] text-[#888888] font-mono">{language === 'es-ES' ? 'Español (España)' : 'English (US)'}</span>
                                                </div>
                                            </div>
                                            <ChevronRight size={14} className="text-[#888888]" />
                                        </div>
                                    </div>
                                </section>

                                {/* Privacy section removed as per strict system requirements */}

                                {/* 3. Avanzado */}
                                <section className="space-y-4">
                                    <h3 className="text-[10px] font-black text-[#FF3B30] uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Shield size={10} /> Advanced
                                    </h3>
                                    
                                    <div className="bg-white rounded-xl border border-[#FF3B30]/20 shadow-sm overflow-hidden">
                                        <div className="flex items-center justify-between p-4 border-b border-[#F0F0F0]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-md bg-[#FAF9F6] border border-[#FF3B30]/20 flex items-center justify-center">
                                                    <Network size={14} className="text-[#FF3B30]" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-[#050505] uppercase tracking-wider">Testnet Mode</span>
                                                    <span className="text-[9px] text-[#888888]">Enable Testnets (Sepolia, Goerli)</span>
                                                </div>
                                            </div>
                                            <Toggle enabled={testnetMode} setEnabled={setTestnetMode} emergency />
                                        </div>

                                        <div className="flex items-center justify-between p-4 border-b border-[#F0F0F0] bg-[#FAF9F6]">
                                            <div className="flex items-center gap-3 opacity-80">
                                                <div className="w-7 h-7 rounded-md border border-[#E5E5E5] flex items-center justify-center">
                                                    <Trash2 size={14} className="text-[#050505]" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-[#050505] uppercase tracking-wider">App Data</span>
                                                    <span className="text-[9px] text-[#888888]">Purge cache and cookies</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    if(confirm("¿Estás seguro de que deseas eliminar permanentemente todos los datos de sesión locales?")) {
                                                        clearAppData();
                                                    }
                                                }}
                                                className="px-3 py-1.5 rounded-lg border border-[#FF3B30] text-[9px] font-black uppercase text-[#FF3B30] hover:bg-[#FF3B30] hover:text-white transition-colors"
                                            >
                                                Clear Data
                                            </button>
                                        </div>
                                        
                                        {/* Disconnect Account Button */}
                                        <AnimatePresence mode="wait">
                                        {!confirmDisconnect ? (
                                            <motion.div
                                                key="disconnect-idle"
                                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                className="flex items-center justify-between p-4 bg-[#FFF5F5] transition-colors border-t border-[#FF3B30]/10"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-7 h-7 rounded-md border border-[#FF3B30]/30 bg-white flex items-center justify-center">
                                                        <LogOut size={14} className="text-[#FF3B30]" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-black text-[#FF3B30] uppercase tracking-wider">Disconnect Account</span>
                                                        <span className="text-[9px] text-[#FF3B30]/60">End session · Returns to wallet selector</span>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => setConfirmDisconnect(true)}
                                                    className="px-4 py-2 rounded-lg bg-[#FF3B30] text-[9px] font-black uppercase text-white shadow-sm hover:bg-[#D32F2F] transition-all active:scale-95"
                                                >
                                                    Disconnect
                                                </button>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="disconnect-confirm"
                                                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                className="flex flex-col gap-3 p-4 bg-[#FF3B30]/5 border-t border-[#FF3B30]/20"
                                            >
                                                <div className="flex items-center gap-2 text-[10px] font-black text-[#FF3B30] uppercase tracking-widest">
                                                    <AlertTriangle size={13} />
                                                    Confirm Disconnect
                                                </div>
                                                <p className="text-[9px] text-[#888888] font-mono leading-relaxed">
                                    Your wallet will be fully disconnected. You will be taken to the connection screen — no automatic reconnect.
                                </p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setConfirmDisconnect(false)}
                                                        className="flex-1 py-2 rounded-lg border border-[#E5E5E5] text-[9px] font-black uppercase text-[#888888] hover:border-[#050505] hover:text-[#050505] transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleDisconnect}
                                                        className="flex-1 py-2 rounded-lg bg-[#FF3B30] text-[9px] font-black uppercase text-white hover:bg-[#D32F2F] transition-all active:scale-95"
                                                    >
                                                        Yes, Disconnect
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                        </AnimatePresence>
                                    </div>
                                </section>
                            </div>
                            
                            {/* Footer */}
                             <div className="p-6 bg-[#050505] flex flex-col items-center justify-center gap-3">
                                <div className="flex items-center gap-3">
                                    <img src="/official-whale-monochrome.png" className="w-7 h-7 invert opacity-80" alt="Whale" />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-[#FAF9F6]">Whale Alert Network</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <a href="https://github.com/atfortyseven-creations/whalecosystem" target="_blank" rel="noreferrer"
                                       className="flex items-center gap-1.5 text-[#888888] hover:text-[#FAF9F6] transition-colors">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                                        <span className="text-[9px] font-bold uppercase tracking-wider">GitHub</span>
                                    </a>
                                    <div className="w-px h-3 bg-[#333]" />
                                    <a href="https://twitter.com/WhaleAlertNetwork" target="_blank" rel="noreferrer"
                                       className="flex items-center gap-1.5 text-[#888888] hover:text-[#FAF9F6] transition-colors">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.9-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/></svg>
                                        <span className="text-[9px] font-bold uppercase tracking-wider">Twitter</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Minimal toggle switch component
function Toggle({ enabled, setEnabled, emergency = false }: { enabled: boolean, setEnabled: (val: boolean) => void, emergency?: boolean }) {
    return (
        <button 
            onClick={() => setEnabled(!enabled)}
            className={`w-10 h-5 rounded-full relative transition-colors ${enabled ? (emergency ? 'bg-[#FF3B30]' : 'bg-[#050505]') : 'bg-[#E5E5E5]'}`}
        >
            <motion.div 
                layout
                className="w-4 h-4 rounded-full bg-white absolute top-0.5 shadow-sm"
                initial={false}
                animate={{ left: enabled ? '22px' : '2px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
        </button>
    );
}
