import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Delete all golden tickets to wipe the test signature
    const deletedTickets = await (prisma as any).goldenTicket.deleteMany({});
    
    // Also delete any users created during testing to completely remove them
    const deletedUsers = await (prisma as any).user.deleteMany({});
    
    return NextResponse.json({
      success: true,
      message: 'All Golden Tickets and Users have been deleted successfully.',
      deletedTicketsCount: deletedTickets.count,
      deletedUsersCount: deletedUsers.count
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
