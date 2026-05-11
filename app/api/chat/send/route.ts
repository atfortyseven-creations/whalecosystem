/**
 * POST /api/chat/send
 * Publishes a chat message to a Redis channel so all SSE listeners receive it in real-time.
 * Body: { channelId, sender, content }
 */
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// In-memory fallback store (per-process, lost on restart — fine for real-time only)
const memoryStore = new Map<string, Array<{ id: string; sender: string; content: string; sentAt: string }>>();

export async function POST(req: NextRequest) {
  try {
    const { channelId, sender, content } = await req.json();

    if (!channelId || !sender || !content?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const message = {
      id:      crypto.randomUUID(),
      sender:  sender.toLowerCase(),
      content: content.trim(),
      sentAt:  new Date().toISOString(),
    };

    // Persist last 100 messages per channel in Redis (sorted set by timestamp)
    const key = `whale_chat:messages:${channelId}`;
    await redis.zadd(key, { score: Date.now(), member: JSON.stringify(message) });
    await redis.expire(key, 60 * 60 * 24 * 7); // 7 days TTL

    // Publish to channel for SSE subscribers
    await redis.publish(`whale_chat:channel:${channelId}`, JSON.stringify(message));

    // Also update in-memory store as fallback
    if (!memoryStore.has(channelId)) memoryStore.set(channelId, []);
    const msgs = memoryStore.get(channelId)!;
    msgs.push(message);
    if (msgs.length > 100) msgs.shift();

    return NextResponse.json({ ok: true, message });
  } catch (err) {
    console.error('[Whale Chat] Send error:', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

/**
 * GET /api/chat/send?channelId=...
 * Fetches recent messages (polling fallback for environments without SSE)
 */
export async function GET(req: NextRequest) {
  try {
    const channelId = req.nextUrl.searchParams.get('channelId');
    if (!channelId) return NextResponse.json({ messages: [] });

    const key = `whale_chat:messages:${channelId}`;
    const since = req.nextUrl.searchParams.get('since');
    const sinceScore = since ? Number(since) : Date.now() - 5 * 60 * 1000; // last 5 min default

    const raw = await redis.zrangebyscore(key, sinceScore, '+inf', { withScores: false });
    const messages = raw.map((r: unknown) => {
      try { return typeof r === 'string' ? JSON.parse(r) : r; } catch { return null; }
    }).filter(Boolean);

    return NextResponse.json({ messages });
  } catch (err) {
    console.error('[Whale Chat] Fetch error:', err);
    return NextResponse.json({ messages: [] });
  }
}
