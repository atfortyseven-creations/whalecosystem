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
            // parseInt(null) === NaN — NaN < 35000 is always false → always degraded.
            // Use explicit null guard before parsing.
            meshAlive = !!meshHb && (now - parseInt(meshHb, 10)) < 35000;
            solanaAlive = !!solanaHb && (now - parseInt(solanaHb, 10)) < 35000;
        }

        return NextResponse.json({ 
            status: (meshAlive && solanaAlive) ? 'healthy' : 'degraded', 
            timestamp: new Date().toISOString(),
            // Infra details intentionally omitted from public response
            services: {
                db: dbLatency < 500 ? 'OK' : 'DEGRADED',
                cache: redisHealth.ok ? 'OK' : 'DEGRADED',
                workers: (meshAlive && solanaAlive) ? 'OK' : 'DEGRADED',
            }
        }, { status: 200 });
    } catch (e: any) {
        // Never expose internal error messages publicly
        return NextResponse.json({ 
            status: 'unhealthy',
        }, { status: 503 });
    }
}

