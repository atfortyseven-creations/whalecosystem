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
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check for Railway / Kubernetes
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
