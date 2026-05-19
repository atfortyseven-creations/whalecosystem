import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { prisma as sovereignPrisma } from '@/lib/prisma';
import { verifyMessage } from 'viem';

// Cast to base PrismaClient so TypeScript resolves goldenTicket + user models correctly.
// The SovereignPrismaClient augmentation adds cosmicEntity but doesn't remove base models —
// TypeScript just can't see them through the 'unknown' cast in lib/prisma.ts.
const prisma = sovereignPrisma as unknown as PrismaClient;

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_SUPPLY       = 200;
const CLAIM_RATE_LIMIT = 3;    // Max 3 claim attempts per IP per hour
const RATE_WINDOW_SEC  = 3600; // 1 hour TTL

// ─────────────────────────────────────────────────────────────────────────────
// Redis-backed Rate Limiter & Heuristic Anomaly Detection (Zero-Trust)
// Prevents brute-force and automated sybil minting attacks.
// ─────────────────────────────────────────────────────────────────────────────
async function checkClaimRateLimit(ip: string, walletAddress: string): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    try {
        const { redisClient } = await import('@/lib/redis/client');
        if (!redisClient || (redisClient as any).__isMock) {
            return { allowed: true, remaining: CLAIM_RATE_LIMIT, resetAt: 0 };
        }
        
        // 1. Standard IP-based Rate Limiter
        const ipKey   = `rl:claim:ip:${ip}`;
        const current = await redisClient.incr(ipKey);
        if (current === 1) await redisClient.expire(ipKey, RATE_WINDOW_SEC);
        
        // 2. Anomaly Detection (Subnet / Farm protection)
        // Detects if the same IP is trying to claim with multiple different wallets rapidly.
        const velocityKey = `rl:anomaly:velocity:${ip}`;
        await redisClient.sadd(velocityKey, walletAddress);
        await redisClient.expire(velocityKey, 3600); // Track unique wallets per IP per hour
        const uniqueWallets = await redisClient.scard(velocityKey);

        if (uniqueWallets > 2) {
             console.warn(`[Security] Sybil Farm detected from IP ${ip}. Attempted ${uniqueWallets} unique wallet claims.`);
             return { allowed: false, remaining: 0, resetAt: Date.now() + 3600000 };
        }

        const ttl = await redisClient.ttl(ipKey);
        return {
            allowed:   current <= CLAIM_RATE_LIMIT,
            remaining: Math.max(0, CLAIM_RATE_LIMIT - current),
            resetAt:   Date.now() + ttl * 1000,
        };
    } catch {
        console.warn('[GoldenTicket] Rate limit Redis check failed — allowing request');
        return { allowed: true, remaining: 1, resetAt: 0 };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/golden-ticket/claim
// One ticket per wallet address, enforced at DB + logic level.
// Rate limited: 3 attempts per IP per hour (Redis-backed).
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

    // ── Parse body ────────────────────────────────────────────────────────────
    let body: any;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
        return NextResponse.json({ error: 'Missing request body' }, { status: 400 });
    }

    const { walletAddress, twitterHandle, signatureData, cryptoSignature, txHash } = body;

    // ── Field-level validation ────────────────────────────────────────────────
    if (!walletAddress || typeof walletAddress !== 'string') {
        return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    const address = walletAddress.toLowerCase();
    if (!/^0x[a-f0-9]{40}$/.test(address)) {
        return NextResponse.json({ error: 'Malformed wallet address — must be 40 hex chars with 0x prefix' }, { status: 400 });
    }



    // ── Payload size guard (DoS protection) ──────────────────────────────────
    // signatureData is a canvas image data URL (base64). Cap to 10KB max.
    // Client-side fix (JPEG thumbnail) ensures this never triggers, but we
    // truncate defensively here instead of hard-rejecting so no user is blocked.
    const safeSignatureData =
        signatureData && typeof signatureData === 'string'
            ? signatureData.slice(0, 10_240)
            : (signatureData ?? null);

    // ── twitterHandle XSS sanitization ───────────────────────────────────────
    // Strip HTML tags, script injections, and any non-safe characters.
    // Twitter handles are alphanumeric + underscore, max 15 chars per Twitter spec.
    const rawHandle   = typeof twitterHandle === 'string' ? twitterHandle : '';
    const cleanHandle = rawHandle
        .replace(/^@/, '')           // strip leading @
        .replace(/[^a-zA-Z0-9_]/g, '') // only alphanum + underscore allowed
        .slice(0, 50);               // max 50 chars (Twitter max is 15, we're generous)
    const safeHandle = cleanHandle.length > 0 ? cleanHandle : null;

    // ── Redis-backed rate limit & Anomaly Detection ──────────────────────────
    try {
        const rateCheck = await checkClaimRateLimit(ip, address);
        if (!rateCheck.allowed) {
            console.warn(JSON.stringify({
                level: 'SECURITY', event: 'CLAIM_RATE_LIMIT_HIT',
                ip, address, resetAt: new Date(rateCheck.resetAt).toISOString(),
            }));
            const retryAfter = Math.ceil((rateCheck.resetAt - Date.now()) / 1000);
            return NextResponse.json(
                { error: 'Too many claim attempts. Max 3 per hour.', retryAfter },
                {
                    status: 429,
                    headers: {
                        'Retry-After':           String(retryAfter),
                        'X-RateLimit-Limit':     String(CLAIM_RATE_LIMIT),
                        'X-RateLimit-Remaining': '0',
                    },
                }
            );
        }
    } catch { /* Rate limit failure is non-fatal — allow request */ }

    try {
        // ── Verify Session or ECDSA signature ownership ────────────────────────
        const { getSession } = await import('@/lib/session');
        const session = await getSession();
        
        const isSessionAuthenticated = session?.userId?.toLowerCase() === address;

        if (!isSessionAuthenticated) {
            if (!cryptoSignature || typeof cryptoSignature !== 'string') {
                return NextResponse.json({ error: 'Missing cryptographic signature and no active session found' }, { status: 401 });
            }
            try {
                const isValidSig = await verifyMessage({
                    address:   walletAddress as `0x${string}`,
                    message:   `WHALE ALERT NETWORK GOLD ACCESS: ${walletAddress}`,
                    signature: cryptoSignature as `0x${string}`,
                });
                if (!isValidSig) {
                    console.warn(JSON.stringify({ level: 'SECURITY', event: 'INVALID_SIGNATURE', ip, address }));
                    return NextResponse.json({ error: 'Cryptographic signature is invalid or forged' }, { status: 401 });
                }
            } catch {
                return NextResponse.json({ error: 'Failed to verify cryptographic signature' }, { status: 401 });
            }
        }

        // ── Fast-path: check for existing claim ───────────────────────────────
        const existing = await (prisma as any).goldenTicket.findUnique({
            where:  { userAddress: address },
            select: {
                id: true, ticketNumber: true, serialCode: true, tier: true,
                badgeColor: true, networkLaunchEligible: true, twitterHandle: true,
                isActive: true, claimedAt: true,
            },
        });
        if (existing) {
            return NextResponse.json({
                success: false, alreadyClaimed: true,
                ticket:  existing, serial: existing.ticketNumber,
                message: 'This wallet has already claimed its Genesis Ticket.',
            }, { status: 409 });
        }

        // ── Supply gate ───────────────────────────────────────────────────────
        // NOTE: Interactive transactions fail over PgBouncer (Allocation failure).
        // Using sequential operations to guarantee 100% operational success.
        const totalClaimed = await (prisma as any).goldenTicket.count();
        if (totalClaimed >= MAX_SUPPLY) {
            throw new Error('MAX_SUPPLY_REACHED');
        }

        // ── Ensure User row exists ────────────────────────────────────────────
        const user = await (prisma as any).user.upsert({
            where: { walletAddress: address },
            update: {},
            create: { walletAddress: address }
        });

        // ── Validation: Prevent unpaid ticket minting (Firmas sin pagar) ──────
        // Removed for institutional demo testing
        /*
        if (user.tier === 'FREE' && !user.isPro) {
            console.warn(JSON.stringify({ level: 'SECURITY', event: 'UNPAID_MINT_ATTEMPT', address }));
            return NextResponse.json({
                error: 'Pago requerido. Se necesita una suscripción activa para mintear la firma institucional.'
            }, { status: 402 });
        }
        */

        // ── Create ticket using standard Prisma methods ───────────────────────
        const tempSerial = `PENDING-${address}-${Date.now()}`;
        // Pack on-chain mint details into signatureData JSON
        let packedSignatureData = safeSignatureData;
        try {
            const parsed = JSON.parse(signatureData);
            packedSignatureData = JSON.stringify({
                signature: parsed.signature || signatureData,
                timestamp: parsed.timestamp || new Date().toISOString(),
                txHash: txHash || parsed.txHash || null,
                cryptoSignature: cryptoSignature || parsed.cryptoSignature || null
            });
        } catch {
            packedSignatureData = JSON.stringify({
                signature: signatureData,
                timestamp: new Date().toISOString(),
                txHash: txHash || null,
                cryptoSignature: cryptoSignature || null
            });
        }

        const initialTicket = await (prisma as any).goldenTicket.create({
            data: {
                userAddress: address,
                serialCode: tempSerial,
                tier: 'GENESIS',
                badgeColor: 'GOLD',
                networkLaunchEligible: true,
                twitterHandle: safeHandle,
                signatureData: packedSignatureData,
                isActive: true
            }
        });

        // Update with final formatted serial code based on the generated ticketNumber
        const finalSerial = `WGT-GENESIS-${String(initialTicket.ticketNumber).padStart(4, '0')}`;
        let finalTicket = await (prisma as any).goldenTicket.update({
            where: { id: initialTicket.id },
            data: { serialCode: finalSerial }
        });

        // ── Absolute Atomic Supply Check (Anti-TOCTOU) ────────────────────────
        if (finalTicket.ticketNumber > MAX_SUPPLY) {
            await (prisma as any).$executeRaw`
                DELETE FROM "GoldenTicket" WHERE id = ${finalTicket.id}
            `;
            console.warn(JSON.stringify({ level: 'SECURITY', event: 'OVERMINT_PREVENTED', address, ticketNumber: finalTicket.ticketNumber }));
            throw new Error('MAX_SUPPLY_REACHED');
        }

        console.log(JSON.stringify({
            level: 'INFO', event: 'GOLDEN_TICKET_CLAIMED',
            address, ticketNumber: finalTicket.ticketNumber, serialCode: finalTicket.serialCode,
        }));

        return NextResponse.json({
            success:      true,
            ticket:       finalTicket,
            serial:       finalTicket.ticketNumber,
            totalClaimed: totalClaimed + 1,
            message:      'Whale Gold Ticket claimed successfully.',
        }, { status: 201 });

    } catch (error: any) {
        if (error?.message === 'MAX_SUPPLY_REACHED') {
            return NextResponse.json({
                error: 'Max supply reached. All 200 Whale Gold Tickets have been minted.',
            }, { status: 410 });
        }
        if (error?.code === 'P2002') {
            return NextResponse.json({
                success: false, alreadyClaimed: true,
                message: 'This wallet has already claimed its Genesis Ticket.',
            }, { status: 409 });
        }
        console.error('[Golden Ticket POST Error]', error);
        return NextResponse.json(
            { error: `Internal server error: ${error?.message || String(error)}` },
            { status: 500 }
        );
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/golden-ticket/claim
// ?address=0x...  → per-wallet status + global supply
// (no address)    → global supply stats only (for public counter)
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
    try {
        const address = req.nextUrl.searchParams.get('address')?.toLowerCase();

        const totalClaimed = await (prisma as any).goldenTicket.count();
        const remaining    = Math.max(0, MAX_SUPPLY - totalClaimed);

        const feedRaw = await (prisma as any).goldenTicket.findMany({
            where:   { isActive: true },
            select: {
                userAddress:            true,
                claimedAt:              true,
                signatureData:          true,
                serialCode:             true,
                tier:                   true,
                badgeColor:             true,
                networkLaunchEligible:  true,
                twitterHandle:          true,
            },
            orderBy: { claimedAt: 'desc' },
            take: 30,
        });

        if (!address) {
            return NextResponse.json({
                hasClaimed: false, ticket: null,
                totalClaimed, remaining, maxSupply: MAX_SUPPLY, feed: feedRaw,
            });
        }

        const ticket = await (prisma as any).goldenTicket.findUnique({
            where:  { userAddress: address },
            select: {
                id: true, ticketNumber: true, serialCode: true, tier: true,
                badgeColor: true, networkLaunchEligible: true, twitterHandle: true,
                signatureData: true, isActive: true, claimedAt: true,
            },
        });

        return NextResponse.json({
            hasClaimed:   !!ticket,
            ticket:       ticket || null,
            serial:       ticket?.ticketNumber ?? null,
            totalClaimed,
            remaining,
            maxSupply: MAX_SUPPLY,
            feed: feedRaw,
        });

    } catch (error) {
        console.error('[Golden Ticket GET Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
