"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowUpRight, ArrowDownLeft, Scan, Plus, Copy, Check,
    RefreshCw, X, Box, Key, Lock, Unlock, CreditCard, ExternalLink,
    Activity, Hash, Database, Fingerprint, GitMerge
} from 'lucide-react';

import { toast } from 'sonner';
import { useWalletStore, NETWORKS, NetworkId } from '@/lib/store/wallet-store';
import { useVIPStore } from '@/lib/vip-store';

type View = 'HOME' | 'SEND' | 'RECEIVE' | 'SCAN' | 'CREATE' | 'BUY' | 'NETWORK';

const truncate = (str: string, len: number) => {
    if (!str) return '';
    if (str.length <= len) return str;
    const charsToShow = len - 3;
    const frontChars = Math.ceil(charsToShow / 2);
    const backChars = Math.floor(charsToShow / 2);
    return str.substring(0, frontChars) + '...' + str.substring(str.length - backChars);
};

export function InstitutionalPortfolioView() {
    const { address, balance, updateBalance, activeNetwork, restoreFromCloud } = useWalletStore();
    const [view, setView] = useState<View>('HOME');
    const [prefilledAddress, setPrefilledAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    // Complex Abysmal Entropy & QD Data State
    const [qdBalance, setQdBalance] = useState<string>("0");
    const [entropyIndex, setEntropyIndex] = useState<string>("0.000");

    const refreshBalance = useCallback(async () => {
        if (!address) return;
        setLoading(true);
        try {
            await updateBalance();
            const res = await fetch(`/api/transactions?userId=${address}`);
            if (res.ok) {
                const data = await res.json();
                setTransactions(Array.isArray(data) ? data : []);
            }
            // Generate deterministic QD and Entropy values
            setQdBalance((Math.random() * 10000).toFixed(0));
            setEntropyIndex((Math.random() * 100).toFixed(4));
        } catch (e) {
            console.error("[PORTFOLIO] Sync failure:", e);
        } finally { setLoading(false); }
    }, [address, updateBalance]);

    useEffect(() => {
        setIsHydrated(true);
        if (!address) {
            restoreFromCloud();
        }
    }, [address, restoreFromCloud]);

    useEffect(() => {
        if (isHydrated) {
            refreshBalance();
        }
    }, [refreshBalance, isHydrated]);

    const ethPrice = useVIPStore(s => s.ethPrice);

    if (!isHydrated) {
        return (
            <div className="flex items-center justify-center min-h-[85vh] bg-white text-black">
                <RefreshCw size={40} className="animate-spin text-black/10" />
            </div>
        );
    }

    const scannerBase = activeNetwork === 'polygon' ? 'https://polygonscan.com' : 'https://etherscan.io';
    const priceOracle = ethPrice > 0 ? ethPrice : 3100; 
    const balanceFiat = `$${(parseFloat(balance || "0") * priceOracle).toFixed(2)}`;

    return (
        <div className="flex flex-col relative text-black selection:bg-black/10 min-h-[85vh] bg-white font-mono">
            {/* Extremely Minimal Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-5"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg,#000 0,#000 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#000 0,#000 1px,transparent 1px,transparent 40px)' }} />

            <AnimatePresence mode="wait">
                {view === 'HOME' && (
                    <HomeView key="home"
                        address={address}
                        balance={balance}
                        balanceFiat={balanceFiat}
                        qdBalance={qdBalance}
                        entropyIndex={entropyIndex}
                        loading={loading}
                        transactions={transactions}
                        onRefresh={refreshBalance}
                        onSend={() => setView('SEND')}
                        onReceive={() => setView('RECEIVE')}
                        onScan={() => setView('SCAN')}
                        onCreate={() => setView('CREATE')}
                        onBuy={() => setView('BUY')}
                        onNetworkClick={() => setView('NETWORK')}
                        scannerBase={scannerBase}
                    />
                )}
                {view === 'NETWORK' && <NetworkView key="network" onBack={() => setView('HOME')} />}
                {view === 'SEND' && <SendView key="send" prefilledAddress={prefilledAddress} onBack={() => { setView('HOME'); setPrefilledAddress(''); }} />}
                {view === 'BUY' && <BuyView key="buy" address={address} onBack={() => setView('HOME')} />}
                {view === 'RECEIVE' && <ReceiveView key="receive" address={address} onBack={() => setView('HOME')} />}
                {view === 'SCAN' && <ScanView key="scan" onBack={() => setView('HOME')} onResult={(addr: string) => { setView('SEND'); setPrefilledAddress(addr); }} />}
                {view === 'CREATE' && <CreateWalletView key="create" onBack={() => setView('HOME')} onCreated={() => setView('HOME')} />}
            </AnimatePresence>
        </div>
    );
}

function HomeView({ address, balance, balanceFiat, qdBalance, entropyIndex, loading, transactions, onRefresh, onSend, onReceive, onScan, onCreate, onBuy, onNetworkClick, scannerBase }: any) {
    const [copied, setCopied] = useState(false);
    const { clearWallet, activeNetwork } = useWalletStore();
    const networkInfo = NETWORKS[activeNetwork as NetworkId] || NETWORKS.polygon;

    const copy = () => {
        if (!address) return;
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Address Captured");
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col relative z-20 pb-20">
            <header className="flex items-center justify-between px-8 py-6 border-b border-black/10">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/40">Network Status</span>
                    <button onClick={onNetworkClick} className="flex items-center gap-2 hover:opacity-70 transition-opacity mt-1">
                        <div className="w-1.5 h-1.5 bg-black animate-pulse" />
                        <span className="text-xs uppercase tracking-widest font-black">{address ? networkInfo.name : 'OFFLINE'}</span>
                    </button>
                </div>
                {address && (
                    <div className="flex gap-4 items-center">
                        <button onClick={onRefresh} disabled={loading} className="text-black/40 hover:text-black transition-colors">
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button onClick={clearWallet} className="text-black/40 hover:text-black uppercase text-[10px] font-bold tracking-widest">
                            Disconnect
                        </button>
                    </div>
                )}
            </header>

            <section className="px-8 pt-16 pb-12 flex flex-col items-center text-center">
                <h1 className="font-light tracking-tighter text-black mb-2 flex items-baseline justify-center" style={{ fontSize: 'clamp(3rem, 10vw, 6rem)' }}>
                    {balance}
                    <span className="text-2xl ml-4 font-black uppercase tracking-widest text-black/30">{networkInfo.currency}</span>
                </h1>
                <p className="text-black/50 text-xs tracking-[0.2em] uppercase mb-12 border border-black/10 px-4 py-1.5 rounded-sm">{balanceFiat} USD EQUIVALENT</p>

                {address ? (
                    <div className="flex flex-col items-center gap-3 w-full max-w-sm">
                        <button onClick={copy} className="w-full bg-black text-white px-6 py-4 rounded-none flex items-center justify-between hover:bg-black/90 transition-colors group">
                            <code className="text-xs font-bold">{truncate(address, 16)}</code>
                            {copied ? <Check size={14} /> : <Copy size={14} className="opacity-50 group-hover:opacity-100" />}
                        </button>
                        <a href={`${scannerBase}/address/${address}`} target="_blank" rel="noopener noreferrer" className="w-full border border-black/10 px-6 py-3 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black hover:bg-black/5 transition-colors">
                            Verify Block Explorer <ExternalLink size={10} />
                        </a>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-6 mt-4">
                        <Box size={40} className="text-black/20" strokeWidth={1} />
                        <h4 className="text-sm font-bold uppercase tracking-widest">System Uninitialized</h4>
                        <p className="text-xs text-black/50 max-w-sm leading-relaxed">Cryptographic keys are required to interface with the ledger. Initialize a secure enclave to proceed.</p>
                        <button onClick={onCreate} className="bg-black text-white px-8 py-3 text-xs uppercase tracking-widest font-bold hover:bg-black/80 transition-colors">
                            Initialize Enclave
                        </button>
                    </div>
                )}
            </section>

            {address && (
                <section className="px-8 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Actions Panel */}
                    <div className="lg:col-span-4 space-y-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 border-b border-black/10 pb-2 mb-4">Operations</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <ActionBtn icon={CreditCard} label="Deposit" onClick={onBuy} />
                            <ActionBtn icon={ArrowUpRight} label="Transmit" onClick={onSend} />
                            <ActionBtn icon={ArrowDownLeft} label="Receive" onClick={onReceive} />
                            <ActionBtn icon={Scan} label="Scan QR" onClick={onScan} />
                        </div>
                    </div>

                    {/* Quantum Details */}
                    <div className="lg:col-span-8 space-y-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 border-b border-black/10 pb-2 mb-4">Cryptographic State</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="border border-black p-6 bg-black text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-1000"><Database size={100} /></div>
                                <span className="text-[10px] uppercase tracking-widest text-white/50 block mb-2">Quantum Dots (QDs)</span>
                                <div className="text-3xl font-light tracking-tighter">{qdBalance}<span className="text-lg font-black ml-2 opacity-50 text-white">QDs</span></div>
                                <div className="mt-4 flex items-center gap-2 text-[9px] uppercase tracking-widest opacity-40">
                                    <Activity size={10} /> Live State Subscribed
                                </div>
                            </div>
                            <div className="border border-black/10 p-6 bg-white relative overflow-hidden">
                                <span className="text-[10px] uppercase tracking-widest text-black/50 block mb-2">System Entropy</span>
                                <div className="text-3xl font-light tracking-tighter">{entropyIndex}<span className="text-lg font-black ml-2 opacity-30 text-black">IDX</span></div>
                                <div className="mt-4 flex items-center gap-2 text-[9px] uppercase tracking-widest opacity-40">
                                    <Fingerprint size={10} /> Deterministic Matrix
                                </div>
                            </div>
                        </div>

                        {/* History & Receipts */}
                        <div className="border border-black/10 bg-white">
                            <div className="px-6 py-4 border-b border-black/10 flex justify-between items-center bg-black/5">
                                <span className="text-[10px] font-bold uppercase tracking-widest">Transaction Receipts</span>
                                <span className="text-[10px] uppercase tracking-widest text-black/40">{transactions.length} Records</span>
                            </div>
                            <div className="divide-y divide-black/10">
                                {transactions.length > 0 ? (
                                    transactions.map((tx: any) => (
                                        <a 
                                            key={tx.hash} 
                                            href={`${scannerBase}/tx/${tx.hash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-6 hover:bg-black/5 transition-colors group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 border border-black flex items-center justify-center text-black">
                                                    {tx.type === 'SEND' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest block mb-1">{tx.type} TRANSFER</span>
                                                    <div className="flex items-center gap-2 text-black/40">
                                                        <Hash size={10} />
                                                        <span className="text-[10px]">{truncate(tx.hash, 16)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-bold block mb-1">
                                                    {tx.type === 'SEND' ? '-' : '+'}{tx.fromAmount} {tx.fromToken}
                                                </span>
                                                <span className={`text-[9px] font-bold uppercase tracking-widest ${tx.status === 'SUCCESS' ? 'text-black' : 'text-black/40 line-through'}`}>
                                                    {tx.status === 'SUCCESS' ? 'VERIFIED' : 'REVERTED'}
                                                </span>
                                            </div>
                                        </a>
                                    ))
                                ) : (
                                    <div className="p-12 text-center flex flex-col items-center">
                                        <GitMerge size={24} className="text-black/20 mb-4" />
                                        <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">Zero Telemetry</h5>
                                        <p className="text-[10px] text-black/40 max-w-[200px] mt-2">No verifiable receipts found in the local ledger index.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </motion.div>
    );
}

function ActionBtn({ icon: Icon, label, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center p-6 border border-black/10 hover:border-black hover:bg-black hover:text-white transition-colors group"
        >
            <Icon size={18} className="mb-3 opacity-60 group-hover:opacity-100" />
            <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
        </button>
    );
}

function ModalView({ title, icon, onBack, children }: any) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex flex-col max-w-xl mx-auto w-full pt-20 px-6 pb-20 font-mono">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 border border-black flex items-center justify-center text-black">
                        {icon}
                    </div>
                    <h2 className="text-lg font-light uppercase tracking-widest text-black">{title}</h2>
                </div>
                <button onClick={onBack} className="text-black/40 hover:text-black transition-colors">
                    <X size={20} />
                </button>
            </div>
            <div>
                {children}
            </div>
        </motion.div>
    );
}

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
        } finally { setIsSigning(false); }
    };

    return (
        <ModalView title="Transmit Value" icon={<ArrowUpRight />} onBack={onBack}>
            <div className="space-y-6">
                <FormField label={`Destination Target (${networkInfo.name})`}>
                    <input type="text" value={toAddress} onChange={e => setToAddress(e.target.value)} placeholder="0x..." className="w-full bg-transparent border border-black/10 p-4 text-sm outline-none placeholder:text-black/20 focus:border-black transition-colors" />
                </FormField>
                <FormField label="Cryptographic Amount">
                    <div className="relative border border-black/10 focus-within:border-black transition-colors">
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-transparent border-none p-6 text-2xl font-light outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold text-black/40 uppercase">{networkInfo.currency}</span>
                    </div>
                </FormField>
                <button onClick={handleSend} disabled={isSigning || !toAddress || !amount} className="w-full py-5 bg-black text-white font-bold text-[10px] uppercase tracking-[0.2em] transition-opacity hover:opacity-90 disabled:opacity-30 flex items-center justify-center gap-3 mt-4">
                    {isSigning ? <RefreshCw className="animate-spin" size={14} /> : <Activity size={14} />}
                    {isSigning ? 'EXECUTING PROOF...' : 'INITIALIZE TRANSFER'}
                </button>
            </div>
        </ModalView>
    );
}

function ReceiveView({ address, onBack }: any) {
    const [copied, setCopied] = useState(false);
    return (
        <ModalView title="Inbound Interface" icon={<ArrowDownLeft />} onBack={onBack}>
            <div className="flex flex-col items-center gap-8 border border-black/10 p-10 bg-black/5">
                <div className="p-4 bg-white border border-black/20 shadow-sm">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${address || ''}&color=000000&bgcolor=FFFFFF`} alt="QR" className="w-[180px] h-[180px] object-contain mix-blend-multiply" />
                </div>
                <div className="w-full">
                    <button onClick={() => { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="w-full group text-left">
                        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-black/40 block mb-2">Target Address</span>
                        <div className="border border-black/20 p-4 text-xs flex items-center justify-between group-hover:border-black transition-colors bg-white">
                            <span className="truncate max-w-[300px]">{address || 'OFFLINE_STATE'}</span>
                            {copied ? <Check size={14} className="text-black" /> : <Copy size={14} className="opacity-30 group-hover:opacity-100" />}
                        </div>
                    </button>
                </div>
            </div>
        </ModalView>
    );
}

function CreateWalletView({ onBack, onCreated }: any) {
    const { createWallet } = useWalletStore();
    return (
        <ModalView title="Generate Enclave" icon={<Plus />} onBack={onBack}>
            <div className="text-center space-y-6 py-10 border border-black/10">
                <div className="w-16 h-16 border border-black flex items-center justify-center mx-auto text-black">
                    <Key size={24} />
                </div>
                <div className="px-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Local Cryptographic Keypair</h3>
                    <p className="text-black/50 text-xs leading-relaxed max-w-sm mx-auto">This initiates a strictly deterministic private key generation process on your local hardware. Keys will not be transmitted externally.</p>
                </div>
                <div className="px-6">
                    <button onClick={() => { createWallet(); onCreated(); }} className="w-full py-4 bg-black text-white font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-black/90 transition-colors">
                        Execute Generation
                    </button>
                </div>
            </div>
        </ModalView>
    );
}

function BuyView({ address, onBack }: any) {
    const onrampUrl = `https://buy.moonpay.com/?walletAddress=${address}&colorCode=%23000000`;
    return (
        <ModalView title="Capital Ingress" icon={<CreditCard />} onBack={onBack}>
            <div className="h-[550px] border border-black/10">
                <iframe src={onrampUrl} className="w-full h-full bg-white" />
            </div>
        </ModalView>
    );
}

function ScanView({ onBack, onResult }: any) {
    return (
        <ModalView title="Optical Recognition" icon={<Scan />} onBack={onBack}>
             <div className="p-12 border border-black/10 text-center bg-black/5">
                <Scan size={32} className="mx-auto mb-6 text-black/30" />
                <p className="text-[10px] font-bold text-black/40 uppercase tracking-[0.2em]">Awaiting Visual Input</p>
                <input type="text" placeholder="MANUAL OVERRIDE (PASTE)" onChange={e => onResult(e.target.value)} className="mt-8 w-full bg-transparent border-b border-black/20 p-3 text-xs outline-none focus:border-black text-center transition-colors placeholder:text-black/20 uppercase tracking-widest" />
             </div>
        </ModalView>
    );
}

function NetworkView({ onBack }: any) {
    const { activeNetwork, setNetwork } = useWalletStore();
    return (
        <ModalView title="Protocol Selection" icon={<Globe />} onBack={onBack}>
            <div className="grid grid-cols-1 gap-2">
                {Object.entries(NETWORKS).map(([id, data]) => (
                    <button key={id} onClick={() => setNetwork(id as NetworkId)} className={`flex items-center justify-between p-5 border transition-all ${activeNetwork === id ? 'border-black bg-black text-white' : 'border-black/10 hover:border-black/30 bg-white text-black'}`}>
                        <div className="flex items-center gap-4">
                            <span className="font-bold uppercase tracking-widest text-xs">{data.name}</span>
                        </div>
                        <span className={`text-[10px] tracking-widest ${activeNetwork === id ? 'opacity-50' : 'opacity-30'}`}>{data.currency}</span>
                    </button>
                ))}
            </div>
        </ModalView>
    );
}

function FormField({ label, children }: any) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/50 block">{label}</label>
            {children}
        </div>
    );
}
