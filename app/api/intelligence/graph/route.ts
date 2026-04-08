import { NextResponse } from 'next/server';
import { graphMiner } from '@/services/intelligence/entity-graph-miner';
import { verifySession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await verifySession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized to view matrix geometry' }, { status: 401 });
        }

        const graph = await graphMiner.mineLocalNetworkGraph();
        
        return NextResponse.json({
            success: true,
            graph
        });
    } catch (e) {
        return NextResponse.json({ success: false, error: 'NEURAL_GRAPH_FAULT' }, { status: 500 });
    }
}
