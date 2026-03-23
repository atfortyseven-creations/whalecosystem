"use client";

import WhaleSniperTerminal from '@/components/dashboard/WhaleSniperTerminal';
import ContextMenu from '@/components/premium/ContextMenu';

export default function DashboardClient() {
  return (
    <ContextMenu>
      <WhaleSniperTerminal />
    </ContextMenu>
  );
}
