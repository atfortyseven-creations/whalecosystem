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
    <div className="flex flex-col gap-8 w-full mx-auto p-6 md:p-12 font-sans bg-[#FAF9F6] text-[#050505] min-h-full rounded-3xl border border-black/[0.04]">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.04] pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#050505] flex items-center gap-3 uppercase">
            Billing &amp; Plan
          </h1>
          <p className="text-[12px] text-black/50 mt-2 font-black uppercase tracking-[0.2em]">
            Manage your subscription, identity attestation, and payment history.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Plan Card */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-black/[0.06] relative overflow-hidden flex flex-col justify-between shadow-xl">
          <div className="p-10 border-b border-black/[0.04]">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-3">Current Active Plan</p>
                <div className="flex items-center gap-4">
                  <h2 className="text-4xl font-black text-[#050505] uppercase tracking-tighter">{formattedTier}</h2>
                  {!isFree && (
                    <span className="px-3 py-1.5 bg-black/5 text-[#050505] text-[10px] font-black uppercase tracking-[0.2em] rounded-lg border border-black/10">
                      {cycle}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                {isPending ? (
                  <div className="px-5 py-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Awaiting SEPA
                  </div>
                ) : isFree || isExpired ? (
                  <button
                    onClick={() => router.push('/pricing')}
                    className="px-8 py-3.5 bg-[#050505] text-white font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-black/80 transition-all shadow-lg hover:scale-105 active:scale-95"
                  >
                    {isExpired ? 'Renew Access' : 'Upgrade Protocol'}
                  </button>
                ) : (
                  <div className="px-5 py-2.5 bg-[#00C076]/10 border border-[#00C076]/20 text-[#00C076] font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    Verified Active
                  </div>
                )}
              </div>
            </div>

            {!isFree && !isPending && (
              <p className="text-[11px] font-black uppercase tracking-widest text-black/40 flex items-center gap-2">
                <CalendarClock size={14} className="text-black/30" />
                Plan {isExpired ? 'expired on' : 'renews on'} <span className="text-[#050505]">{expiresString}</span>
              </p>
            )}
            {isPending && (
              <p className="text-[11px] font-black uppercase tracking-widest text-amber-600/70 max-w-md mt-2 flex items-center gap-2">
                <AlertCircle size={14} />
                Pending manual bank confirmation.
              </p>
            )}
            {isFree && !isPending && (
              <p className="text-[11px] font-black uppercase tracking-widest text-black/40 max-w-lg leading-relaxed">
                Currently on the free tier. Upgrade to unlock full on-chain intelligence, predictive models, and infinite API access.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 p-8 gap-8 bg-[#FAF9F6]">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 flex items-center gap-2">
                <Mail size={12} /> Registered Contact
              </span>
              <span className="text-[13px] font-black text-[#050505]">{userData.email || 'NO_EMAIL_CONFIGURED'}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 flex items-center gap-2">
                <Shield size={12} /> Connected Wallet
              </span>
              <span className="text-[13px] font-black font-mono text-[#050505] truncate">{address}</span>
            </div>
          </div>
        </div>

        {/* Humanity Score */}
        <div className="bg-white border border-black/[0.06] rounded-[2rem] p-10 flex flex-col justify-between shadow-xl">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-4">Identity Attestation</p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-6xl font-black font-mono tracking-tighter text-[#050505]">{userData.humanityScore}</span>
            </div>
            <p className="text-[11px] font-black uppercase tracking-widest text-black/40 leading-relaxed">
              Your cryptographic score represents your on-chain reputation. Premium users accumulate score 10x faster.
            </p>
          </div>
          <div className="space-y-4 pt-8 border-t border-black/[0.04] mt-8">
            <button className="w-full py-3.5 border border-black/10 bg-[#FAF9F6] rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-[#050505] hover:bg-black/5 hover:border-black/20 transition-all">
              View Entity Profile
            </button>
          </div>
        </div>

      </div>

      {/* Transaction History */}
      <div className="mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h3 className="text-2xl font-black uppercase tracking-tighter text-[#050505] flex items-center gap-2">
            Invoices &amp; Billing
          </h3>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">
            Securely processed via SEPA
          </span>
        </div>

        <div className="bg-white border border-black/[0.06] rounded-[2rem] overflow-hidden shadow-xl">
          {!userData.transactions || userData.transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <CreditCard size={48} className="text-black/10 mb-6" />
              <p className="text-sm font-black uppercase tracking-[0.2em] text-black/60">No invoices generated</p>
              <p className="text-[10px] font-black uppercase tracking-[0.1em] text-black/30 mt-2">Purchase history will securely anchor here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/[0.04] bg-[#FAF9F6] text-[10px] uppercase tracking-[0.2em] text-black/40 font-black">
                    <th className="py-5 pl-8 pr-4">Amount</th>
                    <th className="py-5 px-4">Status</th>
                    <th className="py-5 px-4">Date</th>
                    <th className="py-5 px-4">Reference</th>
                    <th className="py-5 pr-8 pl-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {userData.transactions.map((tx, idx) => (
                    <tr key={tx.id || idx} className="hover:bg-[#FAF9F6] transition-colors group">
                      <td className="py-5 pl-8 pr-4 font-black font-mono text-[#050505]">
                        &euro;{tx.amount} <span className="text-black/30 text-[10px]">EUR</span>
                      </td>
                      <td className="py-5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-md border ${
                          tx.status === 'PROCESSING' || tx.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            : tx.status === 'CONFIRMED' || tx.status === 'ACTIVE'
                            ? 'bg-[#00C076]/10 text-[#00C076] border-[#00C076]/20'
                            : 'bg-black/5 text-black/60 border-black/10'
                        }`}>
                          {(tx.status === 'PROCESSING' || tx.status === 'PENDING') && <Loader2 size={10} className="animate-spin" />}
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-5 px-4 text-[11px] font-black uppercase tracking-widest text-black/60">
                        {new Date(tx.timestamp || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-5 px-4 font-mono text-[10px] font-black text-black/40 group-hover:text-[#050505] transition-colors">
                        {tx.txHash}
                      </td>
                      <td className="py-5 pr-8 pl-4 text-right">
                        <button className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-black/40 hover:text-[#050505] transition-colors">
                          <Download size={12} /> Download
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
