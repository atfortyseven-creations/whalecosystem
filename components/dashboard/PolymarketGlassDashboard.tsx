"use client";

import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import {
    TrendingUp,
    ArrowUpRight,
    ArrowDownLeft,
    ShieldCheck,
    AlertTriangle,
    Loader2,
    Brain,
    Activity as ActivityIcon,
    Globe
} from "lucide-react";
import { useAccount, useChainId } from "wagmi";
import { polygon } from "wagmi/chains";
import { useRealWalletData } from "@/hooks/useRealWalletData";
import { usePolymarketSession } from "@/hooks/usePolymarketSession";
import { usePolymarketOrderbook } from "@/hooks/usePolymarketOrderbook";
import { usePolymarketTrade } from "@/hooks/usePolymarketTrade";
import { usePolymarketMarkets, PolymarketMarket } from "@/hooks/usePolymarketMarkets";
import SendModal from "@/components/wallet/SendModal";
import ReceiveModal from "@/components/wallet/ReceiveModal";
import NetworkSwitcher from "@/components/wallet/NetworkSwitcher";
import { Toaster, toast } from "sonner";

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 100, damping: 15 }
    },
};

export default function PolymarketGlassDashboard({ embedded = false }: { embedded?: boolean }) {
    const { address: web3Address } = useAccount();
    const chainId = useChainId();
    const isPolygon = chainId === polygon.id;

    const { isProxyEnabled, login } = usePolymarketSession();
    
    // Real Data Hooks L1
    const { totalBalance: portfolioValue, usdcBalance, address } = useRealWalletData([], web3Address);
    
    // Dynamic Markets L1
    const { markets, isLoading: isMarketsLoading, error: marketsError } = usePolymarketMarkets();
    const [selectedMarket, setSelectedMarket] = useState<PolymarketMarket | null>(null);

    // Default auto-select top market
    useEffect(() => {
        if (!selectedMarket && markets.length > 0) {
            setSelectedMarket(markets[0]);
        }
    }, [markets, selectedMarket]);

    // Derived logic dynamically from live endpoints
    const activeTokenIdYes = selectedMarket?.tokens[0]?.token_id || "";
    const activeTokenIdNo = selectedMarket?.tokens[1]?.token_id || "";

    const { orderBook, isLoading: isBookLoading } = usePolymarketOrderbook(isPolygon ? activeTokenIdYes : "");
    const { trade, status: tradeStatus } = usePolymarketTrade();

    const [side, setSide] = useState<"YES" | "NO">("YES");
    const [amount, setAmount] = useState("");

    // Modals
    const [isSendOpen, setIsSendOpen] = useState(false);
    const [isReceiveOpen, setIsReceiveOpen] = useState(false);

    const handleTrade = () => {
        if (!isPolygon || !selectedMarket) return;
        
        // Anti-latency precision check
        const activeTokenIdToTrade = side === "YES" ? activeTokenIdYes : activeTokenIdNo;
        if (!activeTokenIdToTrade) {
             toast.error("Error criptográfico: Token ID irreconocible para este mercado.");
             return;
        }

        const bestPrice = side === "YES"
            ? (orderBook.asks[0]?.price || 0.5)
            : (1 - (orderBook.bids[0]?.price || 0.5)); // Derivado aritméticamente inmutable

        trade("BUY", amount, bestPrice, activeTokenIdToTrade);
    };

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className={`w-full text-white font-sans selection:bg-indigo-500/30 ${embedded ? '' : 'min-h-screen p-4 md:p-8'}`}
        >
            <Toaster position="bottom-right" theme="dark" richColors />

            <SendModal isOpen={isSendOpen} onClose={() => setIsSendOpen(false)} />
            <ReceiveModal isOpen={isReceiveOpen} onClose={() => setIsReceiveOpen(false)} />

            {/* A. GLASS HEADER */}
            {!embedded && (
                <motion.header
                    variants={itemVariants}
                    className="sticky top-4 z-[999] mb-8 w-full max-w-7xl mx-auto"
                >
                    <div className="flex items-center justify-between px-6 py-4 rounded-2xl bg-[#050505]/80 backdrop-blur-xl border border-white/10 shadow-2xl">
                        <div className="flex items-center space-x-4">
                            <NetworkSwitcher />
                            <div className="hidden md:flex items-center space-x-2 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
                                <ActivityIcon size={14} className={isPolygon ? 'text-emerald-500 animate-pulse' : 'text-gray-500'} />
                                <span className="text-xs font-black tracking-widest text-[#00dda8] uppercase">
                                    {isPolygon ? "L1 Connectivity: Native" : "Cross-Chain Relojed"}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-black/20 border border-white/5">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs font-mono font-bold text-white/70">
                                    {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Disconnected Hub"}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.header>
            )}

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* B. PORTFOLIO & DYNAMIC MARKETS AREA */}
                <motion.div variants={itemVariants} className="lg:col-span-8 space-y-8">
                    <div className="relative p-8 rounded-[32px] bg-[#050505]/60 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                            <Globe className="w-32 h-32 text-indigo-500" />
                        </div>

                        <h2 className="text-xs uppercase tracking-[0.3em] text-white/50 font-black mb-2">Valor Total del Portafolio</h2>
                        <div className="flex items-baseline space-x-2">
                            <span className="text-6xl md:text-7xl font-black font-mono tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                                ${portfolioValue}
                            </span>
                        </div>

                        <div className="mt-8 flex space-x-8 items-end relative z-10">
                            <div className="flex-1">
                                <p className="text-[10px] text-emerald-500/50 uppercase tracking-[0.2em] mb-1 font-black">Capital Líquido L1 (USDC)</p>
                                <p className="text-2xl font-black font-mono text-emerald-400 shadow-sm">${usdcBalance}</p>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setIsSendOpen(true)}
                                    className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all hover:scale-105"
                                >
                                    <ArrowUpRight className="w-4 h-4" /> Send
                                </button>
                                <button
                                    onClick={() => setIsReceiveOpen(true)}
                                    className="px-6 py-3 rounded-xl bg-[#111111] hover:bg-[#222222] border border-[#333333] flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-xl transition-all hover:scale-105"
                                >
                                    <ArrowDownLeft className="w-4 h-4 text-[#00dda8]" /> Receive
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* DYNAMIC MARKETS FROM L1 REST API */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-black text-white/50 uppercase tracking-[0.25em] flex items-center gap-2">
                                <Globe size={14} className="text-white/30" />
                                Terminal de Mercados L1
                            </h3>
                            {isMarketsLoading && (
                                <div className="flex items-center gap-2 text-[#00dda8] text-[9px] uppercase tracking-widest font-black animate-pulse">
                                    <Loader2 size={12} className="animate-spin" /> Sincronizando Nodos CLOB...
                                </div>
                            )}
                            {marketsError && (
                                <div className="flex items-center gap-2 text-rose-500 text-[10px] uppercase font-black tracking-widest">
                                    <AlertTriangle size={12} /> {marketsError}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {markets.map((market, i) => {
                                const isSelected = selectedMarket?.condition_id === market.condition_id;
                                return (
                                    <motion.div 
                                        key={market.condition_id}
                                        onClick={() => setSelectedMarket(market)}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className={`p-5 rounded-[1.5rem] bg-[#050505] transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between h-full border ${isSelected ? 'border-[#00dda8] shadow-[0_0_20px_rgba(0,221,168,0.1)]' : 'border-[#222222] hover:border-white/20'}`}
                                    >
                                        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Brain size={48} className="text-white" />
                                        </div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="text-[10px] font-black text-[#888888] uppercase tracking-widest group-hover:text-white/60 transition-colors">
                                                On-Chain Event //
                                            </div>
                                            {isSelected && <span className="bg-[#00dda8]/10 text-[#00dda8] px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Active Link</span>}
                                        </div>
                                        <h4 className="text-sm font-black text-white line-clamp-3 leading-snug group-hover:text-[#00dda8] transition-colors">
                                            {market.question}
                                        </h4>
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="text-[9px] font-mono text-[#444444] uppercase">{market.condition_id.slice(0, 10)}...</div>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${isSelected ? 'border-[#00dda8] bg-[#00dda8]/10' : 'border-[#333333] bg-[#111111] group-hover:border-[#00dda8]/50'}`}>
                                                <ArrowUpRight size={14} className={isSelected ? 'text-[#00dda8]' : 'text-[#666]'} />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            {!isMarketsLoading && markets.length === 0 && !marketsError && (
                                <div className="col-span-full py-12 text-center text-[#555555] font-black uppercase tracking-widest text-xs">
                                    No hay mercados activos sincronizados en el nodo local actualmente.
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* C. THE EXECUTION TERMINAL L1 */}
                <motion.div variants={itemVariants} className="lg:col-span-4 space-y-4">

                    {!isPolygon ? (
                        <div className="h-full min-h-[440px] p-8 rounded-[2rem] bg-[#050505]/80 border border-[#222222] backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                                <ActivityIcon className="w-8 h-8 text-rose-500" />
                            </div>
                            <h3 className="text-xl font-black uppercase text-white tracking-widest">Falla Jurisdiccional</h3>
                            <p className="text-[#888888] font-bold text-xs max-w-[220px] uppercase tracking-wider">
                                Orderbook enrutamiento restringido. Sincronice cadena Polygon.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* PROXY SECURE HANDSHAKE */}
                            {!isProxyEnabled && (
                                <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 backdrop-blur-md flex items-start space-x-4">
                                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-[11px] font-black uppercase tracking-widest text-amber-500 mb-1">Handshake Requerido</h3>
                                        <p className="text-[10px] text-white/50 mb-3 font-medium">Bóveda asimétrica desactiva inyecciones sin Proxy EIP-712.</p>
                                        <button
                                            onClick={login}
                                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#050505] text-[10px] font-black uppercase tracking-widest rounded transition-colors"
                                        >
                                            Autorizar Canal
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="p-6 rounded-[2rem] bg-[#050505] border border-[#222222] shadow-2xl h-full flex flex-col">
                                <div className="mb-6 border-b border-[#222] pb-6">
                                    <h3 className="text-[10px] font-black text-[#555] uppercase tracking-[0.2em] mb-2 flex items-center space-x-2">
                                        <TrendingUp className="w-4 h-4 text-[#00dda8]" />
                                        <span>Orderbook en Vivo — CLOB L1</span>
                                    </h3>
                                    <p className="text-sm font-black text-white leading-tight">
                                        {selectedMarket ? selectedMarket.question : "Seleccione mercado para rastrear liquidez"}
                                    </p>
                                </div>

                                {/* VISUAL ORDERBOOK MULTIMETRICO */}
                                <div className="space-y-1 mb-8 font-mono text-[11px] font-bold tracking-tight">
                                    {(isBookLoading && orderBook.asks.length === 0) && (
                                        <div className="text-center py-6 text-[#555] uppercase tracking-widest flex items-center justify-center gap-2">
                                            <Loader2 size={12} className="animate-spin text-[#00dda8]" /> Analizando bloque...
                                        </div>
                                    )}

                                    {/* ASKS (SELLERS) - RED */}
                                    <div className="space-y-1 p-2 rounded-xl bg-[#111] border border-[#222]">
                                        {orderBook.asks.slice(0, 3).reverse().map((ask, i) => (
                                            <div key={i} className="flex justify-between text-[#ff4d4d] relative items-center h-6 px-2">
                                                <span className="z-10">{parseFloat(ask.price.toString()).toFixed(2)}¢</span>
                                                <span className="z-10 text-[#666]">{ask.size.toFixed(0)}</span>
                                                <div
                                                    className="absolute right-0 top-0 h-full bg-[#ff4d4d]/10 rounded"
                                                    style={{ width: `${Math.min((ask.size / 6000) * 100, 100)}%` }}
                                                />
                                            </div>
                                        ))}
                                        {orderBook.asks.length === 0 && !isBookLoading && <div className="text-[#333] text-center italic py-2">Vacío</div>}
                                    </div>

                                    <div className="py-2 text-center text-[9px] text-[#444] font-black tracking-[0.3em] uppercase">Spread Central</div>

                                    {/* BIDS (BUYERS) - GREEN */}
                                    <div className="space-y-1 p-2 rounded-xl bg-[#111] border border-[#222]">
                                        {orderBook.bids.slice(0, 3).map((bid, i) => (
                                            <div key={i} className="flex justify-between text-[#00dda8] relative items-center h-6 px-2">
                                                <span className="z-10">{parseFloat(bid.price.toString()).toFixed(2)}¢</span>
                                                <span className="z-10 text-[#666]">{bid.size.toFixed(0)}</span>
                                                <div
                                                    className="absolute left-0 top-0 h-full bg-[#00dda8]/10 rounded"
                                                    style={{ width: `${Math.min((bid.size / 6000) * 100, 100)}%` }}
                                                />
                                            </div>
                                        ))}
                                        {orderBook.bids.length === 0 && !isBookLoading && <div className="text-[#333] text-center italic py-2">Vacío</div>}
                                    </div>
                                </div>

                                {/* ACTION PANEL */}
                                <div className="mt-auto">
                                    <div className="p-1 rounded-xl bg-[#111] border border-[#222] flex mb-6">
                                        <button
                                            onClick={() => setSide("YES")}
                                            className={`flex-1 py-3.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${side === "YES" ? "bg-[#00dda8] text-[#050505] shadow-[0_4px_20px_rgba(0,221,168,0.2)]" : "text-[#555] hover:text-white"}`}
                                        >
                                            COMPRAR YES
                                        </button>
                                        <button
                                            onClick={() => setSide("NO")}
                                            className={`flex-1 py-3.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${side === "NO" ? "bg-[#ff4d4d] text-white shadow-[0_4px_20px_rgba(255,77,77,0.2)]" : "text-[#555] hover:text-white"}`}
                                        >
                                            COMPRAR NO
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] text-[#555] uppercase font-black tracking-widest">Asignación L1 (USDC)</label>
                                            <div className="relative mt-2">
                                                <input
                                                    type="number"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full bg-[#111] border border-[#333] rounded-xl py-4 pl-4 pr-12 text-2xl font-black font-mono text-white focus:outline-none focus:border-[#00dda8] transition-colors placeholder:text-[#333]"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    <span className="text-[10px] font-black tracking-widest text-[#555]">USDC</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between text-[11px] py-1 border-t border-[#222] pt-4 font-bold uppercase tracking-widest">
                                            <span className="text-[#555]">Shares Proyectadas</span>
                                            <span className="text-white font-mono">{amount ? (parseFloat(amount) / 0.65).toFixed(2) : "0.00"}</span>
                                        </div>

                                        <button
                                            onClick={handleTrade}
                                            disabled={tradeStatus === "APPROVING" || tradeStatus === "SIGNING" || tradeStatus === "POSTING" || !amount || !selectedMarket}
                                            className="w-full py-4 rounded-xl bg-white text-[#050505] font-black uppercase tracking-widest text-[11px] transition-all hover:bg-[#eee] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-2"
                                        >
                                            {tradeStatus === "APPROVING" && <><Loader2 className="animate-spin w-4 h-4" /> Firma EIP-2612...</>}
                                            {tradeStatus === "SIGNING" && <><Loader2 className="animate-spin w-4 h-4" /> ECDSA Handshake...</>}
                                            {tradeStatus === "POSTING" && <><Loader2 className="animate-spin w-4 h-4" /> Enrutando L1...</>}
                                            {tradeStatus === "SUCCESS" && "Operación Liquidada"}
                                            {tradeStatus === "IDLE" && "FIRMAR Y ENVIAR ORDEN L1"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}

