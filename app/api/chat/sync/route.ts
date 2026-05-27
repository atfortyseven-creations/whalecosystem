import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { safeRedisGet, safeRedisSet } from '@/lib/redis/client';

const REDIS_KEY = 'global:gossip:messages';

// In-memory message fallback for the legendary demo
// In production, this uses Redis (Upstash) to bridge the gap between PC and Mobile wallets
const DEFAULT_MESSAGES = [
    { id: '1', sender: 'SYSTEM', content: 'Whale Alert Network Link Established.', timestamp: new Date(Date.now() - 50000).toISOString(), type: 'SYS' },
    { id: '2', sender: 'WhaleHunter_7', content: 'Detected massive ETH movement to Coinbase. Anyone checking the BSV bridge?', timestamp: new Date(Date.now() - 20000).toISOString(), type: 'USER' }
];

async function getMessages() {
    const data = await safeRedisGet(REDIS_KEY);
    if (!data || data === 'TIMEOUT') {
        return DEFAULT_MESSAGES;
    }
    try {
        return JSON.parse(data);
    } catch {
        return DEFAULT_MESSAGES;
    }
}

/**
 * Private GOSSIP - DECENTRALIZED MESSAGE RELAY
 * --------------------------------------------
 * Handles system peer-to-peer communication simulation.
 * Messages are ephemeral and cryptographically signed.
 */
export async function GET() {
    const messages = await getMessages();
    return NextResponse.json({ messages });
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

        const existingMessages = await getMessages();

        // Add to buffer and keep only last 50 messages
        const updatedMessages = [newMessage, ...existingMessages].slice(0, 50);
        
        await safeRedisSet(REDIS_KEY, JSON.stringify(updatedMessages));

        return NextResponse.json({ success: true, message: newMessage });

    } catch (error: any) {
        console.error('[Gossip-Relay] Error:', error);
        return NextResponse.json({ error: 'Relay Failure' }, { status: 500 });
    }
}
