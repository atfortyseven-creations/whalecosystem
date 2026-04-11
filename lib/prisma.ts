import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

function getProductionUrl(): string | undefined {
    const rawUrl = process.env.DATABASE_URL;
    if (!rawUrl) return undefined;

    try {
        const urlObj = new URL(rawUrl);
        if (urlObj.protocol === 'postgresql:' || urlObj.protocol === 'postgres:') {
            // Force PgBouncer
            urlObj.searchParams.set('pgbouncer', 'true');
            // Strict Institutional limit: Max 3 connection out of 500 total pool per container
            urlObj.searchParams.set('connection_limit', process.env.DATABASE_CONNECTION_LIMIT || '3');
            // Aggressive TCP timeout
            urlObj.searchParams.set('connect_timeout', '10');
            // Max time a connection can be held in the pool
            urlObj.searchParams.set('pool_timeout', '15');
        }
        return urlObj.toString();
    } catch {
        return rawUrl;
    }
}

function createPrismaClient(): PrismaClient {
    const url = process.env.NODE_ENV === 'production' ? getProductionUrl() : undefined;

    const client = new PrismaClient({
        datasources: url ? { db: { url } } : undefined,
        log: process.env.NODE_ENV === 'production' 
            ? [{ level: 'error', emit: 'event' }] 
            : ['query', 'error', 'warn'],
    });

    // Evento de error global para no bloquear la app nunca
    if (process.env.NODE_ENV === 'production') {
        (client as any).$on('error', (e: any) => {
            console.error('[PRISMA ERROR] Non-blocking:', e);
        });
    }

    return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
