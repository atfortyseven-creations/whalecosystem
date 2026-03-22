import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = user.primaryEmailAddress?.emailAddress;
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Sync Clerk user with AuthUser
    let authUser: any = null;
    try {
        authUser = await prisma.authUser.findUnique({
          where: { clerkId: user.id }
        });

        if (!authUser) {
          // Try to find by email (legacy or newly signed up)
          authUser = await prisma.authUser.findUnique({
            where: { email }
          });

          if (authUser) {
            // Link clerkId
            authUser = await prisma.authUser.update({
              where: { id: authUser.id },
              data: { clerkId: user.id }
            });
          } else {
            // Create new AuthUser
            authUser = await prisma.authUser.create({
              data: {
                clerkId: user.id,
                email,
                passwordHash: '', 
                name: `${user.firstName || ''} ${user.lastName || ''} `.trim() || null,
                verified: true,
              }
            });
          }
        }

        return NextResponse.json({
          id: authUser.id,
          email: authUser.email,
          name: authUser.name,
          hasPasskey: (await prisma.authenticator.count({ where: { userId: authUser.id } })) > 0
        });
    } catch (dbError: any) {
        console.warn('[AUTH_ME_SYNC] DB Link Failed, returning basic clerk data.', dbError.message);
        return NextResponse.json({
            id: user.id,
            email,
            name: `${user.firstName || ''} ${user.lastName || ''} `.trim() || null,
            hasPasskey: false, // Fallback
            isFallback: true,
            warning: 'Temporary session. Database unreachable.'
        });
    }
  } catch (error: any) {
    console.error('Fatal auth error:', error);
    return NextResponse.json({ error: 'Auth service down' }, { status: 503 });
  }
}

