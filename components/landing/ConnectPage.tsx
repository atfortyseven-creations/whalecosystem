"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { useUIStore } from "@/lib/store/ui-store";
import { toast } from "sonner";
import { UniversalEliteWallpaper } from "@/components/shared/UniversalEliteWallpaper";

import {
  ArrowRight,
  Loader2,
  Twitter,
  Github,
  CheckCircle,
  ExternalLink,
  Smartphone,
  Monitor,
  ScanLine,
  Lock,
  MessageCircle,
  Shield
} from "lucide-react";
import { QRCodeSVG as QRCode } from "qrcode.react";

// QR Scanner — iOS-safe dynamic import
const DynamicQRScannerModal = dynamic(
  () => import("@/components/wallet/QRScannerModal"),
  { ssr: false }
);

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

const DESKTOP_WALLETS = [
  { id: "metamask", name: "MetaMask", badge: "Browser Extension", logo: "/wallets/metamask.svg", rdns: "io.metamask", installUrl: "https://metamask.io/download/", delay: 0 },
  { id: "coinbase", name: "Coinbase Wallet", badge: "Browser Extension", logo: "/wallets/coinbase.png", rdns: "com.coinbase.wallet", installUrl: "https://www.coinbase.com/wallet", delay: 0.1 },
  { id: "rainbow", name: "Rainbow", badge: "Browser Extension", logo: "/wallets/rainbow.png", rdns: "me.rainbow", installUrl: "https://rainbow.me/extension", delay: 0.2 },
];

const MOBILE_WALLETS = [
  { id: "metamask-mobile",   name: "MetaMask",       badge: "Tap to open app", logo: "/wallets/metamask.svg",  delay: 0 },
  { id: "coinbase-mobile",   name: "Coinbase Wallet", badge: "Tap to open app", logo: "/wallets/coinbase.png",  delay: 0.1 },
  { id: "rainbow-mobile",    name: "Rainbow",        badge: "Tap to open app", logo: "/wallets/rainbow.png",   delay: 0.2 },
];

function WalletButton({
  logo, name, badge, onClick, loading = false, delay = 0, extraIcon,
}: {
  logo: string; name: string; badge: string; onClick: () => void; loading?: boolean; delay?: number; extraIcon?: React.ReactNode;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onClick={loading ? undefined : onClick}
      disabled={loading}
      className="group relative w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 ease-[0.16,1,0.3,1] text-[#050505] dark:text-white disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#FAFAF8] dark:bg-[#1A1A1A] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1] z-0" />
      <div className="relative z-10 w-10 h-10 rounded-xl bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-white/10 shadow-sm flex items-center justify-center p-2 group-hover:scale-105 transition-all duration-500 shrink-0">
        <img src={logo} alt={name} className="w-full h-full object-contain filter group-hover:drop-shadow-md transition-all duration-500" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
      </div>
      <div className="relative z-10 flex-1 text-left min-w-0">
        <p className="text-[12px] font-black uppercase tracking-widest truncate text-[#050505] dark:text-white transition-colors duration-300">
          {loading ? "Connecting…" : name}
        </p>
        <p className="text-[9px] font-mono text-[#888888] dark:text-[#AAAAAA] uppercase tracking-[0.2em] mt-0.5 truncate transition-colors duration-300">
          {badge}
        </p>
      </div>
      <div className="relative z-10">
        {loading ? (
          <Loader2 size={16} className="animate-spin text-black dark:text-white shrink-0" />
        ) : extraIcon ? (
          <span className="text-black/30 dark:text-white/30 group-hover:text-black dark:group-hover:text-white transition-colors duration-300 shrink-0">{extraIcon}</span>
        ) : (
          <ArrowRight size={16} className="text-black/30 dark:text-white/30 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-1 transition-all duration-300 shrink-0" />
        )}
      </div>
    </motion.button>
  );
}

export default function ConnectPage() {
  const isMobile = useIsMobile();
  const { isConnected, address, connector } = useAccount();
  const { connect, connectors, isPending, isError, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { open: openAppKit } = useAppKit();
  const { isLinked, setLinked } = useUIStore();

  const [mounted, setMounted] = useState(false);
  const [qrSession, setQrSession] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<"IDLE" | "AWAITING" | "SYNCED" | "ERROR">("IDLE");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [showMobileScanner, setShowMobileScanner] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  useEffect(() => {
    if (!isError || !error) return;
    setPendingId(null);
    const msg = error.message ?? "Unknown error";

    if (msg.toLowerCase().includes("already connected") || msg.toLowerCase().includes("connector already")) return;

    const isNotFound = msg.toLowerCase().includes("provider not found") || msg.toLowerCase().includes("not installed") || msg.toLowerCase().includes("no injected");
    const isRejected = msg.toLowerCase().includes("user rejected") || msg.toLowerCase().includes("rejected");

    if (isNotFound) {
      toast.error("Extension missing", { description: "Wallet browser extension is required.", action: { label: "Install", onClick: () => window.open("https://metamask.io/download/", "_blank") }, duration: 7000 });
    } else if (isRejected) {
      toast.error("Signature rejected", { description: "The cryptographic handshake was aborted." });
    } else {
      toast.error("Handshake Failed", { description: msg });
    }
  }, [isError, error]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const hasCookie = document.cookie.split("; ").some((r) => r.startsWith("sovereign_handshake="));
      const hasLocal = localStorage.getItem("sovereign_session_v2");
      if (hasCookie || hasLocal) setLinked(true);
    }
  }, [setLinked]);

  const [ephemeral, setEphemeral] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const [qrData, setQrData] = useState('');

  const initEphemeral = useCallback(async () => {
    try {
      const { generateX25519KeyPair } = await import('@/lib/web-crypto');
      const pair = await generateX25519KeyPair();
      setEphemeral(pair);
      
      const sessId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('') + '-' + Date.now().toString(36);
      setQrSession(sessId);

      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://whalealert.network';
      const expiresAt = Date.now() + 300000;
      const qrUrl = new URL('/connect', origin);
      qrUrl.searchParams.set('uuid', sessId);
      qrUrl.searchParams.set('pub', encodeURIComponent(pair.publicKey));
      qrUrl.searchParams.set('ecdh', pair.isECDH ? '1' : '0');
      qrUrl.searchParams.set('exp', String(expiresAt));
      setQrData(qrUrl.toString());
      setSyncStatus("AWAITING");

      const refreshTimer = setTimeout(() => {
        setQrSession(null);
        setSyncStatus("IDLE");
      }, 270000); 
      return () => clearTimeout(refreshTimer);

    } catch (e: any) {
      setErrorMessage(e.message || "Failed to initialize Web Crypto API.");
      setSyncStatus("ERROR");
    }
  }, []);

  useEffect(() => { if (!qrSession && mounted) initEphemeral(); }, [qrSession, initEphemeral, mounted]);

  useEffect(() => {
    if (!qrSession || !ephemeral || syncStatus === "SYNCED") return;
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/qr-poll?uuid=${qrSession}&t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        
        if (data.encryptedPayload || data.serverJwt) {
          setSyncStatus("SYNCED");
          clearInterval(poll);
          let jwt: string | null = null;

          if (data.encryptedPayload && data.iv) {
            try {
              const { deriveSharedSecret, decryptAESGCM } = await import('@/lib/web-crypto');
              let isECDHFlag = false;
              try {
                isECDHFlag = new URL(qrData).searchParams.get('ecdh') === '1';
              } catch {
                try { isECDHFlag = JSON.parse(qrData).isECDH ?? false; } catch {}
              }
              const mobilePub = data.mobilePub;
              if (mobilePub) {
                const shared = await deriveSharedSecret(ephemeral.privateKey, mobilePub, isECDHFlag);

                // ── [EXPERT-SYNC] Push Identity & Vault to Mobile ─────────────────
                const addressToUse = jwt ? address : (isConnected ? address : null);
                if (addressToUse) {
                  const seedKey = `whale_chat_seed_${addressToUse.toLowerCase()}`;
                  const localSeed = localStorage.getItem(seedKey);
                  const VAULT_KEY = "sovereign_vault_v1";
                  const localVault = localStorage.getItem(VAULT_KEY);

                  if (localSeed || localVault) {
                    const { encryptAESGCM } = await import('@/lib/web-crypto');
                    
                    const syncPayload = {
                      seed: localSeed,
                      vault: localVault
                    };
                    
                    const encryptedSync = await encryptAESGCM(shared, JSON.stringify(syncPayload));
                    
                    fetch('/api/auth/qr-sync-seed', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        uuid: qrSession,
                        encryptedSeed: encryptedSync.encryptedPayload,
                        iv: encryptedSync.iv,
                        tag: encryptedSync.tag
                      })
                    }).catch(e => console.warn("[Sovereign:Sync] Identity push failed:", e));
                  }
                }

                if (data.encryptedPayload && data.iv) {
                  const decrypted = await decryptAESGCM(shared, data.encryptedPayload, data.iv);
                  if (decrypted && decrypted.split('.').length === 3) jwt = decrypted;
                }
              }
            } catch (err) {}
          }

          if (!jwt && data.serverJwt) {
            try {
              const { verifyJWT } = await import('@/lib/jwt');
              await verifyJWT(data.serverJwt);
              jwt = data.serverJwt;
            } catch (err) {}
          }

          if (!jwt) { setSyncStatus("ERROR"); return; }
          
          // [KYC-SYNC-WAIT]
          if (!data.kycVerified) {
            return;
          }

          const hydrateRes = await fetch('/api/auth/qr-hydrate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jwt }) });
          if (hydrateRes.ok) window.location.replace("/dashboard");
          else setSyncStatus("ERROR");
        }
      } catch (err) {}
    }, 1000);
    return () => clearInterval(poll);
  }, [qrSession, ephemeral, qrData, syncStatus]);

  useEffect(() => {
    if (!mounted) return;

    if (!isConnected || !address) return;
    try { if (sessionStorage.getItem("__disconnected__") === "1") { sessionStorage.removeItem("__disconnected__"); return; } } catch {}

    // Enforce cryptographic handshake on desktop
    if (!isSigning) {
      setIsSigning(true);
      const norm = address.toLowerCase();
      const message = [
        '═══════════════════════════════',
        '  Whale Alert Network',
        '  SOVEREIGN ACCESS HANDSHAKE',
        '═══════════════════════════════',
        '',
        `Identity: ${norm}`,
        `Nonce: ${Date.now()}`,
        `Network: WHALE_ALERT_NETWORK_V1`,
        '',
        'By signing you confirm that',
        'you are the sole owner of this',
        'address and authorize access',
        'to the secure dashboard.',
        '═══════════════════════════════',
      ].join('\n');

      let signaturePromise;
      let isFreshSign = false;
      const cachedSignature = localStorage.getItem(`sovereign_sig_${norm}`);
      if (cachedSignature) {
        signaturePromise = Promise.resolve(cachedSignature);
        isFreshSign = false;
      } else {
        isFreshSign = true;
        // Delay signature request slightly to allow wallet provider to settle after connection
        signaturePromise = new Promise(resolve => setTimeout(resolve, 500))
          .then(() => signMessageAsync({ message }))
          .then(sig => {
             localStorage.setItem(`sovereign_sig_${norm}`, sig);
             return sig;
          });
      }

      signaturePromise
        .then(async (signature) => {
          document.cookie = `sovereign_handshake=${norm}; path=/; max-age=604800; SameSite=Lax`;
          try {
            localStorage.setItem('sovereign_session_v2', JSON.stringify({
              address: norm,
              exp: Date.now() + 30 * 24 * 60 * 60 * 1000,
            }));
            
            // ── [1-SIGNATURE BRIDGE] Derive XMTP Seed from Handshake ──
            const { keccak256 } = await import('viem');
            const seed = keccak256(signature as `0x${string}`);
            localStorage.setItem(`whale_chat_seed_${norm}`, seed);
            
          } catch (e) {
            console.error("Failed to store session artifacts", e);
          }
          
          setLinked(true);
          setIsSigning(false);
          
          if (isFreshSign) {
            window.location.replace("/dashboard");
          } else {
            window.location.replace("/");
          }
        })
        .catch((err) => {
          console.error("Handshake failed", err);
          setIsSigning(false);
          disconnect();
        });
      return;
    }
  }, [isConnected, address, connector, mounted, isLinked, setLinked, isSigning, signMessageAsync, disconnect]);

  const handleDesktopWallet = useCallback((walletId: string, rdns: string | null, installUrl: string | null) => {
    setPendingId(walletId);
    if (!rdns) { openAppKit(); setPendingId(null); return; }
    let connector = connectors.find((c: any) => c.id === rdns) || connectors.find((c) => c.name.toLowerCase().includes(walletId.toLowerCase())) || connectors.find((c) => c.id === "injected" || (c as any).type === "injected");
    if (connector) connect({ connector });
    else {
      setPendingId(null);
      if (installUrl) toast.error("Extension missing", { action: { label: "Install", onClick: () => window.open(installUrl, "_blank") } });
    }
  }, [connect, connectors, openAppKit]);

  const handleMobileWallet = useCallback(() => {
    try { localStorage.setItem('sovereign_pending_wakeup', '1'); } catch {}
    openAppKit();
  }, [openAppKit]);

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center bg-transparent relative">
      <div className="relative z-10 w-full flex flex-col justify-center items-center px-4 py-8 sm:p-12 min-h-0">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className={`w-full max-w-6xl mx-auto rounded-[32px] overflow-hidden bg-white/70 dark:bg-[#0A0A0A]/70 backdrop-blur-[40px] border border-black/5 dark:border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.06)] dark:shadow-none flex flex-col lg:flex-row relative`}
        >
          {/* Subtle reflection lines for frosted glass effect */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white dark:via-white/20 to-transparent opacity-80" />

          {/* ── LEFT: Whale Chat Marketing ── */}
          <div className="flex-1 p-8 sm:p-14 lg:p-20 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-black/5 dark:border-white/10 bg-[#FAFAF8]/50 dark:bg-[#111111]/50 relative overflow-hidden group">
            {/* Soft decorative background element */}
            <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,rgba(0,192,118,0.05)_0%,transparent_60%)] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative z-10">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-md shadow-sm mb-8">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#050505] dark:text-white flex items-center gap-2">
                        <MessageCircle size={14} className="text-[#050505] dark:text-white" />
                        Available now, Whale Chat !
                    </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.9] text-[#050505] dark:text-white mb-6">
                    Encrypted <br/><span className="text-black/30 dark:text-white/30">P2P Network</span>
                </h1>
                
                <p className="text-sm font-medium text-[#050505]/60 dark:text-[#AAAAAA] leading-relaxed max-w-md">
                    Connect securely through the immutable Whale Chat protocol. E2E encryption powered by XMTP, ensuring perfect secrecy and zero central points of failure.
                </p>
            </div>

            <div className="relative z-10 mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white/60 dark:bg-[#1A1A1A]/60 border border-black/5 dark:border-white/5 backdrop-blur-sm shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-[#222] transition-all">
                    <Shield size={18} className="text-[#050505] dark:text-white mb-3" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-[#050505] dark:text-white mb-1">Zero-Knowledge</h3>
                    <p className="text-[10px] font-mono text-[#888888] leading-relaxed">Cryptographic proof without revealing the underlying data.</p>
                </div>
                <div className="p-5 rounded-2xl bg-white/60 dark:bg-[#1A1A1A]/60 border border-black/5 dark:border-white/5 backdrop-blur-sm shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-[#222] transition-all">
                    <MessageCircle size={18} className="text-[#050505] dark:text-white mb-3" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-[#050505] dark:text-white mb-1">XMTP Native</h3>
                    <p className="text-[10px] font-mono text-[#888888] leading-relaxed">Cross-chain persistent messaging secured by wallet identity.</p>
                </div>
            </div>
          </div>

          {/* ── RIGHT: Injection Portal ── */}
          <div className="flex-1 p-8 sm:p-14 lg:p-20 flex flex-col bg-white/40 dark:bg-black/40 items-center justify-center relative">
            <div className="w-full flex flex-col h-full max-w-sm mx-auto">
              <h2 className="text-[26px] sm:text-[32px] font-black uppercase tracking-tighter leading-[0.9] mb-4 text-[#050505] dark:text-white text-center">
                Access <br/><span className="text-black/30 dark:text-white/30">Portal</span>
              </h2>

              {mounted && !isConnected && (
                <div className="flex items-center justify-center gap-3 mb-10 border-b border-black/5 dark:border-white/10 pb-6">
                  {isMobile ? <Smartphone size={14} className="text-[#050505]/40 dark:text-white/40" /> : <Monitor size={14} className="text-[#050505]/40 dark:text-white/40" />}
                  <span className="text-[9px] font-mono uppercase tracking-[0.4em] text-[#050505]/40 dark:text-white/40 text-center">
                    {isMobile ? "Mobile Native Injection" : "Desktop Extension Gateway"}
                  </span>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────── */}
              {/* SPECTACULAR LIGHT-MODE WELCOME SEQUENCE                 */}
              {/* ─────────────────────────────────────────────────────── */}
              {mounted && (isConnected || isLinked) ? (
                <motion.div
                  key="spectacular-welcome"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center justify-center gap-8 flex-1 py-4"
                >
                  <div className="w-full max-w-[100px] aspect-square rounded-full border border-black/5 dark:border-white/10 bg-white dark:bg-[#111111] shadow-[0_20px_60px_rgba(0,0,0,0.05)] dark:shadow-none flex items-center justify-center overflow-hidden mb-2 relative group">
                    <div className="absolute inset-0 bg-[#FAFAF8] dark:bg-[#1A1A1A] opacity-50" />
                    <CheckCircle size={40} className="text-emerald-500 z-10" />
                    <div className="absolute inset-0 border-[2px] border-emerald-500/20 rounded-full [border-style:dashed]" />
                  </div>

                  <div className="flex flex-col items-center text-center space-y-4">
                    <h2 className="text-3xl font-black uppercase tracking-tighter leading-none text-[#050505] dark:text-white">
                      {isLinked ? "Session Verified" : "Awaiting Signature"}
                    </h2>
                    <p className="text-[12px] font-medium text-[#050505]/60 dark:text-[#AAAAAA] leading-relaxed max-w-[280px]">
                      {isLinked 
                        ? "Cryptographic attestation resolved. Welcome to the Terminal."
                        : "Your wallet is connected. Please sign the attestation in your wallet."}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-3 w-full mt-4">
                    {!isLinked ? (
                      <button
                        onClick={() => {
                          setIsSigning(false); // Reset to re-trigger auto sign
                          toast.info("Retrying handshake...");
                        }}
                        className="px-8 py-5 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest rounded-[20px] hover:scale-[1.02] active:scale-[0.98] transition-all w-full shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex items-center justify-center gap-3"
                      >
                        <Shield size={18} />
                        Retry Handshake
                      </button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <motion.div
                          className="w-2 h-2 rounded-full bg-black/60 dark:bg-white/60"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 rounded-full bg-black/60 dark:bg-white/60"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 rounded-full bg-black/60 dark:bg-white/60"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>

              ) : !mounted ? (
                /* ── SKELETON ── */
                <div className="flex flex-col gap-4 flex-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-full h-[72px] rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
                  ))}
                </div>

              ) : isMobile ? (
                /* ── MOBILE CONNECT ── */
                <div className="flex flex-col gap-4 flex-1">
                  {MOBILE_WALLETS.map((w) => (
                    <WalletButton key={w.id} logo={w.logo} name={w.name} badge={w.badge} onClick={handleMobileWallet} loading={isPending && pendingId === w.id} delay={w.delay} extraIcon={<ExternalLink size={16} />} />
                  ))}
                  <button
                    onClick={() => setShowMobileScanner(true)}
                    className="w-full flex items-center justify-center gap-3 py-4 mt-2 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#111111] shadow-sm font-black uppercase tracking-[0.2em] text-[11px] text-[#050505] dark:text-white active:scale-[0.97] transition-all hover:border-black/30 dark:hover:border-white/30"
                  >
                    <ScanLine size={16} />
                    Scan QR
                  </button>
                </div>

              ) : (
                /* ── DESKTOP CONNECT ── */
                <div className="flex flex-col gap-3 flex-1 w-full">
                  {qrData && syncStatus === "AWAITING" && (
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-white dark:bg-black rounded-2xl border border-black/10 dark:border-white/10 shadow-sm flex flex-col items-center">
                        <QRCode value={qrData} size={140} fgColor="#050505" bgColor="transparent" className="dark:hidden mb-2" />
                        <QRCode value={qrData} size={140} fgColor="#ffffff" bgColor="transparent" className="hidden dark:block mb-2" />
                        <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-[#050505]/40 dark:text-white/40 text-center">Sync Whale Mobile</span>
                      </div>
                    </div>
                  )}
                  {DESKTOP_WALLETS.map((w) => (
                    <WalletButton key={w.id} logo={w.logo} name={w.name} badge={w.badge} onClick={() => handleDesktopWallet(w.id, w.rdns, w.installUrl)} loading={isPending && pendingId === w.id} delay={w.delay} />
                  ))}
                  
                  <button
                    onClick={() => openAppKit({ view: 'Connect' })}
                    className="w-full flex items-center justify-center gap-3 py-4 mt-1 rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] font-black uppercase tracking-[0.2em] text-[10px] text-[#050505]/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                  >
                    <ScanLine size={14} />
                    WalletConnect / QR Scan
                  </button>
                </div>
              )}

              {/* Security note */}
              {mounted && !isConnected && (
                <div className="mt-10 p-5 rounded-2xl flex items-start gap-4 bg-[#FAFAF8] dark:bg-[#1A1A1A] border border-black/5 dark:border-white/10">
                  <Lock size={16} className="text-[#050505]/30 dark:text-white/30 shrink-0" />
                  <p className="text-[9px] text-[#050505]/50 dark:text-[#AAAAAA] font-mono leading-relaxed uppercase tracking-[0.15em]">
                    Identity attested via verified ECDSA. No passwords. Direct cryptographic sovereignty.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Mobile QR Scanner Modal ── */}
      {isMobile && mounted && (
        <DynamicQRScannerModal
          isOpen={showMobileScanner}
          onClose={() => setShowMobileScanner(false)}
          address={address ?? ""}
          onScan={(_result: string) => {
            setShowMobileScanner(false);
            const toast = document.createElement('div');
            toast.className = 'fixed top-6 left-4 right-4 z-[99999] bg-[#050505] text-white text-[11px] font-black uppercase tracking-[0.3em] px-6 py-5 rounded-[20px] shadow-[0_20px_40px_rgba(0,0,0,0.3)] text-center';
            toast.textContent = 'SESSION SYNCHRONIZED';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
          }}
        />
      )}

      {/* Footer */}
      <footer className="relative z-[100] px-5 sm:px-8 py-5 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 bg-[#FDFCF8]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img
            src="/official-whale-monochrome.png"
            className="w-4 h-4 opacity-30 grayscale"
            alt=""
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#050505]/35">© 2026 Whale Alert Network</span>
        </div>
        <div className="flex items-center gap-5">
          <a href="https://twitter.com/WhaleAlert" target="_blank" rel="noopener noreferrer" className="text-[#050505]/30 hover:text-[#050505] transition-colors">
            <Twitter size={15} />
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[#050505]/30 hover:text-[#050505] transition-colors">
            <Github size={15} />
          </a>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-[8px] font-mono text-emerald-600 uppercase tracking-[0.25em] font-bold">Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
