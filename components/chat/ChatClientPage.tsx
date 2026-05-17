'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const WhaleChatPINGate = dynamic(() => import('@/components/chat/WhaleChatPINGate'), { ssr: false });
const SovereignChat = dynamic(() => import('@/components/dashboard/SovereignChat'), { ssr: false });

export default function ChatClientPage() {
  const [entered, setEntered] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {!entered ? (
        <WhaleChatPINGate key="gate" onEnter={() => setEntered(true)} />
      ) : (
        <SovereignChat key="chat" onReturnToGate={() => setEntered(false)} />
      )}
    </AnimatePresence>
  );
}
