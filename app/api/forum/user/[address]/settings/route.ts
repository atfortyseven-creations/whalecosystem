import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function PUT(req: Request, { params }: { params: { address: string } }) {
    try {
        const cookieStore = await cookies();
        const sessionAddress = cookieStore.get('sovereign_handshake')?.value;
        if (!sessionAddress || sessionAddress.toLowerCase() !== params.address.toLowerCase()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { displayName, avatarUrl, bio } = body;

        // Ensure user exists and select only ID to prevent schema crash on missing remote columns
        const user = await prisma.user.findUnique({ 
            where: { walletAddress: sessionAddress },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updatedUser = await (prisma as any).user.update({
            where: { id: user.id },
            data: {
                displayName: displayName !== undefined ? displayName : undefined,
                avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
                bio: bio !== undefined ? bio : undefined
            },
            select: {
                id: true,
                walletAddress: true,
                displayName: true,
                avatarUrl: true,
                bio: true
            }
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
