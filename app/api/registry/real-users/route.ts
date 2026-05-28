import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const revalidate = 0;

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date("2024-02-01T00:00:00Z"),
        },
      },
      select: {
        walletAddress: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      { users, total: users.length },
      {
        headers: {
          "Cache-Control": "no-store, no-cache",
        },
      }
    );
  } catch (err: any) {
    console.error("[registry-real-users] Error:", err?.message);
    return NextResponse.json({ users: [], total: 0 }, { status: 200 });
  }
}
