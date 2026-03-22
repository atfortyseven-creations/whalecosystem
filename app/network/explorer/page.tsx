import { UnifiedExplorerTerminal } from '@/components/network/UnifiedExplorerTerminal';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sovereign Explorer | Arctic Protocol',
    description: 'High-fidelity institutional network exploration.',
};

export default function ExplorerPage() {
    return <UnifiedExplorerTerminal />;
}
