import { NextResponse } from 'next/server';
import { runBrcSync } from '@/services/scanner/bsv-brc-sync';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    try {
        if (action === 'sync') {
            const result = await runBrcSync();
            return NextResponse.json(result);
        }

        // Return current standards
        const standards = await prisma.bRCStandard.findMany({
            orderBy: { brcNumber: 'asc' }
        });

        return NextResponse.json({
            success: true,
            count: standards.length,
            standards
        });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
