import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

function getProductionUrl(): string | undefined {
    const rawUrl = process.env.DATABASE_URL;
    if (!rawUrl) return undefined;
    if (rawUrl.includes('pgbouncer=true')) return rawUrl;

    try {
        const urlObj = new URL(rawUrl);
        if (urlObj.protocol === 'postgresql:' || urlObj.protocol === 'postgres:') {
            urlObj.searchParams.set('pgbouncer', 'true');
            // LIMITACIÓN INSTITUCIONAL: máximo 3 conexiones por réplica
            urlObj.searchParams.set('connection_limit', process.env.DATABASE_CONNECTION_LIMIT || '3');
            // Timeout agresivo para evitar colgar el boot
            urlObj.searchParams.set('connect_timeout', '10');
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
