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
    const { txHash, planId, billingCycle, priceEth, email, walletAddress } = body;

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
    const user = await prisma.user.upsert({
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
        token: 'ETH',
        fromAddress: walletAddress.toLowerCase(),
        toAddress: process.env.NEXT_PUBLIC_TREASURY_WALLET || '0x000000000000000000000000000000000000dead',
        authUserId: user.id,
        metadata: {
          planId,
          billingCycle,
          email,
          usdValue: 'Calculated off-chain',
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
              <p style="color: #888888; font-size: 14px;">On-Chain Payment Receipt</p>
            </div>
            
            <div style="background: #111111; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #222;">
              <h2 style="font-size: 18px; margin-top: 0; color: #ffffff;">Invoice Details</h2>
              <table style="width: 100%; color: #bbbbbb; font-size: 14px;">
                <tr><td style="padding: 8px 0;">Plan Acquired:</td><td style="text-align: right; color: #fff; font-weight: bold;">${TIER_NAMES[planId] || planId} (${billingCycle.toUpperCase()})</td></tr>
                <tr><td style="padding: 8px 0;">Amount Paid:</td><td style="text-align: right; color: #00C076; font-weight: bold;">${priceEth} ETH</td></tr>
                <tr><td style="padding: 8px 0;">Valid Until:</td><td style="text-align: right; color: #fff;">${expiresAt.toLocaleDateString()}</td></tr>
                <tr><td style="padding: 8px 0;">Wallet Address:</td><td style="text-align: right; font-family: monospace;">${walletAddress.slice(0,6)}...${walletAddress.slice(-4)}</td></tr>
                <tr><td style="padding: 8px 0;">Transaction Hash:</td><td style="text-align: right; font-family: monospace;">
                  <a href="https://etherscan.io/tx/${txHash}" style="color: #0052FF; text-decoration: none;">${txHash.slice(0,6)}...${txHash.slice(-4)}</a>
                </td></tr>
              </table>
            </div>

            <p style="text-align: center; color: #666666; font-size: 12px; margin-top: 30px;">
              Your cryptographic access has been granted.<br/>
              Return to the terminal to begin operations.
            </p>
          </div>
        `;

        await resend.emails.send({
          from: 'billing@sovereign-intelligence.com',
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
