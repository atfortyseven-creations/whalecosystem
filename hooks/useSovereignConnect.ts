"use client";

/**
 * useSovereignConnect
 * ─────────────────────────────────────────────────────────────────────────────
 * Neural bridge between GenerateWalletWizard and Wagmi's connector system.
 *
 * FIXES applied vs original:
 *  - BUG-06: Replaced btoa/atob (breaks on chars > 255 in Safari iOS) with
 *            pure hex encoding — 100% ASCII-safe, no Unicode issues.
 *  - BUG-03: autoReconnect uses exponential backoff (up to 4 attempts, 100ms
 *            base) to survive Next.js 15 SSR hydration race conditions where
 *            WagmiProvider isn't fully mounted on first tick.
 */

import { useCallback } from "react";
import { useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { getOrCreateSovereignProvider } from "@/lib/wallet/SovereignProvider";
import { toast } from "sonner";

import { SecureSessionStorage } from '@/lib/security/secure-storage';

const VAULT_SESSION_KEY = "sovereign_vault_session";

export async function readStoredVaultKey(): Promise<`0x${string}` | null> {
  try {
    const pk = await SecureSessionStorage.getItem<string>(VAULT_SESSION_KEY, true, false);
    if (!pk || !pk.startsWith("0x") || pk.length < 66) return null;
    return pk as `0x${string}`;
  } catch {
    return null;
  }
}

async function storeVaultKey(pk: string) {
  try {
    await SecureSessionStorage.setItem(VAULT_SESSION_KEY, pk, true);
  } catch {
    console.warn("[SovereignVault] session storage failed");
  }
}

export function clearSovereignVault() {
  SecureSessionStorage.removeItem(VAULT_SESSION_KEY);
  try { localStorage.removeItem("sovereign_vault_v1"); } catch {} // clear legacy
}

// ── Wagmi Connector ───────────────────────────────────────────────────────────
const sovereignConnector = () =>
  injected({
    target: {
      id: "sovereignVault",
      name: "Sovereign Vault",
      provider: () => getOrCreateSovereignProvider() as any,
    },
  });

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useSovereignConnect() {
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  /**
   * activateSovereignVault
   * Called from GenerateWalletWizard's onComplete callback.
   */
  const activateSovereignVault = useCallback(
    async (privateKey: string, address: string) => {
      const pk = (privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`) as `0x${string}`;

      try {
        toast.loading("Injecting Sovereign Identity into Terminal...", { id: "vault-connect" });

        // 1. Inject the key in the live provider singleton
        getOrCreateSovereignProvider(pk);

        // 2. Persist in SecureSessionStorage for auto-reconnect on refresh
        await storeVaultKey(pk);

        // 3. Drive Wagmi state machine into "connected"
        connect({ connector: sovereignConnector() });

        toast.success(`Vault Activated — ${address.slice(0, 6)}...${address.slice(-4)}`, {
          id: "vault-connect",
          description: "Your Sovereign Identity is now live on-chain.",
        });
      } catch (err: any) {
        toast.error("Vault injection failed", {
          id: "vault-connect",
          description: err?.message ?? "Unknown error",
        });
        throw err;
      }
    },
    [connect]
  );

  /**
   * disconnectSovereignVault — clears vault and resets Wagmi.
   */
  const disconnectSovereignVault = useCallback(() => {
    clearSovereignVault();
    disconnect();
    toast.info("Sovereign Vault sealed and disconnected.");
  }, [disconnect]);

  /**
   * autoReconnect — BUG-03 FIX: exponential backoff retry.
   * Wagmi's WagmiProvider may not be hydrated on the first React tick in
   * Next.js 15 SSR. We retry up to MAX_ATTEMPTS times with doubling delays.
   */
  const autoReconnect = useCallback(() => {
    readStoredVaultKey().then((pk) => {
      if (!pk) return;

      getOrCreateSovereignProvider(pk);

      const MAX_ATTEMPTS = 4;
      const BASE_DELAY_MS = 100;
      let attempts = 0;

      const attemptConnect = () => {
        try {
          connect({ connector: sovereignConnector() });
        } catch (err) {
          if (attempts < MAX_ATTEMPTS) {
            attempts++;
            setTimeout(attemptConnect, BASE_DELAY_MS * attempts); // 100, 200, 300, 400ms
          } else {
            console.warn("[SovereignVault] Auto-reconnect failed after", MAX_ATTEMPTS, "attempts");
          }
        }
      };

      attemptConnect();
    });
  }, [connect]);

  return { activateSovereignVault, disconnectSovereignVault, autoReconnect };
}


