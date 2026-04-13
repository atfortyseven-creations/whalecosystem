#!/bin/sh
set -e

echo "🚀 [Start] Initializing Sovereign Infrastructure..."

# 1. Database Alignment
npx prisma generate
npx prisma migrate deploy

# 2. Total Process Orchestration
# We move away from fragile shell backgrounding (&) to PM2-runtime.
# Direct path used to ensure zero-dependency on global binaries.
exec ./node_modules/.bin/pm2-runtime start ecosystem.config.json

