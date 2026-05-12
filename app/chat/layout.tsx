import { ReactNode } from 'react';

/**
 * /chat route layout
 * Full-viewport layout for the mobile-optimised Whale Chat page.
 * Uses 100dvh so it fills correctly on iOS Safari without address-bar overlap.
 */
export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        height: '100dvh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: '#FAFAFA',
      }}
    >
      {children}
    </div>
  );
}
