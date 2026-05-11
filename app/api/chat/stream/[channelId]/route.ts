/**
 * GET /api/chat/stream/[channelId]
 * Server-Sent Events endpoint. Streams new messages to connected clients in real-time.
 * Uses Upstash Redis polling (Upstash doesn't support SUBSCRIBE, so we use zrangebyscore polling).
 */
import { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const { channelId } = await params;

  const encoder = new TextEncoder();
  let lastScore = Date.now() - 500; // start slightly in the past to pick up very recent msgs
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial heartbeat
      controller.enqueue(encoder.encode(': heartbeat\n\n'));

      const send = (data: object) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      // Poll Redis every 800ms for new messages
      const poll = async () => {
        if (closed) return;
        try {
          const key = `whale_chat:messages:${channelId}`;
          // Fetch messages newer than lastScore
          const raw = await redis.zrangebyscore(key, lastScore + 1, '+inf', { withScores: false });

          if (raw && raw.length > 0) {
            lastScore = Date.now();
            for (const r of raw) {
              try {
                const msg = typeof r === 'string' ? JSON.parse(r) : r;
                send({ type: 'message', payload: msg });
              } catch { /* skip malformed */ }
            }
          }
        } catch (err) {
          // Redis error — send heartbeat to keep connection alive
          send({ type: 'heartbeat' });
        }
      };

      // Send heartbeat every 15s to prevent proxy timeouts
      const heartbeatInterval = setInterval(() => {
        if (closed) { clearInterval(heartbeatInterval); return; }
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch { closed = true; }
      }, 15_000);

      // Poll interval
      const pollInterval = setInterval(async () => {
        if (closed) {
          clearInterval(pollInterval);
          clearInterval(heartbeatInterval);
          return;
        }
        await poll();
      }, 800);

      // Run once immediately
      await poll();

      // Cleanup on abort
      req.signal.addEventListener('abort', () => {
        closed = true;
        clearInterval(pollInterval);
        clearInterval(heartbeatInterval);
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection':    'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
