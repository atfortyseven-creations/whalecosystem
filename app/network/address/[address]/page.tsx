import { AddressDashboard } from '@/components/network/AddressDashboard';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ address: string }>
}

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const { address } = await params
 
  return {
    title: `Address ${address.slice(0, 8)}... | Whale Alert Pro`,
    description: `View balance and transactions for address ${address}`,
  }
}

export default async function AddressPage({ params }: Props) {
    const { address } = await params;
    return <AddressDashboard address={address} />;
}
