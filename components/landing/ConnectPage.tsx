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
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors
        ${disabled ? "bg-[#F0F0F0] dark:bg-white/10" : "bg-[#F9F8F4] group-hover:bg-[#050505] border border-black/5 dark:bg-white/10 dark:border-white/10 dark:group-hover:bg-white/20 shadow-sm"}`}
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
  const [qrSession, setQrSession] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'AWAITING_SCAN' | 'SYNCED'>('IDLE');
  const qrSessionRef = React.useRef<string | null>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { qrSessionRef.current = qrSession; }, [qrSession]);

  const fetchNewSession = React.useCallback(async () => {
    try {
      setSyncStatus('AWAITING_SCAN');
      const res = await fetch('/api/auth/qr-session', { method: 'POST' });
      const data = await res.json();
      if (data.sessionId) setQrSession(data.sessionId);
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!mounted || isConnected) return;
    fetchNewSession();
  }, [mounted, isConnected, fetchNewSession]);

  useEffect(() => {
    if (!mounted || isConnected) return;
    const intervalId = setInterval(async () => {
      const token = qrSessionRef.current;
      if (!token) return;
      try {
        const res = await fetch(`/api/auth/qr-session?id=${token}`);
        const data = await res.json();
        if (data.status === 'complete') {
          clearInterval(intervalId);
          setSyncStatus('SYNCED');
          setJustConnected(true);
          setTimeout(() => {
              window.location.href = '/';
          }, 1500);
        } else if (data.status === 'expired') {
          clearInterval(intervalId);
          fetchNewSession();
        }
      } catch (_) {}
    }, 2000);
    return () => clearInterval(intervalId);
  }, [mounted, isConnected, fetchNewSession]);

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
      <header className="relative z-10 w-full flex items-center justify-between px-8 py-6 border-b border-black/[0.04] dark:border-white/[0.04] bg-white/50 dark:bg-black/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center shadow-sm border border-black/5 dark:border-white/10">
            <img src="/official-whale-monochrome.png" className="w-8 h-8 object-contain dark:invert opacity-95" alt="Whale Alert Network" />
          </div>
          <div>
            <h2 className="text-[13px] font-black uppercase tracking-widest text-[#050505] dark:text-white leading-none">Whale Terminal</h2>
            <p className="text-[9px] font-mono font-bold text-[#888888] uppercase tracking-[0.2em] mt-1">Sovereign Link</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest">
            Ready
          </span>
        </div>
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

                {/* Aztec Grid Split Layout */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 w-full max-w-[900px] items-center lg:items-stretch justify-center mx-auto">
                  
                  {/* Left: Device QR Sync */}
                  <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12 bg-white dark:bg-white/5 border border-black/[0.06] dark:border-white/10 rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] relative overflow-hidden group">
                     {/* QR Decor */}
                     <div className="absolute top-6 left-6 w-8 h-8 border-t-[3px] border-l-[3px] border-black/[0.06] dark:border-white/20 rounded-tl-xl" />
                     <div className="absolute top-6 right-6 w-8 h-8 border-t-[3px] border-r-[3px] border-black/[0.06] dark:border-white/20 rounded-tr-xl" />
                     <div className="absolute bottom-6 left-6 w-8 h-8 border-b-[3px] border-l-[3px] border-black/[0.06] dark:border-white/20 rounded-bl-xl" />
                     <div className="absolute bottom-6 right-6 w-8 h-8 border-b-[3px] border-r-[3px] border-black/[0.06] dark:border-white/20 rounded-br-xl" />

                     <div className="relative z-10 text-center mb-8">
                       <h3 className="text-lg font-black uppercase tracking-widest text-[#050505] dark:text-white mb-2">Mobile Synchronizer</h3>
                       <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888] max-w-[200px] leading-relaxed mx-auto">
                         Scan with your mobile device to establish a direct sovereign session
                       </p>
                     </div>

                     <div className="w-[200px] h-[200px] lg:w-[240px] lg:h-[240px] bg-white p-4 rounded-[2rem] shadow-inner flex items-center justify-center relative">
                        {qrSession ? (
                            <img 
                               src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=WHALE_HANDSHAKE:${qrSession}&bgcolor=ffffff&color=050505&margin=0`}
                               alt="Handshake Protocol"
                               className="w-full h-full object-contain"
                            />
                        ) : (
                          <Loader2 size={32} className="text-black/20 animate-spin" />
                        )}
                        {syncStatus === 'SYNCED' && (
                             <motion.div 
                               initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
                               className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-[1.5rem]"
                             >
                                <CheckCircle2 size={48} className="text-green-500 mb-2" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-600">Synced</span>
                             </motion.div>
                        )}
                     </div>
                  </div>

                  {/* Right: Wallets */}
                  <div className="flex-1 flex flex-col justify-center space-y-4 lg:py-6">
                    <div className="mb-4">
                       <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-[#050505] dark:text-white mb-1">Direct Connection</h3>
                       <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">Connect natively on this device</p>
                    </div>

                    {[
                      { id: 'metamask', name: 'MetaMask', logo: '/wallets/metamask.svg', handler: handleInjected, badge: 'Injected' },
                      { id: 'coinbase', name: 'Coinbase', logo: '/wallets/coinbase.png', handler: handleInjected, badge: 'Smart Wallet' },
                      { id: 'rainbow', name: 'Rainbow', logo: '/wallets/rainbow.png', handler: handleQR, badge: 'WalletConnect' },
                    ].map((w, i) => (
                      <motion.button
                        key={w.id}
                        onClick={w.handler}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + i * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group flex items-center justify-between p-5 bg-white dark:bg-white/5 border border-black/[0.04] dark:border-white/10 rounded-3xl hover:border-black/20 dark:hover:border-white/30 hover:shadow-xl hover:shadow-black/5 transition-all"
                      >
                         <div className="flex items-center gap-5">
                            <div className="w-12 h-12 flex items-center justify-center bg-[#F9F8F4] dark:bg-black/20 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm group-hover:scale-110 transition-transform">
                              <img src={w.logo} alt={w.name} className="w-7 h-7 object-contain drop-shadow-sm" />
                            </div>
                            <div className="text-left flex flex-col justify-center">
                              <span className="text-[13px] font-black uppercase tracking-widest text-[#050505] dark:text-white group-hover:text-amber-500 transition-colors">
                                {w.name}
                              </span>
                              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#888888] mt-0.5">
                                {w.badge}
                              </span>
                            </div>
                         </div>
                         <ChevronRight size={18} className="text-[#CCCCCC] group-hover:text-[#050505] dark:group-hover:text-white transition-colors group-hover:translate-x-1" />
                      </motion.button>
                    ))}
                  </div>
                </div>

                  <div className="flex items-center gap-4 py-2">
                    <div className="flex-1 h-px bg-[#E5E5E5] dark:bg-white/10" />
                    <span className="text-[9px] font-black text-[#CCCCCC] uppercase tracking-[0.3em]">Universal Access</span>
                    <div className="flex-1 h-px bg-[#E5E5E5] dark:bg-white/10" />
                  </div>

                  {/* WalletConnect Overlay Trigger */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <ConnectCard
                      icon={<Smartphone size={18} />}
                      label="Any Other Wallet"
                      sublabel="Connect via WalletConnect / QR Protocol"
                      badge="Global Sync"
                      onClick={handleQR}
                      loading={connectingMethod === "qr" && isPending}
                    />
                  </motion.div>
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
