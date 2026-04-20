// @ts-nocheck
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

    let logs = await prisma.userSessionLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });

    // Zero-Mock Mandate: If no logs exist in DB, return empty — do NOT generate fake data.
    // The SessionLogsPanel will show the empty state UI until real sessions are recorded.

    const total = await prisma.userSessionLog.count({ where });

    return NextResponse.json({ logs, total: total > 0 ? total : logs.length });
  } catch (error) {
    console.error('Session Logs GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { exportFormat } = body;

    // Fetch last 5000 logs for bulk export
    let logs = await prisma.userSessionLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 5000,
    });

    if (logs.length === 0) {
       logs = [{
          id: "empty",
          userId: "none",
          action: "NO_LOGS_FOUND",
          timestamp: new Date(),
          ipAddress: "0.0.0.0",
          userAgent: "System"
       }];
    }

    if (exportFormat === 'csv') {
      const header = 'ID,User_ID,Action,Timestamp,IP_Address,User_Agent\n';
      const escapeCsv = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;
      
      const rows = logs.map((l: any) => {
        return [
          escapeCsv(l.id),
          escapeCsv(l.userId),
          escapeCsv(l.action),
          escapeCsv(l.timestamp.toISOString()),
          escapeCsv(l.ipAddress),
          escapeCsv(l.userAgent)
        ].join(',');
      }).join('\n');
      
      return new NextResponse(header + rows, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="sovereign_security_logs_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Session Logs POST Error:', error);
    return NextResponse.json({ error: 'Failed to export logs' }, { status: 500 });
  }
}
