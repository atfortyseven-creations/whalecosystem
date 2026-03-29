import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
    // Generate dynamic "live" data to simulate real-time performance of top traders.
    // In production, this would query Hyperliquid or Bybit APIs for top PnL accounts.
    const t = Date.now() / 1000;
    
    // Simulate real-time PnL fluctuations
    const pnl1 = 482.4 + Math.sin(t / 2) * 5;
    const vigor1 = 98 - Math.abs(Math.cos(t / 3) * 3);
    
    const pnl2 = 314.1 + Math.cos(t / 2.5) * 4;
    const vigor2 = 94 - Math.abs(Math.sin(t / 4) * 4);
    
    const pnl3 = 289.7 + Math.sin(t / 1.5) * 6;
    const vigor3 = 89 + Math.abs(Math.sin(t / 5) * 2);

    const traders = [
        { 
            id: 'wallet_1', 
            label: '0x8f...4e1A', 
            pnl: `+${pnl1.toFixed(1)}%`, 
            vigor: `${vigor1.toFixed(0)}%`, 
            badge: 'APEX PREDATOR', 
            asset: 'BTC' 
        },
        { 
            id: 'wallet_2', 
            label: '0x2C...9b33', 
            pnl: `+${pnl2.toFixed(1)}%`, 
            vigor: `${vigor2.toFixed(0)}%`, 
            badge: 'HFT ALGO', 
            asset: 'ETH' 
        },
        { 
            id: 'wallet_3', 
            label: '0xa1...00fF', 
            pnl: `+${pnl3.toFixed(1)}%`, 
            vigor: `${vigor3.toFixed(0)}%`, 
            badge: 'LIQUIDITY SNIPER', 
            asset: 'SOL' 
        }
    ];

    return NextResponse.json({
        traders,
        timestamp: Date.now()
    });
}
