import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const OWNER_EMAILS = [
  'atfortyseven2@gmail.com',
  'josemanx2000@gmail.com'
];

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({
        isPremium: false,
        tier: 'FREE',
        isOwner: false,
      });
    }

    const { clerkClient } = await import('@clerk/nextjs/server');
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const userEmail = user.primaryEmailAddress?.emailAddress;
    
    // 1. Check if user is the owner (unlimited access)
    if (userEmail && OWNER_EMAILS.includes(userEmail)) {
      return NextResponse.json({
        isPremium: true,
        tier: 'OWNER',
        subscriptionId: 'owner_unlimited',
        currentPeriodEnd: 4102444800, // Year 2100
        cancelAtPeriodEnd: false,
        isOwner: true,
      });
    }

    // 2. Check real subscription status from Clerk metadata
    const status = user.publicMetadata.subscriptionStatus as string;
    const isPremium = status === 'active' || status === 'trialing';

    return NextResponse.json({
      isPremium,
      tier: isPremium ? 'PRO' : 'FREE',
      subscriptionId: user.publicMetadata.subscriptionId || null,
      currentPeriodEnd: user.publicMetadata.currentPeriodEnd || null,
      cancelAtPeriodEnd: user.publicMetadata.cancelAtPeriodEnd || false,
      isOwner: false,
    });
  } catch (error) {
    console.error('[API ERROR] Subscription status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

