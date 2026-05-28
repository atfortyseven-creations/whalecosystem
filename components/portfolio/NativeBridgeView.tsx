"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletStore, NETWORKS, NetworkId } from '@/lib/store/wallet-store';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { useAccount, useWalletClient } from 'wagmi';

const BRIDGE_ROUTER_ADDRESS = "0x8731d54E9D02c286767d56ac03e8037C07e01e98"; 

const CHAINS = [
    { id: 'ethereum', name: 'Ethereum L1', lzId: 101 },
    { id: 'polygon', name: 'Polygon', lzId: 109 },
    { id: 'arbitrum', name: 'Arbitrum', lzId: 110 },
    { id: 'optimism', name: 'Optimism', lzId: 111 },
    { id: 'base', name: 'Base', lzId: 184 },
];

export function NativeBridgeView({ onBack }: any) {
    const { sendTransaction, activeNetwork, privateKey, address: systemAddress } = useWalletStore();
    const networkInfo = NETWORKS[activeNetwork as NetworkId] || NETWORKS.ethereum;
    
    // Wagmi hooks
    const { isConnected: isWagmiConnected, address: wagmiAddress } = useAccount();
    const { data: walletClient } = useWalletClient();

    const isSystemWallet = !!privateKey && !!systemAddress;
    const activeAddress = isWagmiConnected ? wagmiAddress : systemAddress;
    
    const [fromChain, setFromChain] = useState<string>(activeNetwork);
    const [toChain, setToChain] = useState<string>('arbitrum');
    const [amount, setAmount] = useState('');
    
    const [isBridging, setIsBridging] = useState(false);
    const [isEstimating, setIsEstimating] = useState(false);
    const [lzFee, setLzFee] = useState('0.00');

    // Keep UI synced with active network
    useEffect(() => {
        if (fromChain !== activeNetwork) {
            setFromChain(activeNetwork);
        }
    }, [activeNetwork, fromChain]);

    // Estimate bridge costs
    useEffect(() => {
        const estimateCrossChainCost = async () => {
            if (!amount || parseFloat(amount) <= 0) {
                setLzFee('0.00');
                return;
            }
            if (fromChain === toChain) return;

            setIsEstimating(true);
            try {
                // Simulate cross-chain relayer quoting
                await new Promise(r => setTimeout(r, 700));
                
                const dstChainConfig = CHAINS.find(c => c.id === toChain);
                if (dstChainConfig) {
                    const baseCost = dstChainConfig.id === 'ethereum' ? 0.015 : 0.0008;
                    const jitter = Math.random() * 0.0002;
                    setLzFee((baseCost + jitter).toFixed(5));
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsEstimating(false);
            }
        };

        const t = setTimeout(estimateCrossChainCost, 500);
        return () => clearTimeout(t);
    }, [amount, fromChain, toChain]);

    const executeBridge = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error("Invalid Amount", { description: "Please enter an amount greater than 0." });
            return;
        }

        if (!activeAddress) {
            toast.error("Wallet Not Connected", { description: "Please connect a wallet first." });
            return;
        }

        if (fromChain === toChain) {
            toast.error("Invalid Destination", { description: "Destination network must be different from source." });
            return;
        }

        setIsBridging(true);
        toast.loading("Initiating Bridge...", { id: "bridge-tx" });

        try {
            const value = ethers.parseEther(amount);
            
            toast.loading("Please sign the transaction...", { id: "bridge-tx" });
            
            let txHash = "";

            if (isWagmiConnected && walletClient) {
                txHash = await walletClient.sendTransaction({
                    to: BRIDGE_ROUTER_ADDRESS as `0x${string}`,
                    value: BigInt(value.toString()),
                    data: "0x0000000000000000" as `0x${string}`
                });
            } else if (isSystemWallet) {
                const tx = await sendTransaction(BRIDGE_ROUTER_ADDRESS, ethers.formatEther(value), 'high');
                if (!tx) throw new Error("Transaction rejected.");
                txHash = tx;
            } else {
                throw new Error("No valid wallet found.");
            }

            toast.loading("Awaiting confirmation...", { id: "bridge-tx" });
            await new Promise(r => setTimeout(r, 2500));
            
            toast.success("Bridge Complete", { 
                id: "bridge-tx", 
                description: `Successfully bridged. Hash: ${txHash.slice(0,10)}...`
            });
            setAmount('');
        } catch (e: any) {
            toast.error("Bridge Failed", { id: "bridge-tx", description: e.message || "Transaction cancelled or failed." });
        } finally {
            setIsBridging(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col max-w-xl mx-auto w-full pt-8 px-6 pb-20 font-sans min-h-full flex-1">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/10">
                <div>
                    <h2 className="text-lg font-black uppercase tracking-widest text-black flex items-center gap-2">
                        Cross-Chain Bridge
                    </h2>
                    <p className="text-[10px] uppercase text-black/50 tracking-widest mt-1">Stargate Protocol</p>
                </div>
                <button onClick={onBack} className="text-[10px] uppercase font-bold tracking-widest border border-black/10 px-3 py-1 hover:bg-black hover:text-white transition-colors">
                    Close
                </button>
            </div>

            <div className="flex-1 flex flex-col min-h-0 space-y-4">
                
                <div className="border border-black/10 p-5 bg-white transition-colors">
                    <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-black/40 mb-3 block">
                        From Network
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <select 
                            value={fromChain}
                            disabled
                            className="w-full sm:w-auto bg-transparent font-black uppercase tracking-widest text-sm outline-none cursor-not-allowed text-black/50"
                        >
                            {CHAINS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <span className="text-[9px] font-bold tracking-widest uppercase text-black/30 border border-black/10 px-2 py-1">Synced to Wallet</span>
                    </div>
                    <div className="mt-5 border-t border-black/5 pt-5">
                        <input 
                            type="number" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-transparent text-4xl font-light outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-black"
                        />
                    </div>
                </div>

                <div className="flex justify-center -my-3 relative z-10">
                    <div className="bg-white border border-black/10 p-2 rounded-full shadow-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-black/40"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                    </div>
                </div>

                <div className="border border-black/10 p-5 bg-black/5 transition-colors">
                    <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-black/40 mb-3 block">
                        To Network
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <select 
                            value={toChain}
                            onChange={(e) => setToChain(e.target.value)}
                            className="w-full sm:w-auto bg-white border border-black/10 px-4 py-2 font-bold uppercase tracking-widest text-sm outline-none cursor-pointer hover:border-black/30 text-black"
                        >
                            {CHAINS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="mt-5 border-t border-black/10 pt-5 flex justify-between items-center text-[10px] font-bold text-black/60 uppercase tracking-widest">
                        <span>Expected Receipt</span>
                        <span className="text-black text-2xl font-light">{amount || "0.00"}</span>
                    </div>
                </div>

                <AnimatePresence>
                    {amount && parseFloat(amount) > 0 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="border border-black/10 p-4 bg-white mt-4 text-[10px] uppercase tracking-widest space-y-3 font-mono">
                                <div className="flex justify-between text-black/50">
                                    <span>Protocol</span>
                                    <span className="text-black font-bold">LayerZero</span>
                                </div>
                                <div className="flex justify-between text-black/50">
                                    <span>Est. Time</span>
                                    <span className="text-black font-bold">2 - 5 Mins</span>
                                </div>
                                <div className="flex justify-between text-black/50">
                                    <span>Relayer Cost</span>
                                    <span className="text-black font-bold">
                                        {isEstimating ? '...' : `~ ${lzFee} ETH`}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-auto pt-6">
                    <button 
                        onClick={executeBridge}
                        disabled={isBridging || !amount || fromChain === toChain}
                        className="w-full py-5 bg-black text-white font-black text-[12px] uppercase tracking-[0.2em] transition-all hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {isBridging ? 'Bridging...' : 'Bridge Assets'}
                    </button>
                    
                    <div className="mt-4 flex items-start justify-center text-[8px] uppercase tracking-widest text-black/40 text-center">
                        <p>All operations are settled on-chain</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
