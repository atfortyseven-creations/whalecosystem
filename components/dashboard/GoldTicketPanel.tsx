"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAccount, useConnect, useSignMessage, useReadContract } from 'wagmi';
import { injected } from 'wagmi/connectors';
import Link from 'next/link';

const ACCESS_PASS_ADDRESS = '0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a';
const ACCESS_PASS_ABI = [
  { "inputs": [], "name": "mint", "outputs": [], "stateMutability": "payable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "maxSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
];


type ClaimStep = 'eligibility' | 'payment' | 'claiming';

export function GoldTicketPanel() {
    const { address, isConnected } = useAccount();
    const { connect } = useConnect();
    const { signMessage, data: hash, isPending: isWritePending, isSuccess: isConfirmed } = useSignMessage();
    const isConfirming = false;

    const { data: balanceData, refetch: refetchBalance } = useReadContract({
        address: ACCESS_PASS_ADDRESS as `0x${string}`,
        abi: ACCESS_PASS_ABI,
        functionName: 'balanceOf',
        args: address ? [address, 1n] : undefined,
        query: { enabled: !!address }
    });

    const { data: supplyData, refetch: refetchSupply } = useReadContract({
        address: ACCESS_PASS_ADDRESS as `0x${string}`,
        abi: ACCESS_PASS_ABI,
        functionName: 'totalSupply',
        args: [1n]
    });

    const { data: maxSupplyData, refetch: refetchMaxSupply } = useReadContract({
        address: ACCESS_PASS_ADDRESS as `0x${string}`,
        abi: ACCESS_PASS_ABI,
        functionName: 'maxSupply',
        args: [1n]
    });

    const hasTicket = Boolean(balanceData && BigInt(balanceData as any) > 0n);
    const totalTicketsMinted = supplyData ? Number(supplyData) : 0;
    // Attempt to parse maxSupply, fallback to 10000 if not available to show pending logic
    const totalMaxTickets = maxSupplyData ? Number(maxSupplyData) : 10000;
    const pendingTickets = Math.max(0, totalMaxTickets - totalTicketsMinted);

    const [step, setStep] = useState<ClaimStep>('eligibility');
    const [paymentDone, setPayment] = useState(false);

    useEffect(() => {
        if (isConfirmed) {
            toast.success('Access Pass verified');
            refetchBalance();
            refetchSupply();
            refetchMaxSupply();
        }
    }, [isConfirmed, refetchBalance, refetchSupply, refetchMaxSupply]);

    const handleConnect = () => {
        connect({ connector: injected() });
        toast.success('Connecting Web3 Wallet…');
    };

    const handlePayment = () => {
        if (hasTicket) {
            toast.info("This wallet already holds a pass.");
            return;
        }
        signMessage({
            message: "Authorize zero-gas activation for Access Pass."
        }, {
            onSuccess: () => {
                setPayment(true);
                setStep('claiming');
            },
            onError: (err: any) => {
                const errMsg = err?.message || String(err);
                toast.error('Signature rejected: ' + errMsg.slice(0, 60));
                setStep('eligibility');
            }
        });
    };

    // ==========================================
    // STATE: TICKET ALREADY ACTIVATED
    // ==========================================
    if (hasTicket || isConfirmed) {
        return (
            <div className="w-full flex flex-col items-center justify-center p-12 bg-[#FAF9F6] rounded-3xl border border-[#050505]/10 shadow-xl relative overflow-hidden min-h-[600px]">
                <div className="absolute top-0 inset-x-0 h-[300px] bg-gradient-to-b from-[#00C076]/5 to-transparent pointer-events-none" />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 flex flex-col items-center w-full max-w-xl text-center"
                >
                    {/* Status Badge */}
                    <div className="mb-6 px-4 py-1.5 rounded-full bg-[#00C076]/10 border border-[#00C076]/30">
                        <span className="text-[10px] font-black text-[#00C076] uppercase tracking-widest">
                            ON-CHAIN VERIFIED
                        </span>
                    </div>

                    <h2 className="text-3xl font-black text-[#050505] uppercase tracking-tighter mb-2">
                        Access Authorized
                    </h2>
                    <p className="text-sm text-[#888888] font-medium mb-8">
                        Your on-chain identity is verified.
                    </p>

                    {/* Identity Card */}
                    <div className="w-full bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-sm mb-8 text-left transition-all hover:shadow-md">
                        <p className="text-[9px] font-mono text-[#888888] uppercase tracking-widest mb-2">Blockchain Identity</p>
                        <p className="text-xl font-black text-[#050505] font-mono tracking-tight">
                            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'VERIFIED'}
                        </p>
                        <div className="mt-4 pt-4 border-t border-[#F0F0F0] space-y-1">
                            <p className="text-[9px] text-[#888888] font-mono">Contract: <span className="text-[#050505]">{ACCESS_PASS_ADDRESS}</span></p>
                            {hash && <p className="text-[9px] text-[#888888] font-mono truncate">Tx: <span className="text-[#00C076]">{String(hash)}</span></p>}
                        </div>
                    </div>

                    <button 
                        onClick={() => window.location.reload()}
                        className="w-full py-4 bg-[#050505] text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-[#1a1a1a] transition-all active:scale-[0.98]"
                    >
                        Enter Dashboard
                    </button>
                    
                    <div className="mt-6 flex flex-col gap-1 items-center">
                        <p className="text-[9px] font-bold text-[#888888] uppercase tracking-widest font-mono group cursor-default">
                            Minted Passes: <span className="text-[#050505]">{supplyData !== undefined ? totalTicketsMinted.toLocaleString() : '...'}</span>
                        </p>
                        <p className="text-[9px] font-bold text-[#888888] uppercase tracking-widest font-mono group cursor-default">
                            Pending Mints: <span className="text-[#050505]">{supplyData !== undefined ? pendingTickets.toLocaleString() : '...'}</span>
                        </p>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ==========================================
    // STATE: SIGNING IN PROGRESS
    // ==========================================
    if (step === 'claiming' || isWritePending || isConfirming) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#FAF9F6] rounded-3xl border border-[#E5E5E5] space-y-8 p-12">
                <div className="relative w-20 h-20">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                        className="absolute -inset-2 rounded-full border-2 border-dashed border-[#050505]/10"/>
                    <div className="w-20 h-20 rounded-full border-4 border-[#050505] border-t-transparent animate-spin shadow-lg"/>
                </div>

                <div className="text-center space-y-3 max-w-sm">
                    <h2 className="text-xl font-black text-[#050505] uppercase tracking-tighter">
                        Verifying Signature
                    </h2>
                    <p className="text-[11px] font-bold text-[#888888] leading-relaxed">
                        Processing your cryptographic identity verification. This does not require gas or move any funds.
                    </p>
                    <div className="bg-black/5 p-3 rounded-lg text-left">
                        <p className="text-[8px] font-mono text-[#888888] uppercase mb-1">TX Hash / Status</p>
                        <p className="text-[9px] font-mono text-[#050505] break-all">
                            {hash ? String(hash) : 'Awaiting confirmation from wallet…'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // STATE: MAIN LANDING (TICKET NOT CLAIMED)
    // ==========================================
    return (
        <div className="flex flex-col space-y-8 max-w-5xl mx-auto py-8">

            {/* Hero Section */}
            <div className="relative bg-[#050505] rounded-[2.5rem] overflow-hidden p-12 shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00C076]/10 blur-[120px] rounded-full pointer-events-none"/>
                
                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 rounded bg-white/10 text-white text-[9px] font-black uppercase tracking-widest border border-white/20">
                            On-Chain Identity
                        </span>
                        <div className="flex items-center gap-1.5 text-[#00C076] text-[9px] font-black uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00C076] animate-pulse"/> Contract Active
                        </div>
                    </div>

                    <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-4 leading-[0.9]">
                        Access Pass Claim
                    </h1>
                    <p className="text-base text-white/60 font-medium leading-relaxed mb-8">
                        Link your wallet to verify your on-chain ownership of the Access Pass. Provide gasless signature to confirm identity and access the system.
                    </p>

                    <div className="flex gap-8 mt-8 border-t border-white/10 pt-8">
                        <div className="flex flex-col">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 hover:text-white/60 transition-colors">Minted Status</p>
                            <p className="text-4xl font-black font-mono text-[#00C076] tracking-tighter drop-shadow-[0_0_12px_rgba(0,192,118,0.3)]">
                                {supplyData !== undefined ? totalTicketsMinted.toLocaleString() : '---'}
                            </p>
                        </div>
                        <div className="w-px h-12 bg-white/10 self-center"/>
                        <div className="flex flex-col">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 hover:text-white/60 transition-colors">Pending Mints</p>
                            <p className="text-4xl font-black font-mono text-white tracking-tighter">
                                {supplyData !== undefined ? pendingTickets.toLocaleString() : '---'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Steps Section */}
            <div className="grid md:grid-cols-3 gap-6">
                {[
                    {
                        step: 1,
                        title: 'Connect Wallet',
                        desc: 'Link your Web3 wallet to securely check your on-chain balance.',
                        action: !isConnected && (
                            <button onClick={handleConnect} className="mt-4 w-full py-2.5 bg-[#050505] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1a1a1a] transition-all active:scale-[0.98]">
                                Connect Wallet
                            </button>
                        ),
                        status: isConnected ? 'COMPLETED' : 'PENDING'
                    },
                    {
                        step: 2,
                        title: 'Confirm Identity',
                        desc: 'Sign a zero-cost cryptographic message off-chain to confirm your ownership of the pass.',
                        action: isConnected && !paymentDone && (
                            <button onClick={handlePayment} className="mt-4 w-full py-2.5 bg-[#00C076] text-[#050505] rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#00C076]/20 hover:bg-[#00d683] hover:shadow-[#00C076]/40 transition-all active:scale-[0.98]">
                                Confirm Access
                            </button>
                        ),
                        status: paymentDone ? 'COMPLETED' : isConnected ? 'READY' : 'WAITING'
                    },
                    {
                        step: 3,
                        title: 'Access Granted',
                        desc: 'Interact with the verified environment and use all local tools.',
                        action: null,
                        status: 'LOCKED'
                    }
                ].map((s, i) => (
                    <div key={i} className={`p-8 rounded-3xl border transition-all ${s.status === 'COMPLETED' ? 'bg-[#00C076]/5 border-[#00C076]/20' : 'bg-white border-[#E5E5E5]'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <span className={`text-[10px] font-mono font-black ${s.status === 'COMPLETED' ? 'text-[#00C076]' : s.status === 'READY' ? 'text-[#050505]' : 'text-[#888888]'}`}>0{s.step}</span>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase ${s.status === 'COMPLETED' ? 'bg-[#00C076] text-white border-transparent' : 'bg-[#FAF9F6] text-[#888888] border-[#E5E5E5]'}`}>
                                {s.status}
                            </span>
                        </div>
                        <h3 className="text-lg font-black text-[#050505] uppercase tracking-tight mb-2">{s.title}</h3>
                        <p className="text-[11px] text-[#888888] font-medium leading-relaxed">{s.desc}</p>
                        {s.action}
                    </div>
                ))}
            </div>

            {/* Footer Info */}
            <div className="bg-[#FAF9F6] border border-[#E5E5E5] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-black text-[#050505] uppercase tracking-widest">Network Security Protocol</p>
                    <p className="text-[9px] text-[#888888] font-mono uppercase tracking-widest">Contract: {ACCESS_PASS_ADDRESS}</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="text-[9px] font-black text-[#050505] uppercase tracking-widest">Zero Trust</p>
                        <p className="text-[8px] text-[#888888] font-medium">Non-custodial access flow</p>
                    </div>
                </div>
            </div>

        </div>
    );
}
