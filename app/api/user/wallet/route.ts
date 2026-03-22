import { NextResponse, NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * [LEGENDARY HARDENING]
 * Schema for wallet synchronization request body.
 */
const WalletSyncSchema = z.object({
    address: z.string()
        .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
        .transform(val => val.toLowerCase()),
});

/**
 * GET: Retrieve the synchronized wallet address for the authenticated user.
 * [HARDENED] Robust presence checking and strictly isolated data access.
 */
export async function GET(req: NextRequest) {
    const logger = `[GET /api/user/wallet]`;
    try {
        const { userId: clerkId } = getAuth(req);
        
        if (!clerkId) {
            console.warn(`${logger} Unauthenticated access attempt.`);
            return NextResponse.json({ error: 'Auth session expired' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId },
            select: { 
                walletAddress: true, 
                tier: true,
                lastActive: true 
            }
        });

        if (!user) {
            return NextResponse.json({ 
                address: null,
                tier: 'GHOST',
                status: 'NEW_USER'
            }, { status: 200 });
        }

        return NextResponse.json({ 
            address: user.walletAddress,
            tier: user.tier,
            lastActive: user.lastActive
        });

    } catch (error: any) {
        console.error(`${logger} Database failure:`, error.message);
        return NextResponse.json({ 
            error: 'Service temporarily unavailable',
            fallback: true
        }, { status: 503 });
    }
}

/**
 * expert-level Wallet Synchronization API
 * [SENIOR BACKEND LEGENDARIO 2]
 * Implements atomic persistence, schema validation, and strict normalization.
 */
export async function POST(req: NextRequest) {
    const logger = `[POST /api/user/wallet]`;
    try {
        const { userId: clerkId } = getAuth(req);
        
        if (!clerkId) {
            return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 });
        }

        // Validate payload using Zod
        const body = await req.json();
        const validation = WalletSyncSchema.safeParse(body);

        if (!validation.success) {
            console.warn(`${logger} Invalid payload:`, validation.error.format());
            return NextResponse.json({ 
                error: 'Invalid wallet address', 
                issues: validation.error.flatten() 
            }, { status: 400 });
        }

        const { address: normalizedAddress } = validation.data;

        // Atomic Upsert Operation with fallback if clerkId or walletAddress collision occurs
        let user;
        try {
            user = await prisma.user.upsert({
                where: { walletAddress: normalizedAddress },
                update: { 
                    clerkId, 
                    lastActive: new Date(),
                },
                create: {
                    clerkId,
                    walletAddress: normalizedAddress,
                    createdAt: new Date(),
                    lastActive: new Date(),
                    tier: 'GHOST',
                }
            });
        } catch (upsertError: any) {
            console.warn(`${logger} Upsert collision for ${normalizedAddress}, attempting direct update.`);
            // If the wallet exists but clerkId is different, or vice versa, handle gracefully
            user = await prisma.user.update({
                where: { walletAddress: normalizedAddress },
                data: { clerkId, lastActive: new Date() }
            }).catch(async () => {
                // Last ditch: Find by clerkId and update wallet
                return await prisma.user.update({
                    where: { clerkId },
                    data: { walletAddress: normalizedAddress, lastActive: new Date() }
                });
            });
        }

        if (!user) {
            throw new Error("Persistencia fallida tras 2 intentos.");
        }

        console.info(`${logger} Synced wallet ${normalizedAddress} to clerk_id:${clerkId}`);

        return NextResponse.json({ 
            success: true, 
            message: 'Vault synchronized',
            data: {
                wallet: user.walletAddress,
                tier: user.tier,
                syncTimestamp: new Date().toISOString()
            }
        });

    } catch (error: any) {
        console.error(`${logger} Critical failure:`, error);
        
        // Handle specific DB errors if needed (Prisma 2002 for P2002 Unique constraint etc)
        return NextResponse.json({ 
            error: 'Internal synchronization failure', 
            code: 'SYNC_ERROR'
        }, { status: 500 });
    }
}

