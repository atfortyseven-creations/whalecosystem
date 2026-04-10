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

const memoryStore = new Map<string, any>();

function createMockRedis(name?: string) {
    return {
        on: () => {},
        get: async (k: string) => memoryStore.get(k) || null,
        set: async (k: string, v: any) => { memoryStore.set(k, v); return 'OK'; },
        setex: async (k: string, s: number, v: any) => { 
            memoryStore.set(k, v); 
            setTimeout(() => memoryStore.delete(k), s * 1000);
            return 'OK'; 
        },
        del: async (k: string) => { 
            const r = memoryStore.has(k) ? 1 : 0; 
            memoryStore.delete(k); 
            return r; 
        },
        status: 'mock',
        __isMock: true
    };
}

// Sanitize and reconstruct REDIS_URL
function getSanitizedRedisUrl(): string {
    const rawUrl = (process.env.REDIS_URL || '').toString().trim().replace(/^["']|["']$/g, '');
    
    // If properly formatted, return it
    if (rawUrl.startsWith('redis://') || rawUrl.startsWith('rediss://')) {
        return rawUrl;
    }

    // [FIX] If it looks like a host:port or just a host (contains a dot), prepend redis://
    if (rawUrl && !rawUrl.includes('://') && rawUrl.includes('.')) {
        return `redis://${rawUrl}`;
    }

    // Attempt reconstruction from individual variables
    const host = process.env.REDISHOST || process.env.REDIS_HOST || process.env.RAILWAY_REDIS_HOST;
    const port = process.env.REDISPORT || process.env.REDIS_PORT || '6379';
    const user = process.env.REDISUSER || process.env.REDIS_USER || 'default';
    
    // If rawUrl is likely a password (long, no dots, no protocol)
    const isLikelyPassword = rawUrl && !rawUrl.includes('://') && !rawUrl.includes('.') && rawUrl.length > 20;
    const pass = process.env.REDISPASSWORD || process.env.REDIS_PASSWORD || (isLikelyPassword ? rawUrl : '');
    
    if (host) {
        const protocol = (process.env.REDIS_TLS === 'true' || port === '6380' || rawUrl.includes('rediss')) ? 'rediss' : 'redis';
        const auth = pass ? `${user}:${pass}@` : '';
        return `${protocol}://${auth}${host}:${port}`;
    }

    // Attempt Railway Proxy if we ONLY have a password
    if (isLikelyPassword && !host) {
        const fallBackHost = 'roundhouse.proxy.rlwy.net'; 
        return `redis://default:${rawUrl}@${fallBackHost}:${port}`;
    }

    // [CRITICAL FIX] If it's not a valid URL by this point, DO NOT return just a random string
    // as ioredis will interpret it as a domain name and cause endless ENOTFOUND loops!
    return '';
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
    const hasProtocol = REDIS_URL.startsWith('redis://') || REDIS_URL.startsWith('rediss://');
    if (!hasProtocol) {
        console.error(`[Redis:${config.name || 'Factory'}] 💀 Invalid REDIS_URL format. Using Mock-Mode for stability.`);
        return createMockRedis(config.name);
    }

    console.log(`[Redis:${config.name || 'Factory'}] 🚀 Initializing legendary connection...`);

    const Redis = require('ioredis');
    return new Redis(REDIS_URL, {
        family: 0, // [DNS-FIX] Dual-stack resolution
        keepAlive: 10000, // [STABILITY] Keep-Alive to prevent proxy timeout
        maxRetriesPerRequest: 1, // FAST FAIL: Don't queue requests if Redis is down
        enableReadyCheck: false,
        connectTimeout: 2000, // AGGRESSIVE: 2s or fail
        retryStrategy(times: number) {
            // [LEGENDARY-RESILIENCE] Skip retries if infrastructure is failing
            if (times > 3) return null; // STOP retrying after 3 attempts
            return Math.min(times * 100, 1000);
        },
        reconnectOnError(err: any) {
            const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN'];
            const shouldReconnect = targetErrors.some(e => err.message.includes(e));
            if (shouldReconnect) {
                console.warn(`[Redis:${config.name || 'Client'}] 🔄 Reconnecting on critical error: ${err.message}`);
            }
            return shouldReconnect;
        }
    });
}

let redisClient: any;

try {
    if (IS_EDGE) {
        redisClient = createMockRedis('EdgeRuntime');
    } else if (REDIS_URL || IS_BUILDING) {
            if (IS_BUILDING) {
            // Build Phase: provide a safe dummy to satisfy static analysis
            redisClient = {
                on: () => {},
                get: async () => null,
                set: async () => 'OK',
                setex: async () => 'OK',
                del: async () => 0,
                status: 'build-mock',
                __isBuildMock: true,
            };
        } else {
            // Dev + Production: share a real ioredis instance across HMR reloads in Next.js
            if (!(global as any).__redisClient) {
                (global as any).__redisClient = createRedisClient({ name: 'Legendary' });
            }
            redisClient = (global as any).__redisClient;
        }

        if (redisClient && typeof redisClient.on === 'function') {
            redisClient.on('error', (err: any) => {
                if (!redisClient.__errorLogged) {
                    const urlToMask = REDIS_URL || 'UNDEFINED_URL';
                    const maskedUrl = urlToMask.replace(/:[^@]*@/, ':***@');
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
        // [RESILIENCE] Never throw — a missing REDIS_URL must not kill the server process.
        // Features requiring Redis (rate-limiting, caching) will degrade gracefully.
        if (process.env.NODE_ENV === 'production') {
            console.error('[Redis:Initialization] 🚨 REDIS_URL missing in PRODUCTION. Running in DEGRADED MODE.');
            console.error('[Redis:Initialization] ⚠️  Set REDIS_URL in Railway dashboard to enable caching & rate-limiting.');
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
            return await (redisClient as any).get(key);
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
        if ((redisClient as any).__isMock || (redisClient as any).__isBuildMock) {
            if (args.length >= 2 && args[0] === 'EX') {
                await (redisClient as any).setex(key, args[1], value);
            } else {
                await (redisClient as any).set(key, value);
            }
            return;
        }
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

