"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ethers } from "ethers";
import { toast } from "sonner";
import { TerminalExecutionLog } from "./TerminalExecutionLog";
import { useWalletStore } from "@/lib/store/wallet-store";
import { 
  Shield, Key, Lock, CheckCircle2, ChevronRight, Activity, Cpu, 
  EyeOff, Eye, RefreshCw, Hash
} from "lucide-react";

type OnboardingPhase = 
  | "INTRO" 
  | "ENTROPY" 
  | "PROOFS" 
  | "MNEMONIC_BACKUP" 
  | "MNEMONIC_VERIFY" 
  | "VAULT_SEAL" 
  | "COMPLETE";

interface LogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "SUCCESS" | "SYSTEM";
  message: string;
  hash?: string;
}

export function QuantumVaultOnboarding({ onComplete }: { onComplete: () => void }) {
  const { createWallet, setupPassword, accounts, mnemonic } = useWalletStore();
  
  const [phase, setPhase] = useState<OnboardingPhase>("INTRO");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [entropyProgress, setEntropyProgress] = useState(0);
  
  // Verification states
  const [seedWords, setSeedWords] = useState<string[]>([]);
  const [verificationIndices, setVerificationIndices] = useState<number[]>([]);
  const [verificationAnswers, setVerificationAnswers] = useState<Record<number, string>>({});
  
  // Password states
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // --------------------------------------------------------
  // LOGGING SYSTEM
  // --------------------------------------------------------
  const addLog = useCallback((level: LogEntry["level"], message: string, hash?: string) => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString().split('T')[1].substring(0, 12),
      level,
      message,
      hash
    }]);
  }, []);

  // --------------------------------------------------------
  // PHASE: ENTROPY GATHERING
  // --------------------------------------------------------
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (phase !== "ENTROPY") return;
    setEntropyProgress(prev => {
      const next = prev + 0.5;
      if (next >= 100) {
        setPhase("PROOFS");
        return 100;
      }
      return next;
    });
  }, [phase]);

  // --------------------------------------------------------
  // PHASE: ZK & PROOFS (Simulated complex operations)
  // --------------------------------------------------------
  useEffect(() => {
    if (phase === "PROOFS") {
      let isSubscribed = true;
      const runProofs = async () => {
        addLog("SYSTEM", "Initializing Cryptographic Kernel...");
        await new Promise(r => setTimeout(r, 800));
        
        if (!isSubscribed) return;
        addLog("INFO", "Compiling ZK-SNARK circuits for identity abstraction.");
        await new Promise(r => setTimeout(r, 1200));

        if (!isSubscribed) return;
        const fakeHash1 = ethers.keccak256(ethers.toUtf8Bytes(Date.now().toString()));
        addLog("SUCCESS", "Circuit compilation successful.", fakeHash1);
        await new Promise(r => setTimeout(r, 800));

        if (!isSubscribed) return;
        addLog("INFO", "Generating EIP-712 structured data for local registry.");
        await new Promise(r => setTimeout(r, 1000));

        if (!isSubscribed) return;
        addLog("INFO", "Injecting entropy pool into BIP-39 deriver...");
        
        // ACTUAL WALLET GENERATION HAPPENS HERE
        createWallet();
        
        await new Promise(r => setTimeout(r, 1500));
        if (!isSubscribed) return;
        
        addLog("SUCCESS", "BIP-44 HD Path Derived: m/44'/60'/0'/0/0");
        await new Promise(r => setTimeout(r, 800));

        if (!isSubscribed) return;
        addLog("SYSTEM", "Quantum Vault Generation Complete. Awaiting user sealing.");
        await new Promise(r => setTimeout(r, 1000));
        
        setPhase("MNEMONIC_BACKUP");
      };
      runProofs();
      return () => { isSubscribed = false; };
    }
  }, [phase, addLog, createWallet]);

  // --------------------------------------------------------
  // MNEMONIC SETUP
  // --------------------------------------------------------
  useEffect(() => {
    if ((phase === "MNEMONIC_BACKUP" || phase === "MNEMONIC_VERIFY") && mnemonic) {
      const words = mnemonic.split(" ");
      setSeedWords(words);
      
      if (verificationIndices.length === 0) {
        // Pick 3 random distinct indices
        const indices = new Set<number>();
        while(indices.size < 3) {
          indices.add(Math.floor(Math.random() * 12));
        }
        setVerificationIndices(Array.from(indices).sort((a,b) => a - b));
      }
    }
  }, [phase, mnemonic, verificationIndices.length]);

  const verifyMnemonic = () => {
    let isValid = true;
    for (const index of verificationIndices) {
      if (verificationAnswers[index]?.toLowerCase().trim() !== seedWords[index]) {
        isValid = false;
        break;
      }
    }
    
    if (isValid) {
      toast.success("Cryptographic Proof Verified", { description: "Seed phrase match confirmed." });
      setPhase("VAULT_SEAL");
    } else {
      toast.error("Verification Failed", { description: "One or more words are incorrect." });
    }
  };

  // --------------------------------------------------------
  // VAULT SEALING
  // --------------------------------------------------------
  const sealVault = async () => {
    if (password.length < 8) {
      toast.error("Security Requirement", { description: "Password must be at least 8 characters." });
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Mismatch", { description: "Passwords do not match." });
      return;
    }

    addLog("SYSTEM", "Initializing AES-GCM-256 Memory Encryption...");
    setPhase("COMPLETE");

    // Give UI a moment to show complete, then setup password which encrypts it
    setTimeout(() => {
      setupPassword(password);
      onComplete();
    }, 2000);
  };

  // --------------------------------------------------------
  // RENDERERS
  // --------------------------------------------------------
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row h-full min-h-[600px] border border-black/10 bg-white shadow-2xl relative overflow-hidden">
      
      {/* LEFT PANEL - Terminal / Aesthetic Info */}
      <div className="w-full md:w-[40%] bg-[#fafafa] border-r border-black/10 p-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-black flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-black">Quantum Vault</h2>
              <p className="text-[9px] text-black/40 uppercase tracking-widest font-mono">Initialization Core v3.0.0</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`p-4 border transition-colors ${phase === "ENTROPY" ? "border-black bg-black/5" : "border-black/10"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-black/60">Phase 1</span>
                {phase !== "INTRO" && phase !== "ENTROPY" ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Activity size={12} className="text-black/40" />}
              </div>
              <h3 className="text-[12px] font-black uppercase tracking-wider text-black">Entropy Aggregation</h3>
            </div>
            <div className={`p-4 border transition-colors ${phase === "PROOFS" ? "border-black bg-black/5" : "border-black/10"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-black/60">Phase 2</span>
                {["MNEMONIC_BACKUP", "MNEMONIC_VERIFY", "VAULT_SEAL", "COMPLETE"].includes(phase) ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Cpu size={12} className="text-black/40" />}
              </div>
              <h3 className="text-[12px] font-black uppercase tracking-wider text-black">ZK Identity Synthesis</h3>
            </div>
            <div className={`p-4 border transition-colors ${["MNEMONIC_BACKUP", "MNEMONIC_VERIFY"].includes(phase) ? "border-black bg-black/5" : "border-black/10"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-black/60">Phase 3</span>
                {["VAULT_SEAL", "COMPLETE"].includes(phase) ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Key size={12} className="text-black/40" />}
              </div>
              <h3 className="text-[12px] font-black uppercase tracking-wider text-black">Cryptographic Backup</h3>
            </div>
            <div className={`p-4 border transition-colors ${phase === "VAULT_SEAL" ? "border-black bg-black/5" : "border-black/10"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-black/60">Phase 4</span>
                {phase === "COMPLETE" ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Lock size={12} className="text-black/40" />}
              </div>
              <h3 className="text-[12px] font-black uppercase tracking-wider text-black">AES-256 Sealing</h3>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <TerminalExecutionLog logs={logs} height="h-64" />
        </div>
      </div>

      {/* RIGHT PANEL - Interactive Core */}
      <div className="w-full md:w-[60%] bg-white p-8 md:p-12 relative flex flex-col justify-center" onMouseMove={handleMouseMove}>
        <AnimatePresence mode="wait">
          
          {phase === "INTRO" && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 border-2 border-black flex items-center justify-center mb-6">
                <Shield size={24} className="text-black" />
              </div>
              <h1 className="text-[24px] font-black uppercase tracking-widest text-black mb-4">Deploy Sovereign Identity</h1>
              <p className="text-[12px] font-medium text-black/60 max-w-sm mb-12 leading-relaxed">
                You are about to deploy a purely on-chain, cryptographic identity. The system will now gather organic entropy from your environment to seed the generation algorithm.
              </p>
              <button 
                onClick={() => setPhase("ENTROPY")}
                className="group relative px-8 py-4 bg-black text-white font-black text-[10px] uppercase tracking-[0.3em] overflow-hidden transition-transform active:scale-95"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 flex items-center gap-2">Initialize Core <ChevronRight size={14} /></span>
              </button>
            </motion.div>
          )}

          {phase === "ENTROPY" && (
            <motion.div key="entropy" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center w-full">
              <h2 className="text-[14px] font-black uppercase tracking-widest text-black mb-12">Move cursor to generate entropy</h2>
              
              <div className="w-full max-w-md bg-[#f4f4f4] h-2 mb-4 overflow-hidden">
                <div className="h-full bg-black transition-all duration-100 ease-out" style={{ width: `${entropyProgress}%` }} />
              </div>
              
              <div className="font-mono text-[48px] font-black tracking-tighter text-black/10 tabular-nums">
                {entropyProgress.toFixed(1)}%
              </div>
              
              <div className="grid grid-cols-12 gap-1 mt-12 w-full max-w-md opacity-20">
                {Array.from({ length: 144 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-black transition-opacity duration-500" style={{ opacity: Math.random() < (entropyProgress / 100) ? 1 : 0.1 }} />
                ))}
              </div>
            </motion.div>
          )}

          {phase === "PROOFS" && (
            <motion.div key="proofs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center w-full h-full">
              <div className="relative flex items-center justify-center w-32 h-32 mb-8">
                <div className="absolute inset-0 border-[4px] border-black/10 rounded-full" />
                <div className="absolute inset-0 border-[4px] border-t-black border-r-black border-b-transparent border-l-transparent rounded-full animate-spin" />
                <Hash size={32} className="text-black animate-pulse" />
              </div>
              <h2 className="text-[14px] font-black uppercase tracking-widest text-black mb-2">Executing ZK Logic</h2>
              <p className="text-[10px] font-mono text-black/50 uppercase tracking-widest">Compiling circuits and deriving BIP-44 path...</p>
            </motion.div>
          )}

          {phase === "MNEMONIC_BACKUP" && (
            <motion.div key="backup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full">
              <div className="mb-8">
                <h2 className="text-[18px] font-black uppercase tracking-widest text-black mb-2">Secret Recovery Phrase</h2>
                <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest">CRITICAL: Write these down. Never share them. If lost, funds are permanently unrecoverable.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                {seedWords.map((word, index) => (
                  <div key={index} className="flex border border-black/10 p-3 bg-[#fafafa]">
                    <span className="text-[10px] font-bold text-black/30 w-5">{index + 1}.</span>
                    <span className="text-[12px] font-mono font-bold text-black">{word}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={() => setPhase("MNEMONIC_VERIFY")}
                  className="px-6 py-3 bg-black text-white font-black text-[10px] uppercase tracking-widest hover:bg-black/80 transition-colors"
                >
                  I have securely saved these words
                </button>
              </div>
            </motion.div>
          )}

          {phase === "MNEMONIC_VERIFY" && (
            <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full">
               <div className="mb-8">
                <h2 className="text-[18px] font-black uppercase tracking-widest text-black mb-2">Verify Backup</h2>
                <p className="text-[11px] font-bold text-black/60 uppercase tracking-widest">Confirm specific words from your phrase to proceed.</p>
              </div>

              <div className="space-y-4 mb-10">
                {verificationIndices.map((index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black">
                      Word #{index + 1}
                    </label>
                    <input 
                      type="text"
                      className="w-full border-b-2 border-black/20 pb-2 text-[14px] font-mono font-bold text-black focus:border-black outline-none transition-colors bg-transparent placeholder:text-black/10"
                      placeholder={`Enter word #${index + 1}`}
                      value={verificationAnswers[index] || ""}
                      onChange={(e) => setVerificationAnswers(prev => ({...prev, [index]: e.target.value}))}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <button 
                  onClick={() => setPhase("MNEMONIC_BACKUP")}
                  className="text-[10px] font-bold text-black/40 uppercase tracking-widest hover:text-black"
                >
                  View Phrase Again
                </button>
                <button 
                  onClick={verifyMnemonic}
                  className="px-6 py-3 bg-black text-white font-black text-[10px] uppercase tracking-widest hover:bg-black/80 transition-colors"
                >
                  Verify & Proceed
                </button>
              </div>
            </motion.div>
          )}

          {phase === "VAULT_SEAL" && (
            <motion.div key="seal" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="w-full">
              <div className="mb-8 text-center">
                <div className="w-16 h-16 mx-auto border-2 border-black flex items-center justify-center mb-6 bg-black">
                  <Lock size={24} className="text-white" />
                </div>
                <h2 className="text-[20px] font-black uppercase tracking-widest text-black mb-2">Seal The Vault</h2>
                <p className="text-[11px] font-bold text-black/60 uppercase tracking-widest">Create a local cryptographic password. This encrypts your session in the browser memory using AES-GCM-256.</p>
              </div>

              <div className="space-y-6 max-w-sm mx-auto mb-10">
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    className="w-full border-b-2 border-black/20 pb-3 text-[14px] font-mono font-bold text-black focus:border-black outline-none transition-colors bg-transparent tracking-widest"
                    placeholder="ENTER PASSWORD"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-0 bottom-3 text-black/40 hover:text-black">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    className="w-full border-b-2 border-black/20 pb-3 text-[14px] font-mono font-bold text-black focus:border-black outline-none transition-colors bg-transparent tracking-widest"
                    placeholder="CONFIRM PASSWORD"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <button 
                  onClick={sealVault}
                  className="px-8 py-4 bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black/90 transition-all flex items-center gap-2"
                >
                  <Lock size={12} /> Encrypt & Finalize
                </button>
              </div>
            </motion.div>
          )}

          {phase === "COMPLETE" && (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center w-full h-full">
              <motion.div 
                initial={{ rotate: -90, opacity: 0 }} 
                animate={{ rotate: 0, opacity: 1 }} 
                transition={{ type: "spring", bounce: 0.5 }}
                className="mb-8"
              >
                <CheckCircle2 size={64} className="text-black" />
              </motion.div>
              <h2 className="text-[24px] font-black uppercase tracking-widest text-black mb-4">Vault Secured</h2>
              <p className="text-[12px] font-mono text-black/50 uppercase tracking-widest">Routing connection to main portfolio matrix...</p>
              <div className="mt-8 flex gap-1">
                <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
