import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { serializePassport, slugifyTitle } from '@/lib/passport/serialize';
import type { PassportPayload } from '@/lib/passport/types';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Connect your wallet to create a passport' }, { status: 401 });
  }

  let body: {
    title?: string;
    category?: string;
    payload?: PassportPayload;
    gs1Gtin?: string;
    publicSlug?: string;
    coreEntropy?: string;
    txHash?: string;
    chainId?: number;
    events?: Array<{ eventType: string; payload?: Record<string, unknown> }>;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const title = (body.title || '').trim();
  if (!title || title.length > 200) {
    return NextResponse.json({ error: 'title is required (max 200 chars)' }, { status: 400 });
  }

  const issuerAddress = session.userId.toLowerCase();
  let publicSlug = (body.publicSlug || '').trim();
  if (publicSlug && !/^[a-zA-Z0-9_-]{4,64}$/.test(publicSlug)) {
    return NextResponse.json({ error: 'Invalid slug format' }, { status: 400 });
  }
  if (!publicSlug) {
    publicSlug = slugifyTitle(title);
  }

  const existing = await prisma.productPassport.findUnique({ where: { publicSlug } });
  if (existing) {
    publicSlug = slugifyTitle(title);
  }

  const payload = (body.payload && typeof body.payload === 'object' ? body.payload : {}) as PassportPayload;

  const passport = await prisma.productPassport.create({
    data: {
      publicSlug,
      title,
      category: body.category?.trim() || null,
      issuerAddress,
      payload,
      gs1Gtin: body.gs1Gtin?.replace(/\D/g, '') || null,
      coreEntropy: body.coreEntropy || null,
      txHash: body.txHash || null,
      chainId: typeof body.chainId === 'number' ? body.chainId : null,
      events: body.events?.length
        ? {
            create: body.events.map((e) => ({
              eventType: e.eventType || 'note',
              payload: e.payload || {},
            })),
          }
        : undefined,
    },
    include: { events: { orderBy: { createdAt: 'desc' } } },
  });

  return NextResponse.json(serializePassport(passport), { status: 201 });
}
