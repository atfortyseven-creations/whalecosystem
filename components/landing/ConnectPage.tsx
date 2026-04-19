"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useConnect } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  Loader2,
  Twitter,
  Fingerprint,
  Github,
  CheckCircle,
  ExternalLink,
  Smartphone,
  Monitor,
} from "lucide-react";
import { QRCodeSVG as QRCode } from "qrcode.react";

// ─── Detect mobile/tablet via UA ─────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
        navigator.userAgent
      )
    );
  }, []);
  return isMobile;
}

// ─── Desktop wallets (EIP-6963 extensions) ───────────────────────────────────
const DESKTOP_WALLETS = [
  {
    id: "metamask",
    name: "MetaMask",
    badge: "Browser Extension",
    logo: "/wallets/metamask.svg",
    rdns: "io.metamask",
    installUrl: "https://metamask.io/download/",
    delay: 0,
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    badge: "Extension / MPC",
    logo: "/wallets/coinbase.png",
    rdns: "com.coinbase.wallet",
    installUrl: "https://www.coinbase.com/wallet/downloads",
    delay: 0.06,
  },
  {
    id: "rabby",
    name: "Rabby",
    badge: "Advanced EOA",
    logo: "/wallets/rabby.png",
    rdns: "io.rabby",
    installUrl: "https://rabby.io/",
    delay: 0.12,
  },
  {
    id: "walletconnect",
    name: "All Wallets",
    badge: "WalletConnect / QR",
    logo: "/wallets/rainbow.png",
    rdns: null, // opens AppKit modal
    installUrl: null,
    delay: 0.18,
  },
];

// ─── Mobile wallets (all open AppKit which uses WC deep-links) ───────────────
const MOBILE_WALLETS = [
  { id: "metamask-mobile",   name: "MetaMask",       badge: "Tap to open app", logo: "/wallets/metamask.svg", delay: 0 },
  { id: "coinbase-mobile",   name: "Coinbase Wallet", badge: "Tap to open app", logo: "/wallets/coinbase.png", delay: 0.06 },
  { id: "rainbow-mobile",    name: "Rainbow",         badge: "Tap to open app", logo: "/wallets/rainbow.png",  delay: 0.12 },
  { id: "phantom-mobile",    name: "Phantom",         badge: "Tap to open app", logo: "/wallets/phantom.png",  delay: 0.18 },
  { id: "trustwallet-mobile",name: "Trust Wallet",    badge: "Tap to open app", logo: "/wallets/trust.png",    delay: 0.24 },
];

// ─── Wallet button ────────────────────────────────────────────────────────────
function WalletButton({
  logo, name, badge, onClick, loading = false, delay = 0, extraIcon,
}: {
  logo: string; name: string; badge: string;
  onClick: () => void; loading?: boolean; delay?: number;
  extraIcon?: React.ReactNode;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onClick={loading ? undefined : onClick}
      disabled={loading}
      className="group relative w-full flex items-center gap-4 p-5 bg-[#FAF9F6] hover:bg-white border border-black/[0.06] hover:border-black/12 rounded-[24px] transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5 text-[#050505] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="w-11 h-11 rounded-xl bg-white border border-black/5 flex items-center justify-center p-2 shadow-sm group-hover:scale-105 transition-transform duration-300 shrink-0">
        <img
          src={logo} alt={name} className="w-full h-full object-contain"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-[13px] font-black uppercase tracking-tight truncate">
          {loading ? "Connecting…" : name}
        </p>
        <p className="text-[10px] font-mono text-black/40 uppercase tracking-widest mt-0.5 truncate">
          {badge}
        </p>
      </div>
      {loading ? (
        <Loader2 size={14} className="animate-spin text-black/30 shrink-0" />
      ) : extraIcon ? (
        <span className="text-black/20 group-hover:text-black transition-colors shrink-0">{extraIcon}</span>
      ) : (
        <ArrowRight size={14} className="text-black/20 group-hover:text-black group-hover:translate-x-1 transition-all shrink-0" />
      )}
    </motion.button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ConnectPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending, isError, error } = useConnect();
  const { open: openAppKit } = useAppKit();

  const [mounted, setMounted] = useState(false);
  const [qrSession, setQrSession] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<"IDLE" | "AWAITING" | "SYNCED">("IDLE");
  const [pendingId, setPendingId] = useState<string | null>(null);

  // ── Surface errors ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isError || !error) return;
    setPendingId(null);
    const msg = error.message ?? "Unknown error";

    // Suppress false-positive 'Connector already connected' error from wagmi
    // This fires when the user returns from a mobile wallet app with an active session
    if (
      msg.toLowerCase().includes("already connected") ||
      msg.toLowerCase().includes("connector already")
    ) {
      return;
    }

    const isNotFound =
      msg.toLowerCase().includes("provider not found") ||
      msg.toLowerCase().includes("not installed") ||
      msg.toLowerCase().includes("no injected");
    const isRejected =
      msg.toLowerCase().includes("user rejected") ||
      msg.toLowerCase().includes("rejected");

    if (isNotFound) {
      toast.error("Extension not installed", {
        description: "Install the wallet browser extension, then refresh.",
        action: {
          label: "Download MetaMask",
          onClick: () => window.open("https://metamask.io/download/", "_blank"),
        },
        duration: 7000,
      });
    } else if (isRejected) {
      toast.error("Request rejected", {
        description: "You cancelled the signature in your wallet.",
      });
    } else {
      toast.error("Connection Failed", { description: msg });
    }
  }, [isError, error]);

  useEffect(() => { setMounted(true); }, []);

  // ── QR session ────────────────────────────────────────────────────────────
  const fetchSession = useCallback(async () => {
    try {
      setSyncStatus("AWAITING");
      const res = await fetch("/api/auth/qr-session", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.sessionId) setQrSession(data.sessionId);
    } catch {
      setSyncStatus("IDLE");
    }
  }, []);

  useEffect(() => { if (!qrSession) fetchSession(); }, [qrSession, fetchSession]);

  // ── Poll QR scan ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!qrSession || syncStatus === "SYNCED") return;
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/qr-session?id=${qrSession}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "complete" && data.address) {
          setSyncStatus("SYNCED");
          clearInterval(poll);
          document.cookie = `sovereign_handshake=${data.address}; path=/; max-age=604800; SameSite=Lax`;
          setTimeout(() => router.replace("/"), 1200);
        }
      } catch {}
    }, 2000);
    return () => clearInterval(poll);
  }, [qrSession, syncStatus, router]);

  // ── Auto-redirect on connection ───────────────────────────────────────────
  useEffect(() => {
    if (!mounted || !isConnected) return;
    try {
      if (sessionStorage.getItem("__disconnected__") === "1") {
        sessionStorage.removeItem("__disconnected__");
        return;
      }
    } catch {}
    if (!document.cookie.includes("sovereign_handshake=")) {
      document.cookie = `sovereign_handshake=${address ?? "web3_injected"}; path=/; max-age=604800; SameSite=Lax`;
    }
    setPendingId(null);
    const t = setTimeout(() => router.replace("/"), 500);
    return () => clearTimeout(t);
  }, [isConnected, mounted, router, address]);

  // ── Desktop handler: EIP-6963 extension lookup ───────────────────────────
  const handleDesktopWallet = useCallback(
    (walletId: string, rdns: string | null, installUrl: string | null) => {
      setPendingId(walletId);

      // No rdns → WalletConnect / AppKit modal
      if (!rdns) {
        openAppKit();
        setPendingId(null);
        return;
      }

      // 1. Exact EIP-6963 rdns match
      let connector = connectors.find((c: any) => c.id === rdns);
      // 2. Name substring match
      if (!connector) connector = connectors.find((c) => c.name.toLowerCase().includes(walletId.toLowerCase()));
      // 3. Generic injected (window.ethereum)
      if (!connector) connector = connectors.find((c) => c.id === "injected" || (c as any).type === "injected");

      if (connector) {
        connect({ connector });
      } else {
        setPendingId(null);
        if (installUrl) {
          toast.error("Extension not detected", {
            description: `The ${walletId} extension is not active in this browser.`,
            action: { label: "Install", onClick: () => window.open(installUrl, "_blank") },
            duration: 7000,
          });
        }
      }
    },
    [connect, connectors, openAppKit]
  );

  // ── Mobile handler: AppKit opens WC deep-link → native app ───────────────
  const handleMobileWallet = useCallback(() => {
    openAppKit();
  }, [openAppKit]);

  const qrUrl = mounted && typeof window !== "undefined"
    ? `${window.location.origin}/connect?session=${qrSession ?? ""}`
    : "";

  return (
    <div className="min-h-screen w-full flex flex-col text-black font-mono overflow-auto bg-[#FAF9F6] selection:bg-black selection:text-white">
      {/* Wave bg */}
      <div
        className="fixed bottom-0 left-0 right-0 h-[40vh] pointer-events-none z-0"
        style={{
          backgroundImage: "url('/olas-hokusai-4k.png')",
          backgroundSize: "auto 100%",
          backgroundPosition: "bottom center",
          backgroundRepeat: "repeat-x",
          opacity: 0.08,
        }}
      />

      {/* Header */}
      <header className="relative z-[100] h-[64px] flex items-center justify-between px-6 md:px-10 border-b border-black/[0.06] bg-white/80 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <img src="/official-whale-monochrome.png" className="w-7 h-7" alt="Whale"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <span className="text-[14px] font-black uppercase tracking-tighter">Whale Alert Network</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-mono text-black/30 uppercase tracking-widest hidden sm:block">
            Sovereign Access Protocol
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 relative z-10 flex items-center justify-center p-4 md:p-8 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 rounded-[36px] border border-black/10 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.10)] overflow-hidden"
        >
          {/* ── LEFT: QR panel ── */}
          <div className="relative p-8 lg:p-12 flex flex-col bg-white border-b lg:border-b-0 lg:border-r border-black/[0.08]">
            <div className="absolute inset-0 pointer-events-none z-0"
              style={{
                backgroundImage: "url('/patron-cosmico-4k.png')",
                backgroundSize: "320px", backgroundRepeat: "repeat",
                opacity: 0.035, mixBlendMode: "multiply",
              }}
            />
            <div className="relative z-10 flex flex-col h-full">
              <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-3">
                Mobile Sync
              </h2>
              <p className="text-[10px] text-black/40 font-mono uppercase tracking-widest mb-8 border-b border-black/10 pb-4">
                Scan QR · Bridge the Sovereign Intel Mesh
              </p>

              <div className="flex flex-col items-center gap-6 flex-1 justify-center">
                <div className="p-5 bg-white rounded-[28px] shadow-sm border border-black/5">
                  <AnimatePresence mode="wait">
                    {qrSession && mounted ? (
                      <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                        <QRCode value={qrUrl} size={180} level="H" bgColor="#FFFFFF" fgColor="#050505" />
                      </motion.div>
                    ) : (
                      <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="w-[180px] h-[180px] flex items-center justify-center">
                        <Loader2 size={28} className="animate-spin text-black/10" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-2.5">
                  <AnimatePresence mode="wait">
                    {syncStatus === "SYNCED" ? (
                      <motion.div key="ok" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                        <CheckCircle size={13} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Synced — Redirecting…</span>
                      </motion.div>
                    ) : (
                      <motion.div key="wait" className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-black/20 animate-pulse" />
                        <span className="text-[10px] font-mono text-black/30 uppercase tracking-widest">
                          {syncStatus === "AWAITING" ? "Awaiting scan…" : "Initializing…"}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {qrSession && (
                  <button onClick={() => { setQrSession(null); setSyncStatus("IDLE"); }}
                    className="text-[9px] font-mono text-black/25 hover:text-black/50 uppercase tracking-widest transition-colors">
                    Refresh QR
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Smart wallet connect ── */}
          <div className="relative p-8 lg:p-12 flex flex-col bg-white/95 backdrop-blur-md">
            <div className="relative z-10 flex flex-col h-full">

              <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">
                Connect Wallet
              </h2>

              {/* Device mode indicator */}
              {mounted && (
                <div className="flex items-center gap-1.5 mb-3">
                  {isMobile
                    ? <Smartphone size={9} className="text-emerald-500" />
                    : <Monitor size={9} className="text-sky-500" />
                  }
                  <span className="text-[8px] font-mono uppercase tracking-widest text-black/30">
                    {isMobile
                      ? "Mobile — tap to open native app"
                      : "Desktop — opens browser extension"
                    }
                  </span>
                </div>
              )}

              <p className="text-[10px] text-black/40 font-mono uppercase tracking-widest mb-8 border-b border-black/10 pb-4">
                ECDSA · Zero-Custody · Multi-Chain
              </p>

              {!mounted ? (
                <div className="flex flex-col gap-3 flex-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="w-full h-[72px] rounded-[24px] bg-black/[0.03] animate-pulse" />
                  ))}
                </div>
              ) : isMobile ? (
                /* ── MOBILE: all buttons fire AppKit → WalletConnect deep-link → native app ── */
                <div className="flex flex-col gap-3 flex-1">
                  {MOBILE_WALLETS.map((w) => (
                    <WalletButton
                      key={w.id}
                      logo={w.logo}
                      name={w.name}
                      badge={w.badge}
                      onClick={handleMobileWallet}
                      loading={isPending && pendingId === w.id}
                      delay={w.delay}
                      extraIcon={<ExternalLink size={13} />}
                    />
                  ))}
                </div>
              ) : (
                /* ── DESKTOP: EIP-6963 extension first, AppKit modal fallback ── */
                <div className="flex flex-col gap-3 flex-1">
                  {DESKTOP_WALLETS.map((w) => (
                    <WalletButton
                      key={w.id}
                      logo={w.logo}
                      name={w.name}
                      badge={w.badge}
                      onClick={() => handleDesktopWallet(w.id, w.rdns, w.installUrl)}
                      loading={isPending && pendingId === w.id}
                      delay={w.delay}
                    />
                  ))}
                </div>
              )}

              {/* Security note */}
              <div className="mt-6 p-4 bg-[#FAF9F6]/80 border border-black/[0.06] rounded-2xl flex items-start gap-3">
                <Fingerprint size={14} className="text-black/25 mt-0.5 shrink-0" />
                <p className="text-[9px] text-black/35 font-semibold leading-relaxed">
                  This portal does not hold custody of assets. All interactions are verified on-chain via ECDSA signature. No username. No password.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-[100] px-8 py-6 border-t border-black/[0.04] bg-white/50 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <img src="/official-whale-monochrome.png" className="w-4 h-4 opacity-30" alt=""
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-black/30">© 2026 atfortyseven-creations</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="https://twitter.com/WhaleAlert" target="_blank" rel="noopener noreferrer" className="text-black/25 hover:text-black transition-colors">
            <Twitter size={16} />
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-black/25 hover:text-black transition-colors">
            <Github size={16} />
          </a>
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black uppercase tracking-widest text-black/30">Status: Operational</span>
            <span className="text-[7px] font-mono text-emerald-500 uppercase tracking-widest font-bold">L1/L2 Ingress Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
