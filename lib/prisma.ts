import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

// [ESTABILIDAD] Prisma singleton pattern.
// FIX: Previously only cached to global when NODE_ENV !== 'production'.
// On Vercel in production, each Lambda invocation that did not hit the module
// cache would create a new PrismaClient with its own connection pool (up to 10
// connections), rapidly exhausting PostgreSQL's max_connections under any
// meaningful load. The correct pattern is unconditional global caching —
// Prisma's own documentation specifies this exact pattern.
//
// Also removed the eager prisma.$connect() call. Prisma connects lazily on
// first query — the eager connect on every cold start was blocking module
// init unnecessarily and could mask startup-time errors.
export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

// Always assign — works correctly in both development (hot-reload) and production
globalForPrisma.prisma = prisma;
