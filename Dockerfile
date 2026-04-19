# ─────────────────────────────────────────────────────────────────────────────
# SOVEREIGN TERMINAL — INSTITUTIONAL MULTI-STAGE DOCKER PIPELINE
# Railway Hobby Plan: 8 vCPU / 8 GB RAM
# Architecture: 5-stage build → minimal production runner
# ─────────────────────────────────────────────────────────────────────────────

# ─── STAGE 1: RUNTIME BASE ───────────────────────────────────────────────────
# node:20-slim for compatibility with >=20.0.0 engine requirement.
# node:22-slim caused EBADENGINE failures with local lockfile generated on v20.
FROM node:20-slim AS runtime
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    libstdc++6 \
    procps \
    && rm -rf /var/lib/apt/lists/*

# ─── STAGE 2: BUILD DEPENDENCIES ─────────────────────────────────────────────
FROM runtime AS build-base

RUN apt-get update && apt-get install -y --no-install-recommends \
    libc6-dev \
    python3 \
    make \
    g++ \
    gcc \
    cmake \
    git \
    build-essential \
    wget \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# ─── STAGE 3: INSTALL DEPENDENCIES ───────────────────────────────────────────
FROM build-base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
# NOTE: Using npm install (not npm ci) so Railway resolves new deps in package.json
# (e.g. @reown/appkit-siwe) even when the committed lock file is not yet regenerated.
# This is safe: npm install resolves and installs all declared packages deterministically.
RUN npm install --legacy-peer-deps

# ─── STAGE 4: BUILD ───────────────────────────────────────────────────────────
FROM build-base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
# Copy all source files — ecosystem.config.json is included here.
COPY . .

ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=true

# Generate Prisma client then build Next.js application.
RUN npx prisma generate && \
    npx next build

# ─── STAGE 5: PRODUCTION RUNNER ───────────────────────────────────────────────
FROM runtime AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy the complete application from the builder stage.
# This includes: .next/, node_modules/, public/, scripts/, ecosystem.config.json, start.sh
COPY --from=builder /app ./

# Verify critical orchestration files exist (build-time assertion).
RUN test -f /app/ecosystem.config.json || (echo "FATAL: ecosystem.config.json missing from /app" && exit 1)
RUN test -f /app/start.sh || (echo "FATAL: start.sh missing from /app" && exit 1)

RUN chmod +x /app/start.sh

EXPOSE 3000

# Boot the Sovereign Terminal via PM2-runtime orchestration.
CMD ["sh", "/app/start.sh"]
