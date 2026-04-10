"use client";

import React, { useState, useEffect } from "react";
import { Search, Activity, Box, ArrowRight, Clock, ShieldCheck, AlignLeft, Loader2, AlertCircle } from "lucide-react";
import { usePublicClient, useBlockNumber } from 'wagmi';
import { formatEther } from 'viem';
import { OmniMatrixCanvas } from '@/components/3d/OmniMatrixCanvas';

export function OmniExplorer() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<any[] | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);

    const publicClient = usePublicClient();
    const { data: blockNumber } = useBlockNumber({ watch: true });
    
    const [blocks, setBlocks] = useState<any[]>([]);
    const [massiveTxs, setMassiveTxs] = useState<any[]>([]);

    // ── On-chain block feed ─────────────────────────────────────────────────
    useEffect(() => {
        if (!publicClient || !blockNumber) return;

        const fetchBlock = async () => {
            try {
                const block = await publicClient.getBlock({
                    blockNumber: blockNumber,
                    includeTransactions: true
                });

                const targetBlock = {
                    height: Number(block.number),
                    age: '0 secs ago',
                    txs: block.transactions.length,
                    size: (Number(block.size) / 1000000).toFixed(2) + ' MB',
                    validator: block.miner ? (block.miner.substring(0,6) + '...' + block.miner.substring(38)) : '0xSync...'
                };

                setBlocks(prev => {
                    const exists = prev.find(p => p.height === targetBlock.height);
                    if (exists) return prev;
                    return [targetBlock, ...prev].slice(0, 5);
                });

                const txs = block.transactions as any[];
                const valTxs = txs
                    .filter((t: any) => t.value && t.value > 0n)
                    .sort((a,b) => (a.value < b.value ? 1 : -1))
                    .slice(0, 5);
                
                if (valTxs.length > 0) {
                    const newMassive = valTxs.map(t => ({
                        hash: t.hash.substring(0,6) + '...' + t.hash.substring(60),
                        age: 'New Block',
                        from: t.from.substring(0,6) + '...' + t.from.substring(38),
                        to: t.to ? (t.to.substring(0,6) + '...' + t.to.substring(38)) : 'Contract',
                        value: Number(formatEther(t.value)).toFixed(4) + ' ETH',
                        type: 'TRANSFER'
                    }));
                    setMassiveTxs(prev => [...newMassive, ...prev].slice(0, 5));
                }
            } catch (e) {
                console.error('Failed to fetch block', e);
            }
        };

        fetchBlock();
    }, [blockNumber, publicClient]);

    // ── Search handler ──────────────────────────────────────────────────────
    const handleSearch = async () => {
        const q = searchQuery.trim();
        if (!q || q.length < 2) return;
        setIsSearching(true);
        setSearchResults(null);
        setSearchError(null);
        try {
            const res = await fetch(`/api/graph?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            if (data.ok) {
                setSearchResults(data.data ?? []);
            } else {
                setSearchError(data.error || 'No results found');
            }
        } catch {
            setSearchError('Network error — could not reach the graph index.');
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="relative min-h-full w-full font-mono p-4 md:p-8 flex flex-col gap-12 selection:bg-[#00FF55] selection:text-black overflow-hidden bg-[#020202]">
            
            <OmniMatrixCanvas />

            <div className="relative z-10 w-full h-full overflow-y-auto flex flex-col gap-12 custom-scrollbar">
                {/* Header / Search Area */}
                <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto pt-12 pb-8 gap-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white drop-shadow-lg">
                        OMNICHAIN <span className="text-[#00FF55]">EXPLORER</span>
                    </h1>
                    <p className="text-[11px] text-[#888888] tracking-[0.2em] uppercase max-w-2xl">
                        Zero-Knowledge Terminal Indexing the Largest Institutional Flows Across the Ledger.
                    </p>
                </div>

                <div className="w-full relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        {isSearching
                            ? <Loader2 size={20} className="text-[#00FF55] animate-spin" />
                            : <Search size={20} className="text-[#00FF55]" />}
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full bg-[#050505] border-2 border-[#333333] focus:border-[#00FF55] text-white p-6 pl-14 outline-none transition-colors text-sm uppercase tracking-widest placeholder:text-[#555555]"
                        placeholder="SEARCH BY ADDRESS / TX HASH / TOKEN / ENS"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="absolute inset-y-2 right-2 bg-[#00FF55] text-black px-6 font-black text-xs uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSearching ? 'SCANNING...' : 'SCAN'}
                    </button>
                    <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-[#00FF55]" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-[#00FF55]" />
                </div>

                {/* Search Results Panel */}
                {searchError && (
                    <div className="w-full border border-[#FF3B30]/40 bg-[#FF3B30]/10 backdrop-blur-md p-4 flex items-center gap-3 shadow-2xl">
                        <AlertCircle size={16} className="text-[#FF3B30] shrink-0" />
                        <span className="text-[11px] text-[#FF3B30] uppercase tracking-widest">{searchError}</span>
                    </div>
                )}
                {searchResults !== null && (
                    <div className="w-full border border-[#222222]/50 bg-[#020202]/80 backdrop-blur-xl shadow-2xl">
                        <div className="flex items-center justify-between p-4 border-b border-[#222222]/50 bg-[#050505]/80">
                            <div className="flex items-center gap-3">
                                <Search size={14} className="text-[#00FF55]" />
                                <h2 className="text-[12px] font-black uppercase tracking-widest">
                                    SEARCH RESULTS
                                </h2>
                            </div>
                            <span className="text-[9px] text-[#00FF55] uppercase tracking-widest font-bold">
                                {searchResults.length} ENTITIES FOUND
                            </span>
                        </div>
                        {searchResults.length === 0 ? (
                            <div className="p-8 text-center text-[10px] text-[#555555] uppercase tracking-widest">
                                No entities found in the graph index for &quot;{searchQuery}&quot;
                            </div>
                        ) : (
                            <div className="flex flex-col divide-y divide-[#111111]">
                                {searchResults.map((result: any, i: number) => {
                                    const entity = result.node || result.n || result;
                                    const label = result.label || entity._labels?.[0] || 'Entity';
                                    const name = entity.name || entity.address || entity.symbol || entity.id || 'Unknown';
                                    return (
                                        <div key={i} className="flex items-center justify-between p-4 hover:bg-[#050505] transition-colors">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[12px] text-[#00FF55] font-black tracking-widest">{name}</span>
                                                {entity.description && (
                                                    <span className="text-[9px] text-[#555555] uppercase tracking-widest">{entity.description}</span>
                                                )}
                                            </div>
                                            <span className="px-2 py-1 border border-[#333] text-[8px] text-[#888888] uppercase tracking-widest shrink-0">{label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Matrix Data Grids */}
            <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
                
                {/* LATEST BLOCKS TABLE */}
                <div className="border border-[#222222]/50 bg-[#020202]/80 backdrop-blur-xl shadow-2xl">
                    <div className="flex items-center justify-between p-4 border-b border-[#222222]/50 bg-[#050505]/80">
                        <div className="flex items-center gap-3">
                            <Box size={16} className="text-[#00FF55]" />
                            <h2 className="text-[12px] font-black uppercase tracking-widest text-[#FFFFFF]">LATEST BLOCKS</h2>
                        </div>
                        <button className="text-[9px] text-[#00FF55] uppercase tracking-widest font-bold hover:text-white transition-colors">
                            VIEW ALL BLOCKS &gt;
                        </button>
                    </div>

                    <div className="flex flex-col">
                        {blocks.length === 0 && (
                            <div className="p-8 text-center text-[10px] text-[#555555] uppercase tracking-widest animate-pulse">Syncing Cryptographic Data...</div>
                        )}
                        {blocks.map((block, i) => (
                            <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-[#111111] hover:bg-[#050505] transition-colors gap-4 sm:gap-0">
                                
                                {/* Block ID & Time */}
                                <div className="flex items-center gap-4">
                                    <div className="bg-[#00FF55]/10 p-3 rounded-none border border-[#00FF55]/30">
                                        <Box size={14} className="text-[#00FF55]" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[13px] text-[#00FF55] font-black tracking-widest leading-none">{block.height}</span>
                                        <span className="text-[9px] text-[#888888] uppercase tracking-widest flex items-center gap-1">
                                            <Clock size={8} /> {block.age}
                                        </span>
                                    </div>
                                </div>

                                {/* Validator */}
                                <div className="flex flex-col gap-1 sm:text-right">
                                    <span className="text-[10px] text-[#FFFFFF] uppercase tracking-wide flex items-center sm:justify-end gap-1">
                                        <ShieldCheck size={10} className="text-[#555555]" /> VALIDATOR: <span className="text-[#00FF55]">{block.validator}</span>
                                    </span>
                                    <span className="text-[9px] text-[#888888] uppercase tracking-widest">
                                        {block.txs} TXs <span className="opacity-50">|</span> {block.size}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* LATEST MASSIVE TXS TABLE */}
                <div className="border border-[#222222]/50 bg-[#020202]/80 backdrop-blur-xl shadow-2xl">
                    <div className="flex items-center justify-between p-4 border-b border-[#222222]/50 bg-[#050505]/80">
                        <div className="flex items-center gap-3">
                            <Activity size={16} className="text-[#00FF55]" />
                            <h2 className="text-[12px] font-black uppercase tracking-widest text-[#FFFFFF]">LATEST LARGE TRANSACTIONS</h2>
                        </div>
                        <button className="text-[9px] text-[#00FF55] uppercase tracking-widest font-bold hover:text-white transition-colors">
                            VIEW ALL TXS &gt;
                        </button>
                    </div>

                    <div className="flex flex-col">
                        {massiveTxs.length === 0 && (
                            <div className="p-8 text-center text-[10px] text-[#555555] uppercase tracking-widest animate-pulse">Scanning Mempool...</div>
                        )}
                        {massiveTxs.map((tx, i) => (
                            <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-[#111111] hover:bg-[#050505] transition-colors gap-4 sm:gap-0">
                                
                                {/* TX Info */}
                                <div className="flex items-center gap-4">
                                    <div className="bg-[#333333]/30 p-3 rounded-none border border-[#333333]">
                                        <AlignLeft size={14} className="text-[#888888]" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[12px] text-[#00FF55] font-black tracking-widest leading-none">{tx.hash}</span>
                                        <span className="text-[9px] text-[#888888] uppercase tracking-widest flex items-center gap-1">
                                            <Clock size={8} /> {tx.age}
                                        </span>
                                    </div>
                                </div>

                                {/* Flow Info */}
                                <div className="flex flex-col gap-1.5 sm:text-right mt-2 sm:mt-0">
                                    <div className="flex items-center sm:justify-end gap-2 text-[10px] text-[#888888] uppercase tracking-widest">
                                        From <span className="text-white">{tx.from}</span>
                                        <ArrowRight size={10} className="text-[#555555]" />
                                        To <span className="text-[#00FF55]">{tx.to}</span>
                                    </div>
                                    <div className="flex items-center sm:justify-end gap-2">
                                        <span className="px-2 py-0.5 border border-[#333] text-[8px] text-[#888888]">{tx.type}</span>
                                        <span className="text-[11px] font-black text-white">{tx.value}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

             {/* Footer Info */}
             <div className="text-center pt-8 pb-4 opacity-50">
                 <p className="text-[9px] text-[#FFFFFF] font-mono tracking-[0.3em] uppercase">
                     POWERED BY ZERO-KNOWLEDGE PROOFS
                 </p>
             </div>
            </div>
        </div>
    );
}
