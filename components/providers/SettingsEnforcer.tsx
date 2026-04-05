"use client";

import React, { useEffect } from 'react';
import { useSettingsStore } from '@/lib/store/settings-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Network } from 'lucide-react';

export function SettingsEnforcer() {
    const { theme, testnetMode } = useSettingsStore();

    // Enforce Theme (Dark mode classes on HTML)
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else if (theme === 'light') {
            root.classList.remove('dark');
        } else {
            // System
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }
    }, [theme]);

    return (
        <AnimatePresence>
            {testnetMode && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    className="fixed bottom-6 right-6 z-[9000] pointer-events-none"
                >
                    <div className="bg-[#FF3B30] text-white px-4 py-2 rounded-full shadow-[0_0_30px_rgba(255,59,48,0.5)] flex items-center gap-2 border-2 border-white">
                        <Network size={14} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Testnet Active</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
