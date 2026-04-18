"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
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
import dynamic from 'next/dynamic';

const UniversalEliteWallpaper = dynamic(
  () => import('@/components/shared/UniversalEliteWallpaper').then(m => ({ default: m.UniversalEliteWallpaper })),
  { ssr: false }
);

const QR_TTL = 300;

// ─── HUGE ANIMATED WHALE ───────────────────────────────
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
    </div>
  );
}

// ─── WALLET DEFINITIONS ─────────────────────────────────────────────────────
interface PCWallet {
  id: string;
  name: string;
  description: string;
  icon: string;
  isImage: boolean;
  color: string;
  tag: string;
}

const PC_WALLETS: PCWallet[] = [
  {
    id: 'metamask',
    name: 'METAMASK',
    description: 'BROWSER EXTENSION · INJECTED',
    icon: '/official-whale-monochrome.png',
    isImage: true,
    color: '#050505',
    tag: 'INJECTED'
  },
  {
    id: 'coinbase',
    name: 'COINBASE WALLET',
    description: 'SMART WALLET · MPC',
    icon: '/official-whale-monochrome.png', 
    isImage: true,
    color: '#050505',
    tag: 'MPC'
  },
  {
    id: 'walletconnect',
    name: 'WALLETCONNECT',
    description: 'UNIVERSAL · ANY WALLET',
    icon: '/official-whale-monochrome.png', 
    isImage: true,
    color: '#050505',
    tag: 'UNIVERSAL'
  },
  {
    id: 'rabby',
    name: 'RABBY WALLET',
    description: 'MULTI-CHAIN · INJECTED',
    icon: '/official-whale-monochrome.png',
    isImage: true,
    color: '#050505',
    tag: 'INJECTED'
  },
];

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
        document.cookie = `sovereign_handshake=${address}; path=/; max-age=604800; SameSite=Lax`;
        sessionStorage.setItem(`sovereign_signed_${address}`, 'true');

        toast.success('IDENTIDAD VINCULADA', {
          description: `Terminal desbloqueado. ${address.slice(0, 6)}...${address.slice(-4)}`,
          className: 'font-black uppercase tracking-widest',
        });

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
      <div className="w-20 h-20 bg-white rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-black/5 flex items-center justify-center">
        <Shield size={32} className="text-[#050505]" />
      </div>

      <div className="flex items-center gap-2 px-4 py-2 bg-white border border-black/5 rounded-full shadow-sm">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[11px] font-black uppercase tracking-widest text-[#050505]/60 font-mono">
          {address?.slice(0, 8)}…{address?.slice(-6)}
        </span>
      </div>

      <div className="space-y-2">
        <h3 className="text-4xl font-black tracking-tighter text-[#050505] leading-none">
          Firma el<br />
          <span className="italic">Contrato</span>
        </h3>
        <p className="text-[12px] font-medium text-[#050505]/40 max-w-[260px] leading-relaxed uppercase tracking-[0.08em]">
          Firma el mensaje de identidad para autenticarte. No se realiza ninguna transacción on-chain.
        </p>
      </div>

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
  const pathname = usePathname();
  const router = useRouter();
  const { isLinked, setLinked } = useUIStore();
  const { isConnected: isWalletConnected, address } = useAccount();
  
  const [isMounted, setIsMounted] = useState(false);
  const [showSignStep, setShowSignStep] = useState(false);

  // ── Detect already-signed session from cookie ──────────────────────────
  useEffect(() => {
    setIsMounted(true);
    if (typeof document !== 'undefined') {
      const hasHandshake = document.cookie
        .split('; ')
        .some(row => row.startsWith('sovereign_handshake='));
      if (hasHandshake) {
        setLinked(true);
      }
    }
  }, [setLinked]);

  // ── When wallet connects, show sign step (unless already linked) ─────────
  useEffect(() => {
    if (!isMounted) return;

    // Fast synchronous check to avoid race condition
    if (typeof document !== 'undefined') {
      const hasHandshake = document.cookie
        .split('; ')
        .some(row => row.startsWith('sovereign_handshake='));
      
      if (hasHandshake) {
        setLinked(true);
        setShowSignStep(false);
        return;
      }
    }

    if (isWalletConnected && !isLinked && !showSignStep) {
      // Check sessionStorage for this specific address (tab-level cache)
      if (address) {
        const alreadySigned = sessionStorage.getItem(`sovereign_signed_${address}`) === 'true';
        if (alreadySigned) {
          setLinked(true);
          return;
        }
      }
      setShowSignStep(true);
    }
    if (!isWalletConnected && !isLinked) {
      setShowSignStep(false);
    }
  }, [isWalletConnected, isLinked, isMounted, address, showSignStep, setLinked]);

  // ── Body scroll lockdown when gate is active ──────────────────────────────
  useEffect(() => {
    if (!isMounted) return;
    const shouldLock = !isLinked && !isWalletConnected;
    document.body.style.overflow = shouldLock ? 'hidden' : '';
    document.documentElement.style.overflow = shouldLock ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isLinked, isWalletConnected, isMounted]);

  // ── Redirect unauthenticated users to /connect ────────────────────────────
  useEffect(() => {
    if (!isMounted) return;
    const isPublic = pathname === '/' ||
                     pathname.startsWith('/connect') ||
                     pathname.startsWith('/docs') ||
                     pathname.startsWith('/privacy') ||
                     pathname.startsWith('/terms') ||
                     pathname.startsWith('/developers') ||
                     pathname.startsWith('/news');
    // Only redirect if NOT connected at all (not just un-signed)
    if (!isLinked && !isWalletConnected && !isPublic) {
      router.replace('/connect');
    }
  }, [isLinked, isWalletConnected, isMounted, pathname, router]);

  const handleSigned = useCallback(() => {
    setShowSignStep(false);
    setLinked(true);
  }, [setLinked]);

  const handleDisconnect = useCallback(() => {
    setShowSignStep(false);
    window.location.reload();
  }, []);

  if (!isMounted) return null;

  // ── Always render the root landing page, let it handle its own UX ──────────
  if (pathname === '/') {
    return <>{children}</>;
  }

  // ── Already authenticated: render dashboard ───────────────────────────────
  if (isLinked) return <>{children}</>;

  // ── Public pages: render children ──────────────────────────────────────────
  const isPublic = pathname.startsWith('/connect') ||
                   pathname.startsWith('/docs') ||
                   pathname.startsWith('/privacy') ||
                   pathname.startsWith('/terms') ||
                   pathname.startsWith('/developers') ||
                   pathname.startsWith('/news');
  if (isPublic) return <>{children}</>;

  // ── Wallet connected but not signed: show contract step ───────────────────
  if (showSignStep) {
    return (
      <div className="fixed inset-0 z-[10000] bg-transparent flex items-center justify-center p-6">
        <UniversalEliteWallpaper />
        <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/50 shadow-2xl">
          <SignContractStep onSigned={handleSigned} onDisconnect={handleDisconnect} />
        </div>
      </div>
    );
  }

  return null;
}

