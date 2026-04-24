import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const address = cookieStore.get('sovereign_handshake')?.value;
        if (!address) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await prisma.user.findUnique({ where: { walletAddress: address } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const notifications = await (prisma as any).forumNotification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                actor: { select: { walletAddress: true, isPro: true } }
            }
        });

        // Mark them all as read after fetching
        if (notifications.some((n: any) => !n.isRead)) {
            await (prisma as any).forumNotification.updateMany({
                where: { userId: user.id, isRead: false },
                data: { isRead: true }
            });
        }

        return NextResponse.json(notifications);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
