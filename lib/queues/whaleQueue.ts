import { Queue } from 'bullmq';
import { redisClient } from '../redis/client';

/**
 * Whale Alerts Queue Configuration
 * This queue handles the asynchronous dispatch of notifications (Telegram, Mail, etc.)
 * to ensure the primary blockchain escanners don't stall.
 */
export const WHALE_QUEUE_NAME = 'whale-alerts-queue';

/**
 * Singleton Queue Instance
 * Note: BullMQ uses ioredis internally. We pass the already established redisClient connection.
 */
let whaleQueueInstance: any;

if (process.env.REDIS_URL && redisClient && !redisClient.__isMock && !redisClient.__isBuildMock) {
  try {
    whaleQueueInstance = new Queue(WHALE_QUEUE_NAME, {
      connection: redisClient,
      defaultJobOptions: {
        attempts: 3,                 // Retry up to 3 times on failure
        backoff: {
          type: 'exponential',
          delay: 5000,               // Start with 5s delay, doubling each time
        },
        removeOnComplete: true,      // Clean up successfully finished jobs
        removeOnFail: false,         // Keep failed jobs for manual inspection
      },
    });
  } catch (e) {
    console.error(`[Queue:${WHALE_QUEUE_NAME}] 🔴 Failed to initialize. Falling back to mock.`);
    whaleQueueInstance = {
      add: async () => { console.warn(`⚠️ [Queue] Degraded: Alert not queued.`); return null; },
    };
  }
} else {
  // Mock Queue to prevent crashes when redis is bypassed or invalid
  console.warn(`[Queue:${WHALE_QUEUE_NAME}] ⚠️ Redis unavailable or invalid. Using Mock Queue (Alerts won't be queued).`);
  whaleQueueInstance = {
    add: async () => { 
        // No-op mock
        return null; 
    },
  };
}

export const whaleQueue = whaleQueueInstance;

export interface WhaleJobData {
  hash: string;
  from: string;
  to: string;
  asset: string;
  amount: number;
  usdValue: number;
  blockNumber: string;
  chain: string;
  type: string;
  metadata?: any;
}

/** Helper to add a job to the queue */
export async function addWhaleToQueue(data: WhaleJobData) {
  return whaleQueue.add('process-alert', data);
}

