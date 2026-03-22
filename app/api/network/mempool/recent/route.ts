import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

/**
 * Smart Mempool Proxy
 * 
 * Fetches unconfirmed transactions from Blockchain.info (which includes values)
 * and maps them to the MempoolTx interface for the Whale Tracker dashboard.
 * 
 * We use this because mempool.space's /api/mempool/recent does NOT include 
 * transaction values, which are required for whale detection.
 */
export async function GET() {
    try {
        const res = await fetch('https://blockchain.info/unconfirmed-transactions?format=json', {
            next: { revalidate: 5 } // Cache for 5 seconds
        });

        if (!res.ok) {
            throw new Error(`Blockchain.info error: ${res.statusText}`);
        }

        const data = await res.json();
        
        // Map to MempoolTx interface
        const mappedTxs = (data.txs || []).map((tx: any) => {
            // Calculate total value from all outputs
            const totalValue = (tx.out || []).reduce((sum: number, out: any) => sum + (out.value || 0), 0);
            
            return {
                txid: tx.hash,
                fee: tx.fee || 0,
                vsize: tx.size || 0, 
                weight: tx.weight || 0,
                value: totalValue,
                time: tx.time || Math.floor(Date.now() / 1000),
                vin: (tx.inputs || []).map((input: any) => ({
                    prevout: {
                        scriptpubkey_address: input.prev_out?.addr,
                        value: input.prev_out?.value
                    }
                })),
                vout: (tx.out || []).map((out: any) => ({
                    scriptpubkey_address: out.addr,
                    value: out.value
                }))
            };
        });

        // [LEGENDARY PERSISTENCE] Proactively save large whales to DB
        // Using high threshold (50 BTC) to avoid DB bloat while ensuring "Giants" are saved
        const giantWhales = mappedTxs.filter((tx: any) => tx.value >= 5_000_000_000);
        
        if (giantWhales.length > 0) {
            // FIRE AND FORGET: Don't block the UI for DB operations
            (async () => {
                for (const whale of giantWhales) {
                    try {
                        const btcAmount = whale.value / 1e8;
                        await prisma.whaleActivity.upsert({
                            where: { transactionHash: whale.txid },
                            update: { status: 'PENDING' }, // Keep as pending if already there
                            create: {
                                walletAddress: whale.vin?.[0]?.prevout?.scriptpubkey_address || 'Unknown',
                                type: 'BTC Transfer',
                                token: 'BTC',
                                amount: btcAmount,
                                usdValue: btcAmount * 60000, 
                                fromAddress: whale.vin?.[0]?.prevout?.scriptpubkey_address || 'Unknown',
                                toAddress: whale.vout?.[0]?.scriptpubkey_address || 'Multiple',
                                transactionHash: whale.txid,
                                blockNumber: BigInt(0), 
                                chain: 'BITCOIN',
                                status: 'PENDING',
                                metadata: {
                                    gasPriceGwei: (whale.fee / whale.vsize).toFixed(1), // Sat/vB mapped to fee pos
                                    priorityFeeGwei: "0",
                                    method: "BTC Transfer",
                                    confirmations: 0
                                },
                                timestamp: new Date(whale.time * 1000),
                            }
                        });
                    } catch (e) {
                        // Silent fail for background persistence
                    }
                }
            })();
        }

        return NextResponse.json(mappedTxs);
    } catch (err: any) {
        console.error('[Mempool API Error]', err);
        return NextResponse.json({ error: err.message }, { status: 502 });
    }
}

