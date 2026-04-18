import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Lottie file server — resolves files from multiple locations in priority order:
 *  1. public/lotties/  (bundled with build — works on Railway / any server)
 *  2. <project_root>/lotties/  (alternative committed location)
 *  3. C:/Users/admin/Desktop/lottifile  (local dev desktop — Windows only)
 *
 * To make lotties available on Railway: copy the .json files into /public/lotties/
 * before deploying, OR commit them to /lotties/ in the project root.
 */
function resolveLottiePath(safeFilename: string): string | null {
  const candidates = [
    // 1. Public bundle — works everywhere
    join(process.cwd(), 'public', 'lotties', safeFilename),
    // 2. Project root /lotties/ (gitignored large files)
    join(process.cwd(), 'lotties', safeFilename),
    // 3. Local dev desktop (Windows only)
    join('C:', 'Users', 'admin', 'Desktop', 'lottifile', safeFilename),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('file');

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    // Sanitize: strip any directory traversal, keep only the filename
    const safeFilename = filename.replace(/\\/g, '/').split('/').pop() || '';
    if (!safeFilename.endsWith('.json')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const filePath = resolveLottiePath(safeFilename);

    if (!filePath) {
      console.error('[LOTTIE] File not found in any search path:', safeFilename);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const data = readFileSync(filePath, 'utf-8');
    const json = JSON.parse(data);

    return NextResponse.json(json, {
      headers: {
        // Cache aggressively — lottie files never change at runtime
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('[LOTTIE] Load Error:', error);
    return NextResponse.json({ error: 'Failed to process Lottie file' }, { status: 500 });
  }
}
