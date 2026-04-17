"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import { WhaleLogo } from "@/components/shared/WhaleLogo";
import { useAppKit } from "@reown/appkit/react";
import { Fingerprint, ArrowRight, ScanLine, Loader2, Scan } from "lucide-react";
import { useUIStore } from "@/lib/store/ui-store";

// QR Scanner — iOS-safe dynamic import
const DynamicQRScannerModal = dynamic(
  () => import("@/components/wallet/QRScannerModal"),
  { ssr: false }
);

// ── Colour tokens ─────────────────────────────────────────────────────────────
const IVORY = "#FAF9F6";
const INK   = "#050505";
const FAINT = "rgba(5,5,5,0.08)";
const MUTED = "rgba(5,5,5,0.50)";

// ── Wallet option button ──────────────────────────────────────────────────────
function WalletOption({
  logo, name, badge, onClick, delay = 0,
}: {
  logo: string; name: string; badge: string; onClick: () => void; delay?: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ease: [0.16, 1, 0.3, 1], duration: 0.5 }}
      onClick={onClick}
      className="group w-full flex items-center gap-4 p-4 rounded-2xl border border-[#E5E5E5] bg-white hover:bg-[#FAF9F6] hover:border-black/20 active:scale-[0.97] transition-all duration-200 shadow-sm"
    >
      <div className="w-11 h-11 rounded-xl bg-[#FAF9F6] border border-[#E5E5E5] flex items-center justify-center p-2 overflow-hidden shrink-0">
        <img src={logo} alt={name} className="w-full h-full object-contain" />
      </div>
      <div className="flex-1 text-left">
        <p className="text-[13px] font-black uppercase tracking-tight text-[#050505]">{name}</p>
        <p className="text-[10px] font-mono text-[#050505]/40 uppercase tracking-widest mt-0.5">{badge}</p>
      </div>
      <ArrowRight size={14} className="text-[#050505]/20 group-hover:text-[#050505] group-hover:translate-x-0.5 transition-all shrink-0" />
    </motion.button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function MobileLanding() {
  const router = useRouter();
  const { address } = useSovereignAccount();
  const { openConnectModal } = useUIStore();

  const [mounted, setMounted] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [qrSession, setQrSession] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<"IDLE" | "AWAITING" | "SYNCED">("IDLE");

  useEffect(() => { setMounted(true); }, []);

  // ── QR Session Polling (mirrors ConnectPage desktop) ── //
  const fetchSession = useCallback(async () => {
    try {
      setSyncStatus("AWAITING");
      const res = await fetch("/api/auth/qr-session", { method: "POST" });
      const data = await res.json();
      if (data.sessionId) setQrSession(data.sessionId);
    } catch (e) {
      console.error("[MobileLanding] QR session error:", e);
    }
  }, []);

  // Auto-redirect if already connected
  useEffect(() => {
    if (address && mounted) {
      setTimeout(() => router.push("/dashboard"), 500);
    }
  }, [address, mounted, router]);

  if (!mounted) return null;

  const handleConnect = () => openConnectModal();

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden font-sans flex flex-col"
      style={{ backgroundColor: IVORY, color: INK }}
    >
      {/* ── Layer 0: Base ivory ── */}
      <div className="fixed inset-0 z-0 bg-[#FAF9F6] pointer-events-none" />

      {/* ── Layer 1: Patron cósmico ── */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        <motion.div
          className="absolute"
          style={{
            inset: "-20%",
            backgroundImage: "url('/patron-cosmico-4k.png')",
            backgroundSize: "140%",
            backgroundRepeat: "repeat",
            opacity: 0.045,
            mixBlendMode: "multiply",
            willChange: "transform",
          }}
          animate={{ x: ["0%", "-3%", "0%"], y: ["0%", "-2%", "0%"] }}
          transition={{ duration: 45, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* ── Layer 2: Gradient top fade (keeps header readable) ── */}
      <div
        className="fixed top-0 left-0 right-0 h-36 z-[2] pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(250,249,246,0.97) 0%, transparent 100%)" }}
      />

      {/* ── Fixed Header Pill ── */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between px-5 py-3 rounded-full"
        style={{
          background: "rgba(255,255,255,0.80)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: `1px solid ${FAINT}`,
          boxShadow: "0 4px 24px rgba(5,5,5,0.07)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <WhaleLogo className="w-6 h-6 shrink-0" />
          <span className="text-[11px] font-black uppercase tracking-tight" style={{ color: INK }}>
            Whale Alert Network
          </span>
        </div>

        <button
          onClick={handleConnect}
          className="px-4 py-2 rounded-full font-black uppercase tracking-wide transition-all active:scale-[0.95]"
          style={{
            backgroundColor: INK,
            color: "#FFFFFF",
            fontSize: "9.5px",
            letterSpacing: "0.15em",
          }}
        >
          {address ? "OPEN TERMINAL" : "CONNECT WALLET"}
        </button>
      </motion.header>

      {/* ── Main Content ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-5 pt-32 pb-12 gap-8 max-w-[440px] w-full mx-auto">

        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <h1 className="text-[2.2rem] font-black tracking-tight leading-[1.05] mb-3" style={{ color: INK }}>
            Whale Alert<br />Network
          </h1>
          <p className="text-[12px] font-medium leading-relaxed" style={{ color: MUTED }}>
            Sovereign-grade blockchain intelligence. Connect your wallet or scan the QR from the desktop terminal to synchronize your session.
          </p>
        </motion.div>

        {/* ── If connected: show scanner CTA ── */}
        {address && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full flex flex-col gap-3"
          >
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                Synchronized · {address.slice(0, 6)}···{address.slice(-4)}
              </span>
            </div>
            <button
              onClick={() => setShowScanner(true)}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-widest text-white active:scale-[0.97] transition-all shadow-lg"
              style={{ background: INK, fontSize: "11px" }}
            >
              <Scan size={16} />
              Open Scanner · Sync to PC
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[#050505] border border-[#E5E5E5] bg-white active:bg-black/5 active:scale-[0.97] transition-all"
              style={{ fontSize: "11px" }}
            >
              <ArrowRight size={14} />
              Open Terminal
            </button>
          </motion.div>
        )}

        {/* ── If NOT connected: wallet buttons ── */}
        {!address && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
            className="w-full flex flex-col gap-3"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 h-px bg-[#E5E5E5]" />
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#050505]/30">Connect Wallet</span>
              <div className="flex-1 h-px bg-[#E5E5E5]" />
            </div>

            <WalletOption
              logo="/wallets/metamask.svg"
              name="MetaMask"
              badge="Browser · Injected"
              onClick={handleConnect}
              delay={0.1}
            />
            <WalletOption
              logo="/wallets/coinbase.png"
              name="Coinbase Wallet"
              badge="MPC · Smart Wallet"
              onClick={handleConnect}
              delay={0.15}
            />
            <WalletOption
              logo="/wallets/rainbow.png"
              name="Rainbow & 550+ Wallets"
              badge="WalletConnect v2"
              onClick={handleConnect}
              delay={0.2}
            />


            {/* Divider with scanner option */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex-1 h-px bg-[#E5E5E5]" />
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#050505]/30">Or</span>
              <div className="flex-1 h-px bg-[#E5E5E5]" />
            </div>

            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              onClick={() => {
                  alert("Please connect your mobile wallet first to establish a Sovereign Session.");
                  handleConnect();
              }}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-widest border-2 border-dashed border-[#050505]/15 text-[#050505]/50 hover:border-[#050505]/30 hover:text-[#050505] active:scale-[0.97] transition-all"
              style={{ fontSize: "11px" }}
            >
              <ScanLine size={16} />
              Scan QR from Desktop Terminal
            </motion.button>

            {/* ECDSA notice */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-[#E5E5E5] mt-1">
              <Fingerprint size={14} className="text-[#050505]/25 mt-0.5 shrink-0" />
              <p className="text-[10px] text-[#050505]/40 font-medium leading-relaxed">
                ECDSA Verification · Non-custodial · Private keys never leave your device. All interactions are signed on-chain.
              </p>
            </div>
          </motion.div>
        )}
      </main>

      {/* ── QR Scanner Modal ── */}
      {/* ── QR Scanner Modal ── */}
      <DynamicQRScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={() => {
          setShowScanner(false);
          setTimeout(() => router.push("/dashboard"), 500);
        }}
      />

      {/* ── Wave Footer ── */}
      <div className="relative w-full min-h-[420px] flex flex-col justify-end overflow-hidden">
        {/* Great Wave */}
        <img
          src="/olas-hokusai-4k.png"
          alt="The Great Wave"
          className="absolute bottom-0 left-0 w-[130%] -ml-[15%] object-cover object-bottom opacity-90 z-0"
          style={{ willChange: "transform", transform: "translateZ(0)" }}
        />

        {/* Top fade to ivory */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF9F6] via-[#FAF9F6]/70 to-transparent z-[1]" />

        {/* Footer */}
        <footer className="relative z-10 w-full pb-10 pt-20 mt-auto">
          <div className="mx-4 flex flex-col items-center gap-6 bg-white/50 backdrop-blur-md rounded-3xl py-8 px-6 border border-white/50 shadow-xl">
            <div className="flex items-center justify-center gap-6">
              <a href="https://twitter.com/WhaleAlertNetwork" target="_blank" rel="noreferrer"
                className="w-12 h-12 bg-white/60 border border-black/10 rounded-2xl flex items-center justify-center hover:bg-white transition-all shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: INK, opacity: 0.7 }}>
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5 5 9.2 5 9.2c.5.2 1 .3 1.5.3C4.1 7.1 5 1 5 1c1.8 2.2 4.6 3.6 7.6 3.8A4.2 4.2 0 0 1 18.2 2.6c1.2-.2 2.4-.7 3.8-1.5z"/>
                </svg>
              </a>
              <div className="w-16 h-16 flex items-center justify-center bg-white/70 rounded-3xl shadow-lg border border-white/60">
                <img src="/official-whale-monochrome.png" className="w-10 h-10" alt="WAN" />
              </div>
              <a href="https://github.com/atfortyseven-creations/whalecosystem" target="_blank" rel="noreferrer"
                className="w-12 h-12 bg-white/60 border border-black/10 rounded-2xl flex items-center justify-center hover:bg-white transition-all shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: INK, opacity: 0.7 }}>
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                  <path d="M9 18c-4.51 2-5-2-7-2"/>
                </svg>
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-5">
              {[['Privacy', '/docs/privacy-policy'], ['Terms', '/docs/terms-of-service'], ['Risk', '/docs/risk-disclosure'], ['Cookies', '/docs/cookie-policy']].map(([label, href]) => (
                <a key={label} href={href} className="text-[10px] font-black uppercase tracking-[0.2em] text-[#050505]/50 hover:text-[#050505] transition-colors">
                  {label}
                </a>
              ))}
            </div>

            <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 text-black text-center">
              © {new Date().getFullYear()} Whale Alert Network · All rights reserved
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
