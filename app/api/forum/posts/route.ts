import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { isAdmin } from '@/lib/admin';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const address = cookieStore.get('sovereign_handshake')?.value;
        if (!address) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // FIX: Explicitly select only 'id' to prevent Prisma crashes due to missing schema columns like 'hiddenAssets' on remote DB
        const user = await prisma.user.findUnique({ 
            where: { walletAddress: address },
            select: { id: true }
        });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const body = await req.json();
        const { content, topicId, replyToId } = body;

        if (!content || !topicId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const isUserAdmin = isAdmin(address);

        const newPost = await (prisma as any).forumPost.create({
            data: {
                content,
                topicId,
                authorId: user.id,
                replyToId: replyToId || undefined,
                status: isUserAdmin ? 'PUBLISHED' : 'PENDING'
            },
            include: {
                author: { select: { walletAddress: true, tier: true, isPro: true, displayName: true, avatarUrl: true } }
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
