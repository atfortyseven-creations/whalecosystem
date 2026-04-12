# ─── SOVEREIGN MULTI-STAGE DOCKER PIPELINE ──────────────────────────────────
# Railway Hobby Plan: 8 vCPU / 8 GB RAM

# ─── STAGE 1: RUNTIME BASE ──────────────────────────────────────────────────
FROM node:22-slim AS runtime
WORKDIR /app

# Only install mandatory runtime dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

# ─── STAGE 2: BUILD DEPENDENCIES ─────────────────────────────────────────────
FROM runtime AS build-base

# Install build dependencies for native modules (libp2p/webrtc/sharp)
RUN apt-get update && apt-get install -y \
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

# ─── STAGE 3: INSTALL DEPENDENCIES ──────────────────────────────────────────
FROM build-base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# ─── STAGE 4: BUILD ──────────────────────────────────────────────────────────
FROM build-base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=true

# Generate Prisma client then compile Next.js
RUN npx prisma generate && \
    npx next build

# ─── STAGE 5: PRODUCTION RUNNER ──────────────────────────────────────────────
FROM runtime AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy the entire build and node_modules from builder
# Note: node_modules contains the compiled native binaries
COPY --from=builder /app ./

RUN chmod +x ./start.sh

EXPOSE 3000

# Boot the Next.js server AND background workers via start.sh
CMD ["sh", "./start.sh"]

