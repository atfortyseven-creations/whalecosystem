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
import { useAccount, useConnect, useSignMessage, useReconnect, useChainId, useSwitchChain, useDisconnect } from 'wagmi';
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
export function SignContractStep({ onSigned, onDisconnect }: { onSigned: () => void; onDisconnect: () => void }) {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { reconnect } = useReconnect();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAcceptedToS, setHasAcceptedToS] = useState(false);

  // Check if current chain is supported
  const isSupportedChain = [1, 10, 56, 137, 42161, 8453, 480].includes(chainId);

  const handleSign = async () => {
    if (!address) return;
    setIsSigning(true);
    setError(null);
    try {
      const message = [
        '╔══════════════════════════════════════╗',
        '║       WHALE ALERT NETWORK            ║',
        '║    SOVEREIGN IDENTITY PROTOCOL       ║',
        '╚══════════════════════════════════════╝',
        '',
        `ADDRESS: ${address}`,
        `NONCE:   ${Date.now()}`,
        `ACCESS:  INSTITUTIONAL_TERMINAL_V4`,
        '',
        'BY SIGNING, YOU CONFIRM OWNERSHIP OF',
        'THIS IDENTITY AND ACCEPT THE MASTER',
        'TERMS FOR CRYPTOGRAPHIC ACCESS.',
        '',
        'NO GAS OR TRANSACTION FEES REQUIRED.',
        '════════════════════════════════════════',
      ].join('\n');

      const signature = await signMessageAsync({ message });

      if (signature) {
        const norm = address.toLowerCase();
        document.cookie = `sovereign_handshake=${norm}; path=/; max-age=604800; SameSite=Lax`;
        sessionStorage.setItem(`sovereign_signed_${norm}`, 'true');

        toast.success('IDENTITY LINKED', {
          description: `Terminal unlocked. ${address.slice(0, 6)}...${address.slice(-4)}`,
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
      console.error('[LinkedGate] Sign error:', e);
      if (e?.code === 4001 || e?.message?.includes('rejected')) {
        setError('Signature rejected. You must sign to access the terminal.');
      } else {
        // Fallback: try to reconnect the provider and show the actual error
        try { reconnect(); } catch {}
        setError(e?.message || 'Unexpected error. Please try again.');
      }
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center text-center w-full"
    >
      <div className="mb-10 opacity-80">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#050505" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 16V12" stroke="#050505" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 8H12.01" stroke="#050505" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <h3 className="font-aztec-serif text-5xl md:text-6xl text-[#050505] tracking-tight leading-[1.1] mb-6">
        Sign the <br/> <span className="italic">contract</span>
      </h3>
      
      <p className="font-aztec-serif text-[15px] md:text-[17px] text-[#050505]/60 max-w-sm mb-12 italic leading-relaxed">
        A cryptographic attestation to verify your identity. Zero gas required.
      </p>

      <div className="w-full h-px bg-black/10 mb-8" />

      <div className="flex items-center justify-between w-full mb-10">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#050505]/60 font-bold">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </div>
        <button
          onClick={onDisconnect}
          className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#050505]/40 hover:text-[#050505] transition-colors"
        >
          Disconnect
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full text-red-600 font-mono text-[10px] uppercase tracking-[0.1em] text-center mb-6"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full flex flex-col gap-8">
        {!isSupportedChain && (
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-center">
            <p className="text-amber-600 font-mono text-[9px] uppercase tracking-wider mb-3">Unsupported Network Detection</p>
            <button 
              onClick={() => switchChain?.({ chainId: 1 })}
              className="font-mono text-[10px] underline uppercase tracking-widest text-amber-700 font-bold"
            >
              Switch to Ethereum Mainnet
            </button>
          </div>
        )}

        <label className="flex items-start gap-4 group cursor-pointer text-left">
          <div className="relative flex items-center justify-center w-4 h-4 mt-[3px] border border-black/30 rounded-sm group-hover:border-black transition-colors shrink-0">
            <input 
              type="checkbox" 
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
              checked={hasAcceptedToS} 
              onChange={(e) => setHasAcceptedToS(e.target.checked)} 
            />
            {hasAcceptedToS && <div className="w-2 h-2 bg-[#050505] rounded-[1px]" />}
          </div>
          <span className="font-serif text-[11px] text-[#050505]/80 uppercase tracking-[0.15em] leading-[1.8]">
            I verify I am not a US citizen and accept the <a href="/docs/legal/TERMS_OF_SERVICE.md" className="italic underline underline-offset-4 decoration-black/20 hover:decoration-black transition-colors text-black" target="_blank">Master Terms</a> & Waiver.
          </span>
        </label>

        <button
          onClick={handleSign}
          disabled={isSigning || !hasAcceptedToS}
          className="relative w-full overflow-hidden group border border-[#050505] bg-transparent text-[#050505] py-5 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#050505] hover:text-[#FAF9F6]"
        >
          <div className="absolute inset-0 bg-[#050505] translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1] z-0" />
          <span className="relative z-10 font-mono text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3">
            {isSigning ? (
              <><RefreshCw size={14} className="animate-spin" /> Cryptographic Signing...</>
            ) : (
              <><Fingerprint size={14} /> Initiate Handshake</>
            )}
          </span>
        </button>
      </div>
    </motion.div>
  );
}

// ─── MAIN GATE COMPONENT ────────────────────────────────────────────────────
export function LinkedGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLinked, setLinked } = useUIStore();
  const { isConnected: isWalletConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  
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
  // SOVEREIGN LAW: 400ms debounce prevents false-positive redirects during the
  // transient window right after a wallet connects (before the sign step or
  // sovereign_handshake cookie has been written).
  useEffect(() => {
    if (!isMounted) return;
    const isPublic = pathname === '/' ||
                     pathname.startsWith('/connect') ||
                     pathname.startsWith('/docs') ||
                     pathname.startsWith('/privacy') ||
                     pathname.startsWith('/terms') ||
                     pathname.startsWith('/developers') ||
                     pathname.startsWith('/news') ||
                     (pathname.startsWith('/forum') && !pathname.startsWith('/forum/settings'));
    // Only redirect if NOT connected at all (not just un-signed)
    if (!isLinked && !isWalletConnected && !isPublic) {
      const t = setTimeout(() => router.replace('/connect'), 400);
      return () => clearTimeout(t);
    }
  }, [isLinked, isWalletConnected, isMounted, pathname, router]);


  const handleSigned = useCallback(() => {
    setShowSignStep(false);
    setLinked(true);
  }, [setLinked]);

  const handleDisconnect = useCallback(() => {
    try { disconnect(); } catch {}
    setShowSignStep(false);
    router.push('/');
  }, [router, disconnect]);


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
                   pathname.startsWith('/news') ||
                   (pathname.startsWith('/forum') && !pathname.startsWith('/forum/settings'));
  if (isPublic) return <>{children}</>;

  // ── Wallet connected but not signed: show contract step ───────────────────
  if (showSignStep) {
    return (
      <div className="fixed inset-0 z-[10000] bg-[#FAF9F6] flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none noise-bg" />
        
        {/* Decorative corner accents to match the minimalist architecture */}
        <div className="absolute top-8 left-8 w-16 h-px bg-black/10" />
        <div className="absolute top-8 left-8 w-px h-16 bg-black/10" />
        
        <div className="absolute bottom-8 right-8 w-16 h-px bg-black/10" />
        <div className="absolute bottom-8 right-8 w-px h-16 bg-black/10" />

        <div className="relative z-10 w-full max-w-md">
          <SignContractStep onSigned={handleSigned} onDisconnect={handleDisconnect} />
        </div>
      </div>
    );
  }

  return null;
}

