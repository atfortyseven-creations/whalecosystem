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
        <Shield size={48} className="text-black/10 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
        <p className="text-black/50 mb-6 max-w-md">Connect your wallet to access your billing and plan information.</p>
        <button onClick={() => router.push('/connect')} className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-black/80 transition-all">
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#050505] flex items-center gap-3">
            <LayoutDashboard size={28} className="text-[#00C076]" />
            Billing & Plans
          </h1>
          <p className="text-sm text-black/50 mt-1">Manage your subscription, billing details, and payment history.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#00C076]/10 px-4 py-2 rounded-full border border-[#00C076]/20 hidden md:flex">
          <div className="w-2 h-2 rounded-full bg-[#00C076] animate-pulse" />
          <span className="text-xs font-bold text-[#00C076] uppercase tracking-widest">System Operational</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Plan Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-black/10 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#00C076]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-black/40 mb-1">Current Plan</p>
              <h2 className="text-4xl font-bold text-black">{formattedTier} <span className="text-lg text-black/30 font-medium">/ TIER</span></h2>
              {!isFree && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 py-1 bg-black/5 text-black/60 text-[10px] font-black uppercase tracking-widest rounded-md border border-black/5">
                    {cycle} Billing
                  </span>
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md border ${isExpired ? 'bg-red-50 text-red-500 border-red-100' : 'bg-[#00C076]/10 text-[#00C076] border-[#00C076]/20'}`}>
                    <CalendarClock size={12} />
                    {isExpired ? 'Expired' : `Valid until ${expiresString}`}
                  </span>
                </div>
              )}
            </div>
            
            {isFree || isExpired ? (
              <button 
                onClick={() => router.push('/pricing')}
                className="mt-4 md:mt-0 px-6 py-2.5 bg-[#00C076] text-black font-bold text-sm rounded-xl hover:bg-emerald-400 transition-all shadow-md"
              >
                {isExpired ? 'Renew Subscription' : 'Upgrade to Pro'}
              </button>
            ) : (
              <div className="mt-4 md:mt-0 px-4 py-2 bg-black/5 text-black/50 font-bold text-sm rounded-xl flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#00C076]" />
                Active Subscription
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            <div className="bg-black/5 p-4 rounded-2xl flex flex-col gap-1 overflow-hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-black/40">Connected Wallet</span>
              <span className="font-mono text-sm truncate">{address}</span>
            </div>
            <div className="bg-black/5 p-4 rounded-2xl flex flex-col gap-1 overflow-hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-black/40">Registered Email</span>
              <div className="flex items-center gap-2 overflow-hidden">
                <Mail size={14} className="text-black/40 shrink-0" />
                <span className="text-sm font-medium truncate">{userData.email || 'None provided'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Humanity Score / Perks */}
        <div className="bg-black text-white rounded-3xl p-8 shadow-xl flex flex-col justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">Account Score</p>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold">{userData.humanityScore}</span>
              <span className="text-sm text-white/40 font-medium">score</span>
            </div>
            
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              Your account score represents your reputation. Premium users accumulate score faster.
            </p>
          </div>

          <div className="space-y-3 border-t border-white/10 pt-6">
            <div className="flex items-center gap-3 text-sm font-medium text-white/80">
              <Zap size={16} className="text-[#00C076]" />
              {isFree ? 'Standard Access' : 'Priority Support'}
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-white/80">
              <Globe size={16} className="text-[#00C076]" />
              {isFree ? 'Public Forums' : 'Exclusive Community Access'}
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-white/80">
              <Shield size={16} className="text-[#00C076]" />
              {isFree ? 'Basic Security' : 'Advanced Security Features'}
            </div>
          </div>
        </div>

      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-3xl p-8 border border-black/10 mt-2 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <CreditCard size={20} className="text-black/40" />
            Payment History
          </h3>
          <span className="text-xs text-black/50 bg-black/5 px-3 py-1.5 rounded-lg border border-black/5 font-medium">
            Invoices & receipts are sent to your email upon purchase.
          </span>
        </div>
        
        {!userData.transactions || userData.transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 bg-black/5 rounded-2xl border border-black/5 border-dashed">
            <AlertCircle size={24} className="text-black/20 mb-3" />
            <p className="text-sm font-medium text-black/50">No payments found.</p>
            <p className="text-xs text-black/30 mt-1">When you purchase a plan, your invoice will be sent to your email.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-xs uppercase tracking-widest text-black/40 font-bold">
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 px-4">Plan (Cycle)</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Amount</th>
                  <th className="pb-3 pl-4">Transaction / Invoice</th>
                </tr>
              </thead>
              <tbody>
                {userData.transactions.map((tx, idx) => (
                  <tr key={tx.id || idx} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02] transition-colors">
                    <td className="py-4 pr-4 font-medium text-black/80">{new Date(tx.timestamp || Date.now()).toLocaleDateString()}</td>
                    <td className="py-4 px-4 font-bold text-black">{tx.metadata?.planId || 'Unknown'} <span className="text-[10px] font-medium text-black/40 ml-1">({tx.metadata?.billingCycle || 'N/A'})</span></td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-md border ${tx.status === 'CONFIRMED' ? 'bg-[#00C076]/10 text-[#00C076] border-[#00C076]/20' : 'bg-red-50 text-red-500 border-red-100'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-black/60">{tx.amount} {tx.token}</td>
                    <td className="py-4 pl-4 flex flex-col gap-1">
                      <a 
                        href={`https://etherscan.io/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-mono text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}
                      </a>
                      {tx.metadata?.email ? <span className="text-[10px] text-black/40">Sent to {tx.metadata.email}</span> : <span className="text-[10px] text-black/30">No email set</span>}
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
