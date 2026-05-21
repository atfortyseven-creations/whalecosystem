"use client";

import React, { useEffect, useState } from 'react';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { Shield, CreditCard, Mail, CheckCircle2, AlertCircle, Loader2, CalendarClock, Download } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center px-4 bg-white rounded-3xl border border-slate-200/60 m-8 shadow-sm">
        <Shield size={48} className="text-slate-300 mb-4" />
        <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Authentication Required</h2>
        <p className="text-slate-500 mb-6 max-w-md font-medium">Connect your wallet to access your billing and plan information.</p>
        <button onClick={() => router.push('/connect')} className="px-6 py-3 bg-black text-white rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
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
  let isPending = false;

  if (sub) {
    if (sub.status === 'PENDING_SEPA') {
      isPending = true;
    }
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
    <div className="w-full h-full min-h-0 flex flex-col items-start justify-start p-4 md:p-8 text-black font-sans overflow-y-auto no-scrollbar relative bg-white">
      <div className="w-full max-w-[780px] bg-white/80 backdrop-blur-2xl border border-slate-200/60 rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.07)] p-7 md:p-10 flex flex-col transition-all duration-500 z-10 ml-0">
        
        {/* Header */}
        <div className="w-full flex-shrink-0 border-b border-slate-200/60 pb-5 mb-7">
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-slate-900 leading-none">
              Billing &amp; Plan
            </h1>
            <span className="mt-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Manage your subscription and payment history
            </span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-7">
          
          {/* Main Plan Card */}
          <div className="md:col-span-2 bg-white/50 backdrop-blur-md border border-slate-200/50 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
            <div className="p-6 md:p-8 border-b border-slate-200/40">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Current Plan</p>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter">{formattedTier}</h2>
                    {!isFree && (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[9px] font-black uppercase tracking-[0.2em] rounded-md border border-slate-200/60">
                        {cycle}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {isPending ? (
                    <div className="px-4 py-2 bg-amber-50 border border-amber-200 text-amber-600 font-bold uppercase tracking-widest text-[9px] rounded-lg flex items-center gap-2">
                      <Loader2 size={12} className="animate-spin" />
                      Pending Payment
                    </div>
                  ) : isFree || isExpired ? (
                    <button
                      onClick={() => router.push('/pricing')}
                      className="px-6 py-2.5 bg-black text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-slate-800 transition-all shadow-sm active:scale-95"
                    >
                      {isExpired ? 'Renew Plan' : 'Upgrade Plan'}
                    </button>
                  ) : (
                    <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold uppercase tracking-widest text-[9px] rounded-lg flex items-center gap-2">
                      <CheckCircle2 size={12} />
                      Active
                    </div>
                  )}
                </div>
              </div>

              {!isFree && !isPending && (
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <CalendarClock size={14} className="text-slate-400" />
                  Plan {isExpired ? 'expired on' : 'renews on'} <span className="text-slate-900">{expiresString}</span>
                </p>
              )}
              {isPending && (
                <p className="text-xs font-bold uppercase tracking-widest text-amber-600/80 mt-2 flex items-center gap-2">
                  <AlertCircle size={14} />
                  Pending bank confirmation.
                </p>
              )}
              {isFree && !isPending && (
                <p className="text-xs font-medium text-slate-500 max-w-lg leading-relaxed">
                  You are currently on the free plan. Upgrade to unlock premium features, advanced analytics, and priority support.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 p-6 gap-6 bg-slate-50/50">
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
                  <Mail size={12} /> Email Address
                </span>
                <span className="text-sm font-bold text-slate-800">{userData.email || 'Not configured'}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
                  <Shield size={12} /> Connected Wallet
                </span>
                <span className="text-sm font-bold font-mono text-slate-800 truncate">{address}</span>
              </div>
            </div>
          </div>

          {/* Account Score */}
          <div className="md:col-span-2 bg-white/50 backdrop-blur-md border border-slate-200/50 rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Account Score</p>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-5xl font-black font-mono tracking-tighter text-slate-900">{userData.humanityScore}</span>
              </div>
              <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-xl">
                Your account score reflects your activity level on the platform. Premium users accumulate score points faster.
              </p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="w-full flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900">
              Payment History
            </h3>
          </div>

          <div className="bg-white/50 backdrop-blur-md border border-slate-200/50 rounded-2xl overflow-hidden shadow-sm">
            {!userData.transactions || userData.transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CreditCard size={32} className="text-slate-300 mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">No invoices yet</p>
                <p className="text-xs font-medium text-slate-400 mt-1.5">Your payment history will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200/60 bg-slate-50/50 text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black">
                      <th className="py-4 pl-6 pr-4">Amount</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4">Date</th>
                      <th className="py-4 px-4">Reference</th>
                      <th className="py-4 pr-6 pl-4 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {userData.transactions.map((tx, idx) => (
                      <tr key={tx.id || idx} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-4 pl-6 pr-4 font-bold font-mono text-slate-800">
                          &euro;{tx.amount} <span className="text-slate-400 text-[10px]">EUR</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] rounded border ${
                            tx.status === 'PROCESSING' || tx.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-600 border-amber-200'
                              : tx.status === 'CONFIRMED' || tx.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            {(tx.status === 'PROCESSING' || tx.status === 'PENDING') && <Loader2 size={10} className="animate-spin" />}
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs font-bold text-slate-600">
                          {new Date(tx.timestamp || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-4 px-4 font-mono text-[10px] font-bold text-slate-400 group-hover:text-slate-800 transition-colors">
                          {tx.txHash}
                        </td>
                        <td className="py-4 pr-6 pl-4 text-right">
                          <button className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-800 transition-colors">
                            <Download size={12} /> PDF
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
    </div>
  );
}
