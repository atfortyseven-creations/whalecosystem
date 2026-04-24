import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const address = cookieStore.get('sovereign_handshake')?.value;
        if (!address) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await prisma.user.findUnique({ where: { walletAddress: address } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const body = await req.json();
        const { content, topicId, replyToId } = body;

        if (!content || !topicId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newPost = await (prisma as any).forumPost.create({
            data: {
                content,
                topicId,
                authorId: user.id,
                replyToId: replyToId || undefined
            },
            include: {
                author: { select: { walletAddress: true, tier: true, isPro: true } }
            }
        });

        // Add to audit log
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'FORUM_POST_CREATED',
                resource: 'ForumPost',
                metadata: { postId: newPost.id, topicId },
                ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
            }
        });

        // Update topic updated at
        await (prisma as any).forumTopic.update({
            where: { id: topicId },
            data: { updatedAt: new Date() }
        });

        return NextResponse.json(newPost);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
