import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

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
        const { topicId, postId } = body;

        if (!topicId && !postId) {
            return NextResponse.json({ error: 'Must provide topicId or postId' }, { status: 400 });
        }

        // Toggle logic: Check if like exists
        const existingLike = await (prisma as any).forumLike.findFirst({
            where: {
                userId: user.id,
                ...(topicId ? { topicId } : {}),
                ...(postId ? { postId } : {})
            }
        });

        if (existingLike) {
            // Unlike
            await (prisma as any).forumLike.delete({ where: { id: existingLike.id } });
            return NextResponse.json({ success: true, action: 'unliked' });
        } else {
            // Like
            await (prisma as any).forumLike.create({
                data: {
                    userId: user.id,
                    topicId: topicId || null,
                    postId: postId || null
                }
            });

            // Create Telemetry Event
            try {
                await (prisma as any).forumTelemetry.create({
                    data: {
                        userId: user.id,
                        action: 'CLICK_LIKE',
                        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
                        metadata: { topicId, postId }
                    }
                });

                // Fetch owner to notify
                let targetUserId = null;
                if (postId) {
                    const p = await (prisma as any).forumPost.findUnique({ where: { id: postId }, select: { authorId: true } });
                    if (p) targetUserId = p.authorId;
                } else if (topicId) {
                    const t = await (prisma as any).forumTopic.findUnique({ where: { id: topicId }, select: { authorId: true } });
                    if (t) targetUserId = t.authorId;
                }

                // Create notification if liked someone else's post/topic
                if (targetUserId && targetUserId !== user.id) {
                    await (prisma as any).forumNotification.create({
                        data: {
                            userId: targetUserId,
                            type: 'LIKE',
                            actorId: user.id,
                            topicId: topicId || null,
                            postId: postId || null
                        }
                    });
                }
            } catch (e) {
                console.warn("Telemetry/Notification for like failed:", e);
            }
            return NextResponse.json({ success: true, action: 'liked' });
        }
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
