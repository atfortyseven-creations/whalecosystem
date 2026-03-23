/**
 * Polymarket Real Markets API Proxy
 * Fetches live prediction markets from the official Polymarket CLOB API
 * Sorted by volume and filtered to top opportunities
 */
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const revalidate = 30; // ISR - revalidate every 30 seconds

const CLOB_API = 'https://clob.polymarket.com';
const GAMMA_API = 'https://gamma-api.polymarket.com';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    try {
        // Fetch top markets by volume from Gamma API (richer data)
        const gammaUrl = new URL(`${GAMMA_API}/markets`);
        gammaUrl.searchParams.set('limit', String(limit));
        gammaUrl.searchParams.set('active', 'true');
        gammaUrl.searchParams.set('closed', 'false');
        gammaUrl.searchParams.set('order', 'volume24hr');
        gammaUrl.searchParams.set('ascending', 'false');
        if (category !== 'all') {
            gammaUrl.searchParams.set('tag_slug', category);
        }

        const res = await fetch(gammaUrl.toString(), {
            headers: { 'Accept': 'application/json' },
            next: { revalidate: 30 }
        });

        if (!res.ok) {
            throw new Error(`Gamma API error: ${res.status}`);
        }

        const markets = await res.json();

        // Normalize and enrich the data
        const normalized = (Array.isArray(markets) ? markets : markets.data || []).map((m: any) => ({
            id: m.id || m.conditionId,
            slug: m.slug,
            question: m.question,
            description: m.description?.slice(0, 200),
            category: m.category || m.tags?.[0]?.label || 'Crypto',
            // Outcome prices (YES probability 0-1)
            yesPrice: parseFloat(m.outcomes?.find((o: any) => o.name === 'Yes')?.price || m.bestAsk || '0.5'),
            noPrice: parseFloat(m.outcomes?.find((o: any) => o.name === 'No')?.price || '0.5'),
            // Volume in USDC
            volume24h: parseFloat(m.volume24hr || m.volume || '0'),
            volumeTotal: parseFloat(m.volumeNum || m.volume || '0'),
            // Liquidity
            liquidity: parseFloat(m.liquidity || '0'),
            // Meta
            endDate: m.endDate || m.resolutionTime,
            conditionId: m.conditionId,
            image: m.image,
            // Computed: edge (distance from 50/50 = opportunity signal)
            edge: Math.abs(0.5 - parseFloat(m.outcomes?.find((o: any) => o.name === 'Yes')?.price || '0.5')),
            // Best EV opportunity signal
            evSignal: calcEV(parseFloat(m.outcomes?.find((o: any) => o.name === 'Yes')?.price || '0.5')),
        }));

        // Sort by edge (best arbitrage opportunities first)
        normalized.sort((a: any, b: any) => b.volume24h - a.volume24h);

        return NextResponse.json({
            markets: normalized,
            timestamp: Date.now(),
            count: normalized.length
        });

    } catch (err: any) {
        console.error('[POLYMARKET_MARKETS]', err.message);
        return NextResponse.json({ error: err.message, markets: [], timestamp: Date.now(), count: 0 }, { status: 500 });
    }
}

/** 
 * Compute expected value signal:
 * If price < 0.15 → HIGH chance it's under-valued (OVERWEIGHT_YES)
 * If price > 0.85 → Overbought, look at shorting
 * Returns a signal string for the frontend
 */
function calcEV(yesPrice: number): string {
    if (yesPrice >= 0.85) return 'OVERBOUGHT';
    if (yesPrice <= 0.15) return 'OVERSOLD';
    if (yesPrice >= 0.58) return 'LEAN_YES';
    if (yesPrice <= 0.42) return 'LEAN_NO';
    return 'NEUTRAL';
}
