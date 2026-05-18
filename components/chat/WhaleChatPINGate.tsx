'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppKit } from '@reown/appkit/react';
import { useDisconnect } from 'wagmi';
import { useSovereignAccount as useAccount } from '@/hooks/useSovereignAccount';
import { useWalletStore } from '@/lib/store/wallet-store';
import { ArrowLeft, Delete, LogOut, RefreshCw, ShieldCheck, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useSovereignSignOut } from '@/hooks/useSovereignSignOut';
import { RemoteLottie } from '@/components/ui/RemoteLottie';

// ─────────────────────────────────────────────────────────────────────────────
// Storage keys
// ─────────────────────────────────────────────────────────────────────────────

const PIN_STORAGE_PREFIX = 'whale_chat_pin_';

function getPINKey(address: string) {
  return `${PIN_STORAGE_PREFIX}${address.toLowerCase()}`;
}

function storedPINHash(address: string): string | null {
  if (typeof window === 'undefined') return null;
  const key = getPINKey(address);
  
  // 1. Try localStorage
  let hash = localStorage.getItem(key);
  if (hash) return hash;
  
  // 2. Try cookie (survives private browsing restarts)
  const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
  if (match) {
    hash = match[2];
    localStorage.setItem(key, hash); // restore to localStorage
    return hash;
  }
  return null;
}

// Simple hash — we XOR-mix the PIN chars with the address chars for uniqueness
// This is NOT cryptographic security, it is just a local UX lock.
function hashPIN(pin: string, address: string): string {
  let h = 0;
  const salt = address.toLowerCase();
  for (let i = 0; i < pin.length; i++) {
    h = ((h << 5) - h + pin.charCodeAt(i) * (salt.charCodeAt(i % salt.length) || 1)) | 0;
  }
  return h.toString(16);
}

function savePIN(pin: string, address: string) {
  const key = getPINKey(address);
  const hash = hashPIN(pin, address);
  localStorage.setItem(key, hash);
  // Max-age 10 years to ensure it never expires
  document.cookie = `${key}=${hash}; max-age=315360000; path=/; samesite=lax`;
}

function verifyPIN(pin: string, address: string): boolean {
  const stored = storedPINHash(address);
  if (!stored) return false;
  return stored === hashPIN(pin, address);
}

async function wipeXMTPDatabases() {
  if (typeof indexedDB === 'undefined') return;
  try {
    const dbs = await indexedDB.databases();
    dbs.forEach((db) => {
      if (db.name && db.name.toLowerCase().includes('xmtp')) {
        indexedDB.deleteDatabase(db.name);
      }
    });
  } catch (e) {
    console.error('Failed to wipe XMTP databases', e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Format address
// ─────────────────────────────────────────────────────────────────────────────

function formatAddress(addr: string) {
  if (!addr) return '';
  return addr.slice(0, 8) + ' ···· ' + addr.slice(-6);
}

// ─────────────────────────────────────────────────────────────────────────────
// PIN Dot Display
// ─────────────────────────────────────────────────────────────────────────────

function PINDots({ length, filled }: { length: number; filled: number }) {
  return (
    <div className="flex items-center justify-center gap-4 my-6">
      {Array.from({ length }).map((_, i) => (
        <motion.div
          key={i}
          animate={i < filled ? { scale: [1, 1.3, 1], opacity: 1 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.15 }}
          className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
            i < filled
              ? 'bg-[#050505] border-[#050505]'
              : 'bg-transparent border-[#050505]/20'
          }`}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Numeric Keypad
// ─────────────────────────────────────────────────────────────────────────────

const PAD_KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫'] as const;

function NumPad({ onPress }: { onPress: (key: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mx-auto">
      {PAD_KEYS.map((key, idx) => {
        if (key === '') {
          return <div key={idx} />;
        }
        const isDelete = key === '⌫';
        return (
          <motion.button
            key={key}
            whileTap={{ scale: 0.9 }}
            onClick={() => onPress(isDelete ? 'del' : key)}
            className={`h-16 rounded-2xl text-[20px] font-bold flex items-center justify-center transition-all select-none
              ${isDelete
                ? 'bg-black/5 text-black/40 hover:bg-black/10 hover:text-black/70'
                : 'bg-[#F5F5F3] text-[#050505] hover:bg-[#EBEBEA] active:bg-black/10 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-black/5'
              }`}
          >
            {isDelete ? <Delete size={20} /> : key}
          </motion.button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Gate Component
// ─────────────────────────────────────────────────────────────────────────────

type Phase = 'confirm' | 'set-pin' | 'set-pin-confirm' | 'enter-pin';

interface Props {
  onEnter: () => void;
}

export default function WhaleChatPINGate({ onEnter }: Props) {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  const { clearWallet } = useWalletStore();
  const { nuclearDisconnect } = useSovereignSignOut();

  const [phase, setPhase] = useState<Phase>('confirm');
  const [pin, setPin] = useState('');
  const [pinFirst, setPinFirst] = useState(''); // stores first entry during set flow
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Determine whether a PIN exists for this address
  const hasPIN = address ? storedPINHash(address) !== null : false;

  // On mount / address change: decide initial phase
  useEffect(() => {
    if (!address) return;
    setPin('');
    setPinFirst('');
    if (storedPINHash(address)) {
      setPhase('enter-pin');
    } else {
      setPhase('confirm');
    }
  }, [address]);

  // ── Handle keypad ─────────────────────────────────────────────────────────

  const handleKey = useCallback((key: string) => {
    if (key === 'del') {
      setPin(p => p.slice(0, -1));
      return;
    }
    setPin(p => {
      if (p.length >= 6) return p;
      return p + key;
    });
  }, []);

  // ── Auto-submit when 6 digits entered ────────────────────────────────────

  useEffect(() => {
    if (pin.length < 6) return;
    const timer = setTimeout(() => {
      if (phase === 'set-pin') {
        setPinFirst(pin);
        setPin('');
        setPhase('set-pin-confirm');
      } else if (phase === 'set-pin-confirm') {
        if (pin === pinFirst) {
          savePIN(pin, address!);
          toast.success('PIN created. Welcome to Whale Chat!');
          onEnter();
        } else {
          triggerShake();
          setPinFirst('');
          setPin('');
          setPhase('set-pin');
          toast.error('PINs do not match. Please try again.');
        }
      } else if (phase === 'enter-pin') {
        if (verifyPIN(pin, address!)) {
          onEnter();
        } else {
          triggerShake();
          setPin('');
          const next = attempts + 1;
          setAttempts(next);
          if (next >= 5) {
            toast.error('Security breach detected. Wiping all chats and locking device.');
            // Delete the PIN so they can't keep trying
            localStorage.removeItem(getPINKey(address!));
            document.cookie = `${getPINKey(address!)}=; max-age=0; path=/; samesite=lax`;
            // Wipe XMTP DBs, then disconnect entirely
            wipeXMTPDatabases().finally(() => {
              nuclearDisconnect();
            });
          } else {
            toast.error(`Incorrect PIN (${5 - next} attempts left)`);
          }
        }
      }
    }, 120);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, phase]);

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  // ── Disconnect ────────────────────────────────────────────────────────────

  function handleDisconnect() {
    toast.success('Session disconnected.');
    nuclearDisconnect();
  }

  // ── Phase labels ─────────────────────────────────────────────────────────

  const phaseLabel: Record<Phase, { title: string; sub: string }> = {
    'confirm': {
      title: 'Are you sure?',
      sub: 'You are about to enter Whale Chat with this address.',
    },
    'set-pin': {
      title: 'Create a PIN',
      sub: 'Choose a 6-digit PIN to protect your chat session.',
    },
    'set-pin-confirm': {
      title: 'Confirm your PIN',
      sub: 'Re-enter the same 6 digits to confirm.',
    },
    'enter-pin': {
      title: 'Enter your PIN',
      sub: 'Enter your 6-digit PIN to access Whale Chat.',
    },
  };

  if (!isConnected || !address) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/95 backdrop-blur-xl">
        <div className="text-center space-y-4">
          <AlertTriangle size={40} className="text-amber-500 mx-auto" />
          <h2 className="text-2xl font-black uppercase tracking-tighter text-[#050505]">No Wallet Connected</h2>
          <p className="text-[14px] text-black/50 font-medium">Please connect a wallet to access Whale Chat.</p>
          <button
            onClick={() => open()}
            className="mt-4 px-8 py-3.5 rounded-[18px] bg-[#050505] text-white font-black tracking-widest text-[12px] uppercase shadow-lg hover:bg-[#111] transition-all"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#FAFAF8] overflow-y-auto py-8"
    >
      {/* Subtle noise background */}
      <div className="fixed inset-0 bg-gradient-to-br from-white via-[#F8F7F4] to-[#F0EFE9] pointer-events-none" />

      <motion.div
        layout
        className="relative z-10 w-full max-w-[420px] mx-auto px-6 flex flex-col items-center"
      >

        {/* ── LOTTIE & GIF ── */}
        <div className="relative mb-8 flex flex-col items-center w-full">
          <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="z-20 relative -mb-10 bg-white w-24 h-24 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-black/[0.04]"
          >
            <RemoteLottie path="system-shots/Paper airplane.json" className="w-14 h-14" />
          </motion.div>

          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full flex justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/system-shots/original-510ee2686e0287925ae0424ca40901f5.gif"
              alt="Whale Chat"
              className="w-72 h-72 object-contain mx-auto rounded-[36px] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-black/[0.04]"
              draggable={false}
            />
          </motion.div>
        </div>

        {/* ── Address pill ── */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex items-center gap-2.5 px-5 py-2.5 bg-white border border-black/8 rounded-full shadow-sm mb-2"
        >
          <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
          <span className="font-mono text-[13px] font-semibold text-[#050505] tracking-wide">
            {address.slice(0, 6)}
            <span className="text-black/30 mx-1">····</span>
            {address.slice(-6)}
          </span>
        </motion.div>

        {/* ── Phase card ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full mt-5"
          >
            {/* Title */}
            <div className="text-center mb-1">
              <h1 className="text-[26px] font-black text-[#050505] tracking-tighter leading-tight">
                {phaseLabel[phase].title}
              </h1>
              <p className="text-[14px] text-black/45 font-medium mt-1 leading-snug">
                {phaseLabel[phase].sub}
              </p>
            </div>

            {/* ── CONFIRM PHASE ── */}
            {phase === 'confirm' && (
              <div className="mt-8 space-y-3">
                <button
                  onClick={() => setPhase('set-pin')}
                  className="w-full py-5 rounded-[20px] bg-[#050505] text-white font-black tracking-widest text-[13px] uppercase shadow-lg hover:bg-[#111] active:scale-[0.98] transition-all"
                >
                  Yes, continue with this address
                </button>
                <button
                  onClick={() => open()}
                  className="w-full py-4 rounded-[20px] bg-white border border-black/10 text-[#050505] font-black tracking-widest text-[13px] uppercase hover:border-black/25 hover:bg-black/[0.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
                >
                  <RefreshCw size={15} />
                  Connect another wallet
                </button>
              </div>
            )}

            {/* ── PIN ENTRY PHASES ── */}
            {(phase === 'set-pin' || phase === 'set-pin-confirm' || phase === 'enter-pin') && (
              <div className="mt-4">
                {/* Back button for set phases */}
                {phase !== 'enter-pin' && (
                  <button
                    onClick={() => {
                      setPin('');
                      setPinFirst('');
                      setPhase('confirm');
                    }}
                    className="flex items-center gap-1.5 text-[12px] font-bold text-black/40 hover:text-black/70 transition-colors mb-4 mx-auto"
                  >
                    <ArrowLeft size={13} /> Back
                  </button>
                )}

                {/* PIN dots */}
                <motion.div
                  animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <PINDots length={6} filled={pin.length} />
                </motion.div>

                {/* Attempt warning */}
                {phase === 'enter-pin' && attempts > 0 && (
                  <p className="text-center text-[12px] text-rose-500 font-bold mb-3">
                    {5 - attempts} attempt{5 - attempts !== 1 ? 's' : ''} remaining
                  </p>
                )}

                {/* Numpad */}
                <div className="mt-2">
                  <NumPad onPress={handleKey} />
                </div>

                {/* Forgot / reset PIN (enter phase) */}
                {phase === 'enter-pin' && (
                  <button
                    onClick={() => {
                      localStorage.removeItem(getPINKey(address!));
                      document.cookie = `${getPINKey(address!)}=; max-age=0; path=/; samesite=lax`;
                      setPin('');
                      setAttempts(0);
                      setPhase('confirm');
                      toast('PIN reset. You will need to create a new one.');
                    }}
                    className="w-full text-center text-[11px] font-black uppercase tracking-widest text-black/30 hover:text-black/60 transition-colors mt-6"
                  >
                    Forgot PIN? Reset access
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Connect another wallet (always visible at bottom) ── */}
        {phase !== 'confirm' && (
          <div className="mt-8 pt-6 border-t border-black/6 w-full flex flex-col gap-2">
            <button
              onClick={() => open()}
              className="w-full py-3.5 rounded-[18px] bg-transparent border border-black/10 text-[#050505] font-bold text-[13px] hover:bg-black/[0.03] hover:border-black/20 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} />
              Connect another wallet
            </button>
            <button
              onClick={handleDisconnect}
              className="w-full py-3.5 rounded-[18px] text-rose-500 font-bold text-[13px] hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={14} />
              Disconnect this session
            </button>
          </div>
        )}

        {/* ── Disconnect button on confirm phase ── */}
        {phase === 'confirm' && (
          <button
            onClick={handleDisconnect}
            className="mt-6 flex items-center gap-2 text-[12px] font-bold text-rose-400 hover:text-rose-600 transition-colors"
          >
            <LogOut size={13} />
            Disconnect session
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
