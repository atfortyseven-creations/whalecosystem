import { Suspense } from 'react';
import { Metadata } from 'next';
import MobileChatPage from './MobileChatPage';

export const metadata: Metadata = {
  title: 'Whale Chat — Encrypted P2P Messaging | Whale Alert Network',
  description:
    'End-to-end encrypted wallet-to-wallet messaging on the XMTP decentralised network. Communicate securely with any Ethereum address.',
};

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center bg-transparent">
          <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
        </div>
      }
    >
      <MobileChatPage />
    </Suspense>
  );
}
