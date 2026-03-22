'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCookieConsent, CookieCategory } from './CookieContext';
import { Cookie, Shield, Check, X, ChevronRight, BarChart2, Megaphone, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';

export function CookieConsent() {
    const { showBanner, acceptAll, rejectAll, updateConsent, consent } = useCookieConsent();
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [tempConsent, setTempConsent] = useState(consent);

    if (!showBanner) return null;

    const handleSavePreferences = () => {
        updateConsent(tempConsent);
    };

    const toggleCategory = (category: CookieCategory) => {
        if (category === 'essential') return;
        setTempConsent(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed bottom-4 left-4 right-4 z-[9999] flex justify-center pointer-events-none"
            >
                <div className="w-full max-w-5xl pointer-events-auto">
                    {/* Main Banner */}
                    <div className="relative overflow-hidden border-2 border-[var(--aztec-ink)] bg-[var(--aztec-parchment)] shadow-[20px_20px_0px_var(--aztec-ink)] p-8 md:p-12">
                        <div className="absolute inset-0 noise-bg opacity-[0.05] pointer-events-none" />
                        
                        {/* Background Glow */}


                        <div className="relative z-10 grid md:grid-cols-[1fr,auto] gap-8 md:gap-12 items-center">
                            
                            {/* Text Content */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-[var(--aztec-ink)] text-[var(--aztec-chartreuse)]">
                                        <Shield size={24} />
                                    </div>
                                    <h2 className="font-aztec-serif text-2xl font-black text-[var(--aztec-ink)] uppercase tracking-tight">
                                        Data Sovereignity Protocol
                                    </h2>
                                </div>
                                <p className="font-aztec-mono text-[11px] text-[var(--aztec-ink)]/70 leading-relaxed max-w-2xl uppercase tracking-wider font-bold">
                                    We utilize localized caching and data-integrity packets to optimize your interface with the Aztec Network. Your identity remains private.
                                </p>
                                <div className="flex items-center gap-6">
                                    <button 
                                        onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                                        className="flex items-center gap-2 font-aztec-mono text-[10px] font-black text-[var(--aztec-ink)] hover:text-[var(--aztec-orchid)] transition-colors uppercase tracking-[0.2em]"
                                    >
                                        {isDetailsOpen ? 'HIDE PROTOCOLS' : 'ADJUST PARAMETERS'} 
                                        <ChevronRight size={14} className={cn("transition-transform", isDetailsOpen ? "rotate-90" : "")} />
                                    </button>
                                    <Link 
                                        href="/privacy" 
                                        className="flex items-center gap-1.5 font-aztec-mono text-[10px] font-black text-[var(--aztec-ink)]/40 hover:text-[var(--aztec-ink)] transition-colors uppercase tracking-[0.2em]"
                                    >
                                        LEGAL DOCS
                                        <ExternalLink size={12} />
                                    </Link>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 min-w-[300px]">
                                <button
                                    onClick={rejectAll}
                                    className="px-8 py-4 border-2 border-[var(--aztec-ink)] text-[var(--aztec-ink)] font-aztec-mono text-[11px] font-black uppercase tracking-widest hover:bg-[var(--aztec-ink)] hover:text-[var(--aztec-parchment)] transition-all"
                                >
                                    REJECT ALL
                                </button>
                                <button
                                    onClick={acceptAll}
                                    className="px-8 py-4 bg-[var(--aztec-ink)] text-[var(--aztec-parchment)] font-aztec-mono text-[11px] font-black uppercase tracking-widest hover:bg-[var(--aztec-chartreuse)] hover:text-[var(--aztec-ink)] transition-all"
                                >
                                    INITIALIZE
                                </button>
                            </div>
                        </div>

                        {/* Expandable Details Section */}
                        <AnimatePresence>
                            {isDetailsOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                    animate={{ height: "auto", opacity: 1, marginTop: 32 }}
                                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                    className="overflow-hidden border-t border-white/5 pt-8"
                                >
                                    <div className="grid gap-4 md:grid-cols-3">
                                        
                                        {/* Essential */}
                                        <div className="p-5 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Shield size={18} className="text-emerald-400" />
                                                    <span className="font-bold text-sm">Escenciales</span>
                                                </div>
                                                <Switch checked={true} disabled />
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Necessary for the platform to function (Authentication, Security, World ID). Cannot be deactivated.
                                            </p>
                                        </div>

                                        {/* Analytics */}
                                        <div className="p-5 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <BarChart2 size={18} className="text-emerald-400" />
                                                    <span className="font-bold text-sm">Analytics</span>
                                                </div>
                                                <Switch 
                                                    checked={tempConsent.analytics} 
                                                    onCheckedChange={() => toggleCategory('analytics')} 
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Nos ayuda a mejorar el rendimiento de la plataforma y el rastreo de ballenas en tiempo real.
                                            </p>
                                        </div>

                                        {/* Marketing */}
                                        <div className="p-5 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Megaphone size={18} className="text-emerald-400" />
                                                    <span className="font-bold text-sm">Marketing</span>
                                                </div>
                                                <Switch 
                                                    checked={tempConsent.marketing} 
                                                    onCheckedChange={() => toggleCategory('marketing')} 
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Utilizadas para anuncios de funciones institucionales y ofertas exclusivas de API.
                                            </p>
                                        </div>

                                    </div>

                                    <div className="mt-8 flex justify-end">
                                        <button
                                            onClick={handleSavePreferences}
                                            className="px-8 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-black hover:bg-emerald-500 hover:text-black transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                                        >
                                            GUARDAR PREFERENCIAS
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}


