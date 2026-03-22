import { TxDetailDashboard } from '@/components/network/TxDetailDashboard';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ txid: string }>
}

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const { txid } = await params
 
  return {
    title: `Transaction ${txid.slice(0, 8)}... | Whale Alert Pro`,
    description: `Bitcoin Transaction Details for ${txid}`,
  }
}

export default async function TxPage({ params }: Props) {
    const { txid } = await params;
    return <TxDetailDashboard txid={txid} />;
}
