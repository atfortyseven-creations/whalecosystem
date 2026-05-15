"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { useUIStore } from "@/lib/store/ui-store";
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
  ScanLine,
  Lock,
  Cpu,
  Activity
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
      className="group relative w-full flex items-center gap-4 p-5 rounded-[20px] transition-all duration-500 ease-[0.16,1,0.3,1] text-[#050505] disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-[#E5E5E5] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-black/20 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#FAFAF8] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1] z-0" />
      <div className="relative z-10 w-11 h-11 rounded-xl bg-white border border-[#E5E5E5] shadow-sm flex items-center justify-center p-2 group-hover:scale-105 group-hover:border-black/10 transition-all duration-500 shrink-0">
        <img src={logo} alt={name} className="w-full h-full object-contain filter group-hover:drop-shadow-md transition-all duration-500" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
      </div>
      <div className="relative z-10 flex-1 text-left min-w-0">
        <p className="text-[13px] font-black uppercase tracking-widest truncate text-[#050505] group-hover:text-black transition-colors duration-300">
          {loading ? "Connecting…" : name}
        </p>
        <p className="text-[10px] font-mono text-[#050505]/40 uppercase tracking-[0.2em] mt-1 truncate group-hover:text-[#050505]/60 transition-colors duration-300">
          {badge}
        </p>
      </div>
      <div className="relative z-10">
        {loading ? (
          <Loader2 size={16} className="animate-spin text-black shrink-0" />
        ) : extraIcon ? (
          <span className="text-black/30 group-hover:text-black transition-colors duration-300 shrink-0">{extraIcon}</span>
        ) : (
          <ArrowRight size={16} className="text-black/30 group-hover:text-black group-hover:translate-x-1 transition-all duration-300 shrink-0" />
        )}
      </div>
    </motion.button>
  );
}

export default function ConnectPage() {
  const isMobile = useIsMobile();
  const { isConnected, address } = useAccount();
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
                // We push both the XMTP seed and the Sovereign Vault (if they exist)
                // to allow the mobile device to operate with zero signatures.
                const addressToUse = jwt ? address : (isConnected ? address : null);
                if (addressToUse) {
                  const seedKey = `whale_chat_seed_${addressToUse.toLowerCase()}`;
                  const localSeed = localStorage.getItem(seedKey);
                  const VAULT_KEY = "sovereign_vault_v1";
                  const localVault = localStorage.getItem(VAULT_KEY);

                  if (localSeed || localVault) {
                    console.log("[Sovereign:Sync] Pushing identity & vault to mobile...");
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
          // We wait for kycVerified to be true in the session data before final redirection.
          if (!data.kycVerified) {
            console.log("[Sovereign:Sync] Wallet synced. Awaiting biometric attestation...");
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

    if (isLinked) {
      setPendingId(null);
      // Immediate redirect for production-grade speed
      window.location.replace("/dashboard");
      return;
    }

    if (!isConnected || !address) return;
    try { if (sessionStorage.getItem("__disconnected__") === "1") { sessionStorage.removeItem("__disconnected__"); return; } } catch {}

    // Enforce cryptographic handshake on desktop to match mobile and derive seed
    if (!isSigning) {
      console.log("[Sovereign] Initiating desktop handshake...");
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
      const cachedSignature = localStorage.getItem(`sovereign_sig_${norm}`);
      if (cachedSignature) {
        signaturePromise = Promise.resolve(cachedSignature);
      } else {
        signaturePromise = signMessageAsync({ message }).then(sig => {
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
          
          // ── Instant Redirect (No manual reload required) ──
          window.location.replace("/dashboard");
        })
        .catch((err) => {
          console.error("Handshake failed", err);
          setIsSigning(false);
          disconnect();
        });
      return;
    }
  }, [isConnected, address, mounted, isLinked, setLinked, isSigning, signMessageAsync, disconnect]);

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
    <div className="min-h-screen w-full flex flex-col font-mono overflow-auto bg-[#FDFCF8] text-[#050505] selection:bg-[#050505] selection:text-white relative">
      
      {/* ── Immersive Light Mode Architectural Background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
        {/* Precision Blueprint Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        {/* Vignette & Soft lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#FDFCF8_100%)] z-10 opacity-80" />
      </div>

      <main className="flex-1 relative z-10 flex flex-col justify-center items-center p-4 py-12 md:p-8 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className={`w-full my-auto ${mounted && isConnected ? 'max-w-2xl grid grid-cols-1' : 'max-w-5xl grid grid-cols-1 lg:grid-cols-2'} rounded-[40px] overflow-hidden bg-white/70 backdrop-blur-3xl border border-black/5 shadow-[0_30px_80px_rgba(0,0,0,0.06)] relative`}
        >
          {/* Subtle reflection lines for frosted glass effect */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-black/5 to-transparent opacity-30" />

          {/* ── LEFT: QR Matrix ── */}
          {!(mounted && isConnected) && (
          <div className="relative p-10 lg:p-16 flex flex-col overflow-hidden border-b lg:border-b-0 lg:border-r border-black/5 bg-[#FAFAF8]/50">
            <div className="relative z-10 flex flex-col h-full">
              <div className="inline-flex self-start mb-6">
                <h2 className="text-[32px] font-black uppercase tracking-tighter leading-[0.9] text-[#050505]">
                  Secure <br/><span className="text-black/30">Sync</span>
                </h2>
              </div>
              <p className="text-[9px] font-mono text-[#050505]/40 uppercase tracking-[0.4em] mb-12 border-l border-black/20 pl-4 py-1">
                Encrypted Session Synchronization
              </p>

              <div className="flex flex-col items-center gap-8 flex-1 justify-center">
                <div className="p-8 bg-white rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-black/5 flex flex-col items-center relative group">
                  <div className="relative z-10">
                    <AnimatePresence mode="wait">
                      {syncStatus === "ERROR" ? (
                        <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-[180px] h-[180px] flex flex-col items-center justify-center text-red-500 text-center">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2">Decryption Failure</span>
                          <span className="text-[9px] font-mono leading-tight opacity-70">{errorMessage}</span>
                        </motion.div>
                      ) : qrSession && mounted ? (
                        <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="bg-white">
                          <QRCode value={qrData} size={180} level="H" bgColor="#FFFFFF" fgColor="#050505" />
                        </motion.div>
                      ) : (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-[180px] h-[180px] flex items-center justify-center">
                          <Loader2 size={32} className="animate-spin text-black/20" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {qrSession && mounted && (
                    <div className="mt-8 flex flex-col items-center text-center gap-1 z-10 w-full">
                      <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#050505]/50">
                        Scan with native camera
                      </span>
                      <div className="mt-6 flex flex-col items-start text-left gap-4 w-full max-w-[280px]">
                        <div className="flex items-center gap-4 group/item w-full p-2 rounded-xl hover:bg-black/5 transition-colors">
                          <span className="text-[9px] font-mono bg-black/5 text-[#050505] w-6 h-6 flex items-center justify-center rounded-full border border-black/10 group-hover/item:bg-black group-hover/item:text-white transition-colors">1</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#050505]/70">Activate native camera</span>
                        </div>
                        <div className="flex items-center gap-4 group/item w-full p-2 rounded-xl hover:bg-black/5 transition-colors">
                          <span className="text-[9px] font-mono bg-black/5 text-[#050505] w-6 h-6 flex items-center justify-center rounded-full border border-black/10 group-hover/item:bg-black group-hover/item:text-white transition-colors">2</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#050505]/70">Scan QR code</span>
                        </div>
                        <div className="flex items-center gap-4 group/item w-full p-2 rounded-xl hover:bg-black/5 transition-colors">
                          <span className="text-[9px] font-mono bg-black/5 text-[#050505] w-6 h-6 flex items-center justify-center rounded-full border border-black/10 group-hover/item:bg-black group-hover/item:text-white transition-colors">3</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#050505]/70">Acknowledge signature</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2.5 h-6">
                  <AnimatePresence mode="wait">
                    {syncStatus === "SYNCED" && (
                      <motion.div key="ok" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Synced — Entering Terminal</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {qrSession && (
                  <button onClick={() => { setQrSession(null); setSyncStatus("IDLE"); }}
                    className="text-[9px] font-mono text-[#050505]/30 hover:text-[#050505] uppercase tracking-[0.4em] transition-colors">
                    Refresh QR
                  </button>
                )}
              </div>
            </div>
          </div>
          )}

          {/* ── RIGHT: Injection Portal ── */}
          <div className="relative p-10 lg:p-16 flex flex-col bg-white/40">
            <div className="relative z-10 flex flex-col h-full">

              <h2 className="text-[32px] font-black uppercase tracking-tighter leading-[0.9] mb-4 text-[#050505]">
                Authentication <br/><span className="text-black/30">Portal</span>
              </h2>

              {mounted && !isConnected && (
                <div className="flex items-center gap-3 mb-10 border-b border-black/5 pb-6">
                  {isMobile ? <Smartphone size={14} className="text-[#050505]/40" /> : <Monitor size={14} className="text-[#050505]/40" />}
                  <span className="text-[9px] font-mono uppercase tracking-[0.4em] text-[#050505]/40">
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
                  className="flex flex-col items-center justify-center gap-10 flex-1 py-8 px-4"
                >
                  <div className="w-full max-w-[120px] aspect-square rounded-full border border-black/5 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.05)] flex items-center justify-center overflow-hidden mb-2 relative group">
                    <div className="absolute inset-0 bg-[#FAFAF8] opacity-50" />
                    <CheckCircle size={48} className="text-emerald-500 z-10" />
                    <div className="absolute inset-0 border-[2px] border-emerald-500/20 rounded-full [border-style:dashed]" />
                  </div>

                  <div className="flex flex-col items-center text-center space-y-5 max-w-md">
                    <h2 className="text-5xl font-black uppercase tracking-tighter leading-none text-[#050505]">
                      {isLinked ? "Session Verified" : "Awaiting Signature"}
                    </h2>
                    <p className="font-serif text-[15px] leading-relaxed text-[#050505]/60 font-medium">
                      {isLinked 
                        ? "Cryptographic attestation perfectly resolved. Your session is now verified. Welcome to the Sovereign Terminal."
                        : "Your wallet is connected. Please sign the cryptographic attestation in your wallet to verify your session."}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-3 px-6 py-4 bg-white border border-black/5 rounded-2xl shadow-sm">
                       <CheckCircle size={16} className="text-emerald-500" />
                       <span className="text-[11px] font-mono font-black uppercase tracking-[0.3em] text-[#050505]">
                         {address?.slice(0,6)}...{address?.slice(-4)} Verified
                       </span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col items-center gap-4 w-full max-w-[320px] min-h-[100px] justify-center">
                    {!isLinked ? (
                      <button
                        onClick={() => {
                          setIsSigning(false); // Reset to re-trigger auto sign
                        }}
                        className="px-8 py-4 bg-black text-white font-black uppercase tracking-widest rounded-xl hover:bg-black/80 transition-colors w-full"
                      >
                        Sign Message
                      </button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <motion.div
                          className="w-2 h-2 rounded-full bg-black/60"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 rounded-full bg-black/60"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 rounded-full bg-black/60"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    )}
                  </div>

                  {isMobile && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                      className="mt-6 pt-6 border-t border-black/5 w-full flex flex-col items-center gap-4"
                    >
                      <button
                        onClick={() => setShowMobileScanner(true)}
                        className="w-full flex items-center justify-center gap-3 py-4 rounded-xl border border-black/10 bg-white shadow-sm font-black uppercase tracking-[0.2em] text-[11px] text-[#050505] active:scale-[0.97] transition-all hover:border-black/30"
                      >
                        <ScanLine size={16} />
                        Scan QR to Sync
                      </button>
                    </motion.div>
                  )}
                </motion.div>

              ) : !mounted ? (
                /* ── SKELETON ── */
                <div className="flex flex-col gap-4 flex-1 mt-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="w-full h-[84px] rounded-[20px] bg-black/5" />
                  ))}
                </div>

              ) : isMobile ? (
                /* ── MOBILE CONNECT ── */
                <div className="flex flex-col gap-4 flex-1 mt-4">
                  {MOBILE_WALLETS.map((w) => (
                    <WalletButton key={w.id} logo={w.logo} name={w.name} badge={w.badge} onClick={handleMobileWallet} loading={isPending && pendingId === w.id} delay={w.delay} extraIcon={<ExternalLink size={16} />} />
                  ))}
                </div>

              ) : (
                /* ── DESKTOP CONNECT ── */
                <div className="flex flex-col gap-4 flex-1 mt-4">
                  {DESKTOP_WALLETS.map((w) => (
                    <WalletButton key={w.id} logo={w.logo} name={w.name} badge={w.badge} onClick={() => handleDesktopWallet(w.id, w.rdns, w.installUrl)} loading={isPending && pendingId === w.id} delay={w.delay} />
                  ))}
                </div>
              )}

              {/* Security note */}
              {mounted && !isConnected && (
                <div className="mt-10 p-6 rounded-[24px] flex items-start gap-4 bg-[#FAFAF8] border border-black/5">
                  <Lock size={20} className="text-[#050505]/30 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-[#050505]/50 font-mono leading-relaxed uppercase tracking-[0.15em]">
                    Secure architecture. Identity attested via strictly verified ECDSA. No local passwords. Direct cryptographic sovereignty.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>

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
      <footer className="relative z-[100] px-8 py-6 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 bg-[#FDFCF8]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <img
            src="/official-whale-monochrome.png"
            className="w-5 h-5 opacity-40 grayscale"
            alt=""
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#050505]/40">© 2026 Whale Alert Network</span>
        </div>
        <div className="flex items-center gap-8">
          <a href="https://twitter.com/WhaleAlert" target="_blank" rel="noopener noreferrer" className="text-[#050505]/40 hover:text-[#050505] transition-colors">
            <Twitter size={18} />
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[#050505]/40 hover:text-[#050505] transition-colors">
            <Github size={18} />
          </a>
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#050505]/40">Status: Operational</span>
            <span className="text-[8px] font-mono text-emerald-600 uppercase tracking-[0.3em] font-bold">L1/L2 Ingress Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
