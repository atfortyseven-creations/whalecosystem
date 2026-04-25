import React from 'react';
import { prisma } from '@/lib/prisma';
import { Cake, CalendarDays, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function ForumAnniversariesPage() {
  const currentMonth = new Date().getMonth();
  
  let celebratingUsers: any[] = [];
  try {
    const allUsers = await (prisma as any).user.findMany({
      select: {
        walletAddress: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
        tier: true
      }
    });

    celebratingUsers = allUsers.filter((u: any) => {
      if (!u.createdAt) return false;
      const date = new Date(u.createdAt);
      // Solo usuarios que se unieron este mes pero en años pasados (o este año para celebrar el mes 0)
      return date.getMonth() === currentMonth;
    }).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  } catch (e) {
    console.error("Failed to fetch anniversaries:", e);
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonthName = monthNames[currentMonth];

  return (
    <div className="flex flex-col w-full max-w-[900px] mx-auto pb-20">
      <div className="mb-8 border-b border-gray-200 pb-6 flex items-center gap-3">
        <Cake size={32} className="text-pink-500" />
        <div>
          <h1 className="text-[28px] font-bold text-[#222222]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Anniversaries in {currentMonthName}
          </h1>
          <p className="text-gray-500 text-[15px] mt-1">
            Celebrating the institutional users who joined the Sovereign Network during this month.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
        {celebratingUsers.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {celebratingUsers.map((u, i) => {
              const joinedYear = new Date(u.createdAt).getFullYear();
              const currentYear = new Date().getFullYear();
              const years = currentYear - joinedYear;
              
              return (
                <li key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon size={20} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[16px] text-[#222222]">
                          {u.displayName || "Anonymous Whale"}
                        </span>
                        {years > 0 && (
                          <span className="text-[10px] bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-bold uppercase">
                            {years} {years === 1 ? 'Year' : 'Years'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] text-gray-500 mt-0.5">
                        <CalendarDays size={12} />
                        Joined {monthNames[new Date(u.createdAt).getMonth()]} {joinedYear}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Cake size={48} className="text-gray-300 mb-4" />
            <p>No user anniversaries recorded for {currentMonthName} yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
