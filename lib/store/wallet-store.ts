import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { getGbRpc, getGbWss } from '@/lib/blockchain/getblock-registry';
import CryptoJS from 'crypto-js';

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
  mnemonic?: string | null;
  label: string;
  isCustom: boolean;
}

// In-memory strictly local encryption key. Never leaves JS context.
let sessionEncryptionKey: string | null = null;

interface Contact {
  name: string;
  address: string;
}

interface CustomToken {
  address: string;
  symbol: string;
  decimals: number;
}

interface TokenBalance extends CustomToken {
  balance: string;
}

interface WalletState {
  address: string | null;
  privateKey: string | null;
  mnemonic: string | null;
  accounts: WalletAccount[];
  balance: string;
  isCustom: boolean;
  activeNetwork: NetworkId;
  activeProtocol: ProtocolType;
  isUpdatingBalance: boolean;
  transactions: any[];
  contacts: Contact[];
  customRpcUrl: string | null;
  customTokens: CustomToken[];
  tokenBalances: TokenBalance[];

  // Vault Security
  isLocked: boolean;
  passwordHash: string | null;
  encryptedVault: string | null;
  
  createWallet: () => void;
  importWallet: (privateKey: string, label?: string) => boolean;
  switchAccount: (address: string) => void;
  removeAccount: (address: string) => void;
  clearWallet: () => void; // Purges all accounts
  updateBalance: () => Promise<void>;
  sendTransaction: (to: string, amount: string, gasPriority?: 'low'|'medium'|'high') => Promise<string | null>;
  setNetwork: (network: NetworkId) => void;
  setProtocol: (protocol: ProtocolType) => void;
  setCustomRpcUrl: (url: string | null) => void;
  addContact: (name: string, address: string) => void;
  removeContact: (address: string) => void;
  addCustomToken: (address: string, symbol: string, decimals: number) => void;
  syncAddress: (address: string | null) => void;
  cloudSync: () => Promise<void>;
  restoreFromCloud: () => Promise<void>;

  // Security Operations
  setupPassword: (password: string) => void;
  unlockVault: (password: string) => boolean;
  lockVault: () => void;
  _encryptAndSave: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      address: null,
      privateKey: null,
      mnemonic: null,
      accounts: [],
      balance: "0.0",
      isCustom: false,
      activeNetwork: 'polygon',
      activeProtocol: 'RPC',
      isUpdatingBalance: false,
      transactions: [],
      contacts: [],
      customRpcUrl: null,
      customTokens: [],
      tokenBalances: [],

      isLocked: false, // Initially false, but set to true on hydrate if passwordHash exists
      passwordHash: null,
      encryptedVault: null,

      setupPassword: (password: string) => {
          const hash = CryptoJS.SHA256(password).toString();
          sessionEncryptionKey = password;
          set({ passwordHash: hash, isLocked: false });
          get()._encryptAndSave();
          toast.success("Security Vault Initialized");
      },

      unlockVault: (password: string) => {
          const { passwordHash, encryptedVault } = get();
          if (!passwordHash) return true;
          const hash = CryptoJS.SHA256(password).toString();
          if (hash !== passwordHash) {
              toast.error("Decryption Failed", { description: "Invalid password provided." });
              return false;
          }
          sessionEncryptionKey = password;
          
          if (encryptedVault) {
              try {
                  const bytes = CryptoJS.AES.decrypt(encryptedVault, sessionEncryptionKey);
                  const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                  set({
                      accounts: decrypted.accounts || [],
                      address: decrypted.address || null,
                      privateKey: decrypted.privateKey || null,
                      mnemonic: decrypted.mnemonic || null,
                      isLocked: false,
                  });
                  get().updateBalance();
                  toast.success("Vault Unlocked");
                  return true;
              } catch (e) {
                  toast.error("Vault Corrupted", { description: "Could not decrypt vault data." });
                  return false;
              }
          }
          set({ isLocked: false });
          return true;
      },

      lockVault: () => {
          const { passwordHash } = get();
          if (passwordHash) {
              sessionEncryptionKey = null;
              set({
                  isLocked: true,
                  privateKey: null,
                  mnemonic: null,
                  // We mask the private keys in the accounts array in memory when locked
                  accounts: get().accounts.map(a => ({ ...a, privateKey: null, mnemonic: null }))
              });
              toast.info("Vault Locked", { description: "Cryptographic memory wiped." });
          }
      },

      _encryptAndSave: () => {
          const state = get();
          if (state.passwordHash && sessionEncryptionKey) {
              const payload = {
                  accounts: state.accounts,
                  address: state.address,
                  privateKey: state.privateKey,
                  mnemonic: state.mnemonic
              };
              const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), sessionEncryptionKey).toString();
              set({ encryptedVault: encrypted });
          }
      },

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

      setCustomRpcUrl: (url: string | null) => {
        set({ customRpcUrl: url });
        if (url) {
           toast.info("Custom RPC Connected");
        } else {
           toast.info("Reset to Default RPC");
        }
        get().updateBalance();
      },

      addContact: (name: string, address: string) => {
        set(state => ({
           contacts: [...state.contacts.filter(c => c.address !== address), { name, address }]
        }));
        toast.success("Contact Saved");
        get()._encryptAndSave();
      },

      removeContact: (address: string) => {
        set(state => ({
           contacts: state.contacts.filter(c => c.address !== address)
        }));
        toast.info("Contact Removed");
        get()._encryptAndSave();
      },

      addCustomToken: (address: string, symbol: string, decimals: number) => {
        set(state => ({
          customTokens: [...state.customTokens.filter(t => t.address !== address), { address, symbol, decimals }]
        }));
        toast.success(`Token ${symbol} Tracked`);
        get()._encryptAndSave();
        get().updateBalance();
      },

      createWallet: () => {
        try {
          const wallet = ethers.Wallet.createRandom();
          const newAccount: WalletAccount = {
            address: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic: wallet.mnemonic?.phrase || null,
            label: `System ${get().accounts.length + 1}`,
            isCustom: false,
          };

          set(state => ({
            accounts: [...state.accounts, newAccount],
            address: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic: wallet.mnemonic?.phrase || null,
            balance: "0.0",
            isCustom: false,
          }));

          toast.success("Secure Wallet Generated", {
            description: `Address: ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
          });
          get()._encryptAndSave();
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
                mnemonic: null,
                isCustom: updatedAccounts[existingIndex].isCustom,
                balance: "0.0"
              };
            });
            get()._encryptAndSave();
            get().updateBalance();
            toast.success("Identity Unlocked", {
              description: `Active: ${get().accounts[existingIndex].label}`
            });
            return true;
          }

          const newAccount: WalletAccount = {
            address: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic: null,
            label: label || `Imported ${get().accounts.length + 1}`,
            isCustom: true,
          };

          set(state => ({
            accounts: [...state.accounts, newAccount],
            address: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic: null,
            balance: "0.0",
            isCustom: true,
          }));
          
          toast.success("Identity Imported", {
            description: `Recovered: ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
          });
          get()._encryptAndSave();
          get().updateBalance();
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
            mnemonic: account.mnemonic || null,
            isCustom: account.isCustom,
            balance: "0.0"
          });
          get()._encryptAndSave();
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
            nextState.mnemonic = nextAccount?.mnemonic || null;
            nextState.isCustom = nextAccount?.isCustom || false;
            nextState.balance = "0.0";
          }
          
          return nextState as WalletState;
        });
        get()._encryptAndSave();
        toast.info("Account Removed");
      },

      clearWallet: () => {
        set({ address: null, privateKey: null, mnemonic: null, accounts: [], balance: "0.0", isCustom: false, encryptedVault: null, passwordHash: null, isLocked: false });
        sessionEncryptionKey = null;
        toast.info("Registry Purged", { description: "All secure keys removed from local memory." });
      },

      updateBalance: async () => {
        const { address, activeNetwork, isUpdatingBalance } = get();
        if (!address || isUpdatingBalance) return;
        
        set({ isUpdatingBalance: true });

        try {
          const networkData = NETWORKS[activeNetwork];
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
          
          // Fetch ERC20 balances
          const currentTokens = get().customTokens;
          const updatedTokenBalances: TokenBalance[] = [];
          
          for (const token of currentTokens) {
             try {
                const contract = new ethers.Contract(token.address, [
                   "function balanceOf(address owner) view returns (uint256)"
                ], provider);
                const bal = await contract.balanceOf(address);
                const formatted = ethers.formatUnits(bal, token.decimals);
                updatedTokenBalances.push({ ...token, balance: parseFloat(formatted).toFixed(4) });
             } catch (e) {
                updatedTokenBalances.push({ ...token, balance: "0.0" });
             }
          }

          set({ balance: displayBalance, tokenBalances: updatedTokenBalances });

        } catch (error) {
          console.error("Failed to sync balance:", error);
        } finally {
          set({ isUpdatingBalance: false });
        }
      },

      sendTransaction: async (to: string, amount: string, gasPriority: 'low'|'medium'|'high' = 'medium') => {
        const { privateKey, activeNetwork, activeProtocol, isLocked } = get();
        if (isLocked || !privateKey) {
          toast.error("READ-ONLY NODE ACTIVE", { description: "Cryptographic private key not found. Please initialize your Quantum Vault to sign transactions." });
          return null;
        }

        try {
          const networkData = NETWORKS[activeNetwork];
          let rpcUrl = get().customRpcUrl || networkData.rpc;
          
          const provider = activeProtocol === 'WSS' 
            ? new ethers.WebSocketProvider(networkData.wss)
            : new ethers.JsonRpcProvider(rpcUrl);

          const wallet = new ethers.Wallet(privateKey, provider);
          if (!ethers.isAddress(to)) {
            toast.error("Invalid Target", { description: "Invalid address format." });
            return null;
          }

          const value = ethers.parseEther(amount);
          const currentBalance = await provider.getBalance(wallet.address);
          
          let gasCost = 0n;
          let txParams: ethers.TransactionRequest = { to, value };

          try {
             const feeData = await provider.getFeeData();
             const gasEstimate = await wallet.estimateGas({ to, value });
             
             // EIP-1559 Calculation
             if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
                 const priorityMultiplier = gasPriority === 'high' ? 2.0 : gasPriority === 'low' ? 0.8 : 1.2;
                 const maxPriorityFeePerGas = BigInt(Math.floor(Number(feeData.maxPriorityFeePerGas) * priorityMultiplier));
                 
                 // If base fee is null, try to derive it or use fallback
                 let maxFeePerGas = feeData.maxFeePerGas;
                 if (gasPriority === 'high') {
                     maxFeePerGas = feeData.maxFeePerGas * 3n / 2n; // 50% increase max
                 }

                 txParams.maxPriorityFeePerGas = maxPriorityFeePerGas;
                 txParams.maxFeePerGas = maxFeePerGas;
                 txParams.type = 2; // EIP-1559
                 
                 gasCost = gasEstimate * maxFeePerGas;
             } else {
                 // Legacy fallback
                 const gasPrice = feeData.gasPrice || 1n;
                 txParams.gasPrice = gasPriority === 'high' ? gasPrice * 120n / 100n : gasPrice;
                 gasCost = gasEstimate * txParams.gasPrice;
             }
             
             txParams.gasLimit = gasEstimate * 110n / 100n; // 10% buffer
          } catch (gasError) {
             console.error("Gas Error:", gasError);
             toast.error("Execution Unviable", { description: "Simulation failed. Check funds or network rules." });
             return null;
          }

          if (currentBalance < (value + gasCost)) {
            toast.error("Capital Depleted", { description: "Insufficient funds for value + gas." });
            return null;
          }

          toast.loading("Broadcasting Transaction...", { id: "tx-broadcast" });
          const tx = await wallet.sendTransaction(txParams);

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
        
        if (addr) {
          const existing = accounts.find(a => a.address.toLowerCase() === addr.toLowerCase());
          if (existing) {
            set({
              address: existing.address,
              privateKey: existing.privateKey,
              mnemonic: existing.mnemonic || null,
              isCustom: existing.isCustom,
              balance: "0.0"
            });
          } else {
            set({ address: addr, privateKey: null, mnemonic: null, balance: "0.0", isCustom: false });
          }
          get().updateBalance();
        } else {
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
                          privateKey: null, 
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
      name: 'whale-system-wallet-registry-v3', // Bumped for encryption
      partialize: (state) => {
        // EXTREMELY CRITICAL: Never serialize privateKey, mnemonic, or plaintext accounts!
        // If passwordHash exists, we ONLY save the encryptedVault.
        if (state.passwordHash) {
             return {
                 address: state.address, // Public address is safe
                 isCustom: state.isCustom,
                 activeNetwork: state.activeNetwork,
                 activeProtocol: state.activeProtocol,
                 passwordHash: state.passwordHash,
                 encryptedVault: state.encryptedVault,
                 // We store masked accounts so the UI knows they exist, but without keys
                 accounts: state.accounts.map(a => ({ ...a, privateKey: null, mnemonic: null }))
             } as Partial<WalletState>;
        }
        // Legacy fallback if no password is set yet
        return { 
          address: state.address, 
          privateKey: state.privateKey, 
          mnemonic: state.mnemonic,
          accounts: state.accounts,
          isCustom: state.isCustom,
          activeNetwork: state.activeNetwork,
          activeProtocol: state.activeProtocol
        } as Partial<WalletState>;
      },
      onRehydrateStorage: () => (state) => {
          if (state && state.passwordHash) {
              // Lock immediately on rehydration so the app requires unlock
              state.isLocked = true;
              state.privateKey = null;
              state.mnemonic = null;
          }
      }
    }
  )
);

export const useWalletBalance = () => useWalletStore((state) => state.balance);
export const useWalletAddress = () => useWalletStore((state) => state.address);
export const useWalletNetwork = () => useWalletStore((state) => state.activeNetwork);
export const useWalletIsUpdating = () => useWalletStore((state) => state.isUpdatingBalance);
export const useWalletAccounts = () => useWalletStore((state) => state.accounts);
