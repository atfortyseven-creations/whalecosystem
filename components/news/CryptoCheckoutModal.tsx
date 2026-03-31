"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, Activity } from 'lucide-react';
import { useNewsStore } from '@/lib/store/news-store';
import { useSendTransaction, useAccount, useSwitchChain, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

const TARGET_TREASURY = '0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a' as const;
const TARGET_CHAIN    = 10;    // Optimism Mainnet
const AMOUNT_ETH      = '0.015';
const PRICE_USD       = 49.0;

// Tipo de cambio ETH → EUR aproximado (se actualiza en tiempo real desde CoinGecko)
async function fetchEthEur(): Promise<number | null> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=eur',
      { cache: 'no-store', signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.ethereum?.eur ?? null;
  } catch {
    return null;
  }
}

export function CryptoCheckoutModal({ isOpen, onClose }: CheckoutProps) {
  const { setNewsSubscribed } = useNewsStore();
  const { address, isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { sendTransaction, data: txHash, isPending, error: writeError } = useSendTransaction();
  const { isLoading: isWaiting, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  const [ethEurPrice, setEthEurPrice] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) fetchEthEur().then(setEthEurPrice);
  }, [isOpen]);

  useEffect(() => {
    if (isConfirmed) {
      setNewsSubscribed(true);
      setTimeout(onClose, 1500);
    }
  }, [isConfirmed, setNewsSubscribed, onClose]);

  const handleTransact = () => {
    if (!isConnected) return;
    if (chainId !== TARGET_CHAIN && switchChain) {
      switchChain({ chainId: TARGET_CHAIN });
      return;
    }
    sendTransaction({ to: TARGET_TREASURY, value: parseEther(AMOUNT_ETH) });
  };

  const isWrongNetwork = isConnected && chainId !== TARGET_CHAIN;
  const isExecuting    = isPending || isWaiting;

  // Calcular equivalente en EUR
  const eurEquivalent = ethEurPrice
    ? (parseFloat(AMOUNT_ETH) * ethEurPrice).toFixed(2)
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}
        >
          <motion.div
            initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96 }}
            className="w-full max-w-md bg-white text-black relative"
            style={{ border: '3px solid #000' }}
          >
            {/* HEADER */}
            <div className="flex justify-between items-center bg-black text-white px-7 py-5">
              <div className="flex items-center gap-3">
                <ShieldCheck size={22} />
                <span className="font-black text-lg uppercase tracking-tighter">News of today — Acceso Soberano</span>
              </div>
              {!isExecuting && (
                <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">
                  <X size={20} />
                </button>
              )}
            </div>

            {/* BODY */}
            <div className="px-8 py-8 space-y-8">
              {/* Precio principal */}
              <div className="text-center space-y-2">
                <div className="flex items-end justify-center gap-3">
                  <span className="font-black text-7xl tracking-tighter leading-none">49</span>
                  <div className="flex flex-col items-start pb-2">
                    <span className="font-mono text-xs font-bold uppercase tracking-widest">USD / mes</span>
                    <span className="font-mono text-[10px] opacity-50 uppercase tracking-wider">equivalente</span>
                  </div>
                </div>

                {/* Equivalentes ETH + EUR */}
                <div className="flex items-center justify-center gap-6 pt-2">
                  <div className="text-center">
                    <p className="font-mono text-xs font-black tracking-widest">{AMOUNT_ETH} ETH</p>
                    <p className="font-mono text-[8px] uppercase tracking-widest opacity-50">En Optimism</p>
                  </div>
                  <div className="w-px h-8 bg-black/20" />
                  <div className="text-center">
                    <p className="font-mono text-xs font-black tracking-widest">
                      {eurEquivalent ? `≈ ${eurEquivalent} €` : '— EUR'}
                    </p>
                    <p className="font-mono text-[8px] uppercase tracking-widest opacity-50">
                      {ethEurPrice ? `1 ETH = ${ethEurPrice.toLocaleString('es-ES')} €` : 'Calculando...'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info transacción */}
              <div className="bg-black/5 p-4 text-center">
                <p className="font-mono text-[10px] uppercase tracking-widest leading-relaxed opacity-80">
                  Transferencia directa a la tesorería Whale Alert<br />
                  <span className="font-black">{TARGET_TREASURY.slice(0, 6)}...{TARGET_TREASURY.slice(-4)}</span> · Red Optimism
                </p>
              </div>

              {/* Botón de pago */}
              {isConfirmed ? (
                <div className="bg-black text-white text-center py-5 font-mono text-sm font-black uppercase tracking-widest">
                  PAGO CONFIRMADO ON-CHAIN ✓
                </div>
              ) : (
                <div className="space-y-3">
                  {!isConnected ? (
                    <div className="text-center">
                      {/* @ts-ignore - Web3Modal custom element */}
                      <appkit-button />
                    </div>
                  ) : (
                    <button
                      onClick={handleTransact}
                      disabled={isExecuting}
                      className="w-full bg-black text-white font-mono text-sm font-black uppercase py-5 tracking-widest hover:bg-black/80 disabled:opacity-40 flex justify-center items-center gap-3 transition-all"
                    >
                      {isWaiting ? (
                        <><Activity size={16} className="animate-pulse" /> Verificando en Optimism...</>
                      ) : isPending ? (
                        'Firma en tu wallet...'
                      ) : isWrongNetwork ? (
                        'Cambiar a Red Optimism →'
                      ) : (
                        `Pagar ${AMOUNT_ETH} ETH y Acceder`
                      )}
                    </button>
                  )}
                  {writeError && (
                    <p className="text-center text-red-600 font-mono text-[9px] uppercase tracking-widest">
                      Error: {writeError.message.split('.')[0]}
                    </p>
                  )}
                </div>
              )}

              {/* Legal */}
              <p className="text-center font-mono text-[8px] uppercase tracking-widest leading-relaxed opacity-30">
                Pago irreversible on-chain · Sin datos personales · Privacy by Void · Optimism L2
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
