import SovereignChat from '@/components/dashboard/SovereignChat';
import { WhaleMissionLoader } from '@/components/shared/WhaleMissionLoader';

export const metadata = {
  title: 'Sovereign Chat · Whale Alert Network',
  description: 'Post-quantum E2EE encrypted messaging with on-chain intelligence.',
};

export default function ChatPage() {
  return (
    <WhaleMissionLoader>
      <SovereignChat />
    </WhaleMissionLoader>
  );
}
