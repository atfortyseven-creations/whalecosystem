"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { getParsedMarkets, RAW_NETWORKS } from '@/lib/data/markets-data';
import { Search, ChevronDown, RefreshCw, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function InstitutionalMarkets() {
    const [tokens, setTokens] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [filterChain, setFilterChain] = useState<string | null>(null);
    const [sortCol, setSortCol] = useState<string | null>(null);
    const [sortDesc, setSortDesc] = useState(true);
    const [showChainDropdown, setShowChainDropdown] = useState(false);

    useEffect(() => {
        setTokens(getParsedMarkets());
    }, []);

    const parseNum = (val: string) => {
        const cleaned = val.replace(/[^0-9.-]/g, '');
        let num = parseFloat(cleaned);
        if (val.includes('B')) num *= 1e9;
        if (val.includes('M')) num *= 1e6;
        if (val.includes('T')) num *= 1e12;
        if (val.includes('K')) num *= 1e3;
        return isNaN(num) ? 0 : num;
    };

    const sortedAndFiltered = useMemo(() => {
        let result = tokens;

        // Apply chain filter
        if (filterChain) {
            result = result.filter(t => t.network === filterChain);
        }

        // Apply search
        if (search.trim()) {
            const term = search.toLowerCase();
            result = result.filter(t => 
                t.name.toLowerCase().includes(term) || 
                t.ticker.toLowerCase().includes(term)
            );
        }

        // Apply sorting
        if (sortCol) {
            result = [...result].sort((a, b) => {
                let aVal: number, bVal: number;
                switch(sortCol) {
                    case 'Price':
                        aVal = parseNum(a.price);
                        bVal = parseNum(b.price);
                        break;
                    case '24h change':
                        aVal = parseNum(a.change24h);
                        bVal = parseNum(b.change24h);
                        break;
                    case 'Market cap':
                        aVal = parseNum(a.mcap);
                        bVal = parseNum(b.mcap);
                        break;
                    case 'Circulation':
                        aVal = parseNum(a.circulation);
                        bVal = parseNum(b.circulation);
                        break;
                    default:
                        aVal = 0; bVal = 0;
                }
                if (aVal < bVal) return sortDesc ? 1 : -1;
                if (aVal > bVal) return sortDesc ? -1 : 1;
                return 0;
            });
        }

        return result;
    }, [tokens, search, filterChain, sortCol, sortDesc]);

    const handleSort = (col: string) => {
        if (sortCol === col) {
            setSortDesc(!sortDesc);
        } else {
            setSortCol(col);
            setSortDesc(true);
        }
    };

    const isNegative = (chg: string) => chg.startsWith('-');

    return (
        <div className="w-full h-full min-h-0 flex flex-col p-4 md:p-8 bg-white dark:bg-[#050505] text-[#050505] dark:text-white font-mono overflow-hidden transition-colors">
            
            {/* Header section — Search & Filter only */}
            <div className="max-w-[1400px] mx-auto w-full flex-shrink-0">
                {/* Search and Filter Row */}
                <div className="flex flex-col md:flex-row gap-4 mt-2 relative z-20">
                    <div className="relative flex-1 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-[#888888]" />
                        </div>
                        <input 
                            type="text" 
                            className="block w-full pl-11 pr-4 py-3 bg-[#F9F9F9] dark:bg-[#111111] border border-[#E5E5E5] dark:border-white/10 rounded-xl text-[13px] text-[#050505] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#050505] dark:focus:ring-white transition-all font-mono"
                            placeholder="Filter by name, ticker, or contract address"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <button 
                                onClick={() => setShowChainDropdown(!showChainDropdown)}
                                className="flex items-center gap-2 px-5 py-3 bg-[#F9F9F9] dark:bg-[#111111] border border-[#E5E5E5] dark:border-white/10 rounded-xl text-[13px] font-bold text-[#050505] dark:text-white hover:bg-[#E5E5E5] dark:hover:bg-[#1A1A1A] transition-colors"
                            >
                                {filterChain ? filterChain : 'Blockchain'}
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </button>

                            <AnimatePresence>
                                {showChainDropdown && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute left-0 md:left-auto md:right-0 top-full mt-2 w-64 max-h-[300px] overflow-y-auto bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-white/10 shadow-2xl rounded-xl z-50 py-2"
                                    >
                                        <div className="px-4 py-2 border-b border-[#E5E5E5] dark:border-white/10 sticky top-0 bg-white dark:bg-[#111111] font-black text-[10px] text-[#888888] tracking-widest uppercase">Select Network</div>
                                        {RAW_NETWORKS.map(net => (
                                            <button
                                                key={net}
                                                onClick={() => { setFilterChain(net); setShowChainDropdown(false); }}
                                                className={`w-full text-left px-4 py-2 text-[12px] hover:bg-[#F0F0F0] dark:hover:bg-white/5 transition-colors ${filterChain === net ? 'font-bold bg-[#F9F9F9] dark:bg-white/10' : ''}`}
                                            >
                                                {net}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <button 
                            onClick={() => { setFilterChain(null); setSearch(''); }}
                            className="flex items-center justify-center p-3 text-[#888888] hover:text-[#050505] dark:hover:text-white bg-[#F9F9F9] dark:bg-[#111111] border border-[#E5E5E5] dark:border-white/10 rounded-xl transition-colors group"
                            title="Reset filters"
                        >
                            <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="max-w-[1400px] mx-auto w-full flex-1 flex flex-col min-h-0 mt-6 md:mt-8 border border-[#E5E5E5] dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-[#0A0A0A] shadow-sm relative z-10">
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-6 py-4 border-b border-[#E5E5E5] dark:border-white/10 bg-[#F9F9F9] dark:bg-[#111111] text-[11px] font-black text-[#888888] uppercase tracking-widest sticky top-0 z-10">
                    <div className="cursor-pointer hover:text-[#050505] dark:hover:text-white flex items-center" onClick={() => handleSort('Token')}>Token <ArrowUpDown className="ml-2 w-3 h-3 opacity-50" /></div>
                    <div className="cursor-pointer hover:text-[#050505] dark:hover:text-white flex items-center justify-end text-right" onClick={() => handleSort('Price')}>Price <ArrowUpDown className="ml-2 w-3 h-3 opacity-50" /></div>
                    <div className="cursor-pointer hover:text-[#050505] dark:hover:text-white flex items-center justify-end text-right" onClick={() => handleSort('24h change')}>24h change <ArrowUpDown className="ml-2 w-3 h-3 opacity-50" /></div>
                    <div className="cursor-pointer hover:text-[#050505] dark:hover:text-white flex items-center justify-end text-right" onClick={() => handleSort('Market cap')}>Market cap <ArrowUpDown className="ml-2 w-3 h-3 opacity-50" /></div>
                    <div className="cursor-pointer hover:text-[#050505] dark:hover:text-white flex items-center justify-end text-right" onClick={() => handleSort('Circulation')}>Circulation <ArrowUpDown className="ml-2 w-3 h-3 opacity-50" /></div>
                </div>

                {/* Table Body */}
                <div className="flex-1 overflow-y-auto">
                    {sortedAndFiltered.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-[12px] text-[#888888] uppercase tracking-widest font-black">
                            NO ASSETS FOUND FOR SELECTED CRITERIA
                        </div>
                    ) : (
                        sortedAndFiltered.map((t, idx) => (
                            <div key={idx} className="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr] p-4 md:px-6 md:py-4 border-b border-[#F0F0F0] dark:border-white/5 hover:bg-[#F9F9F9] dark:hover:bg-white/5 transition-colors md:items-center gap-3 md:gap-0">
                                {/* Mobile Top Row / Desktop Col 1 */}
                                <div className="flex items-center justify-between md:justify-start gap-4 min-w-0">
                                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#E5E5E5] dark:bg-[#1A1A1A] flex items-center justify-center text-[12px] md:text-[14px] font-black shrink-0 text-[#050505] dark:text-white shadow-inner">
                                            {t.ticker.charAt(0)}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[14px] md:text-[15px] font-bold truncate text-[#050505] dark:text-white">{t.name}</span>
                                            <span className="text-[11px] text-[#888888] dark:text-white/40 uppercase tracking-wide">{t.ticker}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Mobile Only Price & Change */}
                                    <div className="flex flex-col items-end md:hidden">
                                        <div className="text-right text-[14px] font-bold text-[#050505] dark:text-white">
                                            {t.price} <span className="text-[10px] text-[#888888] font-normal">{t.currencyPrice}</span>
                                        </div>
                                        <div className={`text-right text-[12px] font-bold ${isNegative(t.change24h) ? 'text-[#FF3B30]' : 'text-[#00C076]'}`}>
                                            {t.change24h}
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop Price (Hidden on Mobile) */}
                                <div className="hidden md:block text-right text-[14px] font-bold text-[#050505] dark:text-white">
                                    {t.price} <span className="text-[10px] text-[#888888] font-normal">{t.currencyPrice}</span>
                                </div>

                                {/* Desktop 24h change (Hidden on Mobile) */}
                                <div className={`hidden md:block text-right text-[14px] font-bold ${isNegative(t.change24h) ? 'text-[#FF3B30]' : 'text-[#00C076]'}`}>
                                    {t.change24h}
                                </div>

                                {/* Market cap & Circulation - Row 2 on mobile, Col 4 & 5 on desktop */}
                                <div className="flex items-center justify-between md:hidden pt-3 border-t border-[#F0F0F0] dark:border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-[#888888] uppercase font-black tracking-widest mb-0.5">Market Cap</span>
                                        <div className="text-[13px] font-bold text-[#050505] dark:text-white">
                                            {t.mcap} <span className="text-[9px] text-[#888888] font-normal">{t.mcapCurrency}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] text-[#888888] uppercase font-black tracking-widest mb-0.5">Circulation</span>
                                        <div className="text-[13px] font-bold text-[#050505] dark:text-white">
                                            {t.circulation}
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop MCap */}
                                <div className="hidden md:block text-right text-[14px] font-bold text-[#050505] dark:text-white">
                                    {t.mcap} <span className="text-[10px] text-[#888888] font-normal">{t.mcapCurrency}</span>
                                </div>

                                {/* Desktop Circulation */}
                                <div className="hidden md:block text-right text-[14px] font-bold text-[#050505] dark:text-white">
                                    {t.circulation}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
        </div>
    );
}
