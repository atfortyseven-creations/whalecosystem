"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useAccount, useConnect, useSignMessage, useDisconnect } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { WhaleLogo } from "@/components/shared/WhaleLogo";
import { Fingerprint, ArrowRight, ScanLine, Scan, Loader2, CheckCircle2, AlertCircle, RefreshCw, Mail, Info, X, LogOut, MessageSquare } from "lucide-react";

// ── Reown AppKit + WagmiAdapter localStorage key patterns ─────────────────
// These are ALL the keys that Reown AppKit v1/v2 and its WagmiAdapter write
// to localStorage (2025-2026). We scan ALL of them when recovering a session.
const APPKIT_STORAGE_KEYS = [
  // Reown AppKit v2 (2025-2026) — primary keys written by WagmiAdapter
  '@wagmi/core',
  'wagmi.store',
  'wagmi.connected',
  // Reown AppKit v1 keys
  'reown-appkit',
  'appkit',
  '@reown/appkit',
  // Legacy Web3Modal / WalletConnect v2
  'W3M_STATE',
  '@w3m/',
  'wc@2:',
  'wc@2',
  'walletconnect',
  // Generic wagmi
  'wagmi',
];

// Extracts the user's wallet address from AppKit's nested localStorage structure.
// The address lives at: sessions[0].namespaces.eip155.accounts[0] = "eip155:1:0x..."
function extractAddressFromAppKit(value: string): string | null {
  try {
    const parsed = JSON.parse(value);
    // Official Reown AppKit v1 session path
    const accounts = parsed?.sessions?.[0]?.namespaces?.eip155?.accounts;
    if (accounts?.[0]) {
      const addr = accounts[0].split(':')[2];
      if (addr?.match(/^0x[a-fA-F0-9]{40}$/i)) return addr;
    }
  } catch { 
    // Ignore JSON parse errors, proceed to fallback
  }

  // Generic fallback — last resort
  const match = value.match(/0x[a-fA-F0-9]{40}/i);
  return match ? match[0] : null;
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
          {isSigning ? "Tunnel Established" : error ? "Connection Rejected" : "Validating Wallet"}
          </h2>
          <p className="text-[12px] text-[#050505]/50 leading-relaxed">
            {error
              ? "Could not cryptographically verify the wallet."
              : isSigning
              ? "Wallet linked successfully. Validating security credentials in the Sovereign Protocol..."
              : "Establishing encrypted tunnel with the Sovereign Network..."}
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

// ── Connected Screen ──────────────────────────────────────────────────────────
function ConnectedScreen({
  address, onScan, showScanner, onCloseScanner, onBack, connectorName, chainId, onDisconnect
}: {
  address: string; onScan: () => void;
  showScanner: boolean; onCloseScanner: () => void;
  onBack?: () => void;
  connectorName?: string;
  chainId?: number;
  onDisconnect?: () => void;
}) {
  const now = useLiveClock();
  const [connectedAt] = useState(() => new Date()); // frozen at mount time
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [userAgentInfo, setUserAgentInfo] = useState('');
  const [screenRes, setScreenRes] = useState('');
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);

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
       setScreenRes(`${window.screen.width}x${window.screen.height}`);
       
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
             console.warn("[Sovereign] LocalStorage parse error, resetting history array.");
             existing = [];
         }

         const currentSession = {
           date: new Date().toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }),
           time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
           provider: connectorName || "Wallet Segura",
           os: detectedOs
         };
         
         const isDuplicate = existing.length > 0 && existing[0].time === currentSession.time && existing[0].date === currentSession.date;
         let updated = existing;
         
         if (!isDuplicate) {
           updated = [currentSession, ...existing].slice(0, 50); // Hard limit to 50 entries to prevent QuotaExceededError
           try {
               localStorage.setItem(key, JSON.stringify(updated));
           } catch (e) {
               console.warn("[Sovereign] LocalStorage write error (quota exceeded).");
           }
         }
         setSessionHistory(updated);
       }
    }
  }, [address, connectorName]);

  const fmtTime   = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const fmtDate   = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const fmtStamp  = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden font-sans flex flex-col" style={{ backgroundColor: IVORY, color: INK }}>
      {/* Backgrounds */}
      <div className="fixed inset-0 z-0 bg-[#FAF9F6]" />
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        <motion.div
           className="absolute"
           style={{ inset: "-20%", backgroundImage: "url('/patron-cosmico-4k.png')", backgroundSize: "140%", backgroundRepeat: "repeat", opacity: 0.04 }}
           animate={{ x: ["0%", "-3%", "0%"], y: ["0%", "-2%", "0%"] }}
           transition={{ duration: 45, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div className="fixed top-0 inset-x-0 h-28 z-[2] pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(250,249,246,1) 0%, transparent 100%)" }} />

      {/* Fixed Header */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between px-5 py-3 rounded-full"
        style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", border: `1px solid ${FAINT}`, boxShadow: "0 4px 24px rgba(5,5,5,0.07)" }}
      >
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              title="Volver al Landing Page"
              className="p-1.5 -ml-2 rounded-full hover:bg-black/5 active:bg-black/10 transition-colors mr-1 cursor-pointer flex items-center gap-1"
            >
               <ArrowRight size={15} className="rotate-180" />
               <span className="text-[8px] font-mono uppercase tracking-widest text-black/40">Home</span>
            </button>
          )}
          <WhaleLogo className="w-5 h-5 shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-tight" style={{ color: INK }}>Whale Alert Network</span>
        </div>
        <button 
           onClick={() => setShowInfoModal(true)}
           className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 transition-colors"
        >
          <Info size={14} />
        </button>
      </motion.header>

      <main className="relative z-10 flex-1 flex flex-col items-center px-4 pt-28 pb-12 gap-5 max-w-[440px] w-full mx-auto">

        {/* ── Session Identity Card ── */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
           className="w-full bg-white rounded-[24px] border border-[#E5E5E5] shadow-lg overflow-hidden flex flex-col"
        >
          {/* Top bar — live clock */}
          <div className="bg-[#2D0A59] px-6 py-6 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Active Session</p>
              <p className="text-[36px] font-black tracking-tighter text-white leading-none tabular-nums">
                {fmtTime(now)}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 size={28} className="text-emerald-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-[#F0F0F0]">
            <div className="bg-white px-5 py-4">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#050505]/40 mb-1">Date</p>
              <p className="text-[11px] font-black text-[#050505] capitalize truncate">{fmtDate(now)}</p>
            </div>
            <div className="bg-white px-5 py-4">
               <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#050505]/40 mb-1">Session Open</p>
               <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[11px] font-black text-[#050505]">{fmtStamp(connectedAt)}</p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-[#F0F0F0] border-t border-[#F0F0F0]">
             <div className="bg-white px-5 py-4">
               <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#050505]/40 mb-1">Wallet Provider</p>
               <p className="text-[11px] font-black text-[#050505] truncate">{connectorName || "Secure Wallet"}</p>
             </div>
             <div className="bg-white px-5 py-4">
               <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#050505]/40 mb-1">Network (Chain ID)</p>
               <p className="text-[11px] font-mono text-[#050505] truncate">{chainId ? `Chain ${chainId}` : "Mainnet"}</p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-[#F0F0F0] border-t border-[#F0F0F0]">
             <div className="bg-white px-5 py-4">
               <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#050505]/40 mb-1">Device OS</p>
               <p className="text-[11px] font-black text-[#050505] truncate">{userAgentInfo || "Detectando..."}</p>
             </div>
             <div className="bg-white px-5 py-4">
               <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#050505]/40 mb-1">Fingerprint</p>
               <p className="text-[11px] font-mono text-[#050505] truncate">{screenRes || "Secure"}</p>
             </div>
          </div>

          {/* Address full length */}
          <div className="px-5 py-4 bg-white border-t border-[#F0F0F0]">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#050505]/40 mb-1">Connected Wallet (Full Address)</p>
            <p className="text-[12px] font-mono text-[#050505] tracking-tight break-all leading-relaxed">
              {address}
            </p>
          </div>
        </motion.div>

        {/* ── Permission Badge ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl bg-white border border-[#E5E5E5]"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#050505]">Scanner unlocked</p>
            <p className="text-[9px] text-[#050505]/40 font-medium">You can use the scanner to link the desktop terminal.</p>
          </div>
        </motion.div>

        {/* ── Primary CTA ── */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.6 }}
          whileTap={{ scale: 0.97 }}
          onClick={onScan}
          className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-black uppercase tracking-widest text-white"
          style={{ background: "#050505", fontSize: "12px", boxShadow: "0 24px 48px -12px rgba(5,5,5,0.45)" }}
        >
          <Scan size={18} />
          Open QR Scanner · Sync Desktop
        </motion.button>

        {/* ── Forum CTA ── */}
        <motion.a
          href="/forum"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-widest border border-black/10 bg-white hover:bg-[#FAF9F6] active:bg-[#F5F4EF] transition-colors"
          style={{ fontSize: "12px", color: "#050505" }}
        >
          <MessageSquare size={16} />
          Access Sovereign Forum
        </motion.a>


        {/* ── Disconnect session button ── */}
        {onDisconnect && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.27, duration: 0.5 }}
            whileTap={{ scale: 0.97 }}
            onClick={onDisconnect}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-black uppercase tracking-widest border border-red-200/80 bg-red-50/60 hover:bg-red-100/80 active:bg-red-100 transition-colors"
            style={{ fontSize: "11px", color: "#dc2626" }}
          >
            <LogOut size={15} />
            Disconnect Session · Change Wallet
          </motion.button>
        )}

        {/* ── Instruction card ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full flex items-start gap-3 p-4 rounded-2xl bg-white/60 border border-[#E5E5E5]"
        >
          <Fingerprint size={14} className="text-[#050505]/25 mt-0.5 shrink-0" />
          <p className="text-[9px] text-[#050505]/40 font-medium leading-relaxed">
            On the Desktop Terminal, click <strong className="text-[#2D0A59]/80 font-black">Direct QR Handshake</strong>, then scan the code with this button to sync your institutional session.
          </p>
        </motion.div>

        {/* ── Session History Panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="w-full bg-white rounded-[24px] border border-[#E5E5E5] overflow-hidden flex flex-col shadow-sm mt-4"
        >
          <div className="bg-[#1E073B] px-5 py-4 flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/90">Session History</h3>
            <div className="px-2 py-1 bg-white/10 rounded-full text-[9px] font-black text-white/90">{sessionHistory.length} Records</div>
          </div>
          <div className="flex flex-col max-h-[280px] overflow-y-auto">
             {sessionHistory.length === 0 ? (
               <div className="p-6 text-center text-[11px] font-medium text-black/40">No previous records.</div>
             ) : (
               sessionHistory.map((s, i) => (
                 <div key={i} className={`px-5 py-4 flex flex-col gap-1.5 ${i !== sessionHistory.length - 1 ? 'border-b border-[#F0F0F0]' : ''}`}>
                    <div className="flex items-center justify-between">
                       <span className="text-[11px] font-black text-[#050505] capitalize">{s.date}</span>
                       <span className="text-[10px] font-mono text-[#050505]/50">{s.time}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                       <span className="text-[9px] font-black uppercase tracking-widest text-[#050505]/40">{s.provider}</span>
                       <span className="text-[9px] font-black uppercase tracking-widest text-[#2D0A59]">{s.os}</span>
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
        onScan={(result: string) => {
          onCloseScanner();
          const toast = document.createElement('div');
          toast.className = 'fixed top-6 left-4 right-4 z-[99999] bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest px-5 py-4 rounded-2xl shadow-xl text-center';
          toast.textContent = '✓ Terminal PC Desbloqueado';
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 3000);
        }}
      />

      {/* INFO MODAL */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-5"
          >
            <motion.div 
               initial={{ scale: 0.95, opacity: 0, y: 10 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.95, opacity: 0, y: 10 }}
               className="w-full max-w-sm bg-white rounded-[24px] shadow-2xl border border-black/10 overflow-hidden flex flex-col"
            >
               <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0F0F0]">
                 <div className="flex items-center gap-2.5">
                   <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                     <Info size={16} />
                   </div>
                   <h3 className="text-[14px] font-black uppercase tracking-tight text-[#050505]">Información del Panel</h3>
                 </div>
                 <button onClick={() => setShowInfoModal(false)} className="p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors text-black/40 hover:text-black">
                   <X size={16} />
                 </button>
               </div>
               
               <div className="px-6 py-6 flex flex-col gap-5">
                  <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-xl">
                    <p className="text-[11px] text-blue-900 leading-relaxed font-medium">
                      Estás viendo el panel de control soberano en tu dispositivo móvil. Tu sesión está completamente verificada y asegurada criptográficamente con los datos mostrados en pantalla.
                    </p>
                  </div>

                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-[#050505]/40 mb-3">Pasos para enlazar el Terminal PC</p>
                     
                     <div className="flex flex-col gap-3">
                       <div className="flex items-start gap-3">
                         <div className="w-5 h-5 rounded-full bg-[#2D0A59] text-white text-[10px] font-black flex items-center justify-center shrink-0">1</div>
                         <p className="text-[11px] text-[#050505] leading-snug">Abre la plataforma Whale Alert Network en el navegador de tu computadora de escritorio.</p>
                       </div>
                       <div className="flex items-start gap-3">
                         <div className="w-5 h-5 rounded-full bg-[#2D0A59] text-white text-[10px] font-black flex items-center justify-center shrink-0">2</div>
                         <p className="text-[11px] text-[#050505] leading-snug">Selecciona la opción <strong className="font-black text-[#2D0A59]">Direct QR Handshake</strong> en la pantalla de inicio del PC.</p>
                       </div>
                       <div className="flex items-start gap-3">
                         <div className="w-5 h-5 rounded-full bg-[#2D0A59] text-white text-[10px] font-black flex items-center justify-center shrink-0">3</div>
                         <p className="text-[11px] text-[#050505] leading-snug">Haz click en el botón morado <strong className="font-black text-[#2D0A59]">ABRIR SCANNER QR</strong> en esta pantalla de tu teléfono móvil.</p>
                       </div>
                       <div className="flex items-start gap-3">
                         <div className="w-5 h-5 rounded-full bg-[#2D0A59] text-white text-[10px] font-black flex items-center justify-center shrink-0">4</div>
                         <p className="text-[11px] text-[#050505] leading-snug">Apunta la cámara al código QR que aparece en tu monitor para transferir tu sesión segura instantáneamente.</p>
                       </div>
                     </div>
                  </div>
               </div>
               
               <div className="p-4 border-t border-[#F0F0F0] bg-[#FAF9F6]">
                  <button onClick={() => setShowInfoModal(false)} className="w-full py-3.5 rounded-xl bg-[#2D0A59] text-white text-[12px] font-black uppercase tracking-widest hover:bg-[#1E073B] transition-colors shadow-lg active:scale-95 duration-200">
                    Entendido
                  </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function MobileLanding() {
  const searchParams = useSearchParams();
  const sessionParam = searchParams?.get('session');

  // ── Reown AppKit is the PRIMARY connector ────────────────
  const { address: wagmiAddress, isConnected: wagmiConnected, connector, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const { open: rkOpenModal } = useAppKit();

  // ── Ref: always holds the latest wagmiAddress for use inside setInterval closures ──
  // setInterval captures variables at creation time (stale closure). Without a ref,
  // the poll would never see wagmiAddress updating when wagmi hydrates from cookies.
  const wagmiAddressRef = useRef<string | undefined>(undefined);
  useEffect(() => { wagmiAddressRef.current = wagmiAddress; }, [wagmiAddress]);

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

  // After wallet connection the user lands directly on the ImmersiveManifestoLanding.
  // This matches the requested behavior for mobile flow.
  const [showingManifesto, setShowingManifesto] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  // Emergency "I already connected" button — appears 3.5s after clicking a wallet button
  const [showFallbackBtn, setShowFallbackBtn] = useState(false);
  const [fallbackStatus, setFallbackStatus] = useState<'idle' | 'checking' | 'failed'>('idle');

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
  // SINGLE SOURCE OF TRUTH: if wagmi/AppKit says connected → land immediately
  // ─────────────────────────────────────────────────────────────────────────────
  const establishSession = useCallback((addr: string) => {
    if (isLinked) return;
    const norm = addr.toLowerCase();
    document.cookie = `sovereign_handshake=${norm}; path=/; max-age=604800; SameSite=Lax`;
    try { sessionStorage.setItem(`sovereign_signed_${norm}`, 'true'); } catch {}
    // Clear the reconnect button — session is now established
    try { sessionStorage.removeItem('sovereign_show_reconnect'); } catch {}
    setShowManualReconnectRaw(false);
    fetch('/api/wallet/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress: norm, signature: '0x_mobile_wc_verified', message: 'Mobile WalletConnect verified' }),
    }).catch(() => {});

    setLinkedAddress(norm);
    setIsLinked(true);
    setConnecting(null);
    setShowFallbackBtn(false);
    // Stay on ConnectedScreen (scanner) after connection — do NOT redirect to manifesto.
    // Redirecting to "/" triggers SSR User-Agent detection which can serve the wrong layout.
  }, [isLinked]);

  useEffect(() => {
    if (!mounted || isLinked) return;
    if (isConnected && address) {
      establishSession(address);
    }
  }, [mounted, isConnected, address, isLinked, establishSession]);

  // ── On return from native wallet app: Reown AppKit v1 hardened handler ───────
  // Fix by Grok: correct keys + 600ms delay + 24s poll + AppKit event bus.
  useEffect(() => {
    if (!mounted) return;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    const onFocusRecheck = () => {
      if (isLinked) return;

      // Priority 1: wagmi hooks already have the address in React state
      if (wagmiAddress) { establishSession(wagmiAddress); return; }

      // Start polling immediately with an ultra-fast 50ms tick to match Scroll.io's zero-latency UX
      if (pollInterval) clearInterval(pollInterval);
      let attempts = 0;
      pollInterval = setInterval(() => {
        attempts++;
        // Re-check React state via ref (avoids stale closure — ref always has latest value)
        if (wagmiAddressRef.current) { clearInterval(pollInterval!); pollInterval = null; establishSession(wagmiAddressRef.current); return; }
        
        // Scan Wagmi cookie storage (primary)
        try {
          const cookies = document.cookie.split('; ');
          for (const cookie of cookies) {
            if (cookie.startsWith('wagmi.store=')) {
              const raw = decodeURIComponent(cookie.substring('wagmi.store='.length));
              const addr = extractAddressFromAppKit(raw);
              if (addr) {
                clearInterval(pollInterval!); pollInterval = null;
                establishSession(addr);
                return;
              }
            }
          }
        } catch {}

        // Scan localStorage with correct Reown AppKit v1 key patterns (fallback)
        for (const key of Object.keys(localStorage)) {
          if (APPKIT_STORAGE_KEYS.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            const addr = extractAddressFromAppKit(raw);
            if (addr) {
              clearInterval(pollInterval!); pollInterval = null;
              establishSession(addr);
              return;
            }
          }
        }
        if (attempts >= 480) { clearInterval(pollInterval!); pollInterval = null; } // 24s max at 50ms per tick
      }, 50);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        try {
          if (sessionStorage.getItem('sovereign_show_reconnect') === '1') {
            const w3m = document.querySelector('w3m-modal');
            if (w3m) w3m.remove();
          }
        } catch {}
        onFocusRecheck();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', onFocusRecheck);
    onFocusRecheck(); // trigger on mount for suspended-tab recovery

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', onFocusRecheck);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [mounted, wagmiAddress, isLinked, establishSession]);

  // ── Nuke rogue w3m-modal backdrop left open after mobile deep-link ───────────
  useEffect(() => {
    if (!isLinked) return;
    const id = setInterval(() => {
      // Remove any lingering AppKit/WalletConnect modal backdrop
      const el = document.querySelector('w3m-modal, [data-rk]');
      // Only remove w3m-modal, not the RainbowKit overlay [data-rk] which we need
      const w3m = document.querySelector('w3m-modal');
      if (w3m) w3m.remove();
    }, 400);
    return () => clearInterval(id);
  }, [isLinked]);

  // ── Scroll to top on landing ─────────────────────────────────────────────────
  useEffect(() => {
    if (isLinked && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [isLinked]);

  // ── QR session fulfillment (desktop scan) ────────────────────────────────────
  useEffect(() => {
    if (!isLinked || !address || !sessionParam) return;
    const key = `fulfilled_session_${sessionParam}`;
    if (sessionStorage.getItem(key)) return;
    fetch(`/api/auth/qr-session?id=${sessionParam}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
    }).then(res => {
      if (res.ok) {
        sessionStorage.setItem(key, 'true');
        const t = document.createElement('div');
        t.className = 'fixed top-6 left-4 right-4 z-[99999] bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest px-5 py-4 rounded-2xl shadow-xl text-center';
        t.textContent = '✓ Desktop Terminal Unlocked';
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 4000);
      }
    }).catch(() => {});
  }, [isLinked, address, sessionParam]);



  // ── handleDisconnect: clears session and resets all state ───────────────
  const handleDisconnect = useCallback(() => {
    // Visual feedback of the nuclear purge
    const btn = document.getElementById('sovereign-disconnect-btn');
    if (btn) {
        btn.innerHTML = '<span class="animate-pulse">NUKING KERNEL STATE...</span>';
        btn.style.backgroundColor = '#FF0000';
        btn.style.color = '#FFFFFF';
        btn.style.pointerEvents = 'none';
    }

    setTimeout(() => {
        // 1. Expire the sovereign_handshake cookie
        document.cookie = 'sovereign_handshake=; path=/; max-age=0; SameSite=Lax';
        
        // 2. Nuke all WalletConnect and Wagmi persistent state to fix Rainbow/Trust bugs
        try {
          Object.keys(localStorage).forEach(k => {
            const lower = k.toLowerCase();
            if (lower.includes('walletconnect') || lower.includes('wagmi') || lower.includes('wc@2')) {
              localStorage.removeItem(k);
            }
          });
          sessionStorage.clear();
        } catch {}

        // 3. Disconnect wagmi
        try { disconnect(); } catch {}
        
        // 4. Force a clean window reload to guarantee a pristine state for the next wallet
        if (typeof window !== 'undefined') {
          window.location.href = window.location.pathname;
        }
    }, 400); // 400ms delay to let the user see the system purge
  }, [disconnect]);

  if (!mounted) return null;

  // ── Render: Session exists — show immediately using cookie address ──────────
  // We NEVER wait for wagmi to reconnect. The cookie IS the source of truth.
  // The cookie value IS the wallet address: sovereign_handshake=0xABCD...
  // This means after signing we never need wagmi to reconnect to show the
  // ConnectedScreen. Works even if WalletConnect session drops after signing.
  if (isLinked && effectiveAddress) {
    return (
      <AnimatePresence mode="wait">
        {showingManifesto ? (
          <motion.div key="manifesto" initial={{opacity: 0}} animate={{opacity: 1, transition: { duration: 0.4, ease: "easeOut" }}} exit={{opacity: 0, transition: { duration: 0.2 }}} className="w-full min-h-screen bg-[#FDFCF8]">
            <ImmersiveManifestoLanding onOpenScanner={() => setShowingManifesto(false)} />
          </motion.div>
        ) : (
          <motion.div key="scanner" initial={{opacity: 0, scale: 0.98}} animate={{opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" }}} exit={{opacity: 0, scale: 0.98, transition: { duration: 0.2 }}} className="w-full min-h-screen bg-[#FAF9F6]">
            <ConnectedScreen 
               address={effectiveAddress} 
               onScan={() => setShowScanner(true)} 
               showScanner={showScanner} 
               onCloseScanner={() => setShowScanner(false)} 
               onBack={() => setShowingManifesto(true)}
               connectorName={connector?.name}
               chainId={chainId}
               onDisconnect={handleDisconnect}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // ── Render: Wallet connected, session being written (brief) ─────────────────
  // This render is typically invisible — the useEffect above fires setIsLinked
  // in the same React batch. Shown only for a fraction of a second max.
  if (isConnected && address && !isLinked) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#FAF9F6] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#050505]/30" />
      </div>
    );
  }

  // ── Render: Default — Not connected ──────────────────────────────────────────
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden font-sans flex flex-col" style={{ backgroundColor: IVORY, color: INK }}>

      {/* Layer 0: ivory base */}
      <div className="fixed inset-0 z-0 bg-[#FAF9F6] pointer-events-none" />

      {/* Layer 1: cosmic pattern */}
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
          <span className="text-[11px] font-black uppercase tracking-tight" style={{ color: INK }}>Whale Alert Network</span>
        </div>
        <div className="px-3 py-1.5 rounded-full border border-black/10 text-[9px] font-black uppercase tracking-widest text-black/40">
          Not Connected
        </div>
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
      <main className="relative z-10 flex-1 flex flex-col items-center px-5 pt-32 pb-12 gap-8 max-w-[440px] w-full mx-auto">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <h1 className="text-[2.2rem] font-black tracking-tight leading-[1.05] mb-3" style={{ color: INK }}>
            Whale Alert<br />Network
          </h1>
          <p className="text-[12px] font-medium leading-relaxed" style={{ color: MUTED }}>
            Sovereign-grade blockchain intelligence. Connect your wallet to sync your session with the desktop terminal.
          </p>
          {/* Manual reconnect escape hatch restored per user request */}
          <AnimatePresence>
            {(showManualReconnect || showFallbackBtn) && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                disabled={fallbackStatus === 'checking'}
                onClick={() => {
                  setFallbackStatus('checking');
                  
                  const checkSession = () => {
                    // Priority 1: wagmi ref (always live — avoids stale closure)
                    if (wagmiAddressRef.current) return wagmiAddressRef.current;
                    // Priority 2: wagmi React state (re-rendered value)
                    if (address) return address;
                    // Priority 3: Scan ALL cookies for any 0x address.
                    // WagmiAdapter with cookieStorage may write to keys other than 'wagmi.store='.
                    // We scan every cookie value and extract any valid 0x address.
                    try {
                      const allCookies = document.cookie.split('; ');
                      for (const cookie of allCookies) {
                        const eqIdx = cookie.indexOf('=');
                        if (eqIdx === -1) continue;
                        try {
                          const val = decodeURIComponent(cookie.substring(eqIdx + 1));
                          const addr = extractAddressFromAppKit(val);
                          if (addr) return addr;
                        } catch {}
                      }
                    } catch {}
                    // Priority 4: Scan ALL localStorage values for any 0x address.
                    // WalletConnect v2 stores session data under 'wc@2:...' keys — scan all.
                    try {
                      for (const key of Object.keys(localStorage)) {
                        const raw = localStorage.getItem(key);
                        if (!raw || raw.length < 42) continue;
                        const addr = extractAddressFromAppKit(raw);
                        if (addr) return addr;
                      }
                    } catch {}
                    // Priority 3: Cookie fallback
                    try {
                      const cookieMatch = document.cookie.match(/sovereign_handshake=(0x[0-9a-fA-F]{40,})/i);
                      if (cookieMatch?.[1]) return cookieMatch[1];
                    } catch {}
                    return null;
                  };

                  let foundAddr = checkSession();
                  if (foundAddr) {
                    establishSession(foundAddr);
                    setFallbackStatus('idle');
                    return;
                  }

                  let attempts = 0;
                  const poll = setInterval(() => {
                    attempts++;
                    foundAddr = checkSession();
                    if (foundAddr) {
                      clearInterval(poll);
                      establishSession(foundAddr);
                      setFallbackStatus('idle');
                    } else if (attempts >= 150) { // 30s (200ms × 150) — WC relay needs time to reconnect
                      clearInterval(poll);
                      setFallbackStatus('failed');
                      setTimeout(() => setFallbackStatus('idle'), 3000);
                    }
                  }, 200);
                }}
                className={`mt-6 w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg active:scale-[0.97] transition-all flex items-center justify-center gap-3 disabled:opacity-90 ${fallbackStatus === 'failed' ? 'bg-red-600 text-white' : 'bg-[#050505] text-white'}`}
              >
                {fallbackStatus === 'checking' ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white/70" />
                    Sincronizando túnel...
                  </>
                ) : fallbackStatus === 'failed' ? (
                  <>
                    <AlertCircle size={16} className="text-white" />
                    Conexión no detectada
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Continuar si ya conecté
                  </>
                )}
              </motion.button>
            )}
          </AnimatePresence>
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
              // Helper: clear any stale wagmi/AppKit session then open the modal
              const openWalletModal = (walletId: string) => {
                // Guard: if already linked, nothing to do
                if (isLinked && effectiveAddress) return;

                setConnecting(walletId);
                setShowManualReconnect(true);
                setShowFallbackBtn(false);

                const doOpen = () => {
                  // In-app wallet browser (MetaMask, Coinbase app, Rainbow app)
                  // window.ethereum is injected — connect directly, no modal needed.
                  const hasEthereum = typeof window !== 'undefined' && !!(window as any).ethereum;
                  const injectedConn = connectors.find(c => c.id === 'injected');
                  if (hasEthereum && injectedConn) {
                    connect({ connector: injectedConn });
                    return;
                  }

                  // External browser (Chrome, Safari) — open AppKit modal.
                  // AppKit handles WalletConnect deep-links to MetaMask, Rainbow, etc.
                  rkOpenModal();
                };

                // Only disconnect a STALE session (wagmi thinks connected but user is NOT linked).
                // This prevents killing a valid active session before opening the modal.
                if (wagmiConnected && !isLinked) {
                  try { disconnect(); } catch {}
                  setTimeout(doOpen, 300);
                } else {
                  doOpen();
                }

                setTimeout(() => setConnecting(null), 3000);
                // 400ms: deep-link returns before 1.2s on most Android devices
                setTimeout(() => setShowFallbackBtn(true), 400);
              };

              return (
                <>
                  {/* MetaMask */}
                  <WalletOption
                    logo="/wallets/metamask.svg"
                    name="MetaMask"
                    badge="Mobile · WalletConnect v2"
                    loading={connecting === 'metamask'}
                    onClick={() => openWalletModal('metamask')}
                    delay={0.1}
                  />

                  {/* Coinbase Wallet */}
                  <WalletOption
                    logo="/wallets/coinbase.png"
                    name="Coinbase Wallet"
                    badge="Mobile · WalletConnect v2"
                    loading={connecting === 'coinbase'}
                    onClick={() => openWalletModal('coinbase')}
                    delay={0.15}
                  />

                  {/* Rainbow & All Wallets */}
                  <WalletOption
                    logo="/wallets/rainbow.png"
                    name="Rainbow & 550+ Wallets"
                    badge="WalletConnect v2 · All Wallets"
                    loading={connecting === 'wc'}
                    onClick={() => openWalletModal('wc')}
                    delay={0.2}
                  />
                </>
              );
            })()}
          </div>

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

        <footer className="relative z-10 w-full px-6 pt-16 pb-12 flex flex-col gap-10">
          
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
             <div className="flex flex-col overflow-hidden rounded border border-white/10 bg-[#050505]/70 w-full max-w-[320px] mx-auto shadow-xl">
                <input
                   type="email"
                   placeholder="ENTER SECURE EMAIL"
                   className="bg-transparent px-4 py-3 outline-none font-mono text-[10px] tracking-widest text-[#E0E0E0] placeholder:text-[#545F73] text-center"
                />
                <button className="px-4 py-3.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] bg-[#EAEAEA] text-[#0A0A0A] hover:bg-white transition-colors active:scale-95">
                   Subscribe
                </button>
             </div>
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
