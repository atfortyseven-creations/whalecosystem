import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol')?.toUpperCase();
    // Use the raw address to try and match Trustwallet's expected casing if possible, 
    // though Ethereum addresses are case-insensitive, Trustwallet assets are checksum-cased.
    const address = searchParams.get('address');
    
    // 1. High-quality explicit map for major tokens (2027 standards)
    const exactMap: Record<string, string> = {
        'ETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
        'USDC': 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
        'USDT': 'https://cryptologos.cc/logos/tether-usdt-logo.png',
        'WBTC': 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png',
        'DAI': 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
        'MATIC': 'https://cryptologos.cc/logos/polygon-matic-logo.png',
        'POL': 'https://cryptologos.cc/logos/polygon-matic-logo.png',
        'OP': 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png',
        'ARB': 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
        'BASE': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png',
    };

    if (symbol && exactMap[symbol]) {
        return NextResponse.redirect(exactMap[symbol], 302);
    }

    if (address === 'native') {
        return NextResponse.redirect(exactMap['ETH'], 302);
    }

    // 2. Fallback to extensive lists (Trustwallet / 1inch / etc)
    if (address && address.startsWith('0x') && address.length === 42) {
        // Attempt to redirect to trustwallet. If it fails (404), the client <img onError> will handle it.
        const trustWalletUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
        return NextResponse.redirect(trustWalletUrl, 302);
    }

    // 3. Absolute Fallback: Dynamic SVG generation directly from the server
    const fallbackSymbol = symbol ? symbol.slice(0, 3) : '?';
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
            <rect width="200" height="200" fill="#050505"/>
            <text x="50%" y="55%" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="64" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" letter-spacing="2">
                ${fallbackSymbol}
            </text>
        </svg>
    `;

    return new NextResponse(svg.trim(), {
        status: 200,
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=31536000'
        }
    });
}
