// workers/indexer.ts
import { Worker } from 'bullmq';
import { createPublicClient, webSocket } from 'viem';
import { mainnet, base } from 'viem/chains';
import { createClient } from 'redis';
import { neuralSegregator } from '../lib/neural-segregator';

/**
 * WHALE NODE INDEXER (RPC SIPHON)
 * Connects directly to GetBlock WebSocket nodes to ingest real-time blocks.
 */

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = createClient({ url: REDIS_URL });

const wssClients = [
  {
    chain: mainnet,
    url: 'wss://go.getblock.io/d20bc88064f545478a74dc464c14a09a'  // GetBlock ETH WS primary
  },
  {
    chain: mainnet,
    url: 'wss://go.getblock.io/36eed0bdbb894920b7eff3516a90f131'  // GetBlock ETH WS backup
  }
];

async function startSiphons() {
  await redis.connect();
  console.log('[Siphon] Redis connected. Initializing RPC Node Connections...');

  wssClients.forEach(({ chain, url }) => {
    const client = createPublicClient({
      chain,
      transport: webSocket(url)
    });

    console.log(`[Siphon] Attached to ${chain.name} blockchain stream.`);

    client.watchBlocks({
      onBlock: async (block) => {
        const pulsePayload = {
          chain: chain.name,
          blockNumber: Number(block.number),
          transactions: block.transactions.length,
          timestamp: Number(block.timestamp),
          inferredSector: 'layer-1',
          volumeContext: block.transactions.length * 1500
        };

        await redis.set(`pulse:${chain.name}:latest`, JSON.stringify(pulsePayload), { EX: 60 });

        neuralSegregator.ingestPulse({
          symbol: chain.nativeCurrency.symbol,
          volumeChange: pulsePayload.volumeContext,
          ecosystem: chain.name.toLowerCase(),
          sectorSlug: pulsePayload.inferredSector
        });

        console.log(`[Siphon] Extracted Block ${block.number} on ${chain.name} | Txs: ${block.transactions.length}`);
      },
      onError: error => console.error('[Siphon] Block Watch Error:', error)
    });
  });
}

startSiphons().catch(console.error);
