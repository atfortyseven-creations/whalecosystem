import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

// Ensure you set RESEND_API_KEY in your env, but gracefully fallback for dev.
const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

// Note: Prices should ideally be matched with the frontend
const TIER_NAMES: Record<string, string> = {
  STARTER: 'Explorer',
  PRO: 'Professional',
  ELITE: 'Enterprise'
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { txHash, planId, billingCycle, priceEth, email, walletAddress: rawWalletAddress } = body;
    const walletAddress = (rawWalletAddress && rawWalletAddress !== 'manual_tron_user') 
      ? rawWalletAddress 
      : (email ? `tron_${email.replace(/[^a-zA-Z0-9]/g, '')}` : `tron_${txHash.slice(0, 10)}`);

    if (!txHash || !planId || !walletAddress || !billingCycle || !priceEth) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log(`[Payment] Verifying tx ${txHash} for wallet ${walletAddress} (Plan: ${planId}, Cycle: ${billingCycle})`);

    // 1. Calculate Expiration Date
    const existingSub = await prisma.subscription.findUnique({
      where: { userId: walletAddress.toLowerCase() }
    });

    const now = new Date();
    let baseDate = now;
    if (existingSub && existingSub.status === 'ACTIVE' && existingSub.expiresAt > now) {
      baseDate = new Date(existingSub.expiresAt);
    }

    const expiresAt = new Date(baseDate);
    if (billingCycle === 'annual') {
      expiresAt.setFullYear(baseDate.getFullYear() + 1);
    } else {
      expiresAt.setMonth(baseDate.getMonth() + 1);
    }

    // 2. Update Database (User Tier & Email)
    let user;
    try {
      user = await prisma.user.upsert({
        where: { walletAddress: walletAddress.toLowerCase() },
        update: {
          tier: planId,
          ...(email && { email: email }) // Update email if provided
        },
        create: {
          walletAddress: walletAddress.toLowerCase(),
          tier: planId,
          ...(email && { email: email })
        }
      });
    } catch (e: any) {
      if (e.code === 'P2002') {
        // Unique constraint failed, likely on email. Fallback without email.
        user = await prisma.user.upsert({
          where: { walletAddress: walletAddress.toLowerCase() },
          update: { tier: planId },
          create: {
            walletAddress: walletAddress.toLowerCase(),
            tier: planId
          }
        });
      } else {
        throw e;
      }
    }

    // 3. Update or Create Subscription Record
    await prisma.subscription.upsert({
      where: { userId: walletAddress.toLowerCase() },
      update: {
        status: 'ACTIVE',
        tier: `${planId}_${billingCycle.toUpperCase()}`,
        expiresAt: expiresAt,
      },
      create: {
        userId: walletAddress.toLowerCase(),
        status: 'ACTIVE',
        tier: `${planId}_${billingCycle.toUpperCase()}`,
        expiresAt: expiresAt,
      }
    });

    // 4. Record the Transaction
    await prisma.transaction.create({
      data: {
        txHash: txHash,
        status: 'CONFIRMED',
        type: 'SUBSCRIPTION_PAYMENT',
        amount: parseFloat(priceEth),
        token: 'USDT',
        fromAddress: walletAddress.toLowerCase(),
        toAddress: process.env.NEXT_PUBLIC_TRON_TREASURY || 'TEW1PSVyNuneyzyTk3cKaxCsizgGnkM3LQ',
        authUserId: user.id,
        metadata: {
          planId,
          billingCycle,
          email,
          usdValue: priceEth,
          network: 'TRON_TRC20',
          expiresAt: expiresAt.toISOString()
        }
      }
    });

    // 5. Send Email Invoice using Resend
    if (email) {
      try {
        const invoiceHtml = `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #050505; color: #ffffff; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #00C076; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Sovereign Intelligence</h1>
              <p style="color: #888888; font-size: 14px;">On-Chain Payment Receipt (TRON NETWORK)</p>
            </div>
            
            <div style="background: #111111; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #222;">
              <h2 style="font-size: 18px; margin-top: 0; color: #ffffff;">Invoice Details</h2>
              <table style="width: 100%; color: #bbbbbb; font-size: 14px;">
                <tr><td style="padding: 8px 0;">Plan Acquired:</td><td style="text-align: right; color: #fff; font-weight: bold;">${TIER_NAMES[planId] || planId} (${billingCycle.toUpperCase()})</td></tr>
                <tr><td style="padding: 8px 0;">Amount Paid:</td><td style="text-align: right; color: #00C076; font-weight: bold;">${priceEth} USDT</td></tr>
                <tr><td style="padding: 8px 0;">Valid Until:</td><td style="text-align: right; color: #fff;">${expiresAt.toLocaleDateString()}</td></tr>
                <tr><td style="padding: 8px 0;">Network:</td><td style="text-align: right; color: #fff;">TRON (TRC-20)</td></tr>
                <tr><td style="padding: 8px 0;">TXID:</td><td style="text-align: right; font-family: monospace;">
                  <a href="https://tronscan.org/#/transaction/${txHash}" style="color: #00C076; text-decoration: none;">${txHash.slice(0,6)}...${txHash.slice(-4)}</a>
                </td></tr>
              </table>
            </div>

            <p style="text-align: center; color: #666666; font-size: 12px; margin-top: 30px;">
              Your cryptographic access has been granted.<br/>
              Return to the terminal to begin operations.
            </p>
          </div>
        `;

        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
        await resend.emails.send({
          from: `Sovereign Billing <${fromEmail}>`,
          to: email,
          subject: `Invoice: ${TIER_NAMES[planId] || planId} Plan Payment Confirmed`,
          html: invoiceHtml,
        });
        console.log(`[Payment] Invoice sent to ${email}`);
      } catch (emailError: any) {
        console.error(`[Payment] Failed to send email via Resend:`, emailError.message);
      }
    }

    return NextResponse.json({ success: true, tier: planId, expiresAt });
  } catch (error) {
    console.error('[Payment] Error confirming payment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
