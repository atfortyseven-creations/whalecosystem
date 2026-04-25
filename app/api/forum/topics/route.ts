import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const address = cookieStore.get('sovereign_handshake')?.value;
        if (!address) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const url = new URL(req.url);
        const categoryId = url.searchParams.get('categoryId');
        const limit = parseInt(url.searchParams.get('limit') || '50', 10);
        const latest = url.searchParams.get('latest') === 'true';

        const whereClause = categoryId ? { categoryId } : {};

        const topics = await (prisma as any).forumTopic.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                author: { select: { walletAddress: true, tier: true, isPro: true } },
                category: { select: { name: true, color: true, slug: true } },
                _count: { select: { posts: true, likes: true } },
                tags: true
            }
        });

        return NextResponse.json(topics);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

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
        const { title, content, categoryId, tags } = body;

        if (!title || !content || !categoryId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newTopic = await (prisma as any).forumTopic.create({
            data: {
                title,
                content,
                categoryId,
                authorId: user.id,
                // Handle tags if they are provided. For simplicity, connect or create.
                tags: tags && tags.length > 0 ? {
                    connectOrCreate: tags.map((t: string) => ({
                        where: { name: t.toLowerCase() },
                        create: { name: t.toLowerCase() }
                    }))
                } : undefined
            }
        });

        // Add to audit log
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'FORUM_TOPIC_CREATED',
                resource: 'ForumTopic',
                metadata: { topicId: newTopic.id, title },
                ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
            }
        });

        return NextResponse.json(newTopic);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
