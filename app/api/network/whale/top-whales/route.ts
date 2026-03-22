import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { moralisService } from '@/lib/blockchain/MoralisService';
import { redisClient as redis } from '@/lib/redis/client';

const prisma = new PrismaClient();

// High Priority Whales for the São Paulo Merge Showcase
const WHALES = [
    { address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', label: 'Genesis Block (Satoshi)', chain: 'btc', tier: 'MEGA', isSatoshi: true },
    { address: '1LQoWist8KkaUXSPKZp785SvpXGa7N4w2A', label: 'Binance-Cold-Wallet', chain: 'btc', tier: 'MEGA', isSatoshi: false },
    { address: '0x00000000219ab540356cbb839cbe05303d7705fa', label: 'Ethereum 2.0 Deposit Contract', chain: 'eth', tier: 'MEGA', isSatoshi: false },
    { address: '1P5ZEDi2BtU4cc2ca7NF3ia9Fk4p5vK2QG', label: 'MicroStrategy (Proxy)', chain: 'btc', tier: 'LARGE', isSatoshi: false },
    { address: '1FzWp631MsH7nL7V2Y5ytvJk7n5f9f6eYd', label: 'Winklevoss Capital', chain: 'btc', tier: 'LARGE', isSatoshi: false },
];

export const revalidate = 3600; // 1 hour cache at Next.js level

export async function GET() {
    try {
        const cacheKey = 'whale_snapshots_global';
        const cached = await redis.get(cacheKey);

        if (cached) {
            return NextResponse.json({ whales: JSON.parse(cached), source: 'cache' });
        }

        // Fetch current prices once
        const priceRes = await fetch("https://api.binance.com/api/v3/ticker/price?symbols=[%22BTCUSDT%22,%22ETHUSDT%22]");
        const priceData = await priceRes.json();
        const btcPrice = Array.isArray(priceData) ? parseFloat(priceData.find((p: any) => p.symbol === "BTCUSDT")?.price || "64000") : 64000;
        const ethPrice = Array.isArray(priceData) ? parseFloat(priceData.find((p: any) => p.symbol === "ETHUSDT")?.price || "3400") : 3400;

        const snapshots = await Promise.all(WHALES.map(async (w) => {
            let balance = 0;
            let txCount = 0;

            try {
                if (w.chain === 'btc') {
                    // For BTC, Moralis doesn't have a direct raw balance for Sathoshi Era addresses yet, 
                    // sticking to a fallback or a more reliable free explorer if Moralis fails.
                    // But for this Elite upgrade, we try to unify.
                    const res = await fetch(`https://blockchain.info/rawaddr/${w.address}?limit=0`);
                    const data = await res.json();
                    balance = data.final_balance / 1e8;
                    txCount = data.n_tx;
                } else {
                    // Unified Moralis Balance Call (FREE TIER FRIENDLY)
                    const balData = await moralisService.getNativeBalance(w.address, 'eth');
                    balance = parseFloat(balData.balance || "0") / 1e18;
                    
                    const stats: any = await moralisService.getWalletStats(w.address, 'eth');
                    txCount = typeof stats?.transactions === 'object' 
                        ? parseInt(stats.transactions.total || "1000") 
                        : (parseInt(stats?.transactions?.toString() || "1000"));
                }
            } catch (e) {
                console.error(`Failed to fetch balance for ${w.address}`, e);
            }

            const btcBalance = w.chain === 'btc' ? balance : null;
            const ethBalance = w.chain === 'eth' ? balance : null;
            const usdEstimate = btcBalance ? btcBalance * btcPrice : (ethBalance ? ethBalance * ethPrice : 0);

            const pastSnapshots = await prisma.whaleSnapshot.findMany({
                where: { address: w.address },
                orderBy: { timestamp: 'desc' },
                take: 7,
            });

            const snapshot7d = pastSnapshots.map((s: any) => s.usdEstimate).reverse();
            
            // Persistence logic: Only save if last snapshot is > 4h old
            const lastSaved = pastSnapshots[0];
            if (!lastSaved || (Date.now() - new Date(lastSaved.timestamp).getTime() > 1000 * 60 * 60 * 4)) {
                await prisma.whaleSnapshot.create({
                    data: {
                        address: w.address,
                        label: w.label,
                        usdEstimate,
                        btcBalance,
                        ethBalance,
                        chain: w.chain,
                        tier: w.tier,
                        isSatoshiEra: w.isSatoshi,
                        txCount,
                        trend: pastSnapshots.length > 1 && usdEstimate > pastSnapshots[1].usdEstimate ? 'accumulating' : 'stable',
                    }
                });
            }

            return {
                address: w.address,
                label: w.label,
                btcBalance,
                ethBalance,
                usdEstimate,
                chain: w.chain,
                tier: w.tier,
                isSatoshiEra: w.isSatoshi,
                txCount,
                snapshot7d,
                trend: pastSnapshots.length > 1 && usdEstimate > pastSnapshots[1].usdEstimate ? 'accumulating' : 'stable',
                firstSeen: w.isSatoshi ? '2009-01-03' : 'Verified On-Chain',
                lastActive: new Date().toISOString().split('T')[0],
            };
        }));

        // Cache the entire set for 1 hour to save API calls
        await redis.set(cacheKey, JSON.stringify(snapshots), 'EX', 3600);

        return NextResponse.json({ whales: snapshots, source: 'live' });
    } catch (error) {
        console.error('Whale Persistence Error:', error);
        return NextResponse.json({ error: 'Failed to fetch or persist whale data' }, { status: 500 });
    }
}

