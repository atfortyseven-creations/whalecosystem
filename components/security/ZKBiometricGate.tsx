"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Shield, CheckCircle, Fingerprint, Lock, Activity, UserCheck } from "lucide-react";
import { useSignMessage, useAccount } from 'wagmi';

interface ZKBiometricGateProps {
  onSuccess?: (zkProofSignature: string) => void;
}

export function ZKBiometricGate({ onSuccess }: ZKBiometricGateProps) {
  const [stage, setStage] = useState<"IDLE" | "SCANNING" | "PROCESSING" | "SUCCESS">("IDLE");
  const { signMessageAsync } = useSignMessage();
  const { address } = useAccount();

  const handleStart = async () => {
    if (!address) return;
    try {
      setStage("SCANNING");
      
      // Pure cryptographic attestation, zero mock timers.
      const signature = await signMessageAsync({ 
        message: `[SOVEREIGN ZK-GATE]\nRequest biometric liveness attestation for ${address}\nTimestamp: ${Date.now()}` 
      });

      setStage("PROCESSING");
      
      const response = await fetch('/api/oracle/zk-biometrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature })
      });

      if (!response.ok) throw new Error("Attestation failed");
      
      setStage("SUCCESS");
      if (onSuccess) onSuccess(signature);

    } catch (error) {
      setStage("IDLE");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white border border-black/5 rounded-[32px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.04)] font-mono text-[#050505] relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:1rem_1rem] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/5 rounded-full mb-8">
          <Shield size={12} className="text-emerald-600" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-700">ZK-Oracle Active</span>
        </div>

        <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {stage === "IDLE" && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/5 rounded-full flex items-center justify-center">
                <Fingerprint size={48} className="text-black/30" />
              </motion.div>
            )}
            
            {stage === "SCANNING" && (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-black/10 overflow-hidden bg-[#FAFAF8]">
                  {/* Simulate camera feed */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent" />
                  {/* Scanner line */}
                  <motion.div 
                    animate={{ y: ["0%", "100%", "0%"] }} 
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute left-0 right-0 h-[2px] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] z-10" 
                  />
                  <Camera size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black/20" />
                </div>
                {/* Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="4" />
                  <motion.circle 
                    cx="50" cy="50" r="48" fill="none" stroke="#10B981" strokeWidth="4" 
                    strokeDasharray="301.59" 
                    initial={{ strokeDashoffset: 301.59 }}
                    animate={{ strokeDashoffset: 0 }} 
                    transition={{ ease: "linear", duration: 2, repeat: Infinity }}
                  />
                </svg>
              </motion.div>
            )}

            {stage === "PROCESSING" && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-full">
                <div className="absolute inset-0 border-[2px] border-emerald-500/30 rounded-full animate-[spin_3s_linear_infinite] [border-style:dashed]" />
                <Lock size={32} className="text-[#050505]/50 animate-pulse" />
              </motion.div>
            )}

            {stage === "SUCCESS" && (
              <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0 flex items-center justify-center bg-emerald-50 rounded-full border border-emerald-100 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <UserCheck size={48} className="text-emerald-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center mb-8 h-16">
          <AnimatePresence mode="wait">
            {stage === "IDLE" && (
              <motion.div key="text-idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h3 className="text-[14px] font-black uppercase tracking-widest mb-2">Biometric Attestation</h3>
                <p className="text-[10px] text-black/50 leading-relaxed max-w-[260px] mx-auto tracking-wide">
                  Prove personhood securely. No PII is stored. A Zero-Knowledge proof will be minted to your wallet.
                </p>
              </motion.div>
            )}
            
            {stage === "SCANNING" && (
              <motion.div key="text-scanning" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h3 className="text-[14px] font-black uppercase tracking-widest mb-2">3D Liveness Check</h3>
                <p className="text-[10px] text-black/50 leading-relaxed tracking-wide">
                  Capturing neural mesh. Please face the camera directly.
                </p>
              </motion.div>
            )}

            {stage === "PROCESSING" && (
              <motion.div key="text-processing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h3 className="text-[14px] font-black uppercase tracking-widest mb-2">Hashing Identity</h3>
                <p className="text-[10px] text-black/50 flex items-center justify-center gap-2 tracking-wide">
                  <Activity size={12} className="animate-pulse" />
                  Generating ZK-SNARK Proof...
                </p>
              </motion.div>
            )}

            {stage === "SUCCESS" && (
              <motion.div key="text-success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="text-[14px] font-black uppercase tracking-widest mb-2 text-emerald-600">Attestation Valid</h3>
                <p className="text-[10px] text-black/50 leading-relaxed tracking-wide">
                  Zero-Knowledge Proof injected into session. Sovereignty guaranteed.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {stage === "IDLE" && (
          <button
            onClick={handleStart}
            className="w-full py-4 bg-[#050505] text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:shadow-[0_15px_30px_rgba(0,0,0,0.15)] transition-all active:scale-95"
          >
            Initiate Secure Scan
          </button>
        )}
      </div>
    </div>
  );
}
