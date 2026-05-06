import { NextRequest } from 'next/server';
import { createPublicClient, webSocket } from 'viem';
import { mainnet } from 'viem/chains';
import { getGbWss } from '@/lib/blockchain/getblock-registry';

/**
 * 0-Conf Mempool Sniffer (Server-Sent Events)
 * -------------------------------------------
 * Conecta vía WebSocket al registry de GetBlock.
 * Filtra transacciones pendientes en el mempool antes de ser minadas.
 * Solo emite transacciones con un valor > 50 ETH.
 */
export async function GET(req: NextRequest) {
    const encoder = new TextEncoder();
    const wssUrl = getGbWss('eth');

    if (!wssUrl) {
        return new Response('Mempool Stream Unavailable (No WSS)', { status: 503 });
    }

    const client = createPublicClient({
        chain: mainnet,
        transport: webSocket(wssUrl),
    });

    const stream = new ReadableStream({
        async start(controller) {
            const sendEvent = (data: any) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            sendEvent({ type: 'MEMPOOL_CONNECTED', status: 'Scanning 0-conf matrix...' });

            const unwatch = client.watchPendingTransactions({
                onTransactions: async (hashes) => {
                    for (const hash of hashes) {
                        try {
                            const tx = await client.getTransaction({ hash });
                            // Solo ballenas: > 50 ETH en el mempool
                            if (tx.value && tx.value > 50000000000000000000n) {
                                sendEvent({
                                    type: 'PENDING_WHALE',
                                    hash: tx.hash,
                                    from: tx.from,
                                    to: tx.to,
                                    valueEth: Number(tx.value) / 1e18,
                                    timestamp: Date.now(),
                                });
                            }
                        } catch (e) {
                            // Transacción descartada o no encontrada
                        }
                    }
                },
                onError: (error) => {
                    sendEvent({ type: 'MEMPOOL_ERROR', message: error.message });
                }
            });

            req.signal.addEventListener('abort', () => {
                unwatch();
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
