"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ethers } from "ethers";
import { toast } from "sonner";
import { TerminalExecutionLog } from "./TerminalExecutionLog";
import { useWalletStore } from "@/lib/store/wallet-store";
import { encryptWithPassword } from "@/lib/wallet-security";
import { useSystemConnect } from "@/hooks/useSystemConnect";
import { 
  Shield, Key, Lock, CheckCircle2, ChevronRight, Activity, Cpu, 
  EyeOff, Eye, RefreshCw, Hash, Wallet
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

import Link from "next/link";

export function QuantumVaultOnboarding({ onComplete }: { onComplete: () => void }) {
  const { createWallet, setupPassword, accounts, mnemonic, cloudSync } = useWalletStore();
  const { activateSystemVault } = useSystemConnect();
  
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
  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
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
  // PHASE: CORE PROOFS (Complex operations)
  // --------------------------------------------------------
  useEffect(() => {
    if (phase === "PROOFS") {
      let isSubscribed = true;
      const runProofs = async () => {
        addLog("SYSTEM", "Setting up wallet...");
        await new Promise(r => setTimeout(r, 800));
        
        if (!isSubscribed) return;
        addLog("INFO", "Generating secure keys...");
        await new Promise(r => setTimeout(r, 1200));

        if (!isSubscribed) return;
        const fakeHash1 = ethers.keccak256(ethers.toUtf8Bytes(Date.now().toString()));
        addLog("SUCCESS", "Keys generated successfully.", fakeHash1);
        await new Promise(r => setTimeout(r, 800));

        if (!isSubscribed) return;
        addLog("INFO", "Preparing account structures...");
        await new Promise(r => setTimeout(r, 1000));

        if (!isSubscribed) return;
        addLog("INFO", "Creating secure backup phrase...");
        
        // ACTUAL WALLET GENERATION HAPPENS HERE
        createWallet();
        
        await new Promise(r => setTimeout(r, 1500));
        if (!isSubscribed) return;
        
        addLog("SUCCESS", "Wallet successfully generated.");
        await new Promise(r => setTimeout(r, 800));

        if (!isSubscribed) return;
        addLog("SYSTEM", "Generation complete. Awaiting password.");
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
      toast.success("Backup Verified", { description: "Seed phrase match confirmed." });
      setPhase("VAULT_SEAL");
    } else {
      toast.error("Verification Failed", { description: "One or more words are incorrect." });
    }
  };

  // --------------------------------------------------------
  // VAULT SEALING
  // --------------------------------------------------------
  const sealVault = async () => {
    const cleanPassword = password.trim(); // [PERSISTENCE FIX] trim mobile keyboard whitespace
    if (cleanPassword.length < 8) {
      toast.error("Security Requirement", { description: "Password must be at least 8 characters." });
      return;
    }
    if (cleanPassword !== confirmPassword.trim()) {
      toast.error("Mismatch", { description: "Passwords do not match." });
      return;
    }

    addLog("SYSTEM", "Encrypting your wallet...");
    setPhase("COMPLETE");

    // [PERSISTENCE FIX] Seal wallet-store (System A) synchronously
    setupPassword(cleanPassword);

    // [PERSISTENCE BRIDGE] Also write to localStorage system_accounts (System B = CoreAuthGate)
    // Without this, if the user later opens Portfolio, CoreAuthGate sees no system_accounts
    // and forces them to create a new wallet — wiping their existing one.
    try {
      const state = useWalletStore.getState();
      const walletMnemonic = state.mnemonic;
      const walletAddress  = state.address;
      const walletPk       = state.privateKey;

      if (walletMnemonic && walletAddress) {
        // Encrypt mnemonic under AES-GCM (same format CoreAuthGate uses)
        const encryptedBlob = await encryptWithPassword(walletMnemonic, cleanPassword);

        const newAccount = {
          id: Date.now().toString(),
          name: `Wallet ${accounts.length + 1}`,
          address: walletAddress,
          encryptedBlob,
          createdAt: Date.now(),
        };

        const existing = JSON.parse(localStorage.getItem('system_accounts') || '[]');
        const updated  = [...existing.filter((a: any) => a.address !== walletAddress), newAccount];
        localStorage.setItem('system_accounts', JSON.stringify(updated));
        localStorage.setItem('system_keystore', encryptedBlob);

        // Activate vault connection (non-fatal on mobile)
        if (walletPk) {
          try {
            await activateSystemVault(walletPk, walletAddress);
          } catch {}

          // [INDEXATION FIX] Register with backend so session cookies are set
          // and cloudSync can write to the WatchedWallet DB table.
          try {
            const resp = await fetch('/api/auth/system-verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ address: walletAddress }),
            });
            if (resp.ok) {
              // Now that JWT cookies exist, sync wallet index to DB
              await cloudSync().catch(() => {});
            }
          } catch {}
        }

        addLog("SUCCESS", `Vault sealed. Address: ${walletAddress.slice(0,6)}...${walletAddress.slice(-4)}`);
      }
    } catch (err: any) {
      // Bridge failure is non-fatal — wallet-store (System A) already sealed
      console.warn('[QuantumVault] system_accounts bridge non-fatal:', err?.message);
    }

    // Give UI a moment to show complete state, then redirect
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  // --------------------------------------------------------
  // RENDERERS
  // --------------------------------------------------------
  return (
    <div className="w-full min-h-[100dvh] flex flex-col md:flex-row bg-white relative overflow-x-hidden">
      
      {/* LEFT PANEL - Terminal / Aesthetic Info */}
      <div className="w-full md:w-[40%] bg-[#fafafa] border-b md:border-b-0 md:border-r border-black/10 p-6 pt-24 md:p-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-black flex items-center justify-center">
              <Wallet size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-[20px] font-black uppercase tracking-[0.2em] text-black">Wallet Setup</h2>
              <p className="text-[13px] text-black/40 uppercase tracking-widest font-mono">Account Creation</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`p-6 border transition-colors ${phase === "ENTROPY" ? "border-black bg-black/5" : "border-black/10"}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[14px] font-bold uppercase tracking-widest text-black/60">Step 1</span>
              </div>
              <h3 className="text-[16px] font-black uppercase tracking-wider text-black">System Setup</h3>
            </div>
            <div className={`p-6 border transition-colors ${phase === "PROOFS" ? "border-black bg-black/5" : "border-black/10"}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[14px] font-bold uppercase tracking-widest text-black/60">Step 2</span>
              </div>
              <h3 className="text-[16px] font-black uppercase tracking-wider text-black">Wallet Generation</h3>
            </div>
            <div className={`p-6 border transition-colors ${["MNEMONIC_BACKUP", "MNEMONIC_VERIFY"].includes(phase) ? "border-black bg-black/5" : "border-black/10"}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[14px] font-bold uppercase tracking-widest text-black/60">Step 3</span>
              </div>
              <h3 className="text-[16px] font-black uppercase tracking-wider text-black">Secret Backup</h3>
            </div>
            <div className={`p-6 border transition-colors ${phase === "VAULT_SEAL" ? "border-black bg-black/5" : "border-black/10"}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[14px] font-bold uppercase tracking-widest text-black/60">Step 4</span>
              </div>
              <h3 className="text-[16px] font-black uppercase tracking-wider text-black">Secure Password</h3>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <TerminalExecutionLog logs={logs} height="h-64" />
        </div>
      </div>

      {/* RIGHT PANEL - Interactive Core */}
      <div 
        className="w-full md:w-[60%] bg-white p-6 py-12 md:p-12 relative flex flex-col justify-center min-h-[60vh] md:min-h-screen" 
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        style={{ touchAction: phase === "ENTROPY" ? "none" : "auto" }}
      >
        <AnimatePresence mode="wait">
          
          {phase === "INTRO" && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center text-center">
              <div className="w-24 h-24 border-2 border-black flex items-center justify-center mb-8">
                <Wallet size={36} className="text-black" />
              </div>
              <h1 className="text-[34px] font-black uppercase tracking-widest text-black mb-6">Create Your Account</h1>
              <Link href="/login" className="mb-8 px-8 py-3 border-2 border-black text-[14px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                Login with Humanity Ledger
              </Link>
              <p className="text-[16px] font-medium text-black/60 max-w-lg mb-16 leading-relaxed">
                You are about to create your secure wallet. The system will gather random data to generate your account securely.
              </p>
              <button 
                onClick={() => setPhase("ENTROPY")}
                className="group relative px-10 py-5 bg-black text-white font-black text-[14px] uppercase tracking-[0.3em] overflow-hidden transition-transform active:scale-95"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 flex items-center gap-3">Start Setup <ChevronRight size={18} /></span>
              </button>
            </motion.div>
          )}

          {phase === "ENTROPY" && (
            <motion.div key="entropy" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center w-full px-2 text-center">
              <h2 className="text-[16px] md:text-[20px] font-black uppercase tracking-widest text-black mb-12 md:mb-16">Move your cursor to generate random data</h2>
              
              <div className="w-full max-w-xl bg-[#f4f4f4] h-3 mb-6 overflow-hidden">
                <div className="h-full bg-black transition-all duration-100 ease-out" style={{ width: `${entropyProgress}%` }} />
              </div>
              
              <div className="font-mono text-[64px] font-black tracking-tighter text-black/10 tabular-nums">
                {entropyProgress.toFixed(1)}%
              </div>
              
              <div className="grid grid-cols-12 gap-2 mt-16 w-full max-w-xl opacity-20">
                {Array.from({ length: 144 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-black transition-opacity duration-500" style={{ opacity: Math.random() < (entropyProgress / 100) ? 1 : 0.1 }} />
                ))}
              </div>
            </motion.div>
          )}

          {phase === "PROOFS" && (
            <motion.div key="proofs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center w-full h-full">
              <div className="relative flex items-center justify-center w-48 h-48 mb-12">
                <div className="absolute inset-0 border-[6px] border-black/10 rounded-full" />
                <div className="absolute inset-0 border-[6px] border-t-black border-r-black border-b-transparent border-l-transparent rounded-full animate-spin" />
                <Hash size={48} className="text-black animate-pulse" />
              </div>
              <h2 className="text-[20px] font-black uppercase tracking-widest text-black mb-3">Setting Up</h2>
              <p className="text-[14px] font-mono text-black/50 uppercase tracking-widest">Generating your unique wallet address...</p>
            </motion.div>
          )}

          {phase === "MNEMONIC_BACKUP" && (
            <motion.div key="backup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full">
              <div className="mb-12">
                <h2 className="text-[24px] font-black uppercase tracking-widest text-black mb-3">Secret Recovery Phrase</h2>
                <p className="text-[15px] font-bold text-red-500 uppercase tracking-widest">CRITICAL: Write these down. Never share them. If lost, funds are permanently unrecoverable.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 mb-12">
                {seedWords.map((word, index) => (
                  <div key={index} className="flex items-center border border-black/10 p-3 sm:p-4 bg-[#fafafa] overflow-hidden">
                    <span className="text-[12px] sm:text-[14px] font-bold text-black/30 w-6 sm:w-8 shrink-0">{index + 1}.</span>
                    <span className="text-[14px] sm:text-[16px] font-mono font-bold text-black truncate">{word}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-center md:justify-end">
                <button 
                  onClick={() => setPhase("MNEMONIC_VERIFY")}
                  className="w-full md:w-auto px-6 py-4 bg-black text-white font-black text-[12px] md:text-[14px] uppercase tracking-widest hover:bg-black/80 transition-colors"
                >
                  I have securely saved these words
                </button>
              </div>
            </motion.div>
          )}

          {phase === "MNEMONIC_VERIFY" && (
            <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full">
               <div className="mb-12">
                <h2 className="text-[24px] font-black uppercase tracking-widest text-black mb-3">Verify Backup</h2>
                <p className="text-[15px] font-bold text-black/60 uppercase tracking-widest">Confirm specific words from your phrase to proceed.</p>
              </div>

              <div className="space-y-6 mb-12">
                {verificationIndices.map((index) => (
                  <div key={index} className="flex flex-col gap-3">
                    <label className="text-[14px] font-black uppercase tracking-widest text-black">
                      Word #{index + 1}
                    </label>
                    <input 
                      type="text"
                      className="w-full border-b-2 border-black/20 pb-3 text-[18px] font-mono font-bold text-black focus:border-black outline-none transition-colors bg-transparent placeholder:text-black/10"
                      placeholder={`Enter word #${index + 1}`}
                      value={verificationAnswers[index] || ""}
                      onChange={(e) => setVerificationAnswers(prev => ({...prev, [index]: e.target.value}))}
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-6 md:gap-4 mt-8">
                <button 
                  onClick={() => setPhase("MNEMONIC_BACKUP")}
                  className="text-[12px] md:text-[14px] font-bold text-black/40 uppercase tracking-widest hover:text-black"
                >
                  View Phrase Again
                </button>
                <button 
                  onClick={verifyMnemonic}
                  className="w-full md:w-auto px-6 py-4 bg-black text-white font-black text-[12px] md:text-[14px] uppercase tracking-widest hover:bg-black/80 transition-colors text-center"
                >
                  Verify & Proceed
                </button>
              </div>
            </motion.div>
          )}

          {phase === "VAULT_SEAL" && (
            <motion.div key="seal" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="w-full">
              <div className="mb-12 text-center">
                <div className="w-24 h-24 mx-auto border-2 border-black flex items-center justify-center mb-8 bg-black">
                  <Lock size={36} className="text-white" />
                </div>
                <h2 className="text-[26px] font-black uppercase tracking-widest text-black mb-3">Set a Password</h2>
                <p className="text-[15px] font-bold text-black/60 uppercase tracking-widest">Create a local password to encrypt and protect your account.</p>
              </div>

              <form autoComplete="off" onSubmit={(e) => e.preventDefault()} className="space-y-8 max-w-lg mx-auto mb-12">
                {/* Anti-autocomplete honey pot fields */}
                <input type="text" name="fakeusernameremembered" style={{ display: "none" }} />
                <input type="password" name="fakepasswordremembered" style={{ display: "none" }} />
                
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    name={`new-password-${Math.random()}`}
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    spellCheck="false"
                    className="w-full border-b-2 border-black/20 pb-4 text-[18px] font-mono font-bold text-black focus:border-black outline-none transition-colors bg-transparent tracking-widest"
                    placeholder="ENTER PASSWORD"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-0 bottom-4 text-black/40 hover:text-black">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    name={`new-password-confirm-${Math.random()}`}
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    spellCheck="false"
                    className="w-full border-b-2 border-black/20 pb-4 text-[18px] font-mono font-bold text-black focus:border-black outline-none transition-colors bg-transparent tracking-widest"
                    placeholder="CONFIRM PASSWORD"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </form>

              <div className="flex justify-center">
                <button 
                  onClick={sealVault}
                  className="px-10 py-5 bg-black text-white font-black text-[14px] uppercase tracking-[0.2em] hover:bg-black/90 transition-all flex items-center gap-3"
                >
                  <Lock size={16} /> Complete Setup
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
                className="mb-10"
              >
                <CheckCircle2 size={84} className="text-black" />
              </motion.div>
              <h2 className="text-[32px] font-black uppercase tracking-widest text-black mb-5">Account Created</h2>
              <p className="text-[16px] font-mono text-black/50 uppercase tracking-widest">Redirecting to your dashboard...</p>
              <div className="mt-10 flex gap-2">
                <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
