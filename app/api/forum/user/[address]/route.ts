import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(req: Request, { params }: { params: { address: string } }) {
    try {
        const cookieStore = await cookies();
        const address = cookieStore.get('sovereign_handshake')?.value;
        if (!address) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userAddress = params.address.toLowerCase();

        const user = await (prisma as any).user.findUnique({
            where: { walletAddress: userAddress },
            select: {
                id: true,
                walletAddress: true,
                tier: true,
                isPro: true,
                createdAt: true,
                _count: {
                    select: {
                        forumTopics: true,
                        forumPosts: true,
                        forumLikes: true
                    }
                },
                forumTopics: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: { category: true, tags: true, _count: { select: { posts: true } } }
                },
                forumPosts: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: { topic: { select: { id: true, title: true, category: true } } }
                }
            }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        return NextResponse.json(user);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
