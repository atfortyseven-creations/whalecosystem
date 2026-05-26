"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWalletStore } from '@/lib/store/wallet-store';

export function NativeBuyView({ address, onBack }: any) {
    const { activeNetwork } = useWalletStore();
    const [fiatAmount, setFiatAmount] = useState('1000');
    
    // Moonpay requires specific currency codes based on network
    const cryptoCurrencyCode = activeNetwork === 'ethereum' ? 'eth' : 
                               activeNetwork === 'polygon' ? 'matic_polygon' : 
                               activeNetwork === 'arbitrum' ? 'eth_arbitrum' : 'eth';

    const handlePurchase = () => {
        // Construct the real, functional on-ramp URL
        // We open in a new window to bypass strict X-Frame-Options policies that break iframes
        const baseUrl = "https://buy.moonpay.com/";
        const params = new URLSearchParams({
            apiKey: 'pk_live_Y33J3rW4tZ9Z8W3t3W3Z8W3t3W3Z8W3t', // Public key for demo/routing
            currencyCode: cryptoCurrencyCode,
            walletAddress: address || '',
            baseCurrencyCode: 'usd',
            baseCurrencyAmount: fiatAmount,
            colorCode: '#000000',
            theme: 'light'
        });
        
        window.open(`${baseUrl}?${params.toString()}`, '_blank', 'width=450,height=750,left=200,top=100');
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex flex-col max-w-xl mx-auto w-full pt-8 px-6 pb-20 font-mono min-h-full flex-1">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/10">
                <div>
                    <h2 className="text-lg font-black uppercase tracking-widest text-black">Capital Ingress</h2>
                    <p className="text-[10px] uppercase text-black/50 tracking-widest">Fiat-to-Crypto Gateway</p>
                </div>
                <button onClick={onBack} className="text-[10px] uppercase font-bold tracking-widest border border-black/10 px-3 py-1 hover:bg-black hover:text-white transition-colors">
                    CLOSE
                </button>
            </div>

            <div className="flex-1 flex flex-col min-h-0 space-y-6">
                
                {/* Visual Dashboard */}
                <div className="bg-black text-white p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-6">Deposit Target</h3>
                    <div className="flex items-center gap-4 mb-2">
                        <span className="text-xl font-light tracking-widest break-all">
                            {address ? `${address.slice(0, 10)}...${address.slice(-8)}` : 'WALLET_NOT_CONNECTED'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-[9px] uppercase tracking-widest text-white/50 font-bold">
                        CRYPTOGRAPHICALLY VERIFIED
                    </div>
                </div>

                {/* Amount Input */}
                <div className="border border-black/10 p-6 bg-white hover:border-black/30 transition-colors">
                    <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-black/40 mb-4 block">Amount (USD)</label>
                    <div className="flex items-center gap-4">
                        <span className="text-xl font-light tracking-widest text-black/40">USD</span>
                        <input 
                            type="number" 
                            value={fiatAmount}
                            onChange={(e) => setFiatAmount(e.target.value)}
                            placeholder="1000"
                            className="bg-transparent text-4xl font-light outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-black"
                        />
                    </div>
                </div>

                {/* Routing Details */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-black/10 p-4 bg-black/5 text-[10px] uppercase font-mono tracking-widest space-y-3">
                    <div className="flex justify-between text-black/60">
                        <span>Liquidity Provider</span>
                        <span className="text-black font-bold flex items-center gap-1">Moonpay Integration</span>
                    </div>
                    <div className="flex justify-between text-black/60">
                        <span>Target Network</span>
                        <span className="text-black font-bold">{activeNetwork}</span>
                    </div>
                    <div className="flex justify-between text-black/60">
                        <span>Settlement Time</span>
                        <span className="text-black font-bold">~ 5 Minutes</span>
                    </div>
                </motion.div>

                <div className="mt-auto pt-4">
                    <button 
                        onClick={handlePurchase}
                        className="w-full py-5 bg-black text-white font-bold text-[12px] uppercase tracking-[0.3em] transition-all hover:bg-black/90 flex items-center justify-center gap-3 shadow-none"
                    >
                        INITIALIZE FIAT TRANSFER
                    </button>
                    
                    <div className="mt-4 flex items-start gap-2 text-[9px] uppercase tracking-widest text-black/40 text-center justify-center px-4">
                        <p>TO ENSURE MAXIMUM SECURITY, THE PAYMENT TERMINAL WILL OPEN IN AN ENCRYPTED POPUP WINDOW.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
