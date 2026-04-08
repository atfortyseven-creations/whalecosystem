import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { randomBytes } from 'crypto';

// Schema de validación
const SubscribeSchema = z.object({
  email: z.string().email('Email inválido'),
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional().default('weekly'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar input
    const validation = SubscribeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, frequency } = validation.data;

    // Crear o actualizar suscriptor
    const subscriber = await prisma.emailSubscriber.upsert({
      where: { email },
      update: {
        subscribed: true, // Reactivar si estaba desuscrito
        updatedAt: new Date(),
      },
      create: {
        email,
        frequency,
        subscribed: true,
        // FIX Bug 20: Math.random() is a non-cryptographic PRNG.
        // An attacker can statistically predict the token and unsubscribe
        // arbitrary users from whale alerts without their consent.
        // crypto.randomBytes(32) generates 256-bit CSPRNG entropy.
        unsubscribeToken: randomBytes(32).toString('hex'),
      },
    });

    return NextResponse.json({
      success: true,
      message: '¡Suscripción exitosa!',
      subscriber: {
        email: subscriber.email,
        status: 'active'
      }
    });

  } catch (error: any) {
    console.error('Newsletter error:', error);
    return NextResponse.json(
      { error: 'Error al procesar la suscripción' },
      { status: 500 }
    );
  }
}

