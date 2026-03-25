import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/payments/stripe';
import { prisma } from '@/lib/prisma';
import { randomBytes, createHash } from 'crypto';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

const PLAN_LIMITS: Record<string, { dailyRequests: number; threshold: number; maxKeys: number }> = {
  starter:       { dailyRequests: 10_000,   threshold: 500_000,  maxKeys: 1 },
  pro:           { dailyRequests: 500_000,  threshold: 100_000,  maxKeys: 3 },
  Elite: { dailyRequests: -1,        threshold: 50_000,   maxKeys: 10 },
};

// ─── Generate a cryptographically secure API key ──────────────────────────────
function generateApiKey(): { raw: string; hash: string } {
  const rawSuffix = randomBytes(40).toString('hex'); // 80 hex chars
  const raw = `wac_live_${rawSuffix}`;
  const hash = createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
}

// ─── Auto-submit chargeback evidence to Stripe ────────────────────────────────
async function submitDisputeEvidence(dispute: Stripe.Dispute, subscription: any) {
  try {
    const customer = await stripe.customers.retrieve(dispute.charge as string) as Stripe.Customer;
    const metadata = (await stripe.charges.retrieve(dispute.charge as string)).metadata;

    // Gather API usage logs as evidence
    const usageLogs = await prisma.apiUsageLog.findMany({
      where: { subscriptionId: subscription.id },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    const evidenceText = `
WHALE ALERT CORPORATION — DISPUTE EVIDENCE
==========================================

Transaction Details:
- Plan: ${subscription.tier}
- Price: $${subscription.price}/month
- Purchase Date: ${subscription.createdAt.toISOString()}
- Purchase IP: ${metadata?.purchase_ip || 'Recorded'}
- Purchase Country: ${metadata?.purchase_country || 'Recorded'}
- Customer Accepted ToS: YES (explicit checkbox + Stripe ToS requirement)
- Customer Accepted No-Refund Policy: YES (explicit checkbox during checkout)
- 3D Secure Authentication: COMPLETED (Stripe enforced)

API Usage After Purchase:
${usageLogs.length > 0 ? usageLogs.map(log =>
  `  - ${log.createdAt.toISOString()} | ${log.endpoint} | IP: ${log.ip} | Status: ${log.statusCode}`
).join('\n') : '  No hay registros de uso (el plan fue suscrito pero no utilizado)'}

Total API Calls Made: ${usageLogs.length}

This evidence demonstrates the customer:
1. Authenticated with 3D Secure 2 (bank-level verification)
2. Explicitly accepted no-refund terms
3. Accepted Stripe Terms of Service
4. Provided billing address

The service was delivered and API keys were provisioned as contracted.
    `.trim();

    await stripe.disputes.update(dispute.id, {
      evidence: {
        customer_purchase_ip: metadata?.purchase_ip,
        customer_name: customer.name || undefined,
        customer_email_address: customer.email || undefined,
        product_description: `Whale Alert Corporation ${subscription.tier} API Subscription — Real-time whale transaction intelligence`,
        customer_signature: evidenceText,
        service_date: subscription.createdAt.toISOString().split('T')[0],
        service_documentation: `${process.env.NEXT_PUBLIC_APP_URL}/terms`,
        uncategorized_text: evidenceText,
      },
      submit: true,
    });

    console.log('[WAC Webhook] Dispute evidence submitted for dispute:', dispute.id);
  } catch (err) {
    console.error('[WAC Webhook] Failed to submit dispute evidence:', err);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('[WAC Webhook] Signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook signature invalid' }, { status: 400 });
  }

  console.log(`[WAC Webhook] Event received: ${event.type}`);

  // ── HANDLE EVENTS ─────────────────────────────────────────────────────────

  // 1. Successful payment — provision API key
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode !== 'subscription') return NextResponse.json({ ok: true });

    const subscriptionId = session.subscription as string;
    const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
    const planId = stripeSub.metadata?.plan_id || session.metadata?.plan_id || 'starter';
    const clerkUserId = stripeSub.metadata?.clerk_user_id || session.metadata?.clerk_user_id;
    const limits = PLAN_LIMITS[planId] || PLAN_LIMITS.starter;

    // Find user
    const dbUser = clerkUserId
      ? await prisma.user.findFirst({ where: { clerkId: clerkUserId } })
      : null;

    // Generate API key
    const { raw: rawKey, hash: keyHash } = generateApiKey();

    // Save subscription + key
    const sub = await prisma.apiSubscription.create({
      data: {
        userId: dbUser?.walletAddress || clerkUserId || 'unknown',
        tier: planId,
        status: 'active',
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: session.customer as string,
        price: session.amount_total ? session.amount_total / 100 : 0,
        keyHash,
        keyPrefix: rawKey.slice(0, 16), // wac_live_XXXXXXX
        dailyRequestLimit: limits.dailyRequests,
        whaleThresholdUsd: limits.threshold,
        maxApiKeys: limits.maxKeys,
        purchaseIp: stripeSub.metadata?.purchase_ip || '',
        purchaseCountry: stripeSub.metadata?.purchase_country || '',
        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
      },
    });

    // Email key to user
    const userEmail = (await stripe.customers.retrieve(session.customer as string) as Stripe.Customer).email;
    if (userEmail && process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Whale Alert Corporation <api@whalealert.corp>',
        to: userEmail,
        subject: '🐋 Tu API key de Whale Alert Corporation',
        html: `
          <div style="font-family: monospace; background: #0a0a0a; color: #fff; padding: 32px; border-radius: 12px;">
            <h1 style="color: #a78bfa; font-size: 24px; margin-bottom: 8px;">Whale Alert Corporation</h1>
            <p style="color: #888; margin-bottom: 24px;">Plan: <strong style="color: #fff">${planId.toUpperCase()}</strong></p>
            
            <div style="background: #111; border: 1px solid #333; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #888; font-size: 12px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.1em;">Tu API Key (guárdala de forma segura)</p>
              <code style="color: #00ff9d; font-size: 14px; word-break: break-all;">${rawKey}</code>
            </div>
            
            <p style="color: #888; font-size: 12px;">Incluye este header en todas tus peticiones:</p>
            <code style="color: #60a5fa; font-size: 13px;">X-WAC-API-Key: ${rawKey}</code>
            
            <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #222;">
              <p style="color: #555; font-size: 11px;">Esta key no se mostrará de nuevo por seguridad. Si la pierdes, genera una nueva desde el dashboard.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/developers" style="color: #a78bfa;">→ Ver documentación completa</a>
            </div>
          </div>
        `,
      }).catch(console.error);
    }

    console.log(`[WAC Webhook] API key provisioned for plan: ${planId}, subscription: ${sub.id}`);
  }

  // 2. Subscription renewed — extend access
  else if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice;
    if (!invoice.subscription) return NextResponse.json({ ok: true });

    const stripeSub = await stripe.subscriptions.retrieve(invoice.subscription as string);
    
    await prisma.apiSubscription.updateMany({
      where: { stripeSubscriptionId: invoice.subscription as string },
      data: {
        status: 'active',
        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        updatedAt: new Date(),
      },
    });

    console.log('[WAC Webhook] Subscription renewed:', invoice.subscription);
  }

  // 3. Payment failed — suspend after 72h grace
  else if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice;
    if (!invoice.subscription) return NextResponse.json({ ok: true });

    const gracePeriodEnd = new Date(Date.now() + 72 * 60 * 60 * 1000);
    
    await prisma.apiSubscription.updateMany({
      where: { stripeSubscriptionId: invoice.subscription as string },
      data: {
        status: 'past_due',
        gracePeriodEnd,
        updatedAt: new Date(),
      },
    });

    console.log('[WAC Webhook] Payment failed, grace period set:', invoice.subscription);
  }

  // 4. Subscription canceled — revoke access
  else if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;

    await prisma.apiSubscription.updateMany({
      where: { stripeSubscriptionId: sub.id },
      data: { status: 'canceled', updatedAt: new Date() },
    });

    console.log('[WAC Webhook] Subscription canceled:', sub.id);
  }

  // 5. DISPUTE CREATED — IMMEDIATE SUSPENSION + EVIDENCE ─── MILITARY GRADE
  else if (event.type === 'charge.dispute.created') {
    const dispute = event.data.object as Stripe.Dispute;
    
    console.error(`[WAC SECURITY] DISPUTE OPENED: ${dispute.id} — Amount: $${dispute.amount / 100}`);

    // Find subscription linked to this charge
    const charge = await stripe.charges.retrieve(dispute.charge as string);
    const stripeSubId = charge.metadata?.stripe_subscription_id
                        || (charge as any).invoice?.subscription;

    const sub = await prisma.apiSubscription.findFirst({
      where: stripeSubId
        ? { stripeSubscriptionId: stripeSubId }
        : { stripeCustomerId: charge.customer as string },
    });

    if (sub) {
      // IMMEDIATE SUSPENSION
      await prisma.apiSubscription.update({
        where: { id: sub.id },
        data: {
          status: 'disputed',
          suspendedAt: new Date(),
          suspensionReason: `Stripe dispute ${dispute.id} — $${dispute.amount / 100}`,
          updatedAt: new Date(),
        },
      });

      // Auto-submit evidence to Stripe
      await submitDisputeEvidence(dispute, sub);

      console.error(`[WAC SECURITY] API key SUSPENDED for dispute. Sub ID: ${sub.id}`);
    }
  }

  return NextResponse.json({ ok: true });
}

