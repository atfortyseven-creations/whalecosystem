import { NextRequest, NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const { message, signature } = await req.json();
        const nonce = req.cookies.get('siwe-nonce')?.value;

        if (!nonce) {
            return NextResponse.json({ ok: false, error: 'No nonce in cookies' }, { status: 400 });
        }

        const siweMessage = new SiweMessage(message);
        const { data: fields } = await siweMessage.verify({ signature, nonce });

        if (fields.nonce !== nonce) {
             return NextResponse.json({ ok: false, error: 'Invalid nonce' }, { status: 400 });
        }

        // Upsert User in Database
        let user = await prisma.user.findUnique({
             where: { walletAddress: fields.address }
        });

        if (!user) {
             user = await prisma.user.create({
                 data: { walletAddress: fields.address }
             });
        }

        const res = NextResponse.json({ ok: true, address: fields.address });
        
        // We set a custom session cookie for Wagmi/Rainbowkit
        // In a true NextAuth integration, this would call signIn('credentials') 
        // to mint a JWT, but since the frontend uses generic RainbowKit SIWE:
        res.cookies.set('human.session-token', crypto.randomUUID(), {
             httpOnly: true,
             secure: process.env.NODE_ENV === 'production',
             sameSite: 'strict',
             path: '/'
        });
        
        // Mark user as logged in via wallet
        res.cookies.set('wallet-auth', fields.address, {
             httpOnly: false, // Accessible to frontend to know who is logged in without SWR
             secure: process.env.NODE_ENV === 'production',
             path: '/'
        });

        return res;
    } catch (e) {
        console.error("SIWE Verify Error:", e);
        return NextResponse.json({ ok: false, error: 'Verification failed' }, { status: 400 });
    }
}
