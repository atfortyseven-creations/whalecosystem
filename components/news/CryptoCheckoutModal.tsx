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

// ----------------------------------------------------------------------------
// ESTRUCTURA DE PAGO ETH: OPTIMISM NETWORK (CHAIN_ID: 10)
// TARGET BILLETERA: 0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a
// MONTO: 0.015 ETH (~ $49.00 USD)
// ----------------------------------------------------------------------------

export function CryptoCheckoutModal({ isOpen, onClose }: CheckoutProps) {
  const { setNewsSubscribed } = useNewsStore();
  const { address, isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { sendTransaction, data: rawTxHash, isPending, error: writeError } = useSendTransaction();
  
  // Validamos que el ticket se ha integrado en la blockchain
  const { isLoading: isWaitingReceipt, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: rawTxHash,
  });

  const TARGET_TREASURY = '0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a';
  const TARGET_CHAIN = 10; // Optimism Mainnet
  const AMOUNT_ETH = '0.015'; // Aprox. $49 USD

  useEffect(() => {
    // Escudo de confirmación termodinámica
    if (isConfirmed) {
      setNewsSubscribed(true);
      setTimeout(() => onClose(), 1500);
    }
  }, [isConfirmed, setNewsSubscribed, onClose]);

  const handleTransact = async () => {
    if (!isConnected) return; // Wagmi o Web3Modal debe interceptarlo antes
    if (chainId !== TARGET_CHAIN && switchChain) {
      // Forzar migración a Optimism
      switchChain({ chainId: TARGET_CHAIN });
      return; 
    }
    
    // Emitir pago
    try {
      sendTransaction({
        to: TARGET_TREASURY,
        value: parseEther(AMOUNT_ETH),
      });
    } catch (e) {
      console.error("Transacción abortada");
    }
  };

  const isWrongNetwork = isConnected && chainId !== TARGET_CHAIN;
  const isExecuting = isPending || isWaitingReceipt;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/95 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-lg bg-white border border-black shadow-2xl relative"
          >
            {/* Cabezal Cero-Rounding */}
            <div className="flex justify-between items-center bg-black text-white p-6 border-b border-black">
              <div className="flex items-center gap-3">
                <ShieldCheck size={24} />
                <h3 className="font-sans font-black uppercase text-xl tracking-tighter">Acceso Institucional V1</h3>
              </div>
              {!isExecuting && (
                <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">
                  <X size={24} />
                </button>
              )}
            </div>

            <div className="p-8 pb-10 space-y-8 text-black">
              <div className="text-center space-y-4">
                <p className="font-mono text-sm tracking-widest uppercase opacity-80 border-b border-black/10 pb-4">
                  Desbloqueo Termodinámico
                </p>
                <div className="flex flex-col items-center pt-2">
                  <span className="font-sans text-6xl font-black tracking-tighter">49.00</span>
                  <span className="font-mono text-xs uppercase tracking-widest opacity-60">USD / Equivalente Mensual</span>
                </div>
                <p className="font-mono text-[10px] leading-relaxed max-w-sm mx-auto opacity-70 border bg-black/5 p-3">
                  Esta orden transferirá {AMOUNT_ETH} ETH directamente hacia la tesorería de Whale Alert ({TARGET_TREASURY.slice(0,6)}...{TARGET_TREASURY.slice(-4)}) operando en la red Optimism.
                </p>
              </div>

              {isConfirmed ? (
                 <div className="text-center py-6 font-mono text-sm uppercase font-bold tracking-widest bg-black text-white p-4">
                    PAGO COMPROBADO <br/> ACCESO FORENSE DESBLOQUEADO
                 </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {!isConnected ? (
                    <appkit-button /> // Web3Modal Genérico o ConnectWallet
                  ) : (
                    <button
                      onClick={handleTransact}
                      disabled={isExecuting}
                      className="w-full bg-black text-white font-mono text-sm uppercase py-5 font-black tracking-widest hover:bg-black/90 disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                      {isWaitingReceipt ? (
                         <><Activity size={16} className="animate-pulse" /> COMPILANDO BLOQUE 100%...</>
                      ) : isPending ? (
                         "FIRMA VUESTRA TRANSACCIÓN"
                      ) : isWrongNetwork ? (
                         "CAMBIAR A RED OPTIMISM"
                      ) : (
                         `ABONAR ${AMOUNT_ETH} ETH Y ACCEDER`
                      )}
                    </button>
                  )}
                  {writeError && (
                    <p className="text-center text-red-600 font-mono text-[9px] uppercase tracking-widest">
                       FRACTURA DE TRANSACCIÓN: {writeError.message.split('.')[0]}
                    </p>
                  )}
                </div>
              )}
              
              <p className="text-center font-mono text-[9px] uppercase tracking-[0.2em] opacity-30 px-6">
                Todos los datos transaccionales son verificados on-chain de forma inmutable a través de viem & wagmi shield. PII: Cero.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
