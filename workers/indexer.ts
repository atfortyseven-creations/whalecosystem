// workers/indexer.ts
import { Worker } from 'bullmq';
import { createPublicClient, webSocket, parseAbiItem } from 'viem';
import { mainnet, base, arbitrum } from 'viem/chains';
import { createClient } from 'redis';
import { neuralSegregator } from '../lib/neural-segregator';

/**
 * SOVEREIGN NODE INDEXER (RPC SIPHON)
 * Connects directly to Erigon/Alchemy WebSocket nodes to ingest real-time blocks.
 */

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = createClient({ url: REDIS_URL });

const wssClients = [
  { chain: mainnet, url: process.env.ETH_WSS_RPC || 'wss://eth-mainnet.g.alchemy.com/v2/KEY' },
  { chain: base, url: process.env.BASE_WSS_RPC || 'wss://base-mainnet.g.alchemy.com/v2/KEY' }
];

async function startSiphons() {
  await redis.connect();
  console.log('[Siphon] Redis connected. Initializing RPC Node Connections...');

  wssClients.forEach(({ chain, url }) => {
    const client = createPublicClient({
      chain,
      transport: webSocket(url)
    });

    console.log(\`[Siphon] Attached to \${chain.name} blockchain stream.\`);

    // Ingesting raw block headers to capture transactional velocity (TVL changes)
    client.watchBlocks({
      onBlock: async (block) => {
        // Compress block data & identify high-volume token transfers
        const pulsePayload = {
          chain: chain.name,
          blockNumber: Number(block.number),
          transactions: block.transactions.length,
          timestamp: Number(block.timestamp),
          // In a real memory-state engine, we'd use viem filter logs to categorize by sector.
          // For now, we simulate the output passed to Neural Segregator.
          inferredSector: 'layer-1', 
          volumeContext: block.transactions.length * 1500 // mock avg $ transfer
        };

        // Cache in memory state engine
        await redis.set(\`pulse:\${chain.name}:latest\`, JSON.stringify(pulsePayload), { EX: 60 });
        
        // Feed directly to Neural Segregator
        neuralSegregator.ingestPulse({
          symbol: chain.nativeCurrency.symbol,
          volumeChange: pulsePayload.volumeContext,
          ecosystem: chain.name.toLowerCase(),
          sectorSlug: pulsePayload.inferredSector
        });

        console.log(\`[Siphon] Extracted Block \${block.number} on \${chain.name} | Txs: \${block.transactions.length}\`);
      },
      onError: error => console.error('[Siphon] Block Watch Error:', error)
    });
  });
}

startSiphons().catch(console.error);
