import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { isAdmin } from '@/lib/admin';

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const address = cookieStore.get('sovereign_handshake')?.value;
        if (!isAdmin(address)) return NextResponse.json({ error: 'Unauthorized: Sovereign Admin Only' }, { status: 403 });

        const pendingTopics = await (prisma as any).forumTopic.findMany({
            where: { status: 'PENDING' },
            include: {
                author: { select: { walletAddress: true, displayName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        const pendingPosts = await (prisma as any).forumPost.findMany({
            where: { status: 'PENDING' },
            include: {
                author: { select: { walletAddress: true, displayName: true } },
                topic: { select: { title: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ topics: pendingTopics, posts: pendingPosts });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies();
        const address = cookieStore.get('sovereign_handshake')?.value;
        if (!isAdmin(address)) return NextResponse.json({ error: 'Unauthorized: Sovereign Admin Only' }, { status: 403 });

        const { id, type, status } = await req.json(); // type: 'topic' | 'post', status: 'PUBLISHED' | 'REJECTED'

        if (!['PUBLISHED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        if (type === 'topic') {
            const updated = await (prisma as any).forumTopic.update({
                where: { id },
                data: { status }
            });
            return NextResponse.json(updated);
        } else if (type === 'post') {
            const updated = await (prisma as any).forumPost.update({
                where: { id },
                data: { status }
            });
            // Update topic updatedAt if post is published
            if (status === 'PUBLISHED') {
               await (prisma as any).forumTopic.update({
                   where: { id: updated.topicId },
                   data: { updatedAt: new Date() }
               });
            }
            return NextResponse.json(updated);
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
