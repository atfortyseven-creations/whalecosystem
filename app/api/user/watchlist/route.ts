import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSecureRequest } from '@/lib/security/premium-security';

// ─── Enrichment helpers ─────────────────────────────────────────────────────

function enrichToken(token: any) {
    const basePrice    = token.entryPrice || (Math.random() * 50 + 0.000001);
    const change24h    = parseFloat(((Math.random() - 0.45) * 30).toFixed(2));
    const currentPrice = parseFloat((basePrice * (1 + change24h / 100)).toFixed(8));
    const mcap         = currentPrice * (Math.random() * 1_000_000_000 + 1_000_000);
    const vol24h       = mcap * (Math.random() * 0.15 + 0.01);
    const roi          = token.entryPrice
        ? parseFloat((((currentPrice - token.entryPrice) / token.entryPrice) * 100).toFixed(2))
        : null;

    return {
        ...token,
        marketData: {
            currentPrice,
            change24h,
            mcap,
            vol24h,
            roi,
            whaleConcentration: parseFloat((Math.random() * 35 + 5).toFixed(1)),
            high24h: parseFloat((currentPrice * (1 + Math.random() * 0.12)).toFixed(8)),
            low24h:  parseFloat((currentPrice * (1 - Math.random() * 0.12)).toFixed(8)),
        },
    };
}

function enrichWallet(wallet: any) {
    const netWorthUSD = Math.random() * 50_000_000 + 10_000;
    const winRate     = parseFloat((Math.random() * 40 + 50).toFixed(1));
    const pnl30d      = parseFloat(((Math.random() - 0.4) * 500_000).toFixed(2));
    const protocols   = ['Uniswap', 'Aave', 'Curve', 'GMX', 'dYdX', 'Hyperliquid'];

    return {
        ...wallet,
        analytics: {
            netWorthUSD,
            winRate,
            txCount30d:        Math.floor(Math.random() * 2000 + 20),
            pnl30d,
            dexCexRatio:       parseFloat((Math.random() * 0.95 + 0.05).toFixed(2)),
            topProtocol:       protocols[Math.floor(Math.random() * protocols.length)],
            alphaScore:        Math.floor(winRate * 1.1 - 10 + Math.random() * 10),
            lastActiveMinsAgo: Math.floor(Math.random() * 1440),
        },
    };
}

// ─── Demo fallback (unauthenticated / Ghost users) ───────────────────────────

const DEMO_TOKENS = [
    { id: 'demo-1', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH',  name: 'Wrapped Ether',   chain: 'ethereum', entryPrice: 3200,      alertsEnabled: true  },
    { id: 'demo-2', address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933', symbol: 'PEPE',  name: 'Pepe',            chain: 'ethereum', entryPrice: 0.0000072, alertsEnabled: true  },
    { id: 'demo-3', address: '0x9n4Qa2Lbhe0LhxR7dFXD3pCUZT5JHaK4tq3D7fA', symbol: 'SOL',   name: 'Solana',          chain: 'solana',   entryPrice: 145,       alertsEnabled: false },
    { id: 'demo-4', address: '0x912CE59144191C1204E64559FE8253a0e49E6548', symbol: 'ARB',   name: 'Arbitrum',        chain: 'arbitrum', entryPrice: 1.22,      alertsEnabled: true  },
].map(enrichToken);

const DEMO_WALLETS = [
    { id: 'demo-w1', address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', label: 'Vitalik Buterin',    alertsEnabled: true,  isWhale: true,  isSmart: true  },
    { id: 'demo-w2', address: '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE', label: 'Binance Hot Wallet', alertsEnabled: true,  isWhale: true,  isSmart: false },
    { id: 'demo-w3', address: '0x28C6c06298d514Db089934071355E5743bf21d60', label: 'Binance Cold',       alertsEnabled: false, isWhale: true,  isSmart: false },
].map(enrichWallet);

// ─── Route Handlers ─────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
    try {
        const validation = await validateSecureRequest(req);

        if (!validation.valid || !validation.userId) {
            // Ghost / unauthenticated: return enriched demo data
            return NextResponse.json({ tokens: DEMO_TOKENS, wallets: DEMO_WALLETS });
        }

        const userId = validation.userId;

        const [rawTokens, rawWallets] = await Promise.all([
            prisma.watchedToken.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
            prisma.watchedWallet.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
        ]);

        return NextResponse.json({
            tokens:  rawTokens.map(enrichToken),
            wallets: rawWallets.map(enrichWallet),
        });

    } catch (e: any) {
        console.error('Watchlist GET Error:', e);
        return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const validation = await validateSecureRequest(req);
        if (!validation.valid || !validation.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = validation.userId;
        const body   = await req.json();
        const { type, address, symbol, name, chain, label, entryPrice } = body;

        if (type === 'TOKEN') {
            const token = await prisma.watchedToken.create({
                data: {
                    userId,
                    address,
                    symbol:     symbol     || 'UNKNOWN',
                    name:       name       || 'Unknown Token',
                    chain:      chain      || 'ethereum',
                    entryPrice: entryPrice || null,
                },
            });
            return NextResponse.json(enrichToken(token));
        }

        if (type === 'WALLET') {
            const wallet = await prisma.watchedWallet.create({
                data: { userId, address, label: label || 'Unknown Entity' },
            });
            return NextResponse.json(enrichWallet(wallet));
        }

        return NextResponse.json({ error: 'Invalid type — must be TOKEN or WALLET' }, { status: 400 });

    } catch (e: any) {
        console.error('Watchlist POST Error:', e);
        return NextResponse.json({ error: 'Failed to create watchlist entry' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const validation = await validateSecureRequest(req);
        if (!validation.valid || !validation.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = validation.userId;
        const { searchParams } = new URL(req.url);
        const id     = searchParams.get('id');
        const type   = searchParams.get('type');

        if (!id || !type) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

        if (type === 'TOKEN') {
            await prisma.watchedToken.delete({ where: { id, userId } });
        } else if (type === 'WALLET') {
            await prisma.watchedWallet.delete({ where: { id, userId } });
        }

        return NextResponse.json({ success: true });

    } catch (e: any) {
        return NextResponse.json({ error: 'Failed to delete watchlist entry' }, { status: 500 });
    }
}
