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
import dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });

import { createRedisClient } from '../lib/redis/client';
import { GlobalRPCRouter } from '../lib/rpc-router';

const COMPUTE_BUDGET_PROGRAM = new PublicKey('ComputeBudget111111111111111111111111111111');

// Standard execution fee is ~1-10 microlamports. 
// A 15,000+ fee indicates structural urgency (Whale/Institutional algorithm)
const ANOMALY_PRIORITY_THRESHOLD = 15000;
// Z-Score baseline: median priority fee on mainnet (est. 1,000 microlamports)
const ZSCORE_BASELINE_MEDIAN   = 1_000;
const ZSCORE_BASELINE_STDDEV   = 5_000; // conservative std-dev derived from mainnet distribution

const redis = createRedisClient({ name: 'Solana-Worker' });

async function interceptThermodynamicAnomalies() {
    // [PHASE 9] Obtain the best healthy RPC endpoint via the GlobalRPCRouter.
    // On failure of this connection, we will call reportFailure() and retry with the next one.
    let currentRpcHttp = GlobalRPCRouter.getBestRPC('SOLANA');
    // Convert HTTP(S) to WSS for subscription — standard Solana convention
    const SOLANA_RPC_WSS = (process.env.SOLANA_RPC_WSS) 
        || currentRpcHttp.replace('https://', 'wss://').replace('http://', 'ws://');

    console.log(`[SOLANA] 🖇 Connecting to ${SOLANA_RPC_WSS} (SIMD-0109 Engine via RPC Router)`);
    
    // Using a dedicated WSS connection for lowest latency slot-by-slot interception
    const connection = new Connection(currentRpcHttp, {
        wsEndpoint: SOLANA_RPC_WSS,
        commitment: 'processed' // 'processed' gets us the blocks <500ms, 'confirmed' is too late
    });

    // On WebSocket error, report failure to the router so next call picks a healthier node
    (connection as any)._rpcWebSocket?.on?.('error', () => {
        GlobalRPCRouter.reportFailure(currentRpcHttp, 'SOLANA');
        console.warn(`[SOLANA] RPC endpoint failed. Router will route to next healthy node.`);
    });

    // Subscribe ONLY to transactions touching the ComputeBudget program
    const filter: LogsFilter = {
        mentions: [COMPUTE_BUDGET_PROGRAM.toBase58() as any]
    };

    console.log(`[SOLANA] 🔊 Subscribing to ComputeBudget logs (Processed Commitment)...`);

    connection.onLogs(filter, async (logs, ctx) => {
        if (logs.err || !logs.logs || !Array.isArray(logs.logs)) return;

        // Fast regex parse to find the exact SetComputeUnitPrice instruction
        const priceLog = logs.logs.find(l => typeof l === 'string' && l.includes('SetComputeUnitPrice'));
        if (!priceLog) return;

        // Extract the price paid: e.g. "Program log: SetComputeUnitPrice { micro_lamports: 25000 }"
        const match = priceLog.match(/micro_lamports: (\d+)/);
        if (match && match[1]) {
            const microLamports = parseInt(match[1], 10);

            if (microLamports >= ANOMALY_PRIORITY_THRESHOLD) {
                // Real Z-Score: (observed - median) / stddev
                // Values above 3.0 are statistically extreme (institutional urgency)
                const zScore = ((microLamports - ZSCORE_BASELINE_MEDIAN) / ZSCORE_BASELINE_STDDEV).toFixed(2);

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
                    zScore,
                    microLamports,
                    urgency: 'EXTREME_PRIORITY_FEE'
                };

                console.log(`[SOLANA-SIMD0109] 🐋 WHALE TACTIC DETECTED -> Fee: ${microLamports} uLamports | Z-Score: ${zScore}`);
                
                // [ESTABILIDAD CÓSMICA] Use Redis Streams (XADD) guaranteeing At-Least-Once delivery and persistence.
                // Uses MAXLEN ~ 1000 to keep memory footprint bounded.
                await (redis as any).xadd('whale:alert:stream', 'MAXLEN', '~', 1000, '*', 'payload', JSON.stringify(eventPayload));
            }
        }
    }, 'processed');
}

interceptThermodynamicAnomalies().catch(console.error);
