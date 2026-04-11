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
    if (rawUrl.startsWith('redis://[REDACTED_REDIS_USER]:[REDACTED_REDIS_PASS]@` : '';
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
 * ⚡ SAFE REDIS — wraps any redis call in a timeout.
 * Returns 'TIMEOUT' if it takes longer than 1500ms, allowing the caller 
 * to distinguish between a missing key and a network failure.
 */
export async function safeRedisGet(key: string): Promise<string | null | 'TIMEOUT'> {
    try {
        if ((redisClient as any).__isMock || (redisClient as any).__isBuildMock) {
            return await (redisClient as any).get(key);
        }
        
        // Institutional grade timeout: 1500ms.
        return await Promise.race([
            redisClient.get(key),
            new Promise<'TIMEOUT'>((resolve) => setTimeout(() => resolve('TIMEOUT'), 1500))
        ]);
    } catch (e) {
        console.error(`[Redis:SafeGet] Critical Infrastructure Error:`, e);
        return 'TIMEOUT';
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
        // 2500ms for mutation operations
        await Promise.race([
            redisClient.set(key, value, ...args),
            new Promise<void>((resolve) => setTimeout(resolve, 2500))
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
            new Promise<void>((resolve) => setTimeout(resolve, 2500))
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
            new Promise<string[]>((resolve) => setTimeout(() => resolve([]), 2500))
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

