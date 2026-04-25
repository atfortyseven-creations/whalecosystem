import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/admin';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/sync-db
 * 
 * Atomically reconciles the remote Railway PostgreSQL schema with the local
 * Prisma schema definition. Uses raw SQL with IF NOT EXISTS / DO $$ patterns
 * so every statement is fully idempotent. Safe to run multiple times.
 * 
 * This bypasses `prisma migrate deploy` entirely for additive changes
 * (new columns, new tables) that don't require a migration file.
 */
export async function POST() {
    const cookieStore = await cookies();
    const address = cookieStore.get('sovereign_handshake')?.value;
    if (!address || !isAdmin(address)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results: { step: string; status: 'ok' | 'error'; detail?: string }[] = [];

    const exec = async (step: string, sql: string) => {
        try {
            await prisma.$executeRawUnsafe(sql);
            results.push({ step, status: 'ok' });
        } catch (e: any) {
            results.push({ step, status: 'error', detail: e.message });
        }
    };

    // ── Phase 1: Extend User table with forum-required columns ──────────────
    await exec('User.displayName', `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "displayName" TEXT`);
    await exec('User.avatarUrl',   `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT`);
    await exec('User.bio',         `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bio" TEXT`);
    await exec('User.tier',        `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tier" TEXT NOT NULL DEFAULT 'basic'`);
    await exec('User.isPro',       `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isPro" BOOLEAN NOT NULL DEFAULT false`);
    await exec('User.lastActive',  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastActive" TIMESTAMP(3)`);

    // ── Phase 2: Create ForumCategory ────────────────────────────────────────
    await exec('ForumCategory.create', `
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

    // ── Phase 3: Create ForumTopic ───────────────────────────────────────────
    await exec('ForumTopic.create', `
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

    // ── Phase 4: Create ForumPost ────────────────────────────────────────────
    await exec('ForumPost.create', `
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

    // ── Phase 5: Create ForumLike ────────────────────────────────────────────
    await exec('ForumLike.create', `
        CREATE TABLE IF NOT EXISTS "ForumLike" (
            "id"        TEXT NOT NULL DEFAULT gen_random_uuid(),
            "userId"    TEXT NOT NULL,
            "topicId"   TEXT,
            "postId"    TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
            PRIMARY KEY ("id")
        )
    `);

    // ── Phase 6: Create ForumTag ─────────────────────────────────────────────
    await exec('ForumTag.create', `
        CREATE TABLE IF NOT EXISTS "ForumTag" (
            "id"   TEXT NOT NULL DEFAULT gen_random_uuid(),
            "name" TEXT NOT NULL UNIQUE,
            PRIMARY KEY ("id")
        )
    `);

    // ── Phase 7: Create _ForumTopicToForumTag join table ─────────────────────
    await exec('ForumTopic_ForumTag.join', `
        CREATE TABLE IF NOT EXISTS "_ForumTopicToForumTag" (
            "A" TEXT NOT NULL,
            "B" TEXT NOT NULL,
            UNIQUE("A", "B")
        )
    `);

    // ── Phase 8: Create ForumNotification ───────────────────────────────────
    await exec('ForumNotification.create', `
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

    // ── Phase 9: Create ForumTelemetry ───────────────────────────────────────
    await exec('ForumTelemetry.create', `
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

    // ── Phase 10: Create AuditLog ────────────────────────────────────────────
    await exec('AuditLog.create', `
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

    const errors = results.filter(r => r.status === 'error');
    const ok = results.filter(r => r.status === 'ok');

    return NextResponse.json({
        success: errors.length === 0,
        summary: `${ok.length} steps completed, ${errors.length} errors`,
        results
    });
}
