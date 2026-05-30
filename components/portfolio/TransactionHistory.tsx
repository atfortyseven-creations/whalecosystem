"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { RefreshCw, ArrowUpRight, ArrowDownLeft, ExternalLink, Activity, Cpu } from 'lucide-react';

type TxStatus = 'SUCCESS' | 'FAILED';
type TxDirection = 'SEND' | 'RECEIVE';

interface ParsedTx {
    hash: string;
    direction: TxDirection;
    status: TxStatus;
    value: string;
    fromToken: string;
    timeStamp: string;
    from: string;
    to: string;
    gasUsed: string;
    blockNumber: string;
    dateLabel: string;
}

function parseTxList(raw: any[], walletAddress: string): ParsedTx[] {
    return raw.map((tx: any) => {
        const d = new Date(Number(tx.timeStamp) * 1000);
        // Format date strictly for grouping (e.g. "May 5, 2026")
        const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        return {
            hash: tx.hash || '',
            direction: (tx.from || '').toLowerCase() === walletAddress.toLowerCase() ? 'SEND' : 'RECEIVE',
            status: tx.txreceipt_status === '1' || tx.isError === '0' ? 'SUCCESS' : 'FAILED',
            value: tx.value ? (Number(tx.value) / 1e18).toFixed(5).replace(/\.?0+$/, '') : '0',
            fromToken: 'ETH',
            timeStamp: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            from: tx.from || '',
            to: tx.to || '',
            gasUsed: tx.gasUsed || '0',
            blockNumber: tx.blockNumber || '0',
            dateLabel
        };
    });
}

export function TransactionHistory({ address, scannerBase, activeNetwork }: { address: string, scannerBase: string, activeNetwork: string }) {
    const [transactions, setTransactions] = useState<ParsedTx[]>([]);
    const [loading, setLoading] = useState(true);
    const [nativePrice, setNativePrice] = useState(0);

    const getNativeSymbolForNetwork = (net: string) => {
        switch(net) {
            case 'bsc': return 'BNB';
            case 'polygon': return 'POL';
            case 'avalanche': return 'AVAX';
            default: return 'ETH';
        }
    };
    const nativeSymbol = getNativeSymbolForNetwork(activeNetwork);

    // Fetch live native token price for fiat display
    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const res = await fetch(`/api/prices?symbols=${nativeSymbol}`);
                const data = await res.json();
                const p = data?.[nativeSymbol]?.price || data?.[nativeSymbol] || 0;
                if (p > 0) setNativePrice(p);
            } catch {}
        };
        fetchPrice();
    }, [nativeSymbol]);

    const fetchHistory = useCallback(async () => {
        if (!address) { setLoading(false); return; }
        setLoading(true);
        try {
            const getApiEndpoint = (net: string) => {
                switch(net) {
                    case 'polygon': return 'https://api.polygonscan.com/api';
                    case 'arbitrum': return 'https://api.arbiscan.io/api';
                    case 'optimism': return 'https://api-optimistic.etherscan.io/api';
                    case 'base': return 'https://api.basescan.org/api';
                    case 'bsc': return 'https://api.bscscan.com/api';
                    case 'worldchain': return 'https://api.worldscan.org/api';
                    default: return 'https://api.etherscan.io/api';
                }
            };
            const baseUrl = getApiEndpoint(activeNetwork);
            // Use apikey from env; fall back gracefully to unauthenticated (rate-limited) mode
            const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || '';
            const url = `${baseUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=25&sort=desc${apiKey ? `&apikey=${apiKey}` : ''}`;
            const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if (json.status === '1' && Array.isArray(json.result)) {
                setTransactions(parseTxList(json.result, address));
            } else {
                setTransactions([]);
            }
        } catch (e: any) {
            console.warn('[TransactionHistory] fetch failed:', e.message);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }, [address, activeNetwork]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    if (loading) {
        return (
            <div className="border border-black/10 bg-white min-h-[300px] flex flex-col items-center justify-center gap-4">
                <Cpu size={24} className="animate-pulse text-black/20" />
                <p className="text-[11px] font-black uppercase tracking-widest text-black/50">Synchronizing Ledger...</p>
            </div>
        );
    }

    // Group transactions by date
    const grouped = transactions.reduce((acc, tx) => {
        if (!acc[tx.dateLabel]) acc[tx.dateLabel] = [];
        acc[tx.dateLabel].push(tx);
        return acc;
    }, {} as Record<string, ParsedTx[]>);

    return (
        <div className="border border-black/10 bg-white min-h-[300px] flex flex-col relative font-sans">
            <div className="absolute top-3 right-3 z-10">
                <button
                    onClick={fetchHistory}
                    className="w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"
                >
                    <RefreshCw size={12} className="text-black/60" />
                </button>
            </div>

            <div className="divide-y divide-black/5 flex-1 overflow-y-auto">
                {Object.keys(grouped).length > 0 ? (
                    Object.entries(grouped).map(([date, txs]) => (
                        <div key={date}>
                            {/* MetaMask Date Header */}
                            <div className="px-4 py-2 bg-black/[0.02] text-[13px] font-bold text-black/60">
                                {date}
                            </div>
                            
                            {txs.map((tx, idx) => (
                                <a
                                    key={tx.hash || idx}
                                    href={`${scannerBase}/tx/${tx.hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between px-4 py-3 hover:bg-black/[0.02] transition-colors group border-b border-black/5 last:border-0"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center border border-black/10">
                                            {tx.direction === 'SEND' 
                                                ? <ArrowUpRight size={20} className="text-[#0376c9]" /> // MetaMask blue
                                                : <ArrowDownLeft size={20} className="text-green-600" />
                                            }
                                        </div>
                                        <div>
                                            <span className="text-[15px] font-bold text-black block leading-tight mb-0.5">
                                                {tx.direction === 'SEND' ? 'Enviado' : 'Recibido'}
                                            </span>
                                            <span className={`text-[13px] font-medium ${tx.status === 'SUCCESS' ? 'text-green-600' : 'text-red-500'}`}>
                                                {tx.status === 'SUCCESS' ? 'Confirmado' : 'Fallido'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="text-[15px] font-bold text-black block mb-0.5">
                                            {tx.direction === 'SEND' ? '-' : '+'}{tx.value} {nativeSymbol}
                                        </span>
                                        <span className="text-[13px] text-black/50">
                                            {nativePrice > 0 ? `$${(Number(tx.value) * nativePrice).toFixed(2)} USD` : `${nativeSymbol}`}
                                        </span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    ))
                ) : (
                    <div className="p-16 text-center flex flex-col items-center justify-center flex-1">
                        <Activity size={28} className="text-black/10 mb-4" />
                        <p className="text-[14px] text-black/50 font-bold mb-2">No tienes transacciones</p>
                    </div>
                )}
            </div>
        </div>
    );
}
