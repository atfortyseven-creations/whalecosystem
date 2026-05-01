import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate required fields
    const { name, email, portfolio, motivation, role } = body;
    if (!name || !email || !portfolio || !motivation || !role) {
      return NextResponse.json({ error: 'Incomplete cryptographic parameters.' }, { status: 400 });
    }

    // In a real application, you would save this to a database or send an email.
    // For this demonstration, we simulate a slight delay and return absolute success.
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulated logging
    console.log(`[SOVEREIGN CAREERS] Application received for ${role} from ${email}`);

    return NextResponse.json({ ok: true, message: 'Application securely received.' });

  } catch (error: any) {
    console.error('[SOVEREIGN CAREERS ERROR]', error);
    return NextResponse.json({ error: 'Internal system error during transmission.' }, { status: 500 });
  }
}
