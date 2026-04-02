"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowUpRight, ArrowDownLeft, Scan, Plus, Copy, Check,
    Eye, EyeOff, RefreshCw, X, Shield, Zap,
    Globe, Cpu, QrCode as QrIcon,
    AlertTriangle, Key, Lock, Unlock, Send, Trash, CreditCard, ExternalLink
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { useWalletStore, NETWORKS, NetworkId, ProtocolType } from '@/lib/store/wallet-store';

// ─────────────────────────────────────────────────────────────────
//  UTILITY: truncate address for display
// ─────────────────────────────────────────────────────────────────
const truncate = (s: string, n = 8) => s ? `${s.slice(0, n)}...${s.slice(-6)}` : '—';

type View = 'HOME' | 'SEND' | 'RECEIVE' | 'SCAN' | 'CREATE' | 'BUY' | 'NETWORK';

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

    // 550K Quota Throttler & Focus-Aware Polling
    useEffect(() => {
        let isFocused = true;
        let t: NodeJS.Timeout;

        const handleFocus = () => { isFocused = true; refreshBalance(); };
        const handleBlur = () => { isFocused = false; };

        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);

        // Initial fetch
        refreshBalance();

        // 45s polling cycle, specifically dropping all network requests when user is out of tab to save API limits.
        t = setInterval(() => {
            if (isFocused && document.visibilityState === 'visible') {
                refreshBalance();
            }
        }, 45000);

        return () => {
            clearInterval(t);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
        };
    }, [refreshBalance]);

    const balanceFiat = `$${(parseFloat(balance || "0") * 3100).toFixed(2)}`;

    return (
        <div className="flex flex-col relative text-black selection:bg-black/10 min-h-[80vh]">
            
            {/* The same grid background as the support page */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg,#000 0,#000 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#000 0,#000 1px,transparent 1px,transparent 40px)' }} />

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
                        onBuy={() => setView('BUY')}
                        onNetworkClick={() => setView('NETWORK')}
                    />
                )}
                {view === 'NETWORK' && (
                    <NetworkView key="network"
                        onBack={() => setView('HOME')}
                    />
                )}
                {view === 'SEND' && (
                    <SendView key="send"
                        prefilledAddress={prefilledAddress}
                        onBack={() => { setView('HOME'); setPrefilledAddress(''); }}
                    />
                )}
                {view === 'BUY' && (
                    <BuyView key="buy"
                        address={address}
                        onBack={() => setView('HOME')}
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
function HomeView({ address, balance, balanceFiat, pulse, loading, onRefresh, onSend, onReceive, onScan, onCreate, onBuy, onNetworkClick }: any) {
    const [copied, setCopied] = useState(false);
    const { clearWallet, activeNetwork } = useWalletStore();
    
    const networkInfo = NETWORKS[activeNetwork as NetworkId] || NETWORKS.polygon;

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
            className="flex flex-col relative z-10"
        >
            <section className="px-8 pt-16 pb-10 flex flex-col items-center text-center relative">
                {address && (
                    <button onClick={clearWallet} className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all">
                        <Trash size={14} />
                    </button>
                )}
                <button onClick={onNetworkClick} className="flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-black/5 border border-black/10 hover:bg-black/10 transition-colors mx-auto shrink-0 relative mt-4">
                    <div className="w-1.5 h-1.5 rounded-full transition-all duration-1000 bg-black/20" 
                         style={{ backgroundColor: pulse ? networkInfo.color : undefined, boxShadow: pulse ? `0 0 8px ${networkInfo.color}` : 'none' }} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">
                        {address ? `${networkInfo.name} ACTIVE` : 'NO WALLET'}
                    </span>
                </button>

                <h1 className="text-7xl md:text-9xl font-aztec-serif font-black tracking-tighter leading-none mb-2 text-black transition-colors duration-500">
                    {balance}<span className="text-3xl md:text-5xl ml-3 transition-colors duration-500" style={{ color: networkInfo.color }}>{networkInfo.currency}</span>
                </h1>
                <p className="text-black/40 font-aztec-mono text-sm mb-4">{balanceFiat} USD</p>

                {address && (
                    <button onClick={copy} className="flex items-center gap-2 px-4 py-2 bg-black/5 border border-black/10 rounded-full hover:border-black/20 transition-all">
                        <span className="text-[11px] font-aztec-mono text-black/50">{truncate(address, 12)}</span>
                        {copied ? <Check size={12} className="text-[var(--aztec-orchid)]" /> : <Copy size={12} className="text-black/30" />}
                    </button>
                )}

                <button onClick={onRefresh} disabled={loading} className="mt-4 p-2 text-black/20 hover:text-black/60 transition-all">
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
            </section>

            <section className="px-8 pb-8">
                <div className="grid grid-cols-5 md:grid-cols-5 gap-3 mb-8 max-w-2xl mx-auto">
                    <ActionBtn icon={CreditCard} label="Buy" color="orchid" onClick={onBuy} disabled={!address} />
                    <ActionBtn icon={ArrowUpRight} label="Send" color="orchid" onClick={onSend} disabled={!address} />
                    <ActionBtn icon={ArrowDownLeft} label="Receive" color="aqua" onClick={onReceive} disabled={!address} />
                    <ActionBtn icon={QrIcon} label="Scan QR" color="chartreuse" onClick={onScan} disabled={!address} />
                    <ActionBtn icon={Plus} label="New Wallet" color="black" onClick={onCreate} />
                </div>

                {!address && (
                    <div className="p-6 rounded-3xl border border-black/10 bg-white flex gap-4 items-start mx-auto max-w-lg mt-12 shadow-sm">
                        <AlertTriangle size={20} className="text-black/40 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-widest text-black mb-1">Vault Not Initialized</p>
                            <p className="text-[11px] text-black/50 leading-relaxed">Click "New Wallet" to securely generate a local Ethereum/Polygon keypair, or import an existing private key in browser memory.</p>
                        </div>
                    </div>
                )}
            </section>

            <footer className="px-8 py-6 mt-auto border-t border-black/5 flex justify-center gap-10 items-center opacity-40 text-[9px] font-black uppercase tracking-widest">
                <span className="flex items-center gap-2"><Globe size={12} /> Polygon Mainnet</span>
                <span className="flex items-center gap-2"><Shield size={12} /> Secure Personal Vault</span>
                <span className="flex items-center gap-2"><Cpu size={12} /> Local Memory Architecture</span>
            </footer>
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────
//  SEND VIEW
// ─────────────────────────────────────────────────────────────────
function SendView({ prefilledAddress, onBack }: any) {
    const { sendTransaction, activeNetwork } = useWalletStore();
    const networkInfo = NETWORKS[activeNetwork as NetworkId] || NETWORKS.polygon;
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
                <Field label={`Destination Address (${networkInfo.name})`}>
                    <input
                        type="text" value={toAddress}
                        onChange={e => setToAddress(e.target.value)}
                        placeholder="0x..."
                        className="w-full bg-black/[0.02] border border-black/10 p-4 rounded-2xl font-aztec-mono text-sm outline-none transition-all placeholder:text-black/20"
                        style={{ borderColor: toAddress ? networkInfo.color : '' }}
                    />
                </Field>
                <Field label={`Amount (${networkInfo.currency})`}>
                    <div className="relative">
                        <input
                            type="number" value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="0.0"
                            className="w-full bg-black/[0.02] border border-black/10 p-4 rounded-2xl font-aztec-mono text-xl font-black outline-none transition-all pr-16 placeholder:text-black/20"
                            style={{ borderColor: amount ? networkInfo.color : '' }}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black" style={{ color: networkInfo.color }}>{networkInfo.currency}</span>
                    </div>
                </Field>
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSend}
                    disabled={isSigning || !toAddress || !amount}
                    className="w-full py-5 rounded-2xl bg-black text-white font-black text-[11px] uppercase tracking-[0.4em] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    style={{ backgroundColor: (isSigning || !toAddress || !amount) ? '#000000' : networkInfo.color }}
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
        <ModalView title="Receive Asset" subtitle="Inbound Transfer" icon={<ArrowDownLeft />} onBack={onBack}>
            <div className="flex flex-col items-center gap-6">
                <div className="p-5 bg-white rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-black/[0.04]">
                    {address ? (
                        <QRCodeSVG value={address} size={200} level="H" bgColor="#FFFFFF" fgColor="#000000" />
                    ) : (
                        <div className="w-[200px] h-[200px] flex items-center justify-center text-black/30 text-sm">No wallet yet</div>
                    )}
                </div>

                <div className="w-full">
                    <p className="text-[9px] text-black/40 uppercase tracking-widest mb-2 text-center">Your Address</p>
                    <button
                        onClick={() => { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        className="w-full flex items-center justify-between px-5 py-4 bg-black/[0.02] border border-black/10 rounded-2xl hover:border-[var(--aztec-orchid)] transition-all"
                    >
                        <code className="text-xs font-aztec-mono text-[var(--aztec-orchid)] truncate max-w-[280px]">{address || 'No wallet initialized'}</code>
                        {copied ? <Check size={14} className="text-[var(--aztec-orchid)] shrink-0" /> : <Copy size={14} className="text-black/30 shrink-0" />}
                    </button>
                </div>

                <div className="p-4 bg-black/5 border border-black/10 rounded-2xl text-[10px] text-black/40 font-aztec-mono text-center">
                    Only send compatible EVM tokens to this address.
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
                <div className="p-6 bg-black/[0.02] border border-black/10 rounded-3xl text-center">
                    <QrIcon size={48} className="mx-auto text-black/20 mb-3" />
                    <p className="text-[11px] font-aztec-mono text-black/50 mb-4">Camera scanning requires mobile browser. Paste address manually below:</p>
                </div>

                <Field label="Paste EVM Address">
                    <input
                        type="text" value={manual}
                        onChange={e => setManual(e.target.value)}
                        placeholder="0x..."
                        className="w-full bg-black/[0.02] border border-black/10 p-4 rounded-2xl font-aztec-mono text-sm focus:border-[var(--aztec-orchid)] outline-none transition-all placeholder:text-black/20"
                    />
                </Field>

                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { if (manual) { onResult(manual); toast.success('Address loaded into Send form.'); } }}
                    disabled={!manual}
                    className="w-full py-5 rounded-2xl bg-black text-white font-black text-[11px] uppercase tracking-[0.4em] hover:bg-[var(--aztec-orchid)] transition-all disabled:opacity-40"
                >
                    Load Address
                </motion.button>
            </div>
        </ModalView>
    );
}

// ─────────────────────────────────────────────────────────────────
//  BUY VIEW
// ─────────────────────────────────────────────────────────────────
function BuyView({ address, onBack }: any) {
    const { activeNetwork } = useWalletStore();
    const networkInfo = NETWORKS[activeNetwork as NetworkId] || NETWORKS.polygon;
    
    const encodedAddress = encodeURIComponent(address || '');
    const onrampUrl = `https://global.transak.com?walletAddress=${encodedAddress}&fiatCurrency=USD&cryptoCurrencyCode=${networkInfo.currency}&network=${activeNetwork}&themeColor=000000&disableWalletAddressForm=true&isFeeCalculationHidden=true`;

    return (
        <ModalView title="Buy Crypto" subtitle="Real Fiat Integration" icon={<CreditCard />} onBack={onBack}>
            <div className="flex flex-col h-full rounded-2xl overflow-hidden border border-black/10 bg-black/5 relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-black/40 pointer-events-none">
                    <RefreshCw size={24} className="animate-spin mb-4" />
                    <p className="font-black tracking-widest uppercase text-[10px]">Initializing Secure Gateway...</p>
                </div>
                <iframe 
                    src={onrampUrl} 
                    allow="camera;microphone;payment" 
                    className="w-full h-[500px] border-none bg-white relative z-10"
                    title="Fiat Onramp"
                />
            </div>
            <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-700/80 text-[10px] uppercase font-black tracking-widest text-center flex items-center justify-center gap-2">
                <Shield size={14} /> Purchases will reflect automatically in your portfolio
            </div>
        </ModalView>
    );
}

// ─────────────────────────────────────────────────────────────────
//  NETWORK CONFIGURATION VIEW
// ─────────────────────────────────────────────────────────────────
function NetworkView({ onBack }: any) {
    const { activeNetwork, activeProtocol, setNetwork, setProtocol } = useWalletStore();

    return (
        <ModalView title="Node Parameters" subtitle="API Interfacing" icon={<Globe />} onBack={onBack}>
            <div className="space-y-8">
                <Field label="Active Backbone">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(NETWORKS).map(([key, data]) => {
                            const isSelected = activeNetwork === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setNetwork(key as NetworkId)}
                                    className={`p-3 rounded-2xl border text-left transition-all ${isSelected ? 'border-transparent text-white' : 'border-black/10 bg-transparent text-black/40 hover:bg-black/5'}`}
                                    style={{ backgroundColor: isSelected ? data.color : undefined }}
                                >
                                    <p className="text-[10px] font-black uppercase tracking-wider mb-1">{data.name}</p>
                                    <p className="text-[8px] font-mono opacity-60">Layer 1/2</p>
                                </button>
                            );
                        })}
                    </div>
                </Field>

                <Field label="Protocol Selection">
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setProtocol('RPC')}
                            className={`p-4 rounded-2xl border text-center transition-all ${activeProtocol === 'RPC' ? 'border-black bg-black text-white' : 'border-black/10 bg-transparent text-black/40 hover:bg-black/5'}`}
                        >
                            <p className="text-[12px] font-black uppercase tracking-wider">JSON-RPC</p>
                            <p className="text-[9px] font-mono opacity-50 block mt-1">RESTful standard</p>
                        </button>
                        <button
                            onClick={() => setProtocol('WSS')}
                            className={`p-4 rounded-2xl border text-center transition-all ${activeProtocol === 'WSS' ? 'border-black bg-black text-white' : 'border-black/10 bg-transparent text-black/40 hover:bg-black/5'}`}
                        >
                            <p className="text-[12px] font-black uppercase tracking-wider">WebSocket</p>
                            <p className="text-[9px] font-mono opacity-50 block mt-1">Real-time Stream</p>
                        </button>
                    </div>
                </Field>
                
                <div className="p-4 bg-black/5 border border-black/10 rounded-2xl mt-4">
                    <p className="text-[10px] font-mono text-black/40">
                        {activeProtocol === 'WSS' ? 'Active WSS Endpoint: ' : 'Active RPC Node: '} <br/>
                        <span className="text-black/70 mt-1 block truncate">
                            {activeProtocol === 'WSS' ? NETWORKS[activeNetwork as NetworkId].wss : NETWORKS[activeNetwork as NetworkId].rpc}
                        </span>
                    </p>
                </div>
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
        <ModalView title={mode === 'NEW' ? 'Create Wallet' : 'Import Wallet'} subtitle="Secure Memory Keys" icon={<Key />} onBack={onBack}>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setMode('NEW')}
                        className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${mode === 'NEW' ? 'bg-[var(--aztec-orchid)] text-white border-transparent' : 'bg-black/5 border-black/10 text-black/50 hover:border-black/20'}`}
                    >
                        <Plus size={14} className="mx-auto mb-1" />
                        New Wallet
                    </button>
                    <button
                        onClick={() => setMode('IMPORT')}
                        className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${mode === 'IMPORT' ? 'bg-[var(--aztec-aqua)] text-white border-transparent' : 'bg-black/5 border-black/10 text-black/50 hover:border-black/20'}`}
                    >
                        <Key size={14} className="mx-auto mb-1" />
                        Import Key
                    </button>
                </div>

                {mode === 'NEW' ? (
                    <>
                        <div className="p-5 bg-black/[0.03] border border-black/10 rounded-2xl text-[10px] text-black/60 font-aztec-mono leading-relaxed">
                            A high-entropy cryptographic wallet will be securely generated exclusively in this local browser memory environment. By proceeding, you assert complete cryptographic ownership over your keys.
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={handleCreate}
                            className="w-full py-5 rounded-2xl bg-black text-white font-black text-[11px] uppercase tracking-[0.4em] hover:brightness-110 transition-all flex items-center justify-center gap-3"
                        >
                            <Zap size={16} /> Generate Wallet
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
                                className="w-full bg-black/[0.02] border border-black/10 p-4 rounded-2xl font-aztec-mono text-sm focus:border-[var(--aztec-aqua)] outline-none transition-all resize-none placeholder:text-black/20"
                            />
                        </Field>
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={handleImport}
                            disabled={!importKey.trim()}
                            className="w-full py-5 rounded-2xl bg-[var(--aztec-aqua)] text-white font-black text-[11px] uppercase tracking-[0.4em] hover:brightness-110 transition-all disabled:opacity-40"
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
            className="flex flex-col relative z-20"
        >
            <div className="flex items-center gap-5 px-8 pt-12 pb-8 border-b border-black/5 shrink-0">
                <button onClick={onBack} className="p-3 rounded-2xl bg-black/5 hover:bg-black/10 transition-all text-black">
                    <X size={18} />
                </button>
                <div className="w-12 h-12 rounded-2xl bg-[var(--aztec-orchid)]/10 flex items-center justify-center text-[var(--aztec-orchid)]">
                    {icon}
                </div>
                <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--aztec-orchid)]/80">{subtitle}</p>
                    <h2 className="text-2xl font-aztec-serif font-black uppercase tracking-tight text-black">{title}</h2>
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
        chartreuse: 'hover:bg-[var(--aztec-chartreuse)] hover:text-black hover:border-[var(--aztec-chartreuse)]',
        orchid: 'hover:bg-[var(--aztec-orchid)] hover:text-white border-black/5',
        aqua: 'hover:bg-[var(--aztec-aqua)] hover:text-white border-black/5',
        black: 'hover:bg-black hover:text-white border-black/5 text-black',
    };
    return (
        <motion.button
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.96 }}
            onClick={onClick}
            disabled={disabled}
            className={`flex flex-col items-center justify-center p-6 bg-black/[0.015] border border-black/5 rounded-[2rem] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group text-black/70 ${colors[color] || ''}`}
        >
            <Icon size={22} className="mb-2 opacity-70 group-hover:opacity-100" />
            <span className="text-[9px] font-black uppercase tracking-widest text-black">{label}</span>
        </motion.button>
    );
}

// SHARED: FORM FIELD
function Field({ label, children }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-black/50">{label}</label>
            {children}
        </div>
    );
}
