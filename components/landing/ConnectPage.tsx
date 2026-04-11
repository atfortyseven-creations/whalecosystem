"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ExternalLink, Shield, ArrowRight, Loader2, Twitter } from "lucide-react";
import dynamic from "next/dynamic";
import { coinbaseWallet } from "wagmi/connectors";

// QR code renderer using qrcode.react
const QRCode = dynamic(() => import("qrcode.react").then((m) => m.QRCodeSVG), { ssr: false });

// ── Background grid ─────────────────────────────────────────────────────────────
function Grid() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.03) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(0,0,0,0.03) 1.5px, transparent 1.5px)`,
        backgroundSize: "64px 64px", // Increased size to 'zoom out' and reveal the pattern
        opacity: 0.8,
      }}
    />
  );
}

// ── Wallet option button ────────────────────────────────────────────────────────
function WalletButton({
  logo, name, badge, onClick, loading, delay = 0,
}: {
  logo: string;
  name: string;
  badge: string;
  onClick: () => void;
  loading?: boolean;
  delay?: number;
}) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-center gap-5 p-5 bg-white dark:bg-white/[0.04] border border-black/[0.07] dark:border-white/[0.08] hover:border-black/25 dark:hover:border-white/20 hover:shadow-lg hover:shadow-black/[0.06] transition-all duration-200 group"
    >
      <div className="w-12 h-12 rounded-2xl bg-[#F5F4F0] dark:bg-white/10 border border-black/5 dark:border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
        {loading ? (
          <Loader2 size={18} className="animate-spin text-black/40" />
        ) : (
          <img src={logo} alt={name} className="w-7 h-7 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        )}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-[13px] font-black text-black dark:text-white uppercase tracking-tight">{name}</p>
        <p className="text-[10px] font-mono text-black/35 dark:text-white/35 uppercase tracking-widest mt-0.5">{badge}</p>
      </div>
      <ArrowRight size={14} className="text-black/20 dark:text-white/20 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
    </motion.button>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────────
export default function ConnectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionIdParam = searchParams.get("session");
  const { isConnected, address } = useAccount();
  const { connect, isPending } = useConnect();
  const { openConnectModal } = useConnectModal();

  const [mounted, setMounted] = useState(false);
  const [justConnected, setJustConnected] = useState(false);
  const [qrSession, setQrSession] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<"IDLE" | "AWAITING" | "SYNCED">("IDLE");
  const qrRef = useRef<string | null>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { qrRef.current = qrSession; }, [qrSession]);

  // Generate QR session for mobile sync
  const fetchSession = useCallback(async () => {
    try {
      setSyncStatus("AWAITING");
      const res = await fetch("/api/auth/qr-session", { method: "POST" });
      const data = await res.json();
      if (data.sessionId) setQrSession(data.sessionId);
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted || isConnected) return;
    fetchSession();
  }, [mounted, isConnected, fetchSession]);

  // Poll QR session status
  useEffect(() => {
    if (!mounted || isConnected) return;
    const id = setInterval(async () => {
      const token = qrRef.current;
      if (!token) return;
      try {
        const res = await fetch(`/api/auth/qr-session?id=${token}`);
        const data = await res.json();
        if (data.status === "complete") {
          clearInterval(id);
          setSyncStatus("SYNCED");
          setJustConnected(true);
          setTimeout(() => { window.location.href = "/"; }, 1500);
        } else if (data.status === "expired") {
          clearInterval(id);
          fetchSession();
        }
      } catch {}
    }, 2000);
    return () => clearInterval(id);
  }, [mounted, isConnected, fetchSession]);

  // Auto-redirect if already connected
  useEffect(() => {
    if (!mounted) return;
    const fromDisconnect = sessionStorage.getItem("__disconnected__");
    if (isConnected && !fromDisconnect) router.replace("/");
    if (fromDisconnect) sessionStorage.removeItem("__disconnected__");
  }, [mounted, isConnected, router]);

  // Celebrate → redirect
  useEffect(() => {
    if (!mounted || !isConnected) return;
    setJustConnected(true);
    setTimeout(() => router.replace("/"), 1800);
  }, [isConnected, mounted, router]);

  const handleInjected = () => connect({ connector: injected() });
  const handleCoinbase = () => connect({ 
    connector: coinbaseWallet({ preference: 'smartWalletOnly' }) 
  });
  const handleWC = () => openConnectModal?.();

  // Handshake mobile session to desktop
  useEffect(() => {
    if (!mounted || !isConnected || !address || !sessionIdParam) return;
    
    const handshake = async () => {
      try {
        await fetch(`/api/auth/qr-session?id=${sessionIdParam}`, {
          method: "POST",
          body: JSON.stringify({ address })
        });
        console.log("[SYNC] Handshake completed for session:", sessionIdParam);
        setSyncStatus("SYNCED");
      } catch (e) {
        console.error("[SYNC] Handshake failed:", e);
      }
    };
    handshake();
  }, [mounted, isConnected, address, sessionIdParam]);

  // Build QR URL: deep-link to this connect page via mobile
  const qrUrl = typeof window !== "undefined"
    ? `${window.location.origin}/connect?session=${qrSession ?? ""}`
    : "";

  if (!mounted) return null;

  return (
    <div className="min-h-safe min-h-screen flex flex-col bg-[#FAF9F6] dark:bg-[#080808] text-black dark:text-white">
      <Grid />

      {/* ── NAV ── */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-black/[0.05] dark:border-white/[0.05] bg-white/70 dark:bg-black/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <img src="/official-whale-monochrome.png" className="w-7 h-7 dark:invert" alt="Whale" />
          <span className="font-sans font-black text-sm uppercase tracking-tight text-black dark:text-white">Whale Alert Network</span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-black/25 dark:text-white/25 hidden md:block">
          Secure Terminal Access
        </span>
      </header>

      {/* ── BODY ── */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <AnimatePresence mode="wait">

          {/* ── SUCCESS ── */}
          {justConnected ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center"
              >
                <CheckCircle2 size={36} className="text-emerald-500" />
              </motion.div>
              <div>
                <p className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white">Identity Verified</p>
                <p className="font-mono text-[11px] text-black/40 dark:text-white/40 mt-2">
                  {address ? `${address.slice(0, 10)}…${address.slice(-8)}` : ""}
                </p>
              </div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-black/20 dark:text-white/20">
                Entering terminal…
              </p>
            </motion.div>

          ) : (

            /* ── CONNECT ── */
            <motion.div
              key="connect"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden border border-black/[0.06] dark:border-white/[0.07] bg-white dark:bg-[#0D0D0D] shadow-2xl shadow-black/[0.08]"
            >

              {/* ── LEFT: QR PANEL ── */}
              <div className="p-10 border-b lg:border-b-0 lg:border-r border-black/[0.06] dark:border-white/[0.06] flex flex-col relative overflow-hidden">
                
                {/* Giant background faded whale logo */}
                <div className="absolute -bottom-20 -left-20 pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
                  <img src="/official-whale-monochrome.png" className="w-[400px] h-[400px] object-contain dark:invert" alt="" />
                </div>

                <div className="mb-8 relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-black/25 dark:text-white/25 font-black">Mobile Sync</p>
                    <a href="https://twitter.com/whalecosystem" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[9px] font-mono font-black uppercase tracking-widest text-[#00ACEE] hover:opacity-80 transition-opacity bg-[#00ACEE]/10 px-2.5 py-1 rounded-full">
                      <Twitter size={10} />
                      @whalecosystem
                    </a>
                  </div>
                  <h2 className="font-sans text-2xl font-black text-black dark:text-white tracking-tighter leading-tight flex items-center gap-3">
                    <img src="/official-whale-monochrome.png" className="w-8 h-8 dark:invert opacity-90" alt="Whale" />
                    Scan to connect
                  </h2>
                  <p className="text-[12px] text-black/40 dark:text-white/40 mt-3 leading-relaxed">
                    Open your mobile wallet and scan the QR code below. Your session will sync automatically with this terminal.
                  </p>
                </div>

                {/* QR Code */}
                <div className="flex-1 flex flex-col items-center justify-center gap-6 relative z-10">
                  <div className="relative p-5 bg-white border border-black/[0.08] dark:border-white/[0.08]">
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-black dark:border-white" />
                    <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-black dark:border-white" />
                    <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-black dark:border-white" />
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-black dark:border-white" />

                    {qrSession ? (
                      <QRCode
                        value={qrUrl}
                        size={200}
                        bgColor="#ffffff"
                        fgColor="#050505"
                        level="M"
                      />
                    ) : (
                      <div className="w-[200px] h-[200px] flex items-center justify-center">
                        <Loader2 size={28} className="animate-spin text-black/20" />
                      </div>
                    )}
                  </div>

                  {/* Status indicator */}
                  <div className="flex items-center gap-2">
                    {syncStatus === "SYNCED" ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-500 font-black">Session linked</span>
                      </>
                    ) : (
                      <>
                        <motion.span
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-black/20 dark:bg-white/20 inline-block"
                        />
                        <span className="font-mono text-[9px] uppercase tracking-widest text-black/25 dark:text-white/25">
                          {qrSession ? "Awaiting scan" : "Generating code…"}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Refresh */}
                  {qrSession && syncStatus !== "SYNCED" && (
                    <button
                      onClick={fetchSession}
                      className="font-mono text-[9px] uppercase tracking-widest text-black/25 dark:text-white/25 hover:text-black dark:hover:text-white transition-colors"
                    >
                      Refresh code →
                    </button>
                  )}
                </div>

                {/* Compatible wallets note */}
                <p className="mt-8 text-[9px] font-mono uppercase tracking-widest text-black/20 dark:text-white/20 text-center">
                  Compatible with MetaMask Mobile · Rainbow · Trust Wallet · Coinbase Wallet
                </p>
              </div>

              {/* ── RIGHT: DIRECT CONNECT PANEL ── */}
              <div className="p-10 flex flex-col">
                <div className="mb-8">
                  <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-black/25 dark:text-white/25 font-black mb-2">Desktop Connection</p>
                  <h2 className="font-sans text-2xl font-black text-black dark:text-white tracking-tighter leading-tight">
                    Connect your<br />wallet directly
                  </h2>
                  <p className="text-[12px] text-black/40 dark:text-white/40 mt-3 leading-relaxed">
                    Select your preferred wallet to authenticate. No password required — your wallet signs a cryptographic message.
                  </p>
                </div>

                {/* Wallet options */}
                <div className="flex flex-col gap-3 flex-1">
                  <WalletButton
                    logo="/wallets/metamask.svg"
                    name="MetaMask"
                    badge="Browser extension · Injected"
                    onClick={handleInjected}
                    loading={isPending}
                    delay={0.1}
                  />
                  <WalletButton
                    logo="/wallets/coinbase.png"
                    name="Coinbase Wallet"
                    badge="Smart Wallet · MPC"
                    onClick={handleCoinbase}
                    delay={0.15}
                  />
                  <WalletButton
                    logo="/wallets/rainbow.png"
                    name="WalletConnect"
                    badge="Universal · Any wallet"
                    onClick={handleWC}
                    delay={0.2}
                  />
                  <WalletButton
                    logo="/wallets/rabby.png"
                    name="Rabby Wallet"
                    badge="Multi-chain · Injected"
                    onClick={handleInjected}
                    delay={0.25}
                  />
                </div>

                {/* Security note */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 pt-6 border-t border-black/[0.05] dark:border-white/[0.05] flex items-start gap-3"
                >
                  <Shield size={14} className="text-black/20 dark:text-white/20 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-black/30 dark:text-white/30 leading-relaxed">
                    Non-custodial authentication. Your private keys never leave your device. Authentication is verified via ECDSA — no passwords, no accounts.
                  </p>
                </motion.div>

                {/* Networks */}
                <div className="mt-5 flex items-center gap-2 flex-wrap">
                  {["Optimism", "Ethereum", "Base", "Arbitrum", "Polygon"].map((n) => (
                    <span key={n} className="text-[8px] font-mono font-black uppercase tracking-widest px-2 py-1 border border-black/[0.06] dark:border-white/[0.06] text-black/25 dark:text-white/25">
                      {n}
                    </span>
                  ))}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 px-8 py-4 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/official-whale-monochrome.png" className="w-4 h-4 dark:invert opacity-30" alt="" />
          <span className="font-mono text-[8px] uppercase tracking-widest text-black/20 dark:text-white/20">
            Whale Alert Network · Privacy by Void
          </span>
        </div>
        <a
          href="https://walletconnect.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 font-mono text-[8px] uppercase tracking-widest text-black/20 dark:text-white/20 hover:text-black/50 dark:hover:text-white/50 transition-colors"
        >
          WalletConnect <ExternalLink size={8} />
        </a>
      </footer>
    </div>
  );
}
