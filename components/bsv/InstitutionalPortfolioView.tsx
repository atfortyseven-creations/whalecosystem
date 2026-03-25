"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowUpRight, ArrowDownLeft, Scan, Plus, Copy, Check,
    Eye, EyeOff, RefreshCw, X, Shield, Zap, Activity,
    Database, Globe, Cpu, ChevronRight, QrCode as QrIcon,
    AlertTriangle, Key, Lock, Unlock, Send
} from 'lucide-react';
import { useCWI } from '@/lib/bsv/CWIContext';
import { UtxoManager } from '@/lib/bsv/UtxoManager';
import { CwiIdentity } from '@/lib/bsv/CwiIdentity';
import { Transaction, P2PKH, PrivateKey } from '@bsv/sdk';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import * as bip39 from 'bip39';

// ─────────────────────────────────────────────────────────────────
//  UTILITY: truncate address for display
// ─────────────────────────────────────────────────────────────────
const truncate = (s: string, n = 8) => s ? `${s.slice(0, n)}...${s.slice(-6)}` : '—';

// ─────────────────────────────────────────────────────────────────
//  TOP-LEVEL VIEW ENUM
// ─────────────────────────────────────────────────────────────────
type View = 'HOME' | 'SEND' | 'RECEIVE' | 'SCAN' | 'CREATE';

export function InstitutionalPortfolioView() {
    const { identity, setIdentity } = useCWI() as any;
    const [view, setView] = useState<View>('HOME');
    const [prefilledAddress, setPrefilledAddress] = useState('');
    const [balance, setBalance] = useState('0.00000000');
    const [balanceFiat, setBalanceFiat] = useState('$0.00');
    const [pulse, setPulse] = useState(false);
    const [loading, setLoading] = useState(false);
    const utxoManager = React.useMemo(() => new UtxoManager(), []);

    // Live balance refresh
    const refreshBalance = useCallback(async () => {
        if (!identity) return;
        setLoading(true);
        try {
            const address = identity.getAddress();
            const utxos = await utxoManager.getUtxos(address);
            const sats = utxos.reduce((a: number, u: any) => a + u.value, 0);
            const bsv = sats / 1e8;
            setBalance(bsv.toFixed(8));
            // Approximate USD (BSV ~$50 as placeholder — no price oracle needed for MVP)
            setBalanceFiat(`$${(bsv * 50).toFixed(2)}`);
            setPulse(p => !p);
        } finally { setLoading(false); }
    }, [identity, utxoManager]);

    React.useEffect(() => {
        refreshBalance();
        const t = setInterval(refreshBalance, 15000);
        return () => clearInterval(t);
    }, [refreshBalance]);

    return (
        <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
            {/* Ambient BG */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,255,43,0.04),transparent_50%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,45,244,0.04),transparent_50%)] pointer-events-none" />

            <AnimatePresence mode="wait">
                {view === 'HOME' && (
                    <HomeView key="home"
                        identity={identity}
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
                        identity={identity}
                        utxoManager={utxoManager}
                        prefilledAddress={prefilledAddress}
                        onBack={() => { setView('HOME'); setPrefilledAddress(''); }}
                    />
                )}
                {view === 'RECEIVE' && (
                    <ReceiveView key="receive"
                        identity={identity}
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
                        onCreated={(id: any) => {
                            if (typeof setIdentity === 'function') setIdentity(id);
                            setView('HOME');
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
//  HOME VIEW
// ─────────────────────────────────────────────────────────────────
function HomeView({ identity, balance, balanceFiat, pulse, loading, onRefresh, onSend, onReceive, onScan, onCreate }: any) {
    const address = identity?.getAddress() || null;
    const [copied, setCopied] = useState(false);

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
            className="flex flex-col h-full overflow-y-auto"
        >
            {/* Balance Display */}
            <section className="px-8 pt-16 pb-10 flex flex-col items-center text-center">
                <div className="flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-1000 ${pulse ? 'bg-[var(--aztec-chartreuse)] shadow-[0_0_8px_var(--aztec-chartreuse)]' : 'bg-white/20'}`} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                        {address ? 'SUBSTRATE ACTIVE' : 'NO WALLET — CREATE OR IMPORT'}
                    </span>
                </div>

                <h1 className="text-7xl md:text-9xl font-aztec-serif font-black tracking-tighter leading-none mb-2">
                    {balance}<span className="text-3xl md:text-5xl text-[var(--aztec-chartreuse)] ml-3">BSV</span>
                </h1>
                <p className="text-white/40 font-aztec-mono text-sm mb-4">{balanceFiat} USD</p>

                {address && (
                    <button onClick={copy} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:border-white/20 transition-all">
                        <span className="text-[11px] font-aztec-mono text-white/50">{truncate(address, 12)}</span>
                        {copied ? <Check size={12} className="text-[var(--aztec-chartreuse)]" /> : <Copy size={12} className="text-white/30" />}
                    </button>
                )}

                <button onClick={onRefresh} disabled={loading} className="mt-4 p-2 text-white/20 hover:text-white/60 transition-all">
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
            </section>

            {/* Action Grid */}
            <section className="px-8 pb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <ActionBtn icon={ArrowUpRight} label="Send" color="chartreuse" onClick={onSend} disabled={!address} />
                    <ActionBtn icon={ArrowDownLeft} label="Receive" color="orchid" onClick={onReceive} disabled={!address} />
                    <ActionBtn icon={QrIcon} label="Scan QR" color="aqua" onClick={onScan} />
                    <ActionBtn icon={Plus} label="Create Wallet" color="white" onClick={onCreate} />
                </div>

                {!address && (
                    <div className="p-6 rounded-3xl border border-[var(--aztec-orchid)]/20 bg-[var(--aztec-orchid)]/5 flex gap-4 items-start">
                        <AlertTriangle size={20} className="text-[var(--aztec-orchid)] shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-widest text-white mb-1">No Wallet Detected</p>
                            <p className="text-[11px] text-white/50">Click "Create Wallet" to generate a new sovereign BSV wallet, or use QR Scan to import an existing address.</p>
                        </div>
                    </div>
                )}
            </section>

            {/* Protocol Footer */}
            <footer className="px-8 py-6 mt-auto border-t border-white/5 flex justify-between items-center opacity-30 text-[9px] font-black uppercase tracking-widest">
                <span className="flex items-center gap-2"><Globe size={12} /> BSV Mainnet</span>
                <span className="flex items-center gap-2"><Shield size={12} /> AES-GCM Sovereign Vault</span>
                <span className="flex items-center gap-2"><Cpu size={12} /> SirDeggen Substrate v4</span>
            </footer>
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────
//  SEND VIEW
// ─────────────────────────────────────────────────────────────────
function SendView({ identity, utxoManager, prefilledAddress, onBack }: any) {
    const [toAddress, setToAddress] = useState(prefilledAddress || '');
    const [amount, setAmount] = useState('');
    const [isSigning, setIsSigning] = useState(false);
    const [step, setStep] = useState('');

    const handleSend = async () => {
        if (!toAddress || !amount || !identity) {
            toast.error('Fill in destination address and amount.');
            return;
        }
        setIsSigning(true);
        try {
            const satoshis = Math.floor(parseFloat(amount) * 1e8);
            const senderAddress = identity.getAddress();
            const privKey = PrivateKey.fromWif(identity.getWIF());
            const p2pkh = new P2PKH();
            const tx = new Transaction();

            setStep('Fetching UTXOs...');
            const utxos = await utxoManager.getUtxos(senderAddress);
            const selected = utxoManager.selectUtxos(utxos, satoshis);

            for (const u of selected) {
                setStep(`Loading UTXO ${u.txid.slice(0, 8)}...`);
                const rawHex = await utxoManager.getRawTx(u.txid);
                const srcTx = Transaction.fromHex(rawHex);
                tx.addInput({ sourceTransaction: srcTx, sourceOutputIndex: u.vout, unlockingScriptTemplate: p2pkh.unlock(privKey) } as any);
            }

            tx.addOutput({ satoshis, lockingScript: p2pkh.lock(toAddress) } as any);
            tx.addOutput({ lockingScript: p2pkh.lock(identity.getChangeAddress()) } as any);

            setStep('Calculating fees...');
            await tx.fee();

            setStep('Signing transaction...');
            await tx.sign();

            setStep('Broadcasting to mainnet...');
            const txid = await utxoManager.broadcastTransaction(tx.toHex());

            toast.success(`Sent! TXID: ${txid.slice(0, 16)}...`);
            onBack();
        } catch (e: any) {
            toast.error(`Error: ${e.message}`);
        } finally { setIsSigning(false); setStep(''); }
    };

    return (
        <ModalView title="Send BSV" subtitle="Outbound Transmission" icon={<ArrowUpRight />} onBack={onBack}>
            <div className="space-y-5">
                <Field label="Destination BSV Address">
                    <input
                        type="text" value={toAddress}
                        onChange={e => setToAddress(e.target.value)}
                        placeholder="1abc...xyz"
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-aztec-mono text-sm focus:border-[var(--aztec-chartreuse)]/50 focus:bg-white/8 outline-none transition-all"
                    />
                </Field>
                <Field label="Amount (BSV)">
                    <div className="relative">
                        <input
                            type="number" value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="0.00001000"
                            className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-aztec-mono text-xl font-black focus:border-[var(--aztec-chartreuse)]/50 outline-none transition-all pr-16"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-[var(--aztec-chartreuse)]">BSV</span>
                    </div>
                </Field>

                {step && (
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl text-[11px] font-aztec-mono text-white/60">
                        <div className="w-2 h-2 rounded-full bg-[var(--aztec-chartreuse)] animate-pulse" />
                        {step}
                    </div>
                )}

                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSend}
                    disabled={isSigning || !toAddress || !amount}
                    className="w-full py-5 rounded-2xl bg-white text-black font-black text-[11px] uppercase tracking-[0.4em] hover:bg-[var(--aztec-chartreuse)] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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
function ReceiveView({ identity, onBack }: any) {
    const address = identity?.getAddress() || '';
    const [copied, setCopied] = useState(false);

    return (
        <ModalView title="Receive BSV" subtitle="Inbound Protocol" icon={<ArrowDownLeft />} onBack={onBack}>
            <div className="flex flex-col items-center gap-6">
                <div className="p-5 bg-white rounded-[2rem] shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                    {address ? (
                        <QRCodeSVG value={address} size={200} level="H" bgColor="#FFFFFF" fgColor="#000000" />
                    ) : (
                        <div className="w-[200px] h-[200px] flex items-center justify-center text-black/30 text-sm">No wallet yet</div>
                    )}
                </div>

                <div className="w-full">
                    <p className="text-[9px] text-white/30 uppercase tracking-widest mb-2 text-center">Your BSV Address</p>
                    <button
                        onClick={() => { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        className="w-full flex items-center justify-between px-5 py-4 bg-white/5 border border-white/10 rounded-2xl hover:border-[var(--aztec-chartreuse)] transition-all"
                    >
                        <code className="text-xs font-aztec-mono text-[var(--aztec-chartreuse)] truncate max-w-[280px]">{address || 'No wallet initialized'}</code>
                        {copied ? <Check size={14} className="text-[var(--aztec-chartreuse)] shrink-0" /> : <Copy size={14} className="text-white/30 shrink-0" />}
                    </button>
                </div>

                <div className="p-4 bg-[var(--aztec-chartreuse)]/5 border border-[var(--aztec-chartreuse)]/10 rounded-2xl text-[10px] text-white/40 font-aztec-mono text-center">
                    Only send BSV (Bitcoin SV) to this address. Sending other assets will result in permanent loss.
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

                <Field label="Paste BSV Address or TXID">
                    <input
                        type="text" value={manual}
                        onChange={e => setManual(e.target.value)}
                        placeholder="1abc..."
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-aztec-mono text-sm focus:border-[var(--aztec-chartreuse)]/50 outline-none transition-all"
                    />
                </Field>

                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { if (manual) { onResult(manual); toast.success('Address loaded into Send form.'); } }}
                    disabled={!manual}
                    className="w-full py-5 rounded-2xl bg-white text-black font-black text-[11px] uppercase tracking-[0.4em] hover:bg-[var(--aztec-chartreuse)] transition-all disabled:opacity-40"
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
    const [step, setStep] = useState<'INPUT' | 'GENERATE' | 'CONFIRM'>('INPUT');
    const [mnemonic, setMnemonic] = useState('');
    const [importMnemonic, setImportMnemonic] = useState('');
    const [show, setShow] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [mode, setMode] = useState<'NEW' | 'IMPORT'>('NEW');

    const generate = () => {
        const m = bip39.generateMnemonic(); // Defaults to 128 bit / 12 words
        setMnemonic(m);
        setStep('GENERATE');
    };

    const confirm = () => {
        try {
            const identity = new CwiIdentity();
            const mn = mode === 'NEW' ? mnemonic : importMnemonic.trim();
            identity.initFromMnemonic(mn);
            if (!identity.isInitialized()) throw new Error('Invalid mnemonic');
            toast.success('Sovereign wallet initialized!');
            onCreated(identity);
        } catch (e: any) {
            toast.error(`Error: ${e.message}`);
        }
    };

    return (
        <ModalView title={mode === 'NEW' ? 'Create Wallet' : 'Import Wallet'} subtitle="Sovereign Key Generation" icon={<Key />} onBack={onBack}>
            {step === 'INPUT' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setMode('NEW')}
                            className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${mode === 'NEW' ? 'bg-[var(--aztec-chartreuse)] text-black border-transparent' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'}`}
                        >
                            <Plus size={14} className="mx-auto mb-1" />
                            New Wallet
                        </button>
                        <button
                            onClick={() => setMode('IMPORT')}
                            className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${mode === 'IMPORT' ? 'bg-[var(--aztec-orchid)] text-black border-transparent' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'}`}
                        >
                            <Key size={14} className="mx-auto mb-1" />
                            Import Seed
                        </button>
                    </div>

                    {mode === 'NEW' ? (
                        <>
                            <div className="p-5 bg-[var(--aztec-chartreuse)]/5 border border-[var(--aztec-chartreuse)]/10 rounded-2xl text-[10px] text-white/50 font-aztec-mono leading-relaxed">
                                A new 12-word mnemonic seed phrase will be generated using cryptographically secure randomness (BIP39). Store it securely — this is your sovereign key. No one can recover it for you.
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={generate}
                                className="w-full py-5 rounded-2xl bg-[var(--aztec-chartreuse)] text-black font-black text-[11px] uppercase tracking-[0.4em] hover:brightness-110 transition-all flex items-center justify-center gap-3"
                            >
                                <Zap size={16} /> Generate Sovereign Key
                            </motion.button>
                        </>
                    ) : (
                        <>
                            <Field label="Enter 12 or 24-word Seed Phrase">
                                <textarea
                                    value={importMnemonic}
                                    onChange={e => setImportMnemonic(e.target.value)}
                                    placeholder="word1 word2 word3 ..."
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-aztec-mono text-sm focus:border-[var(--aztec-orchid)]/50 outline-none transition-all resize-none"
                                />
                            </Field>
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={confirm}
                                disabled={!importMnemonic.trim()}
                                className="w-full py-5 rounded-2xl bg-[var(--aztec-orchid)] text-black font-black text-[11px] uppercase tracking-[0.4em] hover:brightness-110 transition-all disabled:opacity-40"
                            >
                                Import & Initialize
                            </motion.button>
                        </>
                    )}
                </div>
            )}

            {step === 'GENERATE' && (
                <div className="space-y-5">
                    <div className="p-5 bg-black/40 border border-white/10 rounded-2xl">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--aztec-chartreuse)]">Your Seed Phrase</span>
                            <button onClick={() => setShow(!show)} className="text-white/30 hover:text-white/60 transition-all">
                                {show ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                        {show ? (
                            <div className="grid grid-cols-3 gap-2">
                                {mnemonic.split(' ').map((w, i) => (
                                    <div key={i} className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2 py-1.5">
                                        <span className="text-[8px] text-white/20 font-mono w-4">{i + 1}.</span>
                                        <span className="text-[11px] font-aztec-mono font-black text-white">{w}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-24 flex items-center justify-center gap-2 text-white/30">
                                <Lock size={16} /> <span className="text-[11px] font-aztec-mono">Click eye to reveal</span>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border border-[var(--aztec-orchid)]/20 bg-[var(--aztec-orchid)]/5 rounded-2xl text-[10px] text-white/50 font-aztec-mono">
                        ⚠️ Write these words down in order. Anyone with this phrase has full control of your funds. Never share it digitally.
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="w-4 h-4 rounded" />
                        <span className="text-[10px] font-aztec-mono text-white/50">I have safely stored my seed phrase offline</span>
                    </label>

                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={confirm}
                        disabled={!confirmed}
                        className="w-full py-5 rounded-2xl bg-[var(--aztec-chartreuse)] text-black font-black text-[11px] uppercase tracking-[0.4em] hover:brightness-110 transition-all disabled:opacity-40 flex items-center justify-center gap-3"
                    >
                        <Unlock size={16} /> Initialize Wallet
                    </motion.button>
                </div>
            )}
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
            className="flex flex-col h-full overflow-y-auto"
        >
            {/* Header */}
            <div className="flex items-center gap-5 px-8 pt-12 pb-8 border-b border-white/5 shrink-0">
                <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all">
                    <X size={18} />
                </button>
                <div className="w-12 h-12 rounded-2xl bg-[var(--aztec-chartreuse)]/10 flex items-center justify-center text-[var(--aztec-chartreuse)]">
                    {icon}
                </div>
                <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--aztec-chartreuse)]/60">{subtitle}</p>
                    <h2 className="text-2xl font-aztec-serif font-black uppercase tracking-tight">{title}</h2>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 p-8 overflow-y-auto">
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

// SHARED: DIVIDER CARD
function Divider() { return <div className="h-px w-full bg-white/5" />; }
