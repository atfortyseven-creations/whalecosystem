import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log("Seeding base Sovereign Forum categories...");
        
        const categories = [
            { name: "Announcements", slug: "announcements", description: "Official protocol updates", color: "#2D0A59", orderIndex: 1 },
            { name: "General", slug: "general", description: "General discussions", color: "#3B82F6", orderIndex: 2 },
            { name: "Aztec", slug: "aztec", description: "Zero Knowledge research", color: "#10B981", orderIndex: 3 },
            { name: "Noir", slug: "noir", description: "Noir smart contracts", color: "#000000", orderIndex: 4 },
            { name: "Site Feedback", slug: "site-feedback", description: "Meta discussion about the forum", color: "#6B7280", orderIndex: 5 },
            { name: "DeFi Yields", slug: "defi-yields", description: "Execution layer intents", color: "#EAB308", orderIndex: 6 }
        ];

        for (const cat of categories) {
            await (prisma as any).forumCategory.upsert({
                where: { slug: cat.slug },
                update: { ...cat },
                create: { ...cat }
            });
        }
        
        return NextResponse.json({
            success: true,
            message: "Categories seeded successfully."
        });
    } catch (e: any) {
        console.error("Failed to seed categories:", e);
        return NextResponse.json({
            success: false,
            message: "Failed to seed categories",
            error: e.message
        }, { status: 500 });
    }
}
