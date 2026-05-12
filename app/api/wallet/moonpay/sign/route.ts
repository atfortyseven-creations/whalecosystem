import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { walletAddress, baseCurrencyAmount, baseCurrencyCode, currencyCode } = await req.json();

    if (!walletAddress || !baseCurrencyAmount || !currencyCode) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_MOONPAY_KEY || 'pk_test_1234567890abcdef';
    const secretKey = process.env.STRIPE_SECRET_KEY || process.env.MOONPAY_SECRET_KEY; // For safety, fallback if user used Stripe's secret field

    // Base URL construction
    const baseUrl = 'https://buy.moonpay.com';
    const params = new URLSearchParams({
      apiKey,
      currencyCode: currencyCode.toLowerCase(),
      baseCurrencyCode: (baseCurrencyCode || 'usd').toLowerCase(),
      baseCurrencyAmount: baseCurrencyAmount.toString(),
      walletAddress,
      colorCode: '#FAF9F6', // Institutional Ivory match
      theme: 'light'
    });

    const urlToSign = `${baseUrl}?${params.toString()}`;

    // If no secret key is found in environment, we return the unsigned URL (Sandbox mode)
    if (!secretKey) {
        console.warn('[MoonPay] No secure secret key configured. Returning unsigned Sandbox URL.');
        return NextResponse.json({ url: urlToSign });
    }

    // HMAC SHA256 Signature for production authentication
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(new URL(urlToSign).search)
      .digest('base64');
      
    const signedUrl = `${urlToSign}&signature=${encodeURIComponent(signature)}`;

    return NextResponse.json({ url: signedUrl });
  } catch (error: any) {
    console.error('[MoonPay API] Signature generation failed:', error);
    return NextResponse.json({ error: 'Signature generation failed' }, { status: 500 });
  }
}
