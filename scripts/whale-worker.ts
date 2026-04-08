import { ethers } from "ethers";
// FIX: Use the global Prisma singleton — prevents connection pool exhaustion
// when multiple workers (EVM + SOL + BTC + BSV) run simultaneously.
import { prisma } from "../lib/prisma";
import dotenv from "dotenv";
import { createServer } from "http";
import { fileURLToPath } from 'url';
import { initializeWebSocket } from "../lib/websocket/server";
import { getRealTimePrice } from "../lib/priceHelper";
import { addWhaleToQueue } from "../lib/queues/whaleQueue";
import { baseResilientProvider, ethereumResilientProvider, bscResilientProvider, ResilientProvider } from "../lib/blockchain/ResilientProvider";
import { redisClient } from "../lib/redis/client";
import { startEvmWorker } from "../services/scanner/evm-worker";
import { startBtcWorker } from "../services/scanner/btc-worker";
import { startSolanaWorker } from "../services/scanner/sol-worker";

dotenv.config();

// Fix ESM path resolution
const __filename = fileURLToPath(import.meta.url);


// Configuration — GetBlock BTC primary endpoint takes priority over legacy BITCOIN_RPC_URL
const BTC_RPC_URL = process.env.GETBLOCK_BTC_RPC || process.env.BITCOIN_RPC_URL;
const WHALE_THRESHOLD_USD = Number(process.env.WHALE_THRESHOLD_USD) || 50000;

// Global Exception Handlers for Maximum Stability
process.on('uncaughtException', (err) => {
  console.error('💀 [PROCESS] Uncaught Exception:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💀 [PROCESS] Unhandled Rejection at:', promise, 'reason:', reason);
});

// Helper to check for active users (CU Optimization)
async function getActiveClients(): Promise<number> {
    try {
        if (!redisClient || redisClient.__isMock) return 1; // Default to active in mock/dev
        const count = await redisClient.get('WHALE_MONITOR_CLIENTS');
        return parseInt(count || '0');
    } catch {
        return 1; // Safety fallback
    }
}

// Comprehensive Token Configuration (BASE, BSC, ETHEREUM)
const TOKEN_CONFIG: Record<string, { symbol: string, decimals: number }> = {
  // --- BASE ---
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": { symbol: "USDC", decimals: 6 },
  "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA": { symbol: "mUSDC", decimals: 6 }, 
  "0x4200000000000000000000000000000000000006": { symbol: "WETH", decimals: 18 },
  "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb": { symbol: "DAI", decimals: 18 },
  "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22": { symbol: "cbETH", decimals: 18 },
  
  // --- BSC (Top 24 BEP20) ---
  "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c": { symbol: "WBNB", decimals: 18 },
  "0x2170Ed0880ac9A755fd29B2688956BD959F933F8": { symbol: "ETH", decimals: 18 },
  "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c": { symbol: "BTCB", decimals: 18 },
  "0x55d398326f99059ff775485246999027b3197955": { symbol: "USDT", decimals: 18 },
  "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56": { symbol: "BUSD", decimals: 18 },
  "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d": { symbol: "USDC", decimals: 18 },
  "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82": { symbol: "CAKE", decimals: 18 },
  "0x4B0F1812e5Df2A09796481Ff14017e6005508003": { symbol: "TWT", decimals: 18 },
  "0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd": { symbol: "LINK", decimals: 18 },
  "0x47bead2563dCBf3bF2c9407fEa4dC236fAbA485A": { symbol: "SXP", decimals: 18 },
  "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47": { symbol: "ADA", decimals: 18 },
  "0xba2ae424d960c26247dd6c32edc70b295c744c43": { symbol: "DOGE", decimals: 8 },
  "0x7083609fce4d1d8dc0c979aab8c869ea2c873402": { symbol: "DOT", decimals: 18 },
  "0x96412902aa9dce33c6ccf94e9f781a204a4a2ee7": { symbol: "AVAX", decimals: 18 },
  "0x8729438eb3f5fbcdb9cbe7ee6f72c05060820edc": { symbol: "WRX", decimals: 8 },
  "0x20bb32115e373a6a6c478a0d0d826a635848529f": { symbol: "BAKE", decimals: 18 },
  "0x2ba592f78db646365272b6bbee9e8d274c76737d": { symbol: "CREAM", decimals: 18 },
  "0x965f527d91599ab1b210f171146def6457eeef23": { symbol: "BSW", decimals: 18 },
  "0xc748673057861a797275cd8a068e799f98df001b": { symbol: "BABYDOGE", decimals: 9 },
  "0x9f5c40ce1c136f455110a174092b3c2e40ae464b": { symbol: "TOKO", decimals: 18 },
  "0xa1f1dfB27E89f2C3B7e30d8847B0d13B446e5E53": { symbol: "ALPHA", decimals: 18 },
  "0x3203c9e4eab99e80075c65d07ad282f175379f7d": { symbol: "MBOX", decimals: 8 },
  "0xc189025e19e782a937a2886f4a86b36149959582": { symbol: "HOOK", decimals: 18 },
  "0xcF6BB5389c92Bdda8aCE618CfD06Eedd49497e6ab": { symbol: "XVS", decimals: 18 },
  "0x57317e3b1816b9b3e945c2257d07996c56857199": { symbol: "GRT", decimals: 18 },
  "0x879743048995c65f97b5e40e6c38a37943c25b89": { symbol: "MANA", decimals: 18 },

  // --- ETHEREUM MAINNET ---
  "0xdac17f958d2ee523a2206206994597c13d831ec7": { symbol: "USDT", decimals: 6 },
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": { symbol: "USDC", decimals: 6 },
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": { symbol: "WETH", decimals: 18 },
  "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": { symbol: "WBTC", decimals: 8 },
  "0x514910771af9ca656af840dff83e8264ecf986ca": { symbol: "LINK", decimals: 18 },
  "0x6b175474e89094c44da98b954eedeac495271d0f": { symbol: "DAI", decimals: 18 },
  "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984": { symbol: "UNI", decimals: 18 },
  "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9": { symbol: "AAVE", decimals: 18 },
  "0xd533a949740bb3306d119cc777fa900ba034cd52": { symbol: "CRV", decimals: 18 },
  "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72": { symbol: "ENS", decimals: 18 },
  "0xae78736cd615f374d3085123a210448e74fc6393": { symbol: "rETH", decimals: 18 },
  "0xae7ab96520de3a18e5e111b5eaab095312d7fe84": { symbol: "stETH", decimals: 18 },
  "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce": { symbol: "SHIB", decimals: 18 },
  "0x6982508145454ce325ddbe47a25d4ec3d2311933": { symbol: "PEPE", decimals: 18 },
  "0x4fabb145d64652a948d72533023f6e7a623c7c53": { symbol: "BUSD", decimals: 18 },
  "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0": { symbol: "MATIC", decimals: 18 },
  "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2": { symbol: "MKR", decimals: 18 },
  "0xba100000625a3754423978a60c9317c58a424e3d": { symbol: "BAL", decimals: 18 },
  "0xc944e90c64b2c07662a292be6244bdf05cda44a7": { symbol: "GRT_ETH", decimals: 18 },
  "0x111111111117dc0aa78b770fa6a738034120c302": { symbol: "1INCH", decimals: 18 },
  "0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c": { symbol: "ENJ", decimals: 18 },
};

const TRANSFER_TOPIC = ethers.id("Transfer(address,address,uint256)");

async function startWorker() {
    try {
        console.log("🐋 [Whale Worker] Starting with Elite Resilience & CU Optimization...");
        
        // Initialize Standalone WebSocket Server on port 3001
        const httpServer = createServer();
        initializeWebSocket(httpServer);
        
        const PORT = process.env.WS_PORT || 3001;
        let currentPort = Number(PORT);

        const startServer = () => {
            httpServer.listen(currentPort, () => {
                console.log(`🚀 [Data Hub] WebSocket Server running on port ${currentPort}`);
            }).on('error', (err: any) => {
                if (err.code === 'EADDRINUSE') {
                    console.warn(`[Whale Worker] Port ${currentPort} is busy, trying ${currentPort + 1}...`);
                    currentPort++;
                    startServer();
                } else {
                    console.error('💀 [WebSocket] Server error:', err);
                }
            });
        };

        startServer();


        // Use Resilient Providers with WebSocket Push support
        // Calling startEvmWorker from the hardened services/scanner microservices
        startEvmWorker(baseResilientProvider, 'BASE').catch(e => console.error("❌ [BASE Worker] Failed:", e));
        startEvmWorker(ethereumResilientProvider, 'ETHEREUM').catch(e => console.error("❌ [ETH Worker] Failed:", e));
        startEvmWorker(bscResilientProvider, 'BSC').catch(e => console.error("❌ [BSC Worker] Failed:", e));

        if (BTC_RPC_URL) {
            startBtcWorker().catch(e => console.error("❌ [BTC Worker] Failed:", e));
        }

        // Add Authentic Solana worker
        startSolanaWorker().catch(e => console.error("❌ [SOL Worker] Failed:", e));

    } catch (err: any) {
        console.error("❌ [Whale Worker] Initialization FATAL Error:", err);
    }
}

export { startWorker, startEvmWorker, startBtcWorker, startSolanaWorker };

// Only run if called directly (CLI)
const isMain = process.argv[1] && (
    process.argv[1].toLowerCase().includes('whale-worker') || 
    process.argv[1].toLowerCase().endsWith('whale-worker.ts') ||
    process.argv[1].toLowerCase().endsWith('whale-worker.js')
);

if (isMain || process.env.WHALE_WORKER_FORCE_START === 'true') {
  startWorker().catch((err: any) => {
    console.error("💀 [Whale Worker] Fatal error during startup:", err);
  });
}



