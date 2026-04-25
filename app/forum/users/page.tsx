import React from 'react';
import { prisma } from '@/lib/prisma';
import { User } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Refresh every 60 seconds

export default async function ForumUsersPage() {
  let users: any[] = [];
  try {
    users = await (prisma as any).user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // Display top 100 recent users
      select: {
        walletAddress: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        tier: true,
        createdAt: true,
      }
    });
  } catch (e) {
    console.error("Failed to fetch users:", e);
  }

  return (
    <div className="flex flex-col w-full max-w-[1110px] mx-auto pb-20">
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-[24px] font-bold text-[#222222]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Sovereign Network Users
        </h1>
        <p className="text-gray-500 text-[14px] mt-1">
          Explore the institutional intelligence network directory.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {users.length > 0 ? (
          users.map((u, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center mb-3 border border-gray-200">
                {u.avatarUrl ? (
                  <img src={u.avatarUrl} alt={u.displayName || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <User size={32} className="text-gray-400" />
                )}
              </div>
              <h3 className="text-[#222222] font-semibold text-[15px] truncate w-full">
                {u.displayName || "Anonymous Whale"}
              </h3>
              <p className="text-gray-500 text-[12px] mt-1 truncate w-full font-mono">
                {u.walletAddress ? `${u.walletAddress.slice(0,6)}...${u.walletAddress.slice(-4)}` : "Unknown"}
              </p>
              
              <div className="mt-3 w-full flex items-center justify-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wide">
                  {u.tier || "FREE"}
                </span>
              </div>
              
              {u.bio && (
                <p className="text-gray-600 text-[13px] mt-3 line-clamp-2 w-full text-left italic bg-gray-50 p-2 rounded">
                  "{u.bio}"
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500">
            No users indexed in the local database yet.
          </div>
        )}
      </div>
    </div>
  );
}
