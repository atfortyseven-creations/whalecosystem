"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Shield, CheckCircle2, Lock, Key, Zap, Activity,
  AlertTriangle, CreditCard, Building2, User, Star
} from "lucide-react";
import Link from "next/link";
import { WhaleAlertLoader } from "@/components/ui/WhaleAlertLoader";
import { API_MARKETPLACE_PLANS } from "@/lib/api-marketplace-plans";

const PLANS = API_MARKETPLACE_PLANS;

function SecurityBadge({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono uppercase tracking-widest">
      <Shield size={11} className="text-slate-600" />
      {text}
    </div>
  );
}

export default function PricingPage() {
  return (
    <React.Suspense fallback={<WhaleAlertLoader bg="#FAFAF8" color="#050505" />}>
      <PricingPageContent />
    </React.Suspense>
  );
}

function PricingPageContent() {
  const { address, isConnected, status } = useAccount();
  const isSignedIn = isConnected;
  const isLoaded = status !== 'connecting' && status !== 'reconnecting';
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTier = searchParams.get("tier") || "pro";

  const [selectedPlan, setSelectedPlan] = useState(
    PLANS.find((p) => p.id === initialTier) || PLANS[1]
  );
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!isSignedIn) {
      router.push("/login?redirect=/pricing");
      return;
    }
    if (!agreed) {
      setError("You must accept the terms and the non-refund policy to continue.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/payment/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan.id,
          stripePriceId: selectedPlan.stripePriceId,
          userEmail: address,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error creating payment session.");

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || "Unexpected error. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden">
      <div className="relative z-10 max-w-[1100px] mx-auto px-6 pt-24 pb-24 transform-gpu will-change-transform">

        {/*  HEADER  */}
        <div className="text-center mb-16">
          <Link href="/" className="text-xs font-mono uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors mb-6 inline-block">
             Whale Alert Corporation
          </Link>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 mb-4">
            Pricing Plans
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-lg">
            Large-wallet alerts and market-flow data over REST and WebSocket—with HMAC authentication.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-8 xl:gap-12">

          {/*  LEFT: PLAN SELECTOR  */}
          <div className="space-y-4">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">
              Select your plan
            </div>

            {PLANS.map((plan) => {
              const selected = selectedPlan.id === plan.id;
              const PlanIcon = plan.icon === 'Activity' ? Activity : plan.icon === 'User' ? User : plan.icon === 'Star' ? Star : Building2;
              return (
                <motion.button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  transition={{
                    type: "spring",
                    stiffness: 450,
                    damping: 30,
                    mass: 0.8
                  }}
                  className={`w-full text-left rounded-3xl border p-5 md:p-6 transition-all duration-200 transform-gpu ${
                    selected
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                  style={selected ? { boxShadow: `0 0 30px ${plan.color}15` } : {}}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${plan.color}08`, border: `1px solid ${plan.color}20` }}
                      >
                        <PlanIcon size={18} style={{ color: plan.color }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900">{plan.name}</span>
                          {plan.badge && (
                            <span
                              className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded"
                              style={{ color: plan.color, border: `1px solid ${plan.color}30`, background: `${plan.color}08` }}
                            >
                              {plan.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{plan.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black text-slate-900">${plan.price}</span>
                      <span className="text-slate-400 text-xs font-mono">/mo</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 md:gap-3 mb-4">
                    {[plan.requests, plan.tokens, plan.keys].map((stat, i) => (
                      <div key={i} className="bg-slate-100 rounded-xl px-2 py-2 md:px-3">
                        <div className="text-[8px] md:text-[9px] text-slate-400 uppercase tracking-widest mb-0.5 truncate">
                          {["Requests", "Tokens", "API Keys"][i]}
                        </div>
                        <div className="text-[10px] md:text-xs font-bold text-slate-700 truncate">{stat}</div>
                      </div>
                    ))}
                  </div>

                  <ul className="space-y-1.5">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-500">
                        <CheckCircle2 size={11} style={{ color: plan.color }} className="flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </motion.button>
              );
            })}
          </div>

          {/*  RIGHT: CHECKOUT PANEL  */}
          <div className="lg:sticky lg:top-24 h-fit transform-gpu">
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${selectedPlan.color}08`, border: `1px solid ${selectedPlan.color}20` }}
                >
                  <Key size={18} style={{ color: selectedPlan.color }} />
                </div>
                <div>
                  <div className="font-black text-slate-900">{selectedPlan.name}</div>
                  <div className="text-xs text-slate-500">Selected plan</div>
                </div>
              </div>

              {/* Order summary */}
              <div className="bg-white rounded-2xl p-4 mb-6 space-y-2 border border-slate-200">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">API Plan {selectedPlan.name}</span>
                  <span className="font-black text-slate-900">${selectedPlan.price}/mo</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Billed monthly</span>
                  <span>Cancel anytime</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between">
                  <span className="font-black text-slate-900 text-sm">Total today</span>
                  <span className="font-black text-slate-900 text-xl">${selectedPlan.price}</span>
                </div>
              </div>

              {/* Acceptance checkbox */}
              <label className="flex items-start gap-3 cursor-pointer mb-6 group">
                <div
                  className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    agreed ? "bg-slate-900 border-slate-900" : "border-slate-300 group-hover:border-slate-400"
                  }`}
                  onClick={() => setAgreed(!agreed)}
                >
                  {agreed && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <span className="text-xs text-slate-500 leading-relaxed">
                  I accept the{" "}
                  <Link href="/terms" className="text-slate-700 underline hover:text-slate-900">
                    Terms of Service
                  </Link>{" "}
                  and the{" "}
                  <Link href="/privacy" className="text-slate-700 underline hover:text-slate-900">
                    Privacy Policy
                  </Link>
                  . I understand that{" "}
                  <strong className="text-slate-700">there are no refunds</strong> and that
                  the API key is activated immediately after payment.
                  In case of dispute, my access will be suspended and evidence of
                  usage will be sent to Stripe.
                </span>
              </label>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-xs text-red-600 flex items-start gap-2">
                  <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              {!isLoaded ? (
                <div className="w-full py-4 rounded-2xl bg-slate-200 animate-pulse" />
              ) : !isSignedIn ? (
                <Link href="/login?redirect=/pricing">
                  <button className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                    <Lock size={14} /> Login to continue
                  </button>
                </Link>
              ) : (
                <motion.button
                  key={`checkout-${selectedPlan.id}`}
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  onClick={handleCheckout}
                  disabled={loading || !agreed}
                  className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transform-gpu"
                  style={{
                    background: agreed
                      ? selectedPlan.color
                      : "rgba(0,0,0,0.05)",
                    border: `1px solid ${selectedPlan.color}30`,
                    color: agreed ? "white" : "slate-400",
                  }}
                >
                  {loading ? (
                    <Activity size={16} className="animate-spin" />
                  ) : (
                    <>
                      <CreditCard size={16} />
                      Pay with Stripe  ${selectedPlan.price}/mo
                    </>
                  )}
                </motion.button>
              )}

              {/* Security badges */}
              <div className="mt-6 space-y-2">
                <SecurityBadge text="Payment processed by Stripe (PCI DSS Level 1)" />
                <SecurityBadge text="3D Secure 2 mandatory on all cards" />
                <SecurityBadge text="TLS 1.3 Encryption · data never stored" />
                <SecurityBadge text="Device fingerprint at time of payment" />
              </div>
            </div>

            {/* After payment */}
            <div className="mt-4 bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={14} className="text-slate-600" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-600">After payment</span>
              </div>
              <ul className="space-y-2">
                {[
                  "API key generated in < 5 seconds",
                  "Welcome email with credentials",
                  "Immediate access to documentation",
                  "First whale event < 12 seconds",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-slate-500">
                    <CheckCircle2 size={10} className="text-slate-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Session Quality Benefits */}
            <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={14} className="text-slate-600" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-600">Session Quality Benefits</span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Upgrading your plan improves your session experience and data quality:
              </p>
              <ul className="space-y-2">
                {selectedPlan.sessionQualityBenefits?.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckCircle2 size={10} className="text-slate-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
