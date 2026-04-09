# ─── SOVEREIGN MULTI-STAGE DOCKER PIPELINE ──────────────────────────────────
# Railway Hobby Plan: 8 vCPU / 8 GB RAM — Optimized absolutely.
# Stage 1 → Install deps  (cached layer, rarely invalidated)
# Stage 2 → Compile Next.js Standalone bundle  (4 GB RAM cap)
# Stage 3 → Minimal runner  (no devDeps, no build tools, ~200 MB final image)

# ─── BASE IMAGE ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS base

# OS libraries required by Prisma binary engine, sharp (image), and native addons
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    python3 \
    make \
    g++ \
    wget

# ─── STAGE 1: INSTALL DEPENDENCIES ──────────────────────────────────────────
FROM base AS deps
WORKDIR /app

# Only copy manifests first — invalidates cache only when deps change
COPY package.json package-lock.json ./

# Install all deps (dev+prod) needed to compile Next.js
RUN npm ci --legacy-peer-deps

# ─── STAGE 2: BUILD ──────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

# Pull installed modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source (dockerignore eliminates scripts, k8s, contracts, etc.)
COPY . .

# Safety: disable Next.js telemetry and enforce memory ceiling for Railway
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=true

# Generate Prisma client then compile Next.js standalone bundle
RUN npx prisma generate && \
    npx next build

# ─── STAGE 3: PRODUCTION RUNNER ──────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# CRITICAL: Next.js standalone server binds to HOSTNAME — must be 0.0.0.0 for Railway
ENV HOSTNAME="0.0.0.0"
ENV NODE_OPTIONS="--max-old-space-size=350"

# Next.js standalone bundles its own minimal node_modules internally.
# We only need to copy three artifacts from the builder — nothing else.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static     ./.next/static
COPY --from=builder /app/public           ./public

# Prisma: schema + generated client needed at runtime for db access
COPY --from=builder /app/prisma           ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000

# Liveness probe — Railway polls this every 30s
# start-period: 90s grace period before Railway starts counting failures.
# This handles cold-start with 2372 packages + Prisma + Next.js standalone init.
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=5 \
    CMD wget -qO- http://127.0.0.1:${PORT:-3000}/api/health || exit 1

# Boot the Next.js standalone server
# HOSTNAME=0.0.0.0 ensures the server listens on all interfaces (Railway requirement)
CMD ["node", "server.js"]
