'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCookieConsent, CookieCategory } from './CookieContext';
import { Shield, ChevronRight, BarChart2, Megaphone, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';

export function CookieConsent() {
    const { showBanner, acceptAll, rejectAll, updateConsent, consent } = useCookieConsent();
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [tempConsent, setTempConsent] = useState(consent);

    if (!showBanner) return null;

    const handleSavePreferences = async () => {
        updateConsent(tempConsent);
        try {
            await fetch('/api/cookies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ consent: tempConsent })
            });
        } catch(e) {}
    };

    const toggleCategory = (category: CookieCategory) => {
        if (category === 'essential') return;
        setTempConsent(prev => ({ ...prev, [category]: !prev[category] }));
    };

    const handleAcceptAll = async () => {
        acceptAll();
        try {
            await fetch('/api/cookies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ consent: { essential: true, analytics: true, marketing: true } })
            });
        } catch(e) {}
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed bottom-4 left-4 right-4 z-[9999] flex justify-center pointer-events-none font-aztec-body"
            >
                <div className="w-full max-w-5xl pointer-events-auto">
                    {/* Main Banner */}
                    <div className="relative overflow-hidden border border-black/10 bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl p-6 md:p-8">
                        <div className="absolute inset-0 noise-bg opacity-[0.03] pointer-events-none" />

                        <div className="relative z-10 grid md:grid-cols-[1fr,auto] gap-6 md:gap-10 items-center">
                            
                            {/* Text Content */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-black text-white rounded-full shadow-sm">
                                        <Shield size={18} />
                                    </div>
                                    <h2 className="font-aztec-h1 text-xl font-bold text-black uppercase tracking-tight">
                                        Data Sovereignty Protocol
                                    </h2>
                                </div>
                                <p className="font-mono text-[10px] text-black/60 leading-relaxed max-w-2xl uppercase tracking-[0.1em] font-medium">
                                    We utilize localized telemetry and encrypted signatures to maintain network integrity. Your navigation is secure.
                                </p>
                                <div className="flex items-center gap-6">
                                    <button 
                                        onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                                        className="flex items-center gap-2 font-mono text-[9px] font-bold text-black hover:text-black/60 transition-colors uppercase tracking-[0.2em]"
                                    >
                                        {isDetailsOpen ? 'HIDE PROTOCOLS' : 'ADJUST PARAMETERS'} 
                                        <ChevronRight size={12} className={cn("transition-transform", isDetailsOpen ? "rotate-90" : "")} />
                                    </button>
                                    <Link 
                                        href="/privacy" 
                                        className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-black/40 hover:text-black transition-colors uppercase tracking-[0.2em]"
                                    >
                                        LEGAL DOCS
                                        <ExternalLink size={10} />
                                    </Link>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 min-w-[280px]">
                                <button
                                    onClick={rejectAll}
                                    className="flex-1 px-6 py-3 border border-black/10 rounded-full text-black font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-black/5 transition-all"
                                >
                                    REJECT ALL
                                </button>
                                <button
                                    onClick={handleAcceptAll}
                                    className="flex-1 px-6 py-3 bg-black rounded-full text-white font-mono text-[10px] font-bold uppercase tracking-widest hover:scale-105 shadow-[0_4px_15px_rgba(0,0,0,0.15)] transition-all"
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
                                    animate={{ height: "auto", opacity: 1, marginTop: 24 }}
                                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                    className="overflow-hidden border-t border-black/5 pt-6"
                                >
                                    <div className="grid gap-4 md:grid-cols-3">
                                        
                                        {/* Essential */}
                                        <div className="p-5 rounded-2xl bg-black/5 border border-black/5 flex flex-col gap-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-black">
                                                    <Shield size={16} />
                                                    <span className="font-bold text-sm">Essential</span>
                                                </div>
                                                <Switch checked={true} disabled className="data-[state=checked]:bg-black" />
                                            </div>
                                            <p className="text-xs text-black/50">
                                                Core session matrices & Authentication nodes. Unbypassable.
                                            </p>
                                        </div>

                                        {/* Analytics */}
                                        <div className="p-5 rounded-2xl bg-black/5 border border-black/5 flex flex-col gap-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-black">
                                                    <BarChart2 size={16} />
                                                    <span className="font-bold text-sm">Telemetry</span>
                                                </div>
                                                <Switch 
                                                    checked={tempConsent.analytics} 
                                                    onCheckedChange={() => toggleCategory('analytics')} 
                                                    className="data-[state=checked]:bg-black"
                                                />
                                            </div>
                                            <p className="text-xs text-black/50">
                                                Anonymized traffic vectors to reinforce stability.
                                            </p>
                                        </div>

                                        {/* Marketing */}
                                        <div className="p-5 rounded-2xl bg-black/5 border border-black/5 flex flex-col gap-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-black">
                                                    <Megaphone size={16} />
                                                    <span className="font-bold text-sm">Transmissions</span>
                                                </div>
                                                <Switch 
                                                    checked={tempConsent.marketing} 
                                                    onCheckedChange={() => toggleCategory('marketing')} 
                                                    className="data-[state=checked]:bg-black"
                                                />
                                            </div>
                                            <p className="text-xs text-black/50">
                                                API signals and institutional upgrade relays.
                                            </p>
                                        </div>

                                    </div>

                                    <div className="mt-8 flex justify-end">
                                        <button
                                            onClick={handleSavePreferences}
                                            className="px-8 py-3 rounded-full bg-black/5 border border-black/10 text-black text-[10px] uppercase tracking-widest font-bold hover:bg-black hover:text-white transition-all shadow-sm"
                                        >
                                            Enact Directives
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
