export const ADMIN_WALLETS = [
  (process.env.NEXT_PUBLIC_ADMIN_WALLET || "").toLowerCase(),
  "0x78831c25c86ea2a78a6127fc2ccb95e612d87b4a" // Sovereign Supreme Admin
].filter(Boolean);

export function isAdmin(walletAddress?: string): boolean {
  if (!walletAddress) return false;
  return ADMIN_WALLETS.includes(walletAddress.toLowerCase());
}
