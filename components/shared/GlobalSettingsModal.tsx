"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/lib/store/useSettingsStore';
import { X, Settings, LogOut } from 'lucide-react';
import { useSovereignSignOut } from '@/hooks/useSovereignSignOut';
import { TerminalSettingsPanel } from '@/components/dashboard/TerminalSettingsPanel';

export function GlobalSettingsModal() {
    const { isSettingsOpen, setSettingsOpen } = useSettingsStore();

    const { nuclearDisconnect } = useSovereignSignOut();
    const [mounted, setMounted] = useState(false);
    const [confirmDisconnect, setConfirmDisconnect] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998]"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-0 m-auto h-[85vh] w-[95vw] max-w-6xl bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 z-[99999] shadow-2xl rounded-[32px] flex flex-col overflow-hidden transition-colors duration-300"
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#111111]">
                             <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center text-white dark:text-black">
                                    <Settings size={16} />
                                 </div>
                                 <div className="flex flex-col">
                                    <h2 className="text-[13px] font-black text-black dark:text-white uppercase tracking-widest">Global Terminal Parameters</h2>
                                 </div>
                             </div>
                             <div className="flex items-center gap-4">
                                {!confirmDisconnect ? (
                                    <button onClick={() => setConfirmDisconnect(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                                        <LogOut size={14} /> Sever Connection
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Confirm Disconnect?</span>
                                        <button onClick={handleDisconnect} className="px-4 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600">Yes</button>
                                        <button onClick={() => setConfirmDisconnect(false)} className="px-4 py-2 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-black dark:hover:border-white">No</button>
                                    </div>
                                )}
                                <button onClick={() => setSettingsOpen(false)} className="p-2 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors bg-black/5 dark:bg-white/5 rounded-full"><X size={18} /></button>
                             </div>
                        </div>

                        <div className="flex-1 overflow-hidden relative bg-[#FAF9F6] dark:bg-[#0A0A0A]">
                             {/* Render the full comprehensive Terminal Settings Panel perfectly inside the modal */}
                             <TerminalSettingsPanel />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
                                    

