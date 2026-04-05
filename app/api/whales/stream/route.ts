import { NextResponse } from 'next/server';
import Redis from 'ioredis';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    if (req.headers.get('accept') === 'text/event-stream') {
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
                const pSubscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379'); // need dedicated sub

                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'CONNECTED' })}\n\n`));

                // Send latest cache history on connect
                try {
                    const cachedRaw = await redis.get('latest_whale_alerts');
                    if (cachedRaw) {
                        const alerts = JSON.parse(cachedRaw);
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'HISTORY', alerts })}\n\n`));
                    }
                } catch (e) {
                    console.error("Failed to fetch whale cache", e);
                }

                pSubscriber.subscribe('whale_alerts_stream', (err) => {
                    if (err) console.error("Redis sub error:", err);
                });

                pSubscriber.on('message', (channel, message) => {
                    if (channel === 'whale_alerts_stream') {
                        controller.enqueue(encoder.encode(`data: ${message}\n\n`));
                    }
                });

                setInterval(() => {
                    controller.enqueue(encoder.encode(`:\n\n`)); // keep-alive
                }, 15000);

                req.signal.addEventListener('abort', () => {
                    pSubscriber.quit();
                    redis.quit();
                    controller.close();
                });
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    }

    return NextResponse.json({ error: 'SSE only' }, { status: 400 });
}
