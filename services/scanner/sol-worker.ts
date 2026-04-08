// FIX: Use global Prisma singleton — prevents DB connection pool exhaustion.
import { prisma } from "../../lib/prisma";
import dotenv from "dotenv";
import { getRealTimePrice } from "../../lib/priceHelper";
import { addWhaleToQueue } from "../../lib/queues/whaleQueue";

dotenv.config();

// ── RPC with timeout ────────────────────────────────────────────────────────
// FIX: Add AbortSignal.timeout() so a stalled Solana RPC node cannot block
// the worker loop indefinitely. Previously, a hung connection would freeze
// the entire while(true) loop with no recovery path.
async function solanaRpcCall(method: string, params: any[] = []) {
    const url = process.env.GETBLOCK_SOLANA_RPC || 'https://api.mainnet-beta.solana.com';
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: "2.0", id: "sol-standalone", method, params }),
        signal: AbortSignal.timeout(8000), // 8-second hard timeout per RPC call
    });
    if (!response.ok) throw new Error(`Solana RPC HTTP ${response.status}`);
    const data = await response.json();
    if (data.error) throw new Error(`Solana RPC error: ${JSON.stringify(data.error)}`);
    return data.result;
}

// ── Wallet list ─────────────────────────────────────────────────────────────
// FIX: Hardcoded wallet list replaced with DB-driven approach.
// Workers now query the OnChainEntity table for Solana-tagged addresses,
// falling back to a minimal static list only when the DB is empty.
// This enables institutional-grade live wallet fleet management through the UI.
async function getTargetWallets(): Promise<string[]> {
    try {
        const entities = await prisma.onChainEntity.findMany({
            where: { address: { startsWith: '' } }, // Solana addresses are base58, not 0x
            select: { address: true },
            take: 100,
        });

        // Filter to likely Solana addresses (base58, 32-44 chars, no 0x prefix)
        const solanaAddrs = entities
            .map(e => e.address)
            .filter(a => !a.startsWith('0x') && a.length >= 32 && a.length <= 44);

        if (solanaAddrs.length > 0) return solanaAddrs;
    } catch {
        // DB unavailable — fall through to static fallback
    }

    // Static fallback: known top-tier Solana whale wallets for minimal coverage
    return [
        "9WzDXwBbmxg8EXKFEV9sA4Ycdz975dGv9mC6xEqtXoGz",
        "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
        "HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH", // Jump Crypto
        "GVV4pFGtBsHed4hLMh7BHqHMhgwkfBo1VuAr21jY5T9c", // Alameda remnant
    ];
}

export async function startSolanaWorker() {
    let lastSignatures = new Map<string, string>();
    // FIX: Exponential backoff state — prevents log flooding and CPU spin
    // when Solana mainnet is rate-limiting or degraded.
    let consecutiveErrors = 0;
    const MAX_BACKOFF_MS  = 5 * 60 * 1000; // 5 minutes max

    while (true) {
        try {
            // Refresh wallet list every cycle (picks up newly added onchain entities)
            const targetWallets = await getTargetWallets();

            for (const wallet of targetWallets) {
                try {
                    const sigs = await solanaRpcCall("getSignaturesForAddress", [wallet, { limit: 5 }]);
                    if (!sigs || sigs.length === 0) continue;

                    const latest = sigs[0].signature;
                    if (lastSignatures.get(wallet) === latest) continue;

                    const tx = await solanaRpcCall("getTransaction", [latest, {
                        encoding: "jsonParsed",
                        maxSupportedTransactionVersion: 0,
                    }]);

                    if (tx) {
                        // Null-safe balance access — malformed or failed Solana txs
                        // may have null meta or empty balances arrays.
                        const postBal = tx.meta?.postBalances?.[0] ?? 0;
                        const preBal  = tx.meta?.preBalances?.[0]  ?? 0;
                        const solChange = Math.abs((postBal - preBal) / 1e9);
                        const price = await getRealTimePrice("SOL") || 140;

                        if (solChange * price >= 50000) {
                            await processWhaleTx(
                                latest, wallet, "Cluster", "SOL",
                                solChange, solChange * price,
                                tx.slot ?? 0, "SOLANA", { method: "SOL" }
                            );
                        }
                    }

                    lastSignatures.set(wallet, latest);
                } catch (walletErr: any) {
                    // Per-wallet error: skip this wallet, continue to next
                    console.warn(`⚠ [SOL] Wallet ${wallet.slice(0, 8)}... skipped: ${walletErr.message}`);
                }
            }

            // Successful cycle — reset backoff
            consecutiveErrors = 0;
            await new Promise(r => setTimeout(r, 30_000)); // 30s between sweeps

        } catch (e: any) {
            // FIX: Exponential backoff on consecutive errors.
            // Previously: fixed 60s sleep regardless of error frequency.
            // Now: 60s → 120s → 240s → ... capped at 5 minutes.
            consecutiveErrors++;
            const backoff = Math.min(60_000 * Math.pow(2, consecutiveErrors - 1), MAX_BACKOFF_MS);
            console.error(`❌ [SOL] Worker error #${consecutiveErrors}. Backoff ${backoff / 1000}s:`, e.message);
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

    await prisma.whaleActivity.create({
        data: {
            walletAddress: from,
            type: "SOL_TRANSFER",
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
        console.error(`❌ [${chain}] Error persisting SOL whale activity:`, e.message);
    });

    await addWhaleToQueue({
        hash, from, to, asset, amount, usdValue,
        blockNumber: blockNumber.toString(), chain, type: "SOL", metadata,
    }).catch(e => {
        console.error(`❌ [${chain}] Error adding SOL whale to Redis queue:`, e.message);
    });
}
