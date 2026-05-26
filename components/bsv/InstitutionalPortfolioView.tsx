"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowUpRight, ArrowDownLeft, Scan, Plus, Copy, Check,
    RefreshCw, X, Box, Key, Lock, Unlock, CreditCard, ExternalLink,
    Activity, Hash, Database, Fingerprint, GitMerge, Globe, Settings, ChevronRight
} from 'lucide-react';

import { toast } from 'sonner';
import { useWalletStore, NETWORKS, NetworkId } from '@/lib/store/wallet-store';
import { useVIPStore } from '@/lib/vip-store';
import { formatEther } from 'viem';
import { SettingsView } from '@/components/settings/SettingsView';
import { ethers } from 'ethers';
import { useSystemSignOut } from '@/hooks/useSystemSignOut';

type View = 'HOME' | 'SEND' | 'RECEIVE' | 'SCAN' | 'CREATE' | 'BUY' | 'NETWORK' | 'SETTINGS' | 'SWAP' | 'BRIDGE' | 'ACCOUNTS';

const truncate = (str: string, len: number) => {
    if (!str) return '';
    if (str.length <= len) return str;
    const charsToShow = len - 3;
    const frontChars = Math.ceil(charsToShow / 2);
    const backChars = Math.floor(charsToShow / 2);
    return str.substring(0, frontChars) + '...' + str.substring(str.length - backChars);
};

export function InstitutionalPortfolioView() {
    const { address, balance, updateBalance, activeNetwork, restoreFromCloud, tokenBalances } = useWalletStore();
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
            // Strict On-Chain execution. No random simulations allowed.
            setQdBalance("0");
            setEntropyIndex("0.000");
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
                        tokenBalances={tokenBalances}
                        onRefresh={refreshBalance}
                        onSend={() => setView('SEND')}
                        onReceive={() => setView('RECEIVE')}
                        onScan={() => setView('SCAN')}
                        onCreate={() => setView('CREATE')}
                        onBuy={() => setView('BUY')}
                        onSwap={() => setView('SWAP')}
                        onBridge={() => setView('BRIDGE')}
                        onNetworkClick={() => setView('NETWORK')}
                        onSettingsClick={() => setView('SETTINGS')}
                        onAccountsClick={() => setView('ACCOUNTS')}
                        scannerBase={scannerBase}
                    />
                )}
                {view === 'NETWORK' && <NetworkView key="network" onBack={() => setView('HOME')} />}
                {view === 'SETTINGS' && <SettingsView key="settings" onBack={() => setView('HOME')} />}
                {view === 'ACCOUNTS' && <AccountsView key="accounts" onBack={() => setView('HOME')} address={address} />}
                {view === 'SEND' && <SendView key="send" prefilledAddress={prefilledAddress} onBack={() => { setView('HOME'); setPrefilledAddress(''); }} />}
                {view === 'BUY' && <BuyView key="buy" address={address} onBack={() => setView('HOME')} />}
                {view === 'SWAP' && <SwapView key="swap" address={address} onBack={() => setView('HOME')} />}
                {view === 'BRIDGE' && <BridgeView key="bridge" address={address} onBack={() => setView('HOME')} />}
                {view === 'RECEIVE' && <ReceiveView key="receive" address={address} onBack={() => setView('HOME')} />}
                {view === 'SCAN' && <ScanView key="scan" onBack={() => setView('HOME')} onResult={(addr: string) => { setView('SEND'); setPrefilledAddress(addr); }} />}
                {view === 'CREATE' && <CreateWalletView key="create" onBack={() => setView('HOME')} onCreated={() => setView('HOME')} />}
            </AnimatePresence>
        </div>
    );
}

function HomeView({ address, balance, balanceFiat, qdBalance, entropyIndex, loading, transactions, tokenBalances, onRefresh, onSend, onReceive, onScan, onCreate, onBuy, onSwap, onBridge, onNetworkClick, onSettingsClick, onAccountsClick, scannerBase }: any) {
    const [copied, setCopied] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [activeTab, setActiveTab] = useState<'TOKENS'|'NFTS'|'ACTIVITY'>('TOKENS');
    const { clearWallet, activeNetwork } = useWalletStore();
    const networkInfo = NETWORKS[activeNetwork as NetworkId] || NETWORKS.polygon;
    const { nuclearDisconnect } = useSystemSignOut();
    
    const handleDisconnect = async () => {
        setIsDisconnecting(true);
        await nuclearDisconnect();
    };

    const copy = () => {
        if (!address) return;
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Address Captured");
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col relative z-20 pb-20">
            {isDisconnecting && (
                <div className="fixed inset-0 z-[9999] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4"></div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/60">Purging Session...</p>
                </div>
            )}
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
                        <button onClick={onSettingsClick} className="text-black/40 hover:text-black transition-colors" title="Settings">
                            <Settings size={14} />
                        </button>
                        <button onClick={onAccountsClick} className="flex items-center gap-2 border border-black/10 px-3 py-1.5 rounded-full hover:bg-black/5 transition-colors group">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-black to-gray-400" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-black/60 group-hover:text-black">Account 1</span>
                            <ChevronRight size={12} className="text-black/40 rotate-90" />
                        </button>
                        <button onClick={handleDisconnect} className="text-black/40 hover:text-black uppercase text-[10px] font-bold tracking-widest ml-2">
                            Disconnect
                        </button>
                    </div>
                )}
            </header>

            <section className="px-8 pt-16 pb-12 flex flex-col items-center text-center">
                <div className="relative inline-flex items-baseline justify-center mb-2">
                    <h1 className="font-light tracking-tighter text-black" style={{ fontSize: 'clamp(3rem, 10vw, 6rem)' }}>
                        {balance}
                    </h1>
                    <span className="absolute left-full text-2xl ml-4 font-black uppercase tracking-widest text-black/30 bottom-6">{networkInfo.currency}</span>
                </div>
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
                        <p className="text-xs text-black/50 max-w-sm leading-relaxed">Cryptographic keys are required to interface with the ledger. Initialize a Wallet to proceed.</p>
                        <button onClick={onCreate} className="bg-black text-white px-8 py-3 text-xs uppercase tracking-widest font-bold hover:bg-black/80 transition-colors">
                            Create Wallet
                        </button>
                    </div>
                )}
            </section>

            {address && (
                <section className="px-8 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Actions Panel */}
                    <div className="lg:col-span-4 space-y-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 border-b border-black/10 pb-2 mb-4">Operations</h4>
                        <div className="grid grid-cols-3 gap-2">
                            <ActionBtn icon={CreditCard} label="Deposit" onClick={onBuy} />
                            <ActionBtn icon={RefreshCw} label="Swap" onClick={onSwap} />
                            <ActionBtn icon={GitMerge} label="Bridge" onClick={onBridge} />
                            <ActionBtn icon={ArrowUpRight} label="Send" onClick={onSend} />
                            <ActionBtn icon={ArrowDownLeft} label="Receive" onClick={onReceive} />
                            <ActionBtn icon={Scan} label="Scan" onClick={onScan} />
                        </div>
                    </div>

                    {/* Quantum Details */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="flex items-center gap-4 border-b border-black/10">
                            {['TOKENS', 'NFTS', 'ACTIVITY'].map(t => (
                                <button 
                                    key={t}
                                    onClick={() => setActiveTab(t as any)}
                                    className={`pb-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === t ? 'text-black border-b-2 border-black' : 'text-black/40 hover:text-black/70'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                        
                        {activeTab === 'TOKENS' && (
                            <div className="border border-black/10 bg-white flex flex-col min-h-[300px]">
                                <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto">
                                    {tokenBalances && tokenBalances.length > 0 ? (
                                        tokenBalances.map((tb: any) => (
                                            <div key={tb.address} className="flex justify-between items-center text-sm font-mono border-b border-black/5 pb-3 pt-1 last:border-0 hover:bg-black/5 px-2 transition-colors cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-[10px] font-bold">{tb.symbol[0]}</div>
                                                    <span className="font-bold">{tb.symbol}</span>
                                                </div>
                                                <span className="font-bold">{tb.balance}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                            <Database size={24} className="text-black/20 mb-4" />
                                            <p className="text-xs text-black/40 uppercase tracking-widest font-bold mb-2">No Tokens Found</p>
                                            <p className="text-[10px] text-black/30">Your ERC-20 assets will appear here.</p>
                                        </div>
                                    )}
                                </div>
                                <button onClick={onSettingsClick} className="w-full mt-auto border-t border-black/10 py-4 text-[10px] font-bold uppercase tracking-widest text-black/60 hover:bg-black hover:text-white transition-colors">
                                    + Import Tokens
                                </button>
                            </div>
                        )}

                        {activeTab === 'NFTS' && (
                            <div className="border border-black/10 bg-white flex flex-col min-h-[300px] items-center justify-center p-8 text-center">
                                <Box size={32} className="text-black/20 mb-4" />
                                <p className="text-xs text-black/40 uppercase tracking-widest font-bold mb-2">No NFTs Found</p>
                                <p className="text-[10px] text-black/30 mb-6">Learn more about non-fungible tokens and how to acquire them.</p>
                                <button className="border border-black text-black px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                                    Import NFT
                                </button>
                            </div>
                        )}

                        {activeTab === 'ACTIVITY' && (
                            <div className="border border-black/10 bg-white min-h-[300px]">
                                <div className="divide-y divide-black/10">
                                    {transactions.length > 0 ? (
                                        transactions.map((tx: any) => (
                                            <a 
                                                key={tx.hash} 
                                                href={`${scannerBase}/tx/${tx.hash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-4 hover:bg-black/5 transition-colors group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full border border-black flex items-center justify-center text-black bg-white">
                                                        {tx.type === 'SEND' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest block mb-1">{tx.type}</span>
                                                        <span className={`text-[9px] font-bold uppercase tracking-widest ${tx.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>
                                                            {tx.status === 'SUCCESS' ? 'Confirmed' : 'Failed'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs font-bold block mb-1">
                                                        {tx.type === 'SEND' ? '-' : '+'}{tx.fromAmount} {tx.fromToken}
                                                    </span>
                                                    <div className="flex items-center justify-end gap-1 text-black/40">
                                                        <span className="text-[10px]">{truncate(tx.hash, 12)}</span>
                                                        <ExternalLink size={10} />
                                                    </div>
                                                </div>
                                            </a>
                                        ))
                                    ) : (
                                        <div className="p-16 text-center flex flex-col items-center">
                                            <Activity size={24} className="text-black/20 mb-4" />
                                            <p className="text-xs text-black/40 uppercase tracking-widest font-bold mb-2">No Transactions</p>
                                            <p className="text-[10px] text-black/40 max-w-[200px]">Your activity will appear here when you interact with the network.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex flex-col max-w-xl mx-auto w-full pt-8 px-6 pb-20 font-mono min-h-full flex-1">
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
            <div className="flex-1 flex flex-col min-h-0">
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
    const [gasPriority, setGasPriority] = useState<'low'|'medium'|'high'>('medium');
    const [isSigning, setIsSigning] = useState(false);

    const handleSend = async () => {
        if (!toAddress || !amount) return;
        setIsSigning(true);
        try {
            let finalAddress = toAddress;
            // ENS Resolution Simulation/Actual On-Chain
            if (toAddress.endsWith('.eth')) {
                toast.loading(`Resolving ${toAddress}...`, { id: 'ens-resolve' });
                const mainnetProvider = new ethers.JsonRpcProvider(NETWORKS.ethereum.rpc);
                const resolved = await mainnetProvider.resolveName(toAddress);
                if (resolved) {
                    finalAddress = resolved;
                    toast.success(`Resolved to ${resolved.slice(0,8)}...`, { id: 'ens-resolve' });
                } else {
                    toast.error(`Could not resolve ${toAddress}`, { id: 'ens-resolve' });
                    setIsSigning(false);
                    return;
                }
            }

            const txHash = await sendTransaction(finalAddress, amount, gasPriority);
            if (txHash) {
                onBack();
            }
        } finally { setIsSigning(false); }
    };

    return (
        <ModalView title="Transmit Value" icon={<ArrowUpRight />} onBack={onBack}>
            <div className="space-y-6">
                <FormField label={`Destination Target (0x... or .eth)`}>
                    <input type="text" value={toAddress} onChange={e => setToAddress(e.target.value)} placeholder="0x... or vitalik.eth" className="w-full bg-transparent border border-black/10 p-4 text-sm outline-none placeholder:text-black/20 focus:border-black transition-colors" />
                </FormField>
                <FormField label="Cryptographic Amount">
                    <div className="relative border border-black/10 focus-within:border-black transition-colors">
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-transparent border-none p-6 text-2xl font-light outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold text-black/40 uppercase">{networkInfo.currency}</span>
                    </div>
                </FormField>
                
                <FormField label="EIP-1559 Fee Market Priority">
                    <div className="grid grid-cols-3 gap-2">
                        {(['low', 'medium', 'high'] as const).map(p => (
                            <button
                                key={p}
                                onClick={() => setGasPriority(p)}
                                className={`py-3 text-[10px] uppercase font-bold tracking-widest border transition-all ${
                                    gasPriority === p 
                                        ? 'border-black bg-black text-white' 
                                        : 'border-black/10 text-black/40 hover:border-black/30'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
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
    const { createWallet, importWallet } = useWalletStore();
    const [mode, setMode] = useState<'CREATE' | 'IMPORT'>('CREATE');
    const [privateKeyInput, setPrivateKeyInput] = useState('');

    const handleImport = () => {
        if (!privateKeyInput) return;
        try {
            const success = importWallet(privateKeyInput);
            if (success) {
                toast.success("Wallet Imported Successfully");
                onCreated();
            } else {
                toast.error("Invalid Private Key format");
            }
        } catch (e) {
            toast.error("Failed to import wallet");
        }
    };

    return (
        <ModalView title="Account Management" icon={<Key />} onBack={onBack}>
            <div className="flex border-b border-black/10 mb-6">
                <button onClick={() => setMode('CREATE')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${mode === 'CREATE' ? 'border-b-2 border-black text-black' : 'text-black/40 hover:text-black/70'}`}>Create New</button>
                <button onClick={() => setMode('IMPORT')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${mode === 'IMPORT' ? 'border-b-2 border-black text-black' : 'text-black/40 hover:text-black/70'}`}>Import Existing</button>
            </div>

            {mode === 'CREATE' ? (
                <div className="text-center space-y-6 py-6">
                    <div className="w-16 h-16 border border-black flex items-center justify-center mx-auto text-black">
                        <Plus size={24} />
                    </div>
                    <div className="px-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Generate New Seed</h3>
                        <p className="text-black/50 text-xs leading-relaxed max-w-sm mx-auto">This initiates a deterministic private key generation on your local hardware. Keys are not transmitted externally.</p>
                    </div>
                    <div className="px-6">
                        <button onClick={() => { createWallet(); onCreated(); }} className="w-full py-4 bg-black text-white font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-black/90 transition-colors">
                            Execute Generation
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center space-y-6 py-6">
                    <div className="px-6 text-left">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-black/50 block mb-2">Private Key String</label>
                        <input 
                            type="password" 
                            value={privateKeyInput} 
                            onChange={e => setPrivateKeyInput(e.target.value)} 
                            placeholder="0x..." 
                            className="w-full border border-black/20 p-4 text-sm font-mono outline-none focus:border-black transition-colors" 
                        />
                        <p className="text-[10px] text-black/40 mt-3">Imported accounts will not be associated with your originally generated secret recovery phrase.</p>
                    </div>
                    <div className="px-6">
                        <button onClick={handleImport} disabled={!privateKeyInput} className="w-full py-4 bg-black text-white font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-black/90 disabled:opacity-30 transition-colors">
                            Import Account
                        </button>
                    </div>
                </div>
            )}
        </ModalView>
    );
}

function BuyView({ address, onBack }: any) {
    const onrampUrl = `https://buy.moonpay.com/?walletAddress=${address}&colorCode=%23000000`;
    return (
        <ModalView title="Capital Ingress" icon={<CreditCard />} onBack={onBack}>
            <div className="w-full h-[70vh] min-h-[500px] border border-black/10">
                <iframe src={onrampUrl} className="w-full h-full bg-white" />
            </div>
        </ModalView>
    );
}

function SwapView({ address, onBack }: any) {
    // Real Uniswap V3 Interface - no mock, no simulation
    const swapUrl = `https://app.uniswap.org/swap?theme=light&exactField=input&exactAmount=&inputCurrency=ETH&outputCurrency=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`;

    return (
        <ModalView title="Token Swap" icon={<RefreshCw />} onBack={onBack}>
            <div className="w-full rounded-none border border-black/10 flex-1 min-h-[600px] flex flex-col">
                <iframe
                    src={swapUrl}
                    className="flex-1 w-full"
                    style={{ border: 'none', display: 'block' }}
                    title="Uniswap Swap Interface"
                    allow="clipboard-write"
                />
            </div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-black/30 text-center mt-3">
                Live via Uniswap Protocol · All swaps execute on-chain
            </p>
        </ModalView>
    );
}

function BridgeView({ onBack }: any) {
    // Real Li.Fi Jumper cross-chain bridge - no mock, no simulation
    return (
        <ModalView title="Cross-Chain Bridge" icon={<GitMerge />} onBack={onBack}>
            <div className="w-full rounded-none border border-black/10 flex-1 min-h-[650px] flex flex-col">
                <iframe
                    src="https://jumper.exchange/?theme=light"
                    className="flex-1 w-full"
                    style={{ border: 'none', display: 'block' }}
                    title="Li.Fi Jumper Bridge Interface"
                    allow="clipboard-write"
                />
            </div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-black/30 text-center mt-3">
                Live via Li.Fi Protocol · Real cross-chain routes · Fees calculated on-chain
            </p>
        </ModalView>
    );
}

function ScanView({ onBack, onResult }: any) {
    const scannerRef = useRef<any>(null);
    const [scannerStarted, setScannerStarted] = useState(false);
    const [manualInput, setManualInput] = useState('');
    const [scanError, setScanError] = useState<string | null>(null);

    useEffect(() => {
        let html5QrCode: any;
        const startScanner = async () => {
            try {
                const { Html5Qrcode } = await import('html5-qrcode');
                html5QrCode = new Html5Qrcode('qr-reader-portfolio');
                scannerRef.current = html5QrCode;
                await html5QrCode.start(
                    { facingMode: 'environment' },
                    { fps: 10, qrbox: { width: 220, height: 220 } },
                    (decodedText: string) => {
                        html5QrCode.stop();
                        const addr = decodedText.startsWith('ethereum:') ? decodedText.replace('ethereum:', '').split('@')[0].split('?')[0] : decodedText;
                        onResult(addr);
                    },
                    () => {}
                );
                setScannerStarted(true);
            } catch (err: any) {
                setScanError(err?.message || 'Camera access denied');
            }
        };
        startScanner();
        return () => { scannerRef.current?.stop?.().catch(() => {}); };
    }, [onResult]);

    const handleManual = () => {
        if (manualInput.trim()) onResult(manualInput.trim());
    };

    return (
        <ModalView title="QR Scanner" icon={<Scan />} onBack={onBack}>
            <div className="space-y-4">
                <div id="qr-reader-portfolio" className="w-full border border-black/10 bg-black/5 overflow-hidden" style={{ minHeight: 260 }} />
                {!scannerStarted && !scanError && (
                    <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest text-center">Requesting camera access...</p>
                )}
                {scanError && (
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest text-center">{scanError}</p>
                )}
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={manualInput}
                        onChange={e => setManualInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleManual()}
                        placeholder="Paste address manually..."
                        className="flex-1 bg-transparent border-b border-black/20 p-3 text-xs outline-none focus:border-black transition-colors placeholder:text-black/20 font-mono"
                    />
                    <button onClick={handleManual} className="px-4 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black/80 transition-colors">
                        Go
                    </button>
                </div>
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

function AccountsView({ onBack, address }: any) {
    return (
        <ModalView title="Account Selection" icon={<Key />} onBack={onBack}>
            <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-4 border border-black bg-black text-white transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-white/20 to-white/60 border border-white/20" />
                        <div className="text-left">
                            <div className="text-[10px] font-bold uppercase tracking-widest">Account 1</div>
                            <div className="text-[9px] font-mono opacity-50">{truncate(address || '0x0000000000000000', 12)}</div>
                        </div>
                    </div>
                    <Check size={14} className="text-white" />
                </button>
                <button className="w-full flex items-center justify-between p-4 border border-black/10 hover:border-black hover:bg-black/5 bg-white text-black transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                            <Plus size={14} className="text-black/50" />
                        </div>
                        <div className="text-left">
                            <div className="text-[10px] font-bold uppercase tracking-widest">Add Account or Hardware Wallet</div>
                            <div className="text-[9px] font-mono text-black/40">Import private key or connect Ledger</div>
                        </div>
                    </div>
                </button>
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
