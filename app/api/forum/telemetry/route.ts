import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const address = cookieStore.get('sovereign_handshake')?.value;
        
        // Find user if authenticated
        let userId = undefined;
        if (address) {
            const user = await prisma.user.findUnique({ 
                where: { walletAddress: address },
                select: { id: true }
            });
            if (user) userId = user.id;
        }

        const body = await req.json();
        const { action, metadata } = body;

        const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'Unknown IP';
        const userAgent = req.headers.get('user-agent') || 'Unknown Agent';

        await (prisma as any).forumTelemetry.create({
            data: {
                userId,
                action,
                ipAddress,
                userAgent,
                metadata: metadata || {}
            }
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        // Silently fail for telemetry so it doesn't break the UI
        console.error("[Telemetry Error]:", e.message);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
