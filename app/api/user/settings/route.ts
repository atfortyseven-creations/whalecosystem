import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// ── Field name bridge: store key → DB column ──────────────────────────────────
const STORE_TO_DB: Record<string, string> = {
    theme:                  'theme',
    currency:               'currency',
    language:               'language',
    showBalances:           'showBalances',
    stealthMode:            'stealthMode',
    allowAnalytics:         'allowAnalytics',
    mevProtection:          'mevProtection',
    testnetMode:            'testnetMode',
    audioAlerts:            'soundEffects',
    whaleThreshold:         'whaleAlertThreshold',
    autoDisconnectTimer:    'autoDisconnectTimer',
    layoutDensity:          'layoutDensity',
    rpcNode:                'rpcNode',
    websocketHealthPing:    'websocketHealthPing',
    hapticFeedback:         'hapticFeedback',
    biometricEnforcement:   'biometricEnforcement',
    mempoolSniffer:         'mempoolSniffer',
    maxGasFee:              'maxGasFee',
    portfolioGraphDefault:  'portfolioGraphDefault',
    hardwareAcceleration:   'hardwareAcceleration',
};

// ── DB column → store key (reverse map for GET) ───────────────────────────────
const DB_TO_STORE: Record<string, string> = {
    soundEffects:        'audioAlerts',
    whaleAlertThreshold: 'whaleThreshold',
};

function mapDbToStore(data: Record<string, any>): Record<string, any> {
    const out: Record<string, any> = {};
    for (const [dbKey, val] of Object.entries(data)) {
        const storeKey = DB_TO_STORE[dbKey] ?? dbKey;
        out[storeKey] = val;
    }
    return out;
}

// ── Safe columns guaranteed to exist in every DB schema version ──────────────
const SAFE_COLUMNS = [
    'theme', 'currency', 'language'
];

export async function GET() {
    try {
        const cookieStore = await cookies();
        const address = cookieStore.get('sovereign_handshake')?.value;
        if (!address) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        let user: any = null;
        try {
            user = await (prisma as any).user.findUnique({
                where: { walletAddress: address },
                select: {
                    theme: true, currency: true, language: true,
                    showBalances: true, stealthMode: true, allowAnalytics: true,
                    mevProtection: true, testnetMode: true,
                    soundEffects: true, whaleAlertThreshold: true,
                    autoDisconnectTimer: true, layoutDensity: true,
                    rpcNode: true, websocketHealthPing: true, hapticFeedback: true,
                    biometricEnforcement: true, mempoolSniffer: true,
                    maxGasFee: true, portfolioGraphDefault: true, hardwareAcceleration: true,
                },
            });
        } catch {
            // Extended columns not yet in schema — try with core settings columns only
            try {
                user = await prisma.user.findUnique({
                    where: { walletAddress: address },
                    select: {
                        theme: true, currency: true, language: true,
                        showBalances: true, stealthMode: true,
                        allowAnalytics: true, mevProtection: true,
                    },
                });
            } catch {
                // Absolute minimum — original schema guaranteed columns only
                user = await prisma.user.findUnique({
                    where: { walletAddress: address },
                    select: {
                        theme: true,
                        currency: true,
                        language: true,
                    },
                });
            }
        }

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        return NextResponse.json(mapDbToStore(user));
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const cookieStore = await cookies();
        const address = cookieStore.get('sovereign_handshake')?.value;
        if (!address) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();

        // Translate store keys → DB column names, reject unknown keys
        const updateData: Record<string, any> = {};
        for (const storeKey of Object.keys(body)) {
            const dbKey = STORE_TO_DB[storeKey];
            if (!dbKey) continue;
            const val = body[storeKey];
            if (dbKey === 'whaleAlertThreshold' || dbKey === 'maxGasFee') {
                updateData[dbKey] = parseFloat(val);
            } else {
                updateData[dbKey] = val;
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ success: true, settings: {} });
        }

        let updatedUser: any = null;
        try {
            updatedUser = await (prisma as any).user.update({
                where: { walletAddress: address },
                data: updateData,
            });
        } catch {
            // New columns not yet in schema — only write safe columns
            const safeData: Record<string, any> = {};
            for (const k of Object.keys(updateData)) {
                if (SAFE_COLUMNS.includes(k)) safeData[k] = updateData[k];
            }
            if (Object.keys(safeData).length > 0) {
                updatedUser = await prisma.user.update({
                    where: { walletAddress: address },
                    data: safeData,
                });
            }
        }

        if (updatedUser) {
            try {
                await prisma.auditLog.create({
                    data: {
                        userId: updatedUser.id,
                        action: 'SETTINGS_UPDATED',
                        resource: 'User',
                        metadata: updateData,
                        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
                    }
                });
            } catch { /* audit log non-critical */ }
        }

        return NextResponse.json({ success: true, settings: mapDbToStore(updateData) });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
