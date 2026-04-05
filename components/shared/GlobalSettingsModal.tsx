"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/lib/store/settings-store';
import { 
    X, Moon, Sun, DollarSign, Globe2, Eye, EyeOff, Shield, 
    Activity, Trash2, Network, ChevronRight, Settings2, Laptop
} from 'lucide-react';

export function GlobalSettingsModal() {
    const { 
        theme, currency, language, showBalances, allowAnalytics, testnetMode, isSettingsOpen,
        setTheme, setCurrency, setLanguage, setShowBalances, setAllowAnalytics, setTestnetMode,
        setSettingsOpen, clearAppData
    } = useSettingsStore();

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

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
                                        <h2 className="text-sm font-black text-[#050505] uppercase tracking-widest">Configuración</h2>
                                        <p className="text-[10px] text-[#888888] font-mono">Sovereign Environment Variables</p>
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
                                    <h3 className="text-[10px] font-black text-[#888888] uppercase tracking-[0.2em]">Preferencias</h3>
                                    
                                    {/* Tema */}
                                    <div className="bg-white rounded-xl border border-[#E5E5E5] p-1 shadow-sm">
                                        <div className="flex items-center justify-between p-3 border-b border-[#F0F0F0]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-md bg-[#FAF9F6] border border-[#E5E5E5] flex items-center justify-center">
                                                    <Sun size={14} className="text-[#050505]" />
                                                </div>
                                                <span className="text-[11px] font-black text-[#050505] uppercase tracking-wider">Tema</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-1 p-2">
                                            {[
                                                { id: 'light', label: 'Claro', icon: <Sun size={12}/> },
                                                { id: 'dark', label: 'Oscuro', icon: <Moon size={12}/> },
                                                { id: 'system', label: 'Sistema', icon: <Laptop size={12}/> }
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
                                                    <span className="text-[11px] font-black text-[#050505] uppercase tracking-wider">Moneda local</span>
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
                                                    <span className="text-[11px] font-black text-[#050505] uppercase tracking-wider">Idioma</span>
                                                    <span className="text-[9px] text-[#888888] font-mono">{language === 'es-ES' ? 'Español (España)' : 'English (US)'}</span>
                                                </div>
                                            </div>
                                            <ChevronRight size={14} className="text-[#888888]" />
                                        </div>
                                    </div>
                                </section>

                                {/* 2. Saldos y Privacidad */}
                                <section className="space-y-4">
                                    <h3 className="text-[10px] font-black text-[#888888] uppercase tracking-[0.2em]">Privacidad y seguridad</h3>
                                    
                                    <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-sm divide-y divide-[#F0F0F0]">
                                        <div className="flex items-center justify-between p-4 bg-white rounded-t-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-md bg-[#FAF9F6] border border-[#E5E5E5] flex items-center justify-center">
                                                    {showBalances ? <Eye size={14} className="text-[#050505]" /> : <EyeOff size={14} className="text-[#050505]" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-[#050505] uppercase tracking-wider">Saldos y actividad</span>
                                                    <span className="text-[9px] text-[#888888]">Ocultar montos a la vista</span>
                                                </div>
                                            </div>
                                            <Toggle enabled={showBalances} setEnabled={setShowBalances} />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-white rounded-b-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-md bg-[#FAF9F6] border border-[#E5E5E5] flex items-center justify-center">
                                                    <Activity size={14} className="text-[#050505]" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-[#050505] uppercase tracking-wider">Permitir análisis</span>
                                                    <span className="text-[9px] text-[#888888]">Metadatos anónimos</span>
                                                </div>
                                            </div>
                                            <Toggle enabled={allowAnalytics} setEnabled={setAllowAnalytics} />
                                        </div>
                                    </div>
                                </section>

                                {/* 3. Avanzado */}
                                <section className="space-y-4">
                                    <h3 className="text-[10px] font-black text-[#FF3B30] uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Shield size={10} /> Avanzado
                                    </h3>
                                    
                                    <div className="bg-white rounded-xl border border-[#FF3B30]/20 shadow-sm overflow-hidden">
                                        <div className="flex items-center justify-between p-4 border-b border-[#F0F0F0]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-md bg-[#FAF9F6] border border-[#FF3B30]/20 flex items-center justify-center">
                                                    <Network size={14} className="text-[#FF3B30]" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-[#050505] uppercase tracking-wider">Modo de red de prueba</span>
                                                    <span className="text-[9px] text-[#888888]">Activar Testnets (Sepolia, Goerli)</span>
                                                </div>
                                            </div>
                                            <Toggle enabled={testnetMode} setEnabled={setTestnetMode} emergency />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-[#FAF9F6]">
                                            <div className="flex items-center gap-3 opacity-80">
                                                <div className="w-7 h-7 rounded-md border border-[#E5E5E5] flex items-center justify-center">
                                                    <Trash2 size={14} className="text-[#050505]" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-[#050505] uppercase tracking-wider">Datos de la app</span>
                                                    <span className="text-[9px] text-[#888888]">Purgar caché y cookies</span>
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
                                                Borrar Datos
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </div>
                            
                            {/* Footer Note */}
                            <div className="p-6 bg-[#050505] text-[#FAF9F6] flex flex-col items-center justify-center text-center">
                                <span className="text-[10px] font-black uppercase tracking-widest mb-1">Whale Alert Network Matrix</span>
                                <span className="text-[8px] text-[#888888] font-mono">SOVEREIGN_NODE_V8.4.1 — INSTITUTIONAL</span>
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
