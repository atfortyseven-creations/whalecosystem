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

    // Sovereign error filter: suppress P1009 (table not in DB yet) which floods logs
    // during the window between schema push and migration. Log all other errors normally.
    if (process.env.NODE_ENV === 'production') {
        (client as any).$on('error', (e: any) => {
            const msg: string = e?.message || '';
            const isTableMissing = msg.includes('does not exist in the current database') ||
                                   msg.includes('P1009') ||
                                   msg.includes('P2021'); // table does not exist
            if (!isTableMissing) {
                console.error('[PRISMA] DB Error:', msg.slice(0, 300));
            }
        });
    }

    return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export default prisma;
