import { UnifiedExplorerTerminal } from '@/components/network/UnifiedExplorerTerminal';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Multiverse Matrix | Arctic Protocol',
    description: 'Omni-chain liquidity and execution synchronization.',
};

export default function MultiversePage() {
    return <UnifiedExplorerTerminal />;
}
