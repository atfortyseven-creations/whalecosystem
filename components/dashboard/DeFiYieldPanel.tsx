"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, RefreshCw, AlertTriangle, ExternalLink, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useTransactionHandler } from '@/hooks/useTransactionHandler';
import { toast } from 'sonner';

interface DeFiPool {
    pool: string; chain: string; chainFull?: string; project: string;
    symbol: string; apy: number; apyBase: number; apyReward: number;
    tvlUsd: number; ilRisk: string; stablecoin: boolean;
    url: string; riskScore: number; tier: string;
}

const fmtUsd = (n: number) => {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    return `$${n.toFixed(0)}`;
};
const fmtApy  = (n: number) => `${n.toFixed(2)}%`;

const RISK: Record<number, { label: string; color: string }> = {
    1: { label: 'SAFE',        color: 'var(--az-emerald)' },
    2: { label: 'LOW',         color: 'var(--az-emerald)' },
    3: { label: 'MODERATE',    color: 'var(--az-amber)' },
    4: { label: 'HIGH',        color: '#ff7a3c' },
    5: { label: 'AGGRESSIVE',  color: 'var(--az-rose)' },
};

const CHAIN_CLS: Record<string, string> = {
    Ethereum: 'az-chain-pill az-chain-eth', Arbitrum: 'az-chain-pill az-chain-arb',
    Base: 'az-chain-pill az-chain-base', Optimism: 'az-chain-pill az-chain-op',
    BSC: 'az-chain-pill az-chain-bnb', Solana: 'az-chain-pill az-chain-sol',
};
const chainCls = (c: string) => CHAIN_CLS[c] || 'az-chain-pill az-badge-ghost';

function SkeletonRows({ n = 8 }: { n?: number }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {Array.from({ length: n }).map((_, i) => (
                <div key={i} style={{ padding: '12px 16px', display: 'flex', gap: 12 }}>
                    <div className="az-skeleton" style={{ flex: 1, height: 10, borderRadius: 0 }} />
                    <div className="az-skeleton" style={{ width: 60, height: 10 }} />
                    <div className="az-skeleton" style={{ width: 70, height: 10 }} />
                    <div className="az-skeleton" style={{ width: 50, height: 10 }} />
                </div>
            ))}
        </div>
    );
}

export default function DeFiYieldPanel() {
    const [pools, setPools] = useState<DeFiPool[]>([]);
    const [stats, setStats] = useState({ avgApy: 0, maxApy: 0, stablePools: 0, totalTvl: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stableOnly, setStableOnly] = useState(false);
    const [minApy, setMinApy] = useState(3);
    const [chain, setChain] = useState('all');
    const [riskMax, setRiskMax] = useState(5);
    const [selected, setSelected] = useState<DeFiPool | null>(null);
    const [ts, setTs] = useState('');

    const { isConnected } = useAccount();
    const { handleExternalTransaction } = useTransactionHandler();
    const [isDepositing, setIsDepositing] = useState(false);
    const [depositAmount, setDepositAmount] = useState('1000');

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const r = await fetch(`/api/defi/yields?limit=100&minApy=${minApy}&chain=${chain}`);
            const d = await r.json();
            if (d.error) throw new Error(d.error);
            setStats(d.stats || {});
            setTs(new Date(d.timestamp).toISOString().slice(11, 19));
            let p: DeFiPool[] = d.pools || [];
            if (stableOnly) p = p.filter(x => x.stablecoin);
            if (riskMax < 5) p = p.filter(x => x.riskScore <= riskMax);
            setPools(p);
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    }, [minApy, chain, stableOnly, riskMax]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { const i = setInterval(load, 60000); return () => clearInterval(i); }, [load]);

    const CHAINS = ['all', 'Ethereum', 'Arbitrum', 'Base', 'Optimism', 'Polygon', 'BSC', 'Solana'];

    const handleOneClickDeposit = async () => {
        if (!isConnected) {
            toast.error("Wallet no conectada", { description: "Conecta tu wallet para ejecutar depósitos On-Chain." });
            return;
        }
        if (!selected) return;
        
        setIsDepositing(true);
        try {
            toast.loading("Generando calldata óptima...", { id: `dep-${selected.pool}` });
            
            // Send routing intent to Execution Engine (Enso API via Backend)
            const response = await fetch('/api/defi/deposit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chain: selected.chainFull || selected.chain,
                    poolAddress: selected.pool, // The DeFiLlama pool representing the receipt token
                    amount: depositAmount,
                    userAddress: isConnected ? window.ethereum?.selectedAddress || '0xUserContextPending' : null
                })
            });

            if (!response.ok) {
                const j = await response.json();
                throw new Error(j.error || "Execution Engine Falló la Ruta");
            }

            const { tx } = await response.json();
            
            toast.loading("Esperando firma en el proveedor web3...", { id: `dep-${selected.pool}` });

            // Ejecutar transacción real On-Chain via wagmi router handler
            await handleExternalTransaction({
                to: tx.to as `0x${string}`,
                data: tx.data as `0x${string}`,
                value: tx.value || "0",
                chainId: tx.chainId
            });
            
            toast.success("Depósito Confirmado On-Chain", { 
                id: `dep-${selected.pool}`,
                description: `Has depositado exitosamente en ${selected.project} en la red ${selected.chainFull || selected.chain}` 
            });
        } catch (e: any) {
            toast.error("Depósito Fallido", { 
                id: `dep-${selected.pool}`,
                description: e.message || "Usuario rechazó la transacción o falló la estimación de gas."
            });
        } finally {
            setIsDepositing(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 600 }}>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                {[
                    { label: 'APY MÁXIMO',    value: fmtApy(stats.maxApy),              color: 'var(--az-lime)' },
                    { label: 'APY PROMEDIO',  value: fmtApy(stats.avgApy),              color: 'var(--az-ink)' },
                    { label: 'POOLS STABLE',  value: stats.stablePools,                color: 'var(--az-emerald)' },
                    { label: 'TVL TOTAL',     value: fmtUsd(stats.totalTvl),            color: 'rgba(255, 255, 255, 0.50)' },
                ].map(s => (
                    <div key={s.label} className="az-stat-card border-r border-white/5 last:border-0 hover:bg-white/[0.02]">
                        <div className="az-label text-white/50">{s.label}</div>
                        <div className="az-value-lg" style={{ color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, flexWrap: 'wrap', background: 'rgba(255,255,255,0.02)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input type="checkbox" checked={stableOnly} onChange={e => setStableOnly(e.target.checked)} style={{ accentColor: 'var(--az-lime)' }} />
                    <span className="az-label text-white/70">STABLE ONLY</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Filter size={10} color="var(--az-ink-3)" />
                    <span className="az-label text-white/50">APY MIN:</span>
                    <select value={minApy} onChange={e => setMinApy(+e.target.value)} className="bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-white font-mono outline-none">
                        {[3,5,8,10,15,20,30].map(v => <option key={v} value={v}>{v}%</option>)}
                    </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="az-label text-white/50">CADENA:</span>
                    <select value={chain} onChange={e => setChain(e.target.value)} className="bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-white font-mono outline-none">
                        {CHAINS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="az-label text-white/50">RIESGO MAX:</span>
                    <select value={riskMax} onChange={e => setRiskMax(+e.target.value)} className="bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-white font-mono outline-none">
                        {[1,2,3,4,5].map(v => <option key={v} value={v}>{v} — {RISK[v]?.label}</option>)}
                    </select>
                </div>
                <button onClick={load} className="az-btn-ghost ml-auto text-white/50 hover:text-white" style={{ padding: '6px 12px', fontSize: 10 }}>
                    <RefreshCw size={11} className={loading ? 'animate-spin' : ''} /> ACTUALIZAR
                </button>
            </div>

            {/* Table */}
            <div className="flex relative">
                <div className="custom-scrollbar flex-1 w-full">
                    {error && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', color: 'var(--az-rose)', fontSize: 11 }}>
                            <AlertTriangle size={12} /> <span>{error}</span>
                        </div>
                    )}
                    {!loading && pools.length > 0 && (
                        <div className="az-col-header grid grid-cols-6 gap-8 p-4 border-b border-white/5 sticky top-0 bg-[#050505]/95 backdrop-blur z-10 text-[10px] font-mono tracking-widest text-white/40 uppercase">
                            <span className="col-span-2">POOL</span>
                            <span style={{ textAlign: 'right' }}>CADENA</span>
                            <span style={{ textAlign: 'right' }}>APY</span>
                            <span style={{ textAlign: 'right' }}>TVL</span>
                            <span style={{ textAlign: 'right' }}>RIESGO</span>
                        </div>
                    )}
                    {loading && <SkeletonRows />}
                    <AnimatePresence initial={false}>
                        {pools.map((p, i) => {
                            const risk = RISK[p.riskScore] || RISK[5];
                            const isActive = selected?.pool === p.pool;
                            return (
                                <motion.div
                                    key={p.pool}
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15, delay: i * 0.008 }}
                                    className={`az-data-row grid grid-cols-6 gap-8 p-4 border-b border-white/5 hover:bg-white/[0.03] cursor-pointer transition-colors ${isActive ? 'bg-white/[0.05]' : ''}`}
                                    onClick={() => setSelected(isActive ? null : p)}
                                >
                                    <div className="col-span-2 overflow-hidden flex flex-col gap-1">
                                        <span className="text-sm font-bold text-white tracking-tight truncate">{p.symbol}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] uppercase text-white/40 tracking-wider truncate">{p.project}</span>
                                            {p.stablecoin && <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-[#14f195]/10 text-[#14f195]">STABLE</span>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                        <span className={chainCls(p.chainFull || p.chain)}>{p.chain}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                        <span className="text-sm font-mono font-bold" style={{ color: p.apy >= 20 ? 'var(--az-lime)' : p.apy >= 10 ? 'var(--az-emerald)' : 'white' }}>
                                            {fmtApy(p.apy)}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                        <span className="text-sm font-mono text-white/70">{fmtUsd(p.tvlUsd)}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                        <span className="text-[10px] font-bold tracking-widest px-2 py-1 rounded" style={{ color: risk.color, background: `${risk.color}15` }}>{risk.label}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Detail panel with 1-Click Execution */}
                <AnimatePresence>
                    {selected && (
                        <motion.div
                            initial={{ x: 400, opacity: 0 }} 
                            animate={{ x: 0, opacity: 1 }} 
                            exit={{ x: 400, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                            className="w-[360px] flex-shrink-0 border-l border-white/10 bg-[#0a0a0a] flex flex-col sticky top-[130px] h-[calc(100vh-130px)] shadow-2xl z-20"
                        >
                            <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent">
                                <div className="text-[10px] font-mono tracking-widest text-[#a855f7] mb-2 uppercase flex items-center gap-2 relative">
                                    <ShieldCheck size={12} /> ON-CHAIN EXECUTION
                                </div>
                                <div className="text-2xl font-bold font-mono tracking-tight text-white mb-1">{selected.symbol}</div>
                                <div className="text-xs text-white/40 uppercase">{selected.project} · {selected.chainFull || selected.chain}</div>
                            </div>
                            
                            <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                                {/* APY Hero */}
                                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 text-center shadow-inner relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[#14f195]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="text-[10px] uppercase font-mono tracking-widest text-white/50 mb-2">Total Net APY</div>
                                    <div className="text-4xl font-black font-mono text-[#14f195] drop-shadow-[0_0_15px_rgba(20,241,149,0.3)]">{fmtApy(selected.apy)}</div>
                                    <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-white/5">
                                        <div className="flex flex-col"><span className="text-[9px] text-white/40 uppercase">Base</span> <span className="text-xs font-mono font-bold text-white/90">{fmtApy(selected.apyBase)}</span></div>
                                        <div className="flex flex-col"><span className="text-[9px] text-white/40 uppercase">Reward</span> <span className="text-xs font-mono font-bold text-white/90">{fmtApy(selected.apyReward)}</span></div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { l: 'TVL',           v: fmtUsd(selected.tvlUsd) },
                                        { l: 'IL RISK',       v: selected.ilRisk === 'no' ? 'NONE' : selected.ilRisk.toUpperCase() },
                                        { l: 'RISK SCORE',    v: `${selected.riskScore}/5 — ${RISK[selected.riskScore]?.label}` },
                                        { l: 'ASSET TYPE',    v: selected.stablecoin ? 'STABLECOIN' : 'VOLATILE' },
                                    ].map(row => (
                                        <div key={row.l} className="flex justify-between items-center py-2 border-b border-white/5">
                                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{row.l}</span>
                                            <span className="text-sm font-mono font-bold text-white/90">{row.v}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="text-[10px] font-mono tracking-widest text-white/50 mb-3">DEPOSIT AMOUNT (USDC)</div>
                                    <input 
                                        type="number" 
                                        value={depositAmount} 
                                        onChange={e => setDepositAmount(e.target.value)} 
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white font-mono text-xl outline-none focus:border-[#14f195]/50 transition-colors"
                                        placeholder="0.00"
                                    />
                                    <div className="mt-3 text-[10px] font-mono text-white/40">
                                        ESTIMATE: <span className="text-[#14f195]">+{fmtUsd((Number(depositAmount || 0) * selected.apy) / 100 / 365)} / DAY</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6 border-t border-white/5 bg-[#050505] space-y-3 relative z-10">
                                <button 
                                    onClick={handleOneClickDeposit}
                                    disabled={isDepositing || !depositAmount}
                                    className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 hover:bg-[#14f195] transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                                >
                                    {isDepositing ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <>
                                            <Zap size={14} className="group-hover:text-black transition-colors" /> DEPOSIT 1-CLICK
                                        </>
                                    )}
                                    <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform" />
                                </button>
                                <p className="text-[9px] font-mono text-white/30 text-center uppercase tracking-widest">
                                    {isConnected ? 'Executes routing via Whale Smart Contracts' : 'Connect wallet to deposit'}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {ts && <div className="az-label text-white/30" style={{ padding: '6px 16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>FUENTE: DEFILLAMA API · SYNC: {ts} UTC · Auto-refresh 60s</div>}
        </div>
    );
}
