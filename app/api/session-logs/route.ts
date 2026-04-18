import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (userId) where.userId = userId;
    if (action) where.action = { contains: action, mode: 'insensitive' };

    const logs = await prisma.userSessionLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.userSessionLog.count({ where });

    return NextResponse.json({ logs, total });
  } catch (error) {
    console.error('Session Logs GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { exportFormat } = body;

    // Simulate export - actually fetch last 1000 logs
    const logs = await prisma.userSessionLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 1000,
    });

    if (exportFormat === 'csv') {
      const header = 'id,userId,action,timestamp,ipAddress,userAgent\n';
      const rows = logs.map(l => `${l.id},${l.userId || ''},${l.action},${l.timestamp.toISOString()},${l.ipAddress || ''},"${l.userAgent || ''}"`).join('\n');
      return new NextResponse(header + rows, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="session_logs.csv"',
        },
      });
    }

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Session Logs POST Error:', error);
    return NextResponse.json({ error: 'Failed to export logs' }, { status: 500 });
  }
}
