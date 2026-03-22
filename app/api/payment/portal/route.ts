import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Return URL for Stripe customer portal (self-service billing)
export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  const dbUser = await prisma.user.findFirst({ where: { clerkId: userId } });
  if (!dbUser?.stripeCustomerId) {
    return NextResponse.json({ error: 'No billing profile found' }, { status: 404 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: dbUser.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/developers`,
  });

  return NextResponse.json({ url: session.url });
}

