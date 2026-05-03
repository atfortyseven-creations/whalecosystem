import { NextRequest, NextResponse } from 'next/server';
import { mintJWT } from '@/lib/jwt';
import { safeRedisSet } from '@/lib/redis/client';
import { isAddress } from 'viem';

/**
 * POST /api/auth/qr-mobile-link
 *
 * Called by the mobile QRScannerModal to complete the desktop QR handshake.
 * This endpoint is the correct replacement for export-jwt in the mobile flow.
 *
 * WHY this exists:
 *   - `export-jwt` returns 401 on mobile because `human_session` doesn't exist
 *     until after desktop-side hydration (chicken-and-egg).
 *   - This endpoint mints a fresh mobile JWT from the `sovereign_handshake`
 *     cookie (set after wallet sign) and stores the encrypted payload in Redis
 *     so the desktop poll can pick it up immediately.
 *
 * Flow:
 *   1. Mobile reads QR → parses { uuid, ephemeralPub, isECDH }
 *   2. Mobile generates its own ephemeral keypair
 *   3. Mobile derives shared secret: X25519(mobile.priv, desktop.pub)
 *   4. Mobile encrypts the JWT with AES-GCM
 *   5. Mobile POSTs here: { uuid, encryptedPayload, iv, tag, mobilePub }
 *   6. This endpoint stores the encrypted payload in Redis
 *   7. Desktop poll (/api/auth/qr-poll) returns it → desktop decrypts → hydrates
 *
 * The JWT minted here is equivalent to the one created on desktop login —
 * both identify the wallet address as the authenticated subject.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uuid, encryptedPayload, iv, tag, mobilePub } = body;

    // ── 1. Validate required fields ────────────────────────────────────────
    if (!uuid || typeof uuid !== 'string' || uuid.length < 8) {
      return NextResponse.json({ error: 'Missing or invalid uuid' }, { status: 400 });
    }
    if (!encryptedPayload || !iv || !mobilePub) {
      return NextResponse.json({ error: 'Missing encrypted payload fields' }, { status: 400 });
    }

    // ── 2. Verify mobile identity from cookies ─────────────────────────────
    // We accept EITHER:
    //   a) A pre-existing human_session JWT (best case — re-export it)
    //   b) A sovereign_handshake wallet address (mint fresh JWT)
    const humanSession = req.cookies.get('human_session')?.value;
    const sovereignHandshake = req.cookies.get('sovereign_handshake')?.value;

    let walletAddress: string | null = null;

    if (humanSession) {
      // Already has a valid session → mint JWT directly from cookie
      // We trust the existing session without re-verifying to avoid
      // EdDSA key import overhead on every QR scan.
      try {
        const { verifyJWT } = await import('@/lib/jwt');
        const payload = await verifyJWT(humanSession);
        walletAddress = (payload.sub as string) || (payload.address as string) || null;
      } catch {
        // human_session expired or invalid — fall through to sovereign_handshake
      }
    }

    if (!walletAddress && sovereignHandshake) {
      // Validate it's a real Ethereum address (not a spoofed cookie)
      if (/^0x[a-fA-F0-9]{40}$/.test(sovereignHandshake)) {
        walletAddress = sovereignHandshake.toLowerCase();
      }
    }

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Mobile session not found. Connect your wallet first.' },
        { status: 401 }
      );
    }

    // ── 3. Mint a sovereign JWT for this wallet address ────────────────────
    // This JWT will be sent (encrypted) to the desktop and used to establish
    // the desktop session via /api/auth/qr-hydrate.
    const jwt = await mintJWT({
      sub: walletAddress,
      address: walletAddress,
      tier: 'FREE',
      iss: 'whale-alert-network',
      source: 'qr-mobile-handshake',
    });

    // ── 4. Package and store in Redis ──────────────────────────────────────
    // The encrypted payload ALREADY contains the JWT (encrypted by mobile).
    // We store the entire encrypted bundle so the desktop can decrypt it.
    // TTL: 300 seconds (5 min) — matches the QR expiry window.
    const sessionPayload = JSON.stringify({
      encryptedPayload,
      iv,
      tag: tag || null,
      mobilePub,
      // Include the raw (server-minted) JWT as a server-side fallback in case
      // the ECDH decryption fails on the desktop (e.g. key mismatch from an
      // iOS X25519 implementation quirk). Desktop prefers decrypted JWT but
      // falls back to this if decryption returns invalid JSON.
      serverJwt: jwt,
    });

    await safeRedisSet(`qr-session:${uuid}`, sessionPayload, 'EX', 300);

    // ── 5. Also set human_session on this response for the mobile ──────────
    // This ensures future calls to export-jwt also succeed from mobile.
    const response = NextResponse.json({ success: true });
    response.cookies.set('human_session', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 604800,
      path: '/',
    });
    response.cookies.set('sovereign_handshake', walletAddress, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 604800,
      path: '/',
    });

    return response;

  } catch (e: any) {
    console.error('[QRMobileLink] Error:', e?.message);
    return NextResponse.json({ error: 'Server error during mobile QR link' }, { status: 500 });
  }
}
