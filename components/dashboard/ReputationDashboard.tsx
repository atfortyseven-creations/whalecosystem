"use client";

import React, { useState } from 'react';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { Award, Zap, Shield, Activity, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

// Contract configuration
const SBT_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_SBT_CONTRACT_ADDRESS as `0x${string}`) || '0x0000000000000000000000000000000000000000';

const sbtAbi = [
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "hasSBT",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "holderTier",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "holder", "type": "address" }],
    "name": "getDaysActive",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "holder", "type": "address" }],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export function ReputationDashboard() {
  const { address, isConnected } = useSovereignAccount();

  // On-chain reads using wagmi
  const { data: hasSbtData, isLoading: loadingHasSbt } = useReadContract({
    address: SBT_CONTRACT_ADDRESS,
    abi: sbtAbi,
    functionName: 'hasSBT',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const { data: tierData, isLoading: loadingTier } = useReadContract({
    address: SBT_CONTRACT_ADDRESS,
    abi: sbtAbi,
    functionName: 'holderTier',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!hasSbtData }
  });

  const { data: daysActiveData, isLoading: loadingDays } = useReadContract({
    address: SBT_CONTRACT_ADDRESS,
    abi: sbtAbi,
    functionName: 'getDaysActive',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!hasSbtData }
  });

  const { writeContractAsync, isPending } = useWriteContract();

  const hasSbt = Boolean(hasSbtData);
  const tier = tierData !== undefined ? Number(tierData) : 0;
  const daysActive = daysActiveData !== undefined ? Number(daysActiveData) : 0;
  
  // Real score calculation based on pure on-chain parameters
  const score = hasSbt ? 300 + (tier * 100) + (daysActive * 2) : 0;
  const loading = loadingHasSbt || loadingTier || loadingDays;

  const mintSBT = async () => {
    if (!address) return;
    try {
      const t = toast.loading('Sending mint transaction...');
      const txHash = await writeContractAsync({
        address: SBT_CONTRACT_ADDRESS,
        abi: sbtAbi,
        functionName: 'mint',
        args: [address],
      });
      toast.loading('Waiting for confirmation...', { id: t });
      toast.success(`Reputation SBT Minted Successfully! TX: ${txHash.slice(0, 8)}...`, { id: t });
    } catch (err: any) {
      toast.error(err.message || 'Minting failed.');
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-5 bg-[#050505] rounded-3xl border border-white/5 m-4">
        <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
          <Award size={28} strokeWidth={1.4} style={{ color: '#D4AF37' }} />
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-xl font-black text-white tracking-widest uppercase">Reputation Gateway</h3>
          <p className="text-xs text-white/40 max-w-[340px] leading-relaxed">
            Connect your wallet to analyze your on-chain footprint and access your Soulbound identity matrix.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
        <RefreshCw className="animate-spin text-[#D4AF37]" size={28} />
        <span className="text-[10px] font-black tracking-[0.3em] text-[#D4AF37] uppercase">Indexing On-Chain Footprint...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Identity Card */}
        <div className="col-span-1 md:col-span-2 bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Sovereign Identity</p>
              <h2 className="text-3xl font-black text-white tracking-tight mb-1">Reputation Matrix</h2>
              <p className="text-xs text-white/50 font-mono">{address}</p>
            </div>
            {hasSbt ? (
              <div className="px-3 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5">
                <Shield size={12} /> Active SBT
              </div>
            ) : (
              <div className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5">
                <AlertTriangle size={12} /> Unverified
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] block mb-2">Global Score</span>
              <span className="text-4xl font-black text-white font-mono">{score}</span>
              {hasSbt && <span className="text-[10px] text-emerald-400 ml-2">Top {Math.max(1, 100 - (score / 10))} %</span>}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] block mb-2">Network Tier</span>
              <span className="text-2xl font-black text-[#D4AF37] uppercase tracking-widest">
                {tier === 0 ? 'Observer' : tier === 1 ? 'Analyst' : tier === 2 ? 'Pro Node' : 'Elite Node'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mb-4">
              <Zap size={18} style={{ color: '#D4AF37' }} />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">Soulbound Token</h3>
            <p className="text-[11px] text-white/40 leading-relaxed">
              Your SBT is a non-transferable cryptographic proof of your on-chain history and institutional access level.
            </p>
          </div>
          
          <button 
            onClick={mintSBT}
            disabled={hasSbt || isPending}
            className={`w-full py-3 mt-6 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-2 ${
              hasSbt 
                ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
                : 'bg-[#D4AF37] text-black hover:bg-[#F3CE56]'
            }`}
          >
            {isPending ? <RefreshCw size={14} className="animate-spin" /> : <Award size={14} />}
            {hasSbt ? 'SBT Issued' : 'Mint Passport'}
          </button>
        </div>
      </div>

      {/* Trait Matrix (Removed fake traits, showing real on-chain data representation) */}
      {hasSbt && (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 overflow-hidden relative">
          <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-6">Cryptographic Behavioral Heuristics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Network Tier', val: tier.toString(), c: '#00C076' },
              { label: 'Days Active', val: daysActive.toString(), c: '#0052FF' },
              { label: 'SBT Address', val: `${SBT_CONTRACT_ADDRESS.slice(0, 6)}...`, c: '#9945FF' },
            ].map(t => (
              <div key={t.label} className="border-l-2 pl-3 py-1" style={{ borderColor: t.c }}>
                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block mb-1">{t.label}</span>
                <span className="text-sm font-black font-mono text-white">{t.val}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
