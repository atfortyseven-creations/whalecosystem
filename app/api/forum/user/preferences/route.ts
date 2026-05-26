import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// Assuming you have an auth utility
// import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // const session = await getSession(req);
    // if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // const walletAddress = session.walletAddress;

    // FOR MOCK DEVELOPMENT (Using the first user for testing since auth is bypassed here)
    const mockUser = await prisma.user.findFirst();
    if (!mockUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      theme: mockUser.theme,
      language: mockUser.language,
      notifyOnReply: mockUser.notifyOnReply,
      notifyOnMention: mockUser.notifyOnMention,
      bio: mockUser.bio,
      displayName: mockUser.displayName
    });
  } catch (error) {
    console.error('[Forum Preferences GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    // const session = await getSession(req);
    // if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const body = await req.json();

    const mockUser = await prisma.user.findFirst();
    if (!mockUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const updatedUser = await prisma.user.update({
      where: { id: mockUser.id },
      data: {
        ...(body.theme && { theme: body.theme }),
        ...(body.language && { language: body.language }),
        ...(body.notifyOnReply !== undefined && { notifyOnReply: body.notifyOnReply }),
        ...(body.notifyOnMention !== undefined && { notifyOnMention: body.notifyOnMention }),
        ...(body.bio !== undefined && { bio: body.bio }),
        ...(body.displayName !== undefined && { displayName: body.displayName })
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('[Forum Preferences PUT]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
