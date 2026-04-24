import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const address = cookieStore.get('sovereign_handshake')?.value;
        if (!address) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
