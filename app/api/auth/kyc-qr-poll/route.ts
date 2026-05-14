import { NextRequest, NextResponse } from 'next/server';
import { safeRedisGet, safeRedisSet } from '@/lib/redis/client';

export async function GET(req: NextRequest) {
  try {
    const uuid = req.nextUrl.searchParams.get('uuid');
    
    if (!uuid) {
      return NextResponse.json({ error: 'Session UUID required' }, { status: 400 });
    }

    // Ultra-fast Redis retrieval
    const data = await safeRedisGet(`kyc-session:${uuid}`);
    
    if (!data) {
       // Si no existe, podría haber expirado (TTL 120s) o nunca fue creada por el PC.
       // Devolvemos PENDING para que el PC siga intentando hasta que expire su propio timer local.
       return NextResponse.json({ status: 'PENDING' });
    }
    
    if (data === "TIMEOUT") {
      return NextResponse.json({ error: "TIMEOUT" }, { status: 408 });
    }

    if (data === 'PENDING') {
      return NextResponse.json({ status: 'PENDING' });
    }

    // Si hay data y no es PENDING, es el Ciphertext enviado por el móvil.
    // Inmediatamente purgamos la clave de Redis para prevenir ataques de lectura repetida (Burn-after-read)
    await safeRedisSet(`kyc-session:${uuid}`, 'BURNED', 'EX', 10);

    return NextResponse.json({ 
      status: 'SUCCESS', 
      ciphertext: data 
    });

  } catch (err: any) {
    console.error('[KYC-QR-POLL] Read Fault:', err);
    return NextResponse.json({ error: 'Internal Polling Fault' }, { status: 500 });
  }
}
