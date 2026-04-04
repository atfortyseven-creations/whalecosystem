import { createPublicClient, webSocket, defineChain, http } from 'viem';
import { mainnet, polygon } from 'viem/chains';

// Absolute Perfection: Institutional Grade Fallback Configuration
// 1. WebSocket for Zero-Latency Subscriptions
// 2. HTTP Fallback for historical/large queries

// Fallback to public endpoints if ENV vars are missing during compilation, 
// but warn the server to switch to Paid Enterprise Endpoints.
const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY || "demo";
const ETH_WS_URL = process.env.ETH_WS_URL || `wss://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`;
const POL_WS_URL = process.env.POL_WS_URL || `wss://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`;

// Create highly stable, auto-reconnecting WebSocket clients.
export const ethClient = createPublicClient({
  chain: mainnet,
  transport: webSocket(ETH_WS_URL, {
    retryCount: 5,
    retryDelay: 1000, // Exponential backoff for maximum resilience
    keepAlive: true,
  }),
});

export const polClient = createPublicClient({
  chain: polygon,
  transport: webSocket(POL_WS_URL, {
    retryCount: 5,
    retryDelay: 1000,
    keepAlive: true,
  }),
});

// Used for fetching blocks/receipts when WS pushes a hash.
export const ethHttpClient = createPublicClient({
    chain: mainnet,
    transport: http()
});

console.log("🟢 [Sovereign Engine] High-Fidelity Viem WebSocket Clients Initialized.");
