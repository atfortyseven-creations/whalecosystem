"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Smartphone,
  Wallet,
  ChevronRight,
  Fingerprint,
  Activity,
  RefreshCw,
  Cpu,
  Globe,
  X,
  CheckCircle2,
  Zap,
  ArrowRight,
  Database,
} from 'lucide-react';
import { useUIStore } from '@/lib/store/ui-store';
import { QRCodeSVG } from 'qrcode.react';
import { useAccount, useConnect, useSignMessage } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { toast } from 'sonner';

const QR_TTL = 300;

// ─── HUGE ANIMATED WHALE WITH WATER SPLASH ───────────────────────────────
function HugeAnimatedWhale() {
  const [splashes, setSplashes] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setSplashes((prev) => [...prev, { id: Date.now(), x, y }]);
  };

  const removeSplash = (id: number) => {
    setSplashes((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div 
      className="relative cursor-pointer flex justify-center items-center w-56 h-56 md:w-[300px] md:h-[300px] lg:w-[340px] lg:h-[340px] select-none group shrink-0" 
      onClick={handleClick}
    >
      <motion.img
        src="/official-whale-monochrome.png"
        className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] group-hover:drop-shadow-[0_40px_80px_rgba(0,0,0,0.30)] transition-all duration-500"
        alt="Animated Whale"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ y: [0, -20, 0] }}
        transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
      />
      <AnimatePresence>
        {splashes.map((splash) => (
          <WaterSplash key={splash.id} x={splash.x} y={splash.y} onComplete={() => removeSplash(splash.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function WaterSplash({ x, y, onComplete }: { x: number; y: number; onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="absolute pointer-events-none z-20" style={{ left: x, top: y }}>
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-[#4FC3F7] rounded-full mix-blend-screen"
          initial={{ opacity: 0.9, x: 0, y: 0, scale: 1 }}
          animate={{
            opacity: 0,
            x: (Math.random() - 0.5) * 300,
            y: -50 - Math.random() * 300,
            scale: 0.5 + Math.random(),
          }}
          transition={{ duration: 0.6 + Math.random() * 0.4, ease: "easeOut" }}
        />
      ))}
      <motion.div
        className="absolute w-full h-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-[4px] border-[#4FC3F7] rounded-full"
        style={{ width: 0, height: 0 }}
        initial={{ opacity: 0.8, width: 10, height: 10, borderWidth: 8 }}
        animate={{ opacity: 0, width: 250, height: 250, borderWidth: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

// ─── BACKGROUND EFFECTS ───────────────────────────────────────────────────────
// (SVG filters removed to prevent mobile 240Hz frame-pacing drops)

// ─── WALLET DEFINITIONS ─────────────────────────────────────────────────────
const PC_WALLETS = [
  {
    id: 'metamask',
    name: 'METAMASK',
    description: 'BROWSER EXTENSION · INJECTED',
    icon: '/official-whale-monochrome.png', // Fallback to monochrome for elite look
    color: '#050505',
    tag: 'INJECTED'
  },
  {
    id: 'coinbase',
    name: 'COINBASE WALLET',
    description: 'SMART WALLET · MPC',
    icon: '/official-whale-monochrome.png', 
    color: '#050505',
    tag: 'MPC'
  },
  {
    id: 'walletconnect',
    name: 'WALLETCONNECT',
    description: 'UNIVERSAL · ANY WALLET',
    icon: '/official-whale-monochrome.png', 
    color: '#050505',
    tag: 'UNIVERSAL'
  },
  {
    id: 'rabby',
    name: 'RABBY WALLET',
    description: 'MULTI-CHAIN · INJECTED',
    icon: '/official-whale-monochrome.png',
    color: '#050505',
    tag: 'INJECTED'
  },
];

// ─── PC WALLET PICKER MODAL ─────────────────────────────────────────────────
function PCWalletPickerModal({
  isOpen,
  onClose,
  onConnected,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConnected: () => void;
}) {
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();
  const { open: openAppKit } = useAppKit();
  const [connecting, setConnecting] = useState<string | null>(null);

  // Auto close when wallet connects
  useEffect(() => {
    if (isConnected && isOpen) {
      onConnected();
      onClose();
    }
  }, [isConnected, isOpen, onConnected, onClose]);

  const handleSelect = async (walletId: string) => {
    setConnecting(walletId);

    if (walletId === 'metamask') {
      // Try injected connector first (MetaMask extension)
      const injected = connectors.find(
        c => c.id === 'injected' || c.id === 'io.metamask' || c.type === 'injected'
      );
      if (injected) {
        try {
          connect({ connector: injected });
        } catch (e) {
          console.error('[LinkedGate] MetaMask connect error:', e);
          // Fallback to AppKit
          openAppKit({ view: 'Connect' });
          onClose();
        }
      } else {
        // MetaMask not installed — open AppKit modal
        openAppKit({ view: 'Connect' });
        onClose();
      }
    } else if (walletId === 'walletconnect') {
      // Direct WalletConnect Modal (Universal Bridge)
      openAppKit({ view: 'Connect' });
      onClose();
    } else {
      // Coinbase, Rainbow, etc. → Specific AppKit views or general connect
      openAppKit({ view: 'Connect' });
      onClose();
    }

    setTimeout(() => setConnecting(null), 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-[400px] bg-white rounded-[3rem] shadow-[0_60px_120px_-20px_rgba(0,0,0,0.25)] overflow-hidden z-10"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors z-10"
            >
              <X size={16} className="text-black/60" />
            </button>

            {/* Header */}
            <div className="flex flex-col items-center pt-10 pb-6 px-8">
              <div className="w-14 h-14 bg-[#F9F8F4] rounded-[1.5rem] flex items-center justify-center mb-5 border border-black/5 shadow-sm">
                <img src="/official-whale-monochrome.png" className="w-9 h-9 object-contain" alt="Whale" />
              </div>
              <h2 className="text-2xl font-black text-[#050505] tracking-tighter uppercase">Connect Your Wallet</h2>
              <p className="text-[11px] font-bold text-[#050505]/40 uppercase tracking-[0.1em] mt-1.5 text-center">
                Choose your preferred connection method
              </p>
            </div>

            {/* Wallet List */}
            <div className="px-6 pb-8 space-y-3">
              {PC_WALLETS.map((wallet) => {
                const isThisConnecting = connecting === wallet.id;
                return (
                  <motion.button
                    key={wallet.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => !connecting && handleSelect(wallet.id)}
                    disabled={!!connecting}
                    className="w-full h-[72px] flex items-center justify-between px-5 bg-[#F9F8F4] border border-black/5 rounded-[1.8rem] transition-all group disabled:cursor-not-allowed hover:border-black/10 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-black/5 shadow-sm flex-shrink-0">
                        {wallet.isImage ? (
                          <img src={wallet.icon} className="w-6 h-6 object-contain" alt={wallet.name} />
                        ) : (
                          <span className="text-xl leading-none">{wallet.icon}</span>
                        )}
                      </div>
                      <div className="text-left">
                        <span className="font-black text-[13px] text-[#050505] uppercase tracking-wider block leading-tight">
                          {wallet.name}
                        </span>
                        {isThisConnecting ? (
                          <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-[0.15em] mt-0.5 block animate-pulse">
                            Connecting...
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-[#050505]/30 uppercase tracking-[0.12em] mt-0.5 block">
                            {wallet.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isThisConnecting ? 'bg-indigo-500' : 'bg-white opacity-0 group-hover:opacity-100'} shadow-sm`}>
                      {isThisConnecting
                        ? <RefreshCw size={13} className="text-white animate-spin" />
                        : <ChevronRight size={15} className="text-black/50" />
                      }
                    </div>
                  </motion.button>
                );
              })}

              <button
                onClick={onClose}
                className="w-full mt-2 py-3 text-[10px] font-black text-[#050505]/25 uppercase tracking-[0.4em] hover:text-[#050505]/50 transition-colors"
              >
                Close Window
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── SIGN CONTRACT OVERLAY ──────────────────────────────────────────────────
function SignContractStep({ onSigned, onDisconnect }: { onSigned: () => void; onDisconnect: () => void }) {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAcceptedToS, setHasAcceptedToS] = useState(false);

  const handleSign = async () => {
    if (!address) return;
    setIsSigning(true);
    setError(null);
    try {
      const message = [
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

      const signature = await signMessageAsync({ message });

      if (signature) {
        // Persist the handshake as a cookie so the server can read it
        document.cookie = `sovereign_handshake=${address}; path=/; max-age=604800; SameSite=Lax`;
        sessionStorage.setItem(`sovereign_signed_${address}`, 'true');

        toast.success('IDENTIDAD VINCULADA', {
          description: `Terminal desbloqueado. ${address.slice(0, 6)}...${address.slice(-4)}`,
          className: 'font-black uppercase tracking-widest',
        });

        // Sync with backend
        fetch('/api/wallet/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: address, signature, message }),
        }).catch(() => {});

        onSigned();
      }
    } catch (e: any) {
      if (e?.code === 4001 || e?.message?.includes('rejected')) {
        setError('Firma rechazada. Debes firmar para acceder al terminal.');
      } else {
        setError('Error inesperado. Inténtalo de nuevo.');
      }
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 text-center max-w-sm mx-auto"
    >
      {/* Icon */}
      <div className="w-20 h-20 bg-white rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-black/5 flex items-center justify-center">
        <Shield size={32} className="text-[#050505]" />
      </div>

      {/* Address Badge */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white border border-black/5 rounded-full shadow-sm">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[11px] font-black uppercase tracking-widest text-[#050505]/60 font-mono">
          {address?.slice(0, 8)}…{address?.slice(-6)}
        </span>
      </div>

      {/* Text */}
      <div className="space-y-2">
        <h3 className="text-4xl font-black tracking-tighter text-[#050505] leading-none">
          Firma el<br />
          <span className="italic">Contrato</span>
        </h3>
        <p className="text-[12px] font-medium text-[#050505]/40 max-w-[260px] leading-relaxed uppercase tracking-[0.08em]">
          Firma el mensaje de identidad para autenticarte. No se realiza ninguna transacción on-chain.
        </p>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full px-5 py-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[11px] font-black uppercase tracking-widest text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sign Button & Click Wrap */}
      <div className="w-full space-y-4">
        <label className="flex items-start gap-3 p-4 bg-[#FAF9F6] border border-black/10 rounded-2xl cursor-pointer hover:bg-black/[0.02] transition-colors text-left shadow-sm">
          <input 
            type="checkbox" 
            className="mt-0.5 w-4 h-4 accent-[#050505] cursor-pointer" 
            checked={hasAcceptedToS} 
            onChange={(e) => setHasAcceptedToS(e.target.checked)} 
          />
          <span className="text-[9px] font-bold text-[#050505]/70 uppercase tracking-[0.1em] leading-relaxed">
            I verify I am not a US citizen and I agree to the <a href="/docs/legal/TERMS_OF_SERVICE.md" className="font-black text-black hover:underline hover:text-indigo-600" target="_blank">Master Terms of Service</a>, Privacy Policy & Non-Custodial Waiver.
          </span>
        </label>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSign}
          disabled={isSigning || !hasAcceptedToS}
          className="w-full h-[72px] bg-[#050505] text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
        {isSigning ? (
          <>
            <RefreshCw size={18} className="animate-spin" />
            FIRMANDO...
          </>
        ) : (
          <>
            <Zap size={18} className="text-white/60" />
            FIRMAR & ACCEDER
          </>
        )}
      </motion.button>

      </div>
      <button
        onClick={onDisconnect}
        className="text-[10px] font-black text-[#050505]/20 uppercase tracking-[0.4em] hover:text-[#050505]/50 transition-colors"
      >
        Desconectar Wallet
      </button>
    </motion.div>
  );
}

// ─── MAIN GATE COMPONENT ────────────────────────────────────────────────────
export function LinkedGate({ children }: { children: React.ReactNode }) {
  const { isLinked, setLinked } = useUIStore();
  const { isConnected: isWalletConnected, address } = useAccount();
  const { connect, connectors } = useConnect();

  const [qrSession, setQrSession] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QR_TTL);
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'AWAITING_SCAN' | 'SYNCED'>('IDLE');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [showSignStep, setShowSignStep] = useState(false);

  const qrSessionRef = useRef<string | null>(null);
  useEffect(() => { qrSessionRef.current = qrSession; }, [qrSession]);

  useEffect(() => {
    setIsMounted(true);

    if (typeof document !== 'undefined') {
      const hasHandshake = document.cookie
        .split('; ')
        .some(row => row.startsWith('sovereign_handshake=0x'));
      if (hasHandshake) {
        setLinked(true);
      } else if (!isWalletConnected) {
        setLinked(false);
      }
    }
  }, []);

  // ─── SCROLL LOCK ENFORCEMENT ───────────────────────────────────────────
  // Prevents the background page from scrolling while the gate is active.
  useEffect(() => {
    if (!isMounted) return;
    
    // If the gate is active (isLinked is false), prevent body scroll.
    if (!isLinked && !isWalletConnected) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isLinked, isWalletConnected, isMounted]);

  // When wallet connects — check sign status and show sign step if needed
  useEffect(() => {
    if (!isWalletConnected || isLinked) return;
    if (!address) return;
    const alreadySigned = sessionStorage.getItem(`sovereign_signed_${address}`) === 'true';
    if (alreadySigned) {
      // Cookie should exist too — fast-path unlock
      setLinked(true);
    } else {
      setShowSignStep(true);
    }
  }, [isWalletConnected, isLinked, address]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSigned = useCallback(() => {
    setShowSignStep(false);
    setLinked(true);
  }, [setLinked]);

  const handleDisconnect = useCallback(() => {
    setShowSignStep(false);
    // Force disconnect
    window.location.reload();
  }, []);

  // QR Session management
  const fetchNewSession = useCallback(async () => {
    try {
      setSyncStatus('AWAITING_SCAN');
      const res = await fetch('/api/auth/qr-session', { method: 'POST' });
      const data = await res.json();
      if (data.sessionId) {
        setQrSession(data.sessionId);
        setTimeLeft(QR_TTL);
      }
    } catch (e) {
      console.error('[LinkedGate] Failed to initiate QR Session', e);
    }
  }, []);

  useEffect(() => {
    if (!isMounted || isLinked || isWalletConnected) return;
    fetchNewSession();
  }, [isMounted, isLinked, isWalletConnected, fetchNewSession]);

  // Timer
  useEffect(() => {
    if (isLinked || !qrSession) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [qrSession, isLinked]);

  useEffect(() => {
    if (timeLeft === 0 && !isLinked) fetchNewSession();
  }, [timeLeft, isLinked, fetchNewSession]);

    // QR Polling - Military Grade Connectivity (v3.4)
    useEffect(() => {
        if (!isMounted || isLinked) return;
        
        // High-frequency polling pool
        let intervalId: ReturnType<typeof setInterval>;
        let ConsecutiveErrors = 0;

        intervalId = setInterval(async () => {
            const token = qrSessionRef.current;
            if (!token) return;

            try {
                // High-fidelity timestamp for Absolute Zero-Cache
                const res = await fetch(`/api/auth/qr-session?id=${token}&_t=${Date.now()}`);
                
                if (!res.ok) {
                    ConsecutiveErrors++;
                    return;
                }

                ConsecutiveErrors = 0;
                const data = await res.json();
                
                if (data.status === 'waiting') return;

                if (data.status === 'complete' && data.address) {
                    clearInterval(intervalId);
                    setSyncStatus('SYNCED');

                    // ─── ABSOLUTE INGESTION ──────────────────────────────────────
                    // Direct browser adoption of the handshake address.
                    // Set cookie as fail-safe backup for the backend header.
                    document.cookie = `sovereign_handshake=${data.address}; path=/; max-age=604800; sameSite=lax`;
                    
                    // Instant Unlock transition
                    setTimeout(() => {
                        setLinked(true);
                        toast.success("IDENTIDAD VERIFICADA", { 
                            description: `Handshake completo con ${data.address.slice(0, 8)}...`,
                            className: "font-black tracking-widest uppercase" 
                        });
                        setTimeout(() => {
                          window.location.reload();
                        }, 1200);
                    }, 800);
                } else if (data.status === 'expired') {
                    clearInterval(intervalId);
                    fetchNewSession();
                }
            } catch (err) {
                console.error('[QR_MILITARY_EXCEPTION]', err);
            }
        }, 850); // High-fidelity 850ms polling for "Instant" feel

        return () => clearInterval(intervalId);
    }, [isMounted, isLinked, fetchNewSession, setLinked]);

  if (!isMounted) return null;
  if (isLinked || (isWalletConnected && !showSignStep)) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[10000] bg-[#FBFAFA] flex flex-col font-sans overflow-auto">
      {/* ── HEADER BORDER BAR ── */}
      <header className="h-20 border-b border-black/[0.05] bg-white flex items-center justify-between px-12 shrink-0 relative z-20">
        <div className="flex items-center gap-3">
          <img src="/official-whale-monochrome.png" className="w-8 h-8" alt="Whale Alert" />
          <span className="font-black text-sm tracking-[0.2em] uppercase text-black">Whale Alert Network</span>
        </div>
        <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-black/20">
          <span className="text-black/40">Secure</span>
          <span>Terminal</span>
          <span>Access</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        {/* Background Watermark Whale */}
        <div className="absolute bottom-0 left-0 w-full md:w-[800px] opacity-[0.02] pointer-events-none translate-x-[-10%] translate-y-[10%]">
          <img src="/official-whale-monochrome.png" className="w-full h-auto" />
        </div>

        <AnimatePresence mode="wait">
          {showSignStep ? (
            <motion.div key="sign" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full">
              <SignContractStep onSigned={handleSigned} onDisconnect={handleDisconnect} />
            </motion.div>
          ) : (
            <motion.div
              key="gate"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl w-full bg-white border border-black/[0.06] shadow-[0_80px_160px_-40px_rgba(0,0,0,0.08)] grid grid-cols-1 lg:grid-cols-2 min-h-[600px] relative z-10"
            >
              {/* ── LEFT PANEL: MOBILE SYNC (QR) ── */}
              <div className="p-12 border-r border-black/[0.05] flex flex-col items-center justify-center relative overflow-hidden group">
                 <div className="absolute top-8 left-8 text-[9px] font-black uppercase tracking-[0.3em] text-black/20">Mobile Sync</div>
                 <div className="absolute top-8 right-8">
                   <button className="text-[#3B99FC] text-[9px] font-black uppercase tracking-widest bg-[#3B99FC]/5 px-3 py-1.5 border border-[#3B99FC]/20">@whaleecosystem</button>
                 </div>

                 <div className="flex flex-col items-center text-center max-w-xs mb-12">
                   <div className="flex items-center gap-3 mb-4">
                     <img src="/official-whale-monochrome.png" className="w-8 h-8" alt="Whale" />
                     <h2 className="text-3xl font-black tracking-tighter text-black">Scan to connect</h2>
                   </div>
                   <p className="text-[11px] font-medium text-black/40 leading-relaxed uppercase tracking-wider">
                     Open your mobile wallet and scan the QR code below. Your session will sync automatically with this terminal.
                   </p>
                 </div>

                 {/* QR CENTER */}
                 <div className="relative p-10 bg-white border border-black/[0.03] shadow-inner mb-6">
                    {/* QR Frame Markers */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-black/10" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-black/10" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-black/10" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-black/10" />

                    <div className="w-[200px] h-[200px] flex items-center justify-center">
                       {qrSession ? (
                         <QRCodeSVG
                            value={`https://www.humanidfi.com/sync?session=${qrSession}`}
                            style={{ width: '100%', height: '100%' }}
                            level="H"
                            bgColor="transparent"
                            fgColor="#050505"
                          />
                       ) : (
                         <RefreshCw className="w-8 h-8 text-black/10 animate-spin" />
                       )}
                    </div>
                 </div>

                 <div className="flex flex-col items-center gap-4">
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-black/10 animate-pulse" />
                     <span className="text-[9px] font-black uppercase tracking-[0.3em] text-black/20">Awaiting Scan</span>
                   </div>
                   <button onClick={fetchNewSession} className="text-[9px] font-black uppercase tracking-[0.3em] text-black/30 hover:text-black transition-colors">Refresh Code &rarr;</button>
                 </div>

                 <div className="mt-16 text-[8px] font-black uppercase tracking-[0.25em] text-black/10">COMPATIBLE WITH METAMASK MOBILE · RAINBOW · TRUST WALLET · COINBASE WALLET</div>
              </div>

              {/* ── RIGHT PANEL: DIRECT CONNECT ── */}
              <div className="p-12 flex flex-col">
                <div className="mb-12">
                   <div className="text-[9px] font-black uppercase tracking-[0.3em] text-black/20 mb-4">Desktop Connection</div>
                   <h2 className="text-3xl font-black tracking-tighter text-black mb-4 leading-none">Connect your wallet directly</h2>
                   <p className="text-[11px] font-medium text-black/40 leading-relaxed uppercase tracking-wider max-w-sm">
                     Select your preferred wallet to authenticate. No password required — your wallet signs a cryptographic message.
                   </p>
                </div>

                <div className="space-y-3 flex-1">
                  {PC_WALLETS.map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => handleWalletConnect(wallet.id)}
                      className="w-full group flex items-center justify-between p-4 border border-black/[0.05] hover:border-black/[0.1] hover:bg-black/[0.01] transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-black/[0.02] border border-black/[0.05] flex items-center justify-center">
                          <img src={wallet.icon} className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all" alt={wallet.name} />
                        </div>
                        <div className="text-left">
                          <div className="text-[11px] font-black uppercase tracking-widest text-black">{wallet.name}</div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-black/20 mt-0.5">{wallet.description}</div>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-black/10 group-hover:text-black/40 transition-all group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>

                <div className="mt-12 pt-8 border-t border-black/[0.05] space-y-6">
                  <div className="flex items-start gap-4 opacity-50">
                    <Shield size={14} className="text-black mt-0.5" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-black/40 leading-relaxed">
                      Non-custodial authentication. Your private keys never leave your device. Authentication is verified via ECDSA — no passwords, no accounts.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {['OPTIMISM', 'ETHEREUM', 'BASE', 'ARBITRUM', 'POLYGON'].map(n => (
                      <span key={n} className="text-[8px] font-black border border-black/[0.08] px-2 py-1 text-black/30 tracking-widest">{n}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="h-12 border-t border-black/[0.05] bg-white flex items-center justify-between px-12 shrink-0">
         <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-black/20">
           <img src="/official-whale-monochrome.png" className="w-3 h-3 opacity-30" />
           <span>Whale Alert Network · Privacy by Void</span>
         </div>
         <div className="text-[8px] font-black uppercase tracking-[0.3em] text-black/20">WalletConnect &rarr;</div>
      </footer>
    </div>
  );
}

// Helper to bridge connectors
function handleWalletConnect(id: string) {
  // Global event or AppKit trigger mapping
  const btn = document.querySelector(`[data-wallet-id="${id}"]`) as HTMLButtonElement;
  if (btn) btn.click();
  else window.dispatchEvent(new CustomEvent('sovereign:trigger_connect', { detail: { id } }));
}
