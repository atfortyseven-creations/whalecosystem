"use client";

import React, { useEffect, useState } from 'react';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { Shield, CreditCard, Mail, CheckCircle2, Zap, LayoutDashboard, Globe, AlertCircle, Loader2, CalendarClock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SubscriptionData {
  tier: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

interface UserData {
  tier: string;
  email: string | null;
  humanityScore: number;
  subscription?: SubscriptionData | null;
  transactions?: any[];
}

export function PlanDashboard() {
  const { isConnected, address, isSovereignHandshake } = useSovereignAccount();
  const router = useRouter();
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setUserData(data.user);
          }
        }
      } catch (e) {
        console.error("Failed to fetch user data for dashboard");
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, [isConnected, isSovereignHandshake]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Loader2 className="animate-spin text-[#00C076]" size={32} />
      </div>
    );
  }

  if (!isConnected || !userData) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center px-4">
        <Shield size={48} className="text-white/10 mb-4" />
        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Authentication Required</h2>
        <p className="text-white/40 mb-6 max-w-md font-medium">Connect your wallet to access your billing and plan information.</p>
        <button onClick={() => router.push('/connect')} className="px-6 py-3 bg-white text-black rounded-xl font-black uppercase tracking-widest hover:bg-white/80 transition-all">
          Connect Wallet
        </button>
      </div>
    );
  }

  const isFree = userData.tier === 'FREE';
  const sub = userData.subscription;
  
  let formattedTier = userData.tier;
  let cycle = 'Lifetime';
  let expiresString = 'Never';
  let isExpired = false;

  if (sub) {
    // sub.tier is expected to be e.g. "PRO_MONTHLY" or "ELITE_ANNUAL"
    const parts = sub.tier.split('_');
    formattedTier = parts[0] || userData.tier;
    cycle = parts[1] ? (parts[1].toLowerCase() === 'annual' ? 'Annually' : 'Monthly') : 'N/A';
    
    if (sub.expiresAt) {
      const expirationDate = new Date(sub.expiresAt);
      expiresString = expirationDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
      isExpired = expirationDate < new Date();
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto p-4 md:p-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <LayoutDashboard size={28} className="text-[#00C076]" />
            Billing & Plans
          </h1>
          <p className="text-sm text-white/40 mt-1 font-medium">Manage your subscription, billing details, and payment history.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#00C076]/10 px-4 py-2 rounded-full border border-[#00C076]/20 hidden md:flex">
          <div className="w-2 h-2 rounded-full bg-[#00C076] animate-pulse" />
          <span className="text-xs font-black text-[#00C076] uppercase tracking-widest">System Operational</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Plan Card */}
        <div className="lg:col-span-2 bg-white/[0.02] rounded-3xl p-8 border border-white/5 shadow-[0_0_50px_rgba(0,192,118,0.05)] relative overflow-hidden flex flex-col justify-between backdrop-blur-md">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#00C076]/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Current Plan</p>
              <h2 className="text-4xl font-black text-white">{formattedTier} <span className="text-lg text-white/30 font-medium">/ TIER</span></h2>
              {!isFree && (
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-2.5 py-1 bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-[0.2em] rounded-md border border-white/10">
                    {cycle} Billing
                  </span>
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] rounded-md border ${isExpired ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-[#00C076]/10 text-[#00C076] border-[#00C076]/20'}`}>
                    <CalendarClock size={12} />
                    {isExpired ? 'Expired' : `Valid until ${expiresString}`}
                  </span>
                </div>
              )}
            </div>
            
            {isFree || isExpired ? (
              <button 
                onClick={() => router.push('/pricing')}
                className="mt-4 md:mt-0 px-6 py-3 bg-[#00C076] text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(0,192,118,0.4)]"
              >
                {isExpired ? 'Renew Subscription' : 'Upgrade to Pro'}
              </button>
            ) : (
              <div className="mt-4 md:mt-0 px-4 py-2 bg-white/5 border border-white/10 text-white/50 font-black uppercase tracking-widest text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#00C076]" />
                Active Subscription
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            <div className="bg-[#050505] border border-white/5 p-4 rounded-2xl flex flex-col gap-1 overflow-hidden">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Connected Wallet</span>
              <span className="font-mono text-sm text-white/90 truncate">{address}</span>
            </div>
            <div className="bg-[#050505] border border-white/5 p-4 rounded-2xl flex flex-col gap-1 overflow-hidden">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Registered Email</span>
              <div className="flex items-center gap-2 overflow-hidden">
                <Mail size={14} className="text-white/40 shrink-0" />
                <span className="text-sm font-medium text-white/90 truncate">{userData.email || 'None provided'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Humanity Score / Perks */}
        <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden backdrop-blur-md">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Account Score</p>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-black text-white">{userData.humanityScore}</span>
              <span className="text-sm text-white/30 font-black uppercase tracking-widest">score</span>
            </div>
            
            <p className="text-[11px] text-white/50 leading-relaxed mb-6 font-medium">
              Your account score represents your reputation. Premium users accumulate score faster.
            </p>
          </div>

          <div className="space-y-3 border-t border-white/10 pt-6 relative z-10">
            <div className="flex items-center gap-3 text-xs font-black tracking-wider uppercase text-white/60">
              <Zap size={14} className="text-[#00C076]" />
              {isFree ? 'Standard Access' : 'Priority Support'}
            </div>
            <div className="flex items-center gap-3 text-xs font-black tracking-wider uppercase text-white/60">
              <Globe size={14} className="text-[#00C076]" />
              {isFree ? 'Public Forums' : 'Exclusive Community'}
            </div>
            <div className="flex items-center gap-3 text-xs font-black tracking-wider uppercase text-white/60">
              <Shield size={14} className="text-[#00C076]" />
              {isFree ? 'Basic Security' : 'Advanced Security'}
            </div>
          </div>
        </div>

      </div>

      {/* Transaction History */}
      <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 mt-2 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
            <CreditCard size={20} className="text-white/40" />
            Payment History
          </h3>
          <span className="text-[10px] uppercase font-black tracking-widest text-white/40 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            Invoices & receipts are sent to your email.
          </span>
        </div>
        
        {!userData.transactions || userData.transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 bg-[#050505] rounded-2xl border border-white/5 border-dashed">
            <AlertCircle size={24} className="text-white/20 mb-3" />
            <p className="text-xs font-black uppercase tracking-widest text-white/40">No payments found</p>
            <p className="text-[10px] font-medium text-white/30 mt-1">When you purchase a plan, your invoice will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.2em] text-white/40 font-black">
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 px-4">Plan (Cycle)</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Amount</th>
                  <th className="pb-3 pl-4">Transaction / Invoice</th>
                </tr>
              </thead>
              <tbody>
                {userData.transactions.map((tx, idx) => (
                  <tr key={tx.id || idx} className="border-b border-white/5 last:border-0 hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 pr-4 text-xs font-medium text-white/80">{new Date(tx.timestamp || Date.now()).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-xs font-black text-white">{tx.metadata?.planId || 'Unknown'} <span className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1">({tx.metadata?.billingCycle || 'N/A'})</span></td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-[0.2em] rounded-md border ${tx.status === 'CONFIRMED' ? 'bg-[#00C076]/10 text-[#00C076] border-[#00C076]/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-white/60">{tx.amount} {tx.token}</td>
                    <td className="py-4 pl-4 flex flex-col gap-1">
                      <a 
                        href={`https://etherscan.io/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-mono font-black text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                      >
                        {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}
                      </a>
                      {tx.metadata?.email ? <span className="text-[9px] font-medium text-white/30">Sent to {tx.metadata.email}</span> : <span className="text-[9px] text-white/20">No email set</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
