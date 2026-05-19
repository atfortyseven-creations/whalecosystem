"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { useUIStore } from "@/lib/store/ui-store";
import { toast } from "sonner";
import { RemoteLottie } from '@/components/ui/RemoteLottie';
import { QRCodeSVG } from 'qrcode.react';
import { useSovereignSignOut } from '@/hooks/useSovereignSignOut';

import {
  ArrowRight,
  Loader2,
  ExternalLink,
  Smartphone,
  Monitor,
  ScanLine,
  Lock,
  Shield,
  CheckCircle,
  MessageSquare,
} from "lucide-react";

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
  { id: "coinbase", name: "Coinbase Wallet", badge: "Browser Extension", logo: "/wallets/coinbase.png", rdns: "com.coinbase.wallet", installUrl: "https://www.coinbase.com/wallet", delay: 0.08 },
  { id: "rainbow", name: "Rainbow", badge: "Browser Extension", logo: "/wallets/rainbow.png", rdns: "me.rainbow", installUrl: "https://rainbow.me/extension", delay: 0.16 },
];

const MOBILE_WALLETS = [
  { id: "metamask-mobile", name: "MetaMask", badge: "Tap to open app", logo: "/wallets/metamask.svg", delay: 0 },
  { id: "coinbase-mobile", name: "Coinbase Wallet", badge: "Tap to open app", logo: "/wallets/coinbase.png", delay: 0.08 },
  { id: "rainbow-mobile", name: "Rainbow", badge: "Tap to open app", logo: "/wallets/rainbow.png", delay: 0.16 },
];

function WalletButton({ logo, name, badge, onClick, loading = false, delay = 0, extraIcon }: {
  logo: string; name: string; badge: string; onClick: () => void; loading?: boolean; delay?: number; extraIcon?: React.ReactNode;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onClick={loading ? undefined : onClick}
      disabled={loading}
      className="group relative w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 bg-white border border-[#E8E8E8] shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-[#D0D0D0] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#FAFAF8] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1] z-0" />
      <div className="relative z-10 w-10 h-10 rounded-lg bg-white border border-[#E8E8E8] flex items-center justify-center p-2 shrink-0">
        <img src={logo} alt={name} className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
      </div>
      <div className="relative z-10 flex-1 text-left min-w-0">
        <p className="text-[12px] font-black uppercase tracking-widest text-[#0A0A0A] truncate">
          {loading ? "Connecting..." : name}
        </p>
        <p className="text-[10px] font-mono text-black/40 uppercase tracking-[0.2em] mt-0.5 truncate">
          {badge}
        </p>
      </div>
      <div className="relative z-10 shrink-0">
        {loading ? (
          <Loader2 size={16} className="animate-spin text-[#999]" />
        ) : extraIcon ? (
          <span className="text-[#CCC] group-hover:text-[#0A0A0A] transition-colors">{extraIcon}</span>
        ) : (
          <ArrowRight size={16} className="text-[#CCC] group-hover:text-[#0A0A0A] group-hover:translate-x-0.5 transition-all duration-300" />
        )}
      </div>
    </motion.button>
  );
}

export default function ConnectPage() {
  const isMobile = useIsMobile();
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending, isError, error } = useConnect();
  const { signMessageAsync } = useSignMessage();
  const { open: openAppKit } = useAppKit();
  const { isLinked, setLinked } = useUIStore();
  const { nuclearDisconnect } = useSovereignSignOut();

  const [mounted, setMounted] = useState(false);
  const [qrSession, setQrSession] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<"IDLE" | "AWAITING" | "SYNCED" | "ERROR">("IDLE");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [showMobileScanner, setShowMobileScanner] = useState(false);
  const [qrData, setQrData] = useState('');
  const [ephemeral, setEphemeral] = useState<{ publicKey: string; privateKey: string; isECDH?: boolean } | null>(null);
  const redirectingRef = useRef(false);

  useEffect(() => {
    if (!isError || !error) return;
    setPendingId(null);
    const msg = error.message ?? "Unknown error";
    if (msg.toLowerCase().includes("already connected") || msg.toLowerCase().includes("connector already")) return;
    if (msg.toLowerCase().includes("provider not found") || msg.toLowerCase().includes("not installed")) {
      toast.error("Wallet extension not found", { description: "Please install the wallet extension and try again.", action: { label: "Install MetaMask", onClick: () => window.open("https://metamask.io/download/", "_blank") }, duration: 7000 });
    } else if (msg.toLowerCase().includes("user rejected") || msg.toLowerCase().includes("rejected")) {
      toast.error("Connection declined", { description: "The wallet connection was cancelled." });
    } else {
      toast.error("Connection failed", { description: msg });
    }
  }, [isError, error]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const hasCookie = document.cookie.split("; ").some((r) => r.startsWith("sovereign_handshake="));
    const hasLocal = (() => {
      try {
        const raw = localStorage.getItem("sovereign_session_v2");
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        return parsed && parsed.exp && parsed.exp > Date.now();
      } catch { return false; }
    })();
    if (hasCookie || hasLocal) setLinked(true);
  }, [setLinked]);

  const initEphemeral = useCallback(async () => {
    try {
      const { generateX25519KeyPair } = await import('@/lib/web-crypto');
      const pair = await generateX25519KeyPair();
      setEphemeral(pair);
      const sessId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36);
      setQrSession(sessId);
      // [FIX] Origin fallback updated to humanidfi.com to match WalletConnect Cloud registration
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://humanidfi.com';
      const expiresAt = Date.now() + 300000;
      const qrUrl = new URL('/connect', origin);
      qrUrl.searchParams.set('uuid', sessId);
      qrUrl.searchParams.set('pub', encodeURIComponent(pair.publicKey));
      qrUrl.searchParams.set('ecdh', pair.isECDH ? '1' : '0');
      qrUrl.searchParams.set('exp', String(expiresAt));
      setQrData(qrUrl.toString());
      setSyncStatus("AWAITING");
      const t = setTimeout(() => { setQrSession(null); setSyncStatus("IDLE"); }, 270000);
      return () => clearTimeout(t);
    } catch (e: any) {
      setSyncStatus("ERROR");
    }
  }, []);

  useEffect(() => { if (!qrSession && mounted) initEphemeral(); }, [qrSession, initEphemeral, mounted]);

  // QR poll — desktop side: waits for mobile to complete handshake, then hydrates session
  useEffect(() => {
    if (!qrSession || !ephemeral || syncStatus === "SYNCED") return;
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/qr-poll?uuid=${qrSession}&t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();

        // Payload received: either ECDH-encrypted or server-minted JWT
        if (data.encryptedPayload || data.serverJwt) {
          clearInterval(poll);
          let jwt: string | null = null;

          // PATH A: Try to decrypt ECDH-encrypted JWT from mobile
          if (data.encryptedPayload && data.iv && ephemeral && data.mobilePub) {
            try {
              const { deriveSharedSecret, decryptAESGCM } = await import('@/lib/web-crypto');
              let isECDHFlag = false;
              try { isECDHFlag = new URL(qrData).searchParams.get('ecdh') === '1'; } catch {}
              const shared = await deriveSharedSecret(ephemeral.privateKey, data.mobilePub, isECDHFlag);
              const decrypted = await decryptAESGCM(shared, data.encryptedPayload, data.iv);
              if (decrypted && decrypted.split('.').length === 3) jwt = decrypted;
            } catch (decryptErr) {
              console.warn('[QR:Desktop] ECDH decrypt failed, falling back to serverJwt:', decryptErr);
            }
          }

          // PATH B: Fall back to server-minted JWT (most common path for first-time mobile scan)
          if (!jwt && data.serverJwt) {
            try {
              const { verifyJWT } = await import('@/lib/jwt');
              await verifyJWT(data.serverJwt);
              jwt = data.serverJwt;
            } catch (verifyErr) {
              console.warn('[QR:Desktop] serverJwt verification failed:', verifyErr);
            }
          }

          if (!jwt) {
            console.error('[QR:Desktop] No valid JWT obtained from handshake payload.');
            setSyncStatus("ERROR");
            return;
          }

          // ── CRITICAL FIX: Removed `if (!data.kycVerified) return;` ──
          // kycVerified is NEVER set in the qr-mobile-link payload —
          // this guard was silently blocking 100% of QR sessions from hydrating.
          // The JWT contains the wallet address and clearance level, that's sufficient.

          setSyncStatus("SYNCED");

          // Hydrate desktop session with the JWT from mobile
          const hydrateRes = await fetch('/api/auth/qr-hydrate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jwt })
          });

          if (hydrateRes.ok) {
            // Small delay so the SYNCED animation plays before redirect
            await new Promise(r => setTimeout(r, 800));
            window.location.replace("/dashboard");
          } else {
            const errData = await hydrateRes.json().catch(() => ({}));
            console.error('[QR:Desktop] Hydrate failed:', errData);
            setSyncStatus("ERROR");
          }
        }
      } catch (pollErr) {
        console.warn('[QR:Desktop] Poll error (will retry):', pollErr);
      }
    }, 1000);
    return () => clearInterval(poll);
  }, [qrSession, ephemeral, qrData, syncStatus]);

  const { disconnect } = useDisconnect();

  const handleTotalDisconnect = useCallback(() => {
    toast.success("Disconnected & purged all sessions.");
    nuclearDisconnect();
  }, [nuclearDisconnect]);

  // Wallet state transition tracking to clear __disconnected__ ONLY on new user connection
  const prevConnectedRef = useRef(isConnected);
  useEffect(() => {
    if (isConnected && !prevConnectedRef.current) {
      try { sessionStorage.removeItem("__disconnected__"); } catch {}
    }
    prevConnectedRef.current = isConnected;
  }, [isConnected]);

  // [CRITICAL FIX] Wallet connect → SIWE sovereign-verify → then redirect.
  // The old code went directly to /dashboard without calling sovereign-verify,
  // meaning no whale_session/human_session/sovereign_handshake cookie was set.
  // Every subsequent API call to a protected route returned 401.
  const signingRef = useRef(false);
  useEffect(() => {
    if (!mounted || !isConnected || !address) return;
    if (redirectingRef.current || signingRef.current) return;
    try {
      if (sessionStorage.getItem("__disconnected__") === "1") return;
    } catch {}

    signingRef.current = true;

    const runVerify = async () => {
      try {
        // 1. Check if session already valid (returning user)
        const checkRes = await fetch('/api/auth/verify-session', { cache: 'no-store' });
        if (checkRes.ok) {
          const data = await checkRes.json();
          if (data.authenticated) {
            setLinked(true);
            redirectingRef.current = true;
            window.location.replace("/dashboard");
            return;
          }
        }
      } catch {}

      // 2. No session — must SIWE-sign
      try {
        const norm = address.toLowerCase();
        // Check cached sig first
        let signature: string | undefined;
        let message: string | undefined;
        try {
          const cached = localStorage.getItem(`sovereign_auth_${norm}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            signature = parsed.signature;
            message = parsed.message;
          }
        } catch {}

        if (!signature || !message) {
          // Fallback local builder to generate the SIWE message locally
          // since the library module is missing
          const buildLocalSovereignMessage = (address: string) => {
            const domain = typeof window !== 'undefined' ? window.location.host : 'humanidfi.com';
            const origin = typeof window !== 'undefined' ? window.location.origin : 'https://humanidfi.com';
            return `${domain} wants you to sign in with your Ethereum account:\n${address}\n\nSign this message to authenticate securely.\n\nURI: ${origin}\nVersion: 1\nChain ID: 1\nNonce: ${crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()}\nIssued At: ${new Date().toISOString()}`;
          };
          
          message = buildLocalSovereignMessage(norm);
          const msgToSign: string = message;

          // [IOS WALLETCONNECT TIMING FIX]
          // Replicating the MobileLanding fix here: WalletConnect relays on iOS WKWebView
          // need ~1.5s to stabilize after returning from the wallet app via deep link.
          // Without this, the signature request is swallowed by the dead socket and hangs forever.
          try {
            const isWc = localStorage.getItem('wagmi.wallet')?.toLowerCase().includes('walletconnect') || 
                         localStorage.getItem('wagmi.wallet')?.toLowerCase().includes('reown');
            if (isWc) {
              await new Promise(r => setTimeout(r, 1500));
            }
          } catch {}

          const signWithTimeout = (ms: number) => new Promise<string>((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('Signature timeout — please tap "Retry Connection" and approve in your wallet')), ms);
            signMessageAsync({ message: msgToSign })
              .then(sig => { clearTimeout(timer); resolve(sig as string); })
              .catch(err => { clearTimeout(timer); reject(err); });
          });

          signature = await signWithTimeout(30000);
          localStorage.setItem(`sovereign_auth_${norm}`, JSON.stringify({ signature, message }));
        }

        const verifyRes = await fetch('/api/auth/sovereign-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: norm, signature, message })
        });

        if (!verifyRes.ok) {
          toast.error('Session verification failed', { description: 'Please try connecting again.' });
          signingRef.current = false;
          return;
        }

        setLinked(true);
        redirectingRef.current = true;
        window.location.replace("/dashboard");
      } catch (err: any) {
        const msg = err?.message || '';
        // User rejected signing — don't show an error, just reset
        if (!msg.toLowerCase().includes('rejected') && !msg.toLowerCase().includes('denied')) {
          toast.error('Authentication failed', { description: msg });
        }
        signingRef.current = false;
      }
    };

    runVerify();
  }, [isConnected, address, mounted, setLinked, signMessageAsync]);

  const handleDesktopWallet = useCallback((walletId: string, rdns: string | null, installUrl: string | null) => {
    try { sessionStorage.removeItem("__disconnected__"); } catch {}
    setPendingId(walletId);
    if (!rdns) { openAppKit(); setPendingId(null); return; }
    const connector = connectors.find((c: any) => c.id === rdns)
      || connectors.find((c) => c.name.toLowerCase().includes(walletId.toLowerCase()))
      || connectors.find((c) => c.id === "injected" || (c as any).type === "injected");
    if (connector) connect({ connector });
    else {
      setPendingId(null);
      if (installUrl) toast.error("Wallet extension not found", { action: { label: "Install", onClick: () => window.open(installUrl, "_blank") } });
    }
  }, [connect, connectors, openAppKit]);

  const handleMobileWallet = useCallback((walletId: string) => {
    try { sessionStorage.removeItem("__disconnected__"); } catch {}
    try { localStorage.setItem('sovereign_pending_wakeup', '1'); } catch {}
    
    // Instead of forcing the user into the dapp browser with metamask.app.link/dapp,
    // we use AppKit which correctly uses standard Universal Links to sign and return to Chrome.
    openAppKit();
  }, [openAppKit]);

  const isVerified = mounted && (isConnected || isLinked);

  return (
    <div className="w-full flex-1 flex flex-col items-center bg-[#FAFAF8] relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
         <RemoteLottie path="Whale Mission.json" className="w-full h-full object-cover" />
      </div>
      <div className="relative z-10 w-full flex-1 flex flex-col justify-center items-center px-4 py-8 sm:p-12 min-h-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl mx-auto rounded-2xl overflow-hidden bg-white border border-[#E8E8E8] shadow-[0_4px_48px_rgba(0,0,0,0.06)] flex flex-col lg:flex-row"
        >
          {/* LEFT: Information panel */}
          <div className="flex-1 p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#F0F0F0] bg-[#FAFAF8]">
            <div>
              <h1 className="text-[36px] sm:text-[44px] font-black tracking-tighter leading-[1.0] text-[#0A0A0A] mb-6">
                Whale Alert<br />
                <span className="text-[#CCCCCC]">Network Access</span>
              </h1>

              <p className="text-[15px] text-black/60 leading-relaxed mb-10 max-w-sm font-serif">
                Establish a secure connection to the Whale Alert Network infrastructure. Professional identity management and institutional record preservation.
              </p>

              <div className="w-full max-w-[280px] h-[180px] -mt-4 mb-4">
                 <RemoteLottie path="block abstract.json" className="w-full h-full object-contain opacity-80" />
              </div>

              <div className="grid grid-cols-1 gap-3">
                {/* Removed Authentication Block */}
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-black/5 flex items-start gap-3">
              <Lock size={14} className="text-black/20 shrink-0 mt-0.5" />
              <p className="text-[10px] text-black/30 font-mono leading-relaxed uppercase tracking-[0.12em]">
                Authorized personnel only. Sessions are cryptographically bound to your hardware identity.
              </p>
            </div>
          </div>

          {/* RIGHT: Connection panel */}
          <div className="flex-1 p-8 sm:p-12 lg:p-16 flex flex-col bg-white">
            <div className="w-full flex flex-col h-full max-w-sm mx-auto">

              {mounted && !isVerified && (
                <div className="flex items-center gap-2 mb-8 pb-6 border-b border-black/5">
                  {isMobile ? <Smartphone size={13} className="text-black/20" /> : <Monitor size={13} className="text-black/20" />}
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-black/30">
                    {isMobile ? "Mobile connection" : "Desktop connection"}
                  </span>
                </div>
              )}

              {/* Verified state */}
              {isVerified ? (
                <motion.div
                  key="verified"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center justify-center gap-6 flex-1 py-4 text-center"
                >
                  <div className="w-32 h-32 flex items-center justify-center -mb-4">
                    <RemoteLottie path="Transaction Complete.json" loop={false} className="w-full h-full object-contain" />
                  </div>

                  <div>
                    <h2 className="text-[24px] font-black tracking-tight text-[#0A0A0A] mb-2">
                      {isLinked ? "Session Verified" : "Wallet Connected"}
                    </h2>
                    <p className="text-[13px] text-[#888] leading-relaxed max-w-[260px] mx-auto">
                      {isLinked
                        ? "Redirecting to the terminal..."
                        : "Your wallet is connected. Redirecting to the terminal."}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A]/30"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleTotalDisconnect}
                    className="mt-2 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 hover:text-rose-600 transition-all border border-rose-500/20 active:scale-[0.98]"
                  >
                    Total Disconnect
                  </button>
                </motion.div>

              ) : !mounted ? (
                <div className="flex flex-col gap-3 flex-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-full h-[66px] rounded-xl bg-[#F5F5F5] animate-pulse" />
                  ))}
                </div>

              ) : isMobile ? (
                <div className="flex flex-col gap-3 flex-1">
                  {MOBILE_WALLETS.map((w) => (
                    <WalletButton key={w.id} logo={w.logo} name={w.name} badge={w.badge} onClick={() => handleMobileWallet(w.id)} loading={isPending && pendingId === w.id} delay={w.delay} extraIcon={<ExternalLink size={16} />} />
                  ))}
                  <button
                    onClick={() => setShowMobileScanner(true)}
                    className="w-full flex items-center justify-center gap-3 py-4 mt-1 rounded-xl border border-[#E8E8E8] bg-[#FAFAF8] font-black uppercase tracking-[0.2em] text-[11px] text-[#0A0A0A] active:scale-[0.97] transition-all hover:border-[#D0D0D0]"
                  >
                    <ScanLine size={15} />
                    Scan QR Code
                  </button>
                </div>

              ) : (
                <div className="flex flex-col gap-3 flex-1 w-full">
                  {/* QR Panel — local qrcode.react, zero external API dependency */}
                  {syncStatus === "AWAITING" && qrData ? (
                    <motion.div
                      key="qr-ready"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="flex justify-center mb-3"
                    >
                      <div className="p-4 bg-white rounded-2xl border border-black/8 flex flex-col items-center gap-3 shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
                        style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)' }}
                      >
                        <QRCodeSVG
                          value={qrData}
                          size={200}
                          fgColor="#0A0A0A"
                          bgColor="#FFFFFF"
                          level="M"
                          includeMargin={false}
                        />
                        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-black/30 text-center">
                          Connect Whale Mobile
                        </span>
                      </div>
                    </motion.div>
                  ) : syncStatus === "IDLE" || (syncStatus === "AWAITING" && !qrData) ? (
                    // Loading skeleton while ephemeral key pair is generating
                    <div className="flex justify-center mb-3">
                      <div className="p-4 bg-[#FAFAF8] rounded-2xl border border-black/5 flex flex-col items-center gap-3">
                        <div className="w-[200px] h-[200px] bg-[#F0F0F0] rounded-xl animate-pulse flex items-center justify-center">
                          <Loader2 size={24} className="animate-spin text-black/20" />
                        </div>
                        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-black/20 text-center">
                          Generating secure link...
                        </span>
                      </div>
                    </div>
                  ) : syncStatus === "ERROR" ? (
                    // Error + retry
                    <div className="flex justify-center mb-3">
                      <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex flex-col items-center gap-3">
                        <div className="w-[200px] h-[200px] rounded-xl bg-rose-50 flex flex-col items-center justify-center gap-3">
                          <Shield size={28} className="text-rose-300" />
                          <p className="text-[11px] font-mono text-rose-400 text-center leading-relaxed max-w-[160px]">
                            QR generation failed
                          </p>
                          <button
                            onClick={() => { setSyncStatus("IDLE"); setQrSession(null); setQrData(''); }}
                            className="px-4 py-2 rounded-xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-colors active:scale-[0.97]"
                          >
                            Retry
                          </button>
                        </div>
                        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-rose-300 text-center">
                          Tap retry to regenerate
                        </span>
                      </div>
                    </div>
                  ) : null}
                  {DESKTOP_WALLETS.map((w) => (
                    <WalletButton key={w.id} logo={w.logo} name={w.name} badge={w.badge} onClick={() => handleDesktopWallet(w.id, w.rdns, w.installUrl)} loading={isPending && pendingId === w.id} delay={w.delay} />
                  ))}
                  <button
                    onClick={() => openAppKit({ view: 'Connect' })}
                    className="w-full flex items-center justify-center gap-3 py-3.5 mt-1 rounded-xl border border-black/5 bg-[#FAFAF8] font-black uppercase tracking-[0.2em] text-[10px] text-black/40 hover:bg-black/5 hover:text-black/60 transition-all"
                  >
                    <ScanLine size={14} />
                    WalletConnect / QR Scan
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile QR Scanner */}
      {isMobile && mounted && (
        <DynamicQRScannerModal
          isOpen={showMobileScanner}
          onClose={() => setShowMobileScanner(false)}
          address={address ?? ""}
          onScan={(_result: string) => {
            setShowMobileScanner(false);
            toast.success("Session synchronized");
          }}
        />
      )}

      {/* Footer */}
      <footer className="relative z-[100] px-5 sm:px-8 py-4 border-t border-[#EBEBEB] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 bg-white w-full">
        <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#BBBBBB]">© 2026 Whale Alert Network</span>

      </footer>
    </div>
  );
}
