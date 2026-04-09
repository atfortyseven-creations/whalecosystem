# ─── Stage 1: Builder ───────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Install OS deps for native modules (sharp, canvas, openssl for Prisma)
RUN apk add --no-cache libc6-compat openssl python3 make g++

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# Build-time env flags:
#   NEXT_TELEMETRY_DISABLED=1 — no telemetry pings
#   SKIP_ENV_VALIDATION=true  — skip runtime-only env validation (DATABASE_URL etc.)
#   NODE_OPTIONS               — allow large bundle memory
# prisma generate is called INSIDE npm run build — no separate step needed.
ENV NODE_OPTIONS="--max-old-space-size=8192"
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=true

RUN npm run build

# ─── Stage 2: Production Runner ─────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Security: run as non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only what's needed at runtime
# Copy standalone build + full source for workers and scripts
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/lib ./lib
COPY --from=builder --chown=nextjs:nodejs /app/services ./services
COPY --from=builder --chown=nextjs:nodejs /app/models ./models
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Ensure prisma client and tsx are available for workers
COPY --from=builder /app/node_modules ./node_modules
# (Optional) If node_modules is too big, copy only specific ones, 
# but for maximum perfection/precision, we need the workers to have their deps.

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check for Railway / Kubernetes
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

# Start the Titanium Cluster (managed by production-cluster.ts)
# This script spawns Next.js Standalone + the Whale Indexer + AVS Nodes.
CMD ["npm", "start"]
