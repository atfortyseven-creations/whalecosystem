import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// The 20 Sovereign Settings mapped to Prisma Schema
export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const address = cookieStore.get('sovereign_handshake')?.value;
        if (!address) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { walletAddress: address },
            select: {
                theme: true,
                currency: true,
                language: true,
                density: true,
                showBalances: true,
                hiddenAssets: true,
                defaultTimeframe: true,
                displayUnit: true,
                gasPreset: true,
                customRpcUrl: true,
                mevProtection: true,
                maxSlippage: true,
                inactivityLockMinutes: true,
                stealthMode: true,
                requireSignForExports: true,
                allowAnalytics: true,
                emailAlerts: true,
                telegramAlerts: true,
                whaleAlertThreshold: true,
                soundEffects: true,
                testnetMode: true,
            }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        return NextResponse.json(user);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const cookieStore = await cookies();
        const address = cookieStore.get('sovereign_handshake')?.value;
        if (!address) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();

        // Whitelist allowed fields to prevent arbitrary mass-assignment
        const allowedSettings = [
            'theme', 'currency', 'language', 'density', 
            'showBalances', 'hiddenAssets', 'defaultTimeframe', 'displayUnit',
            'gasPreset', 'customRpcUrl', 'mevProtection', 'maxSlippage',
            'inactivityLockMinutes', 'stealthMode', 'requireSignForExports', 'allowAnalytics',
            'emailAlerts', 'telegramAlerts', 'whaleAlertThreshold', 'soundEffects', 'testnetMode'
        ];

        const updateData: any = {};
        for (const key of Object.keys(body)) {
            if (allowedSettings.includes(key)) {
                if (key === 'maxSlippage' || key === 'whaleAlertThreshold') {
                    updateData[key] = parseFloat(body[key]);
                } else if (key === 'inactivityLockMinutes') {
                    updateData[key] = parseInt(body[key], 10);
                } else {
                    updateData[key] = body[key];
                }
            }
        }

        const updatedUser = await prisma.user.update({
            where: { walletAddress: address },
            data: updateData
        });

        // Add an audit log entry for changes
        await prisma.auditLog.create({
            data: {
                userId: updatedUser.id,
                action: 'SETTINGS_UPDATED',
                resource: 'User',
                metadata: updateData,
                ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
            }
        });

        return NextResponse.json({ success: true, settings: updateData });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
