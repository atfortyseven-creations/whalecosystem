import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface LiquidationPoint {
  time: number;
  price: number;
  intensity: number;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol') || 'BTC';
    const pair = searchParams.get('pair') || 'USDT';
    const interval = searchParams.get('interval') || '24h';

    // Base prices for simulation
    const basePrices: Record<string, number> = {
      'BTC': 69420,
      'ETH': 3850,
      'SOL': 145,
      'XRP': 0.62,
      'ADA': 0.45,
    };

    const basePrice = basePrices[symbol] || 50000;
    const priceScale = pair === 'EUR' ? 0.92 : 1.0;
    const adjustedBasePrice = basePrice * priceScale;

    // Determine data points based on interval
    let points = 200;
    let timeStep = 60000 * 5; // 5 min default

    if (interval.includes('hour')) {
        points = 150;
        timeStep = 60000 * 2;
    } else if (interval.includes('day')) {
        points = 250;
        timeStep = 60000 * 15;
    } else if (interval.includes('week') || interval.includes('month')) {
        points = 300;
        timeStep = 60000 * 60;
    } else {
        points = 400;
        timeStep = 60000 * 60 * 24;
    }

    const now = Date.now();
    const data: LiquidationPoint[] = [];
    const priceLevels = 60;
    const priceStep = adjustedBasePrice * 0.002;

    // Simulation Engine: Generate realistic clusters
    // We create "liquidation walls" at certain price levels
    const walls = [
        adjustedBasePrice * 1.02,
        adjustedBasePrice * 1.05,
        adjustedBasePrice * 0.98,
        adjustedBasePrice * 0.95,
        adjustedBasePrice * (1 + (Math.random() - 0.5) * 0.1)
    ];

    for (let i = 0; i < points; i++) {
        const time = now - (points - i) * timeStep;
        const trend = Math.sin(i / 20) * (adjustedBasePrice * 0.03);
        const currentPrice = adjustedBasePrice + trend + (Math.random() - 0.5) * (adjustedBasePrice * 0.005);

        for (let j = 0; j < priceLevels; j++) {
            const levelPrice = adjustedBasePrice * 0.9 + j * priceStep;
            
            // Calculate intensity based on proximity to "walls" and current price
            let intensity = 0;
            
            walls.forEach(wall => {
                const distToWall = Math.abs(levelPrice - wall);
                if (distToWall < priceStep * 2) {
                    intensity += Math.random() * 0.8 * (1 / (distToWall / priceStep + 1));
                }
            });

            // Add some "noise" and clusters near current price
            const distToPrice = Math.abs(levelPrice - currentPrice);
            if (distToPrice < priceStep * 5) {
                intensity += Math.random() * 0.4 * (1 / (distToPrice / priceStep + 1));
            }

            if (intensity > 0.15) {
                data.push({
                    time,
                    price: levelPrice,
                    intensity: Math.min(1, intensity)
                });
            }
        }
    }

    return NextResponse.json({
        success: true,
        symbol,
        pair,
        interval,
        basePrice: adjustedBasePrice,
        maxIntensity: 1.0,
        data: data.slice(-5000), // Limit payload for performance
        timestamp: now
    });

  } catch (error) {
    console.error('Heatmap API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
