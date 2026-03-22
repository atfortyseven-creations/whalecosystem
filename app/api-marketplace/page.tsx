"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Shield, CheckCircle2, Lock, Key, Zap, ArrowRight, Star,
  AlertTriangle, CreditCard, Building2, User, Crown, Activity
} from "lucide-react";
import Link from "next/link";

const PLANS = [
  {
    id: "standard",
    name: "Standard",
    price: 15, // Approx 14.99
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE || "price_standard",
    badge: "VALUED",
    description: "Ideal for novice traders. 3 main crypto assets.",
    color: "#fb7185", // Rose
    icon: Activity,
    requests: "5,000 req/day",
    tokens: "3 tokens (BTC, ETH, BNB)",
    keys: "1 API key",
    features: [
      "REST API",
      "12h event window",
      "$1M threshold",
      "Basic support",
      "SLA 99.0%",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: 49,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE || "price_starter",
    badge: null,
    description: "For independent traders and researchers.",
    color: "#60a5fa",
    icon: User,
    requests: "10,000 req/day",
    tokens: "5 tokens (BTC, ETH, BNB, SOL, XRP)",
    keys: "1 API key",
    features: [
      "REST API",
      "24h event window",
      "$500K threshold",
      "Email support",
      "SLA 99.5%",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 299,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE || "price_pro",
    badge: "MOST POPULAR",
    description: "For professional desks and quants. Everything unlocked.",
    color: "#a78bfa",
    icon: Star,
    requests: "500,000 req/day",
    tokens: "24 tokens (Full suite)",
    keys: "3 API keys",
    features: [
      "REST + WebSocket + Webhooks",
      "30-day history",
      "$100K threshold",
      "Heikin-Ashi signals",
      "Tagged Elite wallets",
      "Dark pool detection",
      "Priority support + Telegram",
      "SLA 99.9%",
    ],
  },
  {
    id: "Elite",
    name: "Elite",
    price: 1999,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_INST_PRICE || "price_Elite",
    badge: "MAXIMUM POWER",
    description: "For hedge funds, market makers and trading firms.",
    color: "#fbbf24",
    icon: Building2,
    requests: "Unlimited",
    tokens: "All + custom tokens",
    keys: "10 keys + sub-accounts",
    features: [
      "REST + WebSocket + FIX Protocol",
      "12-month history",
      "Customizable $50K threshold",
      "IP whitelist + HMAC signature",
      "CSV / Parquet exports",
      "Advanced anomaly detection",
      "Dedicated Slack + onboarding call",
      "SLA 99.99% dedicated infrastructure",
    ],
  },
];

function SecurityBadge({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-white/40 font-mono uppercase tracking-widest">
      <Shield size={11} className="text-emerald-400" />
      {text}
    </div>
  );
}

export default function ApiMarketplacePage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTier = searchParams.get("tier") || "pro";

  const [selectedPlan, setSelectedPlan] = useState(
    PLANS.find((p) => p.id === initialTier) || PLANS[1]
  );
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [step, setStep] = useState<"select" | "checkout">("select");
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!isSignedIn) {
      router.push("/login?redirect=/api-marketplace");
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
          userEmail: user?.emailAddresses?.[0]?.emailAddress,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear la sesión de pago.");
      
      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || "Error inesperado. Intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(139,92,246,0.12),transparent_60%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      <div className="relative z-10 max-w-[1100px] mx-auto px-6 pt-24 pb-24 transform-gpu will-change-transform">

        {/* ── HEADER ──────────────────────────────────── */}
        <div className="text-center mb-16">
          <Link href="/" className="text-xs font-mono uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors mb-6 inline-block">
            ← Whale Alert Corporation
          </Link>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-4">
            API{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-300">
              Marketplace
            </span>
          </h1>
          <p className="text-white/50 max-w-xl mx-auto text-lg">
            Choose your plan. Your key will be active in less than 60 seconds after payment.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-8 xl:gap-12">

          {/* ── LEFT: PLAN SELECTOR ─────────────────── */}
          <div className="space-y-4">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6">
              Select your plan
            </div>

            {PLANS.map((plan) => {
              const selected = selectedPlan.id === plan.id;
              const PlanIcon = plan.icon;
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
                      ? "border-white/30 bg-white/[0.06]"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  }`}
                  style={selected ? { boxShadow: `0 0 30px ${plan.color}15` } : {}}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${plan.color}15`, border: `1px solid ${plan.color}30` }}
                      >
                        <PlanIcon size={18} style={{ color: plan.color }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white">{plan.name}</span>
                          {plan.badge && (
                            <span
                              className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded"
                              style={{ color: plan.color, border: `1px solid ${plan.color}40`, background: `${plan.color}12` }}
                            >
                              {plan.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-white/40 mt-0.5">{plan.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black text-white">${plan.price}</span>
                      <span className="text-white/30 text-xs font-mono">/mes</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 md:gap-3 mb-4">
                    {[plan.requests, plan.tokens, plan.keys].map((stat, i) => (
                      <div key={i} className="bg-black/30 rounded-xl px-2 py-2 md:px-3">
                        <div className="text-[8px] md:text-[9px] text-white/20 uppercase tracking-widest mb-0.5 truncate">
                          {["Requests", "Tokens", "API Keys"][i]}
                        </div>
                        <div className="text-[10px] md:text-xs font-bold text-white/70 truncate">{stat}</div>
                      </div>
                    ))}
                  </div>

                  <ul className="space-y-1.5">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-white/50">
                        <CheckCircle2 size={11} style={{ color: plan.color }} className="flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </motion.button>
              );
            })}
          </div>

          {/* ── RIGHT: CHECKOUT PANEL ───────────────── */}
          <div className="lg:sticky lg:top-24 h-fit transform-gpu">
            <div className="bg-white/[0.04] border border-white/15 rounded-3xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${selectedPlan.color}15`, border: `1px solid ${selectedPlan.color}30` }}
                >
                  <Key size={18} style={{ color: selectedPlan.color }} />
                </div>
                <div>
                  <div className="font-black text-white">{selectedPlan.name}</div>
                  <div className="text-xs text-white/30">Selected plan</div>
                </div>
              </div>

              {/* Order summary */}
              <div className="bg-black/30 rounded-2xl p-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">API Plan {selectedPlan.name}</span>
                  <span className="font-black text-white">${selectedPlan.price}/mo</span>
                </div>
                <div className="flex justify-between text-xs text-white/30">
                  <span>Billed monthly</span>
                  <span>Cancel anytime</span>
                </div>
                <div className="border-t border-white/[0.06] pt-2 flex justify-between">
                  <span className="font-black text-white text-sm">Total today</span>
                  <span className="font-black text-white text-xl">${selectedPlan.price}</span>
                </div>
              </div>

              {/* Acceptance checkbox */}
              <label className="flex items-start gap-3 cursor-pointer mb-6 group">
                <div
                  className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    agreed ? "bg-emerald-500 border-emerald-500" : "border-white/20 group-hover:border-white/40"
                  }`}
                  onClick={() => setAgreed(!agreed)}
                >
                  {agreed && <CheckCircle2 size={12} className="text-black" />}
                </div>
                <span className="text-xs text-white/40 leading-relaxed">
                  I accept the{" "}
                  <Link href="/terms" className="text-white/70 underline hover:text-white">
                    Terms of Service
                  </Link>{" "}
                  and the{" "}
                  <Link href="/privacy" className="text-white/70 underline hover:text-white">
                    Privacy Policy
                  </Link>
                  . I understand that{" "}
                  <strong className="text-white/70">there are no refunds</strong> and that
                  the API key is activated immediately after payment.
                  In case of dispute, my access will be suspended and evidence of
                  usage will be sent to Stripe.
                </span>
              </label>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-xs text-red-400 flex items-start gap-2">
                  <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              {!isLoaded ? (
                <div className="w-full py-4 rounded-2xl bg-white/10 animate-pulse" />
              ) : !isSignedIn ? (
                <Link href="/login?redirect=/api-marketplace">
                  <button className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-white/90 transition-colors flex items-center justify-center gap-2">
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
                      ? `linear-gradient(135deg, ${selectedPlan.color}90, ${selectedPlan.color}50)`
                      : "rgba(255,255,255,0.08)",
                    border: `1px solid ${selectedPlan.color}30`,
                    color: "white",
                  }}
                >
                  {loading ? (
                    <Activity size={16} className="animate-spin" />
                  ) : (
                    <>
                      <CreditCard size={16} />
                      Pay with Stripe — ${selectedPlan.price}/mo
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
            <div className="mt-4 bg-emerald-500/[0.05] border border-emerald-500/15 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={14} className="text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400">After payment</span>
              </div>
              <ul className="space-y-2">
                {[
                  "API key generated in < 5 seconds",
                  "Welcome email with credentials",
                  "Immediate access to documentation",
                  "First whale event < 12 seconds",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-white/50">
                    <CheckCircle2 size={10} className="text-emerald-400" />
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

