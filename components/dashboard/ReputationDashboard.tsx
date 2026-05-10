"use client";

import React, { useState, useEffect } from 'react';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { Award, Zap, Shield, Database, Activity, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function ReputationDashboard() {
  const { address, isConnected } = useSovereignAccount();
  const [score, setScore] = useState(0);
  const [isMinting, setIsMinting] = useState(false);
  const [hasSbt, setHasSbt] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simulate network fetch
  useEffect(() => {
    if (!isConnected) {
      setLoading(false);
      return;
    }
    const timer = setTimeout(() => {
      // Deterministic simulation
      const mockScore = address ? (address.charCodeAt(2) * address.charCodeAt(3)) % 1000 : 0;
      setScore(mockScore > 300 ? mockScore : 300);
      setHasSbt(mockScore % 2 === 0);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [isConnected, address]);

  const mintSBT = async () => {
    setIsMinting(true);
    const t = toast.loading('Initiating Zero-Knowledge Proof generation...');
    await new Promise(r => setTimeout(r, 1200));
    toast.loading('Deploying Sovereign Reputation Soulbound Token to Optimism L2...', { id: t });
    await new Promise(r => setTimeout(r, 1500));
    setHasSbt(true);
    setScore(score + 150);
    toast.success('Reputation SBT Minted Successfully. Your on-chain identity is now verifiable.', { id: t });
    setIsMinting(false);
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
              <span className="text-[10px] text-emerald-400 ml-2">Top 12%</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] block mb-2">Network Tier</span>
              <span className="text-2xl font-black text-[#D4AF37] uppercase tracking-widest">{score > 500 ? 'Elite' : 'Pro'} Node</span>
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
            disabled={hasSbt || isMinting}
            className={`w-full py-3 mt-6 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-2 ${
              hasSbt 
                ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
                : 'bg-[#D4AF37] text-black hover:bg-[#F3CE56]'
            }`}
          >
            {isMinting ? <RefreshCw size={14} className="animate-spin" /> : <Award size={14} />}
            {hasSbt ? 'SBT Issued' : 'Mint Passport'}
          </button>
        </div>
      </div>

      {/* Trait Matrix (Miles de trillones de parametros aesthetic) */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 overflow-hidden relative">
        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-6">Cryptographic Behavioral Heuristics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'DeFi Interaction', val: '94%', c: '#00C076' },
            { label: 'Risk Tolerance', val: 'High', c: '#FF3B30' },
            { label: 'Wallet Age', val: '840 Days', c: '#0052FF' },
            { label: 'Governance Votes', val: '12', c: '#9945FF' },
            { label: 'MEV Exposure', val: 'Low', c: '#00C076' },
            { label: 'NFT Volume', val: '4.2 ETH', c: '#F7931A' },
            { label: 'Bridge Activity', val: 'High', c: '#D4AF37' },
            { label: 'Contract Deployments', val: '0', c: '#ffffff40' },
          ].map(t => (
            <div key={t.label} className="border-l-2 pl-3 py-1" style={{ borderColor: t.c }}>
              <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block mb-1">{t.label}</span>
              <span className="text-sm font-black font-mono text-white">{t.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
