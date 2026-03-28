"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Search, ExternalLink, Zap, ShieldCheck, Banknote, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useTransactionHandler } from '@/hooks/useTransactionHandler';
import { toast } from 'sonner';
import Image from 'next/image';

interface PolyMarket {
    id: string; slug: string; question: string; category: string;
    yesPrice: number; noPrice: number; volume24h: number; volumeTotal: number;
    evSignal: string; image?: string; active: boolean; conditionId?: string;
}

const fmtUsd = (n: number) => {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    return `$${n.toFixed(0)}`;
};

const SIGNAL_COLOR: Record<string, string> = {
    OVERBOUGHT: 'var(--az-rose)', OVERSOLD: 'var(--az-emerald)',
    LEAN_YES: 'var(--az-lime)', LEAN_NO: '#f59e0b', NEUTRAL: 'var(--az-ink)',
};

function Skeleton({ count = 6 }) {
    return (
        <div className="flex flex-col gap-2 p-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex gap-4 p-4 border border-white/5 bg-white/[0.01] rounded-xl">
                    <div className="w-12 h-12 bg-white/5 rounded-lg animate-pulse" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse" />
                        <div className="h-3 bg-white/5 rounded w-1/4 animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function PolymarketPanel() {
    const [markets, setMarkets] = useState<PolyMarket[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [ts, setTs] = useState('');
    const [selected, setSelected] = useState<PolyMarket | null>(null);
    const [tradeAmount, setTradeAmount] = useState('100');

    const { isConnected } = useAccount();
    const { handleExternalTransaction } = useTransactionHandler();
    const [isExecuting, setIsExecuting] = useState<'YES' | 'NO' | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetch(`/api/polymarket/markets?category=${category}&limit=50`);
            const d = await r.json();
            if (d.markets) setMarkets(d.markets);
            setTs(new Date().toLocaleTimeString());
        } catch (e) { console.error("Error loading Polymarket:", e); }
        finally { setLoading(false); }
    }, [category]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { const i = setInterval(load, 30000); return () => clearInterval(i); }, [load]);

    const filtered = markets.filter(m => m.question.toLowerCase().includes(search.toLowerCase()));

    const handleTrade = async (direction: 'YES' | 'NO') => {
        if (!isConnected) {
            toast.error("Wallet no conectada", { description: "Requiere firma On-Chain para operar en Polymarket." });
            return;
        }
        if (!selected) return;

        setIsExecuting(direction);
        try {
            toast.loading(`Generando calldata de ejecución [${direction}]...`, { id: `poly-${selected.id}` });
            
            const response = await fetch('/api/polymarket/trade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    marketId: selected.conditionId || selected.id,
                    direction,
                    amount: tradeAmount,
                    userAddress: window.ethereum?.selectedAddress || '0xUserContextPending'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Execution Engine Error');
            }

            const { tx } = await response.json();
            
            toast.loading("Esperando firma en el proveedor web3...", { id: `poly-${selected.id}` });

            await handleExternalTransaction({
                to: tx.to as `0x${string}`,
                data: tx.data as `0x${string}`,
                value: tx.value || "0",
                chainId: tx.chainId
            });
            
            toast.success("Trade Confirmado On-Chain", { 
                id: `poly-${selected.id}`,
                description: `Has adquirido ${tradeAmount} USDC en acciones de ${direction} para: ${selected.question.slice(0,30)}...` 
            });
        } catch (e: any) {
            toast.error("Trade Fallido", { 
                id: `poly-${selected.id}`,
                description: e.message || "Usuario rechazó la transacción on-chain."
            });
        } finally {
            setIsExecuting(null);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 600 }}>
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4 p-4 border-b border-white/5 bg-white/[0.02]">
                <div className="relative flex-1 min-w-[250px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input 
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar mercados..." 
                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white font-mono outline-none focus:border-white/30 transition-colors"
                    />
                </div>
                <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                    {['all', 'crypto', 'politics', 'sports', 'business'].map(c => (
                        <button 
                            key={c} onClick={() => setCategory(c)}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-mono font-bold tracking-widest uppercase transition-colors ${category === c ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
                <button onClick={load} className="text-white/40 hover:text-white flex items-center gap-2 text-[10px] font-mono tracking-widest border border-white/10 rounded-lg px-3 py-2 bg-black/20">
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> SYNC
                </button>
            </div>

            {/* Markets List */}
            <div className="flex-1 overflow-hidden flex relative">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                    {loading && <Skeleton />}
                    {!loading && filtered.map(m => (
                        <motion.div 
                            key={m.id}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            onClick={() => setSelected(selected?.id === m.id ? null : m)}
                            className={`flex gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selected?.id === m.id ? 'bg-white/[0.08] border-white/20' : 'bg-white/[0.02] border-white/5 hover:border-white/15'}`}
                        >
                            <div className="w-12 h-12 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                {m.image ? <Image src={m.image} alt="" width={48} height={48} className="object-cover" /> : <Banknote size={20} className="text-white/20" />}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <h3 className="text-sm font-bold text-white tracking-tight leading-tight mb-1">{m.question}</h3>
                                <div className="flex items-center gap-3 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                                    <span>{m.category}</span>
                                    <span>•</span>
                                    <span>VOL: {fmtUsd(m.volume24h)}</span>
                                    {m.evSignal !== 'NEUTRAL' && (
                                        <>
                                            <span>•</span>
                                            <span style={{ color: SIGNAL_COLOR[m.evSignal] || 'white' }}>{m.evSignal.replace('_', ' ')}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#14f195]/10 border border-[#14f195]/20 min-w-[60px]">
                                    <span className="text-[9px] text-[#14f195] font-bold uppercase mb-0.5">YES</span>
                                    <span className="text-xs font-mono font-bold text-[#14f195]">{Math.round(m.yesPrice * 100)}¢</span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#f43f5e]/10 border border-[#f43f5e]/20 min-w-[60px]">
                                    <span className="text-[9px] text-[#f43f5e] font-bold uppercase mb-0.5">NO</span>
                                    <span className="text-xs font-mono font-bold text-[#f43f5e]">{Math.round((1 - m.yesPrice) * 100)}¢</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* 1-Click Execution Sidebar */}
                <AnimatePresence>
                    {selected && (
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="w-[340px] border-l border-white/10 bg-[#0a0a0a] flex flex-col shadow-2xl absolute right-0 top-0 bottom-0 z-20"
                        >
                            <div className="p-5 border-b border-white/5">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="w-12 h-12 rounded-lg bg-black/50 border border-white/10 overflow-hidden shrink-0">
                                        {selected.image ? <Image src={selected.image} alt="" width={48} height={48} className="object-cover" /> : <Banknote size={20} className="text-white/20 m-3" />}
                                    </div>
                                    <div className="flex items-center gap-1 text-[9px] font-mono text-[#a855f7] tracking-widest border border-[#a855f7]/30 bg-[#a855f7]/10 px-2 py-1 rounded">
                                        <ShieldCheck size={10} /> ON-CHAIN CTF
                                    </div>
                                </div>
                                <h2 className="text-sm font-bold text-white leading-snug">{selected.question}</h2>
                            </div>

                            <div className="flex-1 p-5 space-y-5 overflow-y-auto">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                                    <div className="text-[10px] font-mono tracking-widest text-white/50 mb-3">ODDS IMPLICADAS</div>
                                    <div className="flex justify-between items-center px-4">
                                        <div className="text-center">
                                            <div className="text-3xl font-black font-mono text-[#14f195]">{Math.round(selected.yesPrice * 100)}%</div>
                                            <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-1">YES</div>
                                        </div>
                                        <div className="w-px h-10 bg-white/10" />
                                        <div className="text-center">
                                            <div className="text-3xl font-black font-mono text-[#f43f5e]">{Math.round((1 - selected.yesPrice) * 100)}%</div>
                                            <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-1">NO</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono tracking-widest text-white/50">TAMAÑO DE LA POSICIÓN (USDC)</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            value={tradeAmount} 
                                            onChange={e => setTradeAmount(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-4 pr-16 text-white font-mono text-xl outline-none focus:border-white/30"
                                            placeholder="0"
                                        />
                                        <button onClick={() => setTradeAmount('1000')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white">MAX</button>
                                    </div>
                                </div>

                                <div className="space-y-1 pt-2">
                                    <div className="flex justify-between text-[10px] font-mono text-white/50">
                                        <span>Payout Potencial (YES):</span>
                                        <span className="text-[#14f195]">{fmtUsd(Number(tradeAmount) / selected.yesPrice)}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-mono text-white/50">
                                        <span>Payout Potencial (NO):</span>
                                        <span className="text-[#f43f5e]">{fmtUsd(Number(tradeAmount) / (1 - selected.yesPrice))}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 border-t border-white/5 grid grid-cols-2 gap-3 bg-[#050505]">
                                <button 
                                    onClick={() => handleTrade('YES')}
                                    disabled={isExecuting !== null || !tradeAmount}
                                    className="col-span-1 py-3 rounded-lg bg-[#14f195]/10 border border-[#14f195]/30 text-[#14f195] hover:bg-[#14f195] hover:text-black font-black uppercase tracking-widest text-xs flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-50"
                                >
                                    {isExecuting === 'YES' ? <Loader2 size={16} className="animate-spin" /> : <>BUY YES <span className="text-[9px] font-mono opacity-60">@{Math.round(selected.yesPrice * 100)}¢</span></>}
                                </button>
                                <button 
                                    onClick={() => handleTrade('NO')}
                                    disabled={isExecuting !== null || !tradeAmount}
                                    className="col-span-1 py-3 rounded-lg bg-[#f43f5e]/10 border border-[#f43f5e]/30 text-[#f43f5e] hover:bg-[#f43f5e] hover:text-black font-black uppercase tracking-widest text-xs flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-50"
                                >
                                    {isExecuting === 'NO' ? <Loader2 size={16} className="animate-spin" /> : <>BUY NO <span className="text-[9px] font-mono opacity-60">@{Math.round((1 - selected.yesPrice) * 100)}¢</span></>}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {ts && <div className="text-[10px] font-mono text-white/30 p-2 border-t border-white/5 bg-black/20 text-center">ÚLTIMO SYNC: {ts} — POLYMARKET CLOB API</div>}
        </div>
    );
}
