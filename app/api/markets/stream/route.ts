import { NextRequest, NextResponse } from 'next/server';
import { Redis } from 'ioredis';

export const dynamic = 'force-dynamic';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
// We use a singleton loosely to avoid hitting max connections in dev
let redis: Redis | null = null;
try {
   redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 1, lazyConnect: true });
} catch (e) {
   console.warn("Could not connect to Redis for WSS streaming");
}

export async function GET(req: NextRequest) {
    const encoder = new TextEncoder();
    
    // Server-Sent Events (SSE) setup
    const stream = new ReadableStream({
        async start(controller) {
            // Function to send data
            const sendEvent = async () => {
                let marketData;
                
                try {
                    if (redis && redis.status === 'ready') {
                        // Attempt to fetch from high-performance Redis cache populated by our WebSocket Daemon
                        const raw = await redis.get('institutional_markets_cache');
                        if (raw) marketData = JSON.parse(raw);
                    }
                    
                    // Fallback to active REST fetch if no Redis daemon is running
                    if (!marketData) {
                        const binanceRes = await fetch('https://api.binance.com/api/v3/ticker/24hr', { cache: 'no-store' });
                        if (binanceRes.ok) {
                            marketData = await binanceRes.json();
                        }
                    }
                } catch (e) {
                    console.error("Stream Fetch Error", e);
                }

                if (marketData && Array.isArray(marketData)) {
                    const payload = `data: ${JSON.stringify({ success: true, timestamp: Date.now(), data: marketData })}\n\n`;
                    controller.enqueue(encoder.encode(payload));
                }
            };

            // Send immediate burst
            await sendEvent();

            // Set up interval for every 2 seconds (High Frequency)
            const intervalId = setInterval(async () => {
                await sendEvent();
            }, 2000);

            // Clean up upon client disconnect
            req.signal.addEventListener('abort', () => {
                clearInterval(intervalId);
                controller.close();
            });
        }
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
        },
    });
}
