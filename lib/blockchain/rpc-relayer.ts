// lib/blockchain/rpc-relayer.ts
/**
 * RpcRelayerManager - Sovereign Multi-Account RPC Load Balancer
 * Distributes requests across multiple GetBlock accounts to bypass the 550k CU daily limit.
 */

type NetworkTag = 'ETH' | 'POLYGON' | 'BSC' | 'SOL' | 'ARB';
type ProtocolType = 'RPC' | 'WSS';

interface Endpoint {
    url: string;
    failures: number;
    lastFailedAt: number | null;
}

export class RpcRelayerManager {
    private static endpoints: Record<string, Endpoint[]> = {};
    private static indices: Record<string, number> = {};

    // Cooldown duration before trying a failed endpoint again (5 minutes)
    private static readonly COOLDOWN_MS = 5 * 60 * 1000;

    static {
        this.initialize();
    }

    private static initialize() {
        this.loadCluster('ETH_WSS', process.env.RPC_CLUSTER_ETH_WSS);
        this.loadCluster('ETH_RPC', process.env.RPC_CLUSTER_ETH_RPC);
        
        this.loadCluster('POLYGON_RPC', process.env.RPC_CLUSTER_POLYGON_RPC);
        this.loadCluster('POLYGON_WSS', process.env.RPC_CLUSTER_POLYGON_WSS);
        
        this.loadCluster('BSC_RPC', process.env.RPC_CLUSTER_BSC_RPC);
        this.loadCluster('BSC_WSS', process.env.RPC_CLUSTER_BSC_WSS);
        
        this.loadCluster('SOL_RPC', process.env.RPC_CLUSTER_SOL_RPC);
        
        this.loadCluster('ARB_RPC', process.env.RPC_CLUSTER_ARB_RPC);
    }

    private static loadCluster(key: string, envVar?: string) {
        if (!envVar) {
            this.endpoints[key] = [];
            this.indices[key] = 0;
            return;
        }

        const urls = envVar.split(',').map(url => url.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
        this.endpoints[key] = urls.map(url => ({
            url,
            failures: 0,
            lastFailedAt: null
        }));
        this.indices[key] = 0;
    }

    /**
     * Gets the next available RPC URL for a given network using Round-Robin.
     * Skips endpoints currently in timeout (429 Rate Limit).
     */
    static getRpcUrl(network: NetworkTag, protocol: ProtocolType = 'RPC'): string {
        const key = `${network}_${protocol}`;
        const cluster = this.endpoints[key];

        if (!cluster || cluster.length === 0) {
            console.warn(`[RpcRelayer] No endpoints configured in .env for ${key}. Using public fallback.`);
            if (network === 'ETH' && protocol === 'RPC') return 'https://eth.llamarpc.com';
            if (network === 'BSC' && protocol === 'RPC') return 'https://bsc-dataseed1.binance.org';
            if (network === 'POLYGON' && protocol === 'RPC') return 'https://polygon-rpc.com';
            if (network === 'ARB' && protocol === 'RPC') return 'https://arb1.arbitrum.io/rpc';
            if (network === 'SOL' && protocol === 'RPC') return 'https://api.mainnet-beta.solana.com';
            return ''; 
        }

        const now = Date.now();
        const startIndex = this.indices[key];
        
        for (let i = 0; i < cluster.length; i++) {
            // Traverse array starting from current index
            const currentIndex = (startIndex + i) % cluster.length;
            const endpoint = cluster[currentIndex];

            // If it failed recently, check if cooldown has passed
            if (endpoint.lastFailedAt) {
                if (now - endpoint.lastFailedAt < this.COOLDOWN_MS) {
                    continue; // Skip this node, still healing
                } else {
                    // Node recovered
                    endpoint.lastFailedAt = null;
                }
            }

            // Valid node found, update index for next time (Round-Robin)
            this.indices[key] = (currentIndex + 1) % cluster.length;
            return endpoint.url;
        }

        // Failsafe: All nodes are down. Return the primary node anyway to try our luck
        console.error(`[RpcRelayer] ALL NODES DOWN OR RATE LIMITED FOR ${key}!`);
        return cluster[0].url;
    }

    /**
     * Report a node that returned 429 or 500, temporarily removing it from the pool.
     */
    static reportFailure(network: NetworkTag, protocol: ProtocolType, url: string) {
        const key = `${network}_${protocol}`;
        const cluster = this.endpoints[key];
        if (!cluster) return;

        const endpoint = cluster.find(e => e.url === url);
        if (endpoint) {
            endpoint.failures += 1;
            endpoint.lastFailedAt = Date.now();
            console.warn(`[RpcRelayer] ENDPOINT BLACKLISTED (429/Timeout) -> ${url}. Fails: ${endpoint.failures}`);
        }
    }
}
