import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const { jwt } = await req.json();
    if (!jwt) return NextResponse.json({ error: 'Missing jwt' }, { status: 400 });

    const payload = await verifyJWT(jwt);

    const response = NextResponse.json({ success: true });
    
    // Server-side hydration (HttpOnly)
    response.cookies.set('human_session', jwt, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax', 
      maxAge: 604800,
      path: '/'
    });
    
    response.cookies.set('system_handshake', payload.sub as string, { 
      httpOnly: false, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax', 
      maxAge: 604800,
      path: '/'
    });
    
    return response;
  } catch (e: any) {
    return NextResponse.json({ error: 'Invalid JWT' }, { status: 401 });
  }
}
