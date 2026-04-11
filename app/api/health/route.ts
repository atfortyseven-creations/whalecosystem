import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRedisHealth, redisClient } from '@/lib/redis/client';

export async function GET() {
    const replicaId = process.env.RAILWAY_REPLICA_ID || 'local';
    const start = Date.now();
    
    try {
        // [1] DB Integrity Ping
        await prisma.$queryRaw`SELECT 1`;
        const dbLatency = Date.now() - start;

        // [2] Redis & Worker Telemetry
        const redisHealth = await checkRedisHealth();
        
        let meshAlive = false;
        let solanaAlive = false;

        if (redisClient && !redisClient.__isMock) {
            const meshHb = await redisClient.get(`hb:worker:mesh:${replicaId}`);
            const solanaHb = await redisClient.get(`hb:worker:solana:${replicaId}`);
            
            const now = Date.now();
            meshAlive = meshHb && (now - parseInt(meshHb)) < 35000;
            solanaAlive = solanaHb && (now - parseInt(solanaHb)) < 35000;
        }

        return NextResponse.json({ 
            status: (meshAlive && solanaAlive) ? 'healthy' : 'degraded', 
            timestamp: new Date().toISOString(),
            replica: replicaId,
            uptime: process.uptime(),
            telemetry: {
                db: { status: 'OK', latencyMs: dbLatency },
                redis: { status: redisHealth.ok ? 'OK' : 'FAIL', mode: redisHealth.mode },
                workers: {
                    mesh: meshAlive ? 'ACTIVE' : 'INACTIVE',
                    solana: solanaAlive ? 'ACTIVE' : 'INACTIVE'
                }
            }
        }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ 
            status: 'unhealthy', 
            error: e.message,
            replica: replicaId 
        }, { status: 503 });
    }
}

