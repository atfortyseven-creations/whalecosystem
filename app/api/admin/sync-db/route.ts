import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        console.log("Forcing Prisma DB Push on Railway Production...");
        
        // Ejecutar el comando para empujar el esquema de Prisma
        const output = execSync('npx prisma db push --accept-data-loss', { encoding: 'utf-8' });
        
        return NextResponse.json({
            success: true,
            message: "Database schema synchronized successfully on production.",
            output: output
        });
    } catch (e: any) {
        console.error("Failed to sync DB:", e);
        return NextResponse.json({
            success: false,
            message: "Failed to push schema",
            error: e.message,
            stderr: e.stderr ? e.stderr.toString() : null
        }, { status: 500 });
    }
}
