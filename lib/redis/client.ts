// [EDGE-SAFE] Defer Node.js specific imports
// import Redis from 'ioredis';
// import dotenv from 'dotenv';

const isServer = typeof window === 'undefined';
const IS_EDGE = typeof process !== 'undefined' && process.env?.NEXT_RUNTIME === 'edge';

if (!IS_EDGE && isServer) {
    try {
        // Only run dotenv in non-edge Node environments
        // require('dotenv').config();
    } catch (e) {}
}

function createMockRedis(name?: string) {
    return {
        on: () => {},
        get: async () => null,
        set: async () => 'OK',
        setex: async () => 'OK',
        del: async () => 0,
        status: 'mock',
        __isMock: true
    };
}

// Sanitize and reconstruct REDIS_URL
function getSanitizedRedisUrl(): string {
    const rawUrl = (process.env.REDIS_URL || '').toString();
    
    let sanitized = rawUrl.trim().replace(/^["']|["']$/g, '');

    // If properly formatted, return it
    if (sanitized.startsWith('redis://[REDACTED_REDIS_USER]:[REDACTED_REDIS_PASS]@` : '';
        return `${protocol}://${auth}${host}:${port}`;
    }

    // If we have a password but still no host, try one final Railway default
    if (isLikelyPassword && !host) {
        const fallBackHost = 'roundhouse.proxy.rlwy.net'; 
        const protocol = 'redis';
        const auth = `default:${sanitized}@`;
        
        // [RESILIENCE] Only warn if we are NOT in production, to keep logs cleaner
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`[Redis:Setup] ⚠️ REDIS_URL detected as possible password. Attempting Railway Proxy: ${fallBackHost}`);
        }
        return `${protocol}://${auth}${fallBackHost}:${port}`;
    }

    return sanitized;
}

const REDIS_URL = getSanitizedRedisUrl();

const IS_BUILDING = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'test';

/**
 * Elite-grade Redis Factory
 */
export function createRedisClient(config: { name?: string; isSubscriber?: boolean } = {}) {
    if (IS_EDGE) {
        console.warn(`[Redis:${config.name || 'Factory'}] ⚠️ Edge Runtime detected. Skipping ioredis initialization.`);
        return createMockRedis(config.name);
    }

    if (!REDIS_URL) {
        if (IS_BUILDING) {
            console.warn(`[Redis:${config.name || 'Factory'}] ⚠️ Skipping connection: REDIS_URL not set during build.`);
            return null as any;
        }
        console.error(`[Redis:${config.name || 'Factory'}] 💀 REDIS_URL MISSING. Using Mock-Mode for stability.`);
        return createMockRedis(config.name);
    }

    // Robust validation
    const hasProtocol = REDIS_URL.startsWith('redis://[REDACTED_REDIS_USER]:[REDACTED_REDIS_PASS]@]*@/, ':***@');
                    console.error(`[Redis:Main] 🔴 Critical Connection Failure for ${maskedUrl}:`, err.message);
                    if (err.message.includes('ENOTFOUND')) {
                        console.error(`[Redis:Main] 💀 DNS RESOLUTION FAILED. Check if host has invalid characters (e.g. underscores).`);
                    }
                    redisClient.__errorLogged = true;
                }
            });

            redisClient.on('connect', () => {
                redisClient.__errorLogged = false;
                const masked = (REDIS_URL || '').replace(/:\/\/[^@]*@/, '://***@');
                console.log(`[Redis:Main] ✅ Status: LEGENDARY — Connected to cluster: ${masked}`);
            });
        }
    } else {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('[Redis:Initialization] 💀 CRITICAL: REDIS_URL missing in PRODUCTION.');
        }
        redisClient = createMockRedis('FinalFallback');
    }
} catch (err: any) {
    console.error('⚠️ [Redis:Initialization] Zero-Crash Safeguard Triggered.');
    console.error(`💀 Error: ${err.message}`);
    
    // Diagnostic Helper: Log the shape of the URL without revealing it
    if (REDIS_URL) {
        const maskedPreview = `${REDIS_URL.substring(0, 4)}...${REDIS_URL.substring(REDIS_URL.length - 4)}`;
        console.error(`🔧 Diagnostic: REDIS_URL length: ${REDIS_URL.length}, Start/End: ${maskedPreview}`);
    }
    
    // Fallback to "Degraded Mode" mock instead of crashing the process
    redisClient = createMockRedis('CrashRecovery');
}

// FINAL FALLBACK: If above failed or REDIS_URL was empty
if (!redisClient && !IS_BUILDING) {
    redisClient = createMockRedis('AbsoluteFallback');
    if (process.env.NODE_ENV === 'production') {
        console.error('🚨 [Redis:Production] ⚠️ RUNNING IN DEGRADED MODE. Caching and rate-limiting are DISABLED. Real Redis URL required.');
    }
}

export { redisClient };

export const createSubClient = (name: string) => createRedisClient({ name, isSubscriber: true });

/**
 * ⚡ SAFE REDIS — wraps any redis call in a 500ms timeout.
 * If Redis is unreachable (e.g., DNS failure), returns null immediately
 * instead of blocking the entire API for 300 seconds.
 * Use this EVERYWHERE in critical API paths.
 */
export async function safeRedisGet(key: string): Promise<string | null> {
    try {
        if ((redisClient as any).__isMock || (redisClient as any).__isBuildMock) {
            return null;
        }
        return await Promise.race([
            redisClient.get(key),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 200)) // AGGRESSIVE: 200ms or skip
        ]);
    } catch {
        return null;
    }
}

export async function safeRedisSet(key: string, value: string, ...args: any[]): Promise<void> {
    try {
        if ((redisClient as any).__isMock || (redisClient as any).__isBuildMock) return;
        // Fire-and-forget with a 500ms timeout — never block the response path
        await Promise.race([
            redisClient.set(key, value, ...args),
            new Promise<void>((resolve) => setTimeout(resolve, 500))
        ]);
    } catch {
        // Silently ignore — cache is an optimization, not a requirement
    }
}

/**
 * Health check — use in /api/health-check to verify Redis connectivity
 */
export async function checkRedisHealth(): Promise<{ ok: boolean; latencyMs?: number; mode: 'real' | 'mock' }> {
    if ((redisClient as any).__isMock) {
        return { ok: false, mode: 'mock' };
    }
    const start = Date.now();
    try {
        await redisClient.set('__health_check', '1', 'EX', 10);
        const val = await redisClient.get('__health_check');
        return { ok: val === '1', latencyMs: Date.now() - start, mode: 'real' };
    } catch {
        return { ok: false, latencyMs: Date.now() - start, mode: 'real' };
    }
}

