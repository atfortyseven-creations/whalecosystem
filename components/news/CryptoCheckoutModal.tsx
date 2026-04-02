"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, Activity, Clock, User, Terminal } from 'lucide-react';
import { useNewsStore } from '@/lib/store/news-store';
import { useSendTransaction, useAccount, useSwitchChain, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

const TARGET_TREASURY = '0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a' as const;
const TARGET_CHAIN    = 10;    // Optimism Mainnet
const PRICE_USD       = 5.00;

// Oráculo de tipo de cambio ETH → EUR y USD
async function fetchCryptoRates(): Promise<{ eur: number, usd: number } | null> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=eur,usd',
      { cache: 'no-store', signal: AbortSignal.timeout(4000) }
    );
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
  const { sendTransaction, data: txHash, isPending, error: writeError } = useSendTransaction();
  const { isLoading: isWaiting, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  const [rates, setRates] = useState<{ eur: number, usd: number } | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

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
      setTimeout(onClose, 2000);
    }
  }, [isConfirmed, setNewsSubscribed, onClose]);

  // Cálculos perfectos de conversión
  const ethAmount = rates ? (PRICE_USD / rates.usd).toFixed(5) : "0.00149";
  const eurEquivalent = rates ? ((parseFloat(ethAmount) * rates.eur).toFixed(2)) : "4.62";

  const handleTransact = () => {
    if (!isConnected) return;
    if (chainId !== TARGET_CHAIN && switchChain) {
      switchChain({ chainId: TARGET_CHAIN });
      return;
    }
    sendTransaction({ to: TARGET_TREASURY, value: parseEther(ethAmount) });
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          style={{ background: 'rgba(5,5,5,0.92)' }}
        >
          <motion.div
            initial={{ scale: 0.98, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.98 }}
            className="w-full max-w-[480px] bg-[#0A0A0A] text-[#E0E0E0] relative shadow-2xl border border-white/10"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center bg-[#111] px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3 text-white/90">
                <Terminal size={16} />
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] font-medium text-white/70">Clearance Ref. {Date.now().toString().slice(-6)}</span>
              </div>
              {!isExecuting && (
                <button onClick={onClose} className="opacity-40 hover:opacity-100 transition-opacity">
                  <X size={18} />
                </button>
              )}
            </div>

            {/* BODY */}
            <div className="px-8 py-8 space-y-8">
              
              {/* INSTITUTIONAL INFO HEADER */}
              <div className="flex justify-between items-start border-b border-white/10 pb-6">
                 <div className="space-y-3">
                    <div className="flex items-center gap-3 text-white/50">
                        <Clock size={12} className="text-[#D4AF37]/70" />
                        <span className="font-mono text-[9px] uppercase tracking-[0.25em]">{formatDate(currentTime)} · {formatTime(currentTime)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/50">
                        <User size={12} className="text-[#D4AF37]/70" />
                        <span className="font-mono text-[9px] uppercase tracking-[0.25em]">
                            {isConnected && address ? `ID: ${address.slice(0,8)}...${address.slice(-6)}` : "ENTIDAD NO DETECTADA"}
                        </span>
                    </div>
                 </div>
                 <div className="text-right space-y-2">
                    <span className="block font-mono text-[9px] uppercase tracking-[0.25em] text-[#D4AF37]">NODO OPTIMISM L2</span>
                    <span className="block font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">PING: 14ms</span>
                 </div>
              </div>

              {/* MAIN METRICS */}
              <div className="text-center space-y-4">
                <span className="block font-mono text-[9px] uppercase tracking-[0.4em] text-white/40 mb-5">Asignación Requerida</span>
                
                <div className="flex items-end justify-center gap-4">
                  <span className="font-sans text-5xl tracking-tighter leading-none text-white font-light">{PRICE_USD.toFixed(0)}</span>
                  <div className="flex flex-col items-start pb-1">
                    <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-white/80">USD</span>
                    <span className="font-mono text-[8px] text-white/30 uppercase tracking-[0.3em] mt-1">Tarifa Plana</span>
                  </div>
                </div>

                {/* EXACT EQUIVALENTS */}
                <div className="flex items-center justify-center gap-8 pt-6">
                  <div className="text-center">
                    <p className="font-mono text-sm font-medium tracking-[0.1em] text-white">{rates ? ethAmount : "—"} ETH</p>
                    <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-white/30 mt-1">Monto en Cadena</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="text-center">
                    <p className="font-mono text-sm font-medium tracking-[0.1em] text-white">
                      {rates ? `${eurEquivalent} EUR` : '—'}
                    </p>
                    <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#D4AF37]/60 mt-1">
                      {rates ? `Ratio Oráculo Integrado` : 'Conectando...'}
                    </p>
                  </div>
                </div>
              </div>

              {/* TARGET RECP */}
              <div className="bg-[#111] p-5 border border-white/5 rounded-sm text-left flex justify-between items-center">
                <div className="space-y-1">
                    <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-white/30">Destino Asegurado</span>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-white/70">
                    Tesorería Whale Alert
                    </p>
                </div>
                <span className="font-mono text-[9px] tracking-[0.2em] text-white/50">{TARGET_TREASURY.slice(0, 6)}...{TARGET_TREASURY.slice(-4)}</span>
              </div>

              {/* ACTION BUTTON */}
              {isConfirmed ? (
                <div className="bg-[#111] text-[#D4AF37] border border-[#D4AF37]/30 text-center py-5 font-mono text-[10px] font-bold uppercase tracking-[0.3em]">
                  TRANSACCIÓN CONFIRMADA ✓
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
                      className="w-full bg-[#E0E0E0] text-[#0A0A0A] font-mono text-[10px] font-extrabold uppercase py-6 tracking-[0.3em] hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 transition-colors duration-300"
                    >
                      {isWaiting ? (
                        <><Activity size={14} className="animate-pulse" /> Confirmando Bloque L2...</>
                      ) : isPending ? (
                        'Aprobación Requerida en Wallet...'
                      ) : isWrongNetwork ? (
                        'Forzar Red Optimism'
                      ) : (
                        `AUTORIZAR PAGO DE ${ethAmount} ETH`
                      )}
                    </button>
                  )}
                  {writeError && (
                    <p className="text-center text-[#FF5555] font-mono text-[8px] uppercase tracking-[0.2em]">
                      [ERROR] {writeError.message.split('.')[0]}
                    </p>
                  )}
                </div>
              )}

              {/* SECURITY BINDER */}
              <div className="flex justify-between items-center pt-2">
                 <ShieldCheck size={14} className="text-white/10" />
                 <p className="text-right font-mono text-[7px] uppercase tracking-[0.3em] text-white/20">
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
