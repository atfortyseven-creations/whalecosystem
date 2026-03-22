import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redisClient, checkRedisHealth } from '@/lib/redis/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: { connected: false, error: null },
    redis: { connected: false, mode: 'unknown', latency: null }
  };

  try {
    // Check Database
    await prisma.$queryRaw`SELECT 1`;
    status.database.connected = true;
  } catch (e: any) {
    status.database.error = e.message;
  }

  try {
    // Check Redis
    const health = await checkRedisHealth();
    status.redis.connected = health.ok;
    status.redis.mode = health.mode;
    status.redis.latency = health.latencyMs;
  } catch (e: any) {
    status.redis.error = e.message;
  }

  return NextResponse.json(status);
}
