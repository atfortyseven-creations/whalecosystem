"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { useUIStore } from "@/lib/store/ui-store";
import { toast } from "sonner";

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
import { QRCodeSVG as QRCode } from "qrcode.react";

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
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://whalealert.network';
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

  // QR poll
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
          if (data.encryptedPayload && data.iv && ephemeral) {
            try {
              const { deriveSharedSecret, decryptAESGCM } = await import('@/lib/web-crypto');
              let isECDHFlag = false;
              try { isECDHFlag = new URL(qrData).searchParams.get('ecdh') === '1'; } catch {}
              const mobilePub = data.mobilePub;
              if (mobilePub) {
                const shared = await deriveSharedSecret(ephemeral.privateKey, mobilePub, isECDHFlag);
                if (data.encryptedPayload && data.iv) {
                  const decrypted = await decryptAESGCM(shared, data.encryptedPayload, data.iv);
                  if (decrypted && decrypted.split('.').length === 3) jwt = decrypted;
                }
              }
            } catch {}
          }
          if (!jwt && data.serverJwt) {
            try { const { verifyJWT } = await import('@/lib/jwt'); await verifyJWT(data.serverJwt); jwt = data.serverJwt; } catch {}
          }
          if (!jwt) { setSyncStatus("ERROR"); return; }
          if (!data.kycVerified) return;
          const hydrateRes = await fetch('/api/auth/qr-hydrate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jwt }) });
          if (hydrateRes.ok) window.location.replace("/dashboard");
          else setSyncStatus("ERROR");
        }
      } catch {}
    }, 1000);
    return () => clearInterval(poll);
  }, [qrSession, ephemeral, qrData, syncStatus]);

  // Wallet connect → redirect (fixed: use ref to prevent double-fire)
  useEffect(() => {
    if (!mounted || !isConnected || !address) return;
    if (redirectingRef.current) return;
    try { if (sessionStorage.getItem("__disconnected__") === "1") { sessionStorage.removeItem("__disconnected__"); return; } } catch {}
    redirectingRef.current = true;
    setLinked(true);
    window.location.replace("/dashboard");
  }, [isConnected, address, mounted, setLinked]);

  const handleDesktopWallet = useCallback((walletId: string, rdns: string | null, installUrl: string | null) => {
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

  const handleMobileWallet = useCallback(() => {
    try { localStorage.setItem('sovereign_pending_wakeup', '1'); } catch {}
    openAppKit();
  }, [openAppKit]);

  const isVerified = mounted && (isConnected || isLinked);

  return (
    <div className="w-full flex-1 flex flex-col items-center bg-[#FAFAF8] relative">
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
              <div className="flex items-center gap-2 mb-10">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/40">Whale Alert Network</span>
              </div>

              <h1 className="text-[36px] sm:text-[44px] font-black tracking-tighter leading-[1.0] text-[#0A0A0A] mb-6">
                Whale Alert<br />
                <span className="text-[#CCCCCC]">Network Access</span>
              </h1>

              <p className="text-[15px] text-black/60 leading-relaxed mb-10 max-w-sm font-serif">
                Establish a secure connection to the Whale Alert Network infrastructure. Professional identity management and institutional record preservation.
              </p>

              <div className="grid grid-cols-1 gap-3">
                <div className="p-4 rounded-xl bg-white border border-black/5 shadow-sm">
                  <Shield size={16} className="text-black mb-3 opacity-40" />
                  <p className="text-[11px] font-black uppercase tracking-wider text-black mb-1">Cryptographic Authentication</p>
                  <p className="text-[11px] text-black/40 leading-relaxed font-mono uppercase tracking-tighter">GDPR / HIPAA Compliant Identity Verification.</p>
                </div>
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
                  <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <CheckCircle size={32} className="text-emerald-500" />
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
                    <WalletButton key={w.id} logo={w.logo} name={w.name} badge={w.badge} onClick={handleMobileWallet} loading={isPending && pendingId === w.id} delay={w.delay} extraIcon={<ExternalLink size={16} />} />
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
                  {qrData && syncStatus === "AWAITING" && (
                    <div className="flex justify-center mb-3">
                      <div className="p-3 bg-[#FAFAF8] rounded-xl border border-black/5 flex flex-col items-center gap-2 shadow-sm">
                        <QRCode value={qrData} size={200} fgColor="#0A0A0A" bgColor="transparent" />
                        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-black/30 text-center">Connect Whale Mobile</span>
                      </div>
                    </div>
                  )}
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
