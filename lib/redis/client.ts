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

    // Attempt reconstruction from individual variables (Railway and generic)
    const host = process.env.REDISHOST || process.env.REDIS_HOST || process.env.RAILWAY_REDIS_HOST;
    const port = process.env.REDISPORT || process.env.REDIS_PORT || '6379';
    const user = process.env.REDISUSER || process.env.REDIS_USER || 'default';
    const pass = process.env.REDISPASSWORD || process.env.REDIS_PASSWORD || rawUrl;
    
    if (host) {
        const protocol = (process.env.REDIS_TLS === 'true' || port === '6380' || rawUrl.includes('rediss')) ? 'rediss' : 'redis';
        const auth = pass ? `${user}:${pass}@` : '';
        return `${protocol}://${auth}${host}:${port}`;
    }

    // Do not guess proxy URL port to prevent silent ETIMEDOUT when port differs. Let the client fail fast.
    return rawUrl.includes('://') ? rawUrl : '';
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
        // Silent Mock-Mode transition
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
    const client = new Redis(REDIS_URL, {
        family: 4, // [IPv4-FIX] Ensure Railway proxy connectivity avoids IPv6 blackholes
        keepAlive: 10000, // [STABILITY] Keep-Alive to prevent proxy timeout
        maxRetriesPerRequest: 3, // Relaxed proxy failover queue
        enableReadyCheck: false,
        connectTimeout: 10000, // 10s for Railway external proxy cold starts
        retryStrategy(times: number) {
            // [LEGENDARY-RESILIENCE] 
            if (times > 6) return null; // STOP retrying after 6 attempts
            return Math.min(times * 200, 2000);
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

    // [FATAL ERROR SUPPRESSION]
    // ioredis emits 'error' events that will crash the Node.js process if unhandled.
    // Railway's proxy frequently drops connections causing ETIMEDOUT.
    // We catch them here to keep the process alive while ioredis auto-reconnects.
    client.on('error', (err: any) => {
        // Only log critical/unexpected errors, ignore standard timeouts that will auto-reconnect
        if (!err.message.includes('ETIMEDOUT') && !err.message.includes('ECONNRESET')) {
            console.error(`[Redis:${config.name || 'Client'}] Handled background error: ${err.message}`);
        }
    });

    return client;
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
            console.info('[Redis:Initialization] Sovereign In-Memory Mock Mode Activated. Operating safely without Redis.');
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
        console.info('📡 [Redis:Production] Sovereign Local Cache operational.');
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

export async function safeRedisSAdd(key: string, member: string): Promise<void> {
    try {
        if ((redisClient as any).__isMock || (redisClient as any).__isBuildMock) {
            const current = memoryStore.get(key) || [];
            if (!current.includes(member)) {
                memoryStore.set(key, [...current, member]);
            }
            return;
        }
        await Promise.race([
            redisClient.sadd(key, member),
            new Promise<void>((resolve) => setTimeout(resolve, 500))
        ]);
    } catch {}
}

export async function safeRedisSMembers(key: string): Promise<string[]> {
    try {
        if ((redisClient as any).__isMock || (redisClient as any).__isBuildMock) {
            return memoryStore.get(key) || [];
        }
        const members = await Promise.race([
            redisClient.smembers(key),
            new Promise<string[]>((resolve) => setTimeout(() => resolve([]), 500))
        ]);
        return Array.isArray(members) ? members : [];
    } catch {
        return [];
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

