import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sumsubProvider } from '@/lib/identity/sumsub-provider';
import { encryptionService } from '@/lib/security/encryption';

/**
 * WEBHOOK: Sumsub Identity Verification
 * 
 * Receives real-time updates on applicant status.
 * Updates the database and grants/revokes access.
 */
export async function POST(req: NextRequest) {
    try {
        const signature = req.headers.get('x-payload-digest');
        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
        }

        const rawBody = await req.text();
        
        // 1. Verify Webhook Signature (Security Critical)
        if (!sumsubProvider.verifyWebhookSignature(rawBody, signature)) {
            console.error('[Webhook] Invalid signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const payload = JSON.parse(rawBody);
        const { applicantId, reviewStatus, reviewResult } = payload;
        const externalUserId = payload.externalUserId; // Currently mapped to userId

        console.log(`[Webhook] Processing update for ${externalUserId}: ${reviewStatus}`);

        // 2. Map Status to our Enum
        let kycStatus = 'PENDING';
        let rejectionReason = null;

        if (reviewStatus === 'completed') {
            if (reviewResult?.reviewAnswer === 'GREEN') {
                kycStatus = 'VERIFIED';
            } else {
                kycStatus = 'REJECTED';
                rejectionReason = reviewResult?.rejectLabels?.join(', ');
            }
        } else if (reviewStatus === 'pending') {
            kycStatus = 'IN_REVIEW';
        }

        // 3. Update Database (with Encryption for PII)
        // In a real scenario, we'd fetch document data securely from Sumsub API here
        // For webhook, we just store the status update
        
        await prisma.kYCRecord.upsert({
            where: { userId: externalUserId },
            create: {
                userId: externalUserId,
                applicantId,
                status: kycStatus as any,
                riskLevel: reviewResult?.reviewAnswer === 'GREEN' ? 'LOW' : 'HIGH',
                rejectionReason,
                submittedAt: new Date(),
                verifiedAt: kycStatus === 'VERIFIED' ? new Date() : null,
                // We encrypt sensitive fields when we fetch them details
                documentType: encryptionService.encrypt('PASSPORT'), 
            },
            update: {
                status: kycStatus as any,
                riskLevel: reviewResult?.reviewAnswer === 'GREEN' ? 'LOW' : 'HIGH',
                rejectionReason,
                verifiedAt: kycStatus === 'VERIFIED' ? new Date() : null,
            }
        });

        // 4. Update User Role / Access Level
        if (kycStatus === 'VERIFIED') {
            await prisma.user.update({
                where: { walletAddress: externalUserId }, // Ensure this mapping is correct
                data: { tier: 'VERIFIED' as any } // KYC-verified tier upgrade
            });
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error('[Webhook] Processing failed', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

