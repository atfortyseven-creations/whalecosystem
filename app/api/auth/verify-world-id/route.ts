import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWorldIDProof } from "@/lib/worldid";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

// JWT_SECRET is validated at request time (inside the handler), not at module
// initialisation, so that `next build` can compile this route without the
// variable being present in the build environment.

export async function POST(request: NextRequest) {
    // Guard: fail fast at request time if the secret is missing.
    // Never use a known fallback — that would allow anyone with the source code to forge tokens.
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('[FATAL] JWT_SECRET is not set. World ID verification endpoint is misconfigured.');
        return NextResponse.json(
            { error: 'Server misconfiguration: authentication secret is not configured.', verified: false },
            { status: 500 }
        );
    }

    try {
        const body = await request.json();
        const { proof, walletAddress } = body;

        // 1. Validar input básico
        if (!proof || !proof.nullifier_hash) {
            return NextResponse.json(
                { error: "Missing proof data", verified: false },
                { status: 400 }
            );
        }

        // 2. Verificar la prueba con Worldcoin
        // IMPORTANTE: Estos deben coincidir EXACTAMENTE con el frontend
        const app_id = process.env.NEXT_PUBLIC_WLD_APP_ID || process.env.WLD_APP_ID || "app_affe7470221b57a8edee20b3ac30c484";
        const action = "polymarket-wallet";

        console.log("🛡️ [CORE] Verifying World ID Proof:", { app_id, action });

        const verifyRes = await verifyWorldIDProof(
            {
                proof: proof.proof,
                merkle_root: proof.merkle_root,
                nullifier_hash: proof.nullifier_hash,
                verification_level: proof.verification_level,
            },
            app_id,
            action
        );

        if (!verifyRes.success) {
            console.error("❌ [CORE] World ID API Rejected Proof:", verifyRes);
            return NextResponse.json(
                { 
                    error: "Prueba de World ID inválida", 
                    detail: verifyRes.detail,
                    verified: false 
                },
                { status: 401 }
            );
        }

        const nullifierHash = proof.nullifier_hash;

        // 3. Persistencia en Base de Datos (Aquí es donde puede fallar si no hay db push)
        let user;
        try {
            user = await prisma.user.findUnique({
                where: { worldIdNullifierHash: nullifierHash },
            });

            if (!user) {
                if (walletAddress && walletAddress !== "0x...") {
                    const existingUserByWallet = await prisma.user.findUnique({
                        where: { walletAddress: walletAddress.toLowerCase() },
                    });

                    if (existingUserByWallet) {
                        if (existingUserByWallet.worldIdNullifierHash && existingUserByWallet.worldIdNullifierHash !== nullifierHash) {
                            return NextResponse.json(
                                { error: "Este wallet ya está vinculado a otro World ID", verified: false },
                                { status: 409 }
                            );
                        }

                        user = await prisma.user.update({
                            where: { walletAddress: walletAddress.toLowerCase() },
                            data: { worldIdNullifierHash: nullifierHash, tier: 'HUMAN' },
                        });
                    } else {
                        user = await prisma.user.create({
                            data: {
                                walletAddress: walletAddress.toLowerCase(),
                                worldIdNullifierHash: nullifierHash,
                                tier: 'HUMAN'
                            },
                        });
                    }
                } else {
                    // Si no hay wallet, crear un usuario temporal basado en el nullifier
                    const tempWalletAddress = `wld_${nullifierHash.slice(0, 20)}`.toLowerCase();
                    user = await prisma.user.upsert({
                        where: { worldIdNullifierHash: nullifierHash },
                        update: { lastActive: new Date() },
                        create: {
                            walletAddress: tempWalletAddress,
                            worldIdNullifierHash: nullifierHash,
                            tier: 'HUMAN'
                        }
                    });
                }
            } else {
                // Usuario ya existe, actualizar actividad
                user = await prisma.user.update({
                    where: { walletAddress: user.walletAddress },
                    data: { lastActive: new Date(), tier: 'HUMAN' }
                });
            }
        } catch (dbError: any) {
            console.error("🚨 [DATABASE-ERROR] Critical failure during World ID persistence:", dbError);
            return NextResponse.json({
                error: "Error de Base de Datos",
                detail: "La base de datos no está sincronizada. ¿Has ejecutado 'npx prisma db push'?",
                verified: false,
                code: dbError.code
            }, { status: 500 });
        }

        // 4. Generar Sesión y JWT
        const sessionToken = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

        try {
            await prisma.session.create({
                data: {
                    userId: user.walletAddress,
                    sessionToken,
                    expiresAt,
                    ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                }
            });
        } catch (sessionError) {
            console.warn("⚠️ [SESSION-WARNING] Could not create DB session, but proceeding with JWT:", sessionError);
        }

        const token = await new SignJWT({
            sub: user.walletAddress,
            nullifier: user.worldIdNullifierHash,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(new TextEncoder().encode(jwtSecret));

        const cookieStore = await cookies();
        cookieStore.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'lax',
            path: "/",
            maxAge: 60 * 60 * 24 // 24h
        });

        return NextResponse.json({
            success: true,
            verified: true,
            user: {
                address: user.walletAddress,
                tier: user.tier
            }
        });

    } catch (error: any) {
        console.error("💀 [FATAL-ERROR] World ID Verification Route crashed:", error);
        return NextResponse.json(
            { error: "Internal Server Error", detail: error.message, verified: false },
            { status: 500 }
        );
    }
}

