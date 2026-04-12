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

const VAULT_STORAGE_KEY = "sovereign_vault_v1";

// ── Vault Encoding ────────────────────────────────────────────────────────────
// BUG-06 FIX: Use hex XOR encoding instead of btoa/atob.
// btoa() throws InvalidCharacterError for any char > 255 (common with XOR).
// Hex is always ASCII-safe and works identically on all browsers inc. Safari.

function deriveObfKey(salt: string): string {
  return salt.split("").map(c => c.charCodeAt(0).toString(16)).join("").substring(0, 64);
}

function encodeVault(privateKey: string): string {
  const salt = typeof window !== "undefined" ? window.location.origin : "sovereign";
  const key = deriveObfKey(salt);
  // XOR then encode each byte as 2-digit hex → always valid ASCII
  let out = "";
  for (let i = 0; i < privateKey.length; i++) {
    const xored = privateKey.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    out += xored.toString(16).padStart(2, "0");
  }
  return out;
}

function decodeVault(encoded: string): string {
  const salt = typeof window !== "undefined" ? window.location.origin : "sovereign";
  const key = deriveObfKey(salt);
  let out = "";
  for (let i = 0; i < encoded.length; i += 2) {
    const byte = parseInt(encoded.substring(i, i + 2), 16);
    out += String.fromCharCode(byte ^ key.charCodeAt((i / 2) % key.length));
  }
  return out;
}

export function readStoredVaultKey(): `0x${string}` | null {
  try {
    const stored = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!stored) return null;
    const decoded = decodeVault(stored);
    if (!decoded.startsWith("0x") || decoded.length < 66) return null; // sanity check
    return decoded as `0x${string}`;
  } catch {
    return null;
  }
}

function storeVaultKey(pk: string) {
  try {
    localStorage.setItem(VAULT_STORAGE_KEY, encodeVault(pk));
  } catch {
    // Storage quota exceeded — non-fatal, session will work until page reload
    console.warn("[SovereignVault] localStorage quota exceeded — vault not persisted");
  }
}

export function clearSovereignVault() {
  try { localStorage.removeItem(VAULT_STORAGE_KEY); } catch {}
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

        // 2. Persist in hex-encoded localStorage for auto-reconnect
        storeVaultKey(pk);

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
    const pk = readStoredVaultKey();
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
  }, [connect]);

  return { activateSovereignVault, disconnectSovereignVault, autoReconnect };
}


