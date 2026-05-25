import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { getGbRpc, getGbWss } from '@/lib/blockchain/getblock-registry';

// 100M-User Scalability & Enterprise Grid Configuration
export type NetworkId = 'ethereum' | 'polygon' | 'arbitrum' | 'optimism' | 'base' | 'avalanche';
export type ProtocolType = 'RPC' | 'WSS';

export const NETWORKS: Record<NetworkId, { name: string; currency: string; rpc: string; wss: string; color: string }> = {
  ethereum: {
    name: 'Ethereum', currency: 'ETH', color: '#627EEA',
    rpc: getGbRpc('eth')  || process.env.ETH_RPC_URL  || 'https://cloudflare-eth.com',
    wss: getGbWss('eth')  || 'wss://ethereum-rpc.publicnode.com',
  },
  polygon: {
    name: 'Polygon', currency: 'MATIC', color: '#8247E5',
    rpc: getGbRpc('polygon') || 'https://polygon-rpc.com',
    wss: getGbWss('polygon') || 'wss://polygon-bor-rpc.publicnode.com',
  },
  arbitrum: {
    name: 'Arbitrum', currency: 'ETH', color: '#28A0F0',
    rpc: getGbRpc('arb') || 'https://arb1.arbitrum.io/rpc',
    wss: getGbWss('arb') || 'wss://arbitrum-one-rpc.publicnode.com',
  },
  optimism: {
    name: 'Optimism', currency: 'ETH', color: '#FF0420',
    rpc: 'https://mainnet.optimism.io',
    wss: 'wss://optimism-rpc.publicnode.com',
  },
  base: {
    name: 'Base', currency: 'ETH', color: '#0052FF',
    rpc: getGbRpc('base') || 'https://mainnet.base.org',
    wss: getGbWss('base') || 'wss://base-rpc.publicnode.com',
  },
  avalanche: {
    name: 'Avalanche', currency: 'AVAX', color: '#E84142',
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    wss: 'wss://avalanche-c-chain-rpc.publicnode.com',
  },
};

interface WalletAccount {
  address: string;
  privateKey: string | null;
  label: string;
  isCustom: boolean;
}

interface WalletState {
  address: string | null;
  privateKey: string | null;
  accounts: WalletAccount[];
  balance: string;
  isCustom: boolean;
  activeNetwork: NetworkId;
  activeProtocol: ProtocolType;
  isUpdatingBalance: boolean;
  
  createWallet: () => void;
  importWallet: (privateKey: string, label?: string) => boolean;
  switchAccount: (address: string) => void;
  removeAccount: (address: string) => void;
  clearWallet: () => void; // Purges all accounts
  updateBalance: () => Promise<void>;
  sendTransaction: (to: string, amount: string) => Promise<string | null>;
  setNetwork: (network: NetworkId) => void;
  setProtocol: (protocol: ProtocolType) => void;
  syncAddress: (address: string | null) => void;
  cloudSync: () => Promise<void>;
  restoreFromCloud: () => Promise<void>;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      address: null,
      privateKey: null,
      accounts: [],
      balance: "0.0",
      isCustom: false,
      activeNetwork: 'polygon',
      activeProtocol: 'RPC',
      isUpdatingBalance: false,

      setNetwork: (network: NetworkId) => {
        set({ activeNetwork: network, balance: "0.0" });
        get().updateBalance();
        toast.info(`Network Locked: ${NETWORKS[network].name}`);
      },

      setProtocol: (protocol: ProtocolType) => {
        set({ activeProtocol: protocol });
        toast.info(`Protocol Switch: ${protocol}`);
        get().updateBalance();
      },

      createWallet: () => {
        try {
          const wallet = ethers.Wallet.createRandom();
          const newAccount: WalletAccount = {
            address: wallet.address,
            privateKey: wallet.privateKey,
            label: `System ${get().accounts.length + 1}`,
            isCustom: false,
          };

          set(state => ({
            accounts: [...state.accounts, newAccount],
            address: wallet.address,
            privateKey: wallet.privateKey,
            balance: "0.0",
            isCustom: false,
          }));

          toast.success("Secure Wallet Generated", {
            description: `Address: ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
          });
          get().updateBalance();
          get().cloudSync();
        } catch (error) {
          console.error("Failed to generate wallet:", error);
          toast.error("Generation Failed", { description: "Cryptographic entropy creation failed." });
        }
      },

      importWallet: (pk: string, label?: string) => {
        try {
          const formattedPk = pk.startsWith('0x') ? pk : `0x${pk}`;
          const wallet = new ethers.Wallet(formattedPk);
          
          const existingIndex = get().accounts.findIndex(a => a.address.toLowerCase() === wallet.address.toLowerCase());
          if (existingIndex !== -1) {
            set(state => {
              const updatedAccounts = [...state.accounts];
              updatedAccounts[existingIndex] = {
                ...updatedAccounts[existingIndex],
                privateKey: wallet.privateKey
              };
              return {
                accounts: updatedAccounts,
                address: wallet.address,
                privateKey: wallet.privateKey,
                isCustom: updatedAccounts[existingIndex].isCustom,
                balance: "0.0"
              };
            });
            get().updateBalance();
            toast.success("Identity Unlocked", {
              description: `Active: ${get().accounts[existingIndex].label}`
            });
            // NOTE: cloudSync intentionally omitted here  this path fires on every
            // auth unlock and would cause excess POST requests on mobile.
            return true;
          }

          const newAccount: WalletAccount = {
            address: wallet.address,
            privateKey: wallet.privateKey,
            label: label || `Imported ${get().accounts.length + 1}`,
            isCustom: true,
          };

          set(state => ({
            accounts: [...state.accounts, newAccount],
            address: wallet.address,
            privateKey: wallet.privateKey,
            balance: "0.0",
            isCustom: true,
          }));
          
          toast.success("Identity Imported", {
            description: `Recovered: ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
          });
          get().updateBalance();
          // NOTE: cloudSync intentionally omitted here  only sync explicitly when user
          // adds a new account, not on every auth-gate unlock.
          return true;
        } catch (error) {
          console.error("Invalid private key during import:", error);
          toast.error("Import Rejected", { description: "Invalid institutional private key format." });
          return false;
        }
      },

      switchAccount: (address: string) => {
        const account = get().accounts.find(a => a.address.toLowerCase() === address.toLowerCase());
        if (account) {
          set({
            address: account.address,
            privateKey: account.privateKey,
            isCustom: account.isCustom,
            balance: "0.0"
          });
          get().updateBalance();
          toast.success("Identity Switched", { description: `Active: ${account.label}` });
        }
      },

      removeAccount: (address: string) => {
        set(state => {
          const newAccounts = state.accounts.filter(a => a.address.toLowerCase() !== address.toLowerCase());
          let nextState: Partial<WalletState> = { accounts: newAccounts };
          
          if (state.address?.toLowerCase() === address.toLowerCase()) {
            const nextAccount = newAccounts[0] || null;
            nextState.address = nextAccount?.address || null;
            nextState.privateKey = nextAccount?.privateKey || null;
            nextState.isCustom = nextAccount?.isCustom || false;
            nextState.balance = "0.0";
          }
          
          return nextState as WalletState;
        });
        toast.info("Account Removed");
      },

      clearWallet: () => {
        set({ address: null, privateKey: null, accounts: [], balance: "0.0", isCustom: false });
        toast.info("Registry Purged", { description: "All secure keys removed from local memory." });
      },

      updateBalance: async () => {
        const { address, activeNetwork, isUpdatingBalance } = get();
        if (!address || isUpdatingBalance) return;
        
        set({ isUpdatingBalance: true });

        try {
          const networkData = NETWORKS[activeNetwork];
          // [INSTITUTIONAL OPTIMIZATION]
          // Never use WebSockets for one-off stateless requests like getBalance.
          // WSS Handshakes are extremely heavy. We force JsonRpcProvider for all state-reads
          // to ensure instantaneous UI rendering and zero connection drops.
          const provider = new ethers.JsonRpcProvider(networkData.rpc);

          let rawBalance = await provider.getBalance(address);

          const oldBalanceValue = parseFloat(get().balance || "0");
          let numericBalance = parseFloat(ethers.formatEther(rawBalance));
          
          if (oldBalanceValue > 0.0001 && numericBalance === 0) {
              await new Promise(r => setTimeout(r, 3000));
              try {
                  const retryBalance = await provider.getBalance(address);
                  numericBalance = parseFloat(ethers.formatEther(retryBalance));
              } catch(e) {}
          }
          
          const displayBalance = numericBalance === 0 ? "0.0" : numericBalance < 0.0001 ? "<0.0001" : numericBalance.toFixed(4);
          set({ balance: displayBalance });

        } catch (error) {
          console.error("Failed to sync balance:", error);
        } finally {
          set({ isUpdatingBalance: false });
        }
      },

      sendTransaction: async (to: string, amount: string) => {
        const { privateKey, activeNetwork, activeProtocol } = get();
        if (!privateKey) {
          toast.error("No Secure Key", { description: "Select an internal wallet for this operation." });
          return null;
        }

        try {
          const networkData = NETWORKS[activeNetwork];
          const provider = activeProtocol === 'WSS' 
            ? new ethers.WebSocketProvider(networkData.wss)
            : new ethers.JsonRpcProvider(networkData.rpc);

          const wallet = new ethers.Wallet(privateKey, provider);
          if (!ethers.isAddress(to)) {
            toast.error("Invalid Target", { description: "Invalid address format." });
            return null;
          }

          const value = ethers.parseEther(amount);
          const currentBalance = await provider.getBalance(wallet.address);
          
          let gasCost = 0n;
          try {
             const feeData = await provider.getFeeData();
             const gasEstimate = await wallet.estimateGas({ to, value });
             gasCost = gasEstimate * (feeData.maxFeePerGas || feeData.gasPrice || 1n);
          } catch (gasError) {
             toast.error("Execution Unviable", { description: "Simulation failed. Check funds or network rules." });
             return null;
          }

          if (currentBalance < (value + gasCost)) {
            toast.error("Capital Depleted", { description: "Insufficient funds for value + gas." });
            return null;
          }

          toast.loading("Broadcasting Transaction...", { id: "tx-broadcast" });
          const tx = await wallet.sendTransaction({ to, value });

          toast.success("Broadcast Successful", { 
            id: "tx-broadcast",
            description: `Hash: ${tx.hash.slice(0, 8)}...${tx.hash.slice(-6)}`
          });

          await get().updateBalance();
          return tx.hash;
        } catch (error: any) {
          console.error("Transaction Error:", error);
          toast.error("Transaction Reverted", { 
            id: "tx-broadcast",
            description: error?.reason || error?.message || "Execution failed."
          });
          return null;
        }
      },
      
      syncAddress: (addr: string | null) => {
        const { address, accounts } = get();
        if (address === addr) return;
        
        // Check if this address is already in our managed registry
        if (addr) {
          const existing = accounts.find(a => a.address.toLowerCase() === addr.toLowerCase());
          if (existing) {
            set({
              address: existing.address,
              privateKey: existing.privateKey,
              isCustom: existing.isCustom,
              balance: "0.0"
            });
          } else {
            // It's an external web3 address being broadcasted via Handshake/AppKit
            set({ address: addr, privateKey: null, balance: "0.0", isCustom: false });
          }
          get().updateBalance();
        } else {
          // If clearing, we don't necessarily clear our registries, just the 'active' pointer if it was external
          if (!get().privateKey) {
            set({ address: null, balance: "0.0" });
          }
        }
      },

      cloudSync: async () => {
        const { accounts } = get();
        if (accounts.length === 0) return;

        try {
          await fetch('/api/wallets/sync', {
            method: 'POST',
            body: JSON.stringify({
              wallets: accounts.map(a => ({ address: a.address, label: a.label }))
            })
          });
        } catch (e) {
          console.error("[CLOUD-SYNC] Error:", e);
        }
      },

      restoreFromCloud: async () => {
        try {
          const res = await fetch('/api/wallets/sync');
          const { wallets } = await res.json();
          if (wallets && wallets.length > 0) {
              const currentAccounts = get().accounts;
              const newAccounts = [...currentAccounts];
              
              wallets.forEach((w: any) => {
                  if (!newAccounts.find(a => a.address.toLowerCase() === w.address.toLowerCase())) {
                      newAccounts.push({
                          address: w.address,
                          privateKey: null, // We can't restore PK from cloud for security
                          label: w.label || 'Recovered',
                          isCustom: false
                      });
                  }
              });
              
              set({ accounts: newAccounts });
              if (!get().address && newAccounts.length > 0) {
                  get().switchAccount(newAccounts[0].address);
              }
          }
        } catch (e) {
          console.error("[CLOUD-RESTORE] Error:", e);
        }
      }
    }),
    {
      name: 'whale-system-wallet-registry-v2', // Bump version for schema change
      partialize: (state) => ({ 
        address: state.address, 
        privateKey: state.privateKey, // Allowed for demo functionality
        accounts: state.accounts,
        isCustom: state.isCustom,
        activeNetwork: state.activeNetwork,
        activeProtocol: state.activeProtocol
      }),
    }
  )
);

//  ATOMIC SELECTORS FOR 240Hz MOBILE RENDERING 
// Prevents massive React re-renders when only one specific property changes.
export const useWalletBalance = () => useWalletStore((state) => state.balance);
export const useWalletAddress = () => useWalletStore((state) => state.address);
export const useWalletNetwork = () => useWalletStore((state) => state.activeNetwork);
export const useWalletIsUpdating = () => useWalletStore((state) => state.isUpdatingBalance);
export const useWalletAccounts = () => useWalletStore((state) => state.accounts);

