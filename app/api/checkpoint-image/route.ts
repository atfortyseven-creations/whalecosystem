import { readFileSync } from "fs";
import { NextResponse } from "next/server";
import path from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  
  if (!name) return new NextResponse("Missing name", { status: 400 });

  try {
    const filePath = path.join("C:/Users/admin/.gemini/antigravity/scratch/Wallet Human Polymarket ID/public/CHECKPOINT", name);
    const fileBuffer = readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": name.endsWith(".png") ? "image/png" : "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch (error) {
    return new NextResponse("Not Found", { status: 404 });
  }
}
