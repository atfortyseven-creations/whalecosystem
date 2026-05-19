"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { ZKBiometricGate } from "@/components/security/ZKBiometricGate";
import { AztecArchitectureSection } from "./AztecArchitectureSection";
import { SovereignFooter } from "./SovereignFooter";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAccount, useConnect, useSignMessage, useDisconnect, useReconnect, useBalance, useEnsName } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { WhaleLogo } from "@/components/shared/WhaleLogo";
import { useSovereignSignOut } from '@/hooks/useSovereignSignOut';
import { 
  Scan, MessageSquare, LogOut, MessageCircle, ScanLine, 
  Fingerprint, ChevronDown, CheckCircle, Zap, Shield, Menu,
  ArrowRight, Loader2, CheckCircle2, AlertCircle, RefreshCw, Mail, Info, X, PieChart 
} from 'lucide-react';
import { RemoteLottie } from '@/components/ui/RemoteLottie';

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
    '  SECURE ACCESS HANDSHAKE',
    '═══════════════════════════════',
    '',
    `Identity: ${address}`,
    `Nonce: ${Date.now()}`,
    `Network: WHALE_ALERT_NETWORK_V1`,
    '',
    'By signing you confirm that',
    'you are the sole owner of this',
    'address and authorize access',
    'to the secure dashboard.',
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
      className="group w-full flex items-center gap-4 p-4 rounded-2xl border border-black/10 bg-white hover:bg-black/[0.02] hover:border-black/20 active:scale-[0.97] transition-all duration-200 shadow-sm disabled:opacity-60"
    >
      <div className="w-11 h-11 rounded-xl bg-black/[0.03] border border-black/5 flex items-center justify-center p-2 overflow-hidden shrink-0">
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
  address, onSigned, onRetry, error, isSigning, wcDeepLink,
}: {
  address: string; onSigned: () => void; onRetry: () => void;
  error: string | null; isSigning: boolean; wcDeepLink?: string | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
      style={{ background: "rgba(255,255,255,0.98)", backdropFilter: "blur(24px)" }}
    >
      <div className="w-full max-w-sm flex flex-col items-center gap-5 text-center">
        <div className="w-20 h-20 rounded-[2rem] bg-white border border-black/10 shadow-lg flex items-center justify-center">
          {isSigning ? (
            <RefreshCw size={28} className="text-black/40 animate-spin" />
          ) : error ? (
            <AlertCircle size={28} className="text-red-500" />
          ) : (
            <Fingerprint size={28} className="text-[#050505]" />
          )}
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-black/10 rounded-full shadow-sm">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#050505]/60 font-mono">
            {address.slice(0, 8)}…{address.slice(-6)}
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-[24px] font-black tracking-tighter text-[#050505] leading-none">
          {isSigning ? "Action Required" : error ? "Connection Failed" : "Connecting..."}
          </h2>
          <p className="text-[12px] text-[#050505]/50 leading-relaxed">
            {error
              ? "Could not cryptographically verify the wallet. Please try again."
              : isSigning
              ? "Please open your wallet app to approve the signature request. This is required for secure platform access."
              : "Establishing encrypted tunnel with the Global Network... Please wait."}
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
            className="w-full py-4 rounded-2xl bg-[#050505] text-white font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-3 shadow-lg active:scale-[0.97] transition-all hover:bg-black/90"
          >
            <RefreshCw size={16} />
            Retry Connection
          </button>
        ) : isSigning ? (
          <div className="w-full flex flex-col gap-3">
             <div className="w-full py-3 rounded-2xl bg-black/5 border border-black/10 text-black/60 font-black uppercase tracking-widest text-[10px] flex items-center justify-center text-center px-4">
               Approve signature in your wallet app
             </div>
             {wcDeepLink ? (
               <a
                  href={wcDeepLink}
                  rel="noopener noreferrer"
                  className="w-full py-4 rounded-2xl bg-[#050505] text-white font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-3 shadow-lg active:scale-[0.97] transition-transform select-none hover:bg-black/90"
               >
                 Open Wallet App
               </a>
             ) : (
                <button
                  onClick={onRetry}
                  className="w-full py-4 rounded-2xl bg-[#050505] text-white font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-3 shadow-lg active:scale-[0.97] transition-all hover:bg-black/90"
                >
                  Open Wallet To Sign
                </button>
             )}
          </div>
        ) : (
          <div className="w-full px-4 py-3 rounded-2xl border border-black/10 bg-white flex items-center justify-center gap-3">
            <Loader2 size={16} className="animate-spin text-black/40" />
            <span className="text-[#050505] font-black uppercase tracking-widest text-[11px]">Validating...</span>
          </div>
        )}
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
  address, onScan, showScanner, onCloseScanner, onBack, connectorName, chainId, onDisconnect, signMessageAsync, initialScanData, setShowKyc
}: {
  address: string; onScan: () => void;
  showScanner: boolean; onCloseScanner: () => void;
  onBack?: () => void;
  connectorName?: string;
  chainId?: number;
  onDisconnect?: () => void;
  signMessageAsync?: any;
  initialScanData?: string | null;
  setShowKyc: (v: boolean) => void;
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
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden font-sans flex flex-col bg-[#FAF9F6] text-[#050505]">
      <main className="relative z-10 flex-1 flex flex-col items-center px-6 pt-10 pb-8 gap-5 max-w-[480px] w-full mx-auto">
        
        {/* Header & Logo */}
        <motion.div 
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
           className="w-full flex flex-col items-center justify-center gap-5 mb-4 mt-2"
        >
           <WhaleLogo className="h-16 w-auto text-[#050505]" />
           <div className="flex flex-col items-center text-center">
             <h1 className="text-[22px] font-black uppercase tracking-[0.2em] text-[#050505] leading-none">Whale Alert Network</h1>
             <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#050505]/40 mt-2 mb-4">Professional Platform</p>
             <div className="flex items-center gap-2 px-3 py-1.5 bg-[#050505]/5 rounded-full border border-[#050505]/10 mt-2">
                <MessageCircle size={14} className="text-[#050505]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#050505]">
                  Available now, Whale Chat !
                </span>
             </div>
           </div>
        </motion.div>

        {/* ── KYC Identity Card ── */}
        <motion.div
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.1, duration: 0.6 }}
           className="w-full bg-white rounded-[32px] border border-[#050505]/10 shadow-xl overflow-hidden flex flex-col"
        >
          {/* Identity card header */}
          <div className="bg-[#FAF9F6] px-6 py-8 flex flex-col items-center text-center gap-2 border-b border-[#050505]/5">
            <p className="text-[44px] font-black tracking-tighter text-[#050505] leading-none tabular-nums">
              {fmtTime(now)}
            </p>
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#050505]/40">{fmtDate(now)}</p>
          </div>

          {/* On-chain data row */}
          <div className="grid grid-cols-2 gap-px bg-[#050505]/5">
            <div className="bg-white px-5 py-5 flex flex-col items-center text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#050505]/40 mb-1.5">Network</p>
              <p className="text-[13px] font-black uppercase tracking-widest text-[#050505] truncate">{chainName(chainId)}</p>
            </div>
            <div className="bg-white px-5 py-5 flex flex-col items-center text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#050505]/40 mb-1.5">Balance</p>
              <p className="text-[13px] font-black font-mono tracking-wider text-[#050505] truncate">
                {fmtBalance() ?? <span className="text-[#050505]/25">—</span>}
              </p>
            </div>
          </div>

          {/* Wallet / identity row */}
          <div className="grid grid-cols-2 gap-px bg-[#050505]/5 border-t border-[#050505]/5">
            <div className="bg-white px-5 py-5 flex flex-col items-center text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#050505]/40 mb-1.5">Provider</p>
              <p className="text-[13px] font-black uppercase tracking-widest text-[#050505] truncate">{connectorName || 'Secure Wallet'}</p>
            </div>
            <div className="bg-white px-5 py-5 flex flex-col items-center text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#050505]/40 mb-1.5">Identity</p>
              <p className="text-[13px] font-black uppercase tracking-widest text-[#050505] truncate">{ensName ?? checksumAddr(address)}</p>
            </div>
          </div>

          {/* Full address */}
          <div className="px-6 py-6 bg-white border-t border-[#050505]/5 flex flex-col items-center text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#050505]/40 mb-3">Verified On-Chain Address</p>
            <div className="flex items-center justify-center gap-2 bg-[#FAF9F6] border border-[#050505]/5 rounded-2xl px-5 py-4 w-full">
              <p className="text-[12px] font-mono text-[#050505] font-bold tracking-tight break-all leading-relaxed">
                {address}
              </p>
            </div>
          </div>
        </motion.div>



        {/* ── Signature / QR sync note ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="w-full flex items-start gap-3 px-5 py-4 rounded-[20px] bg-white border border-[#050505]/10 shadow-sm"
        >
          <Scan size={14} className="text-[#050505]/60 mt-0.5 shrink-0" />
          <p className="text-[10px] text-[#050505]/60 font-medium leading-relaxed">
            Scan the <span className="font-black text-[#050505]/85">QR Code</span> from the Desktop Platform to link your session securely — no additional signature required.
          </p>
        </motion.div>

        {/* ── SCANNER UNLOCKED badge ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full flex items-center gap-3 px-5 py-4 rounded-[20px] bg-[#00C076]/10 border border-[#00C076]/20"
        >
          <div className="w-8 h-8 rounded-full bg-[#00C076]/20 flex items-center justify-center shrink-0">
            <Scan size={16} className="text-[#00C076]" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00C076]">Scanner Unlocked</span>
            <span className="text-[9px] font-mono text-[#00C076]/70 mt-0.5 leading-relaxed">
              You can use the scanner to link the desktop platform.
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
            className="w-full flex items-center justify-center gap-3 py-5 rounded-[20px] font-black uppercase tracking-[0.15em] bg-[#050505] hover:bg-[#050505]/90 active:scale-[0.97] transition-all text-white shadow-lg"
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
            className="w-full flex items-center justify-center gap-3 py-5 rounded-[20px] font-black uppercase tracking-[0.15em] border border-[#050505]/10 bg-white hover:bg-[#050505]/5 transition-all group shadow-sm"
            style={{ fontSize: "11px", color: "#050505" }}
          >
            <MessageSquare size={18} className="group-hover:text-[#050505] transition-colors" />
            Access Whale Alert Forum
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
            className="w-full flex items-center justify-center gap-3 py-5 rounded-[20px] font-black uppercase tracking-[0.15em] border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-all text-purple-600 shadow-sm"
            style={{ fontSize: "11px" }}
          >
            <MessageCircle size={18} />
            Enter Whale Chat Encrypted
          </Link>
        </motion.div>

        {/* ── Portfolio CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.5 }}
          className="w-full mt-2"
        >
          <Link
            href="/portfolio"
            className="w-full flex items-center justify-center gap-3 py-5 rounded-[20px] font-black uppercase tracking-[0.15em] border border-[#050505]/10 bg-white hover:bg-[#050505]/5 transition-all text-[#050505] shadow-sm"
            style={{ fontSize: "11px" }}
          >
            <PieChart size={18} />
            Access Portfolio
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
            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-black uppercase tracking-[0.15em] bg-transparent hover:bg-[#050505]/5 transition-all mt-2 text-red-500/80 hover:text-red-600 active:scale-95"
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
          className="text-[9px] font-mono text-[#050505]/40 text-center leading-relaxed px-4 pb-6"
        >
          On the Desktop Platform, click <span className="font-black text-[#050505]/80">Direct QR Handshake</span>, then scan the code with this button to link your session.
        </motion.p>
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
  const { disconnect, disconnectAsync } = useDisconnect();
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
  const signingInProgressRef = useRef(false);
  const [signingError, setSigningError] = useState<string | null>(null);
  const [showKyc, setShowKyc] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

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
    if (isLinked || isActuallySigning || signingInProgressRef.current) return;

    signingInProgressRef.current = true;
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
      let signature, message;
      
      // FIX: Check for locally cached signature AND message to prevent mismatch failures
      let cached = localStorage.getItem(`sovereign_auth_${norm}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          signature = parsed.signature;
          message = parsed.message;
        } catch (e) {}
      }

      if (!signature || !message) {
        message = buildSovereignMessage(norm);
        signature = await signMessageAsync({ message }) as string;
        localStorage.setItem(`sovereign_auth_${norm}`, JSON.stringify({ signature, message }));
      }

      try {
         const { keccak256 } = await import('viem');
         const seed = keccak256(signature as `0x${string}`);
         localStorage.setItem(`whale_chat_seed_${norm}`, seed);
      } catch (seedErr) {
         console.warn('[Auth] Could not derive chat seed during handshake', seedErr);
      }

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

      // REDIRECT TO SCANNER (ConnectedScreen) — never to /dashboard directly on mobile
      const params = new URLSearchParams(window.location.search);
      const next = params.get('next') || '/connect';
      console.log('[Auth] Redirecting to:', next);
      if (next !== window.location.pathname) {
          window.location.replace(next);
      }
    } catch (err: any) {
      console.error('[Auth] Handshake failed:', err);
      // Clear the cached signature on ANY error — a bad/stale/RPC-failed
      // signature would cause every subsequent retry to fail with the same error.
      try { localStorage.removeItem(`sovereign_auth_${norm}`); } catch {}
      const raw = err?.message || 'Verification failed';
      // Viem surfaces low-level RPC failures with a very technical message.
      // Surface a friendlier string so the Retry button is the clear CTA.
      const isViemRpc = raw.toLowerCase().includes('rpc') || raw.toLowerCase().includes('unknown');
      setSigningError(isViemRpc ? 'RPC error — please retry the connection.' : raw);
    } finally {
      signingInProgressRef.current = false;
      setIsActuallySigning(false);
    }
  }, [isLinked, isActuallySigning, signMessageAsync]);

  // ── onFocusRecheck — stable useCallback so multiple effects can reference it —
  const onFocusRecheck = useCallback(() => {
    if (isLinked) return;
    // Fast path: wagmi already resolved the address
    if (wagmiAddressRef.current) { 
      // establishSession(wagmiAddressRef.current); // DISABLED
      return; 
    }
    // Cancel any in-flight poll before starting a new one
    if (pollIntervalRef.current) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null; }
    let attempts = 0;
    pollIntervalRef.current = setInterval(() => {
      attempts++;
      // Check 1: wagmi ref
      if (wagmiAddressRef.current) {
        clearInterval(pollIntervalRef.current!); pollIntervalRef.current = null;
        // establishSession(wagmiAddressRef.current); // DISABLED: We no longer auto-handshake to preserve single-signature flow
        return;
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
              // establishSession(addr); // DISABLED: We no longer auto-handshake to preserve single-signature flow
              return; 
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
              
              const hasHandshake = document.cookie.includes('sovereign_handshake=');
              if (!hasHandshake) {
                console.log('[Sovereign:Sync] Missing session cookie, skipping automatic handshake...');
              }

              clearInterval(pollIntervalRef.current!); pollIntervalRef.current = null; 
              // establishSession(addr); // DISABLED: We no longer auto-handshake to preserve single-signature flow
              return; 
            }
          }
        }
      } catch {}
      
      // Increased polling limit to 120 (60s at 500ms intervals) to give WalletConnect more time
      // Polling frequency reduced from 50ms to 500ms to prevent thermal throttling and CPU spikes.
      if (attempts >= 120) {
        clearInterval(pollIntervalRef.current!); pollIntervalRef.current = null;
        // ── LAST RESORT: check if sovereign_handshake cookie was set this session ──
        try {
          const cookieMatch = document.cookie.match(/sovereign_handshake=(0x[0-9a-fA-F]{40,})/i);
          if (cookieMatch?.[1]) {
            console.log('[Sovereign:Recovery] Cookie found after poll timeout — using it:', cookieMatch[1]);
            // establishSession(cookieMatch[1]); // DISABLED: We no longer auto-handshake to preserve single-signature flow
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
  }, [isLinked]);

  // Wallet state transition tracking to clear __disconnected__ ONLY on new user connection
  const prevConnectedRef = useRef(isConnected);
  useEffect(() => {
    if (isConnected && !prevConnectedRef.current) {
      try { sessionStorage.removeItem("__disconnected__"); } catch {}
    }
    prevConnectedRef.current = isConnected;
  }, [isConnected]);

  useEffect(() => {
    if (!mounted || isLinked || isActuallySigning || signingInProgressRef.current || signingError) return;
    try {
      if (sessionStorage.getItem("__disconnected__") === "1") {
        return;
      }
    } catch {}
    if (isConnected && address) {
      establishSession(address);
    }
  }, [mounted, isConnected, address, isLinked, isActuallySigning, signingError, establishSession]);

  // ── forceFullReconnect — Manual sync trigger for Android Chrome ────────────
  const forceFullReconnect = useCallback(() => {
    try { sessionStorage.removeItem("__disconnected__"); } catch {}
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
    const message = `Authorize Institutional Platform Access for session: ${sessionParam}\nAddress: ${address}\nTimestamp: ${Date.now()}`;
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
          t.textContent = '✓ Desktop Platform Unlocked';
          document.body.appendChild(t);
          setTimeout(() => t.remove(), 4000);
        }
      })
      .catch(() => {}); // Non-blocking — user already authenticated, this is convenience sync
  }, [isLinked, address, sessionParam]); // signMessageAsync intentionally omitted — stable wagmi ref



  // ── handleDisconnect ──
  const { nuclearDisconnect } = useSovereignSignOut();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = useCallback(async () => {
    if (isDisconnecting) return;
    setIsDisconnecting(true);
    await nuclearDisconnect();
  }, [isDisconnecting, nuclearDisconnect]);

  if (!mounted) return null;

  // (The previous showManualReconnect full-screen overlay was removed to prevent 
  // blocking the AppKit modal if visibility changes while the user is still selecting a wallet)

  // ── Render: Session exists — show immediately using cookie address ──────────
  // We NEVER wait for wagmi to reconnect. The cookie IS the source of truth.
  // The cookie value IS the wallet address: sovereign_handshake=0xABCD...


  if (isLinked && effectiveAddress) {
    return (
      <div className="w-full min-h-[100dvh] bg-transparent">
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
           setShowKyc={setShowKyc}
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
          wcDeepLink={wcDeepLink}
          onSigned={() => {}}
          onRetry={() => {
            // Clear error + cached auth so the retry always signs fresh
            setSigningError(null);
            try { localStorage.removeItem(`sovereign_auth_${(address || '').toLowerCase()}`); } catch {}
            if (address) establishSession(address);
          }}
        />
      </div>
    );
  }

  // ── Render: Unified Mobile Landing & Login Modal ──
  // CRITICAL: This block must be AFTER all isLinked guards above.
  return (
    <div className="w-full min-h-[100dvh] bg-[#F9F8F6] relative font-sans text-[#050505]">
      
      {/* ── Sticky Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 transform-gpu"
        style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)", borderBottom: `1px solid rgba(0,0,0,0.06)`, boxShadow: "0 2px 20px rgba(0,0,0,0.03)", willChange: "transform, opacity" }}
      >
        <div className="flex items-center gap-3">
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
        {!showConnectOverlay && (
          <button
            onClick={() => setShowConnectOverlay(true)}
            className="px-4 py-2 rounded-xl bg-black text-white text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
          >
            Connect Wallet
          </button>
        )}
      </motion.header>

      {/* ── Background Landing Page ── */}
      <div className="flex flex-col w-full relative z-0">
        <ImmersiveManifestoLanding onOpenScanner={() => setShowConnectOverlay(true)} hideMap={true} />
        <AztecArchitectureSection />
        <SovereignFooter />
      </div>

      {/* ── Login Modal Overlay (Light Mode) ── */}
      <AnimatePresence>
        {showConnectOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-md"
            onClick={() => setShowConnectOverlay(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full sm:max-w-md bg-white border-t border-black/10 sm:border sm:rounded-3xl rounded-t-[32px] flex flex-col items-center px-6 pt-8 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowConnectOverlay(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"
              >
                <X size={16} className="text-black/50" />
              </button>

              <div className="w-12 h-1 rounded-full bg-black/10 absolute top-3 sm:hidden" />

      {/* Main Content (Modal Body) */}
      <div className="w-full flex flex-col items-center mt-2">
        <h2 className="text-[1.5rem] font-black tracking-tight leading-[1.0] mb-2 text-[#050505] text-center">
          Connect Wallet
        </h2>
        <p className="text-[11px] font-medium leading-relaxed max-w-[280px] mx-auto text-[#050505]/60 text-center mb-6">
          Approve the signature request in your wallet to securely access the terminal.
        </p>

        {/* Wallet Buttons */}
        <div className="w-full flex flex-col gap-3">

          {/* ──────────────────────────────────────────────────────────────────
              WALLET BUTTONS — Using Reown AppKit's useAppKit hook.
              Flow: click → pre-flight disconnect → AppKit modal opens →
              user picks wallet → WC v2 deep link → Android "Open with" dialog.
              ────────────────────────────────────────────────────────────────── */}
          <div className="w-full flex flex-col gap-3">
            {(() => {
              // Helper: open the correct wallet flow
                const openWalletModal = async (walletId: string) => {
                  if (isLinked && effectiveAddress) return;
                  try { sessionStorage.removeItem("__disconnected__"); } catch {}

                  setConnecting(walletId);
                  setWcTargetWallet(walletId);
                  setWcDeepLink(null);
                  setShowFallbackBtn(false);

                  // Pure AppKit usage to avoid forcing the dapp browser
                  // AppKit native connection correctly uses standard Universal Links to sign and return to Chrome.
                  rkOpenModal({ view: 'Connect' });
                  setTimeout(() => setConnecting(null), 10000);
                };


              return (
                <>
                  {/* Universal WC v2 */}
                  <WalletOption
                    logo="/official-whale-monochrome.png"
                    name="WalletConnect"
                    badge="Other Wallets (QR / AppKit)"
                    loading={connecting === 'wc'}
                    onClick={() => openWalletModal('wc')}
                    delay={0.1}
                  />
                  <div className="w-full flex justify-center mt-4 mb-2">
                    <RemoteLottie path="system-shots/Paper airplane.json" className="w-full max-w-[200px] h-[120px] object-contain" />
                  </div>
                </>
              );
            })()}
          </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-black/[0.03] border border-black/5 mt-6 w-full">
                <Fingerprint size={14} className="text-black/40 mt-0.5 shrink-0" />
                <p className="text-[10px] text-black/50 font-medium leading-relaxed">
                  ECDSA Verification · Non-custodial · Private keys never leave your device.
                </p>
              </div>
            </div>
          </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
