import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

const DEFAULT_CATEGORIES = [
    { name: 'Announcements',   slug: 'announcements', description: 'Official network updates and protocol changes.', color: '#2D0A59', orderIndex: 1 },
    { name: 'Governance',      slug: 'governance',    description: 'Proposals, voting discussions, and treasury allocations.', color: '#D4AF37', orderIndex: 2 },
    { name: 'Research & Alpha',slug: 'research',      description: 'High-level macro analysis, on-chain data, and institutional insights.', color: '#0066FF', orderIndex: 3 },
    { name: 'Technical Support',slug: 'support',      description: 'Smart contract debugging, SDK assistance, and bug reports.', color: '#E11D48', orderIndex: 4 },
];

async function ensureDefaultCategories() {
    const count = await (prisma as any).forumCategory.count();
    if (count === 0) {
        await (prisma as any).forumCategory.createMany({ data: DEFAULT_CATEGORIES });
    }
}

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const address = cookieStore.get('sovereign_handshake')?.value;
        if (!address) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
