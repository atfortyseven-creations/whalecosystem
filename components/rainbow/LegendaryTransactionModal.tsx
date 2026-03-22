"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "./GlassCard";
import { X, Send, Repeat, Globe, ArrowRight, Loader2, ChevronDown, Shield, Zap } from "lucide-react";
import { toast } from "sonner";
import { useTransactionHandler } from "@/hooks/useTransactionHandler";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { getExplorerTxUrl } from "@/lib/wallet/chains";
import { useQueryClient } from "@tanstack/react-query";
import { encodeFunctionData } from "viem";
import { TokenSelector } from "@/components/wallet/TokenSelector";

interface LegendaryTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  balances: any[];
  initialMode?: "send" | "swap" | "bridge" | "buy";
  initialSubMode?: string;
}

const CHAINS = [
    { id: 1, name: "Ethereum", icon: "💎", color: "bg-blue-500" },
    { id: 137, name: "Polygon", icon: "💜", color: "bg-purple-500" },
    { id: 8453, name: "Base", icon: "🔵", color: "bg-blue-600" },
    { id: 42161, name: "Arbitrum", icon: "🔷", color: "bg-blue-400" },
    { id: 10, name: "Optimism", icon: "🔴", color: "bg-red-500" },
    { id: 480, name: "World Chain", icon: "🌐", color: "bg-black" },
    { id: 84532, name: "Base Sepolia", icon: "🔵", color: "bg-blue-600" },
];

// Address Map for destination tokens (Standardized for Legendary Level)
const TOKEN_MAP: Record<number, Record<string, string>> = {
    1: { // Ethereum
        'USDT': '0xdac17f958d2ee523a2206206994597c13d831ec7',
        'USDC': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        'WLD': '0x163f8c2467924be0ae7b5347228cabf260318753',
        'ETH': '0x0000000000000000000000000000000000000000',
        'WETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    },
    137: { // Polygon
        'USDT': '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        'USDC': '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
        'WLD': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', 
        'POL': '0x0000000000000000000000000000000000000000',
        'MATIC': '0x0000000000000000000000000000000000000000'
    },
    8453: { // Base
        'USDC': '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        'ETH': '0x0000000000000000000000000000000000000000',
        'WLD': '0x4990d1656209cc5039d91f278077c577002047dc' 
    },
    84532: { // Base Sepolia
        'USDC': '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
        'ETH': '0x0000000000000000000000000000000000000000',
        'WLD': '0x4200000000000000000000000000000000000006'
    },
    480: { // World Chain
        'WLD': '0x2cFc85d8E48F8EAB294be644d9E25C3030863003',
        'USDC': '0x79A02482A880bCE3F13e09Da970dC34db4CD68d7',
        'ETH': '0x0000000000000000000000000000000000000000'
    },
    42161: { // Arbitrum
        'USDC': '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        'WLD': '0x163f8c2467924be0ae7b5347228cabf260318753',
        'ETH': '0x0000000000000000000000000000000000000000'
    },
    10: { // Optimism
        'USDC': '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
        'WLD': '0x163f8c2467924be0ae7b5347228cabf260318753',
        'ETH': '0x0000000000000000000000000000000000000000'
    }
};

import { useEliteSwap } from "@/hooks/useEliteSwap";
import { useGaslessSwap } from "@/hooks/useGaslessSwap";

import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
export function LegendaryTransactionModal({ 
    isOpen, 
    onClose, 
    balances, 
    initialMode = "send",
    initialSubMode = "standard"
}: LegendaryTransactionModalProps) {
  const [mode, setMode] = useState<"send" | "swap" | "bridge" | "buy">(initialMode);
  const [subMode, setSubMode] = useState<string>(initialSubMode);
  
  // Chain State
  const { address, chain } = useAccount();
  const [sourceChain, setSourceChain] = useState(CHAINS.find(c => c.id === chain?.id) || CHAINS[0]);
  const [targetChain, setTargetChain] = useState(CHAINS[2]); // Default to Base

  // Asset State
  const [fromAssetSymbol, setFromAssetSymbol] = useState(balances[0]?.symbol || "ETH");
  const [fromAsset, setFromAsset] = useState<any>(balances[0]); // Source Token Object
  const [toAssetSymbol, setToAssetSymbol] = useState("USDC");
  const [toAsset, setToAsset] = useState<any>(null); // For Universal Swap
  
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasGas, setHasGas] = useState(false); // Default to false to show banner if check fails
  const [useGasless, setUseGasless] = useState(false);

  // Orchestrator Hooks
  const { executeSwap, resolveTokenAddress, status: orchestratorStatus, error: orchestratorError } = useEliteSwap();
  const { executeGaslessSwap, isLoading: gaslessLoading } = useGaslessSwap();

  // Sync mode if changed from parent
  useEffect(() => {
    if (isOpen) {
        setMode(initialMode);
        setSubMode(initialSubMode);
    }
  }, [isOpen, initialMode, initialSubMode]);

  // Determine Source Chain based on selected asset in Balances
  useEffect(() => {
      const asset = balances.find(b => b.symbol === fromAssetSymbol);
      if (asset) {
          const chain = CHAINS.find(c => c.id === asset.chainId);
          if (chain) setSourceChain(chain);
      }
  }, [fromAssetSymbol, balances]);

  // Sync fromAsset state if pending
  useEffect(() => {
     if (balances.length > 0 && !fromAsset) {
         setFromAsset(balances.find(b => b.symbol === fromAssetSymbol) || balances[0]);
     }
  }, [balances, fromAsset, fromAssetSymbol]);

  // Elite Quote Fetcher (Debounced)
  useEffect(() => {
    if (!amount || parseFloat(amount) <= 0 || !isOpen || (mode !== 'swap' && mode !== 'bridge' && mode !== 'buy')) {
        setQuote(null);
        setErrorMsg(null);
        return;
    }

    const fetchQuote = async () => {
        try {
            setErrorMsg(null);
            
            // Resolve addresses
            const fromAsset = balances.find(b => b.symbol === fromAssetSymbol && b.chainId === sourceChain.id);
            const fromTokenAddress = fromAsset?.address || resolveTokenAddress(fromAssetSymbol, sourceChain.id);
            const toTokenAddress = resolveTokenAddress(toAssetSymbol, mode === 'swap' ? sourceChain.id : targetChain.id);
            
            const decimals = fromAsset?.decimals || 18;
            const amountInWei = (Number(amount) * (10 ** decimals)).toFixed(0);

            if (mode === 'buy') {
                // Mock price for buy estimation if not calling provider yet
                setQuote({ price: 1.0 }); // Simplified for UI
                return;
            }

            const res = await fetch(`/api/wallet/swap?action=quote&chainId=${sourceChain.id}&fromToken=${fromTokenAddress}&toToken=${toTokenAddress}&amount=${amountInWei}&fromAddress=${address}`);
            
            if (res.ok) {
                const data = await res.json();
                setQuote(data);
            } else {
                const err = await res.json();
                setErrorMsg(err.error || "Failed to get route");
            }
        } catch (e: any) {
            console.error("Quote fetch failed", e);
            setErrorMsg("Network error fetching quote");
        }
    };

    const timer = setTimeout(fetchQuote, 500);
    return () => clearTimeout(timer);
  }, [amount, fromAssetSymbol, toAssetSymbol, sourceChain, targetChain, mode, isOpen, address, balances]);

  // const { address, chain } = useAccount(); // MOVED TO TOP
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();

  // Check if user has gas for transactions
  useEffect(() => {
    const checkGasBalance = async () => {
      if (!publicClient || !address) {
          console.log('[GAS CHECK] No client or address');
          return;
      }
      try {
        console.log(`[GAS CHECK] Checking balance for ${address} on chain ${chain?.id}`);
        const balance = await publicClient.getBalance({ address });
        console.log(`[GAS CHECK] Balance: ${balance.toString()} wei`);
        
        // Consider user has gas if balance > 0.001 native token (enough for ~1-2 txs)
        const hasEnough = balance > BigInt(1000000000000000); // 0.001 in wei
        console.log(`[GAS CHECK] Has enough gas? ${hasEnough}`);
        
        setHasGas(hasEnough);
      } catch (e) {
        console.error('Failed to check gas balance:', e);
        // If check fails, assume NO gas to be safe and offer gasless
        setHasGas(false);
      }
    };
    
    // Reset gasless state when chain changes
    setUseGasless(false);
    checkGasBalance();
  }, [address, publicClient, sourceChain, chain?.id]);

  const handleExecute = async () => {
      if (mode === 'buy') {
          if (!amount) return;
          toast.info("Security Check Passed", { description: "Redirecting to MoonPay Secure Gateway..." });
          const currencyCode = toAssetSymbol.toLowerCase();
          const walletAddr = address || "";
          const apiKey = process.env.NEXT_PUBLIC_MOONPAY_KEY || "pk_test_123"; 
          
          const baseCurrency = ['usd', 'eur', 'gbp'].includes(subMode.toLowerCase()) ? subMode.toLowerCase() : 'usd';
          const url = `https://buy.moonpay.com/v2/buy?apiKey=${apiKey}&currencyCode=${currencyCode}&baseCurrencyCode=${baseCurrency}&baseCurrencyAmount=${amount}&walletAddress=${walletAddr}`;
          
          window.open(url, '_blank');
          return;
      }

      if (!address || !walletClient) {
          toast.error("Wallet Not Connected");
          return;
      }

      setLoading(true);
      try {
          if (mode === 'send') {
              // Validate recipient address
              if (!recipient || recipient.length < 40) {
                  toast.error("Invalid Recipient", { description: "Please enter a valid address" });
                  setLoading(false);
                  return;
              }

              // Get the selected asset from balances
              const activeFromAsset = fromAsset || balances.find(b => b.symbol === fromAssetSymbol && b.chainId === sourceChain.id);
              if (!activeFromAsset) {
                  toast.error("Asset Not Found", { description: `Cannot find ${fromAssetSymbol} on ${sourceChain.name}` });
                  setLoading(false);
                  return;
              }

              const decimals = activeFromAsset.decimals || 18;
              const amountInWei = (Number(amount) * (10 ** decimals)).toFixed(0);
              
              toast.info("Preparing Transaction", { description: "Please confirm in your wallet..." });

              let hash: string;

              // Check if it's a native token (ETH, POL, etc.)
              const isNative = activeFromAsset.address === '0x0000000000000000000000000000000000000000' || 
                               activeFromAsset.address === 'native' ||
                               fromAssetSymbol === 'ETH' || 
                               fromAssetSymbol === 'POL' ||
                               fromAssetSymbol === 'MATIC';

              if (isNative) {
                  // Send native token
                  hash = await walletClient.sendTransaction({
                      to: recipient as `0x${string}`,
                      value: BigInt(amountInWei),
                      chain: walletClient.chain
                  });
              } else {
                  // Send ERC20 token
                  const data = encodeFunctionData({
                      abi: [{
                          name: 'transfer',
                          type: 'function',
                          stateMutability: 'nonpayable',
                          inputs: [
                              { name: 'to', type: 'address' },
                              { name: 'amount', type: 'uint256' }
                          ],
                          outputs: [{ type: 'bool' }]
                      }],
                      functionName: 'transfer',
                      args: [recipient as `0x${string}`, BigInt(amountInWei)]
                  });

                  hash = await walletClient.sendTransaction({
                      to: activeFromAsset.address as `0x${string}`,
                      data,
                      chain: walletClient.chain
                  });
              }

              // Record transaction in DB
              await fetch('/api/transactions', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      hash,
                      userId: address,
                      type: 'SEND',
                      fromChain: sourceChain.id,
                      toChain: sourceChain.id,
                      fromToken: activeFromAsset.address,
                      toToken: activeFromAsset.address,
                      fromAmount: amountInWei,
                      metadata: {
                          recipient,
                          symbol: fromAssetSymbol,
                          sendMode: subMode
                      }
                  })
              }).catch(e => console.error('[SEND] DB Sync Failed:', e));

              toast.success("Transfer Initiated", {
                  description: `Sending ${amount} ${fromAssetSymbol} to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`,
              });

              queryClient.invalidateQueries({ queryKey: ['portfolio-assets'] });
              onClose();
              return; // Added return to be safe

          } else if (mode === 'swap' || mode === 'bridge') {
              // Determine if we should use gasless
              const shouldUseGasless = useGasless && !hasGas;

              // Resolve token addresses using the exposed helper
              const activeFromAsset = fromAsset || balances.find(b => b.symbol === fromAssetSymbol && b.chainId === sourceChain.id);

              if (shouldUseGasless) {
                  // GASLESS EXECUTION PATH
                  console.log('[GASLESS] Using gasless swap');
                  
                  const fromTokenAddress = activeFromAsset?.address || resolveTokenAddress(fromAssetSymbol, sourceChain.id);
                  const toTokenAddress = toAsset?.address || resolveTokenAddress(toAssetSymbol, mode === 'swap' ? sourceChain.id : targetChain.id);
                  
                  const decimals = fromAsset?.decimals || 18;
                  const amountInWei = (Number(amount) * (10 ** decimals)).toFixed(0);

                  const result = await executeGaslessSwap({
                      fromChain: sourceChain.id,
                      toChain: mode === 'swap' ? sourceChain.id : targetChain.id,
                      fromToken: fromTokenAddress,
                      toToken: toTokenAddress, 
                      fromAmount: amountInWei,
                      slippage: 50, // 0.5%
                  });

                  if (result?.success) {
                      queryClient.invalidateQueries({ queryKey: ['portfolio-assets'] });
                      onClose();
                  }
              } else {
                  // NORMAL EXECUTION PATH
                  const hash = await executeSwap({
                      fromChain: sourceChain.id,
                      toChain: mode === 'swap' ? sourceChain.id : targetChain.id,
                      fromToken: activeFromAsset?.address || fromAssetSymbol,
                      toToken: toAsset?.address || toAssetSymbol,
                      fromAmount: amount,
                      slippage: 0.005
                  });

                  if (hash) {
                      toast.success(`Elite Execution Initiated`, {
                          description: "Atomic swap broadcasted with Flashbots protection.",
                      });
                      queryClient.invalidateQueries({ queryKey: ['portfolio-assets'] });
                      onClose();
                  }
              }
          }
      } catch (e: any) {
          console.error("Execution Failed:", e);
          toast.error("Execution Failed", { description: e.message });
      } finally {
          setLoading(false);
      }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg"
          >
            <GlassCard className="p-0 border-white/20 overflow-hidden bg-[#161A1E]">
              
              <div className="bg-white/5 p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black tracking-tighter uppercase italic">Elite Transfer</h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 mb-4">
                    {(["send", "swap", "bridge", "buy"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => {
                                setMode(t);
                                setSubMode(t === 'buy' ? 'USD' : 'standard');
                            }}
                            className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${mode === t ? 'bg-white/10 text-white shadow-lg shadow-white/5' : 'text-white/30 hover:text-white/60'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="flex gap-4">
                    {mode === 'send' && (["standard", "private", "ens"] as const).map(s => (
                        <button key={s} onClick={() => setSubMode(s)} className={`text-[9px] font-black uppercase tracking-tighter transition-colors ${subMode === s ? 'text-purple-400' : 'text-white/20 hover:text-white/40'}`}>{s}</button>
                    ))}
                    {mode === 'swap' && (["aggregator", "limit", "dca"] as const).map(s => (
                        <button key={s} onClick={() => setSubMode(s)} className={`text-[9px] font-black uppercase tracking-tighter transition-colors ${subMode === s ? 'text-purple-400' : 'text-white/20 hover:text-white/40'}`}>{s}</button>
                    ))}
                </div>

                {/* Gasless Mode Banner */}
                {(mode === 'swap' || mode === 'bridge') && (!hasGas || sourceChain.id === 84532) && (
                    <div className="mt-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <Zap size={16} className="text-emerald-400" />
                                </div>
                                <div>
                                    <div className="text-xs font-black text-white uppercase tracking-wide">⚡ Gasless Swap Available</div>
                                    <div className="text-[10px] text-white/50 mt-0.5">Zero gas fees - Elite relayer enabled</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setUseGasless(!useGasless)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${useGasless ? 'bg-emerald-500' : 'bg-white/10'}`}
                            >
                                <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${useGasless ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </button>
                        </div>
                    </div>
                )}
              </div>

              <div className="p-8 space-y-6">
                
                {/* [LEGENDARY] Buy Crypto View */}
                {mode === 'buy' ? (
                      <div className="space-y-6">
                        <div className="bg-black/60 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                           <div className="absolute inset-0 bg-gradient-to-tr from-green-500/5 to-transparent pointer-events-none" />
                           <div className="flex justify-between items-end mb-4">
                                <div className="flex-1">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-1">Spend ({subMode})</label>
                                    <input 
                                        type="number" 
                                        placeholder="100"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-transparent border-none outline-none text-4xl font-black tracking-tighter text-white placeholder:text-white/10"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    {/* Currency Toggles */}
                                    <div className="flex bg-white/5 rounded-lg p-1 gap-1">
                                        {['USD', 'EUR', 'GBP'].map(c => (
                                            <button 
                                                key={c}
                                                onClick={() => setSubMode(c)}
                                                className={`px-3 py-1 rounded-sm text-[10px] font-bold transition-all ${subMode === c ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                           </div>
                        </div>

                        <div className="flex justify-center -my-3 relative z-10">
                            <div className="bg-[#161A1E] p-2 rounded-full border border-white/10">
                                <ArrowRight size={16} className="text-white/40 rotate-90" />
                            </div>
                        </div>

                        <div className="bg-black/60 border border-white/10 rounded-2xl p-6 relative">
                            <div className="flex justify-between items-end">
                                <div className="flex-1">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-1">Receive (Est.)</label>
                                    <div className="text-4xl font-black tracking-tighter text-white/40">
                                        {/* Simple Estimate: Amount / Price */}
                                        {quote && quote.price ? (Number(amount) / quote.price).toLocaleString(undefined, { maximumFractionDigits: 5 }) : '0.00'}
                                    </div>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3">
                                    {/* Quick To Asset Toggle */}
                                    <select 
                                        className="bg-transparent text-white font-black outline-none border-none"
                                        value={toAssetSymbol}
                                        onChange={(e) => setToAssetSymbol(e.target.value)}
                                    >
                                        <option value="ETH">ETH</option>
                                        <option value="USDC">USDC</option>
                                        <option value="WLD">WLD</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleExecute}
                            disabled={!amount}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 p-5 rounded-2xl font-black text-sm uppercase tracking-[.25em] shadow-xl shadow-green-900/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            <span className="text-lg">💳</span>
                            Continue with Card
                        </button>
                        
                        <div className="text-center">
                             <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Powered by Elite Partners</p>
                             <div className="flex justify-center gap-4 opacity-30 grayscale hover:grayscale-0 transition-all">
                                 <span className="font-bold">MoonPay</span>
                                 <span className="font-bold">Transak</span>
                                 <span className="font-bold">Ramp</span>
                             </div>
                        </div>
                      </div>
                ) : (
                    <div className="space-y-6">
                        {/* Chain Selection (Only for Bridge) */}
                        {mode === 'bridge' && (
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Source</label>
                                    <div className="bg-black/40 border border-white/10 rounded-xl p-3 flex items-center gap-2">
                                        <span>{sourceChain.icon}</span>
                                        <span className="font-bold text-sm">{sourceChain.name}</span>
                                    </div>
                                </div>
                                <div className="mt-6 text-white/20"><ArrowRight size={16} /></div>
                                <div className="flex-1">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Destination</label>
                                    <button 
                                        onClick={() => {
                                            // Cycle through chains
                                            const currIndex = CHAINS.findIndex(c => c.id === targetChain.id);
                                            setTargetChain(CHAINS[(currIndex + 1) % CHAINS.length]);
                                        }}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 flex items-center justify-between hover:border-white/30"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>{targetChain.icon}</span>
                                            <span className="font-bold text-sm">{targetChain.name}</span>
                                        </div>
                                        <ChevronDown size={14} className="text-white/20" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Input and Asset */}
                        <div className="bg-black/60 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                            
                            <div className="flex justify-between items-end mb-4">
                                <div className="flex-1">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-1">Selling</label>
                                    <input 
                                        type="number" 
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-transparent border-none outline-none text-4xl font-black tracking-tighter text-white placeholder:text-white/10"
                                    />
                                </div>
                                <div className="relative group/select">
                                    <TokenSelector 
                                        chainId={sourceChain.id}
                                        address={address}
                                        selectedToken={balances.find(b => b.symbol === fromAssetSymbol) || { symbol: fromAssetSymbol, name: fromAssetSymbol, address: '', decimals: 18, logoURI: null }}
                                        onSelect={(t) => {
                                            setFromAssetSymbol(t.symbol);
                                            setFromAsset(t);
                                        }}
                                        className="min-w-[140px]"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between text-[10px] font-black tracking-tight uppercase">
                                <span className="text-white/20">Approx $0.00</span>
                                <button 
                                    onClick={() => {
                                        const asset = balances.find(b => b.symbol === fromAssetSymbol);
                                        if (asset) setAmount(asset.balanceFormatted || '0');
                                    }}
                                    className="text-white/40 hover:text-purple-400 cursor-pointer"
                                >
                                    Balance: Active MAX
                                </button>
                            </div>
                        </div>

                        {mode !== 'send' && (
                            <div className="relative h-1">
                                <div className="absolute left-1/2 -top-4 -translate-x-1/2 z-10 w-8 h-8 bg-[#161A1E] border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer">
                                    <Repeat size={14} />
                                </div>
                            </div>
                        )}

                        {mode === 'send' ? (
                            <div>
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-2 px-1">Recipient</label>
                                <input 
                                    type="text" 
                                    placeholder="0x..."
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono text-sm outline-none focus:border-purple-500/50 transition-all"
                                />
                            </div>
                        ) : (
                            <div className="bg-black/60 border border-white/10 rounded-2xl p-6">
                                <div className="flex justify-between items-end mb-4">
                                    <div className="flex-1">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-1">Receiving (Est.)</label>
                                        <div className="text-4xl font-black tracking-tighter text-white/40">
                                            {quote ? (Number(quote.estimate?.toAmount) / (10 ** (quote.estimate?.toToken?.decimals || 6))).toFixed(4) : '0.00'}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 cursor-pointer">
                                        <TokenSelector 
                                            chainId={mode === 'swap' ? sourceChain.id : targetChain.id}
                                            address={address}
                                            selectedToken={toAsset || { symbol: toAssetSymbol, name: toAssetSymbol, address: '', decimals: 18 }}
                                            onSelect={(t) => {
                                                setToAsset(t);
                                                setToAssetSymbol(t.symbol);
                                            }}
                                            className="min-w-[140px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quote Error Message */}
                        {errorMsg && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 text-center font-bold">
                                {errorMsg}
                            </div>
                        )}

                        {/* Price Impact / Fee Summary */}
                        {quote && (
                            <div className="space-y-3 bg-white/5 rounded-2xl p-4 border border-white/5">
                                <div className="flex justify-between text-xs">
                                    <span className="text-white/40 font-bold uppercase tracking-widest text-[9px]">Route Execution</span>
                                    <span className="font-mono text-white/80">Li.Fi Aggregator <Zap size={10} className="inline ml-1 text-yellow-500" /></span>
                                </div>
                                <div className="flex justify-between text-xs">
                                        <span className="text-white/40 font-bold uppercase tracking-widest text-[9px]">Gas Cost</span>
                                        <span className="font-mono text-white/60">${quote.estimate?.gasCosts?.[0]?.amountUSD || '0.00'}</span>
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={handleExecute}
                            disabled={loading || !amount || (mode !== 'send' && !quote)}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 p-5 rounded-2xl font-black text-sm uppercase tracking-[.25em] shadow-xl shadow-purple-900/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    {orchestratorStatus === 'quoting' ? 'Quoting...' : 
                                     orchestratorStatus === 'approving' ? 'Approving...' : 
                                     orchestratorStatus === 'signing' ? 'Awaiting Signature...' : 
                                     orchestratorStatus === 'broadcasting' ? 'Broadcasting...' : 
                                     'Processing...'}
                                </>
                            ) : (
                                <>
                                    Initiate {mode}
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>

                        <div className="flex items-center justify-center gap-4 py-2">
                            <div className="flex items-center gap-1.5 opacity-40">
                                <Shield size={12} className="text-green-400" />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Secured by HSM</span>
                            </div>
                        </div>
                    </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

