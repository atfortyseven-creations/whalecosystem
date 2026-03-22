import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { prisma } from '@/lib/prisma';
import { PlanTier } from '@prisma/client';
import { headers } from 'next/headers';

/**
 * Stripe Webhook Handler (The "Switchboard")
 * Strictly handles the confirmation of Elite payments and triggers database updates.
 */
export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature') as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || ''
        );
    } catch (err: any) {
        console.error(`[WEBHOOK_ERROR] Signature verification failed: ${err.message}`);
        return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
    }

    // Handle high-priority payment events
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object as any;
            const userId = session.metadata?.userId;
            const tier = session.metadata?.tier as PlanTier;

            if (userId && tier) {
                console.log(`[PAYMENT_SUCCESS] Activating ${tier} for User Identity: ${userId}`);
                
                // Find the actual user primary key (walletAddress) if userId is a Clerk ID
                const userRecord = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { walletAddress: userId },
                            { clerkId: userId }
                        ]
                    }
                });

                const finalUserId = userRecord?.walletAddress || userId;

                // Atomically update subscription status in database
                await prisma.subscription.upsert({
                    where: { userId: finalUserId },
                    update: {
                        tier: tier,
                        status: 'ACTIVE',
                        updatedAt: new Date()
                    },
                    create: {
                        userId: finalUserId,
                        tier: tier,
                        status: 'ACTIVE'
                    }
                });
            }
            break;

        case 'customer.subscription.deleted':
            const subscription = event.data.object as any;
            const subUserId = subscription.metadata?.userId;

            if (subUserId) {
                console.log(`[SUBSCRIPTION_CANCELLED] Revoking access for User: ${subUserId}`);
                await prisma.subscription.update({
                    where: { userId: subUserId },
                    data: { tier: 'FREE', status: 'CANCELLED' }
                });
            }
            break;

        default:
            console.log(`[WEBHOOK_INFO] Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}

// Ensure the body is not parsed as JSON by Next.js automatically
export const config = {
    api: {
        bodyParser: false,
    },
};

