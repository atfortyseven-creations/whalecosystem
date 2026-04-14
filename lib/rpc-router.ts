import { z } from 'zod';
import { redisClient } from './redis/client';

interface RPCEndpoint {
    url: string;
    chain: 'SOLANA' | 'ETHEREUM';
    latencyMs: number;
    health: 'HEALTHY' | 'DEGRADED' | 'DEAD';
    errorCount: number;
}

const RpcSchema = z.string().url();

function safeParseRPC(envValue: string | undefined, fallback: string): string {
    const res = RpcSchema.safeParse(envValue);
    return res.success ? res.data : fallback;
}

const RPC_POOL: Record<string, RPCEndpoint[]> = {
    SOLANA: [
        { url: safeParseRPC(process.env.SOLANA_RPC_1, 'https://go.getblock.io/d7b69447567646fbbf33146095d32c19'), chain: 'SOLANA', latencyMs: 0, health: 'HEALTHY', errorCount: 0 },
        { url: safeParseRPC(process.env.SOLANA_RPC_2, 'https://go.getblock.io/3cc93340fea44554a8b3b40d3e071131'), chain: 'SOLANA', latencyMs: 0, health: 'HEALTHY', errorCount: 0 },
        { url: safeParseRPC(process.env.SOLANA_RPC_3, 'https://api.mainnet-beta.solana.com'), chain: 'SOLANA', latencyMs: 0, health: 'HEALTHY', errorCount: 0 },
        { url: safeParseRPC(process.env.SOLANA_RPC_4, 'https://ssc-dao.genesysgo.net'), chain: 'SOLANA', latencyMs: 0, health: 'HEALTHY', errorCount: 0 }
    ],
    ETHEREUM: [
        { url: safeParseRPC(process.env.ETH_RPC_1, 'https://cloudflare-eth.com'), chain: 'ETHEREUM', latencyMs: 0, health: 'HEALTHY', errorCount: 0 },
        { url: safeParseRPC(process.env.ETH_RPC_2, 'https://rpc.ankr.com/eth'), chain: 'ETHEREUM', latencyMs: 0, health: 'HEALTHY', errorCount: 0 }
    ]
};

const REDIS_HEALTH_KEY = 'rpc:cluster:health:matrix';

export class GlobalRPCRouter {
    /**
     * Synchronizes local state with GLobal Redis Health Matrix
     */
    private static async syncHealth(chain: 'SOLANA' | 'ETHEREUM') {
        try {
            if (!redisClient || redisClient.__isMock) return;
            const globalHealth = await redisClient.hgetall(`${REDIS_HEALTH_KEY}:${chain}`);
            if (!globalHealth) return;

            const pool = RPC_POOL[chain];
            pool.forEach(node => {
                const state = globalHealth[node.url];
                if (state) {
                    const parsed = JSON.parse(state);
                    node.health = parsed.health;
                    node.errorCount = parsed.errorCount;
                }
            });
        } catch (e) {
            // fail-open: use local state if redis is down
        }
    }

    /**
     * Retrieves the best completely healthy RPC for the given chain.
     * Note: In high-performance loops, calling this every time is fine due to local pool selection.
     */
    static getBestRPC(chain: 'SOLANA' | 'ETHEREUM'): string {
        // [INSTITUTIONAL] Trigger async sync (fire-and-forget for this tick)
        this.syncHealth(chain).catch(() => {});

        const pool = RPC_POOL[chain];
        const healthyNodes = pool.filter(n => n.health === 'HEALTHY');
        
        if (healthyNodes.length === 0) {
            return pool[0].url;
        }

        healthyNodes.sort((a, b) => a.latencyMs - b.latencyMs);
        return healthyNodes[0].url;
    }

    /**
     * Reports an RPC failure, incrementing error count and broadcasting to the cluster.
     */
    static async reportFailure(url: string, chain: 'SOLANA' | 'ETHEREUM') {
        const node = RPC_POOL[chain].find(n => n.url === url);
        if (node) {
            node.errorCount += 1;
            if (node.errorCount > 3) node.health = 'DEGRADED';
            if (node.errorCount > 10) node.health = 'DEAD';
            
            console.warn(`[RPC ROUTER] Endpoint ${url} degraded. Errors: ${node.errorCount}. Status: ${node.health}`);

            // PERSIST TO CLUSTER
            try {
                if (redisClient && !redisClient.__isMock) {
                    await redisClient.hset(
                        `${REDIS_HEALTH_KEY}:${chain}`,
                        url,
                        JSON.stringify({ health: node.health, errorCount: node.errorCount })
                    );
                    // Expire health state after 1 hour of silence to allow auto-recovery
                    await redisClient.expire(`${REDIS_HEALTH_KEY}:${chain}`, 3600);
                }
            } catch (e) {}
        }
    }
}

