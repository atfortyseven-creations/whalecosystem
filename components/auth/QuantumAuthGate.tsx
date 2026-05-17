"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import { Shield, Key, Eye, EyeOff, Check, ArrowRight, Loader2, Lock, AlertTriangle, ChevronLeft, ChevronRight, Copy, Wallet, Activity } from 'lucide-react';
import { useWalletStore } from '@/lib/store/wallet-store';
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { RemoteLottie } from '@/components/ui/RemoteLottie';

export function QuantumAuthGate({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<'home' | 'login' | 'password' | 'secure' | 'reveal' | 'verify' | 'encrypting'>('home');
  const [hasKeystore, setHasKeystore] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [wallet, setWallet] = useState<ethers.HDNodeWallet | null>(null);
  const [revealed, setRevealed] = useState(false);
  
  // Verification state
  const [verifyIndices, setVerifyIndices] = useState<number[]>([]);
  const [verifyInputs, setVerifyInputs] = useState<string[]>(['', '', '']);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [clickedMint, setClickedMint] = useState(false);
  
  const { open } = useAppKit();
  const { isConnected } = useAccount();
  const { importWallet } = useWalletStore();

  useEffect(() => {
    if (clickedMint && isConnected) {
      onComplete();
    }
  }, [clickedMint, isConnected, onComplete]);

  useEffect(() => {
    const ks = localStorage.getItem('sovereign_keystore');
    if (ks) {
      setHasKeystore(true);
    }
  }, []);

  const handleCreatePassword = () => {
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!termsAccepted) {
      toast.error('You must accept the terms');
      return;
    }
    const newWallet = ethers.Wallet.createRandom();
    setWallet(newWallet);
    
    // Pick 3 random words to verify
    const indices: number[] = [];
    while(indices.length < 3) {
      const r = Math.floor(Math.random() * 12);
      if(!indices.includes(r)) indices.push(r);
    }
    setVerifyIndices(indices.sort((a,b) => a - b));
    setStep('secure');
  };

  const handleVerify = async () => {
    if (!wallet || !wallet.mnemonic) return;
    const words = wallet.mnemonic.phrase.split(' ');
    
    for (let i = 0; i < 3; i++) {
      if (verifyInputs[i].trim().toLowerCase() !== words[verifyIndices[i]].toLowerCase()) {
        toast.error(`Word #${verifyIndices[i] + 1} is incorrect.`);
        return;
      }
    }

    setStep('encrypting');
    
    const startTime = Date.now();
    
    setTimeout(async () => {
      try {
        const encryptedJson = await ethers.encryptKeystoreJson({
          address: wallet.address,
          privateKey: wallet.privateKey
        }, password, { scrypt: { N: 1024 } });
        localStorage.setItem('sovereign_keystore', encryptedJson);
        importWallet(wallet.privateKey, "Sovereign Main");
        
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(8000 - elapsedTime, 0);

        setTimeout(() => {
          toast.success('Wallet created and secured successfully.');
          onComplete();
        }, remainingTime);
      } catch (e: any) {
        toast.error('Encryption failed', { description: e.message });
        setStep('verify');
      }
    }, 500);
  };

  const handleLogin = async () => {
    const ks = localStorage.getItem('sovereign_keystore');
    if (!ks) return;
    setStep('encrypting');
    
    const startTime = Date.now();
    
    setTimeout(async () => {
      try {
        const decryptedWallet = await ethers.Wallet.fromEncryptedJson(ks, password);
        importWallet(decryptedWallet.privateKey, "Sovereign Main");
        
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(8000 - elapsedTime, 0);

        setTimeout(() => {
          toast.success('Decryption successful.');
          onComplete();
        }, remainingTime);
      } catch (e) {
        toast.error('Invalid password', { description: 'Please try again.' });
        setStep('login');
      }
    }, 100);
  };

  const renderContent = () => {
    switch (step) {
      case 'home':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4 mb-10">
              <div className="w-16 h-16 bg-[#FAFAF8] border border-black/5 shadow-sm rounded-[20px] mx-auto flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-transparent" />
                <Wallet size={24} className="text-[#0A0A0A] relative z-10" strokeWidth={1.5} />
              </div>
              <h1 className="text-3xl font-black text-[#0A0A0A] tracking-tighter uppercase font-sans">Portfolio</h1>
              <p className="text-[13px] text-[#0A0A0A]/50 font-medium leading-relaxed px-4 max-w-xs mx-auto">
                Connect your wallet or create a secure local vault to track your holdings.
              </p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => setStep('password')}
                className="group w-full flex items-center justify-between p-5 rounded-[22px] bg-[#050505] text-white hover:bg-[#111] transition-all shadow-[0_8px_30px_rgba(0,0,0,0.12)] active:scale-[0.98] border border-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform">
                    <Shield size={18} className="text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-[14px] font-black uppercase tracking-widest">Create Vault</div>
                    <div className="text-[11px] text-white/50 font-medium mt-0.5 tracking-wide">Generate a 12-word recovery phrase</div>
                  </div>
                </div>
                <ArrowRight size={18} className="text-white/40 group-hover:text-white transition-colors group-hover:translate-x-1" />
              </button>

              {hasKeystore && (
                <button 
                  onClick={() => setStep('login')}
                  className="group w-full flex items-center justify-between p-5 rounded-[22px] bg-white border border-black/10 hover:border-black/20 transition-all shadow-sm active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-[#FAFAF8] flex items-center justify-center border border-black/5 group-hover:scale-105 transition-transform">
                      <Lock size={18} className="text-[#050505]" />
                    </div>
                    <div className="text-left">
                      <div className="text-[14px] font-black uppercase tracking-widest text-[#050505]">Unlock Vault</div>
                      <div className="text-[11px] text-[#050505]/50 font-medium mt-0.5 tracking-wide">Enter your password to unlock</div>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-[#050505]/40 group-hover:text-[#050505] transition-colors group-hover:translate-x-1" />
                </button>
              )}

              <button 
                onClick={() => { setClickedMint(true); open(); }}
                className="group w-full flex items-center justify-between p-5 rounded-[22px] bg-transparent border border-transparent hover:bg-black/5 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-black/5 flex items-center justify-center border border-black/5 group-hover:scale-105 transition-transform">
                    <Key size={18} className="text-[#050505]" />
                  </div>
                  <div className="text-left">
                    <div className="text-[14px] font-black uppercase tracking-widest text-[#050505]">Mint Ticket Pass</div>
                    <div className="text-[11px] text-[#050505]/50 font-medium mt-0.5 tracking-wide">0.5 ETH · Unlimited Access</div>
                  </div>
                </div>
                <ArrowRight size={18} className="text-[#050505]/20 group-hover:text-[#050505] transition-colors group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        );

      case 'login':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4 mb-10">
              <div className="w-16 h-16 bg-[#FAFAF8] border border-black/5 shadow-sm rounded-[20px] mx-auto flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-transparent" />
                <Lock size={24} className="text-[#0A0A0A] relative z-10" strokeWidth={1.5} />
              </div>
              <h1 className="text-3xl font-black text-[#0A0A0A] tracking-tighter uppercase font-sans">Unlock Vault</h1>
              <p className="text-[13px] text-[#0A0A0A]/50 font-medium leading-relaxed px-4">
                Enter your password to decrypt your session.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="Enter Password"
                  className="w-full bg-[#FAFAF8] border border-black/10 shadow-inner rounded-[18px] px-5 py-5 text-[#0A0A0A] text-[15px] font-bold focus:outline-none focus:border-[#0A0A0A] focus:bg-white transition-all placeholder:font-medium placeholder:text-black/30"
                  autoFocus
                />
              </div>
              <button 
                onClick={handleLogin}
                disabled={!password}
                className="w-full py-5 rounded-[18px] bg-[#050505] hover:bg-[#111] disabled:opacity-50 transition-all text-white font-black tracking-widest text-[12px] uppercase shadow-lg active:scale-[0.98]"
              >
                Decrypt & Enter
              </button>
            </div>
            
            {showResetConfirm ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 space-y-4 bg-red-50/50 p-5 rounded-[22px] border border-red-100">
                <div className="flex items-center gap-3 text-red-600 mb-2">
                   <AlertTriangle size={18} />
                   <p className="text-[12px] font-black uppercase tracking-widest">Danger Zone</p>
                </div>
                <p className="text-left text-[11px] font-medium text-red-600/80 leading-relaxed">
                  This will permanently delete your vault from this device. If you don't have your recovery phrase, your assets will be lost forever.
                </p>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-3 rounded-xl border border-black/10 bg-white text-[#050505] text-[11px] font-black uppercase tracking-widest hover:bg-black/5 transition-all">Cancel</button>
                  <button onClick={() => { localStorage.removeItem('sovereign_keystore'); setStep('home'); setShowResetConfirm(false); }} className="flex-1 py-3 rounded-xl bg-red-500 text-white text-[11px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-md">Purge</button>
                </div>
              </motion.div>
            ) : (
              <button onClick={() => setShowResetConfirm(true)} className="w-full text-center text-[11px] font-black uppercase tracking-widest text-[#050505]/40 hover:text-[#050505] transition-colors pt-6">
                Forgot password? Reset vault
              </button>
            )}
          </div>
        );

      case 'password':
        return (
          <div className="space-y-6">
            <button onClick={() => setStep('home')} className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black/40 hover:text-[#0A0A0A] hover:bg-black/10 transition-colors mb-2"><ChevronLeft size={20}/></button>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-[#0A0A0A] tracking-tighter uppercase font-sans">Vault Setup</h2>
              <p className="text-[13px] text-[#0A0A0A]/50 font-medium leading-relaxed">
                This password will encrypt your Secret Recovery Phrase securely on this device.
              </p>
            </div>

            <div className="space-y-5 pt-4">
              <div className="space-y-2">
                <input 
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="New Password (8+ chars)"
                  className="w-full bg-[#FAFAF8] border border-black/10 shadow-inner rounded-[18px] px-5 py-5 text-[#0A0A0A] font-bold focus:outline-none focus:border-[#0A0A0A] focus:bg-white transition-all placeholder:font-medium placeholder:text-black/30"
                />
              </div>
              <div className="space-y-2">
                <input 
                  type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full bg-[#FAFAF8] border border-black/10 shadow-inner rounded-[18px] px-5 py-5 text-[#0A0A0A] font-bold focus:outline-none focus:border-[#0A0A0A] focus:bg-white transition-all placeholder:font-medium placeholder:text-black/30"
                />
              </div>
              
              <label className="flex items-start gap-4 p-5 border border-black/5 bg-[#FAFAF8] rounded-[20px] cursor-pointer hover:border-black/10 transition-colors mt-6 group">
                <div className="pt-0.5">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${termsAccepted ? 'bg-[#050505] border-[#050505]' : 'bg-white border-black/20 group-hover:border-black/40'}`}>
                    {termsAccepted && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                  <input 
                    type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)}
                    className="sr-only"
                  />
                </div>
                <span className="text-[12px] text-[#050505]/60 font-medium leading-relaxed">
                  I understand that Whale Alert cannot recover this password for me. If I lose it, I will need my Secret Recovery Phrase to access my vault.
                </span>
              </label>

              <button 
                onClick={handleCreatePassword}
                disabled={!termsAccepted || password.length < 8 || password !== confirmPassword}
                className="w-full py-5 mt-2 rounded-[18px] bg-[#050505] text-white font-black tracking-widest text-[12px] uppercase disabled:opacity-40 disabled:scale-100 transition-all shadow-lg active:scale-[0.98]"
              >
                Create Vault
              </button>
            </div>
          </div>
        );

      case 'secure':
        return (
          <div className="space-y-6">
            <button onClick={() => setStep('password')} className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black/40 hover:text-[#0A0A0A] hover:bg-black/10 transition-colors mb-2"><ChevronLeft size={20}/></button>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-[#0A0A0A] tracking-tighter uppercase font-sans">Secure Vault</h2>
              <p className="text-[13px] text-[#0A0A0A]/50 font-medium leading-relaxed">
                Protect your master key. This phrase is the ultimate access to your assets.
              </p>
            </div>

            <div className="bg-[#FAFAF8] border border-black/5 rounded-[24px] p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                  <Shield size={18} className="text-[#050505]" />
                </div>
                <span className="font-black uppercase tracking-widest text-[13px] text-[#050505]">Security Rules</span>
              </div>
              <ul className="space-y-3 text-[12px] text-[#050505]/60 font-medium">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span>Never share this phrase with anyone.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#050505]/40 mt-1.5 shrink-0" />
                  <span>Never store it digitally (e.g., screenshots, notes).</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#050505]/40 mt-1.5 shrink-0" />
                  <span>Write it down on paper and store it securely.</span>
                </li>
              </ul>
            </div>

            <button 
              onClick={() => setStep('reveal')}
              className="w-full py-5 rounded-[18px] bg-[#050505] text-white font-black tracking-widest text-[12px] uppercase transition-all shadow-lg active:scale-[0.98]"
            >
              Reveal Master Key
            </button>
          </div>
        );

      case 'reveal':
        return (
          <div className="space-y-6">
            <button onClick={() => setStep('secure')} className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black/40 hover:text-[#0A0A0A] hover:bg-black/10 transition-colors mb-2"><ChevronLeft size={20}/></button>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-[#0A0A0A] tracking-tighter uppercase font-sans">Master Key</h2>
              <p className="text-[13px] text-[#0A0A0A]/50 font-medium leading-relaxed">
                Write down these 12 words in the exact order shown.
              </p>
            </div>

            <div className="relative border border-black/5 rounded-[24px] p-6 bg-[#FAFAF8] min-h-[260px] flex items-center justify-center overflow-hidden">
              {!revealed ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xl">
                  <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mb-5">
                    <EyeOff size={24} className="text-[#050505]" />
                  </div>
                  <p className="text-[13px] text-[#050505] font-black uppercase tracking-widest mb-1">Tap to Reveal Key</p>
                  <p className="text-[11px] text-[#050505]/50 font-medium mb-6">Ensure no one is watching your screen.</p>
                  <button 
                    onClick={() => setRevealed(true)}
                    className="px-8 py-3.5 rounded-[14px] bg-[#050505] text-white transition-all font-black text-[10px] uppercase tracking-widest active:scale-[0.96] shadow-md"
                  >
                    Show Words
                  </button>
                </div>
              ) : null}
              
              <div className={`grid grid-cols-3 gap-2 w-full transition-all duration-700 ${revealed ? 'opacity-100 scale-100 filter-none' : 'opacity-0 scale-95 blur-md select-none pointer-events-none'}`}>
                {wallet?.mnemonic?.phrase.split(' ').map((word, i) => (
                  <div key={i} className="flex flex-col bg-white border border-black/5 rounded-xl overflow-hidden shadow-sm">
                    <div className="w-full py-1 bg-black/[0.03] text-[9px] text-[#050505]/40 font-black tracking-widest text-center border-b border-black/5">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1 py-3 text-[13px] text-[#050505] font-bold tracking-wide text-center">
                      {word}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
              <button onClick={() => { navigator.clipboard.writeText(wallet?.mnemonic?.phrase || ''); toast.success('Key copied to clipboard'); }} className="text-[#050505]/40 hover:text-[#050505] text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors">
                <Copy size={13} /> Copy to clipboard
              </button>
              <button 
                onClick={() => setStep('verify')}
                disabled={!revealed}
                className="w-full sm:w-auto px-10 py-4 rounded-[16px] bg-[#050505] text-white font-black tracking-widest text-[11px] uppercase disabled:opacity-40 transition-all shadow-md active:scale-[0.98]"
              >
                Proceed
              </button>
            </div>
          </div>
        );

      case 'verify':
        return (
          <div className="space-y-6">
            <button onClick={() => setStep('reveal')} className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black/40 hover:text-[#0A0A0A] hover:bg-black/10 transition-colors mb-2"><ChevronLeft size={20}/></button>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-[#0A0A0A] tracking-tighter uppercase font-sans">Verify Key</h2>
              <p className="text-[13px] text-[#0A0A0A]/50 font-medium leading-relaxed">
                Confirm your backup by entering the requested words below.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {verifyIndices.map((wordIndex, i) => (
                <div key={wordIndex} className="space-y-2 relative">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-[#050505]/20 pointer-events-none">
                    Word {String(wordIndex + 1).padStart(2, '0')}
                  </div>
                  <input
                    type="text"
                    value={verifyInputs[i]}
                    onChange={(e) => {
                      const newInputs = [...verifyInputs];
                      newInputs[i] = e.target.value.toLowerCase().trim();
                      setVerifyInputs(newInputs);
                    }}
                    className="w-full bg-[#FAFAF8] border border-black/5 shadow-inner rounded-[18px] pl-5 pr-20 py-4 text-[#0A0A0A] font-bold focus:outline-none focus:border-[#0A0A0A] focus:bg-white transition-all placeholder:font-medium placeholder:text-black/30"
                    placeholder="Enter word..."
                  />
                </div>
              ))}
            </div>

            <button 
              onClick={handleVerify}
              disabled={verifyInputs.some(v => v.length < 2)}
              className="w-full py-5 mt-6 rounded-[18px] bg-[#050505] text-white font-black tracking-widest text-[12px] uppercase disabled:opacity-40 transition-all shadow-lg active:scale-[0.98]"
            >
              Verify & Encrypt
            </button>
          </div>
        );

      case 'encrypting': {
        const isDecrypting = typeof window !== 'undefined' && !!localStorage.getItem('sovereign_keystore');
        return (
          <div className="flex flex-col items-center justify-center py-20 space-y-10 relative">
            <div className="relative w-64 h-64 flex items-center justify-center -mt-8">
               <RemoteLottie path="Whale Mission.json" className="w-full h-full object-contain opacity-100" />
            </div>
            <div className="text-center space-y-3">
              <h2 className="text-[22px] font-black text-[#0A0A0A] tracking-tighter uppercase">
                {isDecrypting ? 'Decrypting Vault...' : 'Encrypting Vault...'}
              </h2>
              <p className="text-[13px] text-[#0A0A0A]/50 font-medium">
                {isDecrypting ? 'Restoring private keys locally.' : 'Applying high-entropy local encryption.'}
              </p>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="flex items-center justify-center px-4 md:px-6 h-full w-full relative overflow-y-auto py-12 md:py-0">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
         <RemoteLottie path="Whale Mission.json" className="w-full h-full object-cover" />
      </div>
      <motion.div 
        key={step}
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -10 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] bg-white/80 backdrop-blur-[40px] rounded-[32px] border border-black/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.06)] p-6 sm:p-10 relative z-10 will-change-transform"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
