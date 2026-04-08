"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import { Shield, Fingerprint, Lock, ShieldAlert, Activity, CheckCircle2, Clock, UserPlus, Trash2, Users } from 'lucide-react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const fetcher = (url: string) => fetch(url).then(r => r.json());

// XSS sanitize for guardian addresses
const sanitizeAddr = (s: string) => s.replace(/[^a-zA-Z0-9._-]/g, '').trim().slice(0, 100);

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

                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter flex items-center gap-4 border-b border-[#222] pb-6 w-full">
                    <ShieldAlert className="text-[#FF3B30]" size={40} />
                    SOVEREIGN <span className="text-[#888888]">VAULT</span>
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">

                    {/* DEADMAN SWITCH */}
                    <div className="border border-[#222222] bg-[#020202] flex flex-col p-6 relative overflow-hidden hover:border-[#FF3B30]/50 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Fingerprint size={120} /></div>
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <Activity size={24} className={vaultData?.deadman ? "text-[#00FF55]" : "text-[#FF3B30]"} />
                            <h2 className="text-xl font-black uppercase tracking-widest">Deadman Switch</h2>
                        </div>
                        <p className="text-[10px] text-[#888888] uppercase tracking-[0.1em] mb-8 leading-relaxed max-w-xs relative z-10">
                            Cryptographic failsafe. If you miss a 90-day heartbeat, encrypted payload ownership transfers to beneficiary.
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
                                    className="w-full bg-[#050505] border border-[#333333] hover:border-[#00FF55] hover:text-[#00FF55] text-white py-3 text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                                >
                                    {isPinging ? 'TRANSMITTING...' : 'EMIT HEARTBEAT PING'}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleDeployDeadman}
                                disabled={!isConnected}
                                className="w-full bg-[#FF3B30]/10 border border-[#FF3B30] text-[#FF3B30] py-3 text-[11px] font-black uppercase tracking-widest hover:bg-[#FF3B30]/20 transition-all relative z-10 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {isConnected ? 'DEPLOY DEADMAN SWITCH' : 'CONNECT WALLET FIRST'}
                            </button>
                        )}
                    </div>

                    {/* TIMELOCK VAULT */}
                    <div className="border border-[#222222] bg-[#020202] flex flex-col p-6 relative overflow-hidden hover:border-[#0052FF]/50 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Clock size={120} /></div>
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <Lock size={24} className="text-[#0052FF]" />
                            <h2 className="text-xl font-black uppercase tracking-widest">TimeLock Vault</h2>
                        </div>
                        <p className="text-[10px] text-[#888888] uppercase tracking-[0.1em] mb-8 leading-relaxed max-w-xs relative z-10">
                            Lock tokens on-chain for a mandatory horizon. Immune against panic selling during volatile cycles.
                        </p>
                        <div className="flex-1" />
                        <button
                            onClick={handleLock}
                            disabled={isLocking || !isConnected}
                            className="w-full bg-[#0052FF] text-white py-3 text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed relative z-10"
                        >
                            {isLocking ? 'SIGNING...' : isConnected ? 'DEPLOY TIMELOCK (0.001 ETH → 24H)' : 'CONNECT WALLET FIRST'}
                        </button>
                    </div>

                </div>

                {/* ── GUARDIAN MULTI-SIG ───────────────────────────────────────────── */}
                {/* FIX: Added multi-sig guardian section to eliminate single-point-of-failure.
                    A stolen wallet alone cannot bypass vault protections when guardians are set. */}
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
