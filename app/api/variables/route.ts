import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const variables = await prisma.variable.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    return NextResponse.json(variables);
  } catch (error) {
    console.error('[VARIABLES_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { key, value, description } = body;

    if (!key || !value) {
      return new NextResponse("Key and Value are required", { status: 400 });
    }

    // Upsert logic for environment variables
    const variable = await prisma.variable.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description }
    });

    await prisma.log.create({
      data: {
        message: `Environment Variable [${key}] configured to [${value}].`,
        level: 'WARN', // Warn because config change
        source: 'SYSTEM'
      }
    });

    return NextResponse.json(variable);
  } catch (error) {
    console.error('[VARIABLES_POST]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
