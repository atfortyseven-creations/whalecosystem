"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RemoteLottie } from '@/components/ui/RemoteLottie';
import { ShieldCheck, Cpu, Network, Lock, Zap, Server, Globe, Key, CheckCircle } from 'lucide-react';

const PHASES = [
  { id: 1, label: "Bootstrapping P2P Nodes", icon: Network },
  { id: 2, label: "Verifying On-Chain Identity", icon: ShieldCheck },
  { id: 3, label: "Negotiating E2E Encryption Keys", icon: Key },
  { id: 4, label: "Establishing Secure Tunnels", icon: Globe },
  { id: 5, label: "Synchronizing Decentralized Inbox", icon: Server },
  { id: 6, label: "Resolving ENS Protocols", icon: Cpu },
  { id: 7, label: "Loading Encrypted Storage", icon: Lock },
  { id: 8, label: "Finalizing Zero-Knowledge Proofs", icon: Zap },
  { id: 9, label: "Connection Established", icon: CheckCircle },
];

export default function WhaleChatInitPhase({ onComplete }: { onComplete: () => void }) {
  const [currentPhase, setCurrentPhase] = useState(0);

  useEffect(() => {
    let isMounted = true;
    
    const runPhases = async () => {
      for (let i = 0; i < PHASES.length; i++) {
        // Complex variable timing to simulate heavy on-chain cryptographic operations
        const delay = 600 + Math.random() * 800;
        await new Promise(r => setTimeout(r, delay));
        if (!isMounted) return;
        setCurrentPhase(i);
      }
      
      // Final delay before transitioning to chat
      await new Promise(r => setTimeout(r, 1200));
      if (isMounted) onComplete();
    };

    runPhases();

    return () => { isMounted = false; };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
      className="fixed inset-0 z-[250] flex flex-col items-center justify-center bg-white"
    >
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <div className="relative z-10 w-full max-w-[500px] px-6 flex flex-col items-center">
        {/* Core Animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="w-48 h-48 mb-10 relative"
        >
          <RemoteLottie path="/system-shots/block abstract.json" loop={true} className="w-full h-full object-contain mix-blend-multiply opacity-90" />
        </motion.div>

        {/* Phase Container */}
        <div className="w-full bg-[#FAFAFA] border border-black/10 p-6 rounded-[24px] shadow-sm flex flex-col gap-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
             <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-[#050505]/40">
               Network Initialization
             </span>
             <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-[#050505]">
               {Math.round(((currentPhase + 1) / PHASES.length) * 100)}%
             </span>
          </div>

          <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {PHASES.map((phase, idx) => {
                const isActive = idx === currentPhase;
                const isPast = idx < currentPhase;
                
                // Only show current phase and the immediate next/previous ones for a cleaner look
                if (idx > currentPhase + 1 || idx < currentPhase - 2) return null;

                const Icon = phase.icon;

                return (
                  <motion.div
                    key={phase.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: isActive ? 1 : isPast ? 0.4 : 0.2, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center gap-4"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                      isActive ? 'bg-[#050505] border-[#050505] text-white' :
                      isPast ? 'bg-transparent border-[#050505] text-[#050505]' :
                      'bg-transparent border-black/10 text-black/20'
                    }`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-[13px] font-bold tracking-wide transition-colors ${
                        isActive ? 'text-[#050505]' : 
                        isPast ? 'text-[#050505]/50' : 
                        'text-[#050505]/20'
                      }`}>
                        {phase.label}
                      </p>
                    </div>
                    {isActive && (
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full bg-[#050505]"
                      />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-1 bg-black/5 rounded-full overflow-hidden mt-4">
            <motion.div 
               className="h-full bg-[#050505]"
               initial={{ width: "0%" }}
               animate={{ width: `${((currentPhase + 1) / PHASES.length) * 100}%` }}
               transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        
        <p className="mt-8 text-[11px] font-mono text-[#050505]/30 uppercase tracking-[0.2em] text-center max-w-[280px]">
          Establishing maximum complexity zero-knowledge tunnel
        </p>
      </div>
    </motion.div>
  );
}
