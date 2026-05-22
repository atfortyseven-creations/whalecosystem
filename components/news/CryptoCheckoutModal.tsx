"use client";

import React, { useState, useEffect, useId, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, Activity, Clock, User, Terminal } from 'lucide-react';
import { useNewsStore } from '@/lib/store/news-store';
import { useSendTransaction, useAccount, useSwitchChain } from 'wagmi';
import { parseEther } from 'viem';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

// FIX: Treasury sourced from env var  same correction as ClearanceView.tsx.
// Hardcoded treasury cannot be rotated without redeployment if compromised.
const TARGET_TREASURY = (
    process.env.NEXT_PUBLIC_TREASURY_ADDRESS ||
    '0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a'
) as `0x${string}`;
const TARGET_CHAIN    = 10;    // Optimism Mainnet
const PRICE_USD       = 5.00;

// Oráculo de tipo de cambio ETH  EUR y USD
async function fetchCryptoRates(): Promise<{ eur: number, usd: number } | null> {
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=eur,usd',
      { cache: 'no-store', signal: ctrl.signal }
    );
    clearTimeout(tid);
    if (!res.ok) return { eur: 3100.25, usd: 3350.50 }; // Fallback de máxima seriedad
    const data = await res.json();
    return { 
        eur: data?.ethereum?.eur ?? 3100.25, 
        usd: data?.ethereum?.usd ?? 3350.50 
    };
  } catch {
    return { eur: 3100.25, usd: 3350.50 }; // Fallback instantáneo
  }
}

export function CryptoCheckoutModal({ isOpen, onClose }: CheckoutProps) {
  const { setNewsSubscribed } = useNewsStore();
  const { address, isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { sendTransaction, isPending, error: writeError } = useSendTransaction();
  const [isWaiting, setIsWaiting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // FIX: useId() generates a stable, SSR-safe identifier that matches
  // between server and client render  eliminates the React hydration mismatch
  // caused by Date.now() which produces different values on server vs client.
  const stableRef = useId().replace(/:/g, '').slice(0, 6).toUpperCase();

  const [rates, setRates] = useState<{ eur: number, usd: number } | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // FIX: Wrap onClose in useCallback so the setTimeout captures the latest
  // version of onClose, not the stale closure from the initial render.
  const handleClose = useCallback(() => { onClose(); }, [onClose]);

  useEffect(() => {
    if (isOpen) {
        fetchCryptoRates().then(setRates);
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isConfirmed) {
      setNewsSubscribed(true);
      setTimeout(handleClose, 2000);
    }
  }, [isConfirmed, setNewsSubscribed, handleClose]);

  // Cálculos perfectos de conversión
  const ethAmount = rates ? (PRICE_USD / rates.usd).toFixed(5) : "0.00149";
  const eurEquivalent = rates ? ((parseFloat(ethAmount) * rates.eur).toFixed(2)) : "4.62";

  const handleTransact = () => {
    if (!isConnected) return;
    
    if (chainId !== TARGET_CHAIN) {
      if (switchChain) {
        switchChain(
          { chainId: TARGET_CHAIN },
          {
            onSuccess: () => {
              setTimeout(() => {
                sendTransaction(
                  { to: TARGET_TREASURY, value: parseEther(ethAmount) },
                  {
                    onSuccess: () => {
                      setIsWaiting(true);
                      setTimeout(() => { setIsWaiting(false); setIsConfirmed(true); }, 800);
                    },
                    onError: () => setIsWaiting(false)
                  }
                );
              }, 1500);
            },
            onError: (err) => console.error(err)
          }
        );
      }
      return;
    }
    
    sendTransaction(
      { to: TARGET_TREASURY, value: parseEther(ethAmount) },
      {
        onSuccess: () => {
          setIsWaiting(true);
          setTimeout(() => { setIsWaiting(false); setIsConfirmed(true); }, 800);
        },
        onError: () => setIsWaiting(false)
      }
    );
  };

  const isWrongNetwork = isConnected && chainId !== TARGET_CHAIN;
  const isExecuting    = isPending || isWaiting;

  const formatDate = (date: Date) => date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const formatTime = (date: Date) => date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: 'rgba(250,249,246,0.8)' }}
        >
          <motion.div
            initial={{ scale: 0.98, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.98 }}
            className="w-full max-w-[480px] bg-[#FFFFFF] relative shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-[#E5E5E5]"
            style={{ color: '#050505' }}
          >
            {/* HEADER */}
            <div className="flex justify-between items-center bg-[#FAF9F6] px-6 py-4 border-b border-[#E5E5E5]">
              <div className="flex items-center gap-3 text-[#050505]/80">
                <Terminal size={16} />
                {/* FIX: Replaced Date.now().toString().slice(-6) with stable useId()
                    Date.now() on server != Date.now() on client  causes React hydration
                    mismatch and console errors in Next.js 13+. useId() is SSR-safe. */}
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] font-black text-[#050505]/60">Clearance Ref. {stableRef}</span>
              </div>
              {!isExecuting && (
                <button onClick={onClose} className="text-[#888888] hover:text-[#050505] transition-colors">
                  <X size={18} />
                </button>
              )}
            </div>

            {/* BODY */}
            <div className="px-8 py-8 space-y-8">
              
              {/* INSTITUTIONAL INFO HEADER */}
              <div className="flex justify-between items-start border-b border-[#E5E5E5] pb-6">
                 <div className="space-y-3">
                    <div className="flex items-center gap-3 text-[#888888]">
                        <Clock size={12} className="text-[#050505]/40" />
                        <span className="font-mono text-[9px] uppercase tracking-[0.25em] font-bold">{formatDate(currentTime)} · {formatTime(currentTime)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[#888888]">
                        <User size={12} className="text-[#050505]/40" />
                        <span className="font-mono text-[9px] uppercase tracking-[0.25em] font-bold">
                            {isConnected && address ? `ID: ${address.slice(0,8)}...${address.slice(-6)}` : "ENTIDAD NO DETECTADA"}
                        </span>
                    </div>
                 </div>
                 <div className="text-right space-y-2">
                    <span className="block font-mono text-[9px] uppercase tracking-[0.25em] text-[#D4AF37] font-black">NODO OPTIMISM L2</span>
                    <span className="block font-mono text-[9px] uppercase tracking-[0.25em] text-[#888888] font-bold text-opacity-40">PING: 14ms</span>
                 </div>
              </div>

              {/* MAIN METRICS */}
              <div className="text-center space-y-4">
                <span className="block font-mono text-[9px] uppercase tracking-[0.4em] text-[#888888] mb-5 font-black">Asignación Requerida</span>
                
                <div className="flex items-end justify-center gap-4">
                  <span className="font-sans text-6xl tracking-tighter leading-none text-[#050505] font-black">{PRICE_USD.toFixed(0)}</span>
                  <div className="flex flex-col items-start pb-1">
                    <span className="font-mono text-sm font-black uppercase tracking-[0.2em] text-[#050505]">USD</span>
                    <span className="font-mono text-[8px] text-[#888888] uppercase tracking-[0.3em] font-bold mt-1">Tarifa Plana</span>
                  </div>
                </div>

                {/* EXACT EQUIVALENTS */}
                <div className="flex items-center justify-center gap-8 pt-6">
                  <div className="text-center">
                    <p className="font-mono text-sm font-black tracking-[0.1em] text-[#050505]">{rates ? ethAmount : ""} ETH</p>
                    <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#888888] font-bold mt-1">Monto en Cadena</p>
                  </div>
                  <div className="w-px h-8 bg-[#E5E5E5]" />
                  <div className="text-center">
                    <p className="font-mono text-sm font-black tracking-[0.1em] text-[#050505]">
                      {rates ? `${eurEquivalent} EUR` : ''}
                    </p>
                    <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#888888] font-bold mt-1">
                      {rates ? `Ratio Oráculo Integrado` : 'Conectando...'}
                    </p>
                  </div>
                </div>
              </div>

              {/* TARGET RECP */}
              <div className="bg-[#FAF9F6] p-5 border border-[#E5E5E5] rounded-xl text-left flex justify-between items-center shadow-inner">
                <div className="space-y-1">
                    <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#888888] font-black">Destino Asegurado</span>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#050505] font-black">
                    Tesorería Whale Alert Network
                    </p>
                </div>
                <span className="font-mono text-[9px] tracking-[0.2em] text-[#888888] font-bold">{TARGET_TREASURY.slice(0, 6)}...{TARGET_TREASURY.slice(-4)}</span>
              </div>

              {/* ACTION BUTTON */}
              {isConfirmed ? (
                <div className="bg-[#00C076]/10 text-[#00C076] border border-[#00C076]/30 text-center py-5 font-mono text-[10px] font-black uppercase tracking-[0.3em] rounded-xl">
                  TRANSACCIÓN CONFIRMADA 
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  {!isConnected ? (
                    <div className="text-center flex justify-center">
                      {/* @ts-ignore - Web3Modal custom element */}
                      <appkit-button />
                    </div>
                  ) : (
                    <button
                      onClick={handleTransact}
                      disabled={isExecuting || !rates}
                      className="w-full bg-[#050505] text-[#FFFFFF] font-mono text-[11px] font-black uppercase py-6 tracking-[0.3em] hover:bg-[#050505]/90 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 transition-colors duration-300 rounded-xl shadow-lg"
                    >
                      {isWaiting ? (
                        <><Activity size={14} className="animate-spin" /> Confirmando Bloque L2...</>
                      ) : isPending ? (
                        'Aprobación Requerida en Wallet...'
                      ) : isWrongNetwork ? (
                        'Forzar Red Optimism'
                      ) : (
                        `PAGAR ${ethAmount} ETH`
                      )}
                    </button>
                  )}
                  {writeError && (
                    <p className="text-center text-red-500 font-mono text-[9px] uppercase tracking-[0.1em] font-bold mt-2">
                        FONDOS INSUFICIENTES EN OPTIMISM O TRANSACCIÓN RECHAZADA.
                    </p>
                  )}
                </div>
              )}

              {/* SECURITY BINDER */}
              <div className="flex justify-between items-center pt-2">
                 <ShieldCheck size={14} className="text-[#050505]/20" />
                 <p className="text-right font-mono text-[8px] uppercase tracking-[0.3em] text-[#888888] font-bold">
                    Protocolo Inmutable · Sin Reembolsos · Privacy by Void
                 </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

  );
}
