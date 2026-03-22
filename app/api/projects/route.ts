import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: { deployments: true }
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error('[PROJECTS_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, status, liquidity, oracle } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status: status || 'DRAFT',
        liquidity: liquidity || 0.0,
        oracle: oracle || 'UMAOvl',
      }
    });

    // Emulate a deployment log creation
    await prisma.log.create({
      data: {
        message: `Project ${name} created. Init phase: Bootstrap.`,
        level: 'INFO',
        source: 'SYSTEM'
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('[PROJECTS_POST]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
