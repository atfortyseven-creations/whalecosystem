import { NextResponse } from 'next/server';

// In-memory message buffer for the legendary demo
// In production, this would use Redis (Upstash) or a direct BSV Overlay
let messageBuffer: any[] = [
    { id: '1', sender: 'SYSTEM', content: 'Sovereign Network Link Established.', timestamp: new Date(Date.now() - 50000).toISOString(), type: 'SYS' },
    { id: '2', sender: 'WhaleHunter_7', content: 'Detected massive ETH movement to Coinbase. Anyone checking the BSV bridge?', timestamp: new Date(Date.now() - 20000).toISOString(), type: 'USER' }
];

/**
 * SOVEREIGN GOSSIP - DECENTRALIZED MESSAGE RELAY
 * --------------------------------------------
 * Handles sovereign peer-to-peer communication simulation.
 * Messages are ephemeral and cryptographically signed.
 */
export async function GET() {
    return NextResponse.json({ messages: messageBuffer });
}

export async function POST(request: Request) {
    try {
        const { sender, content, signature, address, type = 'USER' } = await request.json();

        if (!content || !sender) {
            return NextResponse.json({ error: 'Empty transmission detected.' }, { status: 400 });
        }

        const newMessage = {
            id: `msg_${Date.now()}`,
            sender,
            content,
            signature,
            address,
            timestamp: new Date().toISOString(),
            type
        };

        // Add to buffer and keep only last 50 messages
        messageBuffer = [newMessage, ...messageBuffer].slice(0, 50);

        return NextResponse.json({ success: true, message: newMessage });

    } catch (error: any) {
        console.error('[Gossip-Relay] Error:', error);
        return NextResponse.json({ error: 'Relay Failure' }, { status: 500 });
    }
}
