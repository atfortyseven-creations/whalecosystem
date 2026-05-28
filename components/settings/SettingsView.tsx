"use client";

import React, { useState, useEffect } from 'react';
import { useWalletStore, NETWORKS, NetworkId } from '@/lib/store/wallet-store';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, Lock, Unlock, Copy, ShieldCheck, ShieldAlert,
    Check, Plus, Trash2, Globe, Wifi, Activity, Database,
    Shield, Zap, Terminal, X, RefreshCw, AlertTriangle, Key
} from 'lucide-react';
import { ethers } from 'ethers';

/**
 * SettingsView — Institutional Light Theme
 * NO DARK MODE. Full light aesthetic: #FAFAF9 background, crisp black borders,
 * slate typescale. Professional and serious.
 */
export function SettingsView({ onBack }: { onBack: () => void }) {
    const {
        address, privateKey, mnemonic, isLocked, passwordHash,
        setupPassword, lockVault, contacts, addContact, removeContact,
        activeNetwork, setNetwork, customRpcUrl, setCustomRpcUrl
    } = useWalletStore();

    const [activeTab, setActiveTab] = useState<'SECURITY' | 'NETWORKS' | 'CONTACTS' | 'SESSIONS'>('SECURITY');
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const TABS: { id: typeof activeTab; label: string; icon: React.ReactNode }[] = [
        { id: 'SECURITY',  label: 'Security',  icon: <Shield size={14} /> },
        { id: 'NETWORKS',  label: 'Networks',  icon: <Globe size={14} /> },
        { id: 'CONTACTS',  label: 'Contacts',  icon: <Database size={14} /> },
        { id: 'SESSIONS',  label: 'Sessions',  icon: <Wifi size={14} /> },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-[200] w-full md:w-[500px] bg-[#FAFAF9] border-l border-black/10 shadow-2xl flex flex-col font-sans text-black overflow-hidden"
        >
            {/* ── Header ── */}
            <header className="flex items-center justify-between px-6 py-5 border-b border-black/10 bg-white shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-black flex items-center justify-center shrink-0">
                        <Settings size={15} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-[13px] font-black uppercase tracking-[0.15em] text-black leading-none">System Configuration</h2>
                        {address && (
                            <p className="text-[10px] font-mono text-black/40 mt-0.5 truncate max-w-[220px]">
                                {address.slice(0, 8)}...{address.slice(-6)}
                            </p>
                        )}
                    </div>
                </div>
                <button
                    onClick={onBack}
                    className="w-8 h-8 border border-black/15 flex items-center justify-center hover:bg-black hover:text-white transition-colors text-black/50"
                >
                    <X size={15} />
                </button>
            </header>

            {/* ── Tab Navigation ── */}
            <div className="flex border-b border-black/10 bg-white shrink-0 overflow-x-auto">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-4 text-[11px] font-bold uppercase tracking-[0.12em] transition-all whitespace-nowrap border-b-2 -mb-px ${
                            activeTab === tab.id
                                ? 'border-black text-black bg-white'
                                : 'border-transparent text-black/40 hover:text-black/70 hover:bg-black/[0.02]'
                        }`}
                    >
                        <span className={activeTab === tab.id ? 'text-black' : 'text-black/30'}>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto p-6 space-y-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                    >
                        {activeTab === 'SECURITY' && (
                            <SecurityModule
                                passwordHash={passwordHash}
                                setupPassword={setupPassword}
                                lockVault={lockVault}
                                privateKey={privateKey}
                                mnemonic={mnemonic}
                            />
                        )}
                        {activeTab === 'NETWORKS' && (
                            <NetworkModule
                                activeNetwork={activeNetwork}
                                setNetwork={setNetwork}
                                customRpcUrl={customRpcUrl}
                                setCustomRpcUrl={setCustomRpcUrl}
                            />
                        )}
                        {activeTab === 'CONTACTS' && (
                            <ContactsModule
                                contacts={contacts}
                                addContact={addContact}
                                removeContact={removeContact}
                            />
                        )}
                        {activeTab === 'SESSIONS' && <SessionsModule />}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── Footer ── */}
            <div className="shrink-0 px-6 py-4 border-t border-black/10 bg-white flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-black/30 font-bold">
                    QDS Terminal v2.1.0
                </span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-black/30">
                    E2E Encrypted
                </span>
            </div>
        </motion.div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECURITY MODULE
───────────────────────────────────────────────────────────────────────────── */
function SecurityModule({ passwordHash, setupPassword, lockVault, privateKey, mnemonic }: any) {
    const [newPassword, setNewPassword] = useState('');
    const [showPk, setShowPk] = useState(false);
    const [showMnemonic, setShowMnemonic] = useState(false);

    if (!passwordHash) {
        return (
            <div className="space-y-6">
                {/* Vault Unsecured Warning */}
                <div className="bg-red-50 border border-red-200 p-5">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="w-8 h-8 bg-red-100 border border-red-300 flex items-center justify-center shrink-0 mt-0.5">
                            <AlertTriangle size={14} className="text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-[12px] font-black uppercase tracking-[0.15em] text-red-700 mb-1">Vault Unsecured</h3>
                            <p className="text-[11px] text-red-600/80 leading-relaxed">
                                Cryptographic keys are stored in plaintext in local memory. Define a master passphrase immediately to enforce AES-256-GCM encryption at the storage layer.
                            </p>
                        </div>
                    </div>
                    <input
                        type="password"
                        placeholder="Enter new passphrase..."
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && newPassword.length >= 8) { setupPassword(newPassword); toast.success("Vault Encrypted", { description: "AES-256-GCM active." }); }}}
                        className="w-full bg-white border border-red-300 text-black px-4 py-3 text-[12px] font-mono tracking-widest mb-3 outline-none focus:border-red-600 transition-colors placeholder:text-black/25 placeholder:tracking-normal"
                    />
                    {newPassword.length > 0 && newPassword.length < 8 && (
                        <p className="text-red-500 text-[10px] uppercase tracking-widest font-bold mb-3">Minimum 8 characters required</p>
                    )}
                    <button
                        onClick={() => { setupPassword(newPassword); toast.success("Vault Encrypted"); }}
                        disabled={!newPassword || newPassword.length < 8}
                        className="w-full bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] py-3.5 border border-black hover:bg-black/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        Initialize Encryption
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Vault Status */}
            <div className="bg-emerald-50 border border-emerald-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                    <div>
                        <p className="text-[12px] font-black uppercase tracking-[0.12em] text-emerald-700">AES-256-GCM Active</p>
                        <p className="text-[10px] text-emerald-600/70 font-mono">Vault is encrypted and secured</p>
                    </div>
                </div>
                <button
                    onClick={lockVault}
                    className="text-[10px] font-black uppercase tracking-widest text-black bg-white border border-black/20 px-4 py-2 hover:bg-black hover:text-white transition-colors flex items-center gap-2"
                >
                    <Lock size={12} />
                    Lock Now
                </button>
            </div>

            {/* Raw Entropy Export */}
            <div>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-black/10">
                    <Key size={13} className="text-black/40" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-black/50">Raw Entropy Export</h3>
                </div>
                <div className="space-y-4">
                    {/* Private Key */}
                    {privateKey && (
                        <div className="border border-black/10 bg-white p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-black/60">ECDSA Private Key</span>
                                <button
                                    onClick={() => setShowPk(!showPk)}
                                    className="flex items-center gap-1.5 text-[9px] uppercase font-black tracking-widest text-black/50 hover:text-black transition-colors border border-black/10 px-3 py-1.5 hover:border-black"
                                >
                                    {showPk ? <Unlock size={11} /> : <Lock size={11} />}
                                    {showPk ? 'Hide' : 'Reveal'}
                                </button>
                            </div>
                            {showPk ? (
                                <div className="bg-[#FAFAF9] border border-black/10 p-3 font-mono text-[11px] text-black break-all relative group">
                                    {privateKey}
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(privateKey); toast.success("Private key copied to clipboard"); setShowPk(false); }}
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-black text-white"
                                        title="Copy & hide"
                                    >
                                        <Copy size={12} />
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-[#FAFAF9] border border-black/10 p-3 font-mono text-[11px] text-black/20 text-center tracking-[0.4em] select-none">
                                    ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
                                </div>
                            )}
                        </div>
                    )}

                    {/* BIP-39 Mnemonic */}
                    {mnemonic && (
                        <div className="border border-black/10 bg-white p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-black/60">BIP-39 Recovery Phrase</span>
                                <button
                                    onClick={() => setShowMnemonic(!showMnemonic)}
                                    className="flex items-center gap-1.5 text-[9px] uppercase font-black tracking-widest text-black/50 hover:text-black transition-colors border border-black/10 px-3 py-1.5 hover:border-black"
                                >
                                    {showMnemonic ? <Unlock size={11} /> : <Lock size={11} />}
                                    {showMnemonic ? 'Hide' : 'Reveal'}
                                </button>
                            </div>
                            {showMnemonic ? (
                                <div className="grid grid-cols-3 gap-2">
                                    {mnemonic.split(' ').map((word: string, i: number) => (
                                        <div key={i} className="border border-black/10 bg-[#FAFAF9] px-3 py-2 flex flex-col items-center">
                                            <span className="text-[8px] text-black/30 mb-0.5 font-mono">{i + 1}</span>
                                            <span className="text-[11px] font-black uppercase tracking-widest text-black">{word}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <div key={i} className="border border-black/5 bg-[#FAFAF9] px-3 py-2 flex flex-col items-center">
                                            <span className="text-[8px] text-black/20 mb-0.5 font-mono">{i + 1}</span>
                                            <span className="text-[11px] font-black uppercase tracking-widest text-black/15">••••</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NETWORKS MODULE
───────────────────────────────────────────────────────────────────────────── */
function NetworkModule({ activeNetwork, setNetwork, customRpcUrl, setCustomRpcUrl }: any) {
    const [rpcInput, setRpcInput] = useState(customRpcUrl || '');
    const [testingRpc, setTestingRpc] = useState(false);

    const handleSaveRPC = async () => {
        if (!rpcInput) return;
        try {
            if (!rpcInput.startsWith('http')) throw new Error('Invalid URL protocol — must be HTTP/HTTPS');
            new URL(rpcInput);

            // Live test the RPC endpoint before committing
            setTestingRpc(true);
            try {
                const provider = new ethers.JsonRpcProvider(rpcInput);
                const network = await Promise.race([
                    provider.getNetwork(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('RPC timeout after 5s')), 5000))
                ]);
                setCustomRpcUrl(rpcInput);
                toast.success(`RPC Verified`, { description: `Connected to Chain ID ${(network as any).chainId}` });
            } catch (testErr: any) {
                toast.error('RPC Test Failed', { description: testErr.message });
            } finally {
                setTestingRpc(false);
            }
        } catch (err: any) {
            toast.error('Invalid RPC URL', { description: err.message });
        }
    };

    return (
        <div className="space-y-6">
            {/* Network Selection */}
            <div>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-black/10">
                    <Globe size={13} className="text-black/40" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-black/50">Consensus Layer</h3>
                </div>
                <div className="space-y-2">
                    {Object.entries(NETWORKS).map(([id, net]) => {
                        const isActive = activeNetwork === id;
                        return (
                            <button
                                key={id}
                                onClick={() => { setNetwork(id as NetworkId); toast.success(`Network: ${net.name}`); }}
                                className={`w-full p-4 text-left flex items-center justify-between border transition-all duration-150 ${
                                    isActive
                                        ? 'border-black bg-black text-white'
                                        : 'border-black/10 bg-white text-black hover:border-black/30 hover:bg-black/[0.02]'
                                }`}
                            >
                                <div>
                                    <p className={`text-[12px] font-black uppercase tracking-[0.12em] ${isActive ? 'text-white' : 'text-black'}`}>
                                        {net.name}
                                    </p>
                                    <p className={`text-[10px] font-mono mt-0.5 ${isActive ? 'text-white/50' : 'text-black/35'}`}>
                                        Chain ID: {net.chainId} · {net.currency}
                                    </p>
                                </div>
                                {isActive
                                    ? <Check size={16} className="text-white shrink-0" />
                                    : <div className="w-4 h-4 border border-black/20 rounded-full shrink-0" />
                                }
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Custom RPC Override */}
            <div>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-black/10">
                    <Activity size={13} className="text-black/40" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-black/50">Custom RPC Endpoint</h3>
                </div>
                <p className="text-[11px] text-black/40 leading-relaxed mb-4 font-mono">
                    Override default public nodes with a dedicated Alchemy, Infura, or QuickNode endpoint. The endpoint is tested live before saving.
                </p>
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="https://mainnet.infura.io/v3/YOUR_KEY"
                        value={rpcInput}
                        onChange={e => setRpcInput(e.target.value)}
                        className="w-full bg-white border border-black/15 text-black px-4 py-3 text-[11px] font-mono tracking-wide outline-none focus:border-black transition-colors placeholder:text-black/20"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleSaveRPC}
                            disabled={!rpcInput || testingRpc}
                            className="flex-1 bg-black text-white text-[10px] font-black uppercase tracking-[0.15em] py-3 border border-black hover:bg-black/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {testingRpc ? <><RefreshCw size={12} className="animate-spin" /> Testing…</> : 'Inject Endpoint'}
                        </button>
                        <button
                            onClick={() => { setRpcInput(''); setCustomRpcUrl(null); toast.info('Reverted to public nodes'); }}
                            className="px-5 border border-black/15 text-black/50 text-[10px] font-black uppercase tracking-widest hover:border-black hover:text-black transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                </div>
                {customRpcUrl && (
                    <div className="mt-3 px-3 py-2 border border-emerald-200 bg-emerald-50 flex items-center gap-2">
                        <ShieldCheck size={12} className="text-emerald-600 shrink-0" />
                        <p className="text-[10px] font-mono text-emerald-700 truncate">{customRpcUrl}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CONTACTS MODULE
───────────────────────────────────────────────────────────────────────────── */
function ContactsModule({ contacts, addContact, removeContact }: any) {
    const [newName, setNewName] = useState('');
    const [newAddress, setNewAddress] = useState('');
    const [addressError, setAddressError] = useState('');

    const handleSave = () => {
        if (!ethers.isAddress(newAddress)) {
            setAddressError('Invalid Ethereum address format');
            return;
        }
        setAddressError('');
        addContact(newName.toUpperCase(), newAddress);
        setNewName('');
        setNewAddress('');
        toast.success('Contact registered');
    };

    return (
        <div className="space-y-6">
            {/* Add Contact Form */}
            <div className="border border-black/10 bg-white p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-black/10">
                    <Plus size={13} className="text-black/40" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-black/50">Register Entity</h3>
                </div>
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Entity label (e.g. OTC DESK, TREASURY)"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        className="w-full bg-[#FAFAF9] border border-black/10 text-black px-4 py-3 text-[11px] font-mono tracking-wide outline-none focus:border-black transition-colors placeholder:text-black/20"
                    />
                    <div>
                        <input
                            type="text"
                            placeholder="0x..."
                            value={newAddress}
                            onChange={e => { setNewAddress(e.target.value); setAddressError(''); }}
                            className={`w-full bg-[#FAFAF9] border text-black px-4 py-3 text-[11px] font-mono tracking-wide outline-none focus:border-black transition-colors placeholder:text-black/20 ${addressError ? 'border-red-400 bg-red-50' : 'border-black/10'}`}
                        />
                        {addressError && (
                            <p className="text-red-500 text-[10px] mt-1 font-mono">{addressError}</p>
                        )}
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={!newName || !newAddress}
                        className="w-full bg-black text-white text-[10px] font-black uppercase tracking-[0.15em] py-3 border border-black hover:bg-black/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
                    >
                        <Plus size={12} />
                        Commit to Registry
                    </button>
                </div>
            </div>

            {/* Contact List */}
            <div>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-black/10">
                    <Database size={13} className="text-black/40" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-black/50">
                        Verified Registry ({contacts.length})
                    </h3>
                </div>
                {contacts.length === 0 ? (
                    <div className="py-10 text-center border border-dashed border-black/10">
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-black/30">Registry is empty</p>
                        <p className="text-[11px] text-black/25 font-mono mt-2">Add your first trusted entity above</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {contacts.map((c: any) => (
                            <div
                                key={c.address}
                                className="border border-black/10 bg-white p-4 flex items-center justify-between hover:border-black/25 transition-colors group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 bg-black/5 border border-black/10 flex items-center justify-center shrink-0">
                                        <span className="text-[10px] font-black text-black/60">{c.name?.slice(0, 2) || '??'}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[12px] font-black uppercase tracking-[0.12em] text-black truncate">{c.name}</p>
                                        <p className="text-[10px] font-mono text-black/40">{c.address.slice(0, 10)}…{c.address.slice(-8)}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { removeContact(c.address); toast.success('Entity removed'); }}
                                    className="text-black/25 hover:text-red-500 p-2 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                                    title="Remove"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SESSIONS MODULE — Real WalletConnect v2 sessions from localStorage
───────────────────────────────────────────────────────────────────────────── */
function SessionsModule() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const parseSessions = () => {
            const list: any[] = [];
            try {
                // WalletConnect v2 stores sessions under wc@2:client:... keys
                const wcKeys = Object.keys(localStorage).filter(k =>
                    k.startsWith('wc@2:client:0.5:session') ||
                    k.startsWith('wc@2:core:0.3:session')
                );
                wcKeys.forEach(k => {
                    try {
                        const raw = localStorage.getItem(k);
                        if (!raw) return;
                        const parsed = JSON.parse(raw);
                        const values = Array.isArray(parsed) ? parsed : Object.values(parsed);
                        values.forEach((v: any) => {
                            if (v?.peer?.metadata) {
                                list.push({
                                    topic: v.topic || k,
                                    name:  v.peer.metadata.name  || 'Unknown dApp',
                                    url:   v.peer.metadata.url   || '',
                                    icon:  v.peer.metadata.icons?.[0] || null,
                                    expiry: v.expiry ? new Date(v.expiry * 1000).toLocaleDateString() : 'N/A',
                                });
                            }
                        });
                    } catch { /* skip malformed entries */ }
                });
            } catch (e) {
                console.error('[Settings] WC session parse failed:', e);
            }
            setSessions(list);
            setLoading(false);
        };
        parseSessions();
    }, []);

    const killSession = (topic: string) => {
        // Remove from localStorage — WalletConnect SDK picks this up on next connect
        try {
            Object.keys(localStorage)
                .filter(k => k.includes(topic))
                .forEach(k => localStorage.removeItem(k));
        } catch { /* non-critical */ }
        setSessions(prev => prev.filter(s => s.topic !== topic));
        toast.success('Session terminated', { description: 'The dApp connection has been revoked.' });
    };

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-black/10">
                    <Wifi size={13} className="text-black/40" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-black/50">
                        Active dApp Sessions
                    </h3>
                </div>
                <p className="text-[11px] text-black/40 leading-relaxed mb-4 font-mono">
                    WalletConnect v2 sessions. These dApps have a cryptographic link to your public address and may request EVM transaction signatures.
                </p>

                {loading ? (
                    <div className="space-y-2">
                        {[1, 2].map(i => (
                            <div key={i} className="h-16 bg-black/5 animate-pulse border border-black/5" />
                        ))}
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="py-10 text-center border border-dashed border-black/10">
                        <Wifi size={24} className="text-black/15 mx-auto mb-3" />
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-black/30">No active sessions</p>
                        <p className="text-[11px] text-black/25 font-mono mt-2">Connect to a dApp via WalletConnect to see sessions here</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {sessions.map(site => (
                            <div
                                key={site.topic}
                                className="border border-black/10 bg-white p-4 flex items-center justify-between hover:border-black/25 transition-colors group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 border border-black/10 bg-[#FAFAF9] flex items-center justify-center shrink-0 overflow-hidden">
                                        {site.icon
                                            ? <img src={site.icon} alt={site.name} className="w-full h-full object-cover" />
                                            : <Globe size={16} className="text-black/30" />
                                        }
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[12px] font-black uppercase tracking-[0.1em] text-black truncate">{site.name}</p>
                                        <p className="text-[10px] font-mono text-black/40 truncate">{site.url}</p>
                                        <p className="text-[9px] font-mono text-black/25">Expires {site.expiry}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => killSession(site.topic)}
                                    className="text-black/25 hover:text-red-500 p-2 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                                    title="Terminate session"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
