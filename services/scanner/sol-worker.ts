import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { getRealTimePrice } from "../../lib/priceHelper";
import { addWhaleToQueue } from "../../lib/queues/whaleQueue";

dotenv.config();

const prisma = new PrismaClient();

async function solanaRpcCall(method: string, params: any[] = []) {
    const url = process.env.GETBLOCK_SOLANA_RPC || 'https://api.mainnet-beta.solana.com';
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: "2.0", id: "sol-standalone", method, params })
    });
    const data = await response.json();
    return data.result;
}

export async function startSolanaWorker() {
    const targetWallets = ["9WzDXwBbmxg8EXKFEV9sA4Ycdz975dGv9mC6xEqtXoGz", "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1"];
    let lastSignatures = new Map<string, string>();

    while (true) {
        try {
            for (const wallet of targetWallets) {
                const sigs = await solanaRpcCall("getSignaturesForAddress", [wallet, { limit: 5 }]);
                if (!sigs || sigs.length === 0) continue;
                const latest = sigs[0].signature;
                if (lastSignatures.get(wallet) === latest) continue;

                const tx = await solanaRpcCall("getTransaction", [latest, { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 }]);
                if (tx) {
                    const solChange = Math.abs((tx.meta.postBalances[0] - tx.meta.preBalances[0]) / 1e9);
                    const price = await getRealTimePrice("SOL") || 140;
                    if (solChange * price >= 50000) {
                        await processWhaleTx(latest, wallet, "Cluster", "SOL", solChange, solChange * price, tx.slot, "SOLANA", { method: "SOL" });
                    }
                }
                lastSignatures.set(wallet, latest);
            }
            await new Promise(r => setTimeout(r, 30000));
        } catch (e) {
            await new Promise(r => setTimeout(r, 60000));
        }
    }
}

async function processWhaleTx(hash: string, from: string, to: string, asset: string, amount: number, usdValue: number, blockNumber: number, chain: string, metadata: any) {
    const exists = await prisma.whaleActivity.findUnique({ where: { transactionHash: hash } });
    if (exists) return;
    await prisma.whaleActivity.create({
        data: { walletAddress: from, type: "SOL_TRANSFER", token: asset, amount, usdValue, fromAddress: from, toAddress: to, transactionHash: hash, blockNumber: BigInt(blockNumber), chain, metadata, timestamp: new Date() }
    }).catch(e => {
        console.error(`❌ [${chain}] Error persisting SOL whale activity in DB:`, e.message);
    });
    
    await addWhaleToQueue({ hash, from, to, asset, amount, usdValue, blockNumber: blockNumber.toString(), chain, type: "SOL", metadata }).catch(e => {
        console.error(`❌ [${chain}] Error adding SOL whale to Redis queue:`, e.message);
    });
}
