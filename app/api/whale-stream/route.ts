/**
 * GET /api/whale-stream
 *
 * Server-Sent Events (SSE) endpoint that delivers real-time whale
 * alert events from the Redis queue to any subscribed browser client.
 *
 * Architecture:
 *   EVM/BTC/SOL Worker → prisma.whaleActivity → Redis List (whale:alert:queue)
 *   → THIS ENDPOINT poll/BLPOP → SSE stream → React Context → UI
 *
 * Why SSE over WebSocket?
 *  - SSE works through HTTP/2 multiplexing on Railway without extra infra
 *  - Automatic browser reconnect on failure (EventSource API)
 *  - Unidirectional (server → client) is exactly what we need
 */

import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Redis import is conditional — the worker sets the queue, this endpoint reads it.
// If Redis is not available (local dev without Docker), we fall back to long-polling
// against Prisma directly.

async function getRedisClient() {
    try {
        const { redisClient } = await import('@/lib/redis/client');
        // Check if mock
        if ((redisClient as any).__isMock) return null;
        return redisClient;
    } catch {
        return null;
    }
}

async function getPrismaClient() {
    const { prisma } = await import('@/lib/prisma');
    return prisma;
}

export async function GET(req: NextRequest) {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const send = (event: string, data: unknown) => {
                const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
                try {
                    controller.enqueue(encoder.encode(payload));
                } catch {
                    // Client disconnected — stream will be cleaned up by finally block
                }
            };

            // Initial heartbeat
            send('connected', { status: 'sovereign', timestamp: new Date().toISOString() });

            let lastId: string | undefined;
            // [ESTABILIDAD CÓSMICA] Puntero de Stream para no consumir duplicados. Inicia en el último evento ('$')
            let redisStreamId = '$';
            let running = true;

            req.signal.addEventListener('abort', () => {
                running = false;
                try { controller.close(); } catch {}
            });

            const redis = await getRedisClient();
            const prisma = await getPrismaClient();

            while (running) {
                try {
                    // ─── Primary path: Redis Streams ───────────────────────────
                    if (redis) {
                        // XREAD bloqueante por 15s. No elimina el dato de la cola.
                        const result = await (redis as any).xread('BLOCK', 15000, 'STREAMS', 'whale:alert:stream', redisStreamId);
                        
                        if (result) {
                            // result structure: [ [ 'whale:alert:stream', [ [ msgId, ['payload', jsonString] ] ] ] ]
                            const streamData = result[0];
                            const messages = streamData[1];
                            
                            for (const message of messages) {
                                redisStreamId = message[0]; // Actualizamos puntero
                                const fieldValues = message[1];
                                
                                // Parseamos el index 1 que asume ['payload', '{"hash":...}']
                                const jsonPayload = fieldValues[1];
                                if (jsonPayload) {
                                    const alert = JSON.parse(jsonPayload);
                                    send('whale', alert);
                                }
                            }
                        } else {
                            // Timeout — send heartbeat
                            send('heartbeat', { ts: Date.now() });
                        }
                    } else {
                        // ─── Fallback path: Prisma polling ─────────────────────
                        const where = lastId ? { id: { gt: lastId } } : {};
                        const rows = await prisma.whaleActivity.findMany({
                            where,
                            orderBy: { timestamp: 'asc' },
                            take: 10,
                        });

                        for (const row of rows) {
                            send('whale', {
                                hash: row.transactionHash,
                                from: row.fromAddress,
                                to: row.toAddress,
                                asset: row.token,
                                amount: row.amount,
                                usdValue: row.usdValue,
                                chain: row.chain,
                                type: row.type,
                                timestamp: row.timestamp?.toISOString(),
                            });
                            lastId = row.id;
                        }

                        if (rows.length === 0) {
                            send('heartbeat', { ts: Date.now() });
                        }

                        // Poll every 5 seconds in fallback mode
                        await new Promise(r => setTimeout(r, 5000));
                    }
                } catch (err: any) {
                    if (!running) break;
                    // Send error event (non-fatal — client will stay connected)
                    send('error', { message: err?.message ?? 'Stream error' });
                    await new Promise(r => setTimeout(r, 3000));
                }
            }
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no', // Disable Nginx buffering (Railway)
            'Access-Control-Allow-Origin': '*',
        },
    });
}
