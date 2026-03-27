import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ethers } from 'ethers';
import { toast } from 'sonner';

const RPC_URL = "https://polygon-rpc.com"; // Polygon Mainnet for cheap/fast real txs

interface WalletState {
  address: string | null;
  privateKey: string | null; // Warning: Stored securely in persistent local storage for sovereign local runtime
  balance: string;
  isCustom: boolean;
  
  createWallet: () => void;
  importWallet: (privateKey: string) => boolean;
  clearWallet: () => void;
  updateBalance: () => Promise<void>;
  sendTransaction: (to: string, amount: string) => Promise<string | null>;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      address: null,
      privateKey: null,
      balance: "0.0",
      isCustom: false,

      createWallet: () => {
        try {
          const wallet = ethers.Wallet.createRandom();
          set({
            address: wallet.address,
            privateKey: wallet.privateKey,
            balance: "0.0",
            isCustom: false,
          });
          toast.success("Sovereign Wallet Generated", {
            description: `Address: ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
          });
          get().updateBalance();
        } catch (error) {
          console.error("Failed to generate wallet:", error);
          toast.error("Generation Failed", { description: "Cryptographic entropy creation failed." });
        }
      },

      importWallet: (pk: string) => {
        try {
          // Normalize private key
          const formattedPk = pk.startsWith('0x') ? pk : `0x${pk}`;
          const wallet = new ethers.Wallet(formattedPk);
          
          set({
            address: wallet.address,
            privateKey: wallet.privateKey,
            balance: "0.0",
            isCustom: true,
          });
          
          toast.success("Identity Imported", {
            description: `Recovered: ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
          });
          get().updateBalance();
          return true;
        } catch (error) {
          console.error("Invalid private key during import:", error);
          toast.error("Import Rejected", { description: "Invalid institutional private key format." });
          return false;
        }
      },

      clearWallet: () => {
        set({ address: null, privateKey: null, balance: "0.0", isCustom: false });
        toast.info("Wallet Purged", { description: "Sovereign keys removed from local memory." });
      },

      updateBalance: async () => {
        const { address } = get();
        if (!address) return;

        try {
          const provider = new ethers.JsonRpcProvider(RPC_URL);
          const rawBalance = await provider.getBalance(address);
          const formattedBalance = ethers.formatEther(rawBalance);
          
          // Truncate to 4 decimals
          const displayBalance = parseFloat(formattedBalance).toFixed(4);
          set({ balance: displayBalance });
        } catch (error) {
          console.error("Failed to sync balance:", error);
        }
      },

      sendTransaction: async (to: string, amount: string) => {
        const { privateKey } = get();
        if (!privateKey) {
          toast.error("No Sovereign Key", { description: "You must generate or import a wallet first." });
          return null;
        }

        try {
          const provider = new ethers.JsonRpcProvider(RPC_URL);
          const wallet = new ethers.Wallet(privateKey, provider);

          // Validate address
          if (!ethers.isAddress(to)) {
            toast.error("Invalid Target", { description: "The destination address is fundamentally invalid." });
            return null;
          }

          const value = ethers.parseEther(amount);
          
          // Check balance logic prior to broadcast
          const currentBalance = await provider.getBalance(wallet.address);
          if (currentBalance < value) {
            toast.error("Insufficient Capital", { description: "On-chain reserves cannot cover this operation." });
            return null;
          }

          toast.loading("Broadcasting to Network...", { id: "tx-broadcast" });

          const tx = await wallet.sendTransaction({
            to,
            value,
          });

          toast.success("Transaction Confirmed", { 
            id: "tx-broadcast",
            description: `Hash: ${tx.hash.slice(0, 8)}...${tx.hash.slice(-6)}`
          });

          // Await confirmation
          await tx.wait(1);
          await get().updateBalance();

          return tx.hash;

        } catch (error: any) {
          console.error("Transaction Error:", error);
          toast.error("Transaction Reverted", { 
            id: "tx-broadcast",
            description: error?.reason || error?.message || "Execution failed at the network level."
          });
          return null;
        }
      }
    }),
    {
      name: 'whale-sovereign-wallet-storage',
      partialize: (state) => ({ 
        address: state.address, 
        privateKey: state.privateKey, 
        isCustom: state.isCustom 
      }), // Only persist keys, balance fetched dynamically
    }
  )
);
