import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const address = cookieStore.get('sovereign_handshake')?.value;
        if (!address) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Ensure user is Pro or special admin (using isPro as basic check here)
        const user = await prisma.user.findUnique({ where: { walletAddress: address } });
        if (!user?.isPro) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const currentCount = await (prisma as any).forumCategory.count();
        if (currentCount > 0) {
            return NextResponse.json({ message: 'Categories already exist', count: currentCount });
        }

        const defaultCategories = [
            { name: 'Announcements', slug: 'announcements', description: 'Official network updates and protocol changes.', color: '#2D0A59', orderIndex: 1 },
            { name: 'Governance', slug: 'governance', description: 'Proposals, voting discussions, and treasury allocations.', color: '#D4AF37', orderIndex: 2 },
            { name: 'Research & Alpha', slug: 'research', description: 'High-level macro analysis, on-chain data, and institutional insights.', color: '#0066FF', orderIndex: 3 },
            { name: 'Technical Support', slug: 'support', description: 'Smart contract debugging, SDK assistance, and bug reports.', color: '#E11D48', orderIndex: 4 }
        ];

        await (prisma as any).forumCategory.createMany({
            data: defaultCategories
        });

        return NextResponse.json({ success: true, message: 'Foundation categories initialized.' });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
