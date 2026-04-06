"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { useWalletStore } from '@/lib/store/wallet-store';
import { Activity, Zap, TrendingUp, Key, ArrowRight, ShieldAlert, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';

interface AlphaInsight {
  darkPoolFlows: any[];
  smartMoneyTargets: any[];
  marketSentiment: any;
}

export default function AlphaIntelPage() {
  const { address: eoaAddress } = useSovereignAccount();
  const { address: sovereignAddress } = useWalletStore();
  const walletAddress = eoaAddress || sovereignAddress;

  const [insight, setInsight] = useState<AlphaInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [authFailed, setAuthFailed] = useState(false);

  useEffect(() => {
    if (!walletAddress) {
      setAuthFailed(true);
      setLoading(false);
      return;
    }

    const checkClaimStatus = async () => {
      try {
        const claimRes = await fetch(`/api/golden-ticket/claim?address=${walletAddress}`);
        const claimData = await claimRes.json();
        
        if (!claimData.hasClaimed) {
          setAuthFailed(true);
          setLoading(false);
          return;
        }

        const intelRes = await fetch(`/api/premium/alpha-intel?address=${walletAddress}`);
        const intelData = await intelRes.json();

        if (intelData.success) {
          setInsight(intelData.insights);
        } else {
          toast.error("Failed to decrypt alpha signals.");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    checkClaimStatus();
  }, [walletAddress]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-t-2 border-[#D4AF37] border-r-2 border-transparent animate-spin" />
          <span className="text-[#D4AF37]/50 text-xs tracking-[0.3em] uppercase">Decrypting Vectors...</span>
        </div>
      </div>
    );
  }

  if (authFailed || !insight) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center font-mono px-6">
        <div className="max-w-md w-full border border-red-900/30 bg-red-900/5 p-8 rounded-2xl flex flex-col items-center text-center">
          <Lock size={32} className="text-red-500/80 mb-6" />
          <h2 className="text-red-500 font-bold uppercase tracking-widest text-sm mb-3">Clearance Denied</h2>
          <p className="text-white/40 text-xs leading-relaxed mb-8">
            Access to the Alpha Intel Desk requires a verified Sovereign Wallet and an active Genesis ticket.
          </p>
          <a href="/" className="px-6 py-3 border border-red-500/30 text-red-500/80 rounded-full text-xs uppercase tracking-widest hover:bg-red-500/10 transition-colors">
            Return to Matrix
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37] opacity-[0.03] rounded-full blur-[120px]" />
      </div>

      <nav className="fixed top-0 left-0 right-0 p-6 z-50 flex justify-between items-center bg-gradient-to-b from-[#050505] to-transparent">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-[#D4AF37]" size={20} />
          <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#D4AF37]">Alpha Node Active</span>
        </div>
        <div className="font-mono text-[10px] text-white/30 tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
          ID: {walletAddress?.slice(0,6)}...{walletAddress?.slice(-4)}
        </div>
      </nav>

      <main className="relative pt-32 pb-24 px-6 max-w-5xl mx-auto z-10 flex flex-col gap-16">
        
        {/* Header */}
        <header>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
            className="text-4xl md:text-5xl font-serif font-light tracking-wide text-[#F0E0A0]"
            style={{ textShadow: "0 0 40px rgba(212,175,55,0.2)" }}
          >
            Alpha Intel Desk
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1 }}
            className="font-mono text-xs uppercase tracking-widest text-white/40 mt-4 max-w-xl leading-relaxed"
          >
            Institutional-grade network activity intercept. Filtering noise to expose pure truth.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sentiment Box */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="col-span-1 border border-white/10 bg-white/5 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] opacity-10 blur-[50px] rounded-full" />
            <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-8 flex items-center gap-2">
              <Activity size={12} /> Global Trajectory
            </h3>
            <div className="text-3xl font-serif tracking-wide text-[#D4AF37] mb-2">
              {insight.marketSentiment.overall}
            </div>
            <p className="text-xs text-white/50 mb-8 font-light">
              {insight.marketSentiment.divergence}
            </p>
            
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/40">Whale Index</span>
                <span className="text-[#D4AF37] font-mono">{insight.marketSentiment.whaleIndex}%</span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-1">
                <div className="bg-[#D4AF37] h-1 rounded-full" style={{ width: `${insight.marketSentiment.whaleIndex}%` }} />
              </div>

              <div className="flex justify-between items-center text-xs mt-3">
                <span className="text-white/40">Retail Index</span>
                <span className="text-white/60 font-mono">{insight.marketSentiment.retailIndex}%</span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-1">
                <div className="bg-white/20 h-1 rounded-full" style={{ width: `${insight.marketSentiment.retailIndex}%` }} />
              </div>
            </div>
          </motion.div>

          {/* Smart Money Targets */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="col-span-1 lg:col-span-2 border border-white/10 bg-white/5 rounded-3xl p-6 backdrop-blur-md"
          >
            <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-6 flex items-center gap-2">
              <Zap size={12} /> Institutional Signatures
            </h3>
            
            <div className="flex flex-col gap-3">
              {insight.smartMoneyTargets.map((target, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 hover:border-[#D4AF37]/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-lg font-black font-serif">
                      {target.ticker[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{target.ticker}</span>
                      <span className="text-[10px] text-white/40 font-mono mt-1">{target.sector}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono text-[#D4AF37] tracking-widest border border-[#D4AF37]/30 px-2 py-0.5 rounded-full mb-1">
                      {target.signal}
                    </span>
                    <span className="text-xs text-white/50">{target.anomaly}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Dark Pool Flows */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="col-span-1 lg:col-span-3 border border-white/10 bg-white/5 rounded-3xl p-6 backdrop-blur-md mt-6"
          >
            <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-6 flex items-center gap-2">
              <TrendingUp size={12} /> Dark Pool Intercepts
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[9px] uppercase tracking-[0.2em] text-white/30 font-mono">
                    <th className="font-normal py-3 px-2">Asset</th>
                    <th className="font-normal py-3 px-2">Volume</th>
                    <th className="font-normal py-3 px-2">Direction</th>
                    <th className="font-normal py-3 px-2 text-right">Conviction</th>
                  </tr>
                </thead>
                <tbody>
                  {insight.darkPoolFlows.map((flow, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-2 font-bold text-sm tracking-wide">{flow.asset}</td>
                      <td className="py-4 px-2 font-mono text-xs text-white/70">{flow.volume}</td>
                      <td className="py-4 px-2">
                        <span className={`text-[10px] font-mono px-2 py-1 rounded-full ${
                          flow.direction === 'DISTRIBUTION' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {flow.direction}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right font-mono text-[#D4AF37]">{flow.conviction}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
