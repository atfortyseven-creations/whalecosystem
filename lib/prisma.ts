import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

// [ESTABILIDAD CÓSMICA] Prisma Singleton for Massive Multi-Replica Deployments
// Extracts standard DATABASE_URL to inject pgBouncer params preventing connection exhaustion.

function getPooledDatabaseUrl() {
    const rawUrl = process.env.DATABASE_URL;
    if (!rawUrl) return undefined;
    
    // Si ya trae poolers, retornarla tal cual
    if (rawUrl.includes('pgbouncer=true')) return rawUrl;

    try {
        const urlObj = new URL(rawUrl);
        // Si no estamos en Supabase o un protocolo extraño (solo psql estándar), inyectamos límites de seguridad.
        if (urlObj.protocol === 'postgresql:' || urlObj.protocol === 'postgres:') {
            urlObj.searchParams.set('pgbouncer', 'true');
            if (!urlObj.searchParams.has('connection_limit')) {
                // Al escalar a 42-100 réplicas, limitar cada contenedor a 5 conexiones para no colapsar pgBouncer.
                urlObj.searchParams.set('connection_limit', '5');
            }
        }
        return urlObj.toString();
    } catch {
        return rawUrl;
    }
}

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        datasources: {
            db: {
                url: process.env.NODE_ENV === 'production' ? getPooledDatabaseUrl() : process.env.DATABASE_URL,
            },
        },
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

globalForPrisma.prisma = prisma;
