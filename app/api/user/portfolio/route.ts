/**
 * GET /api/user/portfolio?address=0x...
 * Powers LivePortfolio panel via GetBlock EP1 (JSON-RPC)
 * Real on-chain ETH + ERC-20 balances — no synthetic data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserPortfolio } from '@/lib/blockchain/getblock-engine';

export const dynamic = 'force-dynamic';

// Known token USD prices (approximate — will be enriched by EP4 pool prices)
const USD_PRICES: Record<string, number> = {
    ETH:   2200, WETH:  2200, WBTC:  68000, BTC: 68000,
    USDC:  1,    USDT:  1,    DAI:   1,
    LINK:  14,   UNI:   8,    AAVE:  95,    MKR: 1800,
    ARB:   1.1,  OP:    2.1,  PEPE:  0.000012, SHIB: 0.000025,
    MATIC: 0.75, LDO:   2.3,
};

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const address = searchParams.get('address');

        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
        }

        const { ethBalance, tokens } = await getUserPortfolio(address);

        // Compute USD values
        const ethUsd = ethBalance * (USD_PRICES['ETH'] || 2200);
        const tokenList = tokens.map(t => {
            const usdPrice = USD_PRICES[t.symbol] || 0;
            const usdValue = t.balance * usdPrice;
            return {
                symbol:       t.symbol,
                name:         t.symbol,
                balance:      t.balance,
                usdPrice,
                usdValue,
                change24h:    0,          // EP4 will enrich this via pool prices
                portfolioPct: 0,          // calculated below after total
                chain:        'ethereum',
            };
        });

        // ETH native position
        const ethPosition = {
            symbol: 'ETH', name: 'Ethereum',
            balance: ethBalance, usdPrice: USD_PRICES['ETH'], usdValue: ethUsd,
            change24h: 0, portfolioPct: 0, chain: 'ethereum',
        };

        const all = [ethPosition, ...tokenList].filter(t => t.usdValue > 1);
        const totalUsd = all.reduce((s, t) => s + t.usdValue, 0);
        all.forEach(t => { t.portfolioPct = totalUsd > 0 ? (t.usdValue / totalUsd) * 100 : 0; });

        return NextResponse.json({
            address,
            totalUsd,
            tokens: all,
            source: 'getblock_ep1_onchain',
            fetchedAt: new Date().toISOString(),
        });

    } catch (error: any) {
        console.error('[Portfolio EP1 Error]', error?.message);
        // Graceful fallback — return empty portfolio, not a crash
        return NextResponse.json({
            address: '',
            totalUsd: 0,
            tokens: [],
            source: 'error_fallback',
            error: 'RPC unavailable',
        }, { status: 200 });
    }
}
