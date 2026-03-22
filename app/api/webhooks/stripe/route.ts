import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/payments/stripe';
import { clerkClient } from '@clerk/nextjs/server';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[WEBHOOK ERROR]', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const clerkUserId = session.metadata?.clerkUserId;
  const customerId = session.customer as string;
  const isLifetimeVip = session.metadata?.paymentType === 'lifetime_vip';

  if (!clerkUserId) {
    console.error('[WEBHOOK] No Clerk user ID in session metadata');
    return;
  }

  try {
    const client = await clerkClient();
    
    // 1. Update Clerk Metadata
    await client.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        stripeCustomerId: customerId,
        subscriptionStatus: 'active',
        isVip: true,
        paymentType: isLifetimeVip ? 'lifetime_vip' : 'subscription',
      },
    });

    // 2. Update Prisma Database (Isolated by clerkId)
    try {
      const { prisma } = await import('@/lib/prisma');
      
      // SECURE: Sync by clerkId to prevent wallet address spoofing or leakage
      await prisma.user.upsert({
        where: { clerkId: clerkUserId }, 
        update: {
          tier: 'SOVEREIGN', // VIP Tier
          lastActive: new Date(),
        },
        create: {
          clerkId: clerkUserId,
          walletAddress: `human-${clerkUserId.slice(-8)}`, // Placeholder until wallet is connected
          tier: 'SOVEREIGN',
          lastActive: new Date(),
        },
      });

      // Handle Subscription record - link to the walletAddress which is the User ID in this schema
      const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
      if (user) {
        await prisma.subscription.create({
          data: {
            userId: user.walletAddress,
            status: 'ACTIVE',
            tier: 'LIFETIME_VIP',
            expiresAt: new Date('2099-12-31'), // Practically forever
          },
        });
      }
      
      console.log(`[WEBHOOK] 🗄️ Database updated for user ${clerkUserId}`);
    } catch (dbError) {
      console.warn('[WEBHOOK] Database update failed:', dbError);
    }

    console.log(`[WEBHOOK] ✅ LEGENDARY: Updated Clerk user ${clerkUserId} to VIP status`);
  } catch (error) {
    console.error('[WEBHOOK] Failed to update Clerk user metadata:', error);
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    // Get customer to find clerkUserId
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return;

    const clerkUserId = customer.metadata.clerkUserId;
    if (!clerkUserId) {
       console.error(`[WEBHOOK] No clerkUserId found in metadata for customer ${customerId}`);
       return;
    }

    const client = await clerkClient();
    await client.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        stripeCustomerId: customerId,
        subscriptionStatus: subscription.status,
        subscriptionId: subscription.id,
        currentPeriodEnd: (subscription as any).current_period_end,
        cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
      },
    });

    console.log(`[WEBHOOK] ✅ Updated subscription for user ${clerkUserId}: ${subscription.status}`);
  } catch (error) {
    console.error('[WEBHOOK] Failed to update subscription:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return;

    const clerkUserId = customer.metadata.clerkUserId;
    if (!clerkUserId) return;

    const client = await clerkClient();
    await client.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        subscriptionStatus: 'canceled',
        subscriptionId: null,
      },
    });

    console.log(`[WEBHOOK] ✅ Canceled subscription for user ${clerkUserId}`);
  } catch (error) {
    console.error('[WEBHOOK] Failed to cancel subscription:', error);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`[WEBHOOK] ✅ Payment succeeded for invoice ${invoice.id}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`[WEBHOOK] ❌ Payment failed for invoice ${invoice.id}`);
}

