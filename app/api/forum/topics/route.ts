import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { isAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const categorySlug = searchParams.get('category');
        const tag = searchParams.get('tag');
        const limit = parseInt(searchParams.get('limit') || '30');

        const topics = await (prisma as any).forumTopic.findMany({
            where: {
                ...(categorySlug ? { category: { slug: categorySlug } } : {}),
                ...(tag ? { tags: { some: { name: tag } } } : {})
            },
            include: {
                category: true,
                tags: true,
                author: {
                    select: {
                        walletAddress: true
                    }
                },
                _count: {
                    select: { posts: true }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            },
            take: limit
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

        // Upsert user — create them if they don't exist yet.
        const user = await prisma.user.upsert({
            where: { walletAddress: address },
            update: {},
            create: { walletAddress: address },
            select: { id: true }
        });

        const body = await req.json();
        const { title, content, categoryId, tags } = body;

        if (!title || !content || !categoryId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const isUserAdmin = isAdmin(address);

        const newTopic = await (prisma as any).forumTopic.create({
            data: {
                title,
                content,
                categoryId,
                authorId: user.id,
                tags: tags?.length ? {
                    connectOrCreate: tags.map((t: string) => ({
                        where: { name: t },
                        create: { name: t }
                    }))
                } : undefined
            }
        });

        // Add to audit log (graceful failure if table missing)
        try {
            await prisma.auditLog.create({
                data: {
                    userId: user.id,
                    action: 'FORUM_TOPIC_CREATED',
                    resource: 'ForumTopic',
                    metadata: { topicId: newTopic.id, title },
                    ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
                }
            });
        } catch (auditErr) {
            console.warn("AuditLog creation failed (table missing?):", auditErr);
        }

        return NextResponse.json(newTopic);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
