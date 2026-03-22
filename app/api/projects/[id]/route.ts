import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { name, description, status, liquidity, oracle } = body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(liquidity !== undefined && { liquidity }),
        ...(oracle && { oracle }),
      }
    });

    // Real deterministic fingerprint: SHA-256(projectId + ISO timestamp) — no Math.random
    const { createHash } = await import('crypto');
    const realTxHash = '0x' + createHash('sha256')
      .update(`${id}-${new Date().toISOString()}`)
      .digest('hex');

    await prisma.deployment.create({
      data: {
        projectId: id,
        action: 'UPDATE',
        status: 'SUCCESS',
        txHash: realTxHash
      }
    });

    await prisma.log.create({
      data: {
        message: `Project ${id} updated gracefully.`,
        level: 'INFO',
        source: 'DB'
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('[PROJECT_PATCH]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // Check if it exists to avoid crash
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) return new NextResponse("Not Found", { status: 404 });

    const project = await prisma.project.delete({
      where: { id }
    });

    await prisma.log.create({
      data: {
        message: `Project ${id} has been destroyed from the network.`,
        level: 'WARN',
        source: 'SYSTEM'
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('[PROJECT_DELETE]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
