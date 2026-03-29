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
} from 'lucide-react';
import { useUIStore } from '@/lib/store/ui-store';
import { QRCodeSVG } from 'qrcode.react';
import { useAccount, useConnect, useSignMessage } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { toast } from 'sonner';

const QR_TTL = 300;

// ─── NOISE OVERLAY ──────────────────────────────────────────────────────────
const GrainyOverlay = () => (
  <div className="absolute inset-0 pointer-events-none opacity-[0.03] animate-pulse" style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
  }} />
);

// ─── WALLET DEFINITIONS ─────────────────────────────────────────────────────
const PC_WALLETS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    description: 'Browser Extension',
    icon: '/official-whale-monochrome.png',
    isImage: true,
    color: '#F6851B',
    bgColor: '#FFF8F0',
    borderColor: '#F6851B20',
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    description: 'Via WalletConnect QR',
    icon: '🛡️',
    isImage: false,
    color: '#3375BB',
    bgColor: '#F0F5FF',
    borderColor: '#3375BB20',
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    description: 'Via WalletConnect QR',
    icon: '🔵',
    isImage: false,
    color: '#0052FF',
    bgColor: '#F0F4FF',
    borderColor: '#0052FF20',
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    description: 'Via WalletConnect QR',
    icon: '🌈',
    isImage: false,
    color: '#7B3FE4',
    bgColor: '#F5F0FF',
    borderColor: '#7B3FE420',
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
    } else {
      // Trust, Coinbase, Rainbow → WalletConnect QR via AppKit
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
              <h2 className="text-2xl font-black text-[#050505] tracking-tighter">Bóveda Criptográfica</h2>
              <p className="text-[11px] font-bold text-[#050505]/40 uppercase tracking-[0.2em] mt-1.5">
                Sincronización de Identidad
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
                            Conectando...
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
                Cerrar Puerta
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

  const handleSign = async () => {
    if (!address) return;
    setIsSigning(true);
    setError(null);
    try {
      const message = [
        '═══════════════════════════════',
        '  WHALE ALERT NETWORK',
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
          body: JSON.stringify({ walletAddress: address, signature }),
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

      {/* Sign Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSign}
        disabled={isSigning}
        className="w-full h-[72px] bg-[#050505] text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
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

    // Validate persisted isLinked against actual session state.
    // If there's no valid cookie AND no wallet connected, reset the gate.
    // This prevents old localStorage state from bypassing the gate on a new visit.
    if (typeof document !== 'undefined') {
      const hasHandshake = document.cookie
        .split('; ')
        .some(row => row.startsWith('sovereign_handshake=0x'));
      if (hasHandshake) {
        setLinked(true);
      } else if (!isWalletConnected) {
        // No cookie and no wallet → force gate to show regardless of persisted state
        setLinked(false);
      }
    }
  }, []); // run once on mount only

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

  // QR Polling
  useEffect(() => {
    if (!isMounted || isLinked) return;
    const interval = setInterval(async () => {
      const token = qrSessionRef.current;
      if (!token) return;
      try {
        const res = await fetch(`/api/auth/qr-session?id=${token}`);
        const data = await res.json();
        if (data.status === 'complete') {
          setSyncStatus('SYNCED');
          setTimeout(() => setLinked(true), 1200);
        }
      } catch (_) {}
    }, 2000);
    return () => clearInterval(interval);
  }, [isMounted, isLinked, setLinked]);

  if (!isMounted) return null;
  if (isLinked || (isWalletConnected && !showSignStep)) return <>{children}</>;

  return (
    <>
      {/* ── PC WALLET PICKER MODAL ── */}
      <PCWalletPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onConnected={() => setIsPickerOpen(false)}
      />

      {/* ── GATEWAY SCREEN ── */}
      <div className="fixed inset-0 z-[10000] bg-[#FAF9F6] flex items-center justify-center p-8 selection:bg-black selection:text-white font-sans overflow-auto">
        <GrainyOverlay />

        {/* Grid BG */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle, #000 1.2px, transparent 1.2px)`,
          backgroundSize: '48px 48px'
        }} />

        <AnimatePresence mode="wait">
          {/* ── SIGN STEP (after wallet connects) ── */}
          {showSignStep ? (
            <motion.div
              key="sign"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="relative z-10 w-full flex items-center justify-center"
            >
              <SignContractStep onSigned={handleSigned} onDisconnect={handleDisconnect} />
            </motion.div>
          ) : (
            /* ── GATEWAY LOCKED SCREEN ── */
            <motion.div
              key="gate"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center z-10"
            >
              {/* ── LEFT: BRANDING & ACTIONS ── */}
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-16">
                <div className="flex flex-col items-center lg:items-start gap-10">
                  <motion.div
                    className="w-20 h-20 p-2 bg-white rounded-[1.5rem] shadow-[0_15px_30px_rgba(0,0,0,0.05)] border border-black/5"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <img src="/official-whale-monochrome.png" className="w-full h-full object-contain" alt="Whale" />
                  </motion.div>

                  <div className="space-y-4">
                    <h1 className="text-8xl font-black tracking-[-0.08em] text-[#050505] leading-[0.8]">
                      GATEWAY<br /><span className="italic">LOCKED</span>
                    </h1>
                    <p className="text-[14px] font-bold text-[#050505]/30 max-w-[380px] leading-relaxed uppercase tracking-[0.08em]">
                      Acceso restringido. Autentica tu identidad criptográfica para desbloquear el terminal.
                    </p>
                  </div>
                </div>

                {/* ── ACTION BUTTONS ── */}
                <div className="w-full max-w-sm space-y-4">
                  {/* PRIMARY: Custom Wallet Picker */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsPickerOpen(true)}
                    className="group w-full h-24 bg-[#050505] text-white rounded-[2.5rem] flex items-center justify-between px-10 relative overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.35)] transition-all"
                  >
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-6 relative z-10">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/5">
                        <Wallet size={20} className="text-white/60" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Acceso Directo</p>
                        <p className="text-sm font-black uppercase tracking-[0.15em]">Conectar Wallet</p>
                      </div>
                    </div>
                    <ChevronRight size={22} className="text-white/20 group-hover:translate-x-2 transition-transform relative z-10" />
                  </motion.button>

                  {/* Divider */}
                  <div className="flex items-center gap-6 px-10 opacity-20">
                    <div className="h-px flex-1 bg-black" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] leading-none">O HANDSHAKE</span>
                    <div className="h-px flex-1 bg-black" />
                  </div>

                  {/* SECONDARY: Mobile Sovereign App info */}
                  <div className="p-6 bg-black/[0.02] border border-black/5 rounded-[2.5rem] flex items-start gap-5">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0 animate-pulse">
                      <Smartphone size={18} className="text-indigo-600" />
                    </div>
                    <div className="text-left space-y-1">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#050505]/70">Sincronización Móvil</p>
                      <p className="text-[11px] font-medium text-[#050505]/40 leading-relaxed">
                        Abre <strong className="text-[#050505]/60">humanidfi.com</strong> en tu móvil y escanea el QR para vincular sin extensión.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── RIGHT: QR PANEL ── */}
              <div className="relative flex flex-col items-center">
                <div className="relative p-14 bg-white rounded-[5rem] shadow-[0_120px_240px_-60px_rgba(0,0,0,0.12)] border border-black/[0.04] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#050505]/[0.02] to-transparent" />

                  {/* Corner Accents */}
                  <div className="absolute top-10 left-10 w-16 h-16 border-t-4 border-l-4 border-black/[0.04] rounded-tl-3xl" />
                  <div className="absolute top-10 right-10 w-16 h-16 border-t-4 border-r-4 border-black/[0.04] rounded-tr-3xl" />
                  <div className="absolute bottom-10 left-10 w-16 h-16 border-b-4 border-l-4 border-black/[0.04] rounded-bl-3xl" />
                  <div className="absolute bottom-10 right-10 w-16 h-16 border-b-4 border-r-4 border-black/[0.04] rounded-br-3xl" />

                  <div className="relative z-10 w-[280px] h-[280px] flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      {qrSession && syncStatus !== 'SYNCED' ? (
                        <motion.div
                          key={qrSession}
                          initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.9 }}
                          animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                          exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.1 }}
                          transition={{ duration: 0.8 }}
                          className="relative p-5 bg-white rounded-[2rem] shadow-inner"
                        >
                          <QRCodeSVG
                            value={`SOVEREIGN_HANDSHAKE:${qrSession}`}
                            size={234}
                            level="H"
                            bgColor="transparent"
                            fgColor="#050505"
                            includeMargin={false}
                            imageSettings={{
                              src: "/official-whale-monochrome.png",
                              x: undefined, y: undefined,
                              height: 48, width: 48,
                              excavate: true,
                            }}
                          />
                          {/* Scanning line */}
                          <motion.div
                            className="absolute inset-x-0 h-0.5 bg-black/10 blur-[1px] z-50 pointer-events-none"
                            animate={{ top: ["10%", "90%", "10%"] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                          />
                        </motion.div>
                      ) : syncStatus === 'SYNCED' ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center gap-5 text-green-600"
                        >
                          <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center border-4 border-green-500/20">
                            <CheckCircle2 size={48} className="text-green-600" />
                          </div>
                          <p className="text-[11px] font-black uppercase tracking-[0.4em]">Sincronizado</p>
                        </motion.div>
                      ) : (
                        <div className="flex flex-col items-center gap-4">
                          <RefreshCw size={40} className="text-black/10 animate-spin" />
                          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">Asegurando sesión...</span>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Telemetry Footer */}
                <div className="mt-10 flex flex-col items-center space-y-5">
                  <div className="flex items-center gap-10 text-[9px] font-black uppercase tracking-[0.3em] text-[#050505]/40">
                    <div className="flex items-center gap-2">
                      <Cpu size={12} className="text-black" />
                      <span>SSL Encrypted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe size={12} className="text-black" />
                      <span>Refresco {timeLeft}s</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity size={12} className="text-black animate-pulse" />
                      <span>Live</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-px w-10 bg-black/10" />
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-4 border-[#FAF9F6] bg-black/[0.04] flex items-center justify-center grayscale opacity-30">
                          <Fingerprint size={12} />
                        </div>
                      ))}
                      <div className="w-8 h-8 rounded-full border-4 border-[#FAF9F6] bg-black/[0.04] flex items-center justify-center opacity-30">
                        <span className="text-[8px] font-black">+14k</span>
                      </div>
                    </div>
                    <div className="h-px w-10 bg-black/10" />
                  </div>

                  <p className="text-[9px] font-black text-[#050505]/10 uppercase tracking-[0.6em]">
                    INSTITUTIONAL GRADE V4
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HUD Decoration */}
        <div className="fixed top-10 left-10 flex items-center gap-5 pointer-events-none opacity-15">
          <div className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em]">Handshake Protocol Active</span>
        </div>
      </div>
    </>
  );
}
