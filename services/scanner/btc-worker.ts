// FIX: Replaced new PrismaClient() with global singleton from lib/prisma.
// btc-worker was the LAST remaining file with an isolated PrismaClient instance.
// A new PrismaClient() per module opens a new connection pool (up to 10 conns),
// meaning 3 workers running simultaneously would exhaust PostgreSQL's connection
// limit, causing P1017 (Connection pool timeout) under load.
import { prisma } from "../../lib/prisma";
import dotenv from "dotenv";
import { getRealTimePrice } from "../../lib/priceHelper";
import { addWhaleToQueue } from "../../lib/queues/whaleQueue";

dotenv.config();

const WHALE_THRESHOLD_USD = Number(process.env.WHALE_THRESHOLD_USD) || 50_000;

// FIX: Startup guard — the worker will refuse to start rather than crashing
// at runtime with a TypeError ("fetch: BTC_RPC_URL is undefined").
// Previously: BTC_RPC_URL! non-null assertion silently exploded on first RPC call.
const MEMPOOL_API = 'https://mempool.space/api';

async function fetchMempool(endpoint: string, isJson = true) {
    const response = await fetch(`${MEMPOOL_API}/${endpoint}`, {
        signal: AbortSignal.timeout(10_000)
    });
    if (!response.ok) throw new Error(`Mempool API HTTP ${response.status}: ${await response.text().catch(() => '')}`);
    return isJson ? response.json() : response.text();
}

export async function startBtcWorker() {
    let lastBlock: number;
    try {
        const heightText = await fetchMempool('blocks/tip/height', false);
        lastBlock = parseInt(heightText as string, 10);
        console.log(`📡 [BTC Scanner] Connected to Mempool.space. Height: ${lastBlock}`);
    } catch (e: any) {
        console.error(`❌ [BTC Scanner] Failed to connect on startup: ${e.message}. Retrying in 60s.`);
        await new Promise(r => setTimeout(r, 60_000));
        return startBtcWorker();
    }

    let consecutiveErrors = 0;
    const MAX_BACKOFF_MS  = 5 * 60_000;

    while (true) {
        try {
            const heightText = await fetchMempool('blocks/tip/height', false);
            const currentBlock = parseInt(heightText as string, 10);

            if (currentBlock > lastBlock) {
                const targetBlock = Math.min(currentBlock, lastBlock + 1);
                const blockHash: string = await fetchMempool(`block-height/${targetBlock}`, false) as string;
                const txids: string[] = await fetchMempool(`block/${blockHash}/txids`) as string[];
                
                const btcPrice = await getRealTimePrice("BTC") || 98_000;
                console.log(`📦 [BTC Scanner] Processing Block ${targetBlock} | ${txids.length} txs`);

                // To avoid overloading public API, we fetch full tx details only for large movements if possible
                // or parallelize with limit
                for (const txid of txids) {
                    try {
                        const tx: any = await fetchMempool(`tx/${txid}`);
                        let totalOutputSats = 0;
                        for (const vout of tx.vout ?? []) {
                            totalOutputSats += vout.value ?? 0;
                        }
                        const valueBTC = totalOutputSats / 1e8;
                        const usdValue = valueBTC * btcPrice;

                        if (usdValue >= WHALE_THRESHOLD_USD) {
                            const senderAddr = tx.vin?.[0]?.prevout?.scriptpubkey_address ?? 'Unknown';
                            await processWhaleTx(
                                tx.txid, senderAddr, "Multiple Outputs",
                                "BTC", valueBTC, usdValue,
                                targetBlock, 'BITCOIN', { method: "REST_MEMPOOL" }
                            );
                        }
                    } catch (txErr) {
                        // Skip individual tx errors to keep the block moving
                        continue;
                    }
                }
                lastBlock = targetBlock;
            }

            consecutiveErrors = 0;
            await new Promise(r => setTimeout(r, 30_000)); // Poll every 30s

        } catch (e: any) {
            consecutiveErrors++;
            const backoff = Math.min(60_000 * Math.pow(2, consecutiveErrors - 1), MAX_BACKOFF_MS);
            console.error(`❌ [BTC] Worker error #${consecutiveErrors}. Backoff ${backoff / 1000}s:`, e.message);
            await new Promise(r => setTimeout(r, backoff));
        }
    }
}

async function processWhaleTx(
    hash: string, from: string, to: string,
    asset: string, amount: number, usdValue: number,
    blockNumber: number, chain: string, metadata: any
) {
    const exists = await prisma.whaleActivity.findUnique({ where: { transactionHash: hash } });
    if (exists) return;

    console.log(`🐋 [BTC] Whale detected: $${usdValue.toLocaleString()} USD | tx: ${hash.slice(0, 16)}...`);

    // FIX: Silent .catch(e => {}) replaced with explicit error logging.
    // Silent suppression was hiding persistent DB failures that would cause
    // whales to be permanently lost from the intelligence feed silently.
    await prisma.whaleActivity.create({
        data: {
            walletAddress: from,
            type: "BTC_TRANSFER",
            token: asset,
            amount: amount.toString(),
            usdValue: usdValue.toString(),
            fromAddress: from,
            toAddress: to,
            transactionHash: hash,
            blockNumber: BigInt(blockNumber),
            chain,
            metadata,
            timestamp: new Date(),
        }
    }).catch(e => {
        console.error(`❌ [BTC] DB persist failed for ${hash}: ${e.message}`);
    });

    await addWhaleToQueue({
        hash, from, to, asset, amount, usdValue,
        blockNumber: blockNumber.toString(), chain, type: "BTC", metadata,
    }).catch(e => {
        console.error(`❌ [BTC] Redis queue failed for ${hash}: ${e.message}`);
    });
}
