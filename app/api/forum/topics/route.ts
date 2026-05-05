import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/admin';
import { validateSecureRequest } from '@/lib/security/premium-security';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const categorySlug = searchParams.get('category');
        const tag = searchParams.get('tag');
        const rawLimit = parseInt(searchParams.get('limit') || '30', 10);
        const limit = Math.min(isNaN(rawLimit) ? 30 : rawLimit, 50); // Hard cap at 50 to prevent DoS
        const filter = searchParams.get('filter') || 'latest';
        const cursor = searchParams.get('cursor');

        let orderBy: any = { updatedAt: 'desc' };
        if (filter === 'new') orderBy = { createdAt: 'desc' };
        if (filter === 'top') orderBy = { views: 'desc' };
        if (filter === 'unread') orderBy = { views: 'asc' };

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
                        walletAddress: true,
                        displayName: true,
                        avatarUrl: true,
                        bio: true,
                        isPro: true
                    }
                },
                _count: {
                    select: { posts: true }
                }
            },
            orderBy,
            take: limit,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {})
        });

        return NextResponse.json(topics);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const validation = await validateSecureRequest(req);
        if (!validation.valid || !validation.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const address = validation.userId;

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
        
        if (title.length > 300) {
            return NextResponse.json({ error: 'Title is too long (max 300 chars)' }, { status: 400 });
        }
        
        if (content.length > 50000) {
            return NextResponse.json({ error: 'Content is too long (max 50,000 chars)' }, { status: 400 });
        }
        
        if (tags && Array.isArray(tags) && tags.length > 10) {
            return NextResponse.json({ error: 'Too many tags (max 10)' }, { status: 400 });
        }

        const isUserAdmin = isAdmin(address);
        void isUserAdmin; // Admin flag preserved for future gating logic

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
