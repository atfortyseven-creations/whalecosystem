import { ReactNode } from 'react';

/**
 * /chat route layout
 * Full-viewport layout for the mobile-optimised Whale Chat page.
 * Uses 100dvh so it fills correctly on iOS Safari without address-bar overlap.
 */
export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-transparent flex flex-col overflow-hidden"
      style={{
        height: '100dvh'
      }}
    >
      {children}
    </div>
  );
}
