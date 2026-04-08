"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";
import {
  Monitor, Smartphone, Wallet, Shield, Zap,
  ChevronRight, Loader2, CheckCircle2, ExternalLink,
} from "lucide-react";

// ── Aztec grid background ──────────────────────────────────────────────────────
function AztecGrid() {
  return (
    <div
      className="fixed inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.06]"
      style={{
        backgroundImage: `
          linear-gradient(#000 1px, transparent 1px),
          linear-gradient(90deg, #000 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    />
  );
}

// ── Option card ────────────────────────────────────────────────────────────────
function ConnectCard({
  icon, label, sublabel, badge, onClick, loading, disabled,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  badge?: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      className={`w-full text-left flex items-center gap-5 p-6 rounded-2xl border transition-all duration-200 group
        ${disabled
          ? "border-[#E5E5E5] bg-[#FAF9F6] opacity-50 cursor-not-allowed dark:border-white/10 dark:bg-white/5"
          : "border-[#E0E0E0] bg-white hover:border-[#050505] hover:shadow-lg hover:shadow-black/5 dark:bg-white/5 dark:border-white/10 dark:hover:border-white/30 cursor-pointer"
        }`}
    >
      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors
        ${disabled ? "bg-[#F0F0F0] dark:bg-white/10" : "bg-[#F5F5F5] group-hover:bg-[#050505] dark:bg-white/10 dark:group-hover:bg-white/20"}`}
      >
        <span className={`transition-colors ${disabled ? "text-[#CCCCCC]" : "text-[#050505] group-hover:text-white dark:text-white"}`}>
          {loading ? <Loader2 size={20} className="animate-spin" /> : icon}
        </span>
      </div>

      {/* Labels */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[13px] font-black text-[#050505] uppercase tracking-wide dark:text-white">{label}</p>
          {badge && (
            <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#B8962E] border border-[#D4AF37]/30">
              {badge}
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#888888] mt-0.5 dark:text-white/40">{sublabel}</p>
      </div>

      <ChevronRight
        size={16}
        className={`shrink-0 transition-all ${disabled ? "text-[#CCCCCC]" : "text-[#CCCCCC] group-hover:text-[#050505] group-hover:translate-x-1 dark:group-hover:text-white"}`}
      />
    </motion.button>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ConnectPage() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  const [mounted, setMounted] = useState(false);
  const [connectingMethod, setConnectingMethod] = useState<"injected" | "qr" | null>(null);
  const [justConnected, setJustConnected] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Auto-redirect if already connected (and not coming from disconnect)
  useEffect(() => {
    if (!mounted) return;
    const isFromDisconnect = sessionStorage.getItem("__disconnected__");
    if (isConnected && !isFromDisconnect) {
      router.replace("/");
    }
    if (isFromDisconnect) {
      sessionStorage.removeItem("__disconnected__");
    }
  }, [mounted, isConnected, router]);

  // Celebrate connection → redirect
  useEffect(() => {
    if (!mounted) return;
    if (isConnected && connectingMethod) {
      setJustConnected(true);
      setTimeout(() => router.replace("/"), 1800);
    }
  }, [isConnected, connectingMethod, mounted, router]);

  const handleInjected = () => {
    setConnectingMethod("injected");
    connect({ connector: injected() });
  };

  const handleQR = () => {
    setConnectingMethod("qr");
    // RainbowKit opens its native modal which shows QR + WalletConnect
    openConnectModal?.();
  };

  if (!mounted) return null;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#FAFAFA] dark:bg-[#080808] relative overflow-hidden">
      <AztecGrid />

      {/* Soft gold ambient */}
      <div
        className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: "60vw", height: "60vw", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 65%)",
        }}
      />

      {/* ── Header ── */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#050505] dark:bg-white rounded-lg flex items-center justify-center">
            <Zap size={14} className="text-[#D4AF37]" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#050505] dark:text-white">
            Whale Alert Network
          </span>
        </div>
        <span className="text-[9px] font-mono text-[#CCCCCC] uppercase tracking-widest">
          Secure Connection
        </span>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md">

          <AnimatePresence mode="wait">

            {/* ── SUCCESS STATE ── */}
            {justConnected ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6 text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <CheckCircle2 size={56} className="text-[#00C076]" />
                </motion.div>
                <div>
                  <p className="text-xl font-black uppercase tracking-tight text-[#050505] dark:text-white">Connected</p>
                  <p className="text-[11px] font-mono text-[#888888] mt-1">
                    {address ? `${address.slice(0, 8)}…${address.slice(-6)}` : ""}
                  </p>
                </div>
                <p className="text-[10px] font-mono text-[#CCCCCC] uppercase tracking-widest">
                  Redirecting to terminal…
                </p>
              </motion.div>

            ) : (

              /* ── CONNECT STATE ── */
              <motion.div
                key="connect"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8"
              >
                {/* Title block */}
                <div className="space-y-2">
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-[9px] font-black uppercase tracking-[0.5em] text-[#D4AF37]"
                  >
                    Institutional Access
                  </motion.p>
                  <motion.h1
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-3xl font-black text-[#050505] dark:text-white uppercase tracking-tight leading-tight"
                  >
                    Connect Your<br />Wallet
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-[12px] text-[#888888] dark:text-white/40 leading-relaxed"
                  >
                    Choose your preferred connection method to access the Whale Alert Network.
                  </motion.p>
                </div>

                {/* Connection options */}
                <div className="space-y-3">

                  {/* Browser Extension (Desktop primary) */}
                  <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                    <ConnectCard
                      icon={<Monitor size={20} />}
                      label="Browser Extension"
                      sublabel="MetaMask, Rabby, Coinbase Wallet or any injected provider"
                      badge="Desktop"
                      onClick={handleInjected}
                      loading={connectingMethod === "injected" && isPending}
                    />
                  </motion.div>

                  {/* QR / WalletConnect (Mobile primary) */}
                  <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.32 }}>
                    <ConnectCard
                      icon={<Smartphone size={20} />}
                      label="QR Code / WalletConnect"
                      sublabel="Scan with MetaMask, Trust Wallet, Zerion, Rainbow or any WC app"
                      badge="Mobile & Desktop"
                      onClick={handleQR}
                      loading={connectingMethod === "qr" && isPending}
                    />
                  </motion.div>

                </div>

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-[#E5E5E5] dark:bg-white/10" />
                  <span className="text-[9px] font-mono text-[#CCCCCC] uppercase tracking-widest">Security</span>
                  <div className="flex-1 h-px bg-[#E5E5E5] dark:bg-white/10" />
                </div>

                {/* Security guarantees */}
                <div className="space-y-2.5">
                  {[
                    { icon: <Shield size={11} />, text: "Non-custodial — your keys never leave your device" },
                    { icon: <Zap size={11} />,    text: "Read-only access requested until you approve on-chain actions" },
                    { icon: <Wallet size={11} />, text: "Signatures are verified on Optimism L2 only" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                      className="flex items-start gap-2.5"
                    >
                      <span className="mt-0.5 text-[#D4AF37] shrink-0">{item.icon}</span>
                      <p className="text-[10px] text-[#888888] dark:text-white/30 font-mono leading-relaxed">{item.text}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Supported wallets row */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-between text-[9px] font-mono text-[#CCCCCC] uppercase tracking-widest border-t border-[#F0F0F0] dark:border-white/5 pt-5"
                >
                  <span>Supported Networks</span>
                  <div className="flex items-center gap-3">
                    {["Optimism", "Ethereum", "Base", "Arbitrum"].map((n) => (
                      <span key={n} className="text-[8px] px-1.5 py-0.5 rounded border border-[#E5E5E5] dark:border-white/10 text-[#888888] dark:text-white/30">
                        {n}
                      </span>
                    ))}
                  </div>
                </motion.div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 px-6 py-4 border-t border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between">
        <span className="text-[8px] font-mono text-[#CCCCCC] uppercase tracking-widest">
          Whale Alert Network · Institutional Terminal
        </span>
        <a
          href="https://walletconnect.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[8px] font-mono text-[#CCCCCC] hover:text-[#888888] transition-colors uppercase tracking-widest"
        >
          WalletConnect <ExternalLink size={9} />
        </a>
      </footer>
    </div>
  );
}
