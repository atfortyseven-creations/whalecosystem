import { NextRequest, NextResponse } from 'next/server';
import { zkWorker } from '@/services/crypto/zk-shield-worker';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized via Sovereign Handshake' }, { status: 401 });
        }

        const body = await req.json();
        const { address, amount, nonce } = body;

        if (!address) {
            return NextResponse.json({ error: 'Address required for ZK payload' }, { status: 400 });
        }

        // Generate the SNARK proof
        const snark = await zkWorker.generateShieldProof(address, amount || 1, nonce || Date.now().toString());

        // Shield the entity in the database
        const shielded = await zkWorker.shieldEntity(address);

        return NextResponse.json({
            success: true,
            snark,
            shielded
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'ZK_STATION_FAULT' }, { status: 500 });
    }
}
