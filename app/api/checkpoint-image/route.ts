/**
 * checkpoint-image API — Institutional Asset Serving
 * ═══════════════════════════════════════════════════
 * Serves high-fidelity 4K pattern assets from the local filesystem.
 * Priority search order:
 *   1. public/CHECKPOINT/  (original location)
 *   2. Downloads/           (PhotoGrid 4K assets: patron-cosmico-4k, olas-hokusai-4k)
 *   3. public/              (any file in Next.js public dir)
 *
 * This avoids committing 13MB 4K PNGs to the git repo while Railway
 * can serve them via Next.js rewrites pointing to the CDN-hosted copies.
 */

import { readFileSync, existsSync } from "fs";
import { NextResponse } from "next/server";
import path from "path";

// ── Asset alias map ──────────────────────────────────────────────────────────
// Maps clean semantic names → actual filesystem paths (absolute, cross-platform)
const ASSET_ALIAS: Record<string, string[]> = {
  // Main repeating pattern (image 2) — gray ukiyo-e waves
  "patron-cosmico-4k.png": [
    path.join(process.cwd(), "public", "patron-cosmico-4k.png"),
  ],
  // Downpage Hokusai waves (image 4) — blue waves
  "olas-hokusai-4k.png": [
    path.join(process.cwd(), "public", "olas-hokusai-4k.png"),
  ],
};

// Fallback CHECKPOINT folder for legacy references (nuevo-patron-cosmico.jpg etc.)
const CHECKPOINT_DIR = path.join(process.cwd(), "public", "CHECKPOINT");
const PUBLIC_DIR     = path.join(process.cwd(), "public");
const DOWNLOADS_DIR  = "C:/Users/admin/Downloads";

function detectMime(filePath: string): string {
  const ext = filePath.toLowerCase();
  if (ext.endsWith(".png"))  return "image/png";
  if (ext.endsWith(".webp")) return "image/webp";
  if (ext.endsWith(".gif"))  return "image/gif";
  return "image/jpeg"; // jpg / jpeg fallback
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name || name.includes("..")) {
    return new NextResponse("Missing or invalid name", { status: 400 });
  }

  // 1️⃣ Check alias map first
  const aliasPaths = ASSET_ALIAS[name];
  if (aliasPaths) {
    for (const candidate of aliasPaths) {
      if (existsSync(candidate)) {
        const buf = readFileSync(candidate);
        return new NextResponse(buf, {
          headers: {
            "Content-Type": detectMime(candidate),
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    }
  }

  // 2️⃣ Fallback search order: CHECKPOINT → public → Downloads
  const candidates = [
    path.join(CHECKPOINT_DIR, name),
    path.join(PUBLIC_DIR, name),
    path.join(DOWNLOADS_DIR, name),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      try {
        const buf = readFileSync(candidate);
        return new NextResponse(buf, {
          headers: {
            "Content-Type": detectMime(candidate),
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      } catch {
        continue;
      }
    }
  }

  return new NextResponse("Not Found", { status: 404 });
}
