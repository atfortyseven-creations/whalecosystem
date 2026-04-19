import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const _rawJwtSecret = process.env.JWT_SECRET;
const JWT_SECRET = new TextEncoder().encode(_rawJwtSecret || 'dev-only-not-for-production-jwt-secret-change-me');

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('human_session')?.value;
    
    if (!token) {
      // Return 401 unauthenticated safely so AppKit knows NO session exists
      return NextResponse.json(null, { status: 401 });
    }

    // Cryptographically verify session token
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (!payload.address) {
       return NextResponse.json(null, { status: 401 });
    }

    // AppKit requires address and chainId to persist the SIWE Session natively
    return NextResponse.json({
      address: payload.address as string,
      chainId: payload.chainId as number,
    }, { status: 200 });

  } catch (error) {
    // Token is invalid, expired, or manipulated
    return NextResponse.json(null, { status: 401 });
  }
}
