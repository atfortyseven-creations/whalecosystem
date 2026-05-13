"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAccount, useConnect, useSignMessage, useDisconnect, useReconnect, useBalance, useEnsName } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { WhaleLogo } from "@/components/shared/WhaleLogo";
import { Fingerprint, ArrowRight, ScanLine, Scan, Loader2, CheckCircle2, AlertCircle, RefreshCw, Mail, Info, X, LogOut, MessageSquare, MessageCircle } from "lucide-react";

// ── Reown AppKit + WagmiAdapter localStorage key patterns ─────────────────
// These are ALL the keys that Reown AppKit v1/v2 and its WagmiAdapter write
// to localStorage (2025-2026). We scan ALL of them when recovering a session.
const APPKIT_STORAGE_KEYS = [
  '@wagmi/core',
  'wagmi.store',
  'wagmi.connected',
  'reown-appkit',
  'appkit',
  '@reown/appkit',
  'W3M_STATE',
  '@w3m/',
  'wc@2:',
  'wc@2',
  'walletconnect',
  'wagmi',
  'rainbow',
  'metamask',
  'coinbase',
  'session'
];

function extractAddressFromAppKit(value: string): string | null {
  if (!value || value.length < 42) return null;
  try {
    const parsed = JSON.parse(value);
    // All known Reown AppKit v2 + Wagmi v2 address paths
    const possiblePaths = [
      parsed?.state?.connections?.value?.[0]?.[1]?.accounts?.[0],
      parsed?.state?.data?.account?.address,
      parsed?.sessions?.[0]?.namespaces?.eip155?.accounts?.[0]?.split?.(':')?.[2],
      parsed?.namespaces?.eip155?.accounts?.[0]?.split?.(':')?.[2],
      // Support for WalletConnect v2 Array structure
      parsed?.[0]?.namespaces?.eip155?.accounts?.[0]?.split?.(':')?.[2],
      parsed?.address,
      parsed?.accounts?.[0],
      parsed?.account?.address,
    ];
    for (const candidate of possiblePaths) {
      if (candidate && typeof candidate === 'string') {
        // Clean potential "eip155:1:" prefix if split failed
        const clean = candidate.includes(':') ? candidate.split(':').pop() : candidate;
        if (clean && /^0x[a-fA-F0-9]{40}$/i.test(clean)) {
          return clean.toLowerCase();
        }
      }
    }
  } catch {
    // Not valid JSON — fall through to regex
  }
  // Final fallback: extract any valid Ethereum address from raw string
  const match = value.match(/0x[a-fA-F0-9]{40}(?![a-fA-F0-9])/i);
  return match ? match[0].toLowerCase() : null;
}

// ── Live clock hook ───────────────────────────────────────────────────────────
function useLiveClock(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

// QR Scanner — iOS-safe dynamic import
const DynamicQRScannerModal = dynamic(
  () => import("@/components/wallet/QRScannerModal"),
  { ssr: false }
);

import { ImmersiveManifestoLanding } from "./ImmersiveManifestoLanding";
import { WhalecosystemTweetFeed } from "./WhalecosystemTweetFeed";

// ── Colour tokens ─────────────────────────────────────────────────────────────
const IVORY = "#FAF9F6";
const INK   = "#050505";
const FAINT = "rgba(5,5,5,0.08)";
const MUTED = "rgba(5,5,5,0.50)";

// ── Sovereign sign message (must mirror LinkedGate exactly) ───────────────────
function buildSovereignMessage(address: string): string {
  return [
    '═══════════════════════════════',
    '  Whale Alert Network',
    '  SOVEREIGN ACCESS PROTOCOL',
    '═══════════════════════════════',
    '',
    `Identity: ${address}`,
    `Nonce: ${Date.now()}`,
    `Network: WHALE_TERMINAL_V4`,
    '',
    'By signing you confirm that',
    'you are the sole owner of this',
    'address and authorize access',
    'to the institutional terminal.',
    '═══════════════════════════════',
  ].join('\n');
}

// ── Wallet button ─────────────────────────────────────────────────────────────
function WalletOption({
  logo, name, badge, onClick, delay = 0, loading = false,
}: {
  logo: string; name: string; badge: string;
  onClick: () => void; delay?: number; loading?: boolean;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ease: [0.16, 1, 0.3, 1], duration: 0.5 }}
      onClick={onClick}
      disabled={loading}
      className="group w-full flex items-center gap-4 p-4 rounded-2xl border border-[#E5E5E5] bg-white hover:bg-[#FAF9F6] hover:border-black/20 active:scale-[0.97] transition-all duration-200 shadow-sm disabled:opacity-60"
    >
      <div className="w-11 h-11 rounded-xl bg-[#FAF9F6] border border-[#E5E5E5] flex items-center justify-center p-2 overflow-hidden shrink-0">
        {loading ? (
          <Loader2 size={20} className="animate-spin text-black/40" />
        ) : (
          <img src={logo} alt={name} className="w-full h-full object-contain" />
        )}
      </div>
      <div className="flex-1 text-left">
        <p className="text-[13px] font-black uppercase tracking-tight text-[#050505]">{name}</p>
        <p className="text-[10px] font-mono text-[#050505]/40 uppercase tracking-widest mt-0.5">
          {loading ? "Opening app…" : badge}
        </p>
      </div>
      {!loading && (
        <ArrowRight size={14} className="text-[#050505]/20 group-hover:text-[#050505] group-hover:translate-x-0.5 transition-all shrink-0" />
      )}
    </motion.button>
  );
}

// ── Signing overlay ───────────────────────────────────────────────────────────
function SigningOverlay({
  address, onSigned, onRetry, error, isSigning,
}: {
  address: string; onSigned: () => void; onRetry: () => void;
  error: string | null; isSigning: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
      style={{ background: "rgba(250,249,246,0.97)", backdropFilter: "blur(24px)" }}
    >
      <div className="w-full max-w-sm flex flex-col items-center gap-5 text-center">
        <div className="w-20 h-20 rounded-[2rem] bg-white border border-black/8 shadow-lg flex items-center justify-center">
          {isSigning ? (
            <RefreshCw size={28} className="text-black/60 animate-spin" />
          ) : error ? (
            <AlertCircle size={28} className="text-red-500" />
          ) : (
            <Fingerprint size={28} className="text-[#050505]" />
          )}
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-black/8 rounded-full shadow-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-widest text-[#050505]/60 font-mono">
            {address.slice(0, 8)}…{address.slice(-6)}
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-[26px] font-black tracking-tighter text-[#050505] leading-none">
          {isSigning ? "Tunnel Established" : error ? "Connection Rejected" : "Connecting..."}
          </h2>
          <p className="text-[12px] text-[#050505]/50 leading-relaxed">
            {error
              ? "Could not cryptographically verify the wallet."
              : isSigning
              ? "Wallet linked successfully. Validating security credentials in the Sovereign Protocol..."
              : "Establishing encrypted tunnel with the Sovereign Network... Please wait."}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[11px] font-black uppercase tracking-widest"
          >
            {error}
          </motion.div>
        )}

        {error ? (
          <button
            onClick={onRetry}
            className="w-full py-4 rounded-2xl bg-[#2D0A59] text-white font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-3 shadow-lg active:scale-[0.97] transition-all"
          >
            <RefreshCw size={16} />
            Retry Connection
          </button>
        ) : !isSigning ? (
          <div className="w-full px-4 py-3 rounded-2xl border border-[#E5E5E5] bg-white flex items-center justify-center gap-3">
            <Loader2 size={16} className="animate-spin text-[#050505]/60" />
            <span className="text-[#050505] font-black uppercase tracking-widest text-[11px]">Validating...</span>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

// ── Network name from chain ID ────────────────────────────────────────────────
function chainName(id?: number): string {
  const MAP: Record<number, string> = {
    1: 'Ethereum Mainnet', 10: 'Optimism', 56: 'BNB Chain',
    137: 'Polygon', 8453: 'Base', 42161: 'Arbitrum One',
    43114: 'Avalanche', 100: 'Gnosis', 250: 'Fantom',
    324: 'zkSync Era', 59144: 'Linea', 1101: 'Polygon zkEVM',
  };
  return id ? (MAP[id] ?? `Chain ${id}`) : 'Mainnet';
}

// ── Connected Screen ──────────────────────────────────────────────────────────
function ConnectedScreen({
  address, onScan, showScanner, onCloseScanner, onBack, connectorName, chainId, onDisconnect, signMessageAsync, initialScanData
}: {
  address: string; onScan: () => void;
  showScanner: boolean; onCloseScanner: () => void;
  onBack?: () => void;
  connectorName?: string;
  chainId?: number;
  onDisconnect?: () => void;
  signMessageAsync?: any;
  initialScanData?: string | null;
}) {
  const now = useLiveClock();
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [userAgentInfo, setUserAgentInfo] = useState('');
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);

  // ── Real on-chain data ────────────────────────────────────────────────────
  const { data: balance } = useBalance({ address: address as `0x${string}` });
  const { data: ensName } = useEnsName({ address: address as `0x${string}`, chainId: 1 });

  const fmtBalance = () => {
    if (!balance) return null;
    const val = parseFloat(balance.formatted);
    return `${val.toFixed(4)} ${balance.symbol}`;
  };

  const checksumAddr = (addr: string) =>
    addr ? `${addr.slice(0, 8)}…${addr.slice(-6)}` : '';

  useEffect(() => {
    if (typeof window !== 'undefined') {
       const ua = navigator.userAgent;
       let os = "Unknown OS";
       if (ua.indexOf("Win") != -1) os = "Windows";
       if (ua.indexOf("Mac") != -1) os = "MacOS";
       if (ua.indexOf("Linux") != -1) os = "Linux";
       if (ua.indexOf("Android") != -1) os = "Android";
       if (ua.indexOf("like Mac") != -1) os = "iOS";
       const detectedOs = `${os} (${navigator.vendor || "Browser"})`;
       setUserAgentInfo(detectedOs);
       
       if (address) {
         const key = `sovereign_history_${address}`;
         let existing: any[] = [];
         try {
             const stored = localStorage.getItem(key);
             if (stored) {
                 const parsed = JSON.parse(stored);
                 if (Array.isArray(parsed)) existing = parsed;
             }
         } catch (e) {
             existing = [];
         }

         const currentSession = {
           date: new Date().toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }),
           time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
           provider: connectorName || "Secure Wallet",
           os: detectedOs
         };
         
         const isDuplicate = existing.length > 0 && existing[0].time === currentSession.time && existing[0].date === currentSession.date;
         let updated = existing;
         
         if (!isDuplicate) {
           updated = [currentSession, ...existing].slice(0, 50);
           try {
               localStorage.setItem(key, JSON.stringify(updated));
           } catch (e) {}
         }
         setSessionHistory(updated);
       }
    }
  }, [address, connectorName]);

  const fmtTime   = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const fmtDate   = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden font-sans flex flex-col bg-white text-black">
      {/* Black and White Spinning World Background */}
      <div className="fixed inset-0 z-0 flex items-center justify-center overflow-hidden bg-[#fafafa]">
        <motion.img 
           src="/rectangle_large_type_2_a9c6cc1e1738c43864683c13c43314d9.jpg"
           alt="Rotating World"
           className="absolute min-w-[150vw] min-h-[150vh] object-cover opacity-15"
           style={{ filter: "grayscale(100%) contrast(150%)" }}
           animate={{ rotate: 360 }}
           transition={{ duration: 180, ease: "linear", repeat: Infinity }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/80 to-white/95 backdrop-blur-[2px]" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center px-6 py-10 gap-5 max-w-[480px] w-full mx-auto">
        
        {/* Header & Logo */}
        <motion.div 
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
           className="w-full flex flex-col items-center justify-center gap-5 mb-4 mt-2"
        >
           <img src="/logo-landingpage.png" alt="Whale Logo" className="h-20 w-auto object-contain drop-shadow-sm" style={{ filter: "grayscale(100%)" }} />
           <div className="flex flex-col items-center text-center">
             <h1 className="text-[22px] font-black uppercase tracking-[0.2em] text-black leading-none">Whale Alert</h1>
             <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-black/50 mt-2">Humanity Ledger™</p>
           </div>
        </motion.div>

        {/* ── Sovereign Identity Card ── */}
        <motion.div
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.1, duration: 0.6 }}
           className="w-full bg-white rounded-[32px] border-[3px] border-black shadow-[0_12px_40px_rgb(0,0,0,0.12)] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-black px-6 py-8 flex flex-col items-center text-center gap-4">
            <div className="px-4 py-1.5 rounded-full border border-white/30 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Active Session · Verified</span>
            </div>
            <p className="text-[44px] font-black tracking-tighter text-white leading-none tabular-nums mt-2">
              {fmtTime(now)}
            </p>
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/50">{fmtDate(now)}</p>
          </div>

          {/* On-chain data row */}
          <div className="grid grid-cols-2 gap-px bg-black">
            <div className="bg-white px-5 py-5 flex flex-col items-center text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black/50 mb-1.5">Network</p>
              <p className="text-[13px] font-black uppercase tracking-widest text-black truncate">{chainName(chainId)}</p>
            </div>
            <div className="bg-white px-5 py-5 flex flex-col items-center text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black/50 mb-1.5">Balance</p>
              <p className="text-[13px] font-black font-mono tracking-wider text-black truncate">
                {fmtBalance() ?? <span className="text-black/30 animate-pulse">Loading…</span>}
              </p>
            </div>
          </div>

          {/* Wallet / identity row */}
          <div className="grid grid-cols-2 gap-px bg-black border-t border-black">
            <div className="bg-white px-5 py-5 flex flex-col items-center text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black/50 mb-1.5">Provider</p>
              <p className="text-[13px] font-black uppercase tracking-widest text-black truncate">{connectorName || 'Secure Wallet'}</p>
            </div>
            <div className="bg-white px-5 py-5 flex flex-col items-center text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black/50 mb-1.5">Identity</p>
              <p className="text-[13px] font-black uppercase tracking-widest text-black truncate">{ensName ?? checksumAddr(address)}</p>
            </div>
          </div>

          {/* Full address */}
          <div className="px-6 py-6 bg-white border-t border-black flex flex-col items-center text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black/50 mb-3">Verified On-Chain Address</p>
            <div className="flex items-center justify-center gap-2 bg-[#f4f4f4] border border-black/10 rounded-2xl px-5 py-4 w-full">
              <p className="text-[12px] font-mono text-black font-bold tracking-tight break-all leading-relaxed">
                {address}
              </p>
            </div>
          </div>
        </motion.div>



        {/* ── SCANNER UNLOCKED badge ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full flex items-center gap-3 px-5 py-4 rounded-[20px] bg-white border-[3px] border-black/10"
        >
          <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center shrink-0">
            <Scan size={16} className="text-black/60" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Scanner Unlocked</span>
            <span className="text-[9px] font-mono text-black/40 mt-0.5 leading-relaxed">
              You can use the scanner to link the desktop terminal.
            </span>
          </div>
        </motion.div>

        {/* ── OPEN QR SCANNER · SYNC DESKTOP ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="w-full"
        >
          <button
            id="open-qr-scanner-btn"
            onClick={onScan}
            className="w-full flex items-center justify-center gap-3 py-5 rounded-[20px] font-black uppercase tracking-[0.15em] bg-[#1a0533] hover:bg-[#2D0A59] active:scale-[0.97] transition-all text-white shadow-lg"
            style={{ fontSize: "11px" }}
          >
            <ScanLine size={18} />
            Open QR Scanner · Sync Desktop
          </button>
        </motion.div>

        {/* ── Forum CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full"
        >
          <Link
            href="/forum"
            className="w-full flex items-center justify-center gap-3 py-5 rounded-[20px] font-black uppercase tracking-[0.15em] border-[3px] border-black bg-white hover:bg-black hover:text-white transition-all group"
            style={{ fontSize: "11px", color: "black" }}
          >
            <MessageSquare size={18} className="group-hover:text-white transition-colors" />
            Access Sovereign Forum
          </Link>
        </motion.div>

        {/* ── Whale Chat CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="w-full"
        >
          <Link
            href="/chat"
            className="w-full flex items-center justify-center gap-3 py-5 rounded-[20px] font-black uppercase tracking-[0.15em] border-[2px] border-[#9945FF]/30 bg-gradient-to-r from-[#9945FF]/10 to-[#6B2FBB]/10 hover:from-[#9945FF]/20 hover:to-[#6B2FBB]/20 transition-all text-[#7B35CC]"
            style={{ fontSize: "11px" }}
          >
            <MessageCircle size={18} />
            Enter Whale Chat Encrypted
          </Link>
        </motion.div>

        {/* ── Disconnect session button ── */}
        {onDisconnect && (
          <motion.button
            id="sovereign-disconnect-btn"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileTap={{ scale: 0.97 }}
            onClick={onDisconnect}
            disabled={false}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-black uppercase tracking-[0.15em] bg-transparent hover:bg-red-50 transition-all mt-2 text-red-400/70 hover:text-red-500 active:scale-95"
            style={{ fontSize: "10px" }}
          >
            <LogOut size={16} />
            Disconnect · Change Wallet
          </motion.button>
        )}

        {/* ── QR Sync hint ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-[9px] font-mono text-black/30 text-center leading-relaxed px-4"
        >
          On the Desktop Terminal, click <span className="font-black text-black/50">Direct QR Handshake</span>, then scan the code with this button to sync your institutional session.
        </motion.p>

        {/* ── Session History Panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full bg-white rounded-[24px] border-[3px] border-black overflow-hidden flex flex-col mt-6 shadow-[0_8px_24px_rgb(0,0,0,0.06)]"
        >
          <div className="bg-black px-6 py-5 flex items-center justify-between">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Session Log</h3>
            <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black text-white">{sessionHistory.length}</div>
          </div>
          <div className="flex flex-col max-h-[280px] overflow-y-auto">
             {sessionHistory.length === 0 ? (
               <div className="p-8 text-center text-[10px] font-black uppercase tracking-widest text-black/40">No records.</div>
             ) : (
               sessionHistory.map((s, i) => (
                 <div key={i} className={`px-6 py-5 flex flex-col gap-2.5 ${i !== sessionHistory.length - 1 ? 'border-b-2 border-black/5' : ''}`}>
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-widest text-black">{s.date}</span>
                       <span className="text-[11px] font-mono font-bold text-black/60">{s.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-[9px] font-black uppercase tracking-[0.15em] text-black/40">{s.provider}</span>
                       <span className="text-[9px] font-black uppercase tracking-[0.15em] text-black/60">{s.os}</span>
                    </div>
                 </div>
               ))
             )}
          </div>
        </motion.div>
      </main>

      <DynamicQRScannerModal
        isOpen={showScanner}
        onClose={onCloseScanner}
        address={address}
        initialScanData={initialScanData}
        onScan={(_result: string) => {
          const toast = document.createElement('div');
          toast.className = 'fixed top-6 left-4 right-4 z-[99999] bg-black text-white text-[11px] border border-white/20 font-black uppercase tracking-[0.2em] px-6 py-5 rounded-[20px] shadow-2xl text-center';
          toast.textContent = 'SESSION SYNCHRONIZED';
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 3000);
        }}
      />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function MobileLanding() {
  const searchParams = useSearchParams();
  const sessionParam = searchParams?.get('session');

  // ── Reown AppKit is the PRIMARY connector ────────────────
  const { address: wagmiAddress, isConnected: wagmiConnected, connector, chainId } = useAccount();
  const { connect, connectAsync, connectors } = useConnect();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const { reconnect } = useReconnect();
  const { open: rkOpenModal, close: rkCloseModal } = useAppKit();

  // ── Ref: always holds the latest wagmiAddress for use inside setInterval closures ──
  // setInterval captures variables at creation time (stale closure). Without a ref,
  // the poll would never see wagmiAddress updating when wagmi hydrates from cookies.
  const wagmiAddressRef = useRef<string | undefined>(undefined);
  const isSigningRef = useRef(false);
  useEffect(() => { wagmiAddressRef.current = wagmiAddress; }, [wagmiAddress]);
  // Tracks active polling interval so onFocusRecheck can cancel previous runs
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isConnected = wagmiConnected;
  const address     = wagmiAddress;

  const [mounted, setMounted]           = useState(false);
  const [showScanner, setShowScanner]   = useState(false);
  const [showDebug, setShowDebug]       = useState(false);  // secret debug panel
  const [debugTaps, setDebugTaps]       = useState(0);
  // Always false on SSR. Reads from sessionStorage after mount to survive Chrome
  // tab freeze/restore (which resets React state when user returns from Rainbow).
  const [showManualReconnect, setShowManualReconnectRaw] = useState(false);
  const setShowManualReconnect = (val: boolean) => {
    try { sessionStorage.setItem('sovereign_show_reconnect', val ? '1' : '0'); } catch {}
    setShowManualReconnectRaw(val);
  };

  // Init isLinked from cookie immediately — no flash
  const [isLinked, setIsLinked] = useState<boolean>(() => {
    if (typeof document === 'undefined') return false;
    return document.cookie.split('; ').some(r => r.startsWith('sovereign_handshake=0x'));
  });

  // linkedAddress: set synchronously in performLink so effectiveAddress
  // is NEVER null after connection — critical for incognito mode where
  // wagmi/appkit re-hydration is delayed and cookieAddress memo lags.
  const [linkedAddress, setLinkedAddress] = useState<string | null>(() => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/sovereign_handshake=(0x[0-9a-fA-F]{40,})/i);
    return match?.[1] ?? null;
  });

  // Cookie address fallback (when wagmi hasn't reconnected yet)
  const cookieAddress = useMemo<string | null>(() => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/sovereign_handshake=(0x[0-9a-fA-F]{40,})/i);
    return match?.[1] ?? null;
  }, [isLinked]);

  // Prefer linkedAddress (set in performLink) → wagmi address → cookie fallback
  const effectiveAddress = linkedAddress || address || cookieAddress || undefined;

  // Auto-sync for mobile camera scans
  const uuidParam = searchParams?.get('uuid');
  const [autoSyncStarted, setAutoSyncStarted] = useState(false);

  useEffect(() => {
    if (isLinked && effectiveAddress && uuidParam && !autoSyncStarted) {
      setAutoSyncStarted(true);
      setShowScanner(true);
    }
  }, [isLinked, effectiveAddress, uuidParam, autoSyncStarted]);

  const [isActuallySigning, setIsActuallySigning] = useState(false);
  const [signingError, setSigningError] = useState<string | null>(null);

  // Start with connect overlay visible — like Scroll.io, users see wallet buttons immediately
  // The ImmersiveManifesto is moved to a secondary "Learn More" link below the buttons.
  const [showConnectOverlay, setShowConnectOverlay] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  // Emergency "I already connected" button — appears 3.5s after clicking a wallet button
  const [showFallbackBtn, setShowFallbackBtn] = useState(false);
  const [fallbackStatus, setFallbackStatus] = useState<'idle' | 'checking' | 'failed'>('idle');
  // ── Direct deep-link state ───────────────────────────────────────────────
  // Populated after wagmi's walletConnect connector emits 'display_uri'.
  // We render a native <a href> with this URI — bypasses AppKit's shadow DOM
  // which causes Chrome Android to silently block metamask:// navigations.
  const [wcDeepLink, setWcDeepLink] = useState<string | null>(null);
  const [wcTargetWallet, setWcTargetWallet] = useState<string>('metamask');

  useEffect(() => {
    setMounted(true);
    // Restore button state from sessionStorage (survives Chrome tab freeze/restore)
    try {
      if (sessionStorage.getItem('sovereign_show_reconnect') === '1') {
        setShowManualReconnectRaw(true);
      }
    } catch {}
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // SECURE HANDSHAKE: Verifies wallet ownership via cryptographic proof
  // ─────────────────────────────────────────────────────────────────────────────
  const establishSession = useCallback(async (addr: string) => {
    if (isLinked || isActuallySigning) return;

    const norm = addr.toLowerCase();

    // 1. First, check if we already have a valid server session
    try {
      const checkRes = await fetch('/api/auth/verify-session');
      if (checkRes.ok) {
        const data = await checkRes.json();
        if (data.authenticated) {
           console.log('[Auth] Existing session valid for:', norm);
           setLinkedAddress(norm);
           setIsLinked(true);
           return;
        }
      }
    } catch (e) {
      console.warn('[Auth] Session check failed, proceeding to sign');
    }

    // 2. No session? We MUST sign.
    setIsActuallySigning(true);
    setSigningError(null);

    try {
      const message = buildSovereignMessage(norm);
      const signature = await signMessageAsync({ message });

      const verifyRes = await fetch('/api/auth/sovereign-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: norm, signature, message })
      });

      if (!verifyRes.ok) {
        throw new Error('Verification rejected by Sovereign Node');
      }

      console.log('[Auth] Handshake successful for:', norm);
      setLinkedAddress(norm);
      setIsLinked(true);
      setConnecting(null);
      setShowFallbackBtn(false);
      try { sessionStorage.removeItem('sovereign_show_reconnect'); } catch {}
      try { localStorage.removeItem('sovereign_pending_wakeup'); } catch {}
      setShowManualReconnectRaw(false);
    } catch (err: any) {
      console.error('[Auth] Handshake failed:', err);
      setSigningError(err.message || 'Verification failed');
    } finally {
      setIsActuallySigning(false);
    }
  }, [isLinked, isActuallySigning, signMessageAsync]);

  // ── onFocusRecheck — stable useCallback so multiple effects can reference it —
  const onFocusRecheck = useCallback(() => {
    if (isLinked) return;
    // Fast path: wagmi already resolved the address
    if (wagmiAddressRef.current) { establishSession(wagmiAddressRef.current); return; }
    // Cancel any in-flight poll before starting a new one
    if (pollIntervalRef.current) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null; }
    let attempts = 0;
    pollIntervalRef.current = setInterval(() => {
      attempts++;
      // Check 1: wagmi ref
      if (wagmiAddressRef.current) {
        clearInterval(pollIntervalRef.current!); pollIntervalRef.current = null;
        establishSession(wagmiAddressRef.current); return;
      }
      // Check 2: All cookies (Corrected parsing)
      try {
        const cookies = document.cookie.split('; ');
        for (const cookie of cookies) {
          const eqIdx = cookie.indexOf('=');
          if (eqIdx === -1) continue;
          let val = cookie.substring(eqIdx + 1);
          try { val = decodeURIComponent(val); } catch {}
          if (val) {
            const addr = extractAddressFromAppKit(val);
            if (addr) { 
              console.log('[Sovereign:Sync] Found address in cookies:', addr);
              clearInterval(pollIntervalRef.current!); pollIntervalRef.current = null; 
              establishSession(addr); return; 
            }
          }
        }
      } catch {}
      // Check 3: All localStorage + sessionStorage keys (Nuclear Scan)
      try {
        const storages = [localStorage, sessionStorage];
        for (const storage of storages) {
          for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            if (!key) continue;
            const raw = storage.getItem(key);
            if (!raw) continue;
            
            const addr = extractAddressFromAppKit(raw);
            if (addr) { 
              console.log('[Sovereign:Sync] Found address in storage key:', key, addr);
              
              // AUTO-REPAIR: If we found it in storage but not in cookie, write it now
              // to satisfy TitaniumGate and establish the session immediately.
              const hasHandshake = document.cookie.includes('sovereign_handshake=');
              if (!hasHandshake) {
                console.log('[Sovereign:Sync] Auto-repairing session cookie...');
                document.cookie = `sovereign_handshake=${addr}; path=/; max-age=604800; SameSite=Lax`;
              }

              clearInterval(pollIntervalRef.current!); pollIntervalRef.current = null; 
              establishSession(addr); return; 
            }
          }
        }
      } catch {}
      
      // Increased polling limit to 120 (60s at 500ms intervals) to give WalletConnect more time
      // Polling frequency reduced from 50ms to 500ms to prevent thermal throttling and CPU spikes.
      if (attempts >= 120) {
        clearInterval(pollIntervalRef.current!); pollIntervalRef.current = null;
        // ── LAST RESORT: check if sovereign_handshake cookie was set this session ──
        // This covers the case where establishSession ran but wagmi didn't
        // reconnect fast enough for the poll to catch the wagmiAddressRef update.
        try {
          const cookieMatch = document.cookie.match(/sovereign_handshake=(0x[0-9a-fA-F]{40,})/i);
          if (cookieMatch?.[1]) {
            console.log('[Sovereign:Recovery] Cookie found after poll timeout — using it:', cookieMatch[1]);
            establishSession(cookieMatch[1]);
            return;
          }
        } catch {}
        // Poll truly failed and no cookie — clear reconnect state cleanly
        console.warn('[Sovereign:Recovery] Polling timeout reached. Handshake failed.');
        setFallbackStatus('failed');
        setShowManualReconnectRaw(false);
        try { 
          sessionStorage.removeItem('sovereign_show_reconnect');
          localStorage.removeItem('sovereign_pending_wakeup');
        } catch {}
      }
    }, 500);
  }, [isLinked, establishSession]);

  useEffect(() => {
    if (!mounted || isLinked) return;
    if (isConnected && address) {
      establishSession(address);
    }
  }, [mounted, isConnected, address, isLinked, establishSession]);

  // ── forceFullReconnect — Manual sync trigger for Android Chrome ────────────
  const forceFullReconnect = useCallback(() => {
    setFallbackStatus('checking');
    try {
      // Wagmi automatically reconnects via AppKit. Manually calling reconnect()
      // can cause a race condition with the WalletConnect relay handshake.
      // We just rely on AppKit's native reconnection and start polling.
    } catch (e) {
      console.error('[Sovereign:Recovery] Manual sync failed:', e);
    }
    // Start polling immediately!
    onFocusRecheck();
  }, [onFocusRecheck]);

  // ── Hardened Sovereign Wake-Sync Engine ───────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      // Do NOT remove w3m-modal here. AppKit manages the WebSocket connection
      // inside the modal's WebComponent. Removing it kills the handshake.
      if (isLinked) return;
      
      const isPending = localStorage.getItem('sovereign_pending_wakeup') === '1';
      const isReconnecting = sessionStorage.getItem('sovereign_show_reconnect') === '1';

      if (isPending || isReconnecting) {
        console.log('%c[MobileWallet] User returned to active tab — forcing recovery UI', 'color:#00ff00');
        setShowManualReconnectRaw(true);
        try { sessionStorage.setItem('sovereign_show_reconnect', '1'); } catch {}
        forceFullReconnect();
      } else {
        onFocusRecheck();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);
    onFocusRecheck(); // Run on mount for full-reload case
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
      if (pollIntervalRef.current) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null; }
    };
  }, [mounted, isLinked, reconnect, onFocusRecheck, forceFullReconnect]);

  // ── ULTRA-AGGRESSIVE RECOVERY — Android Chrome deep-link + iOS bfcache ─────────
  // Covers the case where Chrome DESTROYS the tab when the user goes to their
  // wallet app via deep-link. On return, the page is fully reloaded and neither
  // the visibilitychange nor focus events fire — only pageshow does (bfcache).
  useEffect(() => {
    if (!mounted || isLinked) return;
    let pendingWakeup = false;
    try { pendingWakeup = localStorage.getItem('sovereign_pending_wakeup') === '1'; } catch {}
    if (!pendingWakeup) return;

    // ── FAST PATH: sovereign_handshake cookie already exists from this session ──
    // This means establishSession was already called and the cookie was written.
    // No need to poll — just use the cookie address directly.
    try {
      const cookieMatch = document.cookie.match(/sovereign_handshake=(0x[0-9a-fA-F]{40,})/i);
      if (cookieMatch?.[1]) {
        console.log('%c[MobileWallet] ⚡ Cookie shortcut — skipping recovery poll', 'color:#00ff00;font-weight:bold');
        try { localStorage.removeItem('sovereign_pending_wakeup'); } catch {}
        try { sessionStorage.removeItem('sovereign_show_reconnect'); } catch {}
        establishSession(cookieMatch[1]);
        return;
      }
    } catch {}

    console.log('%c[MobileWallet] 🚨 Ultra Recovery Mode Activated', 'color:#ff00ff;font-weight:bold');
    try { sessionStorage.setItem('sovereign_show_reconnect', '1'); } catch {}
    setShowManualReconnectRaw(true);
    setFallbackStatus('checking');

    const doRecovery = () => {
      forceFullReconnect();
    };
    doRecovery();

    // pageshow fires when browser restores page from bfcache (critical for deep-link returns)
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        console.log('%c[MobileWallet] Pageshow from bfcache → forcing recovery', 'color:#00ff00');
        doRecovery();
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isLinked]);



  // ── Hide rogue w3m-modal backdrop left open after mobile deep-link ───────────
  useEffect(() => {
    if (!isLinked) return;
    const id = setInterval(() => {
      // Hide any lingering AppKit/WalletConnect modal backdrop instead of removing it from DOM
      const w3m = document.querySelector('w3m-modal') as HTMLElement | null;
      if (w3m && w3m.style.display !== 'none') {
        w3m.style.display = 'none';
        // Attempt clean close as well
        try { rkCloseModal(); } catch {}
      }
    }, 400);
    return () => clearInterval(id);
  }, [isLinked, rkCloseModal]);

  // ── Scroll to top on landing ─────────────────────────────────────────────────
  useEffect(() => {
    if (isLinked && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [isLinked]);

  // ── QR session fulfillment when user arrives via ?session= param ─────────────
  // This handles: desktop generated QR → user scanned on mobile → mobile redirected
  // with ?session=ID → mobile is now logged in and needs to confirm the handshake.
  useEffect(() => {
    if (!isLinked || !address || !sessionParam) return;
    const key = `fulfilled_session_${sessionParam}`;
    if (sessionStorage.getItem(key)) return;

    // Sign then fulfill — API requires EIP-191 proof
    const message = `Authorize Sovereign Terminal Access for session: ${sessionParam}\nAddress: ${address}\nTimestamp: ${Date.now()}`;
    signMessageAsync({ message })
      .then((signature) =>
        fetch(`/api/auth/qr-session?id=${sessionParam}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, signature, message }),
        })
      )
      .then(res => {
        if (res.ok) {
          sessionStorage.setItem(key, 'true');
          const t = document.createElement('div');
          t.className = 'fixed top-6 left-4 right-4 z-[99999] bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest px-5 py-4 rounded-2xl shadow-xl text-center';
          t.textContent = '✓ Desktop Terminal Unlocked';
          document.body.appendChild(t);
          setTimeout(() => t.remove(), 4000);
        }
      })
      .catch(() => {}); // Non-blocking — user already authenticated, this is convenience sync
  }, [isLinked, address, sessionParam]); // signMessageAsync intentionally omitted — stable wagmi ref



  // ── handleDisconnect: first-tap guaranteed via React state (no DOM mutation) ──
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = useCallback(async () => {
    if (isDisconnecting) return; // Guard: prevent double-tap race
    setIsDisconnecting(true);   // Triggers immediate re-render

    // 1. Expire the sovereign_handshake cookie immediately
    document.cookie = 'sovereign_handshake=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    
    // 2. Clear state locally so UI updates instantly
    setIsLinked(false);
    setLinkedAddress(null);

    // 3. Nuke all WalletConnect and Wagmi persistent state
    try {
      Object.keys(localStorage).forEach(k => {
        const lower = k.toLowerCase();
        if (
          lower.includes('walletconnect') || lower.includes('wagmi') ||
          lower.includes('wc@2') || lower.includes('appkit') ||
          lower.includes('reown') || lower.includes('w3m') ||
          lower.includes('rainbow') || lower.includes('metamask') ||
          lower.includes('coinbase') || lower.includes('session')
        ) localStorage.removeItem(k);
      });
      sessionStorage.clear();
    } catch {}

    // 4. Disconnect wagmi
    try { if (disconnect) disconnect(); } catch {}
    
    // 5. Force clean reload (600ms gives React time to unmount cleanly)
    setTimeout(() => {
      if (typeof window !== 'undefined') window.location.href = window.location.pathname;
    }, 600);
  }, [isDisconnecting, disconnect]);

  if (!mounted) return null;

  // (The previous showManualReconnect full-screen overlay was removed to prevent 
  // blocking the AppKit modal if visibility changes while the user is still selecting a wallet)

  // ── Render: Session exists — show immediately using cookie address ──────────
  // We NEVER wait for wagmi to reconnect. The cookie IS the source of truth.
  // The cookie value IS the wallet address: sovereign_handshake=0xABCD...
  // This means after signing we never need wagmi to reconnect to show the
  // ConnectedScreen. Works even if WalletConnect session drops after signing.
  if (isLinked && effectiveAddress) {
    return (
      <div className="w-full min-h-[100dvh] bg-[#FAF9F6]">
        <ConnectedScreen 
           address={effectiveAddress} 
           onScan={() => setShowScanner(true)} 
           showScanner={showScanner} 
           onCloseScanner={() => setShowScanner(false)} 
           connectorName={connector?.name}
           chainId={chainId}
           onDisconnect={handleDisconnect}
           signMessageAsync={signMessageAsync}
           initialScanData={(autoSyncStarted && uuidParam) ? window.location.href : null}
        />
      </div>
    );
  }

  // ── Render: Wallet connected, session being written (brief) ─────────────────
  // This render is typically invisible — the useEffect above fires setIsLinked
  // in the same React batch. Shown only for a fraction of a second max.
  if ((isConnected && address && !isLinked) || isActuallySigning) {
    return (
      <div className="w-full h-full">
        <SigningOverlay 
          address={address || effectiveAddress || '0x...'}
          isSigning={isActuallySigning}
          error={signingError}
          onSigned={() => {}}
          onRetry={() => {
            if (address) establishSession(address);
          }}
        />
      </div>
    );
  }

  // ── Render: Default — Not connected — DIRECT connect panel (no manifesto detour) ──
  // CRITICAL: This block must be AFTER all isLinked guards above.
  if (!showConnectOverlay) {
    return (
      <div className="w-full min-h-[100dvh] bg-[#FDFCF8] relative">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-4 left-4 right-4 z-[999] flex items-center justify-between px-5 py-3 rounded-full"
          style={{ background: "rgba(255,255,255,0.80)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", border: `1px solid ${FAINT}`, boxShadow: "0 4px 24px rgba(5,5,5,0.07)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-6 h-6 shrink-0 cursor-pointer select-none"
              onClick={() => {
                const next = debugTaps + 1;
                setDebugTaps(next);
                if (next >= 5) { setShowDebug(s => !s); setDebugTaps(0); }
              }}
            >
              <WhaleLogo className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-tight text-[#050505]">Whale Alert Network</span>
          </div>
          <button
            onClick={() => setShowConnectOverlay(true)}
            className="px-4 py-2 rounded-full bg-[#050505] text-white text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-black/80 active:scale-95 transition-all"
          >
            Connect Wallet
          </button>
        </motion.header>

        <ImmersiveManifestoLanding onOpenScanner={() => setShowConnectOverlay(true)} hideMap={true} />
      </div>
    );
  }

  // ── Render: Connect Overlay ────────────────────────────────────────────────
  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden font-sans flex flex-col" style={{ backgroundColor: IVORY, color: INK }}>

      {/* Layer 0: ivory base */}
      <div className="fixed inset-0 z-0 bg-[#FAF9F6] pointer-events-none" />

      {/* Layer 1: Cosmic pattern background */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        <motion.div
          className="absolute"
          style={{ inset: "-20%", backgroundImage: "url('/patron-cosmico-4k.png')", backgroundSize: "140%", backgroundRepeat: "repeat", opacity: 0.045 }}
          animate={{ x: ["0%", "-3%", "0%"], y: ["0%", "-2%", "0%"] }}
          transition={{ duration: 45, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Layer 2: top fade */}
      <div className="fixed top-0 left-0 right-0 h-36 z-[2] pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(250,249,246,0.97) 0%, transparent 100%)" }} />

      {/* Fixed Header */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between px-5 py-3 rounded-full"
        style={{ background: "rgba(255,255,255,0.80)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", border: `1px solid ${FAINT}`, boxShadow: "0 4px 24px rgba(5,5,5,0.07)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-6 h-6 shrink-0 cursor-pointer select-none"
            onClick={() => {
              const next = debugTaps + 1;
              setDebugTaps(next);
              if (next >= 5) { setShowDebug(s => !s); setDebugTaps(0); }
            }}
          >
            <WhaleLogo className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-tight" style={{ color: INK }}>Whale Alert Network</span>
            {isLinked && (
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[7px] font-black uppercase tracking-widest text-emerald-600/80">Secured · Connected</span>
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={() => setShowConnectOverlay(false)}
          className="px-3 py-1.5 rounded-full border border-black/10 text-[9px] font-black uppercase tracking-widest text-black/60 hover:bg-black/5 transition-colors"
        >
          Explore
        </button>
      </motion.header>

      {/* ── DEBUG PANEL (tap logo 5x to open) ── */}
      {showDebug && (
        <div className="fixed inset-0 z-[99999] bg-black/95 overflow-auto p-4 font-mono text-[10px] text-green-400">
          <div className="flex justify-between items-center mb-3">
            <span className="text-yellow-400 font-bold text-[11px]">SOVEREIGN DEBUG</span>
            <button onClick={() => setShowDebug(false)} className="text-red-400 font-bold px-3 py-1 border border-red-400 rounded">CLOSE</button>
          </div>
          <div className="space-y-2">
            <p>wagmi connected: <span className="text-white">{String(wagmiConnected)}</span></p>
            <p>wagmi address: <span className="text-white">{wagmiAddress ?? 'undefined'}</span></p>
            <p>wagmiAddressRef: <span className="text-white">{wagmiAddressRef.current ?? 'undefined'}</span></p>
            <p>isLinked: <span className="text-white">{String(isLinked)}</span></p>
            <p>connectors: <span className="text-white">{connectors.map(c=>c.id).join(', ') || 'none'}</span></p>
            <hr className="border-green-900 my-2" />
            <p className="text-yellow-400">COOKIES:</p>
            {document.cookie.split('; ').filter(Boolean).map((c,i) => (
              <p key={i} className="break-all text-white/80">{c.substring(0, 120)}</p>
            ))}
            <hr className="border-green-900 my-2" />
            <p className="text-yellow-400">LOCALSTORAGE KEYS:</p>
            {Object.keys(localStorage).map((k,i) => (
              <p key={i} className="break-all">{k}: <span className="text-white/70">{(localStorage.getItem(k)||'').substring(0,80)}</span></p>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-5 pt-28 pb-[max(2rem,env(safe-area-inset-bottom,2rem))] gap-8 max-w-[500px] w-full mx-auto">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          {/* Security trust badge removed */}
          <h1 className="text-[2.4rem] sm:text-[3rem] font-black tracking-tight leading-[1.0] mb-2" style={{ color: INK }}>
            Track institutional capital
            <span className="block" style={{ color: '#0044CC' }}>before markets react.</span>
          </h1>
          <p className="text-[12px] font-medium leading-relaxed max-w-[300px] mx-auto" style={{ color: MUTED }}>
            Real-time on-chain intelligence — from mempool to execution. Your key never leaves your device.
          </p>
        </motion.div>

        {/* Wallet Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="w-full flex flex-col gap-3"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="flex-1 h-px bg-[#E5E5E5]" />
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#050505]/30">Connect Wallet</span>
            <div className="flex-1 h-px bg-[#E5E5E5]" />
          </div>

          {/* ──────────────────────────────────────────────────────────────────
              WALLET BUTTONS — Using Reown AppKit's useAppKit hook.
              Flow: click → pre-flight disconnect → AppKit modal opens →
              user picks wallet → WC v2 deep link → Android "Open with" dialog.
              ────────────────────────────────────────────────────────────────── */}
          <div className="w-full flex flex-col gap-3">
            {(() => {
              // Helper: open the correct wallet flow
              const openWalletModal = (walletId: string) => {
                if (isLinked && effectiveAddress) return;

                setConnecting(walletId);
                setWcTargetWallet(walletId);
                setWcDeepLink(null);
                setShowFallbackBtn(false);

                // Set wakeup flags before switching to wallet app
                try {
                  localStorage.setItem('sovereign_pending_wakeup', '1');
                  sessionStorage.setItem('sovereign_show_reconnect', '1');
                } catch {}

                const eth = typeof window !== 'undefined' ? (window as any).ethereum : null;
                const isMetaMaskBrowser = !!(eth?.isMetaMask && !eth?.isCoinbaseWallet);
                const isCoinbaseBrowser = !!(eth?.isCoinbaseWallet);

                // ── In-app wallet browser: connect directly via injected provider ──
                if (walletId === 'metamask' && isMetaMaskBrowser) {
                  const conn = connectors.find(c =>
                    ['io.metamask','metaMaskSDK','metaMask','injected'].includes(c.id)
                  );
                  if (conn) { connect({ connector: conn }); setTimeout(() => setConnecting(null), 8000); return; }
                }
                if (walletId === 'coinbase' && isCoinbaseBrowser) {
                  const conn = connectors.find(c =>
                    ['coinbaseWalletSDK','coinbaseWallet','injected'].includes(c.id)
                  );
                  if (conn) { connect({ connector: conn }); setTimeout(() => setConnecting(null), 8000); return; }
                }

                // ── Rainbow & 550+ Wallets ─────────────────────────────────────────
                // Different wallets use different deep-link schemes (rainbow://, trust://,
                // etc.). Rather than guess, we open the AppKit modal which handles
                // multi-wallet routing correctly and also provides the QR code fallback.
                if (walletId === 'wc') {
                  rkOpenModal({ view: 'Connect' });
                  setTimeout(() => setConnecting(null), 30000);
                  return;
                }

                // ── MetaMask / Coinbase — External mobile browser ─────────────────
                // ROOT CAUSE FIX: AppKit's "Open" button is inside a Shadow DOM Web
                // Component. Chrome Android loses the user gesture context as the
                // click crosses the shadow DOM boundary and silently blocks the
                // metamask:// / cbwallet:// navigation — so nothing happens.
                //
                // Solution: bypass AppKit's modal for these two wallets.
                // 1. Connect via wagmi walletConnect connector directly.
                // 2. Subscribe to 'display_uri' to receive the WC pairing URI.
                // 3. Render OUR OWN <a href="metamask://wc?uri=..."> in plain React DOM.
                // 4. User taps that anchor → Chrome fires the intent with a clean
                //    user gesture → MetaMask opens reliably.
                //
                // 8-second fallback: if display_uri never fires (e.g., existing WC
                // session is being reused, in which case wagmi auto-reconnects and
                // establishSession handles it), open AppKit modal as a safety net.
                const walletSchemes: Record<string, string> = {
                  metamask: 'metamask',
                  coinbase:  'cbwallet',
                };
                const scheme = walletSchemes[walletId];

                const wcConnector = connectors.find(
                  c => c.id === 'walletConnect' || c.type === 'walletConnect'
                );

                if (!wcConnector || !scheme) {
                  // Unknown wallet or no WC connector: use AppKit modal
                  rkOpenModal({ view: 'Connect' });
                  setTimeout(() => setConnecting(null), 30000);
                  return;
                }

                let deepLinkFired = false;

                const handleMsg = ({ type, data }: { type: string; data: unknown }) => {
                  if (type === 'display_uri' && typeof data === 'string') {
                    try { (wcConnector as any).emitter?.off?.('message', handleMsg); } catch {}
                    deepLinkFired = true;
                    const encoded = encodeURIComponent(data);
                    setWcDeepLink(`${scheme}://wc?uri=${encoded}`);
                  }
                };

                try { (wcConnector as any).emitter?.on?.('message', handleMsg); } catch {}

                try {
                  connect({ connector: wcConnector });
                } catch (e) {
                  // connect() threw synchronously — clean up and use AppKit modal
                  try { (wcConnector as any).emitter?.off?.('message', handleMsg); } catch {}
                  rkOpenModal({ view: 'Connect' });
                  setTimeout(() => setConnecting(null), 30000);
                  return;
                }

                // ── 8-second fallback ──────────────────────────────────────────────
                // If display_uri never fires, the WC connector is likely reusing an
                // existing session (good — wagmi will auto-establish the session via
                // the useEffect that watches isConnected+address) OR the connector
                // doesn't expose its emitter. In either case, open the AppKit modal
                // so the user always has a clear path forward.
                setTimeout(() => {
                  if (!deepLinkFired) {
                    try { (wcConnector as any).emitter?.off?.('message', handleMsg); } catch {}
                    if (!isLinked) {
                      rkOpenModal({ view: 'Connect' });
                    }
                  }
                }, 8000);

                // Auto-reset state after 30s
                setTimeout(() => { setConnecting(null); setWcDeepLink(null); }, 30000);
              };


              return (
                <>
                  {/* MetaMask — iOS Safari + Android Chrome deep-link */}
                  <WalletOption
                    logo="/wallets/metamask.svg"
                    name="MetaMask"
                    badge="iOS · Android · WalletConnect v2"
                    loading={connecting === 'metamask'}
                    onClick={() => openWalletModal('metamask')}
                    delay={0.1}
                  />

                  {/* Coinbase Wallet — native iOS/Android SDK */}
                  <WalletOption
                    logo="/wallets/coinbase.png"
                    name="Coinbase Wallet"
                    badge="iOS · Android · Smart Wallet"
                    loading={connecting === 'coinbase'}
                    onClick={() => openWalletModal('coinbase')}
                    delay={0.15}
                  />

                  {/* Rainbow & All — universal WC v2 */}
                  <WalletOption
                    logo="/wallets/rainbow.png"
                    name="Rainbow & 550+ Wallets"
                    badge="iOS · Android · Universal WC v2"
                    loading={connecting === 'wc'}
                    onClick={() => openWalletModal('wc')}
                    delay={0.2}
                  />
                </>
              );
            })()}
          </div>

          {/* ── Direct deep-link button ─────────────────────────────────────────
              Appears once wagmi's walletConnect connector emits 'display_uri'.
              This is a plain React <a> element — NOT inside AppKit's shadow DOM —
              so Chrome Android correctly recognises the tap as a user gesture and
              fires the metamask:// / cbwallet:// / wc:// intent.
          ─────────────────────────────────────────────────────────────────────── */}
          <AnimatePresence>
            {wcDeepLink && connecting && (
              <motion.div
                key="wc-deeplink"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                <a
                  href={wcDeepLink}
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-[#050505] text-[#FAF9F6] font-black uppercase tracking-widest text-[11px] active:scale-[0.97] transition-transform shadow-lg select-none"
                  onClick={() => {
                    // Clear after a moment so the button disappears once the
                    // user switches to the wallet app
                    setTimeout(() => setWcDeepLink(null), 1500);
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  Tap to Open{' '}
                  {wcTargetWallet === 'metamask' ? 'MetaMask'
                    : wcTargetWallet === 'coinbase' ? 'Coinbase Wallet'
                    : 'Your Wallet'}
                </a>
                <p className="text-center text-[9px] text-[#050505]/35 font-medium mt-2 tracking-wide">
                  Connection ready · Tap above to launch the app
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ECDSA notice */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-[#E5E5E5] mt-2">
            <Fingerprint size={14} className="text-[#050505]/25 mt-0.5 shrink-0" />
            <p className="text-[10px] text-[#050505]/40 font-medium leading-relaxed">
              ECDSA Verification · Non-custodial · Private keys never leave your device.
            </p>
          </div>
        </motion.div>
      </main>

      {/* ── Institution-Grade Mobile Footer (Synced with PC Downhead) ── */}
      <div className="relative w-full overflow-hidden mt-auto bg-[#020202] text-white selection:bg-[#D4AF37]/30 rounded-t-3xl border-t border-white/10">
        
        {/* WAVE IMAGE — Full bleed behind content */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/olas-hokusai-4k.png"
            alt="Wave pattern"
            className="w-full h-full object-cover object-bottom"
          />
          <div className="absolute inset-0 bg-[#020202]/85" />
        </div>

        <footer className="relative z-10 w-full px-6 pt-16 pb-[calc(3rem+env(safe-area-inset-bottom))] flex flex-col gap-10">
          
          {/* Upper: Branding */}
          <div className="flex flex-col gap-3 text-center items-center">
            <h2 className="text-3xl font-light leading-none tracking-tight text-[#FAF9F6]">
              Whale Alert Network<span className="text-[#D4AF37]">.</span>
            </h2>
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#8A94A6]">
              Institutional Terminal Layer
            </p>
          </div>

          {/* Middle: Subscription */}
          <div className="w-full flex flex-col gap-3 z-20">
             <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#8A94A6]/70 text-center">
                Establish Academic Correspondence
             </p>
             <form onSubmit={(e) => {
                 e.preventDefault();
                 const email = (e.target as any).email.value;
                 if (!email) return;
                 const btn = (e.target as any).querySelector('button');
                 btn.innerHTML = 'Sending...';
                 btn.disabled = true;
                 fetch('/api/subscribe', {
                     method: 'POST',
                     body: JSON.stringify({ email })
                 }).then(() => {
                     btn.innerHTML = 'Subscribed';
                 }).catch(() => {
                     btn.innerHTML = 'Error';
                     btn.disabled = false;
                 });
             }} className="flex flex-col overflow-hidden rounded border border-white/10 bg-[#050505]/70 w-full max-w-[320px] mx-auto shadow-xl">
                <input
                   name="email"
                   type="email"
                   placeholder="ENTER SECURE EMAIL"
                   className="bg-transparent px-4 py-3 outline-none font-mono text-[10px] tracking-widest text-[#E0E0E0] placeholder:text-[#545F73] text-center"
                />
                <button type="submit" className="px-4 py-3.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] bg-[#EAEAEA] text-[#0A0A0A] hover:bg-white transition-colors active:scale-95 disabled:opacity-50">
                   Subscribe
                </button>
             </form>
          </div>

          <div className="w-full h-px bg-white/5" />

          {/* Lower: Nav Links + Copyright */}
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-4">
              {[
                ['Privacy Policy', '/privacy'], 
                ['Technical Docs', '/docs'], 
                ['Terms of Service', '/terms']
              ].map(([label, href]) => (
                <a key={label} href={href} className="text-[9px] font-mono uppercase tracking-[0.2em] font-medium text-[#8A94A6] hover:text-[#D4AF37] transition-colors relative z-20 p-2 -m-2">
                   {label}
                </a>
              ))}
            </div>
            
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#545F73] text-center">
              © 2026 Whale Alert Network. Pure Mathematics.
            </p>

            {/* ─── Powered By Aztec ─────────────────────────────── */}
            <div className="flex flex-col items-center gap-2.5 pt-4 relative z-50">
              <span className="font-mono text-[8px] uppercase tracking-[0.35em] text-[#545F73]/90 font-bold">
                Powered by
              </span>
              <a
                href="https://aztec.network"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5 opacity-80 hover:opacity-100 transition-all duration-500 cursor-pointer"
                aria-label="Built on Aztec Network"
              >
                {/* Aztec geometric diamond mark — white for dark bg */}
                <svg
                  width="16" height="16"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="group-hover:scale-110 group-hover:drop-shadow-[0_0_6px_rgba(212,175,55,0.5)] transition-all duration-300"
                >
                  <path d="M16 2L30 16L16 30L2 16Z" fill="white" fillOpacity="0.9"/>
                  <path d="M16 7L25 16L16 25L7 16Z" fill="#020202" fillOpacity="0.85"/>
                  <path d="M16 11L21 16L16 21L11 16Z" fill="white" fillOpacity="0.7"/>
                </svg>
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.22em] text-[#EAEAEA] group-hover:text-[#D4AF37] transition-colors duration-300">
                  Aztec
                </span>
              </a>
            </div>

          </div>

        </footer>
      </div>
    </div>
  );
}
