// app/api/siwe/nonce/route.ts
import { generateNonce } from 'siwe';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Generate cryptographic nonce
  const nonce = generateNonce();
  
  // In production, save to Redis or secure session cookie to validate later
  const res = new NextResponse(nonce, { status: 200 });
  res.cookies.set('siwe-nonce', nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });

  return res;
}

// app/api/siwe/verify/route.ts (Separated visually here to be part of the stack, although Next.js needs separate files)
// For the sake of this architectural layout, we represent the Verify Route structure:
/*
import { SiweMessage } from 'siwe';

export async function POST(req: NextRequest) {
  const { message, signature } = await req.json();
  const nonce = req.cookies.get('siwe-nonce')?.value;

  try {
    const siweMessage = new SiweMessage(message);
    const { data: fields } = await siweMessage.verify({ signature, nonce });

    // Enforce Level 9 Clearance if needed (e.g., checking on-chain balance)
    // const balance = await viemClient.getBalance({ address: fields.address });
    
    const res = NextResponse.json({ ok: true });
    // Write Session JWT
    return res;
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
*/
