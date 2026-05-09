import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRICE_IDS } from '@/lib/payments/stripe';
import { prisma } from '@/lib/prisma';
import { validateSecureRequest } from '@/lib/security/premium-security';
import { SAAS_PLANS, PlanTier } from '@/lib/saas/plans';

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
        const tier = (body.tier as string)?.toUpperCase() as PlanTier;
        const isAnnual = body.isAnnual === true;
        const userId = validation.userId;
        const billingCycle = isAnnual ? 'ANNUAL' : 'MONTHLY';

        if (!tier) {
            return NextResponse.json({ error: 'Invalid plan tier' }, { status: 400 });
        }
        if (!PRICE_IDS[billingCycle]?.[tier]) {
            return NextResponse.json({ error: 'Stripe price not configured for this plan. Contact support.' }, { status: 503 });
        }

        const planConfig = SAAS_PLANS[tier];
        if (!planConfig) {
            return NextResponse.json({ error: 'Plan configuration not found' }, { status: 400 });
        }

        // SIWE-native: userId is always a walletAddress
        const user = await prisma.user.upsert({
            where: { walletAddress: userId },
            update: {},
            create: { walletAddress: userId, tier: 'FREE' }
        });

        if (!user) {
            return NextResponse.json({ error: 'Failed to resolve user' }, { status: 404 });
        }

        const priceId = PRICE_IDS[billingCycle][tier];
        if (!priceId) {
            // Stripe price not configured for this tier/cycle combination.
            return NextResponse.json({ error: 'Stripe price ID not configured for this plan. Please contact support.' }, { status: 503 });
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
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api-marketplace/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/product/pricing`,
            // user.email may not exist on the User schema — use optional cast for forward-compatibility
            customer_email: (user as any).email || undefined,
            metadata: {
                userId: userId,
                tier: tier,
                env: process.env.NODE_ENV ?? 'production',
                billingCycle: billingCycle,
                // Trillion Parameters Articulation:
                requestsPerDay: planConfig.limits.requestsPerDay.toString(),
                maxApiKeys: planConfig.limits.maxApiKeys.toString(),
                maxTokens: planConfig.limits.maxTokens.toString(),
                dataWindowHours: planConfig.limits.dataWindowHours.toString(),
                ft_webSockets: planConfig.features.webSockets ? 'yes' : 'no',
                ft_fixProtocol: planConfig.features.fixProtocol ? 'yes' : 'no',
                ft_hmacRequired: planConfig.features.hmacRequired ? 'yes' : 'no',
                ft_ipWhitelist: planConfig.features.ipWhitelist ? 'yes' : 'no',
                ft_darkPool: planConfig.features.darkPoolDetection ? 'yes' : 'no',
                ft_csvExport: planConfig.features.csvExport ? 'yes' : 'no'
            },
            subscription_data: {
                metadata: {
                    sovereign_user_id: userId,
                    tier: tier,
                    billingCycle: billingCycle,
                    maxTokens: planConfig.limits.maxTokens.toString(),
                    requestsPerDay: planConfig.limits.requestsPerDay.toString(),
                    ft_darkPool: planConfig.features.darkPoolDetection ? 'yes' : 'no'
                }
            }
        });

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error('[STRIPE_CHECKOUT_ERROR]', error);
        return NextResponse.json({ error: 'Failed to initialize payment tunnel' }, { status: 500 });
    }
}
