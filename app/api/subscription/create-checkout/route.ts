import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { stripe } from '@/lib/payments/stripe';

export async function POST(req: NextRequest) {
  try {
    console.log('[CHECKOUT] Starting checkout session creation');
    const user = await currentUser();
    
    if (!user) {
      console.error('[CHECKOUT] Unauthorized - No user found');
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    console.log(`[CHECKOUT] User authenticated: ${user.id}`);
    const { priceId } = await req.json();

    // Get or create Stripe customer
    let customerId = user.publicMetadata.stripeCustomerId as string | undefined;
    
    if (!customerId) {
      console.log('[CHECKOUT] Creating new Stripe customer');
      const customer = await stripe.customers.create({
        email: user.emailAddresses[0]?.emailAddress,
        metadata: {
          clerkUserId: user.id,
        },
      });
      customerId = customer.id;
      console.log(`[CHECKOUT] Stripe customer created: ${customerId}`);
      
      // Update Clerk user metadata IMMEDIATELY to avoid duplicates
      try {
        const { clerkClient } = await import('@clerk/nextjs/server');
        const client = await clerkClient();
        await client.users.updateUserMetadata(user.id, {
          publicMetadata: {
            stripeCustomerId: customerId,
          },
        });
        console.log('[CHECKOUT] Clerk metadata updated with Stripe customer ID');
      } catch (e) {
        console.warn('[CHECKOUT] Failed to save stripeCustomerId to Clerk, webhook will handle it:', e);
      }
    } else {
      console.log(`[CHECKOUT] Using existing Stripe customer: ${customerId}`);
    }

    // Create checkout session for one-time payment as per UI "1.50 € / cobro único"
    console.log('[CHECKOUT] Creating Stripe checkout session for Lifetime VIP');
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment', // One-time payment
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Whale Alert ID - VIP Lifetime Access',
              description: 'Acceso de por vida a todas las herramientas PRO (Sin suscripciones).',
            },
            unit_amount: 150, // 1.50 EUR in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/vip?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/vip?canceled=true`,
      metadata: {
        clerkUserId: user.id,
        paymentType: 'lifetime_vip',
      },
    });

    console.log(`[CHECKOUT] Session created successfully: ${session.id}`);
    console.log(`[CHECKOUT] Redirect URL: ${session.url}`);
    
    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('[CHECKOUT ERROR] Full error:', error);
    console.error('[CHECKOUT ERROR] Error message:', error?.message);
    console.error('[CHECKOUT ERROR] Error stack:', error?.stack);
    
    return NextResponse.json(
      { error: error?.message || 'Internal server error - Check server logs' },
      { status: 500 }
    );
  }
}

