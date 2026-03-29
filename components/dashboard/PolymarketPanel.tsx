"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Search, Banknote, ShieldCheck, Loader2, AlertTriangle } from 'lucide-react';
import { useAccount, useSendTransaction, useSwitchChain, useChainId } from 'wagmi';
import { polymarketRouterService } from '@/lib/blockchain/PolymarketRouterService';
import { useLivePortfolio } from '@/hooks/useLivePortfolio';
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
    OVERBOUGHT: '#f43f5e', OVERSOLD: '#00FFAA',
    LEAN_YES: '#00e699', LEAN_NO: '#f59e0b', NEUTRAL: '#888888',
};

function Skeleton({ count = 6 }) {
    return (
        <div className="flex flex-col gap-3 p-6">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex gap-4 p-5 border border-[#E5E5E5] bg-[#FAF9F6] rounded-2xl">
                    <div className="w-12 h-12 bg-[#E5E5E5] rounded-xl animate-pulse" />
                    <div className="flex-1 space-y-3">
                        <div className="h-5 bg-[#E5E5E5] rounded w-3/4 animate-pulse" />
                        <div className="h-3 bg-[#E5E5E5] rounded w-1/4 animate-pulse" />
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
    const [isExecuting, setIsExecuting] = useState<'YES' | 'NO' | null>(null);

    const { isConnected, address } = useAccount();
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();
    const { sendTransactionAsync } = useSendTransaction();
    const { usdcBalance } = useLivePortfolio();
    
    const isPolygon = chainId === 137;

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
        const toastId = toast.loading(`Iniciando enrutamiento [${direction}]...`);
        
        try {
            let txPayload;
            
            if (isPolygon) {
                const res = await polymarketRouterService.buildTradeTransaction(
                    selected.conditionId || selected.id, 
                    direction, 
                    tradeAmount
                );
                txPayload = res.tx;
                toast.loading("Esperando firma nativa Polygon...", { id: toastId });
            } else {
                toast.loading("Calculando ruta óptima Cross-Chain (Enso)...", { id: toastId });
                const res = await polymarketRouterService.buildCrossChainTradeTransaction(
                    selected.conditionId || selected.id, 
                    direction, 
                    tradeAmount,
                    address as string,
                    chainId
                );
                txPayload = res.tx;
                toast.loading("Firma la inyección Cross-Chain en tu wallet...", { id: toastId });
            }

            const hash = await sendTransactionAsync({
                to: txPayload.to as `0x${string}`,
                data: txPayload.data as `0x${string}`,
                value: BigInt(txPayload.value || "0")
            });
            
            toast.success("Trade Confirmado On-Chain", { 
                id: toastId,
                description: `Has adquirido ${tradeAmount} USDC en acciones de ${direction}. Hash: ${hash.slice(0, 10)}...` 
            });
            
            setSelected(null); // Close sidebar on success
        } catch (e: any) {
            toast.error("Trade Fallido", { 
                id: toastId,
                description: e.message || "Usuario rechazó la transacción on-chain."
            });
        } finally {
            setIsExecuting(null);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-105px)] bg-[#FFFFFF] text-[#111111] font-sans">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4 p-6 border-b border-[#E5E5E5] bg-[#FAF9F6]">
                <div className="relative flex-1 min-w-[250px] max-w-md">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888]" />
                    <input 
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar mercados institucionales..." 
                        className="w-full bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl pl-11 pr-4 py-3 text-sm text-[#111111] font-medium outline-none focus:border-[#111111] transition-colors shadow-sm"
                    />
                </div>
                <div className="flex bg-[#E5E5E5]/40 p-1.5 rounded-xl border border-[#E5E5E5]">
                    {['all', 'crypto', 'politics', 'sports', 'business'].map(c => (
                        <button 
                            key={c} onClick={() => setCategory(c)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-all shadow-sm ${category === c ? 'bg-[#FFFFFF] text-[#111111] border border-[#E5E5E5]' : 'text-[#888888] hover:text-[#111111] border border-transparent hover:bg-white/50'}`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
                <button onClick={load} className="ml-auto text-[#888888] hover:text-[#111111] flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-[#E5E5E5] rounded-xl px-4 py-3 bg-[#FFFFFF] shadow-sm hover:border-[#111111]/20 transition-all">
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> SYNC
                </button>
            </div>

            {/* Markets List */}
            <div className="flex flex-1 overflow-hidden relative">
                <div className="p-6 space-y-4 flex-1 w-full overflow-y-auto no-scrollbar">
                    {loading && <Skeleton />}
                    {!loading && filtered.map(m => (
                        <motion.div 
                            key={m.id}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            onClick={() => setSelected(selected?.id === m.id ? null : m)}
                            className={`flex gap-5 p-5 rounded-[1.5rem] border cursor-pointer transition-all ${selected?.id === m.id ? 'bg-[#FAF9F6] border-[#111111]/20 shadow-md' : 'bg-[#FFFFFF] border-[#E5E5E5] hover:border-[#111111]/10 hover:shadow-sm'}`}
                        >
                            <div className="w-14 h-14 rounded-xl bg-[#FAF9F6] border border-[#E5E5E5] flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                                {m.image ? <Image src={m.image} alt="" width={56} height={56} className="object-cover" /> : <Banknote size={24} className="text-[#888888]" />}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <h3 className="text-base font-black text-[#111111] tracking-tight leading-snug mb-2 truncate max-w-[90%]">{m.question}</h3>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-[#888888] uppercase tracking-widest">
                                    <span className="bg-[#E5E5E5]/50 px-2 py-0.5 rounded text-[#111111]">{m.category}</span>
                                    <span>•</span>
                                    <span>VOL: {fmtUsd(m.volume24h)}</span>
                                    {m.evSignal !== 'NEUTRAL' && (
                                        <>
                                            <span>•</span>
                                            <span style={{ color: SIGNAL_COLOR[m.evSignal] || '#111111' }} className="font-black">{m.evSignal.replace('_', ' ')}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#00e699]/10 border border-[#00e699]/20 min-w-[65px]">
                                    <span className="text-[10px] text-[#00dda8] font-black uppercase tracking-widest mb-1">YES</span>
                                    <span className="text-sm font-mono font-black text-[#00dda8]">{Math.round(m.yesPrice * 100)}¢</span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#f43f5e]/10 border border-[#f43f5e]/20 min-w-[65px]">
                                    <span className="text-[10px] text-[#f43f5e] font-black uppercase tracking-widest mb-1">NO</span>
                                    <span className="text-sm font-mono font-black text-[#f43f5e]">{Math.round((1 - m.yesPrice) * 100)}¢</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* 1-Click Execution Sidebar (Molecular UI Accuracy) */}
                <AnimatePresence>
                    {selected && (
                        <motion.div
                            initial={{ x: '100%', opacity: 0 }} 
                            animate={{ x: 0, opacity: 1 }} 
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="w-[420px] shrink-0 border-l border-[#E5E5E5] bg-[#FFFFFF] flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.03)] h-full z-20"
                        >
                            <div className="p-8 border-b border-[#E5E5E5] bg-[#FAF9F6]">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white border border-[#E5E5E5] overflow-hidden shrink-0 shadow-sm p-1">
                                        <div className="w-full h-full rounded-xl overflow-hidden relative bg-[#FAF9F6]">
                                            {selected.image ? <Image src={selected.image} alt="" fill className="object-cover" /> : <Banknote size={24} className="text-[#888888] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setSelected(null)}
                                        className="text-[#888888] hover:text-[#111111] p-1 border border-transparent rounded hover:border-[#E5E5E5]"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="flex items-center gap-1.5 text-[9px] font-black bg-[#E5E5E5]/50 text-[#888888] tracking-widest px-2.5 py-1 rounded inline-flex mb-3">
                                    <ShieldCheck size={11} /> {isPolygon ? 'ON-CHAIN CTF EXECUTION' : 'CROSS-CHAIN ROUTING (ENSO)'}
                                </div>
                                <h2 className="text-xl font-black text-[#111111] leading-tight tracking-tight">{selected.question}</h2>
                            </div>

                            <div className="flex-1 p-8 space-y-8 overflow-y-auto">
                                
                                {/* ODDS IMPLICADAS REPLICA */}
                                <div className="bg-[#FAF9F6] border border-[#E5E5E5] rounded-[2rem] p-6 text-center shadow-sm">
                                    <div className="flex items-center justify-center gap-2 text-[11px] font-mono font-bold tracking-[0.2em] text-[#888888] mb-6">
                                        ODDS IMPLICADAS
                                    </div>
                                    <div className="flex justify-between items-center px-4">
                                        <div className="flex-1 text-center">
                                            <div className="text-5xl font-black font-sans text-[#00e699] tracking-tighter mb-2">{Math.round(selected.yesPrice * 100)}%</div>
                                            <div className="text-[10px] font-mono font-bold text-[#888888] uppercase tracking-widest">YES</div>
                                        </div>
                                        <div className="w-px h-16 bg-[#E5E5E5]" />
                                        <div className="flex-1 text-center">
                                            <div className="text-5xl font-black font-sans text-[#f43f5e] tracking-tighter mb-2">{Math.round((1 - selected.yesPrice) * 100)}%</div>
                                            <div className="text-[10px] font-mono font-bold text-[#888888] uppercase tracking-widest">NO</div>
                                        </div>
                                    </div>
                                </div>

                                {/* INPUT REPLICA */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#888888] uppercase">TAMAÑO DE LA POSICIÓN (USDC)</label>
                                    </div>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            value={tradeAmount} 
                                            onChange={e => setTradeAmount(e.target.value)}
                                            className="w-full bg-[#FFFFFF] border-2 border-[#E5E5E5] rounded-2xl py-4 pl-6 pr-20 text-[#111111] font-mono font-black text-2xl outline-none focus:border-[#111111] transition-all"
                                            placeholder="0"
                                        />
                                        <button 
                                            onClick={() => setTradeAmount(usdcBalance || '1000')} 
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-sans font-black bg-[#E5E5E5]/50 hover:bg-[#111111] hover:text-[#FFFFFF] text-[#111111] px-4 py-2 rounded-xl transition-all"
                                        >
                                            MAX
                                        </button>
                                    </div>
                                    <div className="flex justify-end text-[10px] font-mono text-[#888888] font-bold px-1">
                                        Bal: ${usdcBalance}
                                    </div>
                                </div>

                                {/* PAYOUT REPLICA */}
                                <div className="space-y-3 pt-2">
                                    <div className="flex justify-between items-center text-[12px] font-mono font-bold text-[#888888]">
                                        <span>Payout Potencial (YES):</span>
                                        <span className="text-[#00e699] font-black">{fmtUsd(Number(tradeAmount) / selected.yesPrice)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[12px] font-mono font-bold text-[#888888]">
                                        <span>Payout Potencial (NO):</span>
                                        <span className="text-[#f43f5e] font-black">{fmtUsd(Number(tradeAmount) / (1 - selected.yesPrice))}</span>
                                    </div>
                                </div>
                            </div>

                            {/* BUY BUTTONS REPLICA */}
                            <div className="p-6 border-t border-[#E5E5E5] bg-[#FFFFFF] flex gap-4">
                                <button 
                                    onClick={() => handleTrade('YES')}
                                    disabled={isExecuting !== null || !tradeAmount || parseFloat(tradeAmount) <= 0}
                                    className="flex-1 py-5 rounded-2xl bg-[#00e699]/10 border-2 border-[#00e699]/20 hover:bg-[#00e699]/20 text-[#00dda8] font-black uppercase tracking-widest text-sm flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-50"
                                >
                                    {isExecuting === 'YES' ? <Loader2 size={24} className="animate-spin text-[#00dda8]" /> : <>BUY YES <span className="text-[10px] font-black opacity-80 mt-0.5">@{Math.round(selected.yesPrice * 100)}¢</span></>}
                                </button>
                                <button 
                                    onClick={() => handleTrade('NO')}
                                    disabled={isExecuting !== null || !tradeAmount || parseFloat(tradeAmount) <= 0}
                                    className="flex-1 py-5 rounded-2xl bg-[#f43f5e]/10 border-2 border-[#f43f5e]/20 hover:bg-[#f43f5e]/20 text-[#f43f5e] font-black uppercase tracking-widest text-sm flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-50"
                                >
                                    {isExecuting === 'NO' ? <Loader2 size={24} className="animate-spin text-[#f43f5e]" /> : <>BUY NO <span className="text-[10px] font-black opacity-80 mt-0.5">@{Math.round((1 - selected.yesPrice) * 100)}¢</span></>}
                                </button>
                            </div>
                            
                            {!isPolygon && isConnected && (
                                <div className="px-6 pb-6 bg-[#FFFFFF]">
                                    <div className="w-full bg-[#0055ff]/5 text-[#0055ff] font-black uppercase tracking-widest text-[10px] py-3 px-4 rounded-xl flex justify-between items-center gap-2 border border-[#0055ff]/10">
                                        <span className="flex items-center gap-2"><AlertTriangle size={12} /> ROUTE: L2 ➔ POLYGON (~45s)</span>
                                        <button onClick={() => switchChain?.({ chainId: 137 })} className="underline hover:opacity-70 text-[9px]">SWITCH NATIVE</button>
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {ts && <div className="text-[9px] font-mono font-black text-[#888888] p-3 border-t border-[#E5E5E5] bg-[#FAF9F6] text-center uppercase tracking-widest">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00FFAA] mr-2" />
                CTF ROUTER SYNC: {ts}
            </div>}
        </div>
    );
}
