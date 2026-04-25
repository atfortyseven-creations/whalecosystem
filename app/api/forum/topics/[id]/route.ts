import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const cookieStore = await cookies();
        const address = cookieStore.get('sovereign_handshake')?.value;
        if (!address) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const topicId = params.id;

        // Increment views
        await (prisma as any).forumTopic.update({
            where: { id: topicId },
            data: { views: { increment: 1 } }
        });

        const topic = await (prisma as any).forumTopic.findUnique({
            where: { id: topicId },
            include: {
                author: { select: { walletAddress: true, tier: true, isPro: true, displayName: true, avatarUrl: true } },
                category: { select: { name: true, color: true, slug: true } },
                tags: true,
                posts: {
                    where: { status: 'PUBLISHED' },
                    orderBy: { createdAt: 'asc' },
                    include: {
                        author: { select: { walletAddress: true, tier: true, isPro: true, displayName: true, avatarUrl: true } },
                        likes: { select: { userId: true } }
                    }
                },
                likes: { select: { userId: true } }
            }
        });

        if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });

        return NextResponse.json(topic);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
