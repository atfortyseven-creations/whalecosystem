import { NextResponse } from 'next/server';
import { graphMiner } from '@/services/intelligence/entity-graph-miner';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const graph = await graphMiner.mineLocalNetworkGraph();
        return NextResponse.json({ success: true, graph });
    } catch (e: any) {
        console.warn('[Neural Graph] graphMiner failed, returning empty graph:', e.message);
        // Return a valid empty graph structure so the D3 component renders gracefully
        return NextResponse.json({
            success: true,
            graph: { nodes: [], links: [] },
            degraded: true,
            reason: 'Graph database offline — no data available at this time.'
        });
    }
}
