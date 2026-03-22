import dotenv from "dotenv";
import { startEvmWorker } from "./evm-worker";
import { startBtcWorker } from "./btc-worker";
import { startSolanaWorker } from "./sol-worker";
import { baseResilientProvider, ethereumResilientProvider, bscResilientProvider } from "../../lib/blockchain/ResilientProvider";

dotenv.config();

// LEGENDARY SCANNERS CLUSTER
// This service runs in a standalone process to ensure zero-impact on Next.js UI threads.
async function main() {
    console.log("🚀 [Scanner Cluster] Initializing Elite Data Ingestion...");

    // 1. EVM Streamers (Base, Ethereum, BSC)
    // Using Resilient Providers for sub-100ms failover
    startEvmWorker(baseResilientProvider, 'BASE').catch(e => console.error("❌ [BASE Scanner] Fatal:", e));
    startEvmWorker(ethereumResilientProvider, 'ETHEREUM').catch(e => console.error("❌ [ETH Scanner] Fatal:", e));
    startEvmWorker(bscResilientProvider, 'BSC').catch(e => console.error("❌ [BSC Scanner] Fatal:", e));

    // 2. Bitcoin Sentinel
    if (process.env.BITCOIN_RPC_URL) {
        startBtcWorker().catch(e => console.error("❌ [BTC Scanner] Fatal:", e));
    }

    // 3. Solana Pulse
    startSolanaWorker().catch(e => console.error("❌ [SOL Scanner] Fatal:", e));

    process.on('SIGTERM', () => {
        console.log("🛑 [Scanner Cluster] SIGTERM received. Graceful shutdown initiated.");
        process.exit(0);
    });
}

main().catch(err => {
    console.error("💀 [Scanner Cluster] CRITICAL STARTUP ERROR:", err);
    process.exit(1);
});
