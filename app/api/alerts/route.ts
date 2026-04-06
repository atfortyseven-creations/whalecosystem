import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const wallet = searchParams.get('address');
        
        if (!wallet) {
             return NextResponse.json({ success: true, alerts: [] }); // No wallet = no alerts, perfectly clean
        }

        const alerts = await prisma.alert.findMany({
            where: { userId: wallet.toLowerCase() },
            orderBy: { createdAt: 'desc' }
        });
        
        // Map back to what the frontend expects
        const mapped = alerts.map(a => ({
            id: a.id,
            name: `Alert for ${a.metric}`,
            conditionLogic: 'CUSTOM',
            targetAddress: a.metric,
            priceThreshold: a.threshold,
            enabled: a.isActive,
            createdAt: a.createdAt,
            actions: { notifyPush: true }
        }));
        
        return NextResponse.json({ success: true, alerts: mapped });
    } catch (e) {
        return NextResponse.json({ success: false, error: 'Failed to fetch alerts' });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const wallet = body.address?.toLowerCase();
        
        if (!wallet) {
            return NextResponse.json({ success: false, error: 'Wallet address required' }, { status: 400 });
        }

        // Ensure user exists
        await prisma.user.upsert({
            where: { walletAddress: wallet },
            update: {},
            create: { walletAddress: wallet }
        });

        const newAlert = await prisma.alert.create({
            data: {
                userId: wallet,
                targetType: body.type || 'PRICE',
                condition: 'ABOVE',
                threshold: Number(body.threshold) || 0,
                metric: body.asset || 'BTC',
                isActive: body.status !== 'PAUSED',
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
        const wallet = url.searchParams.get('address')?.toLowerCase();

        if (id && wallet) {
            await prisma.alert.deleteMany({ where: { id, userId: wallet } }); // Strict permission L1
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ success: false }, { status: 400 });
    } catch (e) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
