import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

const PLAN_PRICE_IDS: Record<string, string> = {
  standard:      process.env.STRIPE_STANDARD_PRICE_ID || process.env.STRIPE_PRICE_STANDARD || 'price_standard_default',
  starter:       process.env.STRIPE_STARTER_PRICE_ID  || process.env.STRIPE_PRICE_STARTER  || 'price_starter_default',
  pro:           process.env.STRIPE_PRO_PRICE_ID      || process.env.STRIPE_PRICE_PRO      || 'price_pro_default',
  Elite:         process.env.STRIPE_ELITE_PRICE_ID    || process.env.STRIPE_PRICE_ELITE    || 'price_Elite_default',
};

const PLAN_NAMES: Record<string, string> = {
  standard: 'Whale Alert Corp — Standard API',
  starter:  'Whale Alert Corp — Starter API',
  pro:      'Whale Alert Corp — Pro API',
  Elite:    'Whale Alert Corp — Elite API',
};

export async function POST(req: NextRequest) {
  try {
    // ─── Auth: SIWE sovereign session ─────────────────────────────────────
    const siweSession = await getSession();
    const userId = siweSession?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { planId, userEmail, returnUrl } = body;

    if (!planId || !PLAN_PRICE_IDS[planId]) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
    }

    // ─── Security: capture device fingerprint ────────────────────────────
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim()
               || headersList.get('x-real-ip')
               || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';
    const country = headersList.get('cf-ipcountry') || headersList.get('x-vercel-ip-country') || 'unknown';

    // Detect VPN / datacenter IPs (basic heuristic)
    const isSuspiciousIP = ip.startsWith('10.') || ip.startsWith('172.') || ip.startsWith('192.168.');

    // ─── Find or create Stripe customer ──────────────────────────────────
    // SIWE-native: look up by walletAddress (sovereign ID)
    const dbUser = await prisma.user.findUnique({ where: { walletAddress: userId } }) as any;

    let customerId: string;

    if (dbUser?.stripeCustomerId) {
      customerId = dbUser.stripeCustomerId;
    } else {
      // Create Stripe customer with full metadata for fraud evidence
      const customer = await stripe.customers.create({
        email: userEmail || `${userId.slice(0, 8)}@whalealert.corp`,
        metadata: {
          sovereign_user_id: userId,
          plan_id: planId,
          purchase_ip: ip,
          purchase_country: country,
          purchase_user_agent: userAgent.slice(0, 500),
          purchase_timestamp: new Date().toISOString(),
          suspicious_ip: isSuspiciousIP ? 'true' : 'false',
          platform: 'Whale Alert Corporation API',
        },
      });
      customerId = customer.id;

      // Store Stripe customer ID back on the user record
      if (dbUser) {
        await prisma.user.update({
          where: { walletAddress: userId },
          data: { stripeCustomerId: customerId } as any,
        });
      }
    }

    // ─── Check for existing active subscription ───────────────────────────
    // NOTE: The schema model is `subscription` (not `apiSubscription`)
    const existingSub = await (prisma as any).subscription.findFirst({
      where: { userId: dbUser?.walletAddress || userId, status: 'ACTIVE' },
    });

    if (existingSub) {
      return NextResponse.json({
        error: `Ya tienes una suscripción activa al plan ${existingSub.tier}. Gestiona tu plan desde el portal de cliente.`
      }, { status: 409 });
    }

    // ─── Create Stripe Checkout Session with maximum security ─────────────
    const priceId = PLAN_PRICE_IDS[planId];

    // Safety check: Don't call Stripe with placeholder keys
    if (!priceId || priceId.includes('placeholder') || priceId.includes('default')) {
      console.error(`[WAC] Missing Stripe Price ID for plan: ${planId}`);
      return NextResponse.json({
        error: `Configuración de pagos incompleta para el plan '${planId.toUpperCase()}'. Configura STRIPE_${planId.toUpperCase()}_PRICE_ID. (Actual: ${priceId})`
      }, { status: 400 });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata: {
          plan_id: planId,
          sovereign_user_id: userId,
          purchase_ip: ip,
          purchase_country: country,
          purchase_timestamp: new Date().toISOString(),
        },
        description: PLAN_NAMES[planId],
      },
      payment_method_options: {
        card: { request_three_d_secure: 'automatic' },
      },
      customer_update: { address: 'auto', name: 'auto' },
      billing_address_collection: 'required',
      consent_collection: { terms_of_service: 'required' },
      custom_text: {
        terms_of_service_acceptance: {
          message: '⚠️ Al proceder, aceptas que NO hay reembolsos. La API key se activa inmediatamente. En caso de disputa, suspendemos el servicio y enviamos evidencia de uso a Stripe.',
        },
        submit: { message: 'Tu acceso premium se activará en segundos tras el pago.' },
      },
      success_url: returnUrl 
         ? `${process.env.NEXT_PUBLIC_APP_URL}${returnUrl}/success?session_id={CHECKOUT_SESSION_ID}` 
         : `${process.env.NEXT_PUBLIC_APP_URL}/api-marketplace/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  returnUrl 
         ? `${process.env.NEXT_PUBLIC_APP_URL}${returnUrl}?canceled=true`
         : `${process.env.NEXT_PUBLIC_APP_URL}/api-marketplace?canceled=true`,
      metadata: {
        plan_id: planId,
        sovereign_user_id: userId,
        purchase_ip: ip,
        purchase_country: country,
        purchase_user_agent: userAgent.slice(0, 500),
        purchase_timestamp: new Date().toISOString(),
      },
      expires_at: Math.floor(Date.now() / 1000) + 1800, // 30 min expiry
    });

    // ─── Log purchase intent for chargeback evidence ──────────────────────
    // Uses `(prisma as any)` because ApiPurchaseIntent is a new model added to
    // schema.prisma that requires `prisma generate` to be reflected in the client.
    await (prisma as any).apiPurchaseIntent.create({
      data: {
        userId,
        planId,
        stripeSessionId: checkoutSession.id,
        ip,
        country,
        userAgent: userAgent.slice(0, 500),
        isSuspiciousIp: isSuspiciousIP,
        createdAt: new Date(),
      },
    }).catch(() => {}); // Non-blocking — evidence log, not critical path

    return NextResponse.json({ url: checkoutSession.url });

  } catch (error: any) {
    console.error('[WAC] Create subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno al crear la sesión de pago.' },
      { status: 500 }
    );
  }
}
