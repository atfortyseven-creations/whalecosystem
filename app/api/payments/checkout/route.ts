import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRICE_IDS } from '@/lib/payments/stripe';
import { prisma } from '@/lib/prisma';
import { PlanTier } from '@prisma/client';

/**
 * Elite Checkout Tunnel
 * Generates a secure Stripe Checkout Session with tier metadata.
 */
export async function POST(req: NextRequest) {
    try {
        const { tier, userId, isAnnual } = await req.json();

        if (!tier || !userId || !PRICE_IDS[tier]) {
            return NextResponse.json({ error: 'Invalid plan tier or missing user context' }, { status: 400 });
        }

        // 1. Fetch user to ensure they exist (Security check)
        // Robust lookup: check walletAddress OR clerkId
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { walletAddress: userId },
                    { clerkId: userId }
                ]
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Create Stripe Checkout Session
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
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/product/pricing`,
            customer_email: user.email || undefined,
            metadata: {
                userId: userId,
                tier: tier,
                env: process.env.NODE_ENV
            },
            subscription_data: {
                metadata: {
                    userId: userId,
                    tier: tier
                }
            }
        });

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error('[STRIPE_CHECKOUT_ERROR]', error);
        return NextResponse.json({ error: 'Failed to initialize payment tunnel' }, { status: 500 });
    }
}

