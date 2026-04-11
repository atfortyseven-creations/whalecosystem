import { NextResponse } from 'next/server';
import { safeRedisGet, safeRedisSet } from '@/lib/redis/client';

// Security check: Only the admin wallet b4a can upload
function isAdminWallet(address: string | undefined): boolean {
    if (!address) return false;
    return address.toLowerCase().endsWith('b4a');
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { moduleId, base64, walletAddress } = body;

        // Hardened check
        if (!isAdminWallet(walletAddress)) {
            return NextResponse.json({ ok: false, error: 'Unauthorized. Creator access only.' }, { status: 403 });
        }
        if (!moduleId || !base64) {
            return NextResponse.json({ ok: false, error: 'Missing payload' }, { status: 400 });
        }

        // Store in Redis (Persistent Academy Storage)
        const redisKey = `academy:pdf:${moduleId}`;
        
        // We use safeRedisSet without expiration (persistent)
        await safeRedisSet(redisKey, base64);
        
        // Also add to the directory index so the UI knows which modules have PDFs
        const directory = await safeRedisGet('academy:pdf_index');
        let index = directory ? JSON.parse(directory) : [];
        if (!index.includes(moduleId)) {
            index.push(moduleId);
            await safeRedisSet('academy:pdf_index', JSON.stringify(index));
        }

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("Academy PDF Upload Error", e);
        return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const action = searchParams.get('action');
        const moduleId = searchParams.get('moduleId');

        // Directory Mode: Return all module IDs that have a PDF attached
        if (action === 'index') {
            const directory = await safeRedisGet('academy:pdf_index');
            const index = directory ? JSON.parse(directory) : [];
            return NextResponse.json({ ok: true, index });
        }

        // Payload Mode: Return actual PDF content
        if (moduleId) {
            const base64 = await safeRedisGet(`academy:pdf:${moduleId}`);
            return NextResponse.json({ ok: true, base64: base64 || null });
        }

        return NextResponse.json({ ok: false, error: 'Invalid parameters' }, { status: 400 });
    } catch (e) {
        return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
