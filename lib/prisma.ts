import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

// [ESTABILIDAD CÓSMICA] Prisma Singleton for Massive Multi-Replica Deployments
// PgBouncer injection at runtime only — never at build time.
// During `next build`, DATABASE_URL is not injected by Railway, so we must
// fall back to the default env-based resolution to avoid PrismaClientConstructorValidationError.

function getProductionUrl(): string | undefined {
    const rawUrl = process.env.DATABASE_URL;
    // If not set (build time), return undefined — Prisma will use its own env detection
    if (!rawUrl) return undefined;
    // If already pooled, use as-is
    if (rawUrl.includes('pgbouncer=true')) return rawUrl;

    try {
        const urlObj = new URL(rawUrl);
        if (urlObj.protocol === 'postgresql:' || urlObj.protocol === 'postgres:') {
            urlObj.searchParams.set('pgbouncer', 'true');
            if (!urlObj.searchParams.has('connection_limit')) {
                urlObj.searchParams.set('connection_limit', '5');
            }
        }
        return urlObj.toString();
    } catch {
        return rawUrl;
    }
}

function createPrismaClient(): PrismaClient {
    // Only inject custom datasource URL when we actually have one at runtime.
    // At build time, let Prisma handle env resolution itself.
    const url = process.env.NODE_ENV === 'production' ? getProductionUrl() : undefined;

    if (url) {
        return new PrismaClient({
            datasources: { db: { url } },
            log: ['error'],
        });
    }

    return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = prisma;
