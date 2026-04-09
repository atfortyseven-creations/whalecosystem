// [CRITICAL] This route must NEVER import external services (Prisma, Redis, MongoDB, etc.)
// Railway healthcheck polls this every 10s using wget with a minimal User-Agent.
// Any import crash here = deployment fails = "1/1 replicas never became healthy"

// Force Node.js runtime — Edge runtime lacks process.uptime()
export const runtime = 'nodejs';

// No caching — Railway needs a fresh response on every poll
export const dynamic = 'force-dynamic';

export async function GET() {
  // Return 200 immediately. No DB ping, no Redis ping, no external calls.
  // Those checks belong in /api/health/deep — not here.
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV || 'unknown',
    version: process.env.npm_package_version || '3.0.0',
  }, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Type': 'application/json',
    }
  });
}

