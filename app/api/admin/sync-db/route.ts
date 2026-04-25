import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/admin';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * Shared migration executor — runs all idempotent ALTER TABLE / CREATE TABLE statements.
 * Safe to call multiple times. Tolerates partial failures.
 */
async function runMigrations() {
    const results: { step: string; status: 'ok' | 'skip'; detail?: string }[] = [];

    const exec = async (step: string, sql: string) => {
        try {
            await prisma.$executeRawUnsafe(sql);
            results.push({ step, status: 'ok' });
        } catch (e: any) {
            // "already exists" errors are OK — just mark as skip
            results.push({ step, status: 'skip', detail: e.message?.slice(0, 120) });
        }
    };

    // ── Phase 1: Extend User table ──────────────────────────────────────────
    await exec('User.displayName', `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "displayName" TEXT`);
    await exec('User.avatarUrl',   `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT`);
    await exec('User.bio',         `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bio" TEXT`);
    await exec('User.tier',        `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tier" TEXT NOT NULL DEFAULT 'basic'`);
    await exec('User.isPro',       `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isPro" BOOLEAN NOT NULL DEFAULT false`);
    await exec('User.lastActive',  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastActive" TIMESTAMP(3)`);

    // ── Phase 2: ForumCategory ────────────────────────────────────────────
    await exec('ForumCategory', `
        CREATE TABLE IF NOT EXISTS "ForumCategory" (
            "id"          TEXT NOT NULL DEFAULT gen_random_uuid(),
            "name"        TEXT NOT NULL,
            "slug"        TEXT NOT NULL UNIQUE,
            "description" TEXT,
            "color"       TEXT NOT NULL DEFAULT '#2D0A59',
            "orderIndex"  INTEGER NOT NULL DEFAULT 0,
            "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT NOW(),
            "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT NOW(),
            PRIMARY KEY ("id")
        )
    `);

    // ── Phase 3: ForumTopic ───────────────────────────────────────────────
    await exec('ForumTopic', `
        CREATE TABLE IF NOT EXISTS "ForumTopic" (
            "id"          TEXT NOT NULL DEFAULT gen_random_uuid(),
            "title"       TEXT NOT NULL,
            "content"     TEXT NOT NULL,
            "authorId"    TEXT NOT NULL,
            "categoryId"  TEXT NOT NULL,
            "isPinned"    BOOLEAN NOT NULL DEFAULT false,
            "isLocked"    BOOLEAN NOT NULL DEFAULT false,
            "isSolved"    BOOLEAN NOT NULL DEFAULT false,
            "views"       INTEGER NOT NULL DEFAULT 0,
            "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT NOW(),
            "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT NOW(),
            PRIMARY KEY ("id")
        )
    `);

    // ── Phase 4: ForumPost ────────────────────────────────────────────────
    await exec('ForumPost', `
        CREATE TABLE IF NOT EXISTS "ForumPost" (
            "id"          TEXT NOT NULL DEFAULT gen_random_uuid(),
            "content"     TEXT NOT NULL,
            "authorId"    TEXT NOT NULL,
            "topicId"     TEXT NOT NULL,
            "replyToId"   TEXT,
            "isSolution"  BOOLEAN NOT NULL DEFAULT false,
            "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT NOW(),
            "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT NOW(),
            PRIMARY KEY ("id")
        )
    `);

    // ── Phase 5: ForumLike ────────────────────────────────────────────────
    await exec('ForumLike', `
        CREATE TABLE IF NOT EXISTS "ForumLike" (
            "id"        TEXT NOT NULL DEFAULT gen_random_uuid(),
            "userId"    TEXT NOT NULL,
            "topicId"   TEXT,
            "postId"    TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
            PRIMARY KEY ("id")
        )
    `);

    // ── Phase 6: ForumTag ─────────────────────────────────────────────────
    await exec('ForumTag', `
        CREATE TABLE IF NOT EXISTS "ForumTag" (
            "id"   TEXT NOT NULL DEFAULT gen_random_uuid(),
            "name" TEXT NOT NULL UNIQUE,
            PRIMARY KEY ("id")
        )
    `);

    // ── Phase 7: ForumTopic-ForumTag join ─────────────────────────────────
    await exec('ForumTopicTag.join', `
        CREATE TABLE IF NOT EXISTS "_ForumTopicToForumTag" (
            "A" TEXT NOT NULL,
            "B" TEXT NOT NULL,
            UNIQUE("A", "B")
        )
    `);

    // ── Phase 8: ForumNotification ───────────────────────────────────────
    await exec('ForumNotification', `
        CREATE TABLE IF NOT EXISTS "ForumNotification" (
            "id"        TEXT NOT NULL DEFAULT gen_random_uuid(),
            "userId"    TEXT NOT NULL,
            "type"      TEXT NOT NULL DEFAULT 'REPLY',
            "actorId"   TEXT,
            "topicId"   TEXT,
            "postId"    TEXT,
            "isRead"    BOOLEAN NOT NULL DEFAULT false,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
            PRIMARY KEY ("id")
        )
    `);

    // ── Phase 9: ForumTelemetry ───────────────────────────────────────────
    await exec('ForumTelemetry', `
        CREATE TABLE IF NOT EXISTS "ForumTelemetry" (
            "id"        TEXT NOT NULL DEFAULT gen_random_uuid(),
            "userId"    TEXT,
            "action"    TEXT NOT NULL,
            "ipAddress" TEXT,
            "metadata"  JSONB,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
            PRIMARY KEY ("id")
        )
    `);

    // ── Phase 10: AuditLog ────────────────────────────────────────────────
    await exec('AuditLog', `
        CREATE TABLE IF NOT EXISTS "AuditLog" (
            "id"         TEXT NOT NULL DEFAULT gen_random_uuid(),
            "userId"     TEXT NOT NULL,
            "action"     TEXT NOT NULL,
            "resource"   TEXT NOT NULL,
            "metadata"   JSONB,
            "ipAddress"  TEXT,
            "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT NOW(),
            PRIMARY KEY ("id")
        )
    `);

    return results;
}

/**
 * GET /api/admin/sync-db
 * Open endpoint — auto-runs on every Railway deploy via start.sh or manual trigger.
 * No auth required so it can be called in CI/CD pipelines.
 */
export async function GET() {
    try {
        const results = await runMigrations();
        const errors = results.filter(r => r.detail && !r.detail.includes('already exists'));
        return NextResponse.json({
            success: true,
            summary: `${results.filter(r => r.status === 'ok').length} applied, ${results.filter(r => r.status === 'skip').length} skipped`,
            results
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

/**
 * POST /api/admin/sync-db
 * Admin-only variant (same logic, auth-gated).
 */
export async function POST() {
    const cookieStore = await cookies();
    const address = cookieStore.get('sovereign_handshake')?.value;
    if (!address || !isAdmin(address)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const results = await runMigrations();
        return NextResponse.json({
            success: true,
            summary: `${results.filter(r => r.status === 'ok').length} applied, ${results.filter(r => r.status === 'skip').length} skipped`,
            results
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
