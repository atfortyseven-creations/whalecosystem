"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, ArrowRight, Wallet, AlertCircle, Loader2, CheckCircle2, AlertTriangle, ChevronDown, Search } from "lucide-react";
import { useSendTransaction, useWriteContract, useBalance, useAccount, useChainId, useConnect } from "wagmi";
import { parseEther, parseUnits, isAddress, formatUnits } from "viem";
import { toast } from "sonner";
import { mainnet } from "wagmi/chains";
import { TransactionStatusModal } from "@/components/ui/TransactionStatusModal";
import { safeToFixed } from '@/lib/utils/number-format';
import { ERC20_ABI } from "@/lib/wallet/erc20";
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface SendModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SendModal({ isOpen, onClose }: SendModalProps) {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { t } = useLanguage();
    
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    
    // Discovery State
    const [tokens, setTokens] = useState<any[]>([]);
    const [isLoadingTokens, setIsLoadingTokens] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Status tracking
    const [status, setStatus] = useState<"IDLE" | "ESTIMATING" | "SIGNING" | "SENDING" | "SUCCESS" | "ERROR">("IDLE");
    const [txHash, setTxHash] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    // Wagmi Hooks
    const {
        sendTransaction,
        isPending: isSendingNative,
        isSuccess: isNativeSuccess,
        data: nativeTxData,
        error: nativeError
    } = useSendTransaction();

    const {
        writeContract,
        isPending: isWritingToken,
        isSuccess: isTokenSuccess,
        data: tokenTxData,
        error: tokenError
    } = useWriteContract();

    // Balances
    const { data: nativeBalance } = useBalance({ address });

    // Asset Management
    const availableAssets = useMemo(() => {
        const nativeToken = {
            symbol: 'NATIVE', 
            visibleSymbol: chainId === 137 ? 'POL' : 'ETH', 
            name: chainId === 137 ? 'Polygon ecosystem token' : 'Ethereum',
            address: 'native',
            decimals: 18,
            balanceFormatted: nativeBalance?.formatted || '0.00'
        };

        const discovered = tokens.map(t => ({
            ...t,
            visibleSymbol: t.symbol,
            logo: t.logoURI
        }));

        return [nativeToken, ...discovered];
    }, [chainId, tokens, nativeBalance]);

    const [selectedAsset, setSelectedAsset] = useState<any>(availableAssets[0]);
    const [showAssetDropdown, setShowAssetDropdown] = useState(false);

    // Fetch owned tokens on chain change
    useEffect(() => {
        if (!address || !isOpen) return;

        const fetchOwnedTokens = async () => {
            setIsLoadingTokens(true);
            try {
                const res = await fetch(`/api/wallet/tokens?address=${address}&chainId=${chainId}`);
                if (res.ok) {
                    const data = await res.json();
                    setTokens(data.tokens || []);
                }
            } catch (e) {
                console.error("Failed to fetch owned tokens:", e);
            } finally {
                setIsLoadingTokens(false);
            }
        };

        fetchOwnedTokens();
    }, [address, chainId, isOpen]);

    // Sync selected asset if chain changes
    useEffect(() => {
        setSelectedAsset(availableAssets[0]);
    }, [availableAssets]);

    // Search logic
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        const throttleSearch = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/wallet/tokens?address=${address}&chainId=${chainId}&query=${searchQuery}`);
                if (res.ok) {
                    const data = await res.json();
                    const filtered = (data.tokens || []).filter((t: any) => 
                        !availableAssets.some(a => a.address.toLowerCase() === t.address.toLowerCase())
                    );
                    setSearchResults(filtered);
                }
            } catch (e) {
                console.error("Search failed:", e);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(throttleSearch);
    }, [searchQuery, chainId, address, availableAssets]);

    // Fetch balance for selected token if not native
    const { data: tokenBalanceData } = useBalance({
        address,
        token: (selectedAsset.symbol !== 'NATIVE' && selectedAsset.address !== 'native') 
            ? selectedAsset.address as `0x${string}` 
            : undefined,
        query: {
            enabled: !!address && selectedAsset.symbol !== 'NATIVE' && selectedAsset.address !== 'native'
        }
    });

    // Derived Balance Display
    const currentBalance = useMemo(() => {
        if (selectedAsset.symbol === 'NATIVE' || selectedAsset.address === 'native') {
            return nativeBalance;
        }
        return tokenBalanceData;
    }, [selectedAsset, nativeBalance, tokenBalanceData]);

    // Handle Transaction Logic
    useEffect(() => {
        if (isNativeSuccess && nativeTxData) {
            setStatus("SUCCESS");
            setTxHash(nativeTxData);
            setStatusMessage("Send completed successfully!");
        }
        if (isTokenSuccess && tokenTxData) {
            setStatus("SUCCESS");
            setTxHash(tokenTxData);
            setStatusMessage("Send completed successfully!");
        }
    }, [isNativeSuccess, isTokenSuccess, nativeTxData, tokenTxData]);

    useEffect(() => {
        if (nativeError || tokenError) {
            setStatus("ERROR");
            setStatusMessage((nativeError || tokenError)?.message.split('\n')[0] || "A transaction error occurred.");
        }
    }, [nativeError, tokenError]);

    // Actions
    const handleMax = () => {
        if (!currentBalance) return;
        
        if (selectedAsset.symbol === 'NATIVE' || selectedAsset.address === 'native') {
            const buffer = chainId === mainnet.id ? 0.02 : 0.005;
            const val = parseFloat(currentBalance.formatted) - buffer;
            setAmount(val > 0 ? safeToFixed(val, 6) : "0");
        } else {
            setAmount(currentBalance.formatted);
        }
    };

    const { connect, connectors } = useConnect();

    const handleSend = async () => {
        if (!address) {
            connect({ connector: connectors[0] }); 
            return;
        }
        if (!isAddress(recipient)) {
            toast.error("Invalid destination address");
            return;
        }
        if (!amount || parseFloat(amount) <= 0) {
            toast.error("Invalid amount");
            return;
        }

        setStatus("SIGNING");
        setStatusMessage("Please confirm the transaction in your wallet...");

        try {
            if (selectedAsset.symbol === 'NATIVE' || selectedAsset.address === 'native') {
                sendTransaction({
                    to: recipient as `0x${string}`,
                    value: parseEther(amount)
                });
            } else {
                writeContract({
                    address: selectedAsset.address as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: "transfer",
                    args: [recipient as `0x${string}`, parseUnits(amount, selectedAsset.decimals)]
                });
            }
        } catch (e) {
            setStatus("ERROR");
            setStatusMessage("Error signing the transaction.");
            console.error(e);
        }
    };

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            setStatus("IDLE");
            setRecipient("");
            setAmount("");
            setTxHash("");
            setShowAssetDropdown(false);
            setSearchQuery("");
        }
    }, [isOpen]);

    const modalStatus = useMemo(() => {
        if (status === 'SIGNING' || status === 'SENDING' || status === 'ESTIMATING') return 'LOADING';
        if (status === 'SUCCESS') return 'SUCCESS';
        if (status === 'ERROR') return 'ERROR';
        return 'IDLE'; 
    }, [status]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <TransactionStatusModal 
                        isOpen={modalStatus !== 'IDLE'}
                        status={modalStatus}
                        message={statusMessage}
                        txHash={txHash}
                        onClose={() => setStatus('IDLE')}
                    />

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none p-4"
                    >
                        <div className="w-full max-w-md bg-[#1a1b23]/95 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl pointer-events-auto overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/5">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Send className="w-5 h-5 text-indigo-400" />
                                    Send Assets
                                </h2>
                                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Asset Selector */}
                                <div className="space-y-2 relative z-30">
                                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider pl-1">Select Asset</label>
                                    <button 
                                        onClick={() => setShowAssetDropdown(!showAssetDropdown)}
                                        className="w-full flex items-center justify-between bg-black/30 hover:bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            {selectedAsset.logo ? (
                                                <img src={selectedAsset.logo} className="w-6 h-6 rounded-full" />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black">
                                                    {selectedAsset.visibleSymbol.slice(0, 2)}
                                                </div>
                                            )}
                                            <div className="text-left">
                                                <div className="font-bold flex items-center gap-2">
                                                    {selectedAsset.visibleSymbol}
                                                    {selectedAsset.address === 'native' && (
                                                        <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded uppercase font-black tracking-tighter">Native</span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-white/30 font-medium truncate max-w-[150px]">{selectedAsset.name}</div>
                                            </div>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${showAssetDropdown ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown with Search */}
                                    <AnimatePresence>
                                        {showAssetDropdown && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-full left-0 right-0 mt-2 bg-[#1e202b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-40 p-1 max-h-[400px] flex flex-col"
                                            >
                                                {/* Search Bar */}
                                                <div className="p-2 border-b border-white/5 mb-2">
                                                    <div className="relative">
                                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                                                        <input 
                                                            autoFocus
                                                            placeholder="Search by name or address..."
                                                            value={searchQuery}
                                                            onChange={(e) => setSearchQuery(e.target.value)}
                                                            className="w-full bg-black/40 border border-white/5 rounded-lg py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-indigo-500/30 transition-all font-medium"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 flex-1">
                                                    {/* Section: My Assets */}
                                                    {!searchQuery && (
                                                        <div className="px-3 py-1 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">My Assets</div>
                                                    )}
                                                    
                                                    {availableAssets.filter(a => 
                                                        !searchQuery || a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || a.name.toLowerCase().includes(searchQuery.toLowerCase())
                                                    ).map((asset, idx) => (
                                                        <button
                                                            key={`owned-${idx}`}
                                                            onClick={() => {
                                                                setSelectedAsset(asset);
                                                                setShowAssetDropdown(false);
                                                            }}
                                                            className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors flex items-center justify-between group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {asset.logo ? (
                                                                    <img src={asset.logo} className="w-7 h-7 rounded-full" />
                                                                ) : (
                                                                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black">{asset.visibleSymbol.slice(0, 2)}</div>
                                                                )}
                                                                <div>
                                                                    <div className="text-white font-bold text-sm tracking-tight">{asset.visibleSymbol}</div>
                                                                    <div className="text-white/30 text-[10px] font-medium">{asset.name}</div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-xs font-mono font-bold text-white/50">{parseFloat(asset.balanceFormatted || '0').toFixed(4)}</div>
                                                                {asset.valueUSD > 0 && <div className="text-[10px] text-emerald-500/60 font-medium">${safeToFixed(asset.valueUSD, 2)}</div>}
                                                            </div>
                                                        </button>
                                                    ))}

                                                    {/* Section: Search Results */}
                                                    {searchQuery && (
                                                        <>
                                                            <div className="px-3 py-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] border-t border-white/5 mt-2">Search Results</div>
                                                            {isSearching ? (
                                                                <div className="py-8 flex flex-col items-center gap-2">
                                                                    <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                                                                    <span className="text-[10px] font-bold text-white/20">Searching network...</span>
                                                                </div>
                                                            ) : searchResults.length > 0 ? (
                                                                searchResults.map((asset, idx) => (
                                                                    <button
                                                                        key={`search-${idx}`}
                                                                        onClick={() => {
                                                                            setSelectedAsset({ ...asset, visibleSymbol: asset.symbol });
                                                                            setShowAssetDropdown(false);
                                                                        }}
                                                                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-3"
                                                                    >
                                                                        {asset.logoURI ? (
                                                                            <img src={asset.logoURI} className="w-7 h-7 rounded-full" />
                                                                        ) : (
                                                                            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black">{asset.symbol.slice(0, 2)}</div>
                                                                        )}
                                                                        <div>
                                                                            <div className="text-white font-bold text-sm tracking-tight">{asset.symbol}</div>
                                                                            <div className="text-white/30 text-[10px] font-medium truncate max-w-[200px]">{asset.name}</div>
                                                                        </div>
                                                                    </button>
                                                                ))
                                                            ) : (
                                                                <div className="py-8 text-center text-[10px] font-bold text-white/10">No additional assets found</div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Recipient */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider pl-1">Destination Address</label>
                                    <div className="relative">
                                        <input
                                            value={recipient}
                                            onChange={(e) => setRecipient(e.target.value)}
                                            placeholder="0x..."
                                            className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-4 pr-10 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm"
                                        />
                                        {recipient && isAddress(recipient) && (
                                            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                        )}
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center pl-1">
                                        <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Amount</label>
                                        <span className="text-[10px] text-white/40 font-bold">
                                            Balance: 
                                            <span className="text-white font-mono ml-1">
                                                {currentBalance ? parseFloat(currentBalance.formatted).toFixed(6) : "0.000000"}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl py-5 pl-4 pr-24 text-3xl font-black text-white placeholder:text-white/10 focus:outline-none focus:border-indigo-500/50 transition-all tabular-nums"
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            <button
                                                onClick={handleMax}
                                                className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[9px] font-black text-indigo-300 transition-colors uppercase tracking-widest"
                                            >
                                                MAX
                                            </button>
                                            <span className="font-black text-white/40 text-xs pr-2">
                                                {selectedAsset.visibleSymbol}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <button
                                    disabled={status === "SIGNING" || status === "SENDING" || !amount || !recipient || !address}
                                    onClick={handleSend}
                                    className="w-full py-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-30 disabled:grayscale rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-white shadow-xl shadow-indigo-500/10 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                                >
                                    {!address ? t('nav.wallet_settings') :
                                        (
                                            <>
                                                Send {selectedAsset.visibleSymbol} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}


