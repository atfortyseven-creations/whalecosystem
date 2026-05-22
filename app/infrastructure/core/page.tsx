import SystemNodeCore from '@/components/infrastructure/SystemNodeCore';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'System Node Core | Whale Alert',
    description: 'Internal Elite node monitoring with core precision and zero-error validation.',
};

export default function CorePage() {
    return <SystemNodeCore />;
}
