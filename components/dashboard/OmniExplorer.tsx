"use client";

import React, { useState, useEffect } from "react";
import { 
    Search, Activity, Box, ArrowRight, Clock, ShieldCheck, 
    AlignLeft, Loader2, AlertCircle, X, ChevronRight, Zap
} from "lucide-react";
import { useAccount, usePublicClient, useBlockNumber } from 'wagmi';
import { formatEther } from 'viem';
import { OmniMatrixCanvas } from '@/components/3d/OmniMatrixCanvas';

export function OmniExplorer() {
    const { address } = useAccount();
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<any[] | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [selectedBlock, setSelectedBlock] = useState<any | null>(null);
    const [selectedTx, setSelectedTx] = useState<any | null>(null);

    const publicClient = usePublicClient();
    const { data: blockNumber } = useBlockNumber({ watch: true });
    
    const [blocks, setBlocks] = useState<any[]>([]);
    const [massiveTxs, setMassiveTxs] = useState<any[]>([]);

    // ── On-chain block feed ─────────────────────────────────────────────────
    useEffect(() => {
        if (!address || !publicClient || !blockNumber) return;

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
    }, [blockNumber, publicClient, address]);

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
        <div className="relative min-h-full w-full font-sans p-4 md:p-8 flex flex-col selection:bg-[#00F2EA]/20 selection:text-black overflow-hidden bg-transparent">
            
            <OmniMatrixCanvas />

            <div className="relative z-10 w-full h-full overflow-y-auto flex flex-col gap-12 custom-scrollbar">
                {/* Header / Search Area */}
                <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto pt-16 pb-12 gap-10">
                    <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-3 mb-2">
                             <div className="w-1.5 h-4 bg-[#00F2EA] rounded-full" />
                             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30">Institutional Explorer V2.4</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-black leading-none">
                            WHALE <span className="text-[#00F2EA]">NETWORK</span>
                        </h1>
                    </div>

                    <div className="w-full relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                            {isSearching
                                ? <Loader2 size={20} className="text-[#00F2EA] animate-spin" />
                                : <Search size={20} className="text-black/20 group-focus-within:text-[#00F2EA] transition-colors" />}
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full bg-white border border-black/[0.08] focus:border-[#00F2EA] text-black p-7 pl-16 outline-none transition-all text-sm uppercase tracking-widest placeholder:text-black/20 rounded-[2rem] shadow-2xl focus:shadow-[0_0_40px_rgba(0,242,234,0.1)]"
                            placeholder="SCAN ADDRESS / TX HASH / TOKEN / ENS"
                        />
                        <button
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="absolute inset-y-3 right-3 bg-black text-white px-10 font-bold text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl shadow-xl"
                        >
                            {isSearching ? 'SCANNING...' : 'SCAN'}
                        </button>
                    </div>

                    {/* Search Results / Errors */}
                    {searchError && (
                        <div className="w-full border border-[#FF3B30]/20 bg-[#FF3B30]/5 backdrop-blur-md p-5 rounded-2xl flex items-center gap-4 text-[#FF3B30]">
                            <AlertCircle size={18} className="shrink-0" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{searchError}</span>
                        </div>
                    )}

                    {searchResults !== null && (
                        <div className="w-full border border-black/[0.08] bg-white rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="flex items-center justify-between p-6 bg-black/5 border-b border-black/[0.03]">
                                <div className="flex items-center gap-3">
                                    <Zap size={14} className="text-[#00F2EA]" />
                                    <h2 className="text-[12px] font-black uppercase tracking-widest">QUERY RESULTS</h2>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/30">
                                    {searchResults.length} NODES IDENTIFIED
                                </span>
                            </div>
                            {searchResults.length === 0 ? (
                                <div className="p-12 text-center text-[11px] font-black text-black/20 uppercase tracking-[0.4em]">
                                    Graph index return null for &quot;{searchQuery}&quot;
                                </div>
                            ) : (
                                <div className="flex flex-col divide-y divide-black/[0.04]">
                                    {searchResults.map((result: any, i: number) => {
                                        const entity = result.node || result.n || result;
                                        const label = result.label || entity._labels?.[0] || 'Entity';
                                        const name = entity.name || entity.address || entity.symbol || entity.id || 'Unknown';
                                        return (
                                            <div key={i} className="flex items-center justify-between p-6 hover:bg-black/5 transition-colors group cursor-pointer">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[14px] text-black font-black tracking-tighter group-hover:text-[#00F2EA] transition-colors">{name}</span>
                                                    {entity.description && (
                                                        <span className="text-[10px] text-black/30 font-bold uppercase tracking-widest">{entity.description}</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="px-3 py-1 bg-black/5 border border-black/[0.06] text-[9px] font-black text-black/30 rounded-lg uppercase tracking-widest">{label}</span>
                                                    <ChevronRight size={14} className="text-black/10 group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Data Grids */}
                <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 pb-20">
                    
                    {/* BLOCKS PANEL */}
                    <div className="border border-black/[0.08] bg-white rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between p-8 bg-black/5 border-b border-black/[0.03]">
                            <div className="flex items-center gap-3">
                                <Box size={16} className="text-[#00F2EA]" />
                                <h2 className="text-[13px] font-black uppercase tracking-[0.2em] text-black">BLOCK TELEMETRY</h2>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20">LIVE STREAMING</span>
                        </div>

                        <div className="flex flex-col">
                            {blocks.length === 0 && (
                                <div className="p-16 text-center text-[11px] font-black text-black/10 uppercase tracking-[0.4em] animate-pulse">Establishing Peer Link...</div>
                            )}
                            {blocks.map((block, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => setSelectedBlock(block)}
                                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-8 border-b border-black/[0.03] hover:bg-black/5 transition-all gap-6 group"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-black/5 rounded-2xl flex items-center justify-center border border-black/[0.06] group-hover:bg-black group-hover:text-white transition-all">
                                            <Box size={18} />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-xl font-black text-black tracking-tighter group-hover:text-[#00F2EA] transition-colors">{block.height}</span>
                                            <span className="text-[10px] font-black text-black/20 uppercase tracking-widest flex items-center gap-2">
                                                <Clock size={10} /> {block.age}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 sm:text-right">
                                        <div className="text-[10px] font-black text-black/40 uppercase tracking-widest flex items-center sm:justify-end gap-2">
                                            <ShieldCheck size={12} className="text-[#00F2EA]" /> 
                                            VALIDATOR: <span className="text-black font-bold">{block.validator}</span>
                                        </div>
                                        <div className="text-[10px] font-black text-black/20 uppercase tracking-widest flex items-center sm:justify-end gap-3">
                                            <span>{block.txs} TXS</span>
                                            <span className="h-3 w-[1px] bg-black/[0.08]" />
                                            <span>{block.size}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* TRANSACTIONS PANEL */}
                    <div className="border border-black/[0.08] bg-white rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between p-8 bg-black/5 border-b border-black/[0.03]">
                            <div className="flex items-center gap-3">
                                <Activity size={16} className="text-[#00F2EA]" />
                                <h2 className="text-[13px] font-black uppercase tracking-[0.2em] text-black">INSTITUTIONAL FLOWS</h2>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20">MEMPOOL STATUS: ACTIVE</span>
                        </div>

                        <div className="flex flex-col">
                            {massiveTxs.length === 0 && (
                                <div className="p-16 text-center text-[11px] font-black text-black/10 uppercase tracking-[0.4em] animate-pulse">Syncing Mempool Hub...</div>
                            )}
                            {massiveTxs.map((tx, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => setSelectedTx(tx)}
                                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-8 border-b border-black/[0.03] hover:bg-black/5 transition-all gap-6 group"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-black/5 rounded-2xl flex items-center justify-center border border-black/[0.06] group-hover:border-[#00F2EA] transition-all">
                                            <AlignLeft size={18} className="text-black/20 group-hover:text-[#00F2EA]" />
                                        </div>
                                        <div className="flex flex-col gap-1.5 min-w-0">
                                            <span className="text-[14px] font-black text-black tracking-widest truncate group-hover:text-[#00F2EA] transition-colors">{tx.hash}</span>
                                            <span className="text-[10px] font-black text-black/20 uppercase tracking-widest flex items-center gap-2">
                                                <Clock size={10} /> {tx.age}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 sm:text-right mt-2 sm:mt-0">
                                        <div className="flex items-center sm:justify-end gap-3 text-[10px] font-black text-black/20 uppercase tracking-widest">
                                            <span className="text-black/40">{tx.from}</span>
                                            <ArrowRight size={12} className="text-black/10" />
                                            <span className="text-[#00F2EA]">{tx.to}</span>
                                        </div>
                                        <div className="flex items-center sm:justify-end gap-4">
                                            <span className="px-2.5 py-1 bg-black/5 text-[9px] font-black text-black/30 rounded-lg uppercase tracking-widest">{tx.type}</span>
                                            <span className="text-lg font-black text-black tracking-tighter">{tx.value}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                 {/* INSPECTION MODALS */}
                 {(selectedBlock || selectedTx) && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#FAF9F6]/80 backdrop-blur-3xl">
                        <div className="w-full max-w-2xl bg-white border border-black/[0.08] rounded-[3.5rem] shadow-2xl overflow-hidden relative">
                            <button 
                                onClick={() => { setSelectedBlock(null); setSelectedTx(null); }}
                                className="absolute top-8 right-8 w-12 h-12 bg-black/5 rounded-full flex items-center justify-center text-black/20 hover:text-black hover:bg-black/10 transition-all active:scale-90"
                            >
                                <X size={20} />
                            </button>

                            <div className="p-12 md:p-16">
                                <div className="flex items-center gap-6 mb-12">
                                    <div className="w-16 h-16 bg-[#00F2EA]/10 border border-[#00F2EA]/20 rounded-3xl flex items-center justify-center">
                                        {selectedBlock ? <Box size={28} className="text-[#00F2EA]" /> : <Activity size={28} className="text-[#00F2EA]" />}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-3xl font-black uppercase tracking-tighter text-black">
                                            {selectedBlock ? 'BLOCK INTELLIGENCE' : 'TX AUDIT LOG'}
                                        </h3>
                                        <span className="text-[11px] font-black text-black/20 uppercase tracking-[0.4em]">Handshake Protocol // Active</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {selectedBlock ? (
                                        <>
                                            <DetailRow label="Block Height" value={selectedBlock.height} />
                                            <DetailRow label="Strategic Miner" value={selectedBlock.validator} copy />
                                            <DetailRow label="Timestamp" value={selectedBlock.age} />
                                            <DetailRow label="Payload Size" value={selectedBlock.size} />
                                            <DetailRow label="Tx Density" value={selectedBlock.txs + ' Transactions'} />
                                        </>
                                    ) : (
                                        <>
                                            <DetailRow label="Tx Hash" value={selectedTx.hash} copy />
                                            <DetailRow label="Origin Source" value={selectedTx.from} copy />
                                            <DetailRow label="Target Destination" value={selectedTx.to} copy />
                                            <DetailRow label="Transfer Value" value={selectedTx.value} highlight />
                                            <DetailRow label="Payload Type" value={selectedTx.type} />
                                            <DetailRow label="Infrastructure" value="HumanId Institutional Verified" green />
                                        </>
                                    )}
                                </div>

                                <button
                                    onClick={() => { setSelectedBlock(null); setSelectedTx(null); }}
                                    className="w-full mt-12 py-6 bg-black text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[12px] hover:scale-[1.02] active:scale-[0.95] transition-all shadow-2xl shadow-black/20"
                                >
                                    CLOSE INSPECTION
                                </button>
                            </div>
                        </div>
                    </div>
                 )}

                 {/* Institutional Footer */}
                 <div className="text-center pt-12 pb-8">
                     <div className="flex items-center justify-center gap-4 opacity-10">
                         <div className="h-[1px] w-20 bg-black" />
                         <p className="text-[10px] text-black font-black tracking-[0.6em] uppercase">SYSTEM.ZERO.KNOWLEDGE</p>
                         <div className="h-[1px] w-20 bg-black" />
                     </div>
                 </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value, copy, highlight, green }: any) {
    return (
        <div className="flex items-center justify-between py-5 border-b border-black/[0.04]">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/20">{label}</span>
            <div className="flex items-center gap-3">
                <span className={`text-[15px] font-black ${highlight ? 'text-black' : green ? 'text-[#00C076]' : 'text-black/70'} tracking-tighter`}>
                    {value}
                </span>
                {copy && (
                    <button className="p-2 hover:bg-black/5 rounded-xl transition-all text-black/10 hover:text-black">
                        <ShieldCheck size={14} />
                    </button>
                )}
            </div>
        </div>
    );
}
