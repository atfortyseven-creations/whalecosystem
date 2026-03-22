import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { ethers } from 'ethers';
import { encrypt, generateSalt, isValidPrivateKey } from '@/lib/wallet/encryption';

/**
 * LEGENDARY WALLET CREATION ENDPOINT
 * Creates a new Ethereum wallet for authenticated users
 * Encrypts and stores private key securely in database
 * 
 * POST /api/wallet/create
 * Returns: { address: string, created: boolean }
 */

export async function POST(req: Request) {
    try {
        // 1. Authenticate user
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const email = user.emailAddresses[0]?.emailAddress;
        if (!email) {
            return NextResponse.json({ error: 'Email not found' }, { status: 400 });
        }

        // 2. Check if user already has a wallet
        const existingUser = await prisma.authUser.findUnique({
            where: { email },
            select: { walletAddress: true, encryptedPrivateKey: true }
        });

        if (existingUser?.walletAddress && existingUser?.encryptedPrivateKey) {
            return NextResponse.json({
                address: existingUser.walletAddress,
                created: false,
                message: 'Wallet already exists'
            });
        }

        // 3. Generate new Ethereum wallet
        const wallet = ethers.Wallet.createRandom();
        const address = wallet.address;
        const privateKey = wallet.privateKey;

        // 4. Validate private key
        if (!isValidPrivateKey(privateKey)) {
            throw new Error('Generated invalid private key');
        }

        // 5. Encrypt private key
        const encryptedPrivateKey = encrypt(privateKey);
        const walletSalt = generateSalt();

        // 6. Optional: Encrypt mnemonic for recovery
        const mnemonic = wallet.mnemonic?.phrase;
        const encryptedMnemonic = mnemonic ? encrypt(mnemonic) : null;

        // 7. Save to database
        await prisma.authUser.upsert({
            where: { email },
            update: {
                walletAddress: address,
                encryptedPrivateKey,
                encryptedMnemonic,
                walletSalt,
                updatedAt: new Date()
            },
            create: {
                email,
                passwordHash: '', // Will be set during signup
                walletAddress: address,
                encryptedPrivateKey,
                encryptedMnemonic,
                walletSalt,
                verified: false
            }
        });

        // 8. Log security event
        await prisma.securityEvent.create({
            data: {
                type: 'WALLET_CREATED',
                userId: email,
                ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
                userAgent: req.headers.get('user-agent') || undefined,
                severity: 'INFO',
                metadata: {
                    address,
                    timestamp: new Date().toISOString()
                }
            }
        });

        console.log(`✅ Wallet created for ${email}: ${address}`);

        return NextResponse.json({
            success: true,
            address,
            created: true,
            message: 'Wallet created successfully'
        });

    } catch (error: any) {
        console.error('❌ Wallet creation error:', error);
        
        // Log error event
        try {
            await prisma.securityEvent.create({
                data: {
                    type: 'WALLET_CREATION_FAILED',
                    userId: 'unknown',
                    ipAddress: 'unknown',
                    severity: 'CRITICAL',
                    metadata: {
                        error: error.message,
                        timestamp: new Date().toISOString()
                    }
                }
            });
        } catch (logError) {
            console.error('Failed to log error event:', logError);
        }

        return NextResponse.json(
            { error: error.message || 'Failed to create wallet' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/wallet/create
 * Check if user has a wallet
 */
export async function GET(req: Request) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const email = user.emailAddresses[0]?.emailAddress;
        if (!email) {
            return NextResponse.json({ error: 'Email not found' }, { status: 400 });
        }

        const authUser = await prisma.authUser.findUnique({
            where: { email },
            select: { walletAddress: true }
        });

        return NextResponse.json({
            hasWallet: !!authUser?.walletAddress,
            address: authUser?.walletAddress || null
        });

    } catch (error: any) {
        console.error('Wallet check error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to check wallet' },
            { status: 500 }
        );
    }
}

