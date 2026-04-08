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
const BTC_RPC_URL = process.env.GETBLOCK_BTC_RPC || process.env.BITCOIN_RPC_URL;

async function btcRpcCall(method: string, params: any[] = []) {
    if (!BTC_RPC_URL) throw new Error('BTC_RPC_URL is not configured. Set GETBLOCK_BTC_RPC or BITCOIN_RPC_URL.');

    // FIX: Added timeout — previously an unresponsive BTC node would hang
    // the worker loop indefinitely, blocking all subsequent block scans.
    const response = await fetch(BTC_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': process.env.BITCOIN_RPC_AUTH ? `Basic ${process.env.BITCOIN_RPC_AUTH}` : '' },
        body: JSON.stringify({ jsonrpc: "1.0", id: "btc-standalone", method, params }),
        signal: AbortSignal.timeout(10_000), // 10-second hard timeout per RPC call
    });

    if (!response.ok) throw new Error(`BTC RPC HTTP ${response.status}: ${await response.text().catch(() => '')}`);

    const data = await response.json();
    if (data.error) throw new Error(`BTC RPC error ${data.error.code}: ${data.error.message}`);
    return data.result;
}

export async function startBtcWorker() {
    if (!BTC_RPC_URL) {
        console.error('❌ [BTC Worker] BTC_RPC_URL not set. Worker disabled. Set GETBLOCK_BTC_RPC or BITCOIN_RPC_URL.');
        return;
    }

    let lastBlock: number;
    try {
        lastBlock = await btcRpcCall("getblockcount");
        console.log(`📡 [BTC Scanner] Connected. Height: ${lastBlock}`);
    } catch (e: any) {
        console.error(`❌ [BTC Scanner] Failed to connect on startup: ${e.message}. Retrying in 60s.`);
        await new Promise(r => setTimeout(r, 60_000));
        return startBtcWorker(); // Recursive restart
    }

    // FIX: Exponential backoff — same pattern applied to sol-worker.ts.
    // Previously: fixed 60s sleep on any error regardless of frequency.
    let consecutiveErrors = 0;
    const MAX_BACKOFF_MS  = 5 * 60_000; // 5 minutes cap

    while (true) {
        try {
            const currentBlock: number = await btcRpcCall("getblockcount");

            if (currentBlock > lastBlock) {
                // FIX: Chunk block processing to avoid requesting huge block ranges
                // in a single RPC call after long downtime. Process 1 block at a time
                // to stay within the RPC node's rate-limit window.
                const targetBlock = Math.min(currentBlock, lastBlock + 1);
                const blockHash  = await btcRpcCall("getblockhash", [targetBlock]);
                const block: any = await btcRpcCall("getblock", [blockHash, 2]);
                const btcPrice   = await getRealTimePrice("BTC") || 98_000;

                for (const tx of block.tx ?? []) {
                    let totalOutputBtc = 0;
                    for (const vout of tx.vout ?? []) {
                        // FIX: Guard against null/non-numeric vout.value fields
                        // which appear in OP_RETURN outputs (value = 0) and non-standard scripts
                        if (typeof vout.value === 'number') totalOutputBtc += vout.value;
                    }
                    const usdValue = totalOutputBtc * btcPrice;

                    if (usdValue >= WHALE_THRESHOLD_USD) {
                        // Extract sender from first vin's coinbase or scriptSig
                        const senderAddr = tx.vin?.[0]?.coinbase
                            ? 'COINBASE'
                            : (tx.vin?.[0]?.txid || 'Unknown');

                        await processWhaleTx(
                            tx.txid, senderAddr, "Multiple Outputs",
                            "BTC", totalOutputBtc, usdValue,
                            targetBlock, 'BITCOIN', { method: "BTC" }
                        );
                    }
                }
                lastBlock = targetBlock;
            }

            consecutiveErrors = 0;
            await new Promise(r => setTimeout(r, 20_000)); // Poll every 20s (~1 BTC block / 10min)

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
