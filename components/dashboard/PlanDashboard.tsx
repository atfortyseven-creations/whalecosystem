"use client";

import React, { useEffect, useState } from 'react';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { Shield, CreditCard, Mail, CheckCircle2, LayoutDashboard, AlertCircle, Loader2, CalendarClock, Building2, Download, ArrowUpRight } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center px-4 bg-[#050505] rounded-3xl border border-white/5 m-8">
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
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto p-4 md:p-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
            Billing
          </h1>
          <p className="text-[15px] text-white/40 mt-2 font-medium">Manage your subscription, email preferences, and payment history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Plan Card (Vercel/Stripe style) */}
        <div className="lg:col-span-2 bg-[#0A0A0A] rounded-2xl border border-white/[0.08] relative overflow-hidden flex flex-col justify-between">
          <div className="p-8 border-b border-white/[0.08]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Current Plan</p>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-black text-white">{formattedTier}</h2>
                  {!isFree && (
                    <span className="px-2.5 py-1 bg-white/5 text-white/60 text-[10px] font-bold uppercase tracking-[0.1em] rounded-md border border-white/10">
                      {cycle}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                {isFree || isExpired ? (
                  <button 
                    onClick={() => router.push('/pricing')}
                    className="px-5 py-2.5 bg-white text-black font-bold text-sm rounded-xl hover:bg-white/90 transition-all shadow-sm"
                  >
                    {isExpired ? 'Renew Subscription' : 'Upgrade Plan'}
                  </button>
                ) : (
                  <div className="px-4 py-2 bg-[#00C076]/10 border border-[#00C076]/20 text-[#00C076] font-bold text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    Active
                  </div>
                )}
              </div>
            </div>

            {!isFree && (
              <p className="text-sm text-white/50 flex items-center gap-2 font-medium">
                <CalendarClock size={16} className="text-white/30" />
                Your plan {isExpired ? 'expired on' : 'will automatically renew on'} <span className="text-white font-semibold">{expiresString}</span>
              </p>
            )}
            {isFree && (
              <p className="text-sm text-white/50 font-medium max-w-md">
                You are currently on the Free tier. Upgrade to unlock full on-chain intelligence, predictive models, and infinite API access.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 p-6 gap-6 bg-black/40">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40 flex items-center gap-1.5"><Mail size={12}/> Registered Email</span>
              <span className="text-sm font-semibold text-white/90">{userData.email || 'No email configured'}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40 flex items-center gap-1.5"><Shield size={12}/> Connected Wallet</span>
              <span className="text-sm font-mono font-medium text-white/90 truncate">{address}</span>
            </div>
          </div>
        </div>

        {/* Humanity Score / Perks */}
        <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-2xl p-8 flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40 mb-3">Cryptographic Score</p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-black text-white">{userData.humanityScore}</span>
            </div>
            <p className="text-xs text-white/50 leading-relaxed font-medium">
              Your account score represents your on-chain reputation. Premium users accumulate score 10x faster.
            </p>
          </div>

          <div className="space-y-4 pt-6 border-t border-white/[0.08] mt-6">
             <button className="w-full py-2.5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/5 transition-colors">
                View Account Profile
             </button>
          </div>
        </div>

      </div>

      {/* Transaction History */}
      <div className="mt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Invoices
          </h3>
          <span className="text-xs font-medium text-white/40">
            Securely processed via SEPA Euro Transfers
          </span>
        </div>
        
        <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-2xl overflow-hidden">
          {!userData.transactions || userData.transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CreditCard size={32} className="text-white/10 mb-4" />
              <p className="text-sm font-bold text-white/60">No invoices found</p>
              <p className="text-xs font-medium text-white/30 mt-1">When you purchase a plan, your invoices will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] uppercase tracking-[0.15em] text-white/40 font-bold">
                    <th className="py-4 pl-6 pr-4">Amount</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4">Date</th>
                    <th className="py-4 px-4">Reference</th>
                    <th className="py-4 pr-6 pl-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {userData.transactions.map((tx, idx) => (
                    <tr key={tx.id || idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 pl-6 pr-4 font-bold text-white">
                        €{tx.amount} <span className="text-white/30 font-medium text-xs ml-0.5">EUR</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] rounded-md border ${
                          tx.status === 'PROCESSING' 
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                            : tx.status === 'CONFIRMED'
                            ? 'bg-[#00C076]/10 text-[#00C076] border-[#00C076]/20'
                            : 'bg-white/10 text-white/60 border-white/10'
                        }`}>
                          {tx.status === 'PROCESSING' && <Loader2 size={10} className="animate-spin" />}
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-white/70">
                        {new Date(tx.timestamp || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] font-semibold text-white/50">
                        {tx.txHash}
                      </td>
                      <td className="py-4 pr-6 pl-4 text-right">
                        <button className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.1em] text-white/40 hover:text-white transition-colors">
                          <Download size={14} /> Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
