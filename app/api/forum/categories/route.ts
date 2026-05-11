import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const DEFAULT_CATEGORIES = [
    { name: 'General',    slug: 'general',    description: 'General discussion, announcements, and community updates.', color: '#00C076', orderIndex: 1 },
    { name: 'Developer',  slug: 'developer',  description: 'Technical discussions, smart contracts, bugs, and development topics.', color: '#9945FF', orderIndex: 2 },
    { name: 'Partnering', slug: 'partnering', description: 'Partnership proposals, collaboration opportunities, and integrations.', color: '#D4AF37', orderIndex: 3 },
];

async function ensureDefaultCategories() {
    // Upsert canonical categories (safe for existing data)
    for (const cat of DEFAULT_CATEGORIES) {
        await (prisma as any).forumCategory.upsert({
            where: { slug: cat.slug },
            update: { name: cat.name, description: cat.description, orderIndex: cat.orderIndex },
            create: { ...cat },
        });
    }

    // Cascade-delete topics/posts of non-canonical categories before removing them
    try {
        const legacyCategories = await (prisma as any).forumCategory.findMany({
            where: { slug: { notIn: DEFAULT_CATEGORIES.map(c => c.slug) } },
            select: { id: true },
        });
        if (legacyCategories.length > 0) {
            const legacyIds = legacyCategories.map((c: any) => c.id);
            // Find topics in legacy categories
            const legacyTopics = await (prisma as any).forumTopic.findMany({
                where: { categoryId: { in: legacyIds } },
                select: { id: true },
            });
            const legacyTopicIds = legacyTopics.map((t: any) => t.id);
            if (legacyTopicIds.length > 0) {
                // Delete dependent records first (FK order matters)
                await (prisma as any).forumNotification.deleteMany({ where: { topicId: { in: legacyTopicIds } } });
                await (prisma as any).forumLike.deleteMany({ where: { topicId: { in: legacyTopicIds } } });
                await (prisma as any).forumPost.deleteMany({ where: { topicId: { in: legacyTopicIds } } });
                await (prisma as any).forumTopic.deleteMany({ where: { id: { in: legacyTopicIds } } });
            }
            await (prisma as any).forumCategory.deleteMany({ where: { id: { in: legacyIds } } });
        }
    } catch (e) {
        console.warn('[Forum] Legacy category cleanup error (non-fatal):', e);
    }
}

export async function GET() {
    try {
        // Auto-seed on first access if no categories exist
        await ensureDefaultCategories();

        const categories = await (prisma as any).forumCategory.findMany({
            orderBy: { orderIndex: 'asc' },
            include: {
                _count: { select: { topics: true } },
                topics: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: {
                        id: true,
                        title: true,
                        createdAt: true,
                        author: { select: { walletAddress: true } }
                    }
                }
            }
        });

        return NextResponse.json(categories);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
