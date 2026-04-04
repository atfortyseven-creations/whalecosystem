import { NextResponse } from 'next/server';
import { mempoolWatcher } from '@/lib/blockchain/MempoolWatcher';

export const runtime = 'nodejs'; // Required for continuous streams and global singletons
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    // 1. Start the watcher if it isn't running (Dev environment safety)
    if (process.env.NODE_ENV !== 'production') {
        mempoolWatcher.startListening();
    }

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            
            // Send initial connection success
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', message: 'Sovereign Mempool Stream Established' })}\n\n`));

            // Interval to push real data from the watcher buffer
            const interval = setInterval(() => {
                const latest = mempoolWatcher.recentTiers.slice(-5); // Get latest 5 events from buffer
                
                if (latest.length > 0) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'stream', events: latest })}\n\n`));
                } else {
                    // Send heartbeat to keep connection alive
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`));
                }
            }, 1000); // 1-second pulse for 240Hz UI interpolation

            req.signal.addEventListener('abort', () => {
                clearInterval(interval);
                controller.close();
            });
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
        },
    });
}
