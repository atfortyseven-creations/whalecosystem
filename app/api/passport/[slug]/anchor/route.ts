import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { serializePassport } from '@/lib/passport/serialize';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;
  const passport = await prisma.productPassport.findUnique({ where: { publicSlug: slug } });
  if (!passport) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (passport.issuerAddress?.toLowerCase() !== session.userId.toLowerCase()) {
    return NextResponse.json({ error: 'Only the issuer can update anchor data' }, { status: 403 });
  }

  let body: { coreEntropy?: string; txHash?: string; chainId?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const updated = await prisma.productPassport.update({
    where: { id: passport.id },
    data: {
      coreEntropy: body.coreEntropy ?? passport.coreEntropy,
      txHash: body.txHash ?? passport.txHash,
      chainId: typeof body.chainId === 'number' ? body.chainId : passport.chainId,
    },
    include: { events: { orderBy: { createdAt: 'desc' }, take: 50 } },
  });

  return NextResponse.json(serializePassport(updated));
}
