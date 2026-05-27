"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CoreAuthGate } from "@/components/auth/CoreAuthGate";
import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // If user already has a local wallet, redirect to login — no need to create another one here
    try {
      const accs = localStorage.getItem("system_accounts");
      if (accs && JSON.parse(accs).length > 0) {
        router.replace("/login");
        return;
      }
      const ks = localStorage.getItem("system_keystore");
      const vault = localStorage.getItem("system_vault_v1");
      if (ks || vault) {
        router.replace("/login");
        return;
      }
    } catch {
      // localStorage blocked — continue
    }
  }, [router]);

  const handleComplete = useCallback(() => {
    router.replace("/portfolio");
  }, [router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-black/15 border-t-black/50 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#fafafa] flex flex-col">

      {/* Subtle geometric background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#2a1b4d]/[0.04] to-transparent" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#050505]/[0.03] to-transparent" />
      </div>

      {/* Top bar */}
      <header className="relative z-10 w-full px-6 py-5 flex items-center justify-between border-b border-black/[0.06]">
        <Link
          href="/login"
          className="flex items-center gap-2 text-[#050505]/40 hover:text-[#050505]/70 transition-colors group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Back to Login</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.35em] text-[#2a1b4d]/60">
            Humanity Ledger
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-start justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[520px]">

          {/* Page title */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 text-center"
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.45em] text-[#2a1b4d]/50 mb-2">
              New Account
            </p>
            <h1 className="text-3xl font-black tracking-tight text-[#050505] leading-tight">
              Create your Wallet
            </h1>
            <p className="mt-2 text-[13px] text-[#050505]/45 leading-relaxed max-w-xs mx-auto">
              Generate a 12-word recovery phrase that only you control. No email. No password resets. Yours forever.
            </p>
          </motion.div>

          {/* CoreAuthGate — contains the entire mnemonic wallet creation flow */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-[2rem] shadow-[0_8px_48px_rgba(0,0,0,0.07)] border border-black/[0.07] overflow-hidden"
          >
            <div className="p-6 sm:p-8">
              <CoreAuthGate onComplete={handleComplete} startAt="password" />
            </div>
          </motion.div>

          {/* Security reassurance */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 flex items-start gap-3 px-4 py-4 rounded-2xl bg-black/[0.025] border border-black/[0.05]"
          >
            <Shield size={13} className="text-[#050505]/30 mt-0.5 shrink-0" />
            <p className="text-[11px] text-[#050505]/40 leading-relaxed">
              <span className="font-bold text-[#050505]/55">100% non-custodial.</span>{" "}
              Your seed phrase and private keys are encrypted locally on your device using AES-256-GCM. Humanity Ledger never sees them.
            </p>
          </motion.div>

          {/* Already have wallet */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-5 text-center text-[12px] text-[#050505]/35"
          >
            Already have a wallet?{" "}
            <Link href="/login" className="font-bold text-[#050505]/60 hover:text-[#050505] transition-colors underline underline-offset-2">
              Sign in
            </Link>
          </motion.p>

        </div>
      </main>
    </div>
  );
}
