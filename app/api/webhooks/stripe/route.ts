import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/payments/stripe';

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
  const walletAddress = session.metadata?.walletAddress;
  const isLifetimeVip = session.metadata?.paymentType === 'lifetime_vip';

  if (!walletAddress) {
    console.error('[WEBHOOK] No valid identity (walletAddress) in session metadata');
    return;
  }

  // 2. Update Prisma Database (Isolated by Address)
  try {
    const { prisma } = await import('@/lib/prisma');
    
    // SECURE: Sync strictly by walletAddress given SIWE architectonic shift.
    if (walletAddress) {
      await prisma.user.upsert({
        where: { walletAddress: walletAddress }, 
        update: {
          tier: 'SOVEREIGN', // VIP Tier
          lastActive: new Date(),
        },
        create: {
          walletAddress: walletAddress,
          tier: 'SOVEREIGN',
          lastActive: new Date(),
        },
      });

      // Handle Subscription record
      await prisma.subscription.create({
        data: {
          userId: walletAddress,
          status: 'ACTIVE',
          tier: 'LIFETIME_VIP',
          expiresAt: new Date('2099-12-31'), // Practically forever
        },
      });
      
      console.log(`[WEBHOOK] 🗄️ Sovereign database updated for strictly authentic wallet ${walletAddress}`);
    }

  } catch (dbError) {
    console.warn('[WEBHOOK] Database update failed:', dbError);
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return;

    const walletAddress = customer.metadata.walletAddress;
    if (!walletAddress) {
       console.error(`[WEBHOOK] No walletAddress found in metadata for customer ${customerId}`);
       return;
    }

    const { prisma } = await import('@/lib/prisma');
    
    // Upsert subscription directly into DB natively
    await prisma.subscription.upsert({
      where: { id: subscription.id },
      update: {
        status: subscription.status.toUpperCase(),
        expiresAt: new Date((subscription as any).current_period_end * 1000)
      },
      create: {
        id: subscription.id,
        userId: walletAddress,
        status: subscription.status.toUpperCase(),
        tier: 'PRO',
        expiresAt: new Date((subscription as any).current_period_end * 1000)
      }
    });

    console.log(`[WEBHOOK] ✅ Updated Sovereign subscription for user ${walletAddress}: ${subscription.status}`);
  } catch (error) {
    console.error('[WEBHOOK] Failed to update subscription:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return;

    const walletAddress = customer.metadata.walletAddress;
    if (!walletAddress) return;

    const { prisma } = await import('@/lib/prisma');
    
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'CANCELED' }
    });

    console.log(`[WEBHOOK] ✅ Canceled Sovereign subscription for user ${walletAddress}`);
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

