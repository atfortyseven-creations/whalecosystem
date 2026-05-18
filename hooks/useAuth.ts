'use client';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';

const OWNER_ADDRESSES = [
  // Map to verified wallet addresses for owner privileges
  // or use OWNER_EMAILS check via /api/subscription/status
];

const OWNER_EMAILS = [
  'atfortyseven2@gmail.com',
  'josemanx2000@gmail.com'
];

export function useAuth() {
  const { address, isConnected, status } = useSovereignAccount();
  
  const isLoaded = status !== 'connecting' && status !== 'reconnecting';
  const isAuthenticated = isConnected && !!address;
  
  return {
    isAuthenticated,
    user: isAuthenticated ? { id: address, walletAddress: address } : null,
    isLoading: !isLoaded,
    isLoaded,
    isOwner: false, // Validated server-side via /api/subscription/status
    isPremium: false, // Validated server-side via /api/subscription/status
    trialViews: 0,
    viewedAddresses: [] as string[],
    walletAddress: address || null,
    authSource: isAuthenticated ? 'siwe' : 'none',
    login: async () => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  };
}
