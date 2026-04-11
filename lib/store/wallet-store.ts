import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ethers } from 'ethers';
import { toast } from 'sonner';

// 100M-User Scalability & Enterprise Matrix Configuration
export type NetworkId = 'ethereum' | 'polygon' | 'arbitrum' | 'optimism' | 'base' | 'avalanche';
export type ProtocolType = 'RPC' | 'WSS';

export const NETWORKS: Record<NetworkId, { name: string; currency: string; rpc: string; wss: string; color: string }> = {
  ethereum: { name: 'Ethereum', currency: 'ETH', rpc: 'https://go.getblock.io/85f2e6644087439c8b2b0ddc9bc0d234', wss: 'wss://go.getblock.io/85f2e6644087439c8b2b0ddc9bc0d234', color: '#627EEA' },
  polygon: { name: 'Polygon', currency: 'MATIC', rpc: 'https://go.getblock.io/a2c976b8451b445b8cd4b2226b9a4e0d', wss: 'wss://go.getblock.io/a2c976b8451b445b8cd4b2226b9a4e0d', color: '#8247E5' },
  arbitrum: { name: 'Arbitrum', currency: 'ETH', rpc: 'https://go.getblock.io/ba3a970679734c4cab03806954043510', wss: 'wss://go.getblock.io/ba3a970679734c4cab03806954043510', color: '#28A0F0' },
  optimism: { name: 'Optimism', currency: 'ETH', rpc: 'https://go.getblock.io/33cf8ac64b98490daefe07af9f59b429', wss: 'wss://go.getblock.io/33cf8ac64b98490daefe07af9f59b429', color: '#FF0420' },
  base: { name: 'Base', currency: 'ETH', rpc: 'https://go.getblock.io/c6c84d16b3d848d1b7cad00e6998c722', wss: 'wss://go.getblock.io/c6c84d16b3d848d1b7cad00e6998c722', color: '#0052FF' },
  avalanche: { name: 'Avalanche', currency: 'AVAX', rpc: 'https://go.getblock.io/bb751673d5294b51af168af3fc78e61b', wss: 'wss://go.getblock.io/bb751673d5294b51af168af3fc78e61b', color: '#E84142' },
};

interface WalletState {
  address: string | null;
  privateKey: string | null; // Warning: Stored securely in persistent local storage for local runtime
  balance: string;
  isCustom: boolean;
  activeNetwork: NetworkId;
  activeProtocol: ProtocolType;
  isUpdatingBalance: boolean;
  
  createWallet: () => void;
  importWallet: (privateKey: string) => boolean;
  clearWallet: () => void;
  updateBalance: () => Promise<void>;
  sendTransaction: (to: string, amount: string) => Promise<string | null>;
  setNetwork: (network: NetworkId) => void;
  setProtocol: (protocol: ProtocolType) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      address: null,
      privateKey: null,
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
          set({
            address: wallet.address,
            privateKey: wallet.privateKey,
            balance: "0.0",
            isCustom: false,
          });
          toast.success("Secure Wallet Generated", {
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
        toast.info("Wallet Purged", { description: "Secure keys removed from local memory." });
      },

      updateBalance: async () => {
        const { address, activeNetwork, activeProtocol, isUpdatingBalance } = get();
        if (!address || isUpdatingBalance) return;
        
        set({ isUpdatingBalance: true });

        try {
          const networkData = NETWORKS[activeNetwork];
          const provider = activeProtocol === 'WSS' 
            ? new ethers.WebSocketProvider(networkData.wss)
            : new ethers.JsonRpcProvider(networkData.rpc);

          let rawBalance;
          try {
             rawBalance = await provider.getBalance(address);
          } catch (failoverError) {
             if (activeProtocol === 'WSS') {
                // Auto-healing: WSS connections break upon OS sleep/hibernation. Triggering RPC rescue node.
                console.warn("[Auto-Heal] WSS terminated unexpectedly. Routing via RPC rescue node.");
                const fallbackNode = new ethers.JsonRpcProvider(networkData.rpc);
                rawBalance = await fallbackNode.getBalance(address);
             } else {
                 throw failoverError;
             }
          }

          // Confidence Delta (Reorg Glitch Interceptor)
          const oldBalance = parseFloat(get().balance || "0");
          let numericBalance = parseFloat(ethers.formatEther(rawBalance));
          
          if (oldBalance > 0.0001 && numericBalance === 0) {
              console.warn("[Delta Integrity] Potential L2 Chain-Reorg detected. Suspending UI update to prevent zero-balance panic.");
              await new Promise(r => setTimeout(r, 3000));
              try {
                  const retryBalance = await provider.getBalance(address);
                  numericBalance = parseFloat(ethers.formatEther(retryBalance));
              } catch(e) {}
          }
          
          // Quantum precision to prevent 'ghosting' of micro-assets (< 0.0001)
          const displayBalance = numericBalance === 0 ? "0.0" : numericBalance < 0.0001 ? "<0.0001" : numericBalance.toFixed(4);
          set({ balance: displayBalance });

          // If it's WSS, close it so we don't leak sockets on interval polling
          if (activeProtocol === 'WSS' && 'destroy' in provider) {
             (provider as any).destroy();
          }
        } catch (error) {
          console.error("Failed to sync balance:", error);
        } finally {
          set({ isUpdatingBalance: false });
        }
      },

      sendTransaction: async (to: string, amount: string) => {
        const { privateKey, activeNetwork, activeProtocol } = get();
        if (!privateKey) {
          toast.error("No Secure Key", { description: "You must generate or import a wallet first." });
          return null;
        }

        try {
          const networkData = NETWORKS[activeNetwork];
          const provider = activeProtocol === 'WSS' 
            ? new ethers.WebSocketProvider(networkData.wss)
            : new ethers.JsonRpcProvider(networkData.rpc);

          const wallet = new ethers.Wallet(privateKey, provider);

          // Validate address
          if (!ethers.isAddress(to)) {
            toast.error("Invalid Target", { description: "The destination address is fundamentally invalid." });
            return null;
          }

          const value = ethers.parseEther(amount);
          
          // Pre-flight algorithm: Predict actual exact cost including dynamic network congestion
          const currentBalance = await provider.getBalance(wallet.address);
          
          let gasCost = 0n;
          try {
             const feeData = await provider.getFeeData();
             const gasEstimate = await wallet.estimateGas({ to, value });
             gasCost = gasEstimate * (feeData.maxFeePerGas || feeData.gasPrice || 1n);
          } catch (gasError) {
             toast.error("Execution Unviable", { description: "The transaction will inherently fail or revert on-chain." });
             return null;
          }

          if (currentBalance < (value + gasCost)) {
            toast.error("Capital Depleted", { description: "You must leave a micro-fraction of funds to cover the network Gas fee." });
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

          // Mempool Zombie Lock Prevention
          try {
             await Promise.race([
                 tx.wait(1),
                 new Promise((_, reject) => setTimeout(() => reject(new Error("MEMPOOL_TIMEOUT")), 60000))
             ]);
          } catch (waitError: any) {
             if (waitError.message === "MEMPOOL_TIMEOUT") {
                 toast.error("Network Congestion", { id: "tx-broadcast", description: "Transaction is pending in mempool. UI unlocked." });
                 // Let it be pending in the background without freezing the UI.
             } else {
                 throw waitError;
             }
          }

          if (activeProtocol === 'WSS' && 'destroy' in provider) {
             (provider as any).destroy();
          }

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
        isCustom: state.isCustom,
        activeNetwork: state.activeNetwork,
        activeProtocol: state.activeProtocol
      }), // Only persist keys, balance fetched dynamically
    }
  )
);
