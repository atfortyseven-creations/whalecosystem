"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ExternalLink, Shield, ArrowRight, Loader2, Twitter } from "lucide-react";
import dynamic from "next/dynamic";
import { coinbaseWallet, injected } from "wagmi/connectors";
import { useAppKit } from "@reown/appkit/react";
import { CelestialMeshBackground } from "./CelestialMeshBackground";
import { Html5QrcodeScanner } from "html5-qrcode";

// QR code renderer using qrcode.react
const QRCode = dynamic(() => import("qrcode.react").then((m) => m.QRCodeSVG), { ssr: false });


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
      className="w-full flex items-center gap-5 p-5 bg-white border border-[#050505]/5 hover:border-[#050505]/20 hover:shadow-lg hover:shadow-[#050505]/5 transition-all duration-200 group rounded-2xl"
    >
      <div className="w-12 h-12 rounded-xl bg-[#FAF9F6] border border-[#050505]/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
        {loading ? (
          <Loader2 size={18} className="animate-spin text-[#050505]/40" />
        ) : (
          <img src={logo} alt={name} className="w-7 h-7 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        )}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-[13px] font-black text-[#050505] uppercase tracking-tight">{name}</p>
        <p className="text-[10px] font-mono text-black/40 uppercase tracking-widest mt-0.5">{badge}</p>
      </div>
      <ArrowRight size={14} className="text-black/20 group-hover:text-black group-hover:translate-x-1 transition-all shrink-0" />
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
  const { open } = useAppKit();

  const [mounted, setMounted] = useState(false);
  const [justConnected, setJustConnected] = useState(false);
  const [qrSession, setQrSession] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<"IDLE" | "AWAITING" | "SYNCED">("IDLE");
  const [showScanner, setShowScanner] = useState(false);
  const qrRef = useRef<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

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
    if (isConnected && !fromDisconnect) {
        // If we are on mobile, instead of redirecting immediately, we might want to show the scanner
        if (window.innerWidth < 1024 && !sessionIdParam) {
            setShowScanner(true);
        } else {
            router.replace("/");
        }
    }
    if (fromDisconnect) sessionStorage.removeItem("__disconnected__");
  }, [mounted, isConnected, router, sessionIdParam]);

  // Celebrate → redirect
  useEffect(() => {
    if (!mounted || !isConnected) return;
    if (window.innerWidth < 1024 && !sessionIdParam && !justConnected) {
       setShowScanner(true);
       return;
    }
    setJustConnected(true);
    if (!showScanner) {
        setTimeout(() => router.replace("/"), 1800);
    }
  }, [isConnected, mounted, router, sessionIdParam, showScanner]);

  const handleInjected = () => connect({ connector: injected() });
  const handleCoinbase = () => connect({ 
    connector: coinbaseWallet({ preference: 'smartWalletOnly' }) 
  });
  const handleWC = () => open();

  // Initialize Scanner when showScanner is true
  useEffect(() => {
    if (showScanner && mounted) {
      setTimeout(() => {
        if (!scannerRef.current) {
          scannerRef.current = new Html5QrcodeScanner("reader", { fps: 10, qrbox: {width: 250, height: 250} }, false);
          scannerRef.current.render((decodedText) => {
             // Expecting a URL like /connect?session=xxx
             try {
                const url = new URL(decodedText);
                const sessionFromQr = url.searchParams.get("session");
                if (sessionFromQr && address) {
                   scannerRef.current?.clear();
                   fetch(`/api/auth/qr-session?id=${sessionFromQr}`, {
                     method: "POST",
                     body: JSON.stringify({ address })
                   }).then(() => {
                     setSyncStatus("SYNCED");
                     setJustConnected(true);
                     setShowScanner(false);
                     setTimeout(() => { window.location.href = "/"; }, 1500);
                   });
                }
             } catch (e) {
                console.error("Invalid QR Code", e);
             }
          }, undefined);
        }
      }, 100);
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [showScanner, mounted, address]);

  // Handshake mobile session to desktop
  useEffect(() => {
    if (!mounted || !isConnected || !address || !sessionIdParam) return;
    
    const handshake = async () => {
      try {
        console.log("[SYNC] Initializing link for session:", sessionIdParam);
        const res = await fetch(`/api/auth/qr-session?id=${sessionIdParam}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address })
        });
        
        if (res.ok) {
          console.log("[SYNC] Handshake completed successfully ✓");
          setSyncStatus("SYNCED");
          setJustConnected(true);
          // Redirect to home after a brief celebratory delay
          setTimeout(() => { window.location.href = "/"; }, 2000);
        } else {
          console.error("[SYNC] Handshake failed with status:", res.status);
        }
      } catch (e) {
        console.error("[SYNC] Network error during handshake:", e);
      }
    };
    handshake();
  }, [mounted, isConnected, address, sessionIdParam]);
 admissions:

  // Build QR URL: deep-link to this connect page via mobile
  const qrUrl = typeof window !== "undefined"
    ? `${window.location.origin}/connect?session=${qrSession ?? ""}`
    : "";

  if (!mounted) return null;

  return (
    <div className="min-h-safe min-h-screen flex flex-col bg-[#FAF9F6] text-[#050505] relative font-sans">
      <CelestialMeshBackground />

      {/* ── NAV ── */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-[#050505]/5 bg-white/70 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <img src="/official-whale-monochrome.png" className="w-7 h-7" alt="Whale" />
          <span className="font-sans font-black text-sm uppercase tracking-tight text-[#050505]">Whale Alert Network</span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-[#050505]/30 hidden md:block font-bold">
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
                className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center"
              >
                <CheckCircle2 size={36} className="text-emerald-500" />
              </motion.div>
              <div>
                <p className="text-2xl font-black uppercase tracking-tighter text-[#050505]">Identity Verified</p>
                <p className="font-mono text-[11px] text-[#050505]/40 mt-2 font-bold">
                  {address ? `${address.slice(0, 10)}…${address.slice(-8)}` : ""}
                </p>
              </div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#050505]/30 font-bold">
                Entering terminal…
              </p>
            </motion.div>

          ) : showScanner ? (
            /* ── SCANNER FOR MOBILE ── */
            <motion.div
              key="scanner"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center p-8 w-full max-w-md bg-white border border-[#050505]/10 rounded-3xl shadow-2xl"
            >
               <div className="flex items-center gap-3 mb-6">
                 <img src="/official-whale-monochrome.png" className="w-8 h-8 opacity-90" alt="Whale" />
                 <h2 className="font-sans text-xl font-black text-[#050505] tracking-tighter uppercase">Link Session</h2>
               </div>
               <p className="text-[12px] text-[#050505]/50 mb-6 leading-relaxed font-semibold text-center">
                 Scan the QR code displayed on your PC screen to sync your connection securely.
               </p>
               <div className="w-full aspect-square max-w-[300px] mb-4 relative overflow-hidden rounded-2xl border-4 border-[#050505]/5">
                 <div id="reader" className="w-full h-full bg-[#FAF9F6] !border-none" />
               </div>
               <button onClick={() => { setShowScanner(false); setJustConnected(true); setTimeout(() => router.replace("/"), 1000); }} className="text-[10px] font-mono uppercase tracking-widest text-[#050505]/40 hover:text-[#050505] transition-colors mt-4">
                 Skip & Enter Terminal
               </button>
            </motion.div>

          ) : (

            /* ── CONNECT ── */
            <motion.div
              key="connect"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden border border-[#050505]/10 bg-white rounded-3xl shadow-2xl shadow-black/5"
            >

              {/* ── LEFT: QR PANEL ── */}
              <div className="p-10 border-b lg:border-b-0 lg:border-r border-[#050505]/10 flex flex-col relative overflow-hidden bg-[#FAF9F6]">
                
                {/* Giant background faded whale logo */}
                <div className="absolute -bottom-20 -left-20 pointer-events-none opacity-[0.03]">
                  <img src="/official-whale-monochrome.png" className="w-[400px] h-[400px] object-contain" alt="" />
                </div>

                <div className="mb-8 relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-[#050505]/30 font-black">Mobile Sync</p>
                    <a href="https://twitter.com/whalecosystem" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[9px] font-mono font-black uppercase tracking-widest text-[#00ACEE] hover:opacity-80 transition-opacity bg-[#00ACEE]/10 px-2.5 py-1 rounded-full">
                      <Twitter size={10} />
                      @whalecosystem
                    </a>
                  </div>
                  <h2 className="font-sans text-2xl font-black text-[#050505] tracking-tighter leading-tight flex items-center gap-3">
                    <img src="/official-whale-monochrome.png" className="w-8 h-8 opacity-90" alt="Whale" />
                    Scan to connect
                  </h2>
                  <p className="text-[12px] text-[#050505]/50 mt-3 leading-relaxed font-semibold">
                    Open your mobile wallet and scan the QR code below. Your session will sync automatically with this terminal.
                  </p>
                </div>

                {/* QR Code */}
                <div className="flex-1 flex flex-col items-center justify-center gap-6 relative z-10">
                  <div className="relative p-5 bg-white border border-[#050505]/10 rounded-[32px] shadow-sm">
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#050505]/10 rounded-tl-[32px]" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#050505]/10 rounded-tr-[32px]" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#050505]/10 rounded-bl-[32px]" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#050505]/10 rounded-br-[32px]" />

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
                        <Loader2 size={28} className="animate-spin text-[#050505]/20" />
                      </div>
                    )}
                  </div>

                  {/* Status indicator */}
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[#050505]/5">
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
                          className="w-2 h-2 rounded-full bg-[#050505]/20 inline-block"
                        />
                        <span className="font-mono text-[9px] uppercase tracking-widest text-[#050505]/40 font-bold">
                          {qrSession ? "Awaiting scan" : "Generating code…"}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Refresh */}
                  {qrSession && syncStatus !== "SYNCED" && (
                    <button
                      onClick={fetchSession}
                      className="font-mono text-[9px] uppercase tracking-widest text-[#050505]/30 hover:text-[#050505] transition-colors font-bold"
                    >
                      Refresh code →
                    </button>
                  )}
                </div>

                {/* Compatible wallets note */}
                <p className="mt-8 text-[9px] font-mono uppercase tracking-widest text-[#050505]/30 text-center font-bold">
                  Compatible with MetaMask Mobile · Rainbow · Trust Wallet · Coinbase Wallet
                </p>
              </div>

              {/* ── RIGHT: DIRECT CONNECT PANEL ── */}
              <div className="p-10 flex flex-col bg-white">
                <div className="mb-8">
                  <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-[#050505]/30 font-black mb-2">Desktop Connection</p>
                  <h2 className="font-sans text-2xl font-black text-[#050505] tracking-tighter leading-tight">
                    Connect your<br />wallet directly
                  </h2>
                  <p className="text-[12px] text-[#050505]/50 mt-3 leading-relaxed font-semibold">
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
                  className="mt-8 pt-6 border-t border-[#050505]/5 flex items-start gap-3"
                >
                  <Shield size={14} className="text-[#050505]/30 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-[#050505]/40 leading-relaxed font-bold">
                    Non-custodial authentication. Your private keys never leave your device. Authentication is verified via ECDSA — no passwords, no accounts.
                  </p>
                </motion.div>

                {/* Networks */}
                <div className="mt-5 flex items-center gap-2 flex-wrap">
                  {["Optimism", "Ethereum", "Base", "Arbitrum", "Polygon"].map((n) => (
                    <span key={n} className="text-[8px] font-mono font-black uppercase tracking-widest px-2.5 py-1 border border-[#050505]/10 rounded-full text-[#050505]/40 bg-[#FAF9F6]">
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
      <footer className="relative z-10 px-8 py-5 border-t border-[#050505]/5 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <img src="/official-whale-monochrome.png" className="w-4 h-4 opacity-30" alt="" />
          <span className="font-mono text-[8px] uppercase tracking-widest text-[#050505]/30 font-bold">
            Whale Alert Network · Privacy by Void
          </span>
        </div>
        <a
          href="https://walletconnect.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-widest text-[#050505]/30 hover:text-[#050505] transition-colors font-bold"
        >
          WalletConnect <ExternalLink size={10} />
        </a>
      </footer>
    </div>
  );
}
