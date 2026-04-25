import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const address = cookieStore.get('sovereign_handshake')?.value;
        if (!address) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await prisma.user.findUnique({ 
            where: { walletAddress: address },
            select: { id: true }
        });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const notifications = await (prisma as any).forumNotification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                actor: { select: { walletAddress: true, displayName: true, avatarUrl: true } },
            }
        });

        const unreadCount = await (prisma as any).forumNotification.count({
            where: { userId: user.id, isRead: false }
        });

        return NextResponse.json({ notifications, unreadCount });
    } catch (e: any) {
        console.warn("[Notifications GET Error]:", e.message);
        return NextResponse.json({ notifications: [], unreadCount: 0, warning: 'Schema mismatch' });
    }
}

export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies();
        const address = cookieStore.get('sovereign_handshake')?.value;
        if (!address) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await prisma.user.findUnique({ 
            where: { walletAddress: address },
            select: { id: true }
        });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        await (prisma as any).forumNotification.updateMany({
            where: { userId: user.id, isRead: false },
            data: { isRead: true }
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.warn("[Notifications PUT Error]:", e.message);
        return NextResponse.json({ success: false, error: e.message });
    }
}
