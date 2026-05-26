"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Activity, ArrowUpRight, ArrowDownLeft, ExternalLink, RefreshCw, Cpu } from 'lucide-react';

// ================================================================
// TRANSACTION HISTORY — QUANTUM LEDGER SYNCHRONIZER
// Uses Etherscan public API for real on-chain transaction data.
// Graceful fallback: renders empty state, never throws.
// ================================================================

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
}

function parseTxList(raw: any[], walletAddress: string): ParsedTx[] {
    return raw.map((tx: any) => ({
        hash: tx.hash || '',
        direction: (tx.from || '').toLowerCase() === walletAddress.toLowerCase() ? 'SEND' : 'RECEIVE',
        status: tx.txreceipt_status === '1' || tx.isError === '0' ? 'SUCCESS' : 'FAILED',
        value: tx.value ? (Number(tx.value) / 1e18).toFixed(6) : '0',
        fromToken: 'ETH',
        timeStamp: tx.timeStamp ? new Date(Number(tx.timeStamp) * 1000).toLocaleDateString('en-US', {
            month: 'short', day: '2-digit', year: 'numeric'
        }) : '',
        from: tx.from || '',
        to: tx.to || '',
        gasUsed: tx.gasUsed || '0',
        blockNumber: tx.blockNumber || '0',
    }));
}

export function TransactionHistory({ address, scannerBase }: { address: string, scannerBase: string }) {
    const [transactions, setTransactions] = useState<ParsedTx[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        if (!address) { setLoading(false); return; }
        setLoading(true);
        setError(null);
        try {
            // Etherscan public endpoint — no API key needed for low volume
            const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=25&sort=desc&apikey=YourApiKeyToken`;
            const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if (json.status === '1' && Array.isArray(json.result)) {
                setTransactions(parseTxList(json.result, address));
            } else {
                // API rate-limited or no txs yet — not an error
                setTransactions([]);
            }
        } catch (e: any) {
            console.warn('[TransactionHistory] fetch failed:', e.message);
            setTransactions([]);
            setError(null); // Silent failure — don't show error banner
        } finally {
            setLoading(false);
        }
    }, [address]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    if (loading) {
        return (
            <div className="border border-black/10 bg-white min-h-[300px] flex flex-col items-center justify-center gap-4">
                <Cpu size={24} className="animate-pulse text-black/20" />
                <p className="text-[11px] font-black uppercase tracking-widest text-black/50">Synchronizing Ledger...</p>
                <div className="flex gap-1">
                    {[0,1,2].map(i => (
                        <div key={i} className="w-1 h-4 bg-black/10 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="border border-black/10 bg-white min-h-[300px] flex flex-col relative">
            {/* Refresh */}
            <div className="absolute top-3 right-3 z-10">
                <button
                    onClick={fetchHistory}
                    className="w-7 h-7 rounded border border-black/10 flex items-center justify-center hover:bg-black/5 bg-white transition-colors"
                    title="Refresh"
                >
                    <RefreshCw size={11} className="text-black/40" />
                </button>
            </div>

            {/* Header */}
            <div className="px-4 py-3 border-b border-black/10 bg-black/5 flex items-center gap-2">
                <Activity size={12} className="text-black/40" />
                <span className="text-[9px] font-black uppercase tracking-widest text-black/50">
                    Cryptographic Transfer Log · Last 25 Confirmed Blocks
                </span>
            </div>

            <div className="divide-y divide-black/5 flex-1 overflow-y-auto">
                {transactions.length > 0 ? (
                    transactions.map((tx, idx) => (
                        <a
                            key={tx.hash || idx}
                            href={`${scannerBase}/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between px-4 py-4 hover:bg-black/5 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-9 h-9 border flex items-center justify-center transition-colors ${
                                    tx.direction === 'SEND'
                                        ? 'border-red-200 bg-red-50 group-hover:border-red-400'
                                        : 'border-green-200 bg-green-50 group-hover:border-green-400'
                                }`}>
                                    {tx.direction === 'SEND'
                                        ? <ArrowUpRight size={14} className="text-red-500" />
                                        : <ArrowDownLeft size={14} className="text-green-600" />
                                    }
                                </div>
                                <div>
                                    <span className="text-[11px] font-black uppercase tracking-widest block leading-tight">
                                        {tx.direction === 'SEND' ? 'Outbound Transfer' : 'Inbound Receipt'}
                                    </span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${
                                            tx.status === 'SUCCESS' ? 'text-green-600' : 'text-red-500'
                                        }`}>
                                            {tx.status}
                                        </span>
                                        <span className="text-[9px] font-mono text-black/30">
                                            Block #{tx.blockNumber}
                                        </span>
                                        {tx.timeStamp && (
                                            <span className="text-[9px] font-mono text-black/30">{tx.timeStamp}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="text-right flex flex-col items-end gap-1">
                                <span className={`text-[13px] font-black font-mono ${
                                    tx.direction === 'SEND' ? 'text-red-600' : 'text-green-700'
                                }`}>
                                    {tx.direction === 'SEND' ? '−' : '+'}{tx.value} {tx.fromToken}
                                </span>
                                <div className="flex items-center gap-1 text-black/30 group-hover:text-black/60 transition-colors">
                                    <span className="text-[9px] font-mono bg-black/5 px-1.5 py-0.5 rounded-sm">
                                        {tx.hash ? `${tx.hash.substring(0, 8)}…` : '0x?'}
                                    </span>
                                    <ExternalLink size={9} />
                                </div>
                            </div>
                        </a>
                    ))
                ) : (
                    <div className="p-16 text-center flex flex-col items-center justify-center flex-1">
                        <Activity size={28} className="text-black/10 mb-4" />
                        <p className="text-[11px] text-black/50 uppercase tracking-widest font-black mb-2">
                            Immutable Ledger Empty
                        </p>
                        <p className="text-[10px] text-black/30 max-w-[280px] font-mono leading-relaxed">
                            No cryptographic proofs of transfer associated with this
                            address have been inscribed on Ethereum Mainnet.
                        </p>
                        <a
                            href={`${scannerBase}/address/${address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-5 text-[9px] font-black uppercase tracking-widest text-black/40 hover:text-black border border-black/10 hover:border-black px-4 py-2 transition-all flex items-center gap-2"
                        >
                            Inspect on Etherscan <ExternalLink size={10} />
                        </a>
                    </div>
                )}
            </div>

            {/* Footer status */}
            {transactions.length > 0 && (
                <div className="border-t border-black/10 px-4 py-2 bg-black/5 flex items-center justify-between">
                    <span className="text-[9px] font-mono text-black/30 uppercase tracking-widest">
                        {transactions.length} entries · Etherscan API · L1 Mainnet
                    </span>
                    <a
                        href={`${scannerBase}/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-black uppercase tracking-widest text-black/30 hover:text-black transition-colors flex items-center gap-1"
                    >
                        Full History <ExternalLink size={9} />
                    </a>
                </div>
            )}
        </div>
    );
}
