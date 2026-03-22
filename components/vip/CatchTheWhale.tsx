"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';
import { GlobalMarketSessions } from '@/components/premium/GlobalMarketSessions';

export function CatchTheWhale() {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [utcTime, setUtcTime] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const timeString = now.getUTCHours().toString().padStart(2, '0') + ":" + 
                              now.getUTCMinutes().toString().padStart(2, '0') + ":" + 
                              now.getUTCSeconds().toString().padStart(2, '0') + " UTC";
            setUtcTime(timeString);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setIsSearching(true);
        // Simulation of search logic for UI state
        setTimeout(() => setIsSearching(false), 800);
    };

    return (
        <section className="flex flex-col items-center text-center space-y-16 py-20 pb-32 bg-transparent relative z-10">
            {/* Diamond Logo Central - Enlarged to Network Size */}
            <div className="space-y-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-80 h-80 flex items-center justify-center mx-auto relative group"
                >
                    <img 
                        src="/models/update/gradient-pink-diamond-balls-assortment (2).png" 
                        className="w-full h-full object-contain transition-transform duration-500 scale-125 group-hover:scale-150 drop-shadow-2xl" 
                        alt="Whale Alert Diamond"
                    />
                </motion.div>
                
                <div className="space-y-4">
                    <h1 className="text-5xl sm:text-8xl font-black uppercase tracking-tighter leading-none text-[var(--aztec-ink)]">
                        Catch the <span className="text-[var(--aztec-ink)]/20">Whale</span>
                    </h1>
                </div>
            </div>

            {/* Live UTC Clock (Matching Screenshot Style) */}
            <div className="flex flex-col items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--aztec-ink)]/30">Schedule</span>
                <div className="bg-[var(--aztec-parchment)]/40 backdrop-blur-3xl px-8 py-3 rounded-2xl border border-[var(--aztec-ink)]/5 shadow-lg shadow-[var(--aztec-ink)]/5">
                    <span className="text-sm font-mono font-black text-[var(--aztec-ink)] tracking-wider">
                        {utcTime || "00:00:00 UTC"}
                    </span>
                </div>
            </div>
        </section>
    );
}
