import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    try {
        const settings = await prisma.userSettings.findUnique({
            where: { userId },
            include: { user: true }
        });

        return NextResponse.json({ settings });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, email, telegramEnabled, telegramChatId, emailNotifications } = body;

        if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

        // Atomic Upsert for Sovereign Stability
        const updated = await prisma.userSettings.upsert({
            where: { userId },
            update: {
                telegramEnabled,
                telegramChatId,
                emailNotifications,
            },
            create: {
                userId,
                telegramEnabled,
                telegramChatId,
                emailNotifications,
            }
        });

        // Update User Email if provided
        if (email) {
            await prisma.user.update({
                where: { walletAddress: userId },
                data: { email }
            });
        }

        return NextResponse.json({ success: true, settings: updated });
    } catch (error) {
        console.error("Settings Update Error:", error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
