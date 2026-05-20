import { createPublicClient, http, fallback } from 'viem';
import { mainnet } from 'viem/chains';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// High performance resilient client
const ethClient = createPublicClient({
  chain: mainnet,
  transport: fallback([
    http('https://eth.llamarpc.com'),
    http('https://rpc.ankr.com/eth'),
    http('https://cloudflare-eth.com')
  ], { rank: true })
});

async function indexLatestBlock() {
  try {
    const block = await ethClient.getBlock({
      includeTransactions: true
    });

    console.log(`[INDEXER] Captured Block: ${block.number}`);

    await prisma.$transaction(async (tx) => {
      // 1. Insert Block
      await tx.humanityLedgerBlock.upsert({
        where: { hash: block.hash },
        update: {},
        create: {
          id: block.number,
          hash: block.hash,
          parentHash: block.parentHash,
          timestamp: block.timestamp,
          miner: block.miner,
          gasUsed: block.gasUsed,
          gasLimit: block.gasLimit,
          baseFee: block.baseFeePerGas || 0n,
          txCount: block.transactions.length
        }
      });

      // 2. Insert Transactions in bulk
      const transactionsToInsert = block.transactions.map((t: Record<string, unknown>) => ({
        hash: t.hash,
        blockNumber: block.number,
        from: t.from,
        to: t.to || 'CONTRACT_CREATION',
        value: t.value.toString(),
        gasPrice: (t.gasPrice || t.maxFeePerGas || 0n).toString(),
        gas: t.gas,
        transactionIndex: t.transactionIndex,
        timestamp: block.timestamp
      }));

      // In SQLite/Postgres we can use createMany for speed
      await tx.humanityLedgerTransaction.createMany({
        data: transactionsToInsert,
        skipDuplicates: true
      });
    }, {
      timeout: 10000 // 10 seconds max for a transaction block
    });

    console.log(`[INDEXER] Processed ${block.transactions.length} transactions from block ${block.number}.`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`[INDEXER ERROR] Could not index block: ${error.message}`);
    } else {
      console.error('[INDEXER ERROR] Could not index block: Unknown error');
    }
  }
}

// Continuous polling loop with high fault tolerance
async function runIndexer() {
  console.log('[INDEXER] Booting Sovereign Humanity Indexer...');
  while (true) {
    await indexLatestBlock();
    // Wait 12 seconds (Ethereum block time)
    await new Promise(resolve => setTimeout(resolve, 12000));
  }
}

// Launch
runIndexer();
