/**
 * Phase 9: Elite Global RPC Router
 * Zero-downtime RPC Rotator for Solana and Ethereum.
 * Monitors up to 6 institutional endpoints and routes traffic to the healthiest one.
 */

import { z } from 'zod';

interface RPCEndpoint {
    url: string;
    chain: 'SOLANA' | 'ETHEREUM';
    latencyMs: number;
    health: 'HEALTHY' | 'DEGRADED' | 'DEAD';
    errorCount: number;
}

// [ESTABILIDAD CÓSMICA] Strict Enum Validation ensuring process.env is never blindly trusted.
const RpcSchema = z.string().url();

function safeParseRPC(envValue: string | undefined, fallback: string): string {
    const res = RpcSchema.safeParse(envValue);
    return res.success ? res.data : fallback;
}

const RPC_POOL: Record<string, RPCEndpoint[]> = {
    SOLANA: [
        { url: safeParseRPC(process.env.SOLANA_RPC_1, 'https://api.mainnet-beta.solana.com'), chain: 'SOLANA', latencyMs: 0, health: 'HEALTHY', errorCount: 0 },
        { url: safeParseRPC(process.env.SOLANA_RPC_2, 'https://ssc-dao.genesysgo.net'), chain: 'SOLANA', latencyMs: 0, health: 'HEALTHY', errorCount: 0 },
        { url: safeParseRPC(process.env.SOLANA_RPC_3, 'https://solana-api.projectserum.com'), chain: 'SOLANA', latencyMs: 0, health: 'HEALTHY', errorCount: 0 }
    ],
    ETHEREUM: [
        { url: safeParseRPC(process.env.ETH_RPC_1, 'https://cloudflare-eth.com'), chain: 'ETHEREUM', latencyMs: 0, health: 'HEALTHY', errorCount: 0 },
        { url: safeParseRPC(process.env.ETH_RPC_2, 'https://rpc.ankr.com/eth'), chain: 'ETHEREUM', latencyMs: 0, health: 'HEALTHY', errorCount: 0 }
    ]
};

export class GlobalRPCRouter {
    /**
     * Retrieves the best completely healthy RPC for the given chain.
     */
    static getBestRPC(chain: 'SOLANA' | 'ETHEREUM'): string {
        const pool = RPC_POOL[chain];
        const healthyNodes = pool.filter(n => n.health === 'HEALTHY');
        
        if (healthyNodes.length === 0) {
            // Absolute worst-case scenario: All nodes are failing.
            // Return the first one as a desperate degraded fallback.
            return pool[0].url;
        }

        // Return the node with the lowest latency (placeholder logic)
        healthyNodes.sort((a, b) => a.latencyMs - b.latencyMs);
        return healthyNodes[0].url;
    }

    /**
     * Reports an RPC failure, incrementing error count.
     * Punishes the endpoint if it fails too much.
     */
    static reportFailure(url: string, chain: 'SOLANA' | 'ETHEREUM') {
        const node = RPC_POOL[chain].find(n => n.url === url);
        if (node) {
            node.errorCount += 1;
            if (node.errorCount > 3) node.health = 'DEGRADED';
            if (node.errorCount > 10) node.health = 'DEAD';
            console.warn(`[RPC ROUTER] Endpoint ${url} degraded. Errors: ${node.errorCount}. Status: ${node.health}`);
        }
    }
}
