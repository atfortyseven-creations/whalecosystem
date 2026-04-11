import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cashier } from '@/lib/wallet/deposit-watcher';
import { verifyMessage } from 'viem';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json().catch(() => ({}));
    const { walletAddress, signature, message } = body;

    // ─── INSTITUTIONAL AUTHENTICATION RESOLUTION ─────────────────────────────
    const hasHandshakeCookie = req.cookies.get('sovereign_handshake')?.value;
    
    if (signature && message && walletAddress) {
      try {
        const isValid = await verifyMessage({
            address: walletAddress as `0x${string}`,
            message: message,
            signature: signature as `0x${string}`
        });

        if (!isValid) {
            console.error(`[Security:Handshake] Verification FAILED for ${walletAddress}`);
            return NextResponse.json({ error: 'Identity verification failed: Signature mismatch.' }, { status: 401 });
        }
        
        console.log(`[Security:Handshake] Identity verified via ECDSA for ${walletAddress}`);
      } catch (e: any) {
        console.error(`[Security:Handshake:Error]`, e.message);
        return NextResponse.json({ error: 'Indentity verification error: Invalid payload.' }, { status: 400 });
      }
    } else if (!session?.user?.email && !hasHandshakeCookie) {
      // If no signature/message AND no session AND no handshake cookie, we reject.
      return NextResponse.json({ error: 'Unauthorized: Cryptographic Handshake required.' }, { status: 401 });
    }

    let userId = walletAddress || hasHandshakeCookie || session?.user?.email;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized: No identity resolved.' }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: No wallet or session found' }, { status: 401 });
    }

    // Ensure User exists in DB for foreign key constraints
    const existingUser = await prisma.user.findUnique({ where: { walletAddress: userId } });
    if (!existingUser) {
        await prisma.user.create({
            data: {
                walletAddress: userId,
                tier: 'INITIATE',
                lastActive: new Date()
            }
        });
    } else {
        await prisma.user.update({
            where: { walletAddress: userId },
            data: { lastActive: new Date() }
        });
    }

    // Trigger Sync (Only if it's a valid address)
    let result = null;
    if (userId.startsWith('0x')) {
        result = await cashier.syncUserBalance(userId, userId);
    }

    return NextResponse.json({
        success: true,
        ...(result || {})
    });

  } catch (error: any) {
    console.error('Wallet Sync Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

