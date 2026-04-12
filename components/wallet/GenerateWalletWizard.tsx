"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Shield, Zap, CheckCircle2, Copy, MoveRight, EyeOff, Lock } from 'lucide-react';
import { ethers } from 'ethers';
import { toast } from 'sonner';

interface GenerateWalletWizardProps {
  onComplete: (privateKey: string, address: string) => void;
  onCancel: () => void;
}

export function GenerateWalletWizard({ onComplete, onCancel }: GenerateWalletWizardProps) {
  const [step, setStep] = useState(1);
  const [wallet, setWallet] = useState<{ address: string, privateKey: string, mnemonic: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saved, setSaved] = useState(false);

  const generateIdentity = async () => {
    setIsGenerating(true);
    // Simulate complex ZK generation for theatrical effect
    await new Promise(r => setTimeout(r, 1200));
    const newWallet = ethers.Wallet.createRandom();
    setWallet({
      address: newWallet.address,
      privateKey: newWallet.privateKey,
      mnemonic: newWallet.mnemonic?.phrase || ""
    });
    setIsGenerating(false);
    setStep(2);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} Copied to Clipboard`, {
        description: 'Keep this absolute secure. Do not share it.'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF9F6]/80 dark:bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg bg-white dark:bg-[#0A0A0A] rounded-[2.5rem] p-8 shadow-2xl border border-black/5 dark:border-white/5 relative overflow-hidden"
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-black/5 dark:bg-white/5">
            <motion.div 
                className="h-full bg-indigo-500"
                initial={{ width: '33%' }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
        </div>

        <button onClick={onCancel} className="absolute top-6 right-6 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col items-center text-center pt-4"
            >
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 text-indigo-500">
                <Shield size={28} />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-3">Sovereign Identity</h2>
              <p className="text-sm text-black/50 dark:text-white/50 mb-8 max-w-[280px] leading-relaxed">
                Generate a fresh, cryptographically secure non-custodial wallet instantly. Mined locally, never leaves your browser.
              </p>
              
              <button
                onClick={generateIdentity}
                disabled={isGenerating}
                className="w-full h-14 bg-black dark:bg-white text-white dark:text-black rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isGenerating ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                        Forging Keys...
                    </>
                ) : (
                    <>
                        <Zap size={16} /> Mint Identity
                    </>
                )}
              </button>
            </motion.div>
          )}

          {step === 2 && wallet && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col pt-4"
            >
              <div className="flex items-center gap-3 mb-6 border-b border-black/5 dark:border-white/5 pb-4">
                 <div className="w-8 h-8 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center">
                    <Key size={14} />
                 </div>
                 <div>
                     <h2 className="text-lg font-black uppercase tracking-tight">Backup Required</h2>
                     <p className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 font-bold">Absolute Ownership Protocol</p>
                 </div>
              </div>

              <div className="space-y-4 mb-8">
                  <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-black/50 dark:text-white/50">Mnemonic Seed</span>
                          <button onClick={() => copyToClipboard(wallet.mnemonic, 'Seed Phrase')} className="text-indigo-500 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest hover:opacity-70"><Copy size={12}/> Copy</button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                          {wallet.mnemonic.split(' ').map((word, i) => (
                              <div key={i} className="bg-white dark:bg-black rounded-md py-2 px-3 flex gap-2 items-center border border-black/5 dark:border-white/5 shadow-sm">
                                  <span className="text-[9px] text-black/30 dark:text-white/30 font-mono">{i+1}</span>
                                  <span className="text-xs font-bold text-black/80 dark:text-white/80">{word}</span>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="p-4 bg-rose-50 dark:bg-rose-500/10 rounded-xl border border-rose-100 dark:border-rose-500/20">
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 flex items-center gap-1"><Lock size={12}/> Private Key</span>
                          <button onClick={() => copyToClipboard(wallet.privateKey, 'Private Key')} className="text-rose-500 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest hover:opacity-70"><Copy size={12}/> Copy</button>
                      </div>
                      <div className="bg-white dark:bg-black rounded-md py-3 px-3 border border-rose-100 dark:border-rose-500/20 break-all shadow-sm font-mono text-[10px] text-black/70 dark:text-white/70 relative group cursor-pointer" onClick={() => copyToClipboard(wallet.privateKey, 'Private Key')}>
                          <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity">
                              <span className="flex items-center gap-2 text-xs font-bold font-sans text-rose-600"><EyeOff size={14}/> Hover to reveal</span>
                          </div>
                          {wallet.privateKey}
                      </div>
                  </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group mb-6 p-4 bg-black/5 dark:bg-white/5 rounded-xl">
                  <div className={`w-5 h-5 rounded border ${saved ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black' : 'border-black/20 dark:border-white/20 bg-white dark:bg-black'} flex items-center justify-center transition-colors`}>
                      {saved && <CheckCircle2 size={14} />}
                  </div>
                  <input type="checkbox" className="hidden" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
                  <span className="text-xs font-bold text-black/70 dark:text-white/70">I have securely backed up my Mnemonic and Private Key.</span>
              </label>

              <button
                onClick={() => setStep(3)}
                disabled={!saved}
                className="w-full h-14 bg-black dark:bg-white text-white dark:text-black rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Proceed to Terminal <MoveRight size={16} />
              </button>
            </motion.div>
          )}

          {step === 3 && wallet && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center pt-8 pb-4"
            >
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Identity Activated</h2>
              <p className="text-xs text-black/50 dark:text-white/50 mb-8 font-mono">
                {wallet.address}
              </p>
              
              <button
                onClick={() => onComplete(wallet.privateKey, wallet.address)}
                className="w-full h-14 bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
              >
                Enter Sovereign State
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
