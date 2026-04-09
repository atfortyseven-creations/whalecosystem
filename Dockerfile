# ─── Unified Sovereign Production Environment ────────────────────────────────
FROM node:22-alpine
WORKDIR /app

# Install OS deps for native modules (sharp, canvas, openssl for Prisma)
RUN apk add --no-cache libc6-compat openssl python3 make g++

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# Build-time env flags:
ENV NODE_OPTIONS="--max-old-space-size=8192"
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=true

# Compile Next.js UI (leaves node_modules intact for our external workers)
RUN npm run build

# Runtime configuration
ENV NODE_ENV=production
EXPOSE 3000

# Health check for Railway / Kubernetes
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

# Launch Sequence: Sync Database (soft fail) -> Start Web UI & P2P Mesh & Solana Workers
CMD ["sh", "-c", "npx prisma db push --accept-data-loss || true; npm start"]
