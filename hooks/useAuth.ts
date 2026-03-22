import { useUser } from '@clerk/nextjs';
import { useSession } from 'next-auth/react';

const OWNER_EMAILS = [
  'atfortyseven2@gmail.com',
  'josemanx2000@gmail.com'
];

export function useAuth() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const { data: nextSession, status: nextStatus } = useSession();
  
  const isNextLoaded = nextStatus !== 'loading';
  const isLoaded = isClerkLoaded && isNextLoaded;

  // Hybrid Auth Detection
  const isAuthenticated = (isClerkLoaded && !!clerkUser) || (isNextLoaded && !!nextSession);
  
  const userEmail = clerkUser?.primaryEmailAddress?.emailAddress || nextSession?.user?.email || '';
  const isOwner = isLoaded && isAuthenticated && OWNER_EMAILS.includes(userEmail);
  
  // A user is premium if they are an owner OR have the isVip flag in metadata
  const isPremium = isOwner || (isClerkLoaded && clerkUser?.publicMetadata?.isVip === true);
  
  return {
    isAuthenticated,
    user: clerkUser || nextSession?.user,
    isLoading: !isLoaded,
    isLoaded,
    isOwner,
    isPremium, 
    trialViews: (clerkUser?.publicMetadata?.trialViews as number) || 0,
    viewedAddresses: (clerkUser?.publicMetadata?.viewedAddresses as string[]) || [],
    authSource: clerkUser ? 'clerk' : (nextSession ? 'nextauth' : 'none'),
    login: async () => {
      // Re-trigger auth check or refresh
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  };
}

