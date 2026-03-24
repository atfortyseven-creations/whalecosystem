"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { GlobalMarketSessions } from '@/components/premium/GlobalMarketSessions';

interface SearchResult {
    address: string;
    txCount: number;
    totalVolumeUsd: number;
    firstSeen?: string;
    lastActive?: string;
    activities: Array<{
        id: string;
        hash: string;
        token: string;
        action: string;
        usdValue: number;
        timestamp: string;
        chain: string;
    }>;
    btcBalance?: number;
    source: string;
    message?: string;
}

export function CatchTheWhale() {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [result, setResult] = useState<SearchResult | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);
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

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setIsSearching(true);
        setResult(null);
        setSearchError(null);
        try {
            const res = await fetch(`/api/network/whale/search?address=${encodeURIComponent(query.trim())}`);
            if (!res.ok) throw new Error(`Search failed: ${res.status}`);
            const data: SearchResult = await res.json();
            setResult(data);
        } catch (err: any) {
            setSearchError(err.message || 'Search failed. Try again.');
        } finally {
            setIsSearching(false);
        }
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

            {/* Live UTC Clock */}
            <div className="flex flex-col items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--aztec-ink)]/30">Schedule</span>
                <div className="bg-[var(--aztec-parchment)]/40 backdrop-blur-3xl px-8 py-3 rounded-2xl border border-[var(--aztec-ink)]/5 shadow-lg shadow-[var(--aztec-ink)]/5">
                    <span className="text-sm font-mono font-black text-[var(--aztec-ink)] tracking-wider">
                        {utcTime || "00:00:00 UTC"}
                    </span>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col items-center gap-4 w-full max-w-2xl px-4">
                <form onSubmit={handleSearch} className="w-full flex gap-3">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter wallet address (0x... or Bitcoin)"
                        className="flex-1 bg-[var(--aztec-parchment)]/40 backdrop-blur-3xl px-6 py-3 rounded-2xl border border-[var(--aztec-ink)]/10 text-sm font-mono text-[var(--aztec-ink)] focus:outline-none focus:border-[var(--aztec-ink)]/30 placeholder:text-[var(--aztec-ink)]/30"
                    />
                    <button
                        type="submit"
                        disabled={isSearching}
                        className="flex items-center gap-2 px-6 py-3 bg-[var(--aztec-ink)] text-[var(--aztec-parchment)] rounded-2xl text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                        {isSearching ? 'Scanning...' : 'Search'}
                    </button>
                </form>

                {searchError && (
                    <div className="w-full flex items-center gap-3 px-5 py-3 bg-red-50 border border-red-200 rounded-2xl">
                        <AlertCircle size={16} className="text-red-500 shrink-0" />
                        <span className="text-sm text-red-600 font-mono">{searchError}</span>
                    </div>
                )}

                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full bg-[var(--aztec-parchment)]/60 backdrop-blur-xl border border-[var(--aztec-ink)]/10 rounded-3xl p-6 space-y-4 text-left"
                    >
                        <div className="flex items-center gap-3">
                            <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                            <span className="text-xs font-mono text-[var(--aztec-ink)]/50 break-all">{result.address}</span>
                        </div>
                        {result.message ? (
                            <p className="text-sm font-mono text-[var(--aztec-ink)]/40 italic">{result.message}</p>
                        ) : (
                            <>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: 'Transactions', value: result.txCount },
                                        { label: 'Volume', value: result.totalVolumeUsd >= 1e6 ? `$${(result.totalVolumeUsd/1e6).toFixed(2)}M` : `$${(result.totalVolumeUsd/1e3).toFixed(0)}K` },
                                        { label: result.btcBalance != null ? 'BTC Balance' : 'Source', value: result.btcBalance != null ? `${result.btcBalance.toFixed(4)} BTC` : result.source },
                                    ].map((s, i) => (
                                        <div key={i} className="text-center">
                                            <div className="text-base font-black text-[var(--aztec-ink)]">{s.value}</div>
                                            <div className="text-[9px] font-mono text-[var(--aztec-ink)]/40 uppercase tracking-widest">{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                                {result.activities.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-[var(--aztec-ink)]/30 uppercase tracking-widest">Recent Activity</p>
                                        {result.activities.slice(0, 5).map((a) => (
                                            <div key={a.id} className="flex items-center justify-between text-xs font-mono">
                                                <span className={`font-black ${a.action === 'BUY' ? 'text-emerald-600' : a.action === 'SELL' ? 'text-red-500' : 'text-[var(--aztec-ink)]/50'}`}>{a.action}</span>
                                                <span className="text-[var(--aztec-ink)]/60">{a.token}</span>
                                                <span className="text-[var(--aztec-ink)] font-bold">{a.usdValue >= 1e6 ? `$${(a.usdValue/1e6).toFixed(2)}M` : `$${(a.usdValue/1e3).toFixed(0)}K`}</span>
                                                <span className="text-[var(--aztec-ink)]/30 text-[10px]">{new Date(a.timestamp).toLocaleDateString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </motion.div>
                )}
            </div>
        </section>
    );
}

