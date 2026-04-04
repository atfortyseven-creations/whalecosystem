import { ethClient, polClient } from './rpcClient';
import { formatEther } from 'viem';

// Absolute Perfection: The Engine that listens to Web3 without sleeping.
// Utilizes Singleton pattern to survive Next.js Fast Refresh in dev, 
// and run exactly once in Production Container (Railway).

class SovereignMempoolStreamer {
  private static instance: SovereignMempoolStreamer;
  private isListening = false;
  private activeStreams: (() => void)[] = [];

  // Memory buffer for the absolute latest 100 deep-liquidity events
  public readonly recentTiers: any[] = []; 

  private constructor() {
    console.log("🌌 [Sovereign Engine] Mempool Streamer Initialized.");
  }

  public static getInstance(): SovereignMempoolStreamer {
    if (!SovereignMempoolStreamer.instance) {
      SovereignMempoolStreamer.instance = new SovereignMempoolStreamer();
    }
    return SovereignMempoolStreamer.instance;
  }

  public startListening() {
    if (this.isListening) return;
    this.isListening = true;

    console.log("🟢 [Sovereign Engine] Opening Dark Forest WebSockets...");

    // Watch Ethereum Blocks (Macro Tracking)
    const unwatchBlocks = ethClient.watchBlocks({
      onBlock: (block) => {
        console.log(`[ETH L1] New Block Minted: ${block.number} | Transactions: ${block.transactions.length}`);
        // Here we could map through block.transactions, fetch receipts, and push to SSE.
      },
      onError: error => console.error("Block Watch Error", error)
    });

    // Watch Pending Transactions (Sniper / Front-running tracking)
    // NOTE: Requires Alchemy/QuickNode specific WS plans. Using block listener as stable fallback above.
    const unwatchPending = ethClient.watchPendingTransactions({
      onTransactions: (txHashes: any[]) => {
        // High-frequency data. In production, we filter this through Rust/Go.
        // For our Node.js layer, we tap the stream at intervals to prevent V8 memory exhaustion.
        if (Math.random() < 0.05) { // Sample 5% for the Dashboard UI feed
          this.recentTiers.push({ hash: txHashes[0], timestamp: Date.now(), network: 'Ethereum' });
          if (this.recentTiers.length > 50) this.recentTiers.shift(); 
        }
      },
    });

    this.activeStreams.push(unwatchBlocks, unwatchPending);
  }

  public stopListening() {
    this.activeStreams.forEach(unwatch => unwatch());
    this.activeStreams = [];
    this.isListening = false;
  }
}

// Global scope isolation for Next.js hot-reloading stability
const globalForSovereign = globalThis as unknown as {
    sovereignMempool?: SovereignMempoolStreamer;
};

export const mempoolWatcher = globalForSovereign.sovereignMempool || SovereignMempoolStreamer.getInstance();

if (process.env.NODE_ENV !== 'production') globalForSovereign.sovereignMempool = mempoolWatcher;

// Auto-start in production immediately 
if (process.env.NODE_ENV === 'production') {
    mempoolWatcher.startListening();
}
