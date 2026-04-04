import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const dummyWallet = '0xSovereignAdmin';
        const alerts = await prisma.alertRule.findMany({
            where: { userId: dummyWallet },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ success: true, alerts });
    } catch (e) {
        return NextResponse.json({ success: false, error: 'Failed to fetch alerts' });
    }
}

export async function POST(req: NextRequest) {
    try {
        const dummyWallet = '0xSovereignAdmin';
        // Ensure user exists
        await prisma.user.upsert({
            where: { walletAddress: dummyWallet },
            update: {},
            create: { walletAddress: dummyWallet }
        });

        const body = await req.json();
        
        const newAlert = await prisma.alertRule.create({
            data: {
                userId: dummyWallet,
                name: body.name || 'New Alert',
                targetType: body.type || 'TOKEN',
                targetAddress: body.asset || 'BTC',
                enabled: body.status !== 'PAUSED',
                priceThreshold: body.threshold,
                conditionLogic: 'CUSTOM',
                actions: { notifyTelegram: body.notifyTelegram, notifyEmail: body.notifyEmail, notifyPush: body.notifyPush }
            }
        });
        return NextResponse.json({ success: true, alert: newAlert });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ success: false, error: e.message || 'Error saving alert' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get('id');
        if (id) {
            await prisma.alertRule.delete({ where: { id } });
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ success: false }, { status: 400 });
    } catch (e) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
