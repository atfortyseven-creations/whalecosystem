"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSendTransaction, useWriteContract, useReadContract, useAccount, useChainId, useEnsAddress, useEstimateGas, useGasPrice, useSwitchChain, useChains } from "wagmi";
import { parseEther, parseUnits, isAddress, formatUnits, maxUint256, formatEther, encodeFunctionData } from "viem";
import { toast } from "sonner";
import { mainnet } from "wagmi/chains";
import { TransactionStatusModal } from "@/components/ui/TransactionStatusModal";
import { safeToFixed } from '@/lib/utils/number-format';
import { ERC20_ABI } from "@/lib/wallet/erc20";
import { TokenLogo } from '@/components/ui/TokenLogo';

// --- Constants & Types ---
type MainTab = "SEND" | "SWAP" | "BRIDGE" | "BUY";
type SendSubTab = "STANDARD" | "PRIVATE" | "ENS";

const NATIVE_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"; 

interface UnifiedWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: MainTab;
    userAssets?: any[];
}

export default function UnifiedWalletModal({ isOpen, onClose, initialTab = "SEND", userAssets = [] }: UnifiedWalletModalProps) {
    const { address } = useAccount();
    const chainId = useChainId();
    const [activeTab, setActiveTab] = useState<MainTab>(initialTab);
    
    useEffect(() => {
        if (isOpen) setActiveTab(initialTab);
    }, [isOpen, initialTab]);

    const [status, setStatus] = useState<"IDLE" | "ESTIMATING" | "SIGNING" | "SENDING" | "SUCCESS" | "ERROR">("IDLE");
    const [txHash, setTxHash] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

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

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" />

                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none p-4">
                        <div className="w-full max-w-md bg-[#FFFFFF] border border-black/5 rounded-[32px] shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="flex items-center justify-between p-6 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="px-3 py-1 border border-black/10 bg-black text-white font-black text-[10px] tracking-widest uppercase">
                                        SECURE
                                    </div>
                                    <h2 className="text-xl font-black text-black tracking-tighter uppercase">WALLET</h2>
                                </div>
                                <button onClick={onClose} className="font-bold text-[10px] uppercase tracking-widest text-black/40 hover:text-black transition-colors">
                                    [ CLOSE ]
                                </button>
                            </div>

                            <div className="px-6 pb-6">
                                <div className="flex items-center bg-black/5 p-1 rounded-[20px] w-full">
                                    {(["SEND", "SWAP", "BRIDGE", "BUY"] as MainTab[]).map(tab => (
                                        <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-[16px] transition-all duration-300 ${activeTab === tab ? 'bg-black text-white shadow-md' : 'text-black/40 hover:text-black hover:bg-black/5'}`}>
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="px-6 pb-8 flex-1 overflow-y-auto scrollbar-hide">
                                <AnimatePresence mode="wait">
                                    {activeTab === "SEND" && <SendModule key="send" userAssets={userAssets} setStatus={setStatus} setTxHash={setTxHash} setStatusMessage={setStatusMessage} />}
                                    {activeTab === "SWAP" && <AdvancedRouterModule key="swap" mode="SWAP" userAssets={userAssets} setStatus={setStatus} setTxHash={setTxHash} setStatusMessage={setStatusMessage} />}
                                    {activeTab === "BRIDGE" && <AdvancedRouterModule key="bridge" mode="BRIDGE" userAssets={userAssets} setStatus={setStatus} setTxHash={setTxHash} setStatusMessage={setStatusMessage} />}
                                    {activeTab === "BUY" && <BuyModule key="buy" />}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function TokenSelector({ assets, onSelect, onClose, currentChainId = null }: any) {
    const [search, setSearch] = useState("");
    const filteredAssets = assets.filter((a: any) => {
        if (currentChainId && a.chainId !== currentChainId && currentChainId !== 'all') return false;
        if (a.symbol === 'QDs') return false; 
        if (search) return a.symbol.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase());
        return true;
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#FFFFFF] rounded-[32px] shadow-2xl border border-black/10 w-full max-w-sm relative z-10 overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-black/5 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <span className="font-black text-black uppercase tracking-tight">Select Token</span>
                        <span className="text-[10px] font-black cursor-pointer text-black/40 hover:text-black transition-colors uppercase" onClick={onClose}>[X]</span>
                    </div>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-black/30">[?]</span>
                        <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or symbol" className="w-full bg-white border border-black/5 rounded-none py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-black/20 text-black placeholder:text-black/30" />
                    </div>
                </div>
                <div className="overflow-y-auto p-2 flex-1 min-h-[200px]">
                    {filteredAssets.length === 0 ? (
                        <div className="text-center p-8 text-black/40 text-xs font-bold uppercase tracking-widest">No tokens found</div>
                    ) : (
                        filteredAssets.map((t: any, i: number) => (
                            <button key={`${t.address}-${t.chainId}-${i}`} onClick={() => { onSelect(t); onClose(); }} className="w-full flex items-center justify-between p-4 hover:bg-black/5 rounded-2xl transition-colors">
                                <div className="flex items-center gap-4">
                                    <TokenLogo symbol={t.symbol} address={t.address} logoURI={t.logoURI} className="w-10 h-10 rounded-full" fallbackClassName="w-10 h-10 rounded-full text-xs" />
                                    <div className="text-left">
                                        <div className="font-black text-black">{t.symbol}</div>
                                        <div className="text-[10px] text-black/40 font-bold uppercase tracking-widest">{t.name}  {t.network}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono text-sm font-bold text-black">{safeToFixed(t.balanceNumeric, 4)}</div>
                                    <div className="text-[10px] text-black/40 font-bold tracking-widest">${safeToFixed(t.valueUSD, 2)}</div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// SEND MODULE WITH NETWORK SWITCHING
// -----------------------------------------------------------------------------
function SendModule({ userAssets, setStatus, setTxHash, setStatusMessage }: any) {
    const { address, chain: activeChain } = useAccount();
    const chainId = useChainId();
    const { switchChainAsync } = useSwitchChain();
    
    const [subTab, setSubTab] = useState<SendSubTab>("STANDARD");
    
    const validAssets = userAssets.filter((a: any) => a.symbol !== 'QDs');
    const defaultToken = validAssets.find((a: any) => a.address === 'native' && a.chainId === chainId) || validAssets[0] || { symbol: "ETH", address: "native", decimals: 18, balanceNumeric: 0, logoURI: "", chainId: 1 };
    
    const [selectedAsset, setSelectedAsset] = useState<any>(defaultToken);
    const [showTokenSelect, setShowTokenSelect] = useState(false);
    const [amount, setAmount] = useState("");
    const [recipientInput, setRecipientInput] = useState("");

    const isWrongNetwork = activeChain?.id !== selectedAsset.chainId;

    const { data: ensAddress, isLoading: isEnsLoading } = useEnsAddress({
        name: recipientInput.endsWith('.eth') ? recipientInput : undefined,
        chainId: mainnet.id,
    });

    const finalRecipient = useMemo(() => {
        if (ensAddress) return ensAddress;
        if (isAddress(recipientInput)) return recipientInput;
        return null;
    }, [recipientInput, ensAddress]);

    const { sendTransactionAsync } = useSendTransaction();
    const { writeContractAsync } = useWriteContract();
    const isNative = selectedAsset.address === 'native' || selectedAsset.address === NATIVE_ADDRESS;
    
    // Find user's native balance on this chain to ensure they can pay gas
    const nativeAsset = userAssets.find((a: any) => (a.address === 'native' || a.address === NATIVE_ADDRESS) && a.chainId === selectedAsset.chainId);
    const nativeBalanceNumeric = nativeAsset?.balanceNumeric || 0;
    
    const { data: gasPrice } = useGasPrice({ chainId: selectedAsset.chainId });
    const { data: estimatedGas } = useEstimateGas({
        to: isNative ? (finalRecipient as `0x${string}` || address) : (selectedAsset.address as `0x${string}`),
        data: !isNative && finalRecipient && amount && !isNaN(Number(amount))
            ? encodeFunctionData({ abi: ERC20_ABI, functionName: "transfer", args: [finalRecipient as `0x${string}`, parseUnits(amount, selectedAsset.decimals)] })
            : undefined,
        value: amount && !isNaN(Number(amount)) && isNative ? parseEther(amount) : undefined,
        chainId: selectedAsset.chainId,
        query: { enabled: !!finalRecipient && !!amount && !isNaN(Number(amount)) && !isWrongNetwork }
    });

    const handleMax = () => {
        if (!selectedAsset || selectedAsset.balanceNumeric <= 0) return;
        if (isNative && gasPrice && !isWrongNetwork) {
            const safeGasLimit = estimatedGas ? (estimatedGas * 150n / 100n) : 21000n; 
            const gasCost = safeGasLimit * gasPrice;
            const balanceWei = parseUnits(selectedAsset.balanceNumeric.toString(), selectedAsset.decimals);
            if (balanceWei > gasCost) {
                setAmount(formatUnits(balanceWei - gasCost, selectedAsset.decimals));
            } else {
                setAmount("0");
            }
        } else {
            setAmount(selectedAsset.balanceNumeric.toString());
        }
    };

    const handleSend = async () => {
        if (!finalRecipient || !amount) return;
        
        // Critical Native Balance check to prevent silent gas failures on ERC20 transfers
        if (!isNative && nativeBalanceNumeric === 0) {
            setStatus("ERROR");
            setStatusMessage(`Insufficient native token (${nativeAsset?.symbol || 'ETH/MATIC'}) to pay for network gas.`);
            return;
        }

        try {
            if (isWrongNetwork && switchChainAsync) {
                setStatus("SIGNING");
                setStatusMessage("Please switch to the correct network in your wallet...");
                await switchChainAsync({ chainId: selectedAsset.chainId });
                setStatus("IDLE");
                return; // Wait for user to re-click after network switch
            }

            setStatus("SIGNING");
            setStatusMessage(subTab === 'PRIVATE' ? "Encrypting routing signature..." : "Confirming transaction securely...");
            
            let hash: string;
            if (isNative) {
                hash = await sendTransactionAsync({ to: finalRecipient as `0x${string}`, value: parseUnits(amount, selectedAsset.decimals) });
            } else {
                hash = await writeContractAsync({ address: selectedAsset.address as `0x${string}`, abi: ERC20_ABI, functionName: "transfer", args: [finalRecipient as `0x${string}`, parseUnits(amount, selectedAsset.decimals)] });
            }
            
            setStatus("SUCCESS");
            setTxHash(hash);
            setStatusMessage("Transaction broadcasted to network.");
            setAmount("");
        } catch (e: any) {
            console.error(e);
            setStatus("ERROR");
            setStatusMessage(e.shortMessage || e.message || "Transaction failed");
        }
    };

    return (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
            <div className="flex items-center gap-6 border-b border-black/5">
                {(["STANDARD", "PRIVATE", "ENS"] as SendSubTab[]).map(tab => (
                    <button key={tab} onClick={() => setSubTab(tab)} className={`pb-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${subTab === tab ? 'border-black text-black' : 'border-transparent text-black/30 hover:text-black/60'}`}>
                        {tab} {tab === 'PRIVATE' && <span className="inline text-[9px] text-black/30 ml-1">[SECURE]</span>}
                    </button>
                ))}
            </div>

            {subTab === 'PRIVATE' && (
                <div className="bg-black/5 border border-black/10 p-4 flex items-start gap-3">
                    <span className="font-black text-[10px] text-black shrink-0 mt-0.5">[PRIVACY]</span>
                    <p className="text-[10px] text-black/60 font-bold uppercase tracking-widest leading-relaxed">Privacy routing active. Funds will be routed via standard relay parameters. Complete stealth requires off-chain ZK integration.</p>
                </div>
            )}

            {isWrongNetwork && (
                <div className="bg-black text-white border border-black p-4 flex items-start gap-3">
                    <span className="font-black text-[10px] text-white shrink-0 mt-0.5">[!]</span>
                    <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">Mismatched Network. You are on {activeChain?.name}, but {selectedAsset.symbol} is on {selectedAsset.network}. Click below to switch.</p>
                </div>
            )}

            <div className="bg-white border border-black/5 rounded-[24px] p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-black/40 uppercase tracking-widest">Amount</label>
                </div>
                <div className="flex items-center gap-4">
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-transparent text-4xl font-black text-black placeholder:text-black/10 focus:outline-none tabular-nums" />
                    <button onClick={() => setShowTokenSelect(true)} className="flex items-center gap-2 bg-black/5 hover:bg-black/10 px-3 py-2 transition-colors border border-black/5 shrink-0">
                        <span className="font-black text-sm">{selectedAsset?.symbol || "N/A"}</span>
                        <span className="text-[10px] font-black text-black/40">v</span>
                    </button>
                </div>
                <div className="flex justify-between items-center border-t border-black/5 pt-4">
                    <span className="text-[10px] text-black/40 font-bold uppercase tracking-widest">{amount && selectedAsset.price ? ` $${safeToFixed(parseFloat(amount) * selectedAsset.price, 2)}` : ' $0.00'}</span>
                    <button onClick={handleMax} className="text-[10px] text-black/40 font-black uppercase tracking-widest hover:text-black transition-colors flex items-center gap-1">
                        Balance: {safeToFixed(selectedAsset?.balanceNumeric || 0, 4)}
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-black/40 uppercase tracking-widest pl-1">Recipient</label>
                <div className="relative">
                    <input value={recipientInput} onChange={(e) => setRecipientInput(e.target.value)} placeholder={subTab === 'ENS' ? "vitalik.eth" : "0x..."} className="w-full bg-white border border-black/5 p-4 pr-10 text-black placeholder:text-black/20 focus:outline-none focus:border-black/20 transition-all font-mono text-sm" />
                    {isEnsLoading && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-black/30 uppercase tracking-widest">[...]</span>}
                    {finalRecipient && !isEnsLoading && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-black uppercase tracking-widest">[OK]</span>}
                </div>
            </div>

            <button disabled={(!amount || !finalRecipient || isEnsLoading || parseFloat(amount) <= 0 || parseFloat(amount) > (selectedAsset?.balanceNumeric || 0)) && !isWrongNetwork} onClick={handleSend} className={`w-full py-4 font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group ${isWrongNetwork ? 'bg-black text-white hover:bg-black/80' : 'bg-black hover:bg-black/80 disabled:bg-black/10 disabled:text-black/30 text-white'}`}>
                {isWrongNetwork ? `Switch to ${selectedAsset.network}` : 'Initiate Send'} {isWrongNetwork ? <span className="text-[10px] font-black">[NET]</span> : <span className="text-[10px] font-black group-hover:translate-x-1 transition-transform">-&gt;</span>}
            </button>
            
            <AnimatePresence>
                {showTokenSelect && <TokenSelector assets={validAssets} currentChainId="all" onClose={() => setShowTokenSelect(false)} onSelect={(t: any) => { setSelectedAsset(t); setAmount(""); }} />}
            </AnimatePresence>
        </motion.div>
    );
}

// -----------------------------------------------------------------------------
// ADVANCED ROUTER MODULE (SWAP & BRIDGE) - Fully Multi-State Enabled
// -----------------------------------------------------------------------------
function AdvancedRouterModule({ mode, userAssets, setStatus, setTxHash, setStatusMessage }: any) {
    const { address, chain: activeChain } = useAccount();
    const { switchChainAsync } = useSwitchChain();
    const allWagmiChains = useChains();
    
    //  DYNAMIC CHAIN DERIVATION (No mock data)
    const CHAINS = allWagmiChains.map((c: any) => ({
        id: c.id,
        name: c.name,
        icon: c.id === 1 ? 'https://cryptologos.cc/logos/ethereum-eth-logo.png' : 
              c.id === 42161 ? 'https://cryptologos.cc/logos/arbitrum-arb-logo.png' : 
              c.id === 10 ? 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png' : 
              c.id === 8453 ? 'https://base.org/document/favicon-32x32.png' : 
              c.id === 137 ? 'https://cryptologos.cc/logos/polygon-matic-logo.png' : 
              'https://cryptologos.cc/logos/ethereum-eth-logo.png' // Generic fallback
    }));

    const [fromChain, setFromChain] = useState(CHAINS.find((c: any) => c.id === activeChain?.id) || CHAINS[0]);
    const [toChain, setToChain] = useState(mode === "SWAP" ? fromChain : CHAINS.find((c: any) => c.id !== fromChain.id) || CHAINS[0]);

    const isWrongNetwork = activeChain?.id !== fromChain.id;

    const [payAmount, setPayAmount] = useState("");
    const [receiveAmount, setReceiveAmount] = useState("");
    
    //  DYNAMIC DEFAULT TOKENS (Derived from chain state)
    const DEFAULT_TOKENS = CHAINS.map((c: any) => ({
        symbol: c.id === 137 ? 'MATIC' : 'ETH',
        address: NATIVE_ADDRESS,
        decimals: 18,
        logoURI: c.icon,
        chainId: c.id,
        network: c.name
    }));

    const availableFromAssets = userAssets.filter((a: any) => a.chainId === fromChain.id && a.symbol !== 'QDs');
    // Find native token for the selected chain, or default
    const fallbackNativeToken = DEFAULT_TOKENS.find((t: any) => t.chainId === fromChain.id) || DEFAULT_TOKENS[0];
    
    const [payToken, setPayToken] = useState<any>(availableFromAssets.length > 0 ? availableFromAssets[0] : fallbackNativeToken);
    const [receiveToken, setReceiveToken] = useState<any>(fallbackNativeToken);
    
    const [quoteData, setQuoteData] = useState<any>(null);
    const [isQuoting, setIsQuoting] = useState(false);
    const [quoteError, setQuoteError] = useState("");

    const [showFromSelect, setShowFromSelect] = useState(false);
    const [showToSelect, setShowToSelect] = useState(false);

    const { sendTransactionAsync } = useSendTransaction();
    const { writeContractAsync } = useWriteContract();

    const isPayTokenNative = payToken.address === 'native' || payToken.address === NATIVE_ADDRESS;
    const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
        address: isPayTokenNative ? undefined : (payToken.address as `0x${string}`),
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address as `0x${string}`, quoteData?.transactionRequest?.to as `0x${string}`],
        chainId: fromChain.id,
        query: { enabled: !!address && !!quoteData && !isPayTokenNative && !isWrongNetwork }
    });

    const needsApproval = useMemo(() => {
        if (!quoteData || isPayTokenNative) return false;
        const requiredAmount = parseUnits(payAmount, payToken.decimals || 18);
        return (allowanceData as bigint || 0n) < requiredAmount;
    }, [allowanceData, payAmount, payToken, quoteData, isPayTokenNative]);

    useEffect(() => {
        if (!payAmount || parseFloat(payAmount) <= 0) {
            setReceiveAmount(""); setQuoteData(null); setQuoteError(""); return;
        }
        const fetchQuote = async () => {
            setIsQuoting(true); setQuoteError("");
            try {
                const amountBase = parseUnits(payAmount, payToken.decimals || 18).toString();
                const fromAddr = payToken.address === 'native' ? NATIVE_ADDRESS : payToken.address;
                const toAddr = receiveToken.address === 'native' ? NATIVE_ADDRESS : receiveToken.address;
                const url = `https://li.quest/v1/quote?fromChain=${fromChain.id}&toChain=${toChain.id}&fromToken=${fromAddr}&toToken=${toAddr}&fromAmount=${amountBase}&fromAddress=${address || '0x0000000000000000000000000000000000000000'}`;
                
                const res = await fetch(url);
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Route not found");
                
                setReceiveAmount(formatUnits(BigInt(data.estimate.toAmount), data.action.toToken.decimals));
                setQuoteData(data);
                if (!isPayTokenNative) refetchAllowance();
            } catch (e: any) {
                setQuoteError(e.message || "No route available"); setQuoteData(null); setReceiveAmount("");
            } finally {
                setIsQuoting(false);
            }
        };
        const timer = setTimeout(fetchQuote, 600);
        return () => clearTimeout(timer);
    }, [payAmount, payToken, receiveToken, fromChain, toChain, address, isPayTokenNative, refetchAllowance]);

    const handleExecute = async () => {
        try {
            if (isWrongNetwork && switchChainAsync) {
                setStatus("SIGNING");
                setStatusMessage("Please switch to the correct network in your wallet...");
                await switchChainAsync({ chainId: fromChain.id });
                setStatus("IDLE");
                return; // Wait for user to click again after network switch
            }

            if (!quoteData) return;

            if (needsApproval && !isPayTokenNative) {
                setStatus("SIGNING");
                setStatusMessage(`Approve router to spend ${payToken.symbol}...`);
                const txHash = await writeContractAsync({ address: payToken.address as `0x${string}`, abi: ERC20_ABI, functionName: "approve", args: [quoteData.transactionRequest.to as `0x${string}`, maxUint256] });
                setStatusMessage("Waiting for approval confirmation on-chain...");
                
                // Atomically wait for the network to sequence the approval before proceeding
                let confirmed = false;
                for (let i = 0; i < 15; i++) {
                    await new Promise(r => setTimeout(r, 2000));
                    const { data: newAllowance } = await refetchAllowance();
                    if ((newAllowance as bigint || 0n) >= parseUnits(payAmount, payToken.decimals)) {
                        confirmed = true;
                        break;
                    }
                }
                if (!confirmed) throw new Error("Approval indexing timed out. Try again.");
            }

            setStatus("SIGNING");
            setStatusMessage(`Signing ${mode.toLowerCase()} transaction...`);
            const hash = await sendTransactionAsync({ to: quoteData.transactionRequest.to, data: quoteData.transactionRequest.data, value: BigInt(quoteData.transactionRequest.value || 0) });
            
            setStatus("SUCCESS");
            setTxHash(hash);
            setStatusMessage(`${mode === 'SWAP' ? 'Swap' : 'Bridge'} transaction broadcasted!`);
            setPayAmount("");
        } catch (e: any) {
            console.error("Execution Error:", e);
            setStatus("ERROR");
            setStatusMessage(e.shortMessage || "Execution failed");
        }
    };

    return (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-2">
            {isWrongNetwork && (
                <div className="bg-black text-white border border-black p-4 flex items-start gap-3 mb-4">
                    <span className="font-black text-[10px] text-white shrink-0 mt-0.5">[!]</span>
                    <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">Mismatched Network. You are on {activeChain?.name || 'Unknown'}, but the routing source requires {fromChain.name}.</p>
                </div>
            )}

            <div className="bg-white border border-black/5 rounded-[24px] p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-black/40 uppercase tracking-widest">{mode === 'BRIDGE' ? 'From Chain & Token' : 'You Pay'}</label>
                    {mode === 'BRIDGE' && (
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-black/60 bg-black/5 px-2 py-1 rounded-lg">
                            <img src={fromChain.icon} className="w-3 h-3 rounded-full" alt="" />
                            {fromChain.name}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="0.00" className="w-full bg-transparent text-4xl font-black text-black placeholder:text-black/10 focus:outline-none tabular-nums" />
                    <button onClick={() => setShowFromSelect(true)} className="flex items-center gap-2 bg-black/5 px-3 py-2 border border-black/5 hover:bg-black/10 transition-colors shrink-0">
                        <TokenLogo symbol={payToken?.symbol} logoURI={payToken?.logoURI} className="w-5 h-5 rounded-full" fallbackClassName="w-5 h-5" />
                        <span className="font-black text-sm">{payToken?.symbol || "Select"}</span>
                        <span className="text-[10px] font-black text-black/40">v</span>
                    </button>
                </div>
                <div className="text-[10px] text-black/40 font-bold uppercase tracking-widest">Balance: {safeToFixed(payToken?.balanceNumeric || 0, 4)}</div>
            </div>

            <div className="flex justify-center -my-3 relative z-10">
                <button onClick={() => { if (mode === 'BRIDGE') { const tc = fromChain; setFromChain(toChain); setToChain(tc); } const pt = payToken; setPayToken(receiveToken); setReceiveToken(pt); setPayAmount(""); }} className="bg-white border border-black/10 px-3 py-2 shadow-sm hover:shadow-md transition-all text-black hover:bg-black/5 font-black text-[10px] uppercase tracking-widest">
                    [~]
                </button>
            </div>

            <div className="bg-white border border-black/5 rounded-[24px] p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-black/40 uppercase tracking-widest">{mode === 'BRIDGE' ? 'To Chain & Token' : 'You Receive'}</label>
                    {mode === 'BRIDGE' && (
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-black/60 bg-black/5 px-2 py-1 rounded-lg">
                            <img src={toChain.icon} className="w-3 h-3 rounded-full" alt="" />
                            {toChain.name}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <input type="text" readOnly value={receiveAmount} placeholder="0.00" className={`w-full bg-transparent text-4xl font-black text-black focus:outline-none tabular-nums ${isQuoting ? 'opacity-30' : ''}`} />
                    <button onClick={() => setShowToSelect(true)} className="flex items-center gap-2 bg-black/5 px-3 py-2 border border-black/5 hover:bg-black/10 transition-colors shrink-0">
                        <TokenLogo symbol={receiveToken?.symbol} logoURI={receiveToken?.logoURI} className="w-5 h-5 rounded-full" fallbackClassName="w-5 h-5" />
                        <span className="font-black text-sm">{receiveToken?.symbol || "Select"}</span>
                        <span className="text-[10px] font-black text-black/40">v</span>
                    </button>
                </div>
                {isQuoting && <div className="text-[10px] text-black/60 font-bold uppercase tracking-widest flex items-center gap-2"><span className="inline-block animate-spin">◌</span> Routing Optimal Path...</div>}
                {quoteError && <div className="text-[10px] text-black font-bold uppercase tracking-widest flex items-center gap-2"><span className="font-black">[!]</span> {quoteError}</div>}
            </div>

            <AnimatePresence>
                {quoteData && !isQuoting && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-black/5 rounded-2xl p-4 border border-black/10 mt-2 space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-black/60 uppercase tracking-widest"><span>Est. Gas Cost</span><span>${safeToFixed(parseFloat(quoteData.estimate.gasCosts?.[0]?.amountUSD || "0"), 2)}</span></div>
                        <div className="flex justify-between text-[10px] font-bold text-black/60 uppercase tracking-widest"><span>Execution Route</span><span>{quoteData.toolDetails?.name || 'Aggregator'}</span></div>
                        {needsApproval && !isWrongNetwork && <div className="flex items-center gap-2 text-[10px] font-black text-black uppercase tracking-widest mt-2 bg-black/10 p-2">[APPROVE] Requires Token Approval Before {mode}</div>}
                    </motion.div>
                )}
            </AnimatePresence>

            <button disabled={(!quoteData || isQuoting || parseFloat(payAmount) > (payToken?.balanceNumeric || 0)) && !isWrongNetwork} onClick={handleExecute} className={`w-full mt-4 py-4 font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group bg-black hover:bg-black/80 disabled:bg-black/10 disabled:text-black/30 text-white`}>
                {isWrongNetwork ? `1. Switch to ${fromChain.name}` : needsApproval ? `1. Approve ${payToken.symbol}` : `Execute ${mode}`} <span className="text-[10px] font-black">{isWrongNetwork ? '[NET]' : '->'}</span>
            </button>

            <AnimatePresence>
                {showFromSelect && <TokenSelector assets={availableFromAssets} currentChainId={fromChain.id} onClose={() => setShowFromSelect(false)} onSelect={setPayToken} />}
                {showToSelect && <TokenSelector assets={[...DEFAULT_TOKENS, ...userAssets]} currentChainId={mode === 'BRIDGE' ? toChain.id : fromChain.id} onClose={() => setShowToSelect(false)} onSelect={setReceiveToken} />}
            </AnimatePresence>
        </motion.div>
    );
}

// -----------------------------------------------------------------------------
// BUY MODULE (Fiat On-Ramp)
// -----------------------------------------------------------------------------
function BuyModule() {
    const { address } = useAccount();
    
    return (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6 flex flex-col items-center justify-center py-8 text-center">
            <div className="border border-black/10 px-4 py-2 inline-block">
                <span className="text-[10px] font-black uppercase tracking-widest text-black">FIAT ON-RAMP</span>
            </div>
            <div className="space-y-3 max-w-[280px]">
                <h3 className="font-black text-black text-lg uppercase tracking-tight">Direct Deposit</h3>
                <p className="text-xs text-black/50 font-medium leading-relaxed">Convert fiat to crypto instantly using Apple Pay, Google Pay, or Bank Transfer. Assets are delivered directly to your on-chain system address.</p>
            </div>
            <div className="bg-black/5 border border-black/10 p-3 w-full flex items-center justify-between mt-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-black/50">Destination Wallet</span>
                <span className="text-xs font-mono font-bold text-black bg-white px-2 py-1 border border-black/5">{address ? `${address.slice(0,6)}...${address.slice(-4)}` : 'Not Connected'}</span>
            </div>
            <a href={`https://pay.coinbase.com/buy/select-asset?appId=humanity_ledger&destinationWallets=[{"address":"${address}","blockchains":["ethereum","polygon","base","arbitrum","optimism"]}]`} target="_blank" rel="noreferrer" className="w-full py-4 bg-black text-white font-black text-[11px] uppercase tracking-[0.2em] hover:bg-black/80 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                Continue with Coinbase <span className="text-[10px] font-black">-&gt;</span>
            </a>
        </motion.div>
    );
}
