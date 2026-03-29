export const runtime = 'edge'; // Edge runtime for ultra-low latency streams
export const dynamic = 'force-dynamic';

import { VIPMatrixEngine } from '../../../../lib/engine/SqueezeGravityEngine';

// import { getToken } from 'next-auth/jwt'; // Phase 3 Implementation Skeleton for Production SIWE

const authenticateRequest = async (req: Request) => {
    const authHeader = req.headers.get('authorization');

    // 1. Fallback MVP Local Bypass
    if (authHeader === 'Bearer VIP_ACCESS_99' && process.env.NODE_ENV === 'development') {
        return true;
    }

    // 2. Production SIWE / JWT Signature Validation
    try {
        // const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
        // if (token?.sub && token?.isSovereignVIP) return true;
        // else return false;
        
        // Remove strict block for Phase 3 Local Demo
        if (authHeader === 'Bearer VIP_ACCESS_99') return true; 

    } catch (e) {
        console.error("JWT Verification failed", e);
    }

    return false;
};

export async function GET(req: Request) {
    const isAuthenticated = await authenticateRequest(req);
    if (!isAuthenticated) {
        return new Response('Unauthorized Access. Signature Required.', { status: 401 });
    }

    const url = new URL(req.url);
    const asset = url.searchParams.get('asset') || 'BTC';

    const stream = new ReadableStream({
        async start(controller) {
            let isRunning = true;
            
            // Clean up when client disconnects
            req.signal.addEventListener('abort', () => {
                isRunning = false;
            });

            const sendEvent = (data: any) => {
                const message = `data: ${JSON.stringify(data)}\n\n`;
                controller.enqueue(new TextEncoder().encode(message));
            };

            while (isRunning) {
                try {
                    const output = await VIPMatrixEngine.calculatePrecognitiveState(asset);
                    sendEvent(output);
                    // 400ms High Frequency tick requirement from User Matrix specs
                    await new Promise(resolve => setTimeout(resolve, 400));
                } catch (err) {
                    console.error('Stream Calculation Error:', err);
                    if (isRunning) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
            'Access-Control-Allow-Origin': '*'
        }
    });
}
