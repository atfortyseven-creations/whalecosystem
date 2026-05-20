import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Maximum space enforcement: 7 Days Rolling Window
const RETENTION_DAYS = 7;

async function pruneOldBlocks() {
  try {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - RETENTION_DAYS);
    // Convert to Unix Timestamp (seconds)
    const thresholdTimestamp = Math.floor(thresholdDate.getTime() / 1000);

    console.log(`[PRUNER] Initiating absolute purge for blocks older than timestamp ${thresholdTimestamp}...`);

    // Using raw SQL for maximum performance deletion
    // Due to cascading deletion, removing blocks will also remove transactions
    const result = await prisma.$executeRaw`
      DELETE FROM "HumanityLedgerBlock" 
      WHERE "timestamp" < ${thresholdTimestamp}
    `;

    console.log(`[PRUNER] Purge completed. Deleted rows: ${result}`);

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`[PRUNER ERROR] Could not prune old blocks: ${error.message}`);
    } else {
      console.error('[PRUNER ERROR] Could not prune old blocks: Unknown error');
    }
  }
}

// Run once a day
async function runPruner() {
  console.log('[PRUNER] Booting Space Guardian (7-Day Rolling Window)...');
  while (true) {
    await pruneOldBlocks();
    // Wait 24 hours
    await new Promise(resolve => setTimeout(resolve, 24 * 60 * 60 * 1000));
  }
}

runPruner();
