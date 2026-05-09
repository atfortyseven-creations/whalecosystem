import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRICE_IDS } from '@/lib/payments/stripe';
import { prisma } from '@/lib/prisma';
import { validateSecureRequest } from '@/lib/security/premium-security';

/**
 * Elite Checkout Tunnel
 * Generates a secure Stripe Checkout Session with tier metadata.
 * SIWE-native: userId is always a wallet address (no Clerk dependency).
 */
export async function POST(req: NextRequest) {
    try {
        const validation = await validateSecureRequest(req);
        if (!validation.valid || !validation.userId) {
            return NextResponse.json({ error: 'Unauthorized: Authentication required to initialize checkout.' }, { status: 401 });
        }

        const body = await req.json();
        const tier = (body.tier as string)?.toUpperCase();
        const isAnnual = body.isAnnual;
        const userId = validation.userId;

        if (!tier || !PRICE_IDS[tier]) {
            return NextResponse.json({ error: 'Invalid plan tier or missing user context' }, { status: 400 });
        }

        // SIWE-native: userId is always a walletAddress
        const user = await prisma.user.findUnique({
            where: { walletAddress: userId }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'sepa_debit'],
            payment_method_options: {
                card: {
                    request_three_d_secure: 'automatic',
                },
            },
            line_items: [
                {
                    price: PRICE_IDS[tier],
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api-marketplace/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/product/pricing`,
            // user.email may not exist on the User schema — use optional cast for forward-compatibility
            customer_email: (user as any).email || undefined,
            metadata: {
                userId:  userId,
                tier:    tier,
                env:     process.env.NODE_ENV ?? 'production',
            },
            subscription_data: {
                metadata: {
                    sovereign_user_id: userId,
                    tier:              tier,
                }
            }
        });

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error('[STRIPE_CHECKOUT_ERROR]', error);
        return NextResponse.json({ error: 'Failed to initialize payment tunnel' }, { status: 500 });
    }
}
