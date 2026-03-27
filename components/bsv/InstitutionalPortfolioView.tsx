"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowUpRight, ArrowDownLeft, Scan, Plus, Copy, Check,
    Eye, EyeOff, RefreshCw, X, Shield, Zap,
    Globe, Cpu, QrCode as QrIcon,
    AlertTriangle, Key, Lock, Unlock, Send, Trash
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { useWalletStore } from '@/lib/store/wallet-store';

// ─────────────────────────────────────────────────────────────────
//  UTILITY: truncate address for display
// ─────────────────────────────────────────────────────────────────
const truncate = (s: string, n = 8) => s ? `${s.slice(0, n)}...${s.slice(-6)}` : '—';

type View = 'HOME' | 'SEND' | 'RECEIVE' | 'SCAN' | 'CREATE';

export function InstitutionalPortfolioView() {
    const { address, balance, updateBalance } = useWalletStore();
    const [view, setView] = useState<View>('HOME');
    const [prefilledAddress, setPrefilledAddress] = useState('');
    const [pulse, setPulse] = useState(false);
    const [loading, setLoading] = useState(false);

    // Live balance refresh
    const refreshBalance = useCallback(async () => {
        if (!address) return;
        setLoading(true);
        try {
            await updateBalance();
            setPulse(p => !p);
        } finally { setLoading(false); }
    }, [address, updateBalance]);

    useEffect(() => {
        refreshBalance();
        const t = setInterval(refreshBalance, 15000);
        return () => clearInterval(t);
    }, [refreshBalance]);

    const balanceFiat = `$${(parseFloat(balance || "0") * 3100).toFixed(2)}`;

    return (
        <div className="flex flex-col relative text-white selection:bg-white/10">
            {/* Soft decorative backdrops */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

            <AnimatePresence mode="wait">
                {view === 'HOME' && (
                    <HomeView key="home"
                        address={address}
                        balance={balance}
                        balanceFiat={balanceFiat}
                        pulse={pulse}
                        loading={loading}
                        onRefresh={refreshBalance}
                        onSend={() => setView('SEND')}
                        onReceive={() => setView('RECEIVE')}
                        onScan={() => setView('SCAN')}
                        onCreate={() => setView('CREATE')}
                    />
                )}
                {view === 'SEND' && (
                    <SendView key="send"
                        prefilledAddress={prefilledAddress}
                        onBack={() => { setView('HOME'); setPrefilledAddress(''); }}
                    />
                )}
                {view === 'RECEIVE' && (
                    <ReceiveView key="receive"
                        address={address}
                        onBack={() => setView('HOME')}
                    />
                )}
                {view === 'SCAN' && (
                    <ScanView key="scan"
                        onBack={() => setView('HOME')}
                        onResult={(addr: string) => { setView('SEND'); setPrefilledAddress(addr); }}
                    />
                )}
                {view === 'CREATE' && (
                    <CreateWalletView key="create"
                        onBack={() => setView('HOME')}
                        onCreated={() => setView('HOME')}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
//  HOME VIEW
// ─────────────────────────────────────────────────────────────────
function HomeView({ address, balance, balanceFiat, pulse, loading, onRefresh, onSend, onReceive, onScan, onCreate }: any) {
    const [copied, setCopied] = useState(false);
    const { clearWallet } = useWalletStore();

    const copy = () => {
        if (!address) return;
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col"
        >
            <section className="px-8 pt-16 pb-10 flex flex-col items-center text-center relative">
                {address && (
                    <button onClick={clearWallet} className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all">
                        <Trash size={14} />
                    </button>
                )}
                <div className="flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-1000 ${pulse ? 'bg-[var(--aztec-orchid)] shadow-[0_0_8px_var(--aztec-orchid)]' : 'bg-white/20'}`} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                        {address ? 'POLYGON ACTIVE' : 'NO WALLET — CREATE OR IMPORT'}
                    </span>
                </div>

                <h1 className="text-7xl md:text-9xl font-aztec-serif font-black tracking-tighter leading-none mb-2">
                    {balance}<span className="text-3xl md:text-5xl text-[var(--aztec-orchid)] ml-3">MATIC</span>
                </h1>
                <p className="text-white/40 font-aztec-mono text-sm mb-4">{balanceFiat} USD</p>

                {address && (
                    <button onClick={copy} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:border-white/20 transition-all">
                        <span className="text-[11px] font-aztec-mono text-white/50">{truncate(address, 12)}</span>
                        {copied ? <Check size={12} className="text-[var(--aztec-orchid)]" /> : <Copy size={12} className="text-white/30" />}
                    </button>
                )}

                <button onClick={onRefresh} disabled={loading} className="mt-4 p-2 text-white/20 hover:text-white/60 transition-all">
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
            </section>

            <section className="px-8 pb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <ActionBtn icon={ArrowUpRight} label="Send" color="orchid" onClick={onSend} disabled={!address} />
                    <ActionBtn icon={ArrowDownLeft} label="Receive" color="aqua" onClick={onReceive} disabled={!address} />
                    <ActionBtn icon={QrIcon} label="Scan QR" color="chartreuse" onClick={onScan} disabled={!address} />
                    <ActionBtn icon={Plus} label="New Wallet" color="white" onClick={onCreate} />
                </div>

                {!address && (
                    <div className="p-6 rounded-3xl border border-[var(--aztec-orchid)]/20 bg-[var(--aztec-orchid)]/5 flex gap-4 items-start mx-auto max-w-lg mt-12">
                        <AlertTriangle size={20} className="text-[var(--aztec-orchid)] shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-widest text-white mb-1">No Sovereign Wallet</p>
                            <p className="text-[11px] text-white/50 leading-relaxed">Click "New Wallet" to securely generate a local Ethereum/Polygon EOA, or import an existing private key in browser memory.</p>
                        </div>
                    </div>
                )}
            </section>

            <footer className="px-8 py-6 mt-auto border-t border-white/5 flex justify-between items-center opacity-30 text-[9px] font-black uppercase tracking-widest">
                <span className="flex items-center gap-2"><Globe size={12} /> Polygon Mainnet</span>
                <span className="flex items-center gap-2"><Shield size={12} /> AES Sovereign Vault</span>
                <span className="flex items-center gap-2"><Cpu size={12} /> Ethers v6</span>
            </footer>
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────
//  SEND VIEW
// ─────────────────────────────────────────────────────────────────
function SendView({ prefilledAddress, onBack }: any) {
    const { sendTransaction } = useWalletStore();
    const [toAddress, setToAddress] = useState(prefilledAddress || '');
    const [amount, setAmount] = useState('');
    const [isSigning, setIsSigning] = useState(false);

    const handleSend = async () => {
        if (!toAddress || !amount) return;
        setIsSigning(true);
        try {
            const txHash = await sendTransaction(toAddress, amount);
            if (txHash) {
                onBack();
            }
        } finally {
            setIsSigning(false);
        }
    };

    return (
        <ModalView title="Send Asset" subtitle="Outbound Transmission" icon={<ArrowUpRight />} onBack={onBack}>
            <div className="space-y-5">
                <Field label="Destination EVM Address">
                    <input
                        type="text" value={toAddress}
                        onChange={e => setToAddress(e.target.value)}
                        placeholder="0x..."
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-aztec-mono text-sm focus:border-[var(--aztec-orchid)]/50 outline-none transition-all"
                    />
                </Field>
                <Field label="Amount (MATIC)">
                    <div className="relative">
                        <input
                            type="number" value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="0.0"
                            className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-aztec-mono text-xl font-black focus:border-[var(--aztec-orchid)]/50 outline-none transition-all pr-16"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-[var(--aztec-orchid)]">MATIC</span>
                    </div>
                </Field>
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSend}
                    disabled={isSigning || !toAddress || !amount}
                    className="w-full py-5 rounded-2xl bg-white text-black font-black text-[11px] uppercase tracking-[0.4em] hover:bg-[var(--aztec-orchid)] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                    {isSigning ? <><RefreshCw size={16} className="animate-spin" /> Processing...</> : <><Send size={16} /> Initiate Transmission</>}
                </motion.button>
            </div>
        </ModalView>
    );
}

// ─────────────────────────────────────────────────────────────────
//  RECEIVE VIEW
// ─────────────────────────────────────────────────────────────────
function ReceiveView({ address, onBack }: any) {
    const [copied, setCopied] = useState(false);

    return (
        <ModalView title="Receive Asset" subtitle="Inbound Protocol" icon={<ArrowDownLeft />} onBack={onBack}>
            <div className="flex flex-col items-center gap-6">
                <div className="p-5 bg-white rounded-[2rem] shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                    {address ? (
                        <QRCodeSVG value={address} size={200} level="H" bgColor="#FFFFFF" fgColor="#000000" />
                    ) : (
                        <div className="w-[200px] h-[200px] flex items-center justify-center text-black/30 text-sm">No wallet yet</div>
                    )}
                </div>

                <div className="w-full">
                    <p className="text-[9px] text-white/30 uppercase tracking-widest mb-2 text-center">Your Address</p>
                    <button
                        onClick={() => { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        className="w-full flex items-center justify-between px-5 py-4 bg-white/5 border border-white/10 rounded-2xl hover:border-[var(--aztec-orchid)] transition-all"
                    >
                        <code className="text-xs font-aztec-mono text-[var(--aztec-orchid)] truncate max-w-[280px]">{address || 'No wallet initialized'}</code>
                        {copied ? <Check size={14} className="text-[var(--aztec-orchid)] shrink-0" /> : <Copy size={14} className="text-white/30 shrink-0" />}
                    </button>
                </div>

                <div className="p-4 bg-[var(--aztec-orchid)]/5 border border-[var(--aztec-orchid)]/10 rounded-2xl text-[10px] text-white/40 font-aztec-mono text-center">
                    Only send EVM tokens (Polygon) to this address.
                </div>
            </div>
        </ModalView>
    );
}

// ─────────────────────────────────────────────────────────────────
//  SCAN VIEW
// ─────────────────────────────────────────────────────────────────
function ScanView({ onBack, onResult }: any) {
    const [manual, setManual] = useState('');

    return (
        <ModalView title="QR Scanner" subtitle="Address Recovery" icon={<QrIcon />} onBack={onBack}>
            <div className="space-y-6">
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-center">
                    <QrIcon size={48} className="mx-auto text-white/20 mb-3" />
                    <p className="text-[11px] font-aztec-mono text-white/40 mb-4">Camera scanning requires mobile browser. Paste address manually below:</p>
                </div>

                <Field label="Paste EVM Address">
                    <input
                        type="text" value={manual}
                        onChange={e => setManual(e.target.value)}
                        placeholder="0x..."
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-aztec-mono text-sm focus:border-[var(--aztec-orchid)]/50 outline-none transition-all"
                    />
                </Field>

                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { if (manual) { onResult(manual); toast.success('Address loaded into Send form.'); } }}
                    disabled={!manual}
                    className="w-full py-5 rounded-2xl bg-white text-black font-black text-[11px] uppercase tracking-[0.4em] hover:bg-[var(--aztec-orchid)] transition-all disabled:opacity-40"
                >
                    Load Address
                </motion.button>
            </div>
        </ModalView>
    );
}

// ─────────────────────────────────────────────────────────────────
//  CREATE WALLET VIEW
// ─────────────────────────────────────────────────────────────────
function CreateWalletView({ onBack, onCreated }: any) {
    const { createWallet, importWallet } = useWalletStore();
    const [mode, setMode] = useState<'NEW' | 'IMPORT'>('NEW');
    const [importKey, setImportKey] = useState('');

    const handleCreate = () => {
        createWallet();
        onCreated();
    };

    const handleImport = () => {
        if (importWallet(importKey.trim())) {
            onCreated();
        }
    };

    return (
        <ModalView title={mode === 'NEW' ? 'Create Wallet' : 'Import Wallet'} subtitle="Sovereign Memory Keys" icon={<Key />} onBack={onBack}>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setMode('NEW')}
                        className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${mode === 'NEW' ? 'bg-[var(--aztec-orchid)] text-black border-transparent' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'}`}
                    >
                        <Plus size={14} className="mx-auto mb-1" />
                        New Wallet
                    </button>
                    <button
                        onClick={() => setMode('IMPORT')}
                        className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${mode === 'IMPORT' ? 'bg-[var(--aztec-aqua)] text-black border-transparent' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'}`}
                    >
                        <Key size={14} className="mx-auto mb-1" />
                        Import Key
                    </button>
                </div>

                {mode === 'NEW' ? (
                    <>
                        <div className="p-5 bg-[var(--aztec-orchid)]/5 border border-[var(--aztec-orchid)]/10 rounded-2xl text-[10px] text-white/50 font-aztec-mono leading-relaxed">
                            A high-entropy cryptographic wallet will be securely generated exclusively in this local browser memory environment. By proceeding, you assert sovereign algorithmic ownership.
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={handleCreate}
                            className="w-full py-5 rounded-2xl bg-[var(--aztec-orchid)] text-black font-black text-[11px] uppercase tracking-[0.4em] hover:brightness-110 transition-all flex items-center justify-center gap-3"
                        >
                            <Zap size={16} /> Generate Sovereign EOA
                        </motion.button>
                    </>
                ) : (
                    <>
                        <Field label="Enter Private Key (Hex)">
                            <textarea
                                value={importKey}
                                onChange={e => setImportKey(e.target.value)}
                                placeholder="0x..."
                                rows={3}
                                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-aztec-mono text-sm focus:border-[var(--aztec-aqua)]/50 outline-none transition-all resize-none"
                            />
                        </Field>
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={handleImport}
                            disabled={!importKey.trim()}
                            className="w-full py-5 rounded-2xl bg-[var(--aztec-aqua)] text-black font-black text-[11px] uppercase tracking-[0.4em] hover:brightness-110 transition-all disabled:opacity-40"
                        >
                            Import & Initialize
                        </motion.button>
                    </>
                )}
            </div>
        </ModalView>
    );
}

// ─────────────────────────────────────────────────────────────────
//  SHARED: MODAL WRAPPER
// ─────────────────────────────────────────────────────────────────
function ModalView({ title, subtitle, icon, onBack, children }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="flex flex-col"
        >
            <div className="flex items-center gap-5 px-8 pt-12 pb-8 border-b border-white/5 shrink-0">
                <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all">
                    <X size={18} />
                </button>
                <div className="w-12 h-12 rounded-2xl bg-[var(--aztec-orchid)]/10 flex items-center justify-center text-[var(--aztec-orchid)]">
                    {icon}
                </div>
                <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--aztec-orchid)]/60">{subtitle}</p>
                    <h2 className="text-2xl font-aztec-serif font-black uppercase tracking-tight">{title}</h2>
                </div>
            </div>
            <div className="flex-1 p-8">
                {children}
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────
//  SHARED: ACTION BUTTON
// ─────────────────────────────────────────────────────────────────
function ActionBtn({ icon: Icon, label, onClick, disabled, color }: any) {
    const colors: Record<string, string> = {
        chartreuse: 'hover:bg-[var(--aztec-chartreuse)] hover:text-black',
        orchid: 'hover:bg-[var(--aztec-orchid)] hover:text-black',
        aqua: 'hover:bg-[var(--aztec-aqua)] hover:text-black',
        white: 'hover:bg-white hover:text-black',
    };
    return (
        <motion.button
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.96 }}
            onClick={onClick}
            disabled={disabled}
            className={`flex flex-col items-center justify-center p-6 bg-white/[0.04] border border-white/5 rounded-[2rem] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group ${colors[color] || ''}`}
        >
            <Icon size={22} className="mb-2 opacity-70 group-hover:opacity-100" />
            <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
        </motion.button>
    );
}

// SHARED: FORM FIELD
function Field({ label, children }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-white/40">{label}</label>
            {children}
        </div>
    );
}
