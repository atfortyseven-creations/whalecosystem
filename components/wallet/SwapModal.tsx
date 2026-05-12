"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowDown, Settings, Loader2, RefreshCw, Zap, Sparkles, Route } from "lucide-react";
import { useAccount, useBalance, useWriteContract, useChainId } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { useEliteSwap } from "@/hooks/useEliteSwap";
import { toast } from "sonner";

// Constants for Mock Solver
const TOKENS = [
    { symbol: "ETH", name: "Ethereum", icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png", chain: "Ethereum", color: "bg-blue-600" },
    { symbol: "USDC", name: "USD Coin", icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png", chain: "Polygon", color: "bg-blue-500" },
    { symbol: "MATIC", name: "Polygon", icon: "https://cryptologos.cc/logos/polygon-matic-logo.png", chain: "Polygon", color: "bg-purple-600" },
    { symbol: "BTC", name: "Bitcoin", icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.png", chain: "Bitcoin", color: "bg-orange-500" },
];

interface SwapModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SwapModal({ isOpen, onClose }: SwapModalProps) {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { executeSwap, loading: swapLoading, error: swapError, status: swapStatus } = useEliteSwap();
    const [payAmount, setPayAmount] = useState("");
    const [receiveAmount, setReceiveAmount] = useState("");
    
    // Intent State
    const [payToken, setPayToken] = useState(TOKENS[0]); // Default ETH
    const [receiveToken, setReceiveToken] = useState(TOKENS[1]); // Default USDC
    const [route, setRoute] = useState<string | null>(null);

    // Real Quote Logic
    useEffect(() => {
        if (!payAmount || parseFloat(payAmount) <= 0) {
            setReceiveAmount("");
            setRoute(null);
            return;
        }

        const fetchQuote = async () => {
            try {
                // LiFi expects amount in base units (e.g., wei)
                // For simplicity, we'll assume 18 decimals for the input for now, 
                // but real implementation would fetch decimals.
                const amountBase = parseUnits(payAmount, 18).toString();
                
                const res = await fetch(`https://li.quest/v1/quote?fromChain=${chainId}&toChain=${chainId}&fromToken=${payToken.symbol}&toToken=${receiveToken.symbol}&fromAmount=${amountBase}&fromAddress=${address || '0x0000000000000000000000000000000000000000'}`);
                
                if (res.ok) {
                    const data = await res.json();
                    setReceiveAmount(formatUnits(BigInt(data.estimate.toAmount), data.action.toToken.decimals));
                    setRoute(`Best Route: ${data.transactionRequest.to.slice(0, 10)}... via ${data.tool}`);
                }
            } catch (e) {
                console.error("Quote fetch failed", e);
            }
        };

        const timer = setTimeout(fetchQuote, 500);
        return () => clearTimeout(timer);
    }, [payAmount, payToken, receiveToken, chainId, address]);


    const handleSwap = async () => {
        if (!address) {
            toast.error("Please connect your wallet first");
            return;
        }

        toast.promise(
            executeSwap({
                fromChain: chainId,
                toChain: chainId,
                fromToken: payToken.symbol,
                toToken: receiveToken.symbol,
                fromAmount: parseUnits(payAmount, 18).toString()
            }),
            {
                loading: 'Signing and executing swap...',
                success: (hash) => {
                    setTimeout(onClose, 2000);
                    return `Swap successful! Hash: ${hash.slice(0, 10)}...`;
                },
                error: (err) => `Swap failed: ${err.message || 'Unknown error'}`,
            }
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none p-4"
                    >
                        <div className="w-full max-w-md bg-[#050505] border border-white/10 rounded-[40px] shadow-[0_0_80px_-20px_rgba(var(--aztec-orchid-rgb),0.3)] overflow-hidden pointer-events-auto relative backdrop-blur-2xl">
                            
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 pb-2 border-b border-white/5 bg-white/[0.02]">
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                                        <Zap size={20} className="text-[var(--aztec-orchid)]" />
                                        Smart Swap
                                    </h2>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-1">Invisible Bridging Active</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-white/60" />
                                </button>
                            </div>

                            <div className="p-6 space-y-2 bg-[#050505]">
                                {/* PAY INPUT */}
                                <div className="bg-white/[0.02] p-5 rounded-[32px] border border-white/5 hover:border-[var(--aztec-orchid)]/50 transition-all group relative overflow-hidden">
                                    <div className="flex justify-between text-[10px] font-black text-white/40 mb-3 uppercase tracking-[0.15em]">
                                        <span>You Pay</span>
                                        <span className="font-mono">Balance: 2.45 ETH</span>
                                    </div>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <input 
                                            type="number" 
                                            value={payAmount}
                                            onChange={(e) => setPayAmount(e.target.value)}
                                            placeholder="0.00" 
                                            className="w-full bg-transparent text-4xl font-black font-mono text-white focus:outline-none placeholder:text-white/10"
                                        />
                                        <button className="flex items-center gap-2 bg-white/10 text-white px-4 py-2.5 rounded-full hover:bg-white/20 transition-all border border-white/10 shrink-0">
                                            <span className="font-black text-xs uppercase tracking-wider">{payToken.symbol}</span>
                                        </button>
                                    </div>
                                    <div className="mt-3 text-[9px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1.5">
                                        <Route size={10} /> Route via {payToken.chain}
                                    </div>
                                </div>

                                {/* SWITCHER */}
                                <div className="relative h-4 z-10 flex justify-center">
                                    <div className="absolute -top-4 bg-[#050505] p-1.5 rounded-2xl border border-white/5 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                                        <div className="bg-white/5 p-2 rounded-xl text-[var(--aztec-orchid)] hover:text-white hover:bg-[var(--aztec-orchid)] transition-all cursor-pointer">
                                            <ArrowDown size={18} />
                                        </div>
                                    </div>
                                </div>

                                {/* RECEIVE INPUT */}
                                <div className="bg-white/[0.02] p-5 rounded-[32px] border border-white/5 hover:border-[var(--aztec-orchid)]/50 transition-all group relative overflow-hidden">
                                    <div className="flex justify-between text-[10px] font-black text-white/40 mb-3 uppercase tracking-[0.15em]">
                                        <span>You Receive</span>
                                        {swapStatus === 'quoting' && <span className="flex items-center gap-1.5 text-[var(--aztec-orchid)]"><Loader2 size={10} className="animate-spin"/> Routing...</span>}
                                    </div>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <input 
                                            type="text" 
                                            value={receiveAmount}
                                            readOnly
                                            placeholder="0.00" 
                                            className={`w-full bg-transparent text-4xl font-black font-mono text-white focus:outline-none placeholder:text-white/10 transition-opacity ${swapStatus === 'quoting' ? 'opacity-30' : 'opacity-100'}`}
                                        />
                                        <button className="flex items-center gap-2 bg-white/10 text-white px-4 py-2.5 rounded-full hover:bg-white/20 transition-all border border-white/10 shrink-0">
                                            <span className="font-black text-xs uppercase tracking-wider">{receiveToken.symbol}</span>
                                        </button>
                                    </div>
                                    <div className="mt-3 text-[9px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1.5">
                                        <Route size={10} /> Route via {receiveToken.chain}
                                    </div>
                                </div>

                                {/* SOLVER INFO */}
                                <AnimatePresence>
                                    {route && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0, y: -10 }}
                                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                                            className="bg-white/[0.03] border border-white/5 p-4 rounded-3xl mt-4 flex items-center justify-between overflow-hidden relative"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-[var(--aztec-orchid)]/5 to-transparent pointer-events-none" />
                                            <div className="flex items-center gap-3 relative z-10">
                                                <div className="p-2 bg-[var(--aztec-orchid)]/10 rounded-full text-[var(--aztec-orchid)]">
                                                    <Sparkles size={14} />
                                                </div>
                                                <div>
                                                    <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Flashbots Solver Route</div>
                                                    <div className="font-mono text-xs font-black text-white/90 mt-0.5">{route}</div>
                                                </div>
                                            </div>
                                            <div className="text-green-400 font-black text-[9px] uppercase tracking-widest bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-lg relative z-10 flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                                0-Conf
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* ACTION BUTTON */}
                                <button 
                                    disabled={!payAmount || swapLoading || swapStatus === 'quoting'}
                                    onClick={handleSwap}
                                    className="w-full py-5 mt-4 bg-[var(--aztec-orchid)] text-black rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(var(--aztec-orchid-rgb),0.3)] hover:brightness-110 active:scale-95 disabled:opacity-30 disabled:scale-100 disabled:shadow-none transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    {swapStatus === 'quoting' ? (
                                        <>Awaiting Route Matrix...</>
                                    ) : (
                                        <>
                                            <Zap fill="currentColor" size={16} />
                                            {swapStatus === 'signing' ? 'AWAITING WALLET SIGNATURE' : 'EXECUTE TACTICAL SWAP'}
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

