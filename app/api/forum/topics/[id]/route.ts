import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: topicId } = await params;

        // Increment views resiliently
        try {
            await (prisma as any).forumTopic.update({
                where: { id: topicId },
                data: { views: { increment: 1 } }
            });
        } catch (e) {
            console.warn('[API] Failed to increment views (likely schema mismatch)', e);
        }

        const topic = await (prisma as any).forumTopic.findUnique({
            where: { id: topicId },
            include: {
                author: { select: { walletAddress: true, tier: true, isPro: true, displayName: true, avatarUrl: true } },
                category: { select: { name: true, color: true, slug: true } },
                tags: true,
                posts: {
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
