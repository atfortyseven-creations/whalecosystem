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


// ─── SESSION PERSISTENCE (4-layer, never re-prompt) ──────────────────────────
const LS_SESSION_KEY = 'sovereign_session_v2';

function hasValidStoredSession(addr?: string): boolean {
  try {
    // Layer 1: cookie
    if (document.cookie.split('; ').some(r => r.startsWith('sovereign_handshake='))) return true;
    // Layer 2: localStorage with 30-day TTL
    const raw = localStorage.getItem(LS_SESSION_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      const addrOk = !addr || data.address?.toLowerCase() === addr.toLowerCase();
      if (addrOk && data.exp > Date.now()) return true;
    }
    // Layer 3: sessionStorage per address
    if (addr && sessionStorage.getItem(`sovereign_signed_${addr.toLowerCase()}`) === 'true') return true;
  } catch {}
  return false;
}

function writeSessionAll(addr: string) {
  const norm = addr.toLowerCase();
  // Cookie — 30 days
  document.cookie = `sovereign_handshake=${norm}; path=/; max-age=2592000; SameSite=Lax`;
  // localStorage — 30 days TTL
  try {
    localStorage.setItem(LS_SESSION_KEY, JSON.stringify({
      address: norm,
      exp: Date.now() + 30 * 24 * 60 * 60 * 1000,
    }));
  } catch {}
  // sessionStorage
  sessionStorage.setItem(`sovereign_signed_${norm}`, 'true');
}

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

// ─── MAIN GATE COMPONENT ────────────────────────────────────────────────────
export function LinkedGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLinked, setLinked } = useUIStore();
  const { isConnected: isWalletConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  
  const [isMounted, setIsMounted] = useState(false);
  const prevWalletConnected = usePrevious(isWalletConnected);

  // ── Read session from ALL 3 layers on mount ──────────────────────────────
  useEffect(() => {
    setIsMounted(true);
    if (typeof document !== 'undefined' && hasValidStoredSession(address)) {
      setLinked(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setLinked, address]);

  // ── Auto-Link Wallet WITHOUT secondary signature ────────────────────────
  useEffect(() => {
    if (!isMounted) return;

    // ── INHUMAN OPTIMIZATION: Nuclear Guard State Transition Fix ──
    // If the wallet transitions from disconnected to connected, the user intentionally
    // re-authenticated. We MUST purge the __disconnected__ flag to resume auto-routing.
    if (prevWalletConnected === false && isWalletConnected) {
        sessionStorage.removeItem('__disconnected__');
    }

    // Nuclear Logout Guard: If the user just manually disconnected in this tab session,
    // do NOT auto-link them back immediately even if the wallet is still connected.
    const justDisconnected = sessionStorage.getItem('__disconnected__') === '1';
    if (justDisconnected && !isLinked) {
        console.log('[LinkedGate] Nuclear Logout Guard active — blocking auto-link');
        return;
    }

    // Triple-check all layers — zero false positives
    if (typeof document !== 'undefined' && hasValidStoredSession(address)) {
      setLinked(true);
      return;
    }
    if (isWalletConnected && !isLinked && address) {
      writeSessionAll(address);
      setLinked(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWalletConnected, isLinked, isMounted, address, prevWalletConnected]);


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
                     pathname.startsWith('/chat') ||
                     (pathname.startsWith('/forum') && !pathname.startsWith('/forum/settings'));
    // Only redirect if NOT connected at all (not just un-signed)
    if (!isLinked && !isWalletConnected && !isPublic) {
      router.replace('/connect');
    }
  }, [isLinked, isWalletConnected, isMounted, pathname, router]);



  return <>{children}</>;
}

