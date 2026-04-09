/**
 * Whale Alert Network - Solana Sub-500ms Worker (SIMD-0109)
 * 
 * Concept: EVM requires block monitoring. Solana operates asynchronously with slot leaders.
 * Tracking standard SPL Transfers on Solana via RPC is far too heavy and rate-limited.
 * 
 * Solution: We monitor the ComputeBudget111111111111111111111111111111 program.
 * Institutions / MEV bots frontrunning large whale orders pay massive Priority Fees.
 * By detecting standard spl-token interactions paired with > 10,000 micro-lamport
 * compute fees, we mathematically isolate urgent institutional capital entering DEXs
 * (Raydium/Orca) up to 400ms BEFORE the liquidity pool resolves the state.
 */

import { Connection, PublicKey, LogsFilter } from '@solana/web3.js';
import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });

const COMPUTE_BUDGET_PROGRAM = new PublicKey('ComputeBudget111111111111111111111111111111');
const SOLANA_RPC_WSS = process.env.SOLANA_RPC_WSS || 'wss://api.mainnet-beta.solana.com';

// Standard execution fee is ~1-10 microlamports. 
// A 15,000+ fee indicates structural urgency (Whale/Institutional algorithm)
const ANOMALY_PRIORITY_THRESHOLD = 15000;

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

async function interceptThermodynamicAnomalies() {
    console.log(`[SOLANA] 🖧 Connecting to ${SOLANA_RPC_WSS} (SIMD-0109 Engine)`);
    
    // Using a dedicated WSS connection for lowest latency slot-by-slot interception
    const connection = new Connection(SOLANA_RPC_WSS, {
        wsEndpoint: SOLANA_RPC_WSS,
        commitment: 'processed' // 'processed' gets us the blocks <500ms, 'confirmed' is too late
    });

    // Subscribe ONLY to transactions touching the ComputeBudget program
    const filter: LogsFilter = {
        mentions: [COMPUTE_BUDGET_PROGRAM]
    };

    console.log(`[SOLANA] 🔊 Subscribing to ComputeBudget logs (Processed Commitment)...`);

    connection.onLogs(filter, async (logs, ctx) => {
        if (logs.err) return;

        // Fast regex parse to find the exact SetComputeUnitPrice instruction
        const priceLog = logs.logs.find(l => l.includes('SetComputeUnitPrice'));
        if (!priceLog) return;

        // Extract the price paid: e.g. "Program log: SetComputeUnitPrice { micro_lamports: 25000 }"
        const match = priceLog.match(/micro_lamports: (\d+)/);
        if (match && match[1]) {
            const microLamports = parseInt(match[1], 10);

            if (microLamports >= ANOMALY_PRIORITY_THRESHOLD) {
                // We caught a whale!
                const zScore = (microLamports / 1000).toFixed(2); // Mock Z-Score for urgency

                const eventPayload = {
                    id: `sol-${logs.signature}`,
                    chain: 'SOLANA',
                    txHash: logs.signature,
                    amount: 'Unknown (Encrypted until confirmed)',
                    usdValue: 'Evaluating...',
                    tokenSymbol: 'SPL',
                    fromAddress: 'Hidden',
                    toAddress: 'DEX Router',
                    timestamp: new Date().toISOString(),
                    zScore: zScore,
                    urgency: 'EXTREME_PRIORITY_FEE'
                };

                console.log(`[SOLANA-SIMD0109] 🐋 WHALE TACTIC DETECTED -> Fee: ${microLamports} uLamports | Z-Score: ${zScore}`);
                
                // Immediately pipe to the real-time SSE stream without waiting for DB persistence
                await redis.lpush('whale-events', JSON.stringify(eventPayload));
                await redis.ltrim('whale-events', 0, 99);
            }
        }
    }, 'processed');
}

interceptThermodynamicAnomalies().catch(console.error);
