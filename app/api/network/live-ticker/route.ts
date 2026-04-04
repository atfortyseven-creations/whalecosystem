import { NextResponse } from 'next/server';
import { mainnetClient, bscClient } from '@/lib/blockchain/rpc-engine';
import { formatUnits } from 'viem';
import { whaleService } from '@/lib/services/whale-data';

export const revalidate = 0;

export async function GET() {
    try {
        const [ethBlock, bscBlock, ethGas, bscGas, whaleMovements] = await Promise.all([
            mainnetClient.getBlockNumber(),
            bscClient.getBlockNumber(),
            mainnetClient.getGasPrice(),
            bscClient.getGasPrice(),
            whaleService.getLatestWhaleActivity(5)
        ]);

        const tickerItems = [
            `ETH BLOCK: ${ethBlock}`,
            `BSC BLOCK: ${bscBlock}`,
            `ETH GAS: ${Math.floor(Number(formatUnits(ethGas, 9)))} GWEI`,
            `BSC GAS: ${Number(formatUnits(bscGas, 9)).toFixed(2)} GWEI`,
        ];

        // Add latest whale movements to the ticker
        whaleMovements.forEach(m => {
            tickerItems.push(`⚠ WHALE: ${m.amount} ${m.token} ON ${m.chain} detected`);
        });

        // Add Price Data (Mocked but real-ish using Binance Ticker)
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr', { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            const btc = data.find((d: any) => d.symbol === 'BTCUSDT');
            const eth = data.find((d: any) => d.symbol === 'ETHUSDT');
            const bnb = data.find((d: any) => d.symbol === 'BNBUSDT');

            if (btc) tickerItems.push(`BTC: $${parseFloat(btc.lastPrice).toLocaleString()} ▲${btc.priceChangePercent}%`);
            if (eth) tickerItems.push(`ETH: $${parseFloat(eth.lastPrice).toLocaleString()} ▼${eth.priceChangePercent}%`);
            if (bnb) tickerItems.push(`BNB: $${parseFloat(bnb.lastPrice).toLocaleString()} ▲${bnb.priceChangePercent}%`);
        }

        return NextResponse.json({ 
            success: true, 
            ticker: tickerItems,
            stats: {
                ethBlock: Number(ethBlock),
                bscBlock: Number(bscBlock),
                whaleCount: whaleMovements.length,
                uptime: '99.99%',
                volume24h: '$4.2B'
            }
        });
    } catch (e) {
        console.error('[TICKER ERROR]', e);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
