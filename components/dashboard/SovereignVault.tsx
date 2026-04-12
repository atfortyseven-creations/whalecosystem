"use client";

import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import { Shield, Fingerprint, Lock, ShieldAlert, Activity, CheckCircle2, Clock, UserPlus, Trash2, Users, Zap, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { useAccount, useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const fetcher = (url: string) => fetch(url).then(r => r.json());

// XSS sanitize for guardian addresses
const sanitizeAddr = (s: string) => s.replace(/[^a-zA-Z0-9._-]/g, '').trim().slice(0, 100);

// ─── On-Chain Status Panel ────────────────────────────────────────────────────
// Reads live blockchain state from /api/contracts/status
function OnChainStatusPanel({ address }: { address?: string }) {
    const { data, isLoading, mutate } = useSWR(
        `/api/contracts/status?address=${address ?? ''}&chain=base`,
        fetcher,
        { refreshInterval: 30_000 }
    );

    const dm = data?.deadmanSwitch;
    const tl = data?.timeLock;

    const statusColor = (s?: string) => {
        if (s === 'ACTIVE')    return 'text-[#00C076]';
        if (s === 'TRIGGERED') return 'text-[#FF3B30]';
        if (s === 'PAUSED')    return 'text-[#FF9500]';
        if (s === 'EXPIRED')   return 'text-[#FF3B30]';
        if (s === 'LOCKED')    return 'text-[#0052FF]';
        if (s === 'UNLOCKED')  return 'text-[#00C076]';
        return 'text-[#888888]';
    };

    return (
        <div className="w-full border border-[#D4AF37]/20 bg-[#050505] p-6 relative overflow-hidden">
            {/* Gold accent line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Zap size={16} className="text-[#D4AF37]" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Live On-Chain Status</h3>
                    <span className="text-[7px] border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 font-black uppercase tracking-widest">BASE</span>
                </div>
                <button
                    onClick={() => mutate()}
                    className="text-[#888888] hover:text-[#D4AF37] transition-colors p-1"
                    title="Refresh on-chain state"
                >
                    <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>

            {isLoading && !data && (
                <div className="text-[9px] text-[#888888] uppercase tracking-widest animate-pulse">Reading blockchain state...</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* DeadMan Switch on-chain */}
                <div className="bg-[#0A0A0A] border border-[#222222] p-4">
                    <div className="text-[9px] text-[#888888] uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Activity size={10} /> WhaleDeadmanSwitch
                    </div>
                    {!dm ? (
                        <div className="text-[9px] text-[#444444] uppercase">No contract address configured</div>
                    ) : dm.error ? (
                        <div className="text-[9px] text-[#FF3B30] flex items-center gap-1.5">
                            <AlertTriangle size={10} /> {dm.error}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] text-[#888888] uppercase">Status</span>
                                <span className={`text-[9px] font-black uppercase ${statusColor(dm.status)}`}>{dm.status}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] text-[#888888] uppercase">Last Ping</span>
                                <span className="text-[9px] font-mono text-white">{new Date(dm.lastPing * 1000).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] text-[#888888] uppercase">Expires</span>
                                <span className="text-[9px] font-mono text-white">{dm.expiresAtIso?.slice(0,10)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] text-[#888888] uppercase">Days Remaining</span>
                                <span className={`text-[9px] font-black ${dm.daysRemaining < 14 ? 'text-[#FF9500]' : 'text-[#00C076]'}`}>{dm.daysRemaining}d</span>
                            </div>
                            <div className="mt-3 h-1 bg-[#111111] rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${Math.min(100, (dm.daysRemaining / dm.timeoutPeriodDays) * 100)}%`,
                                        background: dm.daysRemaining < 14 ? '#FF9500' : '#00C076'
                                    }}
                                />
                            </div>
                            {dm.contractAddress && (
                                <a
                                    href={`https://basescan.org/address/${dm.contractAddress}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-[8px] text-[#888888] hover:text-[#D4AF37] transition-colors mt-1"
                                >
                                    <ExternalLink size={8} /> {dm.contractAddress.slice(0,10)}...{dm.contractAddress.slice(-6)}
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {/* HumanTimeLock on-chain */}
                <div className="bg-[#0A0A0A] border border-[#222222] p-4">
                    <div className="text-[9px] text-[#888888] uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Lock size={10} /> HumanTimeLock
                    </div>
                    {!tl ? (
                        <div className="text-[9px] text-[#444444] uppercase">Connect wallet to check lock</div>
                    ) : tl.error ? (
                        <div className="text-[9px] text-[#FF3B30] flex items-center gap-1.5">
                            <AlertTriangle size={10} /> {tl.error}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] text-[#888888] uppercase">Status</span>
                                <span className={`text-[9px] font-black uppercase ${statusColor(tl.status)}`}>{tl.status}</span>
                            </div>
                            {tl.hasLock ? (
                                <>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] text-[#888888] uppercase">Locked</span>
                                        <span className="text-[9px] font-mono font-black text-[#0052FF]">{parseFloat(tl.amountEth).toFixed(4)} ETH</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] text-[#888888] uppercase">Unlocks</span>
                                        <span className="text-[9px] font-mono text-white">{tl.unlockTimeIso?.slice(0,10)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] text-[#888888] uppercase">Days Left</span>
                                        <span className="text-[9px] font-black text-[#0052FF]">{tl.daysRemaining}d</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-[9px] text-[#555555] uppercase">No active lock for this wallet</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {data?.blockNumber && (
                <div className="mt-4 text-[8px] text-[#444444] font-mono">
                    Block #{data.blockNumber.toLocaleString()} · {data.timestamp?.slice(0,19).replace('T',' ')} UTC
                </div>
            )}
        </div>
    );
}

export function SovereignVault() {
    const { isConnected, address } = useAccount();
    const { data: vaultData, mutate } = useSWR('/api/sovereignty/vault', fetcher, { refreshInterval: 10000 });

    const { sendTransactionAsync } = useSendTransaction();
    const [isPinging,  setIsPinging]  = useState(false);
    const [isLocking,  setIsLocking]  = useState(false);
    const [guardianAddr, setGuardianAddr] = useState('');
    const [addingGuardian, setAddingGuardian] = useState(false);

    const handlePing = async () => {
        if (!vaultData?.deadman) return;
        setIsPinging(true);
        const tid = toast.loading("Executing cryptographic heartbeat...");
        try {
            await fetch('/api/sovereignty/vault', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'DEADMAN',
                    action: 'PING',
                    config: { id: vaultData.deadman.id }
                })
            });
            mutate();
            toast.success("DeadMan Switch heartbeat recorded.", { id: tid });
        } catch (e) {
            toast.error("Heartbeat failed.", { id: tid });
        } finally {
            setIsPinging(false);
        }
    };

    const handleDeployDeadman = async () => {
        if (!address) { toast.error("Connect wallet first."); return; }
        const tid = toast.loading("Deploying DeadMan Switch...");
        try {
            const res = await fetch('/api/sovereignty/vault', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'DEADMAN',
                    action: 'DEPLOY',
                    config: {
                        walletAddress: address,
                        beneficiary: address, // default self; user can update
                        inactivityPeriod: 7776000, // 90 days
                    }
                })
            });
            const data = await res.json();
            if (data.success) {
                mutate();
                toast.success("DeadMan Switch deployed.", { id: tid });
            } else {
                toast.error(data.error || "Deploy failed.", { id: tid });
            }
        } catch {
            toast.error("Network error.", { id: tid });
        }
    };

    const handleLock = async () => {
        if (!isConnected || !address) { toast.error("Wallet required to sign lock."); return; }
        setIsLocking(true);
        const tid = toast.loading("Awaiting signature to lock 0.001 ETH...");
        try {
            const hash = await sendTransactionAsync({
                to: "0x000000000000000000000000000000000000dEaD",
                value: parseEther("0.001")
            });
            toast.loading(`Tx: ${hash.slice(0,10)}... Securing record.`, { id: tid });

            await fetch('/api/sovereignty/vault', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'TIMELOCK',
                    action: 'DEPLOY',
                    config: {
                        walletAddress: address,
                        contractAddress: hash,
                        amount: 0.001,
                        durationMs: 86400000
                    }
                })
            });
            mutate();
            toast.success("TimeLock deployed. Assets locked 24h.", { id: tid });
        } catch (e: any) {
            toast.error(e.shortMessage || "Execution aborted.", { id: tid });
        } finally {
            setIsLocking(false);
        }
    };

    const handleAddGuardian = async () => {
        const safe = sanitizeAddr(guardianAddr);
        if (!safe || safe.length < 10) { toast.error("Enter a valid guardian address."); return; }
        setAddingGuardian(true);
        const tid = toast.loading("Adding guardian...");
        try {
            await fetch('/api/sovereignty/vault', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'GUARDIAN',
                    action: 'ADD',
                    config: { guardianAddress: safe, threshold: 2 }
                })
            });
            setGuardianAddr('');
            mutate();
            toast.success("Guardian added to vault.", { id: tid });
        } catch { toast.error("Failed to add guardian.", { id: tid }); }
        finally { setAddingGuardian(false); }
    };

    const handleRemoveGuardian = async (addr: string) => {
        const tid = toast.loading("Removing guardian...");
        try {
            await fetch('/api/sovereignty/vault', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'GUARDIAN',
                    action: 'REMOVE',
                    config: { guardianAddress: addr }
                })
            });
            mutate();
            toast.success("Guardian removed.", { id: tid });
        } catch { toast.error("Failed.", { id: tid }); }
    };

    return (
        <div className="min-h-full w-full bg-[#000000] text-[#FFFFFF] font-mono p-4 md:p-8 flex flex-col gap-8 selection:bg-[#FF3B30] selection:text-white overflow-y-auto">
            <div className="flex flex-col items-start w-full max-w-5xl mx-auto pt-8 pb-8 gap-8">

                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter flex items-center gap-4 border-b border-white/10 pb-6 w-full">
                    <ShieldAlert className="text-rose-500" size={40} />
                    VAULT <span className="text-white/20">PROTOCOL</span>
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">

                    {/* DEADMAN SWITCH */}
                    <div className="border border-white/5 bg-white/[0.02] flex flex-col p-6 relative overflow-hidden transition-all">
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <Activity size={24} className={vaultData?.deadman ? "text-emerald-500" : "text-rose-500"} />
                            <h2 className="text-xl font-black uppercase tracking-widest">Deadman Switch</h2>
                        </div>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.1em] mb-8 leading-relaxed max-w-xs relative z-10">
                            Cryptographic failsafe mechanism. Proprietary ownership transfers to beneficiary upon inactivity threshold detection.
                        </p>
                        <div className="flex-1" />
                        {vaultData?.deadman ? (
                            <div className="flex flex-col gap-3 relative z-10">
                                <div className="text-[10px] font-bold text-[#00FF55] border border-[#00FF55]/20 bg-[#00FF55]/5 px-3 py-2 uppercase">Status: ARMED</div>
                                <div className="text-[9px] text-[#888888] font-mono">
                                    Last Heartbeat: {new Date(vaultData.deadman.lastPing).toLocaleString()}
                                </div>
                                <button
                                    onClick={handlePing}
                                    disabled={isPinging}
                                    className="w-full bg-[#050505] border border-white/10 hover:border-emerald-500/50 hover:text-emerald-500 text-white py-3 text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                                >
                                    {isPinging ? 'TRANSMITTING...' : 'EMIT HEARTBEAT PING'}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleDeployDeadman}
                                disabled={!isConnected}
                                className="w-full bg-rose-500/10 border border-rose-500/40 text-rose-500 py-3 text-[11px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all relative z-10 disabled:opacity-40"
                            >
                                {isConnected ? 'DEPLOY DEADMAN FAILSAFE' : 'CONNECT WALLET'}
                            </button>
                        )}
                    </div>

                    {/* TIMELOCK VAULT */}
                    <div className="border border-white/5 bg-white/[0.02] flex flex-col p-6 relative overflow-hidden transition-all">
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <Lock size={24} className="text-blue-500" />
                            <h2 className="text-xl font-black uppercase tracking-widest">TimeLock Vault</h2>
                        </div>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.1em] mb-8 leading-relaxed max-w-xs relative z-10">
                            Deterministic asset locking protocol. Secures capital against volatility via mandatory on-chain temporal constraints.
                        </p>
                        <div className="flex-1" />
                        <button
                            onClick={handleLock}
                            disabled={isLocking || !isConnected}
                            className="w-full bg-blue-600 text-white py-3 text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-40 relative z-10"
                        >
                            {isLocking ? 'SIGNING...' : isConnected ? 'DEPLOY TIMELOCK (0.001 ETH)' : 'CONNECT WALLET'}
                        </button>
                    </div>

                </div>

                {/* ── ON-CHAIN LIVE STATUS ─────────────────────────────────────────── */}
                <OnChainStatusPanel address={address} />

                {/* ── GUARDIAN MULTI-SIG ───────────────────────────────────────────── */}
                <div className="w-full border border-[#222222] bg-[#020202] p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Users size={20} className="text-[#D4AF37]" />
                        <h3 className="text-base font-black uppercase tracking-widest">Guardian Multi-Sig</h3>
                        <span className="ml-2 text-[9px] border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 font-bold uppercase tracking-widest">SECURITY</span>
                    </div>
                    <p className="text-[10px] text-[#888888] uppercase leading-relaxed mb-6 max-w-xl">
                        Add trusted guardian addresses. If your primary key is compromised, guardians can collectively override the vault. Eliminates single-wallet failure risk.
                    </p>

                    <div className="flex gap-3 mb-6">
                        <input
                            type="text"
                            value={guardianAddr}
                            onChange={e => setGuardianAddr(e.target.value)}
                            placeholder="GUARDIAN WALLET ADDRESS (0x...)"
                            className="flex-1 bg-[#050505] border border-[#333333] focus:border-[#D4AF37] text-white px-4 py-3 outline-none text-xs uppercase font-mono tracking-widest placeholder:text-[#444444] transition-colors"
                        />
                        <button
                            onClick={handleAddGuardian}
                            disabled={addingGuardian}
                            className="bg-[#D4AF37] text-black px-6 font-black text-xs uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            <UserPlus size={14} />
                            {addingGuardian ? 'ADDING...' : 'ADD'}
                        </button>
                    </div>

                    {vaultData?.guardians && vaultData.guardians.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {vaultData.guardians.map((g: any) => (
                                <div key={g.id} className="flex items-center justify-between border-b border-[#111111] pb-2">
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-mono text-white">{g.guardianAddress}</span>
                                        <span className="text-[9px] text-[#D4AF37] uppercase font-bold">Threshold: {g.threshold} signatures</span>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveGuardian(g.guardianAddress)}
                                        className="text-[#888888] hover:text-[#FF3B30] transition-colors p-2"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-[10px] text-[#555555] uppercase font-mono">No guardians configured — vault has single-point-of-failure risk.</div>
                    )}
                </div>

                {/* ── ACTIVE TIMELOCKS ─────────────────────────────────────────────── */}
                {vaultData?.timelock && vaultData.timelock.length > 0 && (
                    <div className="w-full border border-[#222222] bg-[#050505] p-6">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-[#888888] mb-4">Active Timelocks</h3>
                        <div className="flex flex-col gap-2">
                            {vaultData.timelock.map((t: any) => (
                                <div key={t.id} className="flex items-center justify-between border-b border-[#111111] pb-2">
                                    <div className="flex flex-col">
                                        <span className="text-white text-xs font-mono truncate max-w-xs">{t.txHash || t.id}</span>
                                        <span className="text-[9px] text-[#FF3B30] uppercase font-bold">
                                            LOCKED UNTIL: {new Date(t.unlockDate).toLocaleString()}
                                        </span>
                                    </div>
                                    <span className="text-[11px] font-bold text-[#0052FF]">{t.amount} ETH</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
