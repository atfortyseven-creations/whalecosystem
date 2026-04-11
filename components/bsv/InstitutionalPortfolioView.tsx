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
import { useWalletStore, NETWORKS, NetworkId } from '@/lib/store/wallet-store';
import { useVIPStore } from '@/lib/vip-store';
type View = 'HOME' | 'SEND' | 'RECEIVE' | 'SCAN' | 'CREATE' | 'BUY' | 'NETWORK';

export function InstitutionalPortfolioView() {
    const { address, balance, updateBalance, activeNetwork, restoreFromCloud } = useWalletStore();
    const [view, setView] = useState<View>('HOME');
    const [prefilledAddress, setPrefilledAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    const refreshBalance = useCallback(async () => {
        if (!address) return;
        setLoading(true);
        try {
            await updateBalance();
            // Also fetch real transactions (No Mockdata)
            const res = await fetch(`/api/transactions?userId=${address}`);
            if (res.ok) {
                const data = await res.json();
                setTransactions(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error("[PORTFOLIO] Sync failure:", e);
        } finally { setLoading(false); }
    }, [address, updateBalance]);

    useEffect(() => {
        setIsHydrated(true);
        // Attempt to restore identity from cloud if local is empty
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
            <div className="flex items-center justify-center min-h-[85vh] bg-[#fdfcf9]">
                <RefreshCw size={40} className="animate-spin text-black/10" />
            </div>
        );
    }


    const scannerBase = activeNetwork === 'polygon' ? 'https://polygonscan.com' : 'https://etherscan.io';
    // Use the institutional oracle price, falling back to a safe floor if not yet sync'd
    const priceOracle = ethPrice > 0 ? ethPrice : 3100; 
    const balanceFiat = `$${(parseFloat(balance || "0") * priceOracle).toFixed(2)}`;

    return (
        <div className="flex flex-col relative text-black selection:bg-black/10 min-h-[85vh] bg-[#fdfcf9]">
            
            {/* Fine Grid Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg,#000 0,#000 1px,transparent 1px,transparent 60px),repeating-linear-gradient(90deg,#000 0,#000 1px,transparent 1px,transparent 60px)' }} />

            <AnimatePresence mode="wait">
                {view === 'HOME' && (
                    <HomeView key="home"
                        address={address}
                        balance={balance}
                        balanceFiat={balanceFiat}
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

function HomeView({ address, balance, balanceFiat, loading, transactions, onRefresh, onSend, onReceive, onScan, onCreate, onBuy, onNetworkClick, scannerBase }: any) {
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col relative z-20">
            <section className="px-8 pt-20 pb-12 flex flex-col items-center text-center">
                {address && (
                    <button onClick={clearWallet} className="absolute top-6 right-6 p-2.5 bg-white border border-black/10 rounded-xl shadow-sm hover:bg-rose-50 text-rose-500 transition-all">
                        <Trash size={16} />
                    </button>
                )}
                
                <button onClick={onNetworkClick} className="bg-white border border-black/10 px-5 py-2 rounded-full shadow-sm hover:border-black/20 transition-all flex items-center gap-2.5 mb-8">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: networkInfo.color }} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black">
                        {address ? `${networkInfo.name} Network` : 'No Identity Linked'}
                    </span>
                </button>

                <h1 
                    className="font-black tracking-tighter leading-none mb-2 text-black"
                    style={{ fontSize: 'clamp(3rem, 12vw, 8rem)' }}
                >
                    {balance}<span className="text-3xl md:text-4xl ml-2 opacity-50">{networkInfo.currency}</span>
                </h1>
                <p className="text-black/30 font-mono text-sm tracking-widest uppercase mb-10">{balanceFiat} USD VALUE</p>

                {address && (
                    <div className="flex flex-col items-center gap-3">
                        <button onClick={copy} className="bg-black/5 border border-black/10 px-6 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-3 group">
                            <code className="text-[12px] font-mono font-bold text-black/70 group-hover:text-black">{truncate(address, 16)}</code>
                            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="opacity-30 group-hover:opacity-100" />}
                        </button>
                        <a href={`${scannerBase}/address/${address}`} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold uppercase tracking-widest text-black/30 hover:text-black transition-colors flex items-center gap-1.5">
                            Verify on Blockchain <ExternalLink size={10} />
                        </a>
                    </div>
                )}

                <div className="flex items-center gap-4 mt-8">
                     <button onClick={onRefresh} disabled={loading} className="p-3 bg-white border border-black/10 rounded-full shadow-sm hover:rotate-180 transition-all duration-700">
                        <RefreshCw size={16} className={loading ? 'animate-spin opacity-40' : 'opacity-20'} />
                    </button>
                    {address && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-black/5 rounded-full border border-black/5"
                        >
                            <motion.div 
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Lock size={10} className="text-emerald-500" />
                            </motion.div>
                            <span className="text-[8px] font-bold uppercase tracking-widest text-black/50">Encrypted</span>
                        </motion.div>
                    )}
                </div>
            </section>

            <section className="px-8 pb-12 max-w-4xl mx-auto w-full">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-20">
                    <ActionCard icon={CreditCard} label="Deposit" sub="Buy Assets" onClick={onBuy} disabled={!address} />
                    <ActionCard icon={ArrowUpRight} label="Transmit" sub="Send Funds" onClick={onSend} disabled={!address} />
                    <ActionCard icon={ArrowDownLeft} label="Inbound" sub="Receive" onClick={onReceive} disabled={!address} />
                    <ActionCard icon={QrIcon} label="Scan QR" sub="Auto-Fill" onClick={onScan} disabled={!address} />
                    <ActionCard icon={Plus} label="New Intel" sub="Create Wallet" onClick={onCreate} highlighted />
                </div>

                {address && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                             <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-black">Network Activity</h4>
                             <span className="text-[9px] font-bold text-black/30 uppercase tracking-widest">{transactions.length} Records</span>
                        </div>
                        
                        <div className="bg-white border border-black/10 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
                            {transactions.length > 0 ? (
                                <div className="divide-y divide-black/5">
                                    {transactions.map((tx: any) => (
                                        <a 
                                            key={tx.hash} 
                                            href={`${scannerBase}/tx/${tx.hash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-7 hover:bg-black/[0.02] transition-colors group"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                                                    {tx.type === 'SEND' ? <ArrowUpRight size={18} /> : <Zap size={18} />}
                                                </div>
                                                <div>
                                                    <span className="text-[11px] font-black uppercase tracking-widest block mb-0.5">{tx.type}</span>
                                                    <span className="text-[10px] font-mono text-black/30">{truncate(tx.hash, 12)}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[12px] font-black block mb-0.5">-{tx.fromAmount} {tx.fromToken}</span>
                                                <span className={`text-[9px] font-bold uppercase tracking-widest ${tx.status === 'SUCCESS' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                    {tx.status}
                                                </span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-20 text-center flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center text-black/10 mb-6 border-2 border-dashed border-black/10">
                                        <Cpu size={24} />
                                    </div>
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/20">No on-chain history found</h5>
                                    <p className="text-[10px] text-black/10 max-w-[200px] mt-2 font-medium">Initial transmissions have not yet been broadcast to the cluster.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {!address && (
                    <div className="mt-12 p-8 bg-white border border-black/10 rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                        <div className="w-16 h-16 rounded-2xl bg-black/5 flex items-center justify-center text-black shrink-0 border border-black/10">
                            <Lock size={28} />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold mb-2 tracking-tight">Wallet Not Initialized</h4>
                            <p className="text-sm text-black/60 leading-relaxed font-medium">Generate a new keypair or import an existing one to begin on-chain operations. <br/><span className="text-black/40 text-xs inline-block mt-2 font-mono bg-black/5 px-2 py-1 rounded">Shift + Alt + W</span> to generate instantly.</p>
                        </div>
                    </div>
                )}
            </section>

            <footer className="px-10 py-10 mt-auto flex flex-wrap justify-center gap-10 items-center opacity-40 text-[10px] font-bold uppercase tracking-[0.2em] text-black">
                <span className="flex items-center gap-2"><Globe size={14} /> Multi-Chain</span>
                <span className="flex items-center gap-2"><Lock size={14} /> Highly Secure</span>
                <span className="flex items-center gap-2"><Cpu size={14} /> Local Execution</span>
            </footer>
        </motion.div>
    );
}


function ActionCard({ icon: Icon, label, sub, onClick, disabled, highlighted }: any) {
    return (
        <motion.button
            whileHover={{ 
                scale: 1.02, 
                y: -6, 
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' 
            }}
            whileTap={{ scale: 0.96 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={onClick}
            disabled={disabled}
            className={`flex flex-col items-start p-6 rounded-[2rem] border transition-all text-left group disabled:opacity-30 disabled:cursor-not-allowed ${
                highlighted 
                    ? 'bg-black text-white border-transparent shadow-[0_20px_40px_rgba(0,0,0,0.2)]' 
                    : 'bg-white text-black border-black/10 hover:border-black/30'
            }`}
        >
            <div className={`p-3 rounded-xl mb-4 transition-colors ${highlighted ? 'bg-white/10 text-white' : 'bg-black/5 text-black group-hover:bg-black group-hover:text-white'}`}>
                <Icon size={20} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest block mb-0.5">{label}</span>
            <span className={`text-[10px] font-medium opacity-40 ${highlighted ? 'text-white/60' : 'text-black/40'}`}>{sub}</span>
        </motion.button>
    );
}

function ModalView({ title, subtitle, icon, onBack, children }: any) {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="flex flex-col max-w-2xl mx-auto w-full pt-12 pb-20 px-6">
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center text-white shadow-lg">
                        {icon}
                    </div>
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-black/50">{subtitle}</span>
                        <h2 className="text-2xl font-black text-black tracking-tight mt-1">{title}</h2>
                    </div>
                </div>
                <button onClick={onBack} className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black transition-all">
                    <X size={20} />
                </button>
            </div>
            <div className="bg-white border border-black/10 rounded-[3rem] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.05)]">
                {children}
            </div>
        </motion.div>
    );
}

// Sub-views implementation (Send, Receive, Create, Network, Buy, Scan) 
// Redesigning them to match the new Solid White Elite style

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
        <ModalView title="Send Assets" subtitle="Transfer" icon={<ArrowUpRight />} onBack={onBack}>
            <div className="space-y-8">
                <FormField label={`Destination Address (${networkInfo.name})`}>
                    <input type="text" value={toAddress} onChange={e => setToAddress(e.target.value)} placeholder="0x..." className="w-full bg-black/5 border-none p-5 rounded-2xl font-mono text-sm outline-none placeholder:opacity-30 focus:ring-2 ring-black/10 transition-all" />
                </FormField>
                <FormField label="Amount">
                    <div className="relative">
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-black/5 border-none p-5 rounded-2xl font-mono text-3xl font-black outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 ring-black/10 transition-all" />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-black text-black/20">{networkInfo.currency}</span>
                    </div>
                </FormField>
                <button onClick={handleSend} disabled={isSigning || !toAddress || !amount} className="w-full py-5 rounded-xl bg-black text-white font-bold text-xs uppercase tracking-widest transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-30 disabled:scale-100 flex items-center justify-center gap-3">
                    {isSigning ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
                    {isSigning ? 'BROADCASTING...' : 'CONFIRM TRANSMISSION'}
                </button>
            </div>
        </ModalView>
    );
}

function ReceiveView({ address, onBack }: any) {
    const [copied, setCopied] = useState(false);
    return (
        <ModalView title="Receive Assets" subtitle="Wallet Interface" icon={<ArrowDownLeft />} onBack={onBack}>
            <div className="flex flex-col items-center gap-10">
                <div className="p-6 bg-white rounded-[2rem] border border-black/10 shadow-sm">
                    <QRCodeSVG value={address || ''} size={200} level="M" bgColor="#FFFFFF" fgColor="#000000" />
                </div>
                <div className="w-full text-center">
                    <button onClick={() => { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="w-full group">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/50 block mb-3 group-hover:text-black transition-colors">Your Address</span>
                        <div className="bg-black/5 p-5 rounded-xl font-mono text-sm text-black flex items-center justify-between transition-all hover:bg-black/10">
                            <span className="truncate max-w-[400px]">{address || 'VAULT_OFFLINE'}</span>
                            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} className="opacity-20" />}
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
        <ModalView title="Create Wallet" subtitle="Generation" icon={<Plus />} onBack={onBack}>
            <div className="text-center space-y-8 py-6">
                <div className="w-20 h-20 rounded-full bg-black/5 flex items-center justify-center mx-auto text-black">
                    <Key size={32} />
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-2">Initialize Local Wallet</h3>
                    <p className="text-black/50 text-sm leading-relaxed max-w-sm mx-auto">This creates a highly secure, client-side cryptographic keypair. Your private keys never leave this device.</p>
                </div>
                <button onClick={() => { createWallet(); onCreated(); }} className="w-full py-5 rounded-xl bg-black text-white font-bold text-xs uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all">
                    Generate Wallet
                </button>
            </div>
        </ModalView>
    );
}

// Minimal helpers for other views
function BuyView({ address, onBack }: any) {
    const onrampUrl = `https://buy.moonpay.com/?walletAddress=${address}&colorCode=%23000000`;
    return (
        <ModalView title="Buy Crypto" subtitle="Deposit via Card" icon={<CreditCard />} onBack={onBack}>
            <div className="h-[500px] rounded-2xl overflow-hidden border border-black/10">
                <iframe src={onrampUrl} className="w-full h-full" />
            </div>
        </ModalView>
    );
}

function ScanView({ onBack, onResult }: any) {
    return (
        <ModalView title="Scan Address" subtitle="Camera" icon={<Scan />} onBack={onBack}>
             <div className="p-10 bg-black/5 rounded-3xl text-center border-2 border-dashed border-black/10">
                <Scan size={40} className="mx-auto mb-4 opacity-30" />
                <p className="text-xs font-bold text-black/50 uppercase tracking-widest">Waiting for camera...</p>
                <input type="text" placeholder="Or paste address directly" onChange={e => onResult(e.target.value)} className="mt-8 w-full bg-white border border-black/10 p-4 rounded-xl font-mono text-sm outline-none focus:border-black/30 transition-all" />
             </div>
        </ModalView>
    );
}

function NetworkView({ onBack }: any) {
    const { activeNetwork, setNetwork } = useWalletStore();
    return (
        <ModalView title="Select Network" subtitle="Blockchain Environment" icon={<Globe />} onBack={onBack}>
            <div className="grid grid-cols-1 gap-3">
                {Object.entries(NETWORKS).map(([id, data]) => (
                    <button key={id} onClick={() => setNetwork(id as NetworkId)} className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${activeNetwork === id ? 'bg-black text-white border-transparent' : 'bg-white text-black border-black/10 hover:bg-black/5'}`}>
                        <div className="flex items-center gap-4">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
                            <span className="font-black uppercase tracking-widest text-xs">{data.name}</span>
                        </div>
                        <span className="text-[10px] font-mono opacity-40">{data.currency}</span>
                    </button>
                ))}
            </div>
        </ModalView>
    );
}

function FormField({ label, children }: any) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-black/50 block ml-1">{label}</label>
            {children}
        </div>
    );
}

