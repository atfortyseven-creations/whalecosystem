"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAccount, useConnect, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { parseEther } from 'viem';

// ── Contract config ───────────────────────────────────────────────────────────
const ACCESS_PASS_ADDRESS = '0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a';
const ACCESS_PASS_ABI = [
  { "inputs": [], "name": "mint", "outputs": [], "stateMutability": "payable", "type": "function" },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "id", "type": "uint256" }],
    "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
    "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
    "name": "maxSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [], "name": "mintPrice",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view", "type": "function"
  }
] as const;

export function GoldTicketPanel() {
    const { address, isConnected } = useAccount();
    const { connect } = useConnect();

    // ── On-chain reads ────────────────────────────────────────────────────────
    const { data: balanceData, refetch: refetchBalance } = useReadContract({
        address: ACCESS_PASS_ADDRESS as `0x${string}`,
        abi: ACCESS_PASS_ABI,
        functionName: 'balanceOf',
        args: address ? [address, 1n] : undefined,
        query: { enabled: !!address }
    });

    const { data: supplyData } = useReadContract({
        address: ACCESS_PASS_ADDRESS as `0x${string}`,
        abi: ACCESS_PASS_ABI,
        functionName: 'totalSupply',
        args: [1n]
    });

    const { data: maxSupplyData } = useReadContract({
        address: ACCESS_PASS_ADDRESS as `0x${string}`,
        abi: ACCESS_PASS_ABI,
        functionName: 'maxSupply',
        args: [1n]
    });

    const { data: mintPriceData } = useReadContract({
        address: ACCESS_PASS_ADDRESS as `0x${string}`,
        abi: ACCESS_PASS_ABI,
        functionName: 'mintPrice',
        query: { enabled: true }
    });

    const hasTicket = Boolean(balanceData && BigInt(balanceData as any) > 0n);
    const totalMinted     = supplyData    ? Number(supplyData)    : null;
    const totalMax        = maxSupplyData ? Number(maxSupplyData) : null;
    const pendingSlots    = totalMax !== null && totalMinted !== null ? Math.max(0, totalMax - totalMinted) : null;
    // Mint price from contract; fallback 0 (free) if not readable
    const mintPrice: bigint = mintPriceData ? BigInt(mintPriceData as any) : 0n;

    // ── On-chain write: real mint() call ─────────────────────────────────────
    const {
        writeContract,
        data: txHash,
        isPending: isTxPending,
        isError: isTxError,
        error: txError,
        reset: resetTx
    } = useWriteContract();

    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
    } = useWaitForTransactionReceipt({ hash: txHash });

    useEffect(() => {
        if (isConfirmed) {
            toast.success('Gold Ticket minted successfully.');
            refetchBalance();
        }
    }, [isConfirmed, refetchBalance]);

    useEffect(() => {
        if (isTxError && txError) {
            const msg = (txError as any)?.shortMessage || txError?.message || 'Transaction rejected';
            toast.error(msg.slice(0, 80));
            resetTx();
        }
    }, [isTxError, txError, resetTx]);

    const handleConnect = () => {
        connect({ connector: injected() });
    };

    const handleMint = () => {
        if (!isConnected) { toast.error('Connect your wallet first'); return; }
        if (hasTicket)    { toast.info('This wallet already holds a Gold Ticket.'); return; }
        writeContract({
            address: ACCESS_PASS_ADDRESS as `0x${string}`,
            abi: ACCESS_PASS_ABI,
            functionName: 'mint',
            value: mintPrice,
        });
    };

    // ── STATE: ALREADY HAS TICKET ─────────────────────────────────────────────
    if (hasTicket || isConfirmed) {
        return (
            <div className="w-full flex flex-col items-center justify-center p-12 bg-[#FAF9F6] rounded-3xl border border-[#050505]/10 shadow-xl relative overflow-hidden min-h-[600px]">
                <div className="absolute top-0 inset-x-0 h-[300px] bg-gradient-to-b from-[#00C076]/5 to-transparent pointer-events-none" />
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 flex flex-col items-center w-full max-w-xl text-center"
                >
                    <div className="mb-6 px-4 py-1.5 rounded-full bg-[#00C076]/10 border border-[#00C076]/30">
                        <span className="text-[10px] font-black text-[#00C076] uppercase tracking-widest">
                            Gold Ticket Verified
                        </span>
                    </div>

                    <h2 className="text-3xl font-black text-[#050505] uppercase tracking-tighter mb-2">
                        Access Granted
                    </h2>
                    <p className="text-sm text-[#888888] font-medium mb-8">
                        Your Gold Ticket is confirmed on-chain.
                    </p>

                    <div className="w-full bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-sm mb-8 text-left">
                        <p className="text-[9px] font-mono text-[#888888] uppercase tracking-widest mb-2">Holder Address</p>
                        <p className="text-xl font-black text-[#050505] font-mono tracking-tight">
                            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'VERIFIED'}
                        </p>
                        <div className="mt-4 pt-4 border-t border-[#F0F0F0] space-y-1">
                            <p className="text-[9px] text-[#888888] font-mono">Contract: <span className="text-[#050505]">{ACCESS_PASS_ADDRESS}</span></p>
                            {txHash && <p className="text-[9px] text-[#888888] font-mono truncate">Tx: <span className="text-[#00C076]">{String(txHash)}</span></p>}
                        </div>
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-4 bg-[#050505] text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-[#1a1a1a] transition-all active:scale-[0.98]"
                    >
                        Enter Dashboard
                    </button>

                    {totalMinted !== null && (
                        <div className="mt-6 flex gap-8 items-center text-center">
                            <div>
                                <p className="text-[9px] font-black text-[#888888] uppercase tracking-widest">Minted</p>
                                <p className="text-lg font-black font-mono text-[#050505]">{totalMinted.toLocaleString()}</p>
                            </div>
                            {totalMax !== null && (
                                <div>
                                    <p className="text-[9px] font-black text-[#888888] uppercase tracking-widest">Max Supply</p>
                                    <p className="text-lg font-black font-mono text-[#050505]">{totalMax.toLocaleString()}</p>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        );
    }

    // ── STATE: MINTING IN PROGRESS ────────────────────────────────────────────
    if (isTxPending || isConfirming) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#FAF9F6] rounded-3xl border border-[#E5E5E5] space-y-8 p-12">
                <div className="relative w-20 h-20">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                        className="absolute -inset-2 rounded-full border-2 border-dashed border-[#050505]/10"/>
                    <div className="w-20 h-20 rounded-full border-4 border-[#050505] border-t-transparent animate-spin shadow-lg"/>
                </div>
                <div className="text-center space-y-3 max-w-sm">
                    <h2 className="text-xl font-black text-[#050505] uppercase tracking-tighter">
                        {isTxPending ? 'Confirm in Wallet' : 'Minting…'}
                    </h2>
                    <p className="text-[11px] font-bold text-[#888888] leading-relaxed">
                        {isTxPending
                            ? 'Please confirm the transaction in your wallet. No action required here.'
                            : 'Transaction submitted. Waiting for on-chain confirmation.'}
                    </p>
                    {txHash && (
                        <div className="bg-black/5 p-3 rounded-lg text-left">
                            <p className="text-[8px] font-mono text-[#888888] uppercase mb-1">Transaction Hash</p>
                            <p className="text-[9px] font-mono text-[#050505] break-all">{txHash}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── STATE: MAIN LANDING ───────────────────────────────────────────────────
    return (
        <div className="flex flex-col space-y-8 max-w-5xl mx-auto py-8">

            {/* Hero Section */}
            <div className="relative bg-[#050505] rounded-[2.5rem] overflow-hidden p-12 shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/10 blur-[120px] rounded-full pointer-events-none"/>

                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-4 leading-[0.9]">
                        Gold Ticket
                    </h1>
                    <p className="text-base text-white/60 font-medium leading-relaxed mb-8">
                        Mint your Gold Ticket NFT to gain permanent access to the Whale Alert Network institutional suite.
                        {mintPrice > 0n && (
                            <span className="block mt-2 text-[#D4AF37] font-black text-sm">
                                Mint price: {(Number(mintPrice) / 1e18).toFixed(4)} ETH
                            </span>
                        )}
                        {mintPrice === 0n && (
                            <span className="block mt-2 text-[#00C076] font-black text-sm">Free mint</span>
                        )}
                    </p>

                    {totalMinted !== null && (
                        <div className="flex gap-8 mt-8 border-t border-white/10 pt-8">
                            <div className="flex flex-col">
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5">Minted</p>
                                <p className="text-4xl font-black font-mono text-[#D4AF37] tracking-tighter">
                                    {totalMinted.toLocaleString()}
                                </p>
                            </div>
                            {totalMax !== null && <>
                                <div className="w-px h-12 bg-white/10 self-center"/>
                                <div className="flex flex-col">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5">Remaining</p>
                                    <p className="text-4xl font-black font-mono text-white tracking-tighter">
                                        {pendingSlots !== null ? pendingSlots.toLocaleString() : '—'}
                                    </p>
                                </div>
                            </>}
                        </div>
                    )}
                </div>
            </div>

            {/* Steps Section */}
            <div className="grid md:grid-cols-3 gap-6">
                {[
                    {
                        step: 1,
                        title: 'Connect Wallet',
                        desc: 'Connect your Web3 wallet to verify eligibility.',
                        action: !isConnected && (
                            <button onClick={handleConnect} className="mt-4 w-full py-2.5 bg-[#050505] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1a1a1a] transition-all active:scale-[0.98]">
                                Connect Wallet
                            </button>
                        ),
                        status: isConnected ? 'DONE' : 'PENDING'
                    },
                    {
                        step: 2,
                        title: 'Mint Gold Ticket',
                        desc: mintPrice > 0n
                            ? `Pay ${(Number(mintPrice) / 1e18).toFixed(4)} ETH to mint your NFT pass.`
                            : 'Mint your Gold Ticket NFT (free transaction).',
                        action: isConnected && !hasTicket && (
                            <button onClick={handleMint} className="mt-4 w-full py-2.5 bg-[#D4AF37] text-[#050505] rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#D4AF37]/20 hover:bg-[#e5c043] transition-all active:scale-[0.98]">
                                Mint Now
                            </button>
                        ),
                        status: hasTicket ? 'DONE' : isConnected ? 'READY' : 'WAITING'
                    },
                    {
                        step: 3,
                        title: 'Access Granted',
                        desc: 'Full access to all Whale Alert Network tools and intelligence feeds.',
                        action: null,
                        status: hasTicket ? 'DONE' : 'LOCKED'
                    }
                ].map((s, i) => (
                    <div key={i} className={`p-8 rounded-3xl border transition-all ${s.status === 'DONE' ? 'bg-[#D4AF37]/5 border-[#D4AF37]/20' : 'bg-white border-[#E5E5E5]'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <span className={`text-[10px] font-mono font-black ${s.status === 'DONE' ? 'text-[#D4AF37]' : s.status === 'READY' ? 'text-[#050505]' : 'text-[#888888]'}`}>0{s.step}</span>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase ${s.status === 'DONE' ? 'bg-[#D4AF37] text-white border-transparent' : 'bg-[#FAF9F6] text-[#888888] border-[#E5E5E5]'}`}>
                                {s.status}
                            </span>
                        </div>
                        <h3 className="text-lg font-black text-[#050505] uppercase tracking-tight mb-2">{s.title}</h3>
                        <p className="text-[11px] text-[#888888] font-medium leading-relaxed">{s.desc}</p>
                        {s.action}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="bg-[#FAF9F6] border border-[#E5E5E5] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-black text-[#050505] uppercase tracking-widest">Contract Address</p>
                    <p className="text-[9px] text-[#888888] font-mono">{ACCESS_PASS_ADDRESS}</p>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-[#050505] uppercase tracking-widest">Non-Custodial</p>
                    <p className="text-[8px] text-[#888888] font-medium">You own your NFT, always</p>
                </div>
            </div>
        </div>
    );
}
