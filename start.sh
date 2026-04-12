#!/bin/sh
set -e

echo "🚀 [Start] Initializing Sovereign Infrastructure..."

# 1. Database Alignment
npx prisma generate
npx prisma migrate deploy

# 2. Total Process Orchestration
# We use start:all which is defined in package.json to run:
# next start + gateway + scanner + alerts + solana + mesh
exec npm run start:all

