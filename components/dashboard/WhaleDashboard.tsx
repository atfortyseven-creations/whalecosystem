"use client";
// WhaleDashboard v3  11 tabs, KYC removed
import React, { useMemo } from 'react';

import { WhaleProShell } from '@/components/dashboard/WhaleProShell';
import { DashboardErrorBoundary } from '@/components/dashboard/DashboardErrorBoundary';
import { useSystemAccount } from '@/hooks/useSystemAccount';
import dynamic from 'next/dynamic';

// --- Architectural Hooks ---
import { useQuantumSessionVisibility } from '@/hooks/useQuantumSessionVisibility';
import { useAztecStateSync } from '@/hooks/useAztecStateSync';

// --- Static Imports ---
import { GoldTicketPanel } from '@/components/dashboard/GoldTicketPanel';

// --- Dynamic Module Registry ---
const LoadingPanel = () => (
  <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-transparent">
    <div className="w-6 h-6 border-2 border-[#050505] dark:border-white border-t-transparent rounded-full animate-spin" />
  </div>
);

const Registry = {
  WhaleSupport: dynamic(() => import('@/components/dashboard/WhaleSupport').then(m => ({ default: m.WhaleSupport })), { ssr: false, loading: LoadingPanel }),
  InstitutionalLedger: dynamic(() => import('@/components/dashboard/InstitutionalLedger'), { ssr: false, loading: LoadingPanel }),
  MassTransferIntel: dynamic(() => import('@/components/dashboard/MassTransferIntel').then(m => ({ default: m.MassTransferIntel })), { ssr: false, loading: LoadingPanel }),
  SessionLogsPanel: dynamic(() => import('@/components/dashboard/SessionLogsPanel').then(m => ({ default: m.SessionLogsPanel })), { ssr: false, loading: LoadingPanel }),
  PlanDashboard: dynamic(() => import('@/components/dashboard/PlanDashboard').then(m => ({ default: m.PlanDashboard })), { ssr: false, loading: LoadingPanel }),
  HumanityLedger: dynamic(() => import('@/components/dashboard/HumanityLedger'), { ssr: false, loading: LoadingPanel }),
  PortfolioDashboard: dynamic(() => import('@/components/dashboard/PortfolioDashboard'), { ssr: false, loading: LoadingPanel }),
  InstitutionalMarkets: dynamic(() => import('@/components/dashboard/InstitutionalMarkets').then(m => ({ default: m.InstitutionalMarkets })), { ssr: false, loading: LoadingPanel })
} as const;

import "@/app/dashboard/dashboard.css";

// --- Route Renderer Strategy ---
interface RouteRendererProps {
    route: string;
    reconciliationKey: number;
}

const PANEL_STYLE = "flex-1 w-full h-full min-h-0 flex flex-col";

const RouteRenderer = React.memo(({ route, reconciliationKey }: RouteRendererProps) => {
    const ComponentMap: Record<string, JSX.Element> = {
        'zk-identity': <GoldTicketPanel />,
        'gold': <GoldTicketPanel />,
        'portfolio': <Registry.PortfolioDashboard />,
        'billing': <Registry.PlanDashboard />,
        'humanity-ledger': <Registry.HumanityLedger />,
        'markets': <Registry.InstitutionalMarkets />,
        'inst-ledger': <Registry.InstitutionalLedger />,
        'mass-transfer': <Registry.MassTransferIntel />,
        'logs': <Registry.SessionLogsPanel />,
        'support': <Registry.WhaleSupport />
    };

    const targetComponent = ComponentMap[route] || <GoldTicketPanel />;
    const strictKey = `${route}-${reconciliationKey}`;

    return (
        <div className={PANEL_STYLE}>
            <DashboardErrorBoundary key={strictKey}>
                {targetComponent}
            </DashboardErrorBoundary>
        </div>
    );
});
RouteRenderer.displayName = 'RouteRenderer';

// --- Main Architecture ---
export default function WhaleDashboard() {
    const { isCheckingZK } = useSystemAccount();
    
    const [reconciliationKey, forceReconciliation] = useQuantumSessionVisibility();
    const { activeRoute, mutateRoute } = useAztecStateSync(forceReconciliation);

    // ZK Guard Clause
    if (isCheckingZK) {
        return (
            <div className="min-h-screen bg-[#FDFCF8] dark:bg-[#0A0A0A] flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-[#050505] dark:border-white border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <WhaleProShell
            activeTab={activeRoute}
            onTabChange={mutateRoute}
            isExternalEmbed={false}
            isZkVerified={true}
        >
            <div className="flex flex-col w-full h-full min-h-0">
                <RouteRenderer route={activeRoute} reconciliationKey={reconciliationKey} />
            </div>
        </WhaleProShell>
    );
}
