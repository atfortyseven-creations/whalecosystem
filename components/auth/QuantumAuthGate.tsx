"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import { Shield, Key, Eye, EyeOff, Check, ArrowRight, Loader2, Lock, AlertTriangle, ChevronLeft, ChevronRight, Copy, Wallet, Activity } from 'lucide-react';
import { useWalletStore } from '@/lib/store/wallet-store';
import { useAppKit } from '@reown/appkit/react';
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
  
  const { open } = useAppKit();
  const { importWallet } = useWalletStore();

  useEffect(() => {
    const ks = localStorage.getItem('sovereign_keystore');
    if (ks) {
      setHasKeystore(true);
      // We no longer automatically go to 'login' here.
      // We let the user choose on the 'home' screen.
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
    
    // Allow UI to update before blocking thread
    setTimeout(async () => {
      try {
        // Optimized scrypt parameters for zero-latency mobile & browser thread security.
        const encryptedJson = await ethers.encryptKeystoreJson({
          address: wallet.address,
          privateKey: wallet.privateKey
        }, password, { scrypt: { N: 1024 } });
        localStorage.setItem('sovereign_keystore', encryptedJson);
        importWallet(wallet.privateKey, "Sovereign Main");
        toast.success('Wallet created and secured successfully.');
        onComplete();
      } catch (e: any) {
        toast.error('Encryption failed', { description: e.message });
        setStep('verify');
      }
    }, 500); // give UI more time to show "Encrypting..."
  };

  const handleLogin = async () => {
    const ks = localStorage.getItem('sovereign_keystore');
    if (!ks) return;
    setStep('encrypting');
    
    setTimeout(async () => {
      try {
        const decryptedWallet = await ethers.Wallet.fromEncryptedJson(ks, password);
        importWallet(decryptedWallet.privateKey, "Sovereign Main");
        toast.success('Decryption successful.');
        onComplete();
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
          <div className="space-y-6">
            <div className="text-center space-y-4 mb-8">
              <div className="w-16 h-16 bg-white border border-black/5 shadow-sm rounded-3xl mx-auto flex items-center justify-center">
                <Wallet size={24} className="text-[#0A0A0A]" strokeWidth={1.5} />
              </div>
              <h1 className="text-3xl font-black text-[#0A0A0A] tracking-tighter uppercase">Portfolio</h1>
              <p className="text-[15px] text-slate-500 font-serif leading-relaxed px-4">
                Connect your wallet or create a new one to track your holdings.
              </p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => setStep('password')}
                className="w-full flex items-center justify-between p-5 rounded-2xl bg-[#0A0A0A] text-white hover:bg-black/80 transition-colors shadow-lg font-bold"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Shield size={18} className="text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-[15px]">Create a new wallet</div>
                    <div className="text-[12px] opacity-70 font-normal">Generate a 12-word recovery phrase</div>
                  </div>
                </div>
                <ArrowRight size={18} />
              </button>

              {hasKeystore && (
                <button 
                  onClick={() => setStep('login')}
                  className="w-full flex items-center justify-between p-5 rounded-2xl bg-[#0044CC] text-white hover:bg-blue-700 transition-colors shadow-lg font-bold"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <Lock size={18} className="text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-[15px]">Unlock Existing Wallet</div>
                      <div className="text-[12px] opacity-70 font-normal">Enter your password to unlock</div>
                    </div>
                  </div>
                  <ArrowRight size={18} />
                </button>
              )}

              <button 
                onClick={() => open()}
                className="w-full flex items-center justify-between p-5 rounded-2xl bg-white border border-black/10 hover:bg-black/5 transition-colors text-[#0A0A0A] font-bold"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                    <Key size={18} className="text-[#0A0A0A]" />
                  </div>
                  <div className="text-left">
                    <div className="text-[15px]">Connect Wallet</div>
                    <div className="text-[12px] text-slate-500 font-normal">Metamask, Coinbase, WalletConnect</div>
                  </div>
                </div>
                <ArrowRight size={18} className="text-slate-400" />
              </button>
            </div>
          </div>
        );

      case 'login':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4 mb-8">
              <div className="w-16 h-16 bg-white border border-black/5 shadow-sm rounded-3xl mx-auto flex items-center justify-center">
                <Lock size={24} className="text-[#0A0A0A]" strokeWidth={1.5} />
              </div>
              <h1 className="text-3xl font-black text-[#0A0A0A] tracking-tighter uppercase">Log In</h1>
              <p className="text-[15px] text-slate-500 font-serif leading-relaxed px-4">
                Enter your password to unlock your wallet.
              </p>
            </div>
            
            <div className="space-y-4">
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="Password"
                className="w-full bg-white border border-black/10 shadow-sm rounded-xl px-4 py-4 text-[#0A0A0A] text-[15px] focus:outline-none focus:border-[#0A0A0A] transition-colors"
                autoFocus
              />
              <button 
                onClick={handleLogin}
                disabled={!password}
                className="w-full py-4 rounded-xl bg-[#0A0A0A] hover:bg-black/80 disabled:opacity-50 transition-colors text-white font-black tracking-widest text-[12px] uppercase shadow-md"
              >
                Log In
              </button>
            </div>
            
            {showResetConfirm ? (
              <div className="pt-6 space-y-3">
                <p className="text-center text-[12px] font-bold text-red-600 px-4">
                  WARNING: This will permanently delete your wallet from this device. Are you absolutely sure?
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-3 rounded-xl border border-black/10 text-slate-600 text-[12px] font-bold hover:bg-black/5 transition-colors">Cancel</button>
                  <button onClick={() => { localStorage.removeItem('sovereign_keystore'); setStep('home'); setShowResetConfirm(false); }} className="flex-1 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[12px] font-bold hover:bg-red-100 transition-colors">Yes, Delete It</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowResetConfirm(true)} className="w-full text-center text-[12px] font-bold text-slate-500 hover:text-[#0A0A0A] transition-colors pt-4">
                Forgot password? Reset wallet
              </button>
            )}
          </div>
        );

      case 'password':
        return (
          <div className="space-y-6">
            <button onClick={() => setStep('home')} className="text-slate-400 hover:text-[#0A0A0A] transition-colors mb-2"><ChevronLeft size={24}/></button>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-[#0A0A0A] tracking-tighter uppercase">Create Password</h2>
              <p className="text-[15px] text-slate-500 font-serif leading-relaxed">
                This password will secure your Secret Recovery Phrase on this device.
              </p>
            </div>

            <div className="space-y-5 pt-2">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">New Password (8+ chars)</label>
                <input 
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white border border-black/10 shadow-sm rounded-xl px-4 py-4 text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Confirm Password</label>
                <input 
                  type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-white border border-black/10 shadow-sm rounded-xl px-4 py-4 text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] transition-colors"
                />
              </div>
              
              <label className="flex items-start gap-3 p-5 border border-black/5 bg-black/[0.02] rounded-xl cursor-pointer hover:bg-black/5 transition-colors mt-6">
                <div className="pt-0.5">
                  <input 
                    type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 accent-[#0A0A0A]"
                  />
                </div>
                <span className="text-[13px] text-slate-600 leading-relaxed font-serif">
                  I understand that this password cannot be recovered for me. If I lose my password and my Secret Recovery Phrase, my assets will be lost forever.
                </span>
              </label>

              <button 
                onClick={handleCreatePassword}
                disabled={!termsAccepted || password.length < 8 || password !== confirmPassword}
                className="w-full py-4 mt-2 rounded-xl bg-[#0A0A0A] text-white font-black tracking-widest text-[12px] uppercase disabled:opacity-30 disabled:bg-slate-200 disabled:text-slate-500 transition-colors shadow-md"
              >
                Create a new wallet
              </button>
            </div>
          </div>
        );

      case 'secure':
        return (
          <div className="space-y-6">
            <button onClick={() => setStep('password')} className="text-slate-400 hover:text-[#0A0A0A] transition-colors mb-2"><ChevronLeft size={24}/></button>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-[#0A0A0A] tracking-tighter uppercase">Secure your wallet</h2>
              <p className="text-[15px] text-slate-500 font-serif leading-relaxed">
                Learn about your Secret Recovery Phrase and how to keep your wallet safe.
              </p>
            </div>

            <div className="bg-white border border-black/10 shadow-sm rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 text-[#0044CC]">
                <Shield size={20} />
                <span className="font-bold text-sm">Manual Security</span>
              </div>
              <p className="text-[14px] text-slate-600 leading-relaxed">
                Write down your Secret Recovery Phrase on a piece of paper and store it in a safe place. 
                <br/><br/>
                <span className="font-bold text-[#0A0A0A]">Important rules:</span>
                <br/>
                • Never share it with anyone<br/>
                • Never store it online<br/>
                • We will never ask for it
              </p>
            </div>

            <button 
              onClick={() => setStep('reveal')}
              className="w-full py-4 rounded-xl bg-[#0A0A0A] text-white font-black tracking-widest text-[12px] uppercase transition-colors shadow-md"
            >
              Start
            </button>
          </div>
        );

      case 'reveal':
        return (
          <div className="space-y-6">
            <button onClick={() => setStep('secure')} className="text-slate-400 hover:text-[#0A0A0A] transition-colors mb-2"><ChevronLeft size={24}/></button>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-[#0A0A0A] tracking-tighter uppercase">Recovery Phrase</h2>
              <p className="text-[15px] text-slate-500 font-serif leading-relaxed">
                This is the only way you will be able to recover your account. Please write it down somewhere safe.
              </p>
            </div>

            <div className="relative border border-black/10 shadow-inner rounded-2xl p-6 bg-black/[0.02] min-h-[240px] flex items-center justify-center">
              {!revealed ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md rounded-2xl p-6 text-center border border-black/5">
                  <EyeOff size={32} className="text-slate-400 mb-4" />
                  <p className="text-[15px] text-[#0A0A0A] font-bold mb-2">Tap to reveal your Secret Recovery Phrase</p>
                  <p className="text-[13px] text-slate-500 font-serif">Make sure nobody is looking at your screen.</p>
                  <button 
                    onClick={() => setRevealed(true)}
                    className="mt-6 px-8 py-3 rounded-full bg-white border border-black/10 shadow-sm hover:bg-black/5 transition-colors font-black text-[11px] uppercase tracking-widest text-[#0A0A0A]"
                  >
                    Reveal Phrase
                  </button>
                </div>
              ) : null}
              
              <div className={`grid grid-cols-3 gap-3 w-full transition-opacity duration-500 ${revealed ? 'opacity-100' : 'opacity-0 select-none'}`}>
                {wallet?.mnemonic?.phrase.split(' ').map((word, i) => (
                  <div key={i} className="flex bg-white border border-black/10 shadow-sm rounded-xl overflow-hidden">
                    <div className="w-8 flex items-center justify-center bg-black/[0.02] text-[11px] text-slate-400 font-bold border-r border-black/5">
                      {i + 1}
                    </div>
                    <div className="flex-1 px-3 py-2 text-[14px] text-[#0A0A0A] font-bold tracking-wide text-center">
                      {word}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button onClick={() => { navigator.clipboard.writeText(wallet?.mnemonic?.phrase || ''); toast.success('Copied to clipboard'); }} className="text-[#0044CC] text-[13px] font-bold flex items-center gap-2 hover:text-blue-800 transition-colors">
                <Copy size={14} /> Copy to clipboard
              </button>
              <button 
                onClick={() => setStep('verify')}
                disabled={!revealed}
                className="px-10 py-3.5 rounded-xl bg-[#0A0A0A] text-white font-black tracking-widest text-[12px] uppercase disabled:opacity-30 disabled:bg-slate-200 transition-colors shadow-md"
              >
                Next
              </button>
            </div>
          </div>
        );

      case 'verify':
        return (
          <div className="space-y-6">
            <button onClick={() => setStep('reveal')} className="text-slate-400 hover:text-[#0A0A0A] transition-colors mb-2"><ChevronLeft size={24}/></button>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-[#0A0A0A] tracking-tighter uppercase">Confirm Phrase</h2>
              <p className="text-[15px] text-slate-500 font-serif leading-relaxed">
                Please confirm the specific words from your secret recovery phrase below.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {verifyIndices.map((wordIndex, i) => (
                <div key={wordIndex} className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Word #{wordIndex + 1}</label>
                  <input
                    type="text"
                    value={verifyInputs[i]}
                    onChange={(e) => {
                      const newInputs = [...verifyInputs];
                      newInputs[i] = e.target.value.toLowerCase().trim();
                      setVerifyInputs(newInputs);
                    }}
                    className="w-full bg-white border border-black/10 shadow-sm rounded-xl px-4 py-3.5 text-[#0A0A0A] font-bold focus:outline-none focus:border-[#0A0A0A] transition-colors"
                    placeholder="Enter word..."
                  />
                </div>
              ))}
            </div>

            <button 
              onClick={handleVerify}
              disabled={verifyInputs.some(v => v.length < 2)}
              className="w-full py-4 mt-4 rounded-xl bg-[#0A0A0A] text-white font-black tracking-widest text-[12px] uppercase disabled:opacity-30 disabled:bg-slate-200 disabled:text-slate-500 transition-colors shadow-md"
            >
              Confirm
            </button>
          </div>
        );

      case 'encrypting': {
        const isDecrypting = typeof window !== 'undefined' && !!localStorage.getItem('sovereign_keystore');
        return (
          <div className="flex flex-col items-center justify-center py-24 space-y-8">
            <div className="relative w-32 h-32 flex items-center justify-center">
               <RemoteLottie path="block abstract.json" className="w-full h-full object-contain opacity-80" />
            </div>
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-black text-[#0A0A0A] tracking-tighter uppercase">
                {isDecrypting ? 'Decrypting...' : 'Encrypting...'}
              </h2>
              <p className="text-[15px] text-slate-500 font-serif">
                {isDecrypting ? 'Restoring your private keys locally.' : 'Securing your private keys locally.'}
              </p>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="flex items-center justify-center px-6 min-h-[calc(100vh-80px)] w-full relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
         <RemoteLottie path="Whale Mission.json" className="w-full h-full object-cover" />
      </div>
      <motion.div 
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-md bg-white/60 backdrop-blur-3xl rounded-[2.5rem] border border-black/5 shadow-sm p-8 md:p-10"
      >
        {renderContent()}
      </motion.div>
    </div>
  );
}
