"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Fingerprint, Lock, ArrowRight, CheckCircle, Wallet, Activity, Key, Database, Cpu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useUIStore } from '@/lib/store/ui-store';
import { Wallet as EthersWallet } from 'ethers';

export default function SignUpPage() {
    const router = useRouter();
    const { setLinked } = useUIStore();

    const [step, setStep] = useState(0);
    const [status, setStatus] = useState<"idle" | "generating" | "encrypting" | "complete">("idle");
    const [alias, setAlias] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Cryptographic state
    const [progress, setProgress] = useState(0);
    const [generatedAddress, setGeneratedAddress] = useState<string>('');
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].slice(0, -1)}] ${msg}`]);
    };

    const handleCreateVault = async () => {
        if (!alias) {
            toast.error('Required field', { description: 'Please enter a display name.' });
            return;
        }
        if (password.length < 8) {
            toast.error('Weak password', { description: 'Password must be at least 8 characters long.' });
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Mismatch', { description: 'Passwords do not match.' });
            return;
        }

        try {
            setStep(1);
            setStatus("generating");
            setLogs([]);
            
            addLog("Initializing Native Vault Generation...");
            addLog("Allocating entropy buffer (BIP39)...");
            
            // Allow UI to render the logs before blocking the thread
            await new Promise(r => setTimeout(r, 500));

            addLog("Computing secp256k1 keypair...");
            
            // Generate a true, random HD wallet
            const wallet = EthersWallet.createRandom();
            setGeneratedAddress(wallet.address);
            
            addLog(`Address Derived: ${wallet.address}`);
            addLog("Binding Identity Alias...");
            
            await new Promise(r => setTimeout(r, 800));

            setStatus("encrypting");
            addLog("Initiating Scrypt Key Derivation Function...");
            addLog("Encrypting private key to Keystore JSON...");

            // Encrypt the wallet with the user's password.
            // This is a computationally heavy operation that takes several seconds.
            const keystoreJson = await wallet.encrypt(password, (p: number) => {
                const percent = Math.round(p * 100);
                setProgress(percent);
                if (percent % 10 === 0) {
                    addLog(`Encryption Progress: ${percent}% (Scrypt N=131072, r=8, p=1)`);
                }
            });

            addLog("Encryption Complete. Ciphertext locked.");
            
            setStatus("complete");
            
            // 1. Save the encrypted keystore locally
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('system_vault_v1', keystoreJson);
                // Also simulate the standard system session so UI works seamlessly
                const norm = wallet.address.toLowerCase();
                localStorage.setItem('system_session_v2', JSON.stringify({ 
                    exp: Date.now() + 86400000 * 30,
                    address: norm,
                    wallet: wallet.address,
                    alias: alias
                }));
            }

            // 2. Set the handshake cookie so all middleware APIs recognize the user
            const norm = wallet.address.toLowerCase();
            document.cookie = \`system_handshake=\${norm}; path=/; max-age=31536000; SameSite=Lax\`;

            // 3. Update Zustand global state
            setLinked(true);

            addLog("Identity Provisioned. Access Granted.");
            setStep(2);
            
            toast.success("Vault Created", { description: "Your local wallet is ready." });
            
            // 4. Redirect seamlessly to the dashboard/portfolio
            setTimeout(() => {
                window.location.replace('/dashboard');
            }, 2000);

        } catch (error: any) {
            console.error("Vault Creation Failed:", error);
            addLog(`CRITICAL ERROR: ${error.message}`);
            toast.error("Generation Failed", { description: error.message || "Failed to secure local vault." });
            setTimeout(() => { setStep(0); setStatus("idle"); setProgress(0); }, 3000);
        }
    };

    return (
        <div className="min-h-[100dvh] w-full bg-[#050505] text-white flex flex-col font-mono relative overflow-hidden selection:bg-white/20">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-white/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-white/5 rounded-full blur-[80px]" />
            </div>

            <div className="absolute top-0 left-0 p-6 z-20 flex items-center gap-3">
                <Wallet size={20} className="text-white/60" />
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Humanity Ledger</span>
                    <span className="text-[8px] font-medium tracking-[0.4em] text-white/30">NATIVE VAULT GENERATION</span>
                </div>
            </div>

            <main className="flex-1 flex items-center justify-center relative z-10 px-6 pt-24 pb-12">
                <div className="w-full max-w-md mx-auto">
                    
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div 
                                key="step0"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex flex-col gap-8"
                            >
                                <div className="text-center mb-4">
                                    <h1 className="text-3xl font-light tracking-tighter mb-2">Initialize Native Vault</h1>
                                    <p className="text-[11px] text-white/40 uppercase tracking-[0.2em] leading-relaxed max-w-xs mx-auto">
                                        Generate an isolated, non-custodial cryptographic identity directly on your device.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2 relative">
                                        <label className="text-[9px] uppercase tracking-[0.2em] text-white/50 font-bold ml-1">Identity Alias</label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                value={alias}
                                                onChange={e => setAlias(e.target.value)}
                                                placeholder="e.g. Satoshi"
                                                className="w-full bg-white/5 border border-white/10 rounded-none p-4 text-sm outline-none focus:border-white/40 focus:bg-white/10 transition-all text-white placeholder:text-white/20"
                                            />
                                            <Fingerprint size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" />
                                        </div>
                                    </div>

                                    <div className="space-y-2 relative">
                                        <label className="text-[9px] uppercase tracking-[0.2em] text-white/50 font-bold ml-1">Encryption Password</label>
                                        <div className="relative">
                                            <input 
                                                type="password" 
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                placeholder="Minimum 8 characters"
                                                className="w-full bg-white/5 border border-white/10 rounded-none p-4 text-sm outline-none focus:border-white/40 focus:bg-white/10 transition-all text-white placeholder:text-white/20"
                                            />
                                            <Key size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" />
                                        </div>
                                    </div>

                                    <div className="space-y-2 relative">
                                        <label className="text-[9px] uppercase tracking-[0.2em] text-white/50 font-bold ml-1">Confirm Password</label>
                                        <div className="relative">
                                            <input 
                                                type="password" 
                                                value={confirmPassword}
                                                onChange={e => setConfirmPassword(e.target.value)}
                                                placeholder="Confirm encryption key"
                                                className="w-full bg-white/5 border border-white/10 rounded-none p-4 text-sm outline-none focus:border-white/40 focus:bg-white/10 transition-all text-white placeholder:text-white/20"
                                            />
                                            <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-white/5 border border-white/10 flex items-start gap-4 mt-2">
                                    <Shield size={16} className="text-white/40 mt-1 shrink-0" />
                                    <p className="text-[10px] text-white/40 leading-loose">
                                        Your private keys are generated via BIP39 locally and encrypted using the Scrypt Key Derivation Function. They never leave your device.
                                    </p>
                                </div>

                                <button 
                                    onClick={handleCreateVault}
                                    className="w-full py-5 font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all mt-4 bg-white text-black hover:bg-white/90 active:scale-[0.98]"
                                >
                                    Generate Keystore <ArrowRight size={14} />
                                </button>
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="flex flex-col items-center justify-center py-8 w-full max-w-lg mx-auto"
                            >
                                <div className="w-20 h-20 mb-8 relative flex items-center justify-center">
                                    <div className="absolute inset-0 border border-white/10 border-t-white rounded-full animate-spin" />
                                    <div className="absolute inset-2 border border-[#00C076]/20 border-b-[#00C076] rounded-full animate-spin-slow" />
                                    <Cpu size={24} className={status === 'encrypting' ? 'text-[#00C076] animate-pulse' : 'text-white/80'} />
                                </div>

                                <h2 className="text-sm font-black tracking-widest uppercase mb-6 text-center text-white/90">
                                    {status === 'generating' ? 'Deriving Cryptographic Identity' : 'Encrypting Local Vault'}
                                </h2>
                                
                                <div className="w-full bg-black/50 border border-white/10 p-4 rounded-none font-mono text-[9px] md:text-[10px] text-white/60 leading-loose h-64 overflow-y-auto flex flex-col gap-1 text-left">
                                    {logs.map((log, i) => (
                                        <div key={i} className="animate-in fade-in slide-in-from-bottom-1">{log}</div>
                                    ))}
                                    {status === "encrypting" && (
                                        <div className="text-[#00C076] animate-pulse mt-2">► PERFORMING HEAVY COMPUTATION... PLEASE WAIT</div>
                                    )}
                                </div>

                                <div className="w-full bg-white/5 h-[2px] mt-8 overflow-hidden relative">
                                    <motion.div 
                                        className="absolute top-0 left-0 h-full bg-[#00C076]"
                                        initial={{ width: "0%" }}
                                        animate={{ width: \`\${progress}%\` }}
                                        transition={{ duration: 0.2 }}
                                    />
                                </div>
                                <div className="text-[10px] text-white/40 mt-2 tracking-widest">
                                    {progress}%
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div 
                                key="step2"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center text-center py-12"
                            >
                                <div className="w-24 h-24 mb-8 rounded-full bg-[#00C076]/10 flex items-center justify-center text-[#00C076] border border-[#00C076]/30">
                                    <Database size={40} />
                                </div>
                                <h2 className="text-2xl font-light tracking-widest uppercase mb-2 text-[#00C076]">Vault Secured</h2>
                                <p className="text-[10px] text-white/50 font-mono mb-8 tracking-widest">
                                    {generatedAddress}
                                </p>
                                <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] leading-relaxed max-w-sm">
                                    Your native connection is established. Redirecting to your institutional portfolio...
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </main>
        </div>
    );
}
