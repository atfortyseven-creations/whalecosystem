
import { NextResponse } from 'next/server';
import { multichainHealth } from '@/lib/blockchain/MultichainHealthService';

export async function GET() {
    try {
        const healthData = await multichainHealth.getUniversalMatrixHealth();
        return NextResponse.json(healthData);
    } catch (error) {
        console.error('[Multiverse API Error]:', error);
        return NextResponse.json({ error: 'Failed to aggregate multiverse health' }, { status: 500 });
    }
}
