"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/lib/store/ui-store";
import { SignContractStep } from "@/components/shared/LinkedGate";
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
import { WavePatternOverlay } from "@/components/layout/WavePatternOverlay";

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
    badge: "Browser Extension",
    logo: "/wallets/coinbase.png",
    rdns: "com.coinbase.wallet",
    installUrl: "https://www.coinbase.com/wallet",
    delay: 0.1,
  },
  {
    id: "rainbow",
    name: "Rainbow",
    badge: "Browser Extension",
    logo: "/wallets/rainbow.png",
    rdns: "me.rainbow",
    installUrl: "https://rainbow.me/extension",
    delay: 0.2,
  },
];

// ─── Mobile wallets (all open AppKit which uses WC deep-links) ───────────────
const MOBILE_WALLETS = [
  { id: "metamask-mobile",   name: "MetaMask",       badge: "Tap to open app", logo: "/wallets/metamask.svg",  delay: 0 },
  { id: "coinbase-mobile",   name: "Coinbase Wallet", badge: "Tap to open app", logo: "/wallets/coinbase.png",  delay: 0.1 },
  { id: "rainbow-mobile",    name: "Rainbow",        badge: "Tap to open app", logo: "/wallets/rainbow.png",   delay: 0.2 },
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
      className="group relative w-full flex items-center gap-4 p-5 rounded-[24px] transition-all duration-300 hover:-translate-y-0.5 text-[#050505] disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-[#E5E5E5] shadow-sm hover:shadow-md hover:border-black/20"
    >
      <div className="w-11 h-11 rounded-xl bg-[#FAF9F6] border border-[#E5E5E5] flex items-center justify-center p-2 shadow-sm group-hover:scale-105 transition-transform duration-300 shrink-0">
        <img
          src={logo} alt={name} className="w-full h-full object-contain"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-[13px] font-black uppercase tracking-tight truncate text-[#050505]">
          {loading ? "Connecting…" : name}
        </p>
        <p className="text-[10px] font-mono text-[#050505]/40 uppercase tracking-widest mt-0.5 truncate">
          {badge}
        </p>
      </div>
      {loading ? (
        <Loader2 size={14} className="animate-spin text-[#050505]/30 shrink-0" />
      ) : extraIcon ? (
        <span className="text-[#050505]/30 group-hover:text-[#050505] transition-colors shrink-0">{extraIcon}</span>
      ) : (
        <ArrowRight size={14} className="text-[#050505]/30 group-hover:text-[#050505] group-hover:translate-x-1 transition-all shrink-0" />
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
  const { disconnect } = useDisconnect();
  const { open: openAppKit } = useAppKit();
  const { isLinked, setLinked } = useUIStore();

  const [mounted, setMounted] = useState(false);
  const [qrSession, setQrSession] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<"IDLE" | "AWAITING" | "SYNCED" | "ERROR">("IDLE");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

  // ── QR session (X25519 Ephemeral + AES-GCM) ──────────────────────────────
  const [ephemeral, setEphemeral] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const [qrData, setQrData] = useState('');

  const initEphemeral = useCallback(async () => {
    try {
      const { generateX25519KeyPair } = await import('@/lib/web-crypto');
      const pair = await generateX25519KeyPair();
      setEphemeral(pair);
      
      const sessId = typeof crypto !== 'undefined' && crypto.randomUUID 
          ? crypto.randomUUID() 
          : (Math.random().toString(36).substring(2, 15) + Date.now().toString(36));
      setQrSession(sessId);

      // ── CRITICAL FIX: QR must be a valid HTTPS URL, NOT raw JSON ──────────
      // iOS/Android native cameras only display deep-link prompts for URLs.
      // Raw JSON QR codes show as unclickable plain text — users have no idea
      // what to do with them. A URL format means:
      //   1. Native camera detects "Open in Safari/Chrome" → user taps it
      //   2. The mobile browser opens the app at /connect with the QR params
      //   3. MobileEnforcer stores the params and triggers in-app handshake
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.humanidfi.com';
      const expiresAt = Date.now() + 300000; // 5 minutes
      const qrUrl = new URL('/connect', origin);
      qrUrl.searchParams.set('uuid', sessId);
      qrUrl.searchParams.set('pub', encodeURIComponent(pair.publicKey));
      qrUrl.searchParams.set('ecdh', pair.isECDH ? '1' : '0');
      qrUrl.searchParams.set('exp', String(expiresAt));
      setQrData(qrUrl.toString());
      setSyncStatus("AWAITING");

      // Auto-refresh QR after 4.5 minutes (before the 5-min Redis TTL expires)
      // to ensure the desktop never silently waits on a dead session.
      const refreshTimer = setTimeout(() => {
        setQrSession(null);
        setSyncStatus("IDLE");
      }, 270000); // 4.5 min
      return () => clearTimeout(refreshTimer);

    } catch (e: any) {
      console.error('Failed to init ephemeral keys:', e);
      setErrorMessage(e.message || "Failed to initialize Web Crypto API.");
      setSyncStatus("ERROR");
    }
  }, []);

  useEffect(() => { if (!qrSession && mounted) initEphemeral(); }, [qrSession, initEphemeral, mounted]);

  // ── Poll QR scan (Decryption) ──────────────────────────────────────────────
  useEffect(() => {
    if (!qrSession || !ephemeral || syncStatus === "SYNCED") return;
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/qr-poll?uuid=${qrSession}&t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        
        if (data.encryptedPayload && data.iv) {
          setSyncStatus("SYNCED");
          clearInterval(poll);
          
          let jwt: string | null = null;

          // ── Strategy 1: ECDH decryption (preferred) ──────────────────────
          // Mobile encrypted the JWT with the shared secret derived from:
          //   mobile.priv × desktop.pub  ≡  desktop.priv × mobile.pub
          try {
            const { deriveSharedSecret, decryptAESGCM } = await import('@/lib/web-crypto');
            // Parse the QR URL to get the isECDH flag
            let isECDHFlag = false;
            try {
              const qrUrl = new URL(qrData);
              isECDHFlag = qrUrl.searchParams.get('ecdh') === '1';
            } catch {
              // Legacy JSON format fallback
              try { isECDHFlag = JSON.parse(qrData).isECDH ?? false; } catch {}
            }
            const mobilePub = data.mobilePub;
            if (mobilePub) {
              const shared = await deriveSharedSecret(ephemeral.privateKey, mobilePub, isECDHFlag);
              const decrypted = await decryptAESGCM(shared, data.encryptedPayload, data.iv);
              // Validate it looks like a JWT (three base64url segments)
              if (decrypted && decrypted.split('.').length === 3) {
                jwt = decrypted;
              }
            }
          } catch (decryptErr) {
            console.warn('[QRPoll] ECDH decryption failed, trying server fallback:', decryptErr);
          }

          // ── Strategy 2: Server-minted JWT fallback ────────────────────────
          // /api/auth/qr-mobile-link stores a `serverJwt` alongside the encrypted
          // payload as a fallback for iOS X25519 key format edge cases.
          if (!jwt && data.serverJwt) {
            try {
              const { verifyJWT } = await import('@/lib/jwt');
              await verifyJWT(data.serverJwt); // Validate it's legit before using
              jwt = data.serverJwt;
              console.log('[QRPoll] Using server-minted JWT fallback');
            } catch {
              console.warn('[QRPoll] Server JWT fallback also invalid');
            }
          }

          if (!jwt) {
            console.error('[QRPoll] Both decryption strategies failed. Aborting hydration.');
            setSyncStatus("ERROR");
            return;
          }

          // ── Hydrate the desktop session (HttpOnly cookie via server) ──────
          const hydrateRes = await fetch('/api/auth/qr-hydrate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jwt }),
          });

          if (hydrateRes.ok) {
            setTimeout(() => window.location.replace("/"), 100);
          } else {
            console.error('[QRPoll] Hydration failed:', await hydrateRes.text());
            setSyncStatus("ERROR");
          }
        }
      } catch (err: any) {
        console.error('[QRPoll] Poll error:', err?.message);
      }
    }, 1000);
    return () => clearInterval(poll);
  }, [qrSession, ephemeral, qrData, syncStatus]);


  useEffect(() => {
    if (!mounted || !isConnected) return;
    try {
      if (sessionStorage.getItem("__disconnected__") === "1") {
        sessionStorage.removeItem("__disconnected__");
        return;
      }
    } catch {}

    // ─── HARD REDIRECT: use window.location.replace, NOT router.replace ────
    // router.replace is a client-side navigation — the server never sees the
    // new sovereign_handshake cookie we just set. window.location.replace
    // forces a full HTTP round-trip so SSR can read the cookie and serve the
    // correct authenticated layout immediately.
    const doHardRedirect = () => {
      setPendingId(null);
      router.replace("/");
    };

    const enforceRedirect = () => {
      if (isLinked) {
        doHardRedirect();
      }
    };

    // iOS/Android Chrome Background Suspension Fix
    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          enforceRedirect();
          document.removeEventListener("visibilitychange", handleVisibilityChange);
        }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);
      setTimeout(enforceRedirect, 2000);
      return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    } else {
      enforceRedirect();
    }
  }, [isConnected, mounted, isLinked, router]);

  // ── Mobile Redirect ───────────────────────────────────────────────────────
  // Mobile users have their own standalone UI on the landing page (MobileLanding.tsx).
  // If they somehow land on /connect, redirect them to the landing page immediately.
  useEffect(() => {
    if (mounted && isMobile) {
      router.replace("/");
    }
  }, [mounted, isMobile, router]);


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
    try { localStorage.setItem('sovereign_pending_wakeup', '1'); } catch {}
    openAppKit();
  }, [openAppKit]);

  const qrUrl = mounted && typeof window !== "undefined"
    ? `${window.location.origin}/connect?session=${qrSession ?? ""}`
    : "";

  return (
    <div
      className="min-h-screen w-full flex flex-col text-[#050505] font-mono overflow-auto selection:bg-[#050505] selection:text-[#FDFCF8]"
      style={{
        backgroundColor: "#FDFCF8",
      }}
    >
      <WavePatternOverlay />


      {/* Main */}
      <main className="flex-1 relative z-10 flex flex-col justify-center items-center p-4 py-12 md:p-8 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`w-full my-auto ${mounted && isConnected ? 'max-w-2xl grid grid-cols-1' : 'max-w-4xl grid grid-cols-1 lg:grid-cols-2'} rounded-[36px] overflow-hidden bg-white shadow-2xl`}
          style={{ border: "1px solid rgba(5,5,5,0.08)" }}
        >
          {/* ── LEFT: QR panel ── */}
          {!(mounted && isConnected) && (
          <div
            className="relative p-8 lg:p-12 flex flex-col overflow-hidden"
            style={{ borderRight: "1px solid rgba(5,5,5,0.06)", background: "rgba(250,249,246,0.5)" }}
          >
            <div className="relative z-10 flex flex-col h-full">
              <div
                className="inline-flex self-start px-5 py-3 rounded-2xl mb-3 bg-white"
                style={{ border: "1px solid rgba(5,5,5,0.08)" }}
              >
                <h2 className="text-3xl font-black uppercase tracking-tighter leading-none text-[#050505]">
                  Direct QR Handshake
                </h2>
              </div>
              <div className="mb-8 border-b border-[#050505]/10 pb-4" />

              <div className="flex flex-col items-center gap-6 flex-1 justify-center">
                <div className="p-5 bg-white rounded-[28px] shadow-sm border border-black/5 flex flex-col items-center">
                  <AnimatePresence mode="wait">
                    {syncStatus === "ERROR" ? (
                      <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-[180px] h-[180px] flex flex-col items-center justify-center bg-red-50 text-red-600 rounded-xl border border-red-200 p-4 text-center">
                        <span className="text-[10px] font-black uppercase tracking-widest mb-2">Cryptographic Failure</span>
                        <span className="text-[9px] font-mono leading-tight">{errorMessage}</span>
                        <span className="text-[9px] font-mono mt-4 text-red-400">Use HTTPS or localhost.</span>
                      </motion.div>
                    ) : qrSession && mounted ? (
                      <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                        <QRCode value={qrData} size={180} level="H" bgColor="#FFFFFF" fgColor="#050505" />
                      </motion.div>
                    ) : (
                      <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="w-[180px] h-[180px] flex items-center justify-center">
                        <Loader2 size={28} className="animate-spin text-black/10" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {qrSession && mounted && (
                    <div className="mt-4 flex flex-col items-center text-center gap-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-100 px-2 py-0.5 rounded border border-red-200">
                        DO NOT SCAN WITH METAMASK
                      </span>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-[#050505]/50">
                        Scan with native phone camera
                      </span>
                      <div className="mt-5 flex flex-col items-start text-left gap-3.5 w-full max-w-[280px]">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#050505]/70 border-b border-[#050505]/10 w-full pb-1 mb-1">
                          Authentication Protocol
                        </span>
                        <div className="flex items-start gap-2.5">
                          <span className="text-[9px] font-mono bg-[#050505]/5 text-[#050505]/70 px-1.5 py-0.5 rounded mt-0.5">1</span>
                          <span className="text-[11px] font-medium leading-relaxed text-[#050505]/60">Activate your native mobile camera application or integrated secure scanner.</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <span className="text-[9px] font-mono bg-[#050505]/5 text-[#050505]/70 px-1.5 py-0.5 rounded mt-0.5">2</span>
                          <span className="text-[11px] font-medium leading-relaxed text-[#050505]/60">Align the viewfinder precisely with the cryptographic QR matrix presented above.</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <span className="text-[9px] font-mono bg-[#050505]/5 text-[#050505]/70 px-1.5 py-0.5 rounded mt-0.5">3</span>
                          <span className="text-[11px] font-medium leading-relaxed text-[#050505]/60">Acknowledge the subsequent secure deep-link prompt to finalize the session handshake.</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <AnimatePresence mode="wait">
                    {syncStatus === "SYNCED" ? (
                      <motion.div key="ok" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                        <CheckCircle size={13} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Synced — Redirecting…</span>
                      </motion.div>
                    ) : (
                      null
                    )}
                  </AnimatePresence>
                </div>

                {qrSession && (
                  <button onClick={() => { setQrSession(null); setSyncStatus("IDLE"); }}
                    className="text-[9px] font-mono text-[#050505]/30 hover:text-[#050505]/70 uppercase tracking-widest transition-colors mt-4">
                    Refresh QR
                  </button>
                )}
              </div>
            </div>
          </div>
          )}

          {/* ── RIGHT: Smart wallet connect ── */}
          <div
            className="relative p-8 lg:p-12 flex flex-col bg-white"
          >
            <div className="relative z-10 flex flex-col h-full">

              <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2 text-[#050505]">
                Connect Wallet
              </h2>

              {/* Device mode indicator — only visible pre-connection */}
              {mounted && !isConnected && (
                <div className="flex items-center gap-1.5 mb-6 border-b border-[#050505]/10 pb-4">
                  {isMobile
                    ? <Smartphone size={9} className="text-[#2D0A59]" />
                    : <Monitor size={9} className="text-[#2D0A59]" />
                  }
                  <span className="text-[8px] font-mono uppercase tracking-widest text-[#050505]/40">
                    {isMobile ? "Mobile — tap to open native app" : "Desktop — opens browser extension"}
                  </span>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────── */}
              {/* SOVEREIGN CONNECTED STATE                               */}
              {/* AGGRESSIVE AUTO-REDIRECT ENFORCEMENT                    */}
              {/* ─────────────────────────────────────────────────────── */}
              {mounted && isConnected && !isLinked ? (
                <motion.div
                  key="sign-contract"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col flex-1"
                >
                  <SignContractStep 
                    onSigned={() => setLinked(true)} 
                    onDisconnect={() => {
                       try { disconnect(); } catch {}
                       setLinked(false);
                    }} 
                  />
                </motion.div>
              ) : mounted && isLinked ? (
                <motion.div
                  key="connected-state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center justify-center gap-6 flex-1 py-12"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20" />
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shadow-lg relative z-10">
                      <CheckCircle size={36} className="text-emerald-400" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-center max-w-[280px]">
                    <span className="text-[14px] font-black uppercase tracking-widest text-emerald-400">
                      Identity Verified
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400/60 break-all mt-2 px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-400/20">
                      {address}
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-3 mt-4">
                    <Loader2 size={24} className="animate-spin text-[#050505]/30" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#050505]/50 animate-pulse">
                      Redirecting to Terminal...
                    </span>
                  </div>

                  <div className="mt-8">
                    <button
                      className="text-[9px] font-black uppercase tracking-widest text-[#050505]/40 hover:text-[#050505] underline decoration-dotted underline-offset-4 transition-colors"
                      onClick={(e) => { e.preventDefault(); router.replace("/"); }}
                    >
                      Click here if not redirected automatically
                    </button>
                  </div>
                </motion.div>

              ) : !mounted ? (
                /* ── SKELETON ── */
                <div className="flex flex-col gap-3 flex-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="w-full h-[72px] rounded-[24px] bg-[#050505]/5 animate-pulse" />
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

              {/* Security note — only when not yet connected */}
              {mounted && !isConnected && (
                <div className="mt-6 p-4 rounded-2xl flex items-start gap-3 bg-[#FAF9F6] border border-[#050505]/10">
                  <Fingerprint size={14} className="text-[#050505]/40 mt-0.5 shrink-0" />
                  <p className="text-[9px] text-[#050505]/60 font-medium leading-relaxed">
                    This portal does not hold custody of assets. All interactions are verified on-chain via ECDSA signature. No username. No password.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="relative z-[100] px-8 py-6 border-t border-[#050505]/10 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 bg-[#FDFCF8]">
        <div className="flex items-center gap-3">
          <img
            src="/official-whale-monochrome.png"
            className="w-4 h-4 opacity-40 grayscale invert-0 brightness-0"
            alt=""
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#050505]/40">© 2026 atfortyseven-creations</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="https://twitter.com/WhaleAlert" target="_blank" rel="noopener noreferrer" className="text-[#050505]/40 hover:text-[#050505] transition-colors">
            <Twitter size={16} />
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[#050505]/40 hover:text-[#050505] transition-colors">
            <Github size={16} />
          </a>
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black uppercase tracking-widest text-[#050505]/40">Status: Operational</span>
            <span className="text-[7px] font-mono text-emerald-600 uppercase tracking-widest font-bold">L1/L2 Ingress Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
