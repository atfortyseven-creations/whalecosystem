"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, CheckCircle, ArrowRight, Lock } from 'lucide-react';
import { useNewsStore } from '@/lib/store/news-store';

interface CryptoCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CryptoCheckoutModal({ isOpen, onClose }: CryptoCheckoutModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const { setNewsSubscribed } = useNewsStore();

  const handlePaymentSimulation = () => {
    setIsProcessing(true);
    
    // Emulación de latencia de red y confirmación EIP-712 / Smart Contract execution (Gateway neutral)
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess(true);
      setNewsSubscribed(true);
      
      // Auto cerramos después del mensaje de éxito
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2500);
    }, 2800); // 2.8s de abstracción
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[200] flex items-center justify-center p-4"
            onClick={!isProcessing ? onClose : undefined}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md border overflow-hidden rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, #FDFAF5 0%, #F7F2EA 100%)',
                borderColor: 'rgba(0,0,0,0.08)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
              }}
            >
              {/* Deco Header */}
              <div className="absolute top-0 inset-x-0 h-1" style={{ background: '#000' }} />
              
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full border flex items-center justify-center bg-black">
                    <Lock size={20} color="#F7F2EA" />
                  </div>
                  <div>
                    <h2 className="font-aztec-serif text-2xl font-black uppercase tracking-tighter leading-none text-black">
                      Whale News
                    </h2>
                    <p className="font-mono text-[10px] uppercase font-bold tracking-widest mt-1 opacity-60 text-black">
                      Suscripción Soberana
                    </p>
                  </div>
                </div>

                {!success ? (
                  <div className="space-y-6">
                    <p className="text-sm font-mono leading-relaxed" style={{ color: 'rgba(0,0,0,0.7)' }}>
                      Estás a punto de desbloquear la lectura completa y el análisis exhaustivo de "Noticias Recientes". Este acceso no recolecta telemetría ni requiere información biométrica.
                    </p>
                    
                    <div className="p-4 rounded-xl border flex justify-between items-center" style={{ background: 'rgba(0,0,0,0.03)', borderColor: 'rgba(0,0,0,0.08)' }}>
                      <span className="font-mono text-xs font-bold uppercase tracking-widest">Suscripción Mensual</span>
                      <span className="font-aztec-serif text-xl font-bold">1,99 USDC</span>
                    </div>

                    <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.02)' }}>
                      <ShieldAlert size={14} style={{ color: 'rgba(0,0,0,0.5)' }} />
                      <span className="text-[10px] uppercase font-mono tracking-wider opacity-60">Pago No-Custodial / Privacidad Garantizada</span>
                    </div>

                    <button
                      onClick={handlePaymentSimulation}
                      disabled={isProcessing}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-mono text-xs font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02]"
                      style={{
                        background: isProcessing ? 'rgba(0,0,0,0.6)' : '#000',
                        color: isProcessing ? 'rgba(255,255,255,0.8)' : '#F7F2EA',
                      }}
                    >
                      {isProcessing ? 'Validando EIP-712...' : 'Suscribirte a Whale News por 1,99 USD/mes'}
                      {!isProcessing && <ArrowRight size={14} />}
                    </button>
                    <button
                      onClick={onClose}
                      disabled={isProcessing}
                      className="w-full py-2 font-mono text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-8 text-center"
                  >
                    <CheckCircle size={64} style={{ color: '#000' }} className="mb-4" />
                    <h3 className="font-aztec-serif text-2xl font-black mb-2">ACCESO CONCEDIDO</h3>
                    <p className="font-mono text-xs uppercase tracking-widest opacity-60">
                      Suscripción desbloqueada matemáticamente
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
