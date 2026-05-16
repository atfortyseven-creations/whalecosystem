"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, QrCode as QrIcon, Check, AlertCircle, ChevronDown, Search, ExternalLink } from "lucide-react";
import { useAccount, useChains, useSwitchChain } from "wagmi";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { TOKENS_BY_CHAIN } from "@/config/tokens";
import Image from "next/image";
import { TransactionStatusModal } from "@/components/ui/TransactionStatusModal";

interface ReceiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    address?: string;
}

export default function ReceiveModal({ isOpen, onClose, address: propAddress }: ReceiveModalProps) {
    const { address: wagmiAddress, chainId } = useAccount();
    const address = propAddress || wagmiAddress;
    const chains = useChains();
    const { switchChain, isPending: isSwitching, isSuccess: isSwitchSuccess, error: switchError } = useSwitchChain();
    const [copied, setCopied] = useState(false);

    // State
    const [selectedChainId, setSelectedChainId] = useState<number>(chainId || chains[0]?.id);
    const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
    
    // Status Modal State
    const [statusData, setStatusData] = useState<{ status: 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR', message: string }>({ status: 'IDLE', message: '' });

    // Token Management
    const [selectedToken, setSelectedToken] = useState<any>(null); // Null means Showing list or Native default? 
    // Let's default to Native Token for the chain
    
    const activeChain = chains.find(c => c.id === selectedChainId);
    
    // Tokens for selected chain
    const tokens = useMemo(() => {
        const chainTokens = TOKENS_BY_CHAIN[selectedChainId] || [];
        // Add Native Token manually if not in list
        const nativeToken = {
            symbol: activeChain?.nativeCurrency.symbol || 'ETH',
            name: activeChain?.name || 'Native Token',
            address: '0x0000000000000000000000000000000000000000', // Null address for native
            decimals: activeChain?.nativeCurrency.decimals || 18,
            logo: activeChain?.nativeCurrency.symbol === 'MATIC' ? 'https://cryptologos.cc/logos/polygon-matic-logo.png' : 
                  activeChain?.nativeCurrency.symbol === 'ETH' ? 'https://cryptologos.cc/logos/ethereum-eth-logo.png' : undefined
        };
        return [nativeToken, ...chainTokens];
    }, [selectedChainId, activeChain]);

    const [currentAsset, setCurrentAsset] = useState<any>(tokens[0]);

    // Update current asset when chain changes
    useEffect(() => {
         const nativeToken = {
            symbol: activeChain?.nativeCurrency.symbol || 'ETH',
            name: activeChain?.name || 'Native Token',
            address: '0x0000000000000000000000000000000000000000',
             decimals: activeChain?.nativeCurrency.decimals || 18,
             logo: activeChain?.nativeCurrency.symbol === 'MATIC' ? 'https://cryptologos.cc/logos/polygon-matic-logo.png' : 
                   activeChain?.nativeCurrency.symbol === 'ETH' ? 'https://cryptologos.cc/logos/ethereum-eth-logo.png' : undefined
        };
        setCurrentAsset(nativeToken);
    }, [selectedChainId, activeChain]);

    const handleCopy = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            toast.success("Address copied");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleNetworkChange = (chainId: number) => {
        setStatusData({ status: 'LOADING', message: 'Cambiando de red en Whale Alert Network...' });
        switchChain({ chainId }, {
            onSuccess: () => {
                setSelectedChainId(chainId);
                setStatusData({ status: 'SUCCESS', message: 'Red cambiada exitosamente' });
                setShowNetworkDropdown(false);
                setTimeout(() => setStatusData({ status: 'IDLE', message: '' }), 2000);
            },
            onError: (err) => {
                setStatusData({ status: 'ERROR', message: 'Error switching network' });
                toast.error(err.message.split('\n')[0]);
                setTimeout(() => setStatusData({ status: 'IDLE', message: '' }), 2000);
            }
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                     {/* Status Modal for Network Switch */}
                     <TransactionStatusModal 
                        isOpen={statusData.status !== 'IDLE'}
                        status={statusData.status}
                        message={statusData.message}
                        onClose={() => setStatusData({ status: 'IDLE', message: '' })}
                    />

                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-black/10 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none p-4"
                    >
                        <div className="w-full max-w-md bg-white border border-black/10 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]">

                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-black/5 bg-[#FAFAF8]">
                                <h2 className="text-xl font-black text-black tracking-tighter uppercase flex items-center gap-2">
                                    <QrIcon className="w-5 h-5 text-black" />
                                    Receive Assets
                                </h2>
                                <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full text-black/30 hover:text-black transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Main Scrollable Content */}
                            <div className="overflow-y-auto p-6 space-y-6">

                                {/* Network Selector */}
                                <div className="space-y-2 relative z-20">
                                    <label className="text-[10px] font-black text-black/40 uppercase tracking-widest pl-1">Network</label>
                                    <button 
                                        onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
                                        className="w-full flex items-center justify-between bg-black/5 hover:bg-black/10 border border-black/5 rounded-xl px-4 py-3 text-black transition-all"
                                    >
                                        <span className="font-black text-sm uppercase tracking-tight flex items-center gap-2">
                                            {activeChain?.name || "Select Network"}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${showNetworkDropdown ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown */}
                                    {showNetworkDropdown && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-black/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                            {chains.map((chain) => (
                                                <button
                                                    key={chain.id}
                                                    onClick={() => handleNetworkChange(chain.id)}
                                                    className={`w-full text-left px-4 py-3 font-black text-xs uppercase tracking-widest hover:bg-black/5 transition-colors flex items-center justify-between ${selectedChainId === chain.id ? 'text-black bg-black/5' : 'text-black/50'}`}
                                                >
                                                    {chain.name}
                                                    {selectedChainId === chain.id && <Check className="w-4 h-4" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* QR Code Area */}
                                <div className="flex flex-col items-center justify-center py-10 bg-black/5 rounded-3xl border border-black/5 relative overflow-hidden group">
                                     {/* Background decoration */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
                                    <div className="p-5 bg-white rounded-2xl shadow-xl z-10 border border-black/5">
                                        {address ? (
                                            <QRCodeSVG
                                                value={address}
                                                size={180}
                                                level="M"
                                                bgColor="#FFFFFF"
                                                fgColor="#000000"
                                            />
                                        ) : (
                                            <div className="w-[180px] h-[180px] bg-black/5 animate-pulse rounded-xl" />
                                        )}
                                    </div>

                                    <div className="mt-6 text-center z-10">
                                         <div className="text-black/40 text-[10px] font-black uppercase tracking-widest mb-2">Scan to receive assets</div>
                                         <div className="font-mono text-black font-black text-xs bg-white px-4 py-2 rounded-full border border-black/5 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-black/5 transition-colors" onClick={handleCopy}>
                                            {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : "..."}
                                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-black/20" />}
                                         </div>
                                    </div>
                                </div>

                                {/* Token List Selector */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-black/40 uppercase tracking-widest pl-1">Select Asset</label>
                                    
                                    <div className="space-y-2">
                                        {tokens.map((token, idx) => (
                                            <div 
                                                key={idx}
                                                onClick={() => setCurrentAsset(token)}
                                                className={`
                                                    p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between
                                                    ${currentAsset?.symbol === token.symbol 
                                                        ? 'bg-black text-white border-black' 
                                                        : 'bg-black/5 border-black/5 hover:bg-black/10 hover:border-black/10'}
                                                `}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {/* Token Icon */}
                                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                                                        {token.logo ? (
                                                            <img src={token.logo} alt={token.symbol} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-[10px] font-black">{token.symbol[0]}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className={`text-sm font-black uppercase tracking-tight ${currentAsset?.symbol === token.symbol ? 'text-white' : 'text-black'}`}>{token.name}</div>
                                                        <div className={`text-[10px] font-mono uppercase tracking-widest ${currentAsset?.symbol === token.symbol ? 'text-white/40' : 'text-black/30'}`}>{token.symbol}</div>
                                                    </div>
                                                </div>
                                                {currentAsset?.symbol === token.symbol && (
                                                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                                                        <Check className="w-3 h-3 text-black" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Selected Asset Details */}
                                {currentAsset && (
                                    <div className="p-4 bg-black/5 rounded-2xl border border-black/5 space-y-3">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-black/40 font-bold uppercase tracking-widest">Network</span>
                                            <span className="text-black font-black uppercase tracking-tight">{activeChain?.name}</span>
                                        </div>
                                        {currentAsset.address !== '0x0000000000000000000000000000000000000000' && (
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-black/40 font-bold uppercase tracking-widest">Token Contract</span>
                                                <a 
                                                    href={`${activeChain?.blockExplorers?.default.url}/address/${currentAsset.address}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-black hover:opacity-60 font-mono flex items-center gap-1 max-w-[150px] truncate underline"
                                                >
                                                    {currentAsset.address.slice(0, 8)}...{currentAsset.address.slice(-6)}
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        )}
                                        <div className="p-3 bg-black/5 border border-black/5 rounded-xl flex gap-3">
                                            <AlertCircle className="w-4 h-4 text-black/30 shrink-0 mt-0.5" />
                                            <p className="text-[10px] text-black/50 font-medium leading-relaxed">
                                                Only send <strong>{currentAsset.symbol}</strong> ({activeChain?.name}) to this address. Sending other assets may result in permanent loss.
                                            </p>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}


