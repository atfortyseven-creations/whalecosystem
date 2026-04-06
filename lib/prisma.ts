import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

// [ESTABILIDAD] Prisma singleton pattern + Configuración robusta para resolver agotamiento de pool
export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// [AUTORECUPERACIÓN] Asegurar que testamos la conexión de manera asíncrona, previniendo lock en Vercel
if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
    prisma.$connect().catch((e) => {
        console.error('[Prisma:Init] Error crítico al conectar:', e.message);
    });
}

