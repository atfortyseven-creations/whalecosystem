import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redisClient } from '@/lib/redis/client';

// JWT_SECRET must be configured in Railway environment variables.
// Empty string guarantees jwtVerify fails if the variable is missing —
// never silently accept forged tokens with a known fallback.
const JWT_SECRET = process.env.JWT_SECRET ?? '';

const BLOCKED_IP_PREFIX = 'sovereign:blocked_ip:';
const BLOCKED_IP_INDEX  = 'sovereign:blocked_ip_index';

interface BlockedIPEntry {
    ipAddress: string;
    reason: string;
    blockedAt: string;
    expiresAt: string | null;
}

// ─── Admin authentication ────────────────────────────────────────────────────
async function isAdminAuthenticated(): Promise<boolean> {
    if (!JWT_SECRET) return false;
    try {
        const cookieStore = await cookies();
        const adminToken = cookieStore.get('admin_token');
        if (!adminToken) return false;
        await jwtVerify(adminToken.value, new TextEncoder().encode(JWT_SECRET));
        return true;
    } catch {
        return false;
    }
}

// ─── GET: List all active blocked IPs ────────────────────────────────────────
export async function GET(): Promise<NextResponse> {
    if (!(await isAdminAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch all tracked IP keys from the Redis index set
        const members: string[] = await redisClient.smembers(BLOCKED_IP_INDEX) ?? [];
        const now = new Date();
        const activeBlocks: BlockedIPEntry[] = [];

        for (const ip of members) {
            const raw = await redisClient.get(`${BLOCKED_IP_PREFIX}${ip}`);
            if (!raw) {
                // TTL expired — remove stale member from index
                await redisClient.srem(BLOCKED_IP_INDEX, ip);
                continue;
            }
            const entry: BlockedIPEntry = JSON.parse(raw);
            // Honour application-level expiry (Redis TTL is the authoritative expiry,
            // but we double-check here to handle permanent blocks with no TTL)
            if (entry.expiresAt && new Date(entry.expiresAt) <= now) {
                await redisClient.del(`${BLOCKED_IP_PREFIX}${ip}`);
                await redisClient.srem(BLOCKED_IP_INDEX, ip);
                continue;
            }
            activeBlocks.push(entry);
        }

        return NextResponse.json({ blockedIPs: activeBlocks, totalCount: activeBlocks.length });
    } catch (error) {
        console.error('[Admin:BlockedIPs:GET] Failed to list blocked IPs:', error);
        return NextResponse.json({ error: 'Failed to fetch blocked IPs' }, { status: 500 });
    }
}

// ─── POST: Block an IP ───────────────────────────────────────────────────────
export async function POST(request: NextRequest): Promise<NextResponse> {
    if (!(await isAdminAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { ipAddress, reason, expiresAt } = body as {
            ipAddress?: string;
            reason?: string;
            expiresAt?: string | null;
        };

        if (!ipAddress || !reason) {
            return NextResponse.json(
                { error: 'Missing required fields: ipAddress, reason' },
                { status: 400 }
            );
        }

        const entry: BlockedIPEntry = {
            ipAddress,
            reason,
            blockedAt: new Date().toISOString(),
            expiresAt: expiresAt ?? null,
        };

        const key = `${BLOCKED_IP_PREFIX}${ipAddress}`;
        const value = JSON.stringify(entry);

        if (expiresAt) {
            const ttlSeconds = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
            if (ttlSeconds > 0) {
                await redisClient.setex(key, ttlSeconds, value);
            } else {
                return NextResponse.json({ error: 'expiresAt must be in the future' }, { status: 400 });
            }
        } else {
            // Permanent block — no TTL
            await redisClient.set(key, value);
        }

        // Register in the index set so GET can enumerate all blocked IPs
        await redisClient.sadd(BLOCKED_IP_INDEX, ipAddress);

        return NextResponse.json({ success: true, blockedIP: entry });
    } catch (error) {
        console.error('[Admin:BlockedIPs:POST] Failed to block IP:', error);
        return NextResponse.json({ error: 'Failed to block IP' }, { status: 500 });
    }
}

// ─── DELETE: Unblock an IP ───────────────────────────────────────────────────
export async function DELETE(request: NextRequest): Promise<NextResponse> {
    if (!(await isAdminAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const ipAddress = searchParams.get('ip');

        if (!ipAddress) {
            return NextResponse.json({ error: 'Missing IP address parameter' }, { status: 400 });
        }

        await redisClient.del(`${BLOCKED_IP_PREFIX}${ipAddress}`);
        await redisClient.srem(BLOCKED_IP_INDEX, ipAddress);

        return NextResponse.json({ success: true, message: `IP ${ipAddress} has been unblocked` });
    } catch (error) {
        console.error('[Admin:BlockedIPs:DELETE] Failed to unblock IP:', error);
        return NextResponse.json({ error: 'Failed to unblock IP' }, { status: 500 });
    }
}
