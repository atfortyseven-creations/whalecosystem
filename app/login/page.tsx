"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ethers } from "ethers";
import { useWalletStore } from "@/lib/store/wallet-store";
import { useSystemConnect } from "@/hooks/useSystemConnect";
import { tryDecryptAny } from "@/lib/wallet-security";

interface SystemAccount {
  id: string;
  name: string;
  address: string;
  encryptedBlob: string;
  createdAt: number;
}

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<SystemAccount[]>([]);

  const { importWallet } = useWalletStore();
  const { activateSystemVault } = useSystemConnect();

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("system_accounts");
      if (stored) {
        setAccounts(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const handleRedirect = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get("returnUrl") || urlParams.get("redirect_url");
    if (returnUrl) {
      if (returnUrl.startsWith("http")) {
        window.location.href = returnUrl;
      } else {
        window.location.replace(returnUrl);
      }
    } else {
      // [SESSION FIX] Default to /dashboard, not '/'.
      // Redirecting to '/' would hit SmartLandingRouter which previously wiped
      // all session cookies (now fixed), but /dashboard is always the correct
      // destination after a successful Humanity Ledger login.
      window.location.replace("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password) {
      toast.error("Password required");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 60)); // Yield to render

    try {
      let targetBlob = "";
      let isLegacyVault = false;
      let targetAccount = accounts.length > 0 ? accounts[0] : null;

      if (targetAccount) {
        targetBlob = targetAccount.encryptedBlob;
        if (
          targetAccount.id === "legacy-1" &&
          !localStorage.getItem("system_keystore") &&
          localStorage.getItem("system_vault_v1")
        ) {
          isLegacyVault = true;
        }
      } else {
        const ks = localStorage.getItem("system_keystore");
        const vault = localStorage.getItem("system_vault_v1");
        if (ks) targetBlob = ks;
        else if (vault) {
          targetBlob = vault;
          isLegacyVault = true;
        }
      }

      if (!targetBlob && !isLegacyVault) {
        toast.error("No wallet found. Please sign up.");
        router.push("/sign-up");
        return;
      }

      let pk: string | null = null;
      let addr: string | null = null;

      if (!isLegacyVault) {
        try {
          const { plaintext, wasLegacy } = await tryDecryptAny(targetBlob, password);
          let walletObj: any;
          if (wasLegacy) {
            walletObj = new ethers.Wallet(plaintext);
          } else {
            walletObj = ethers.Wallet.fromPhrase(plaintext);
          }
          pk = walletObj.privateKey;
          addr = walletObj.address;
        } catch (err: any) {
          toast.error("Incorrect password");
          setLoading(false);
          return;
        }
      } else {
        const { readStoredVaultKey } = await import("@/hooks/useSystemConnect");
        const vaultPk = await readStoredVaultKey();
        if (!vaultPk) {
          toast.error("Vault corrupted");
          setLoading(false);
          return;
        }
        const walletObj: any = new ethers.Wallet(vaultPk);
        pk = walletObj.privateKey;
        addr = walletObj.address;
      }

      if (pk && addr) {
        importWallet(pk, "System Main");
        try {
          sessionStorage.setItem("portfolio_unlocked", "true");
          sessionStorage.setItem("system_wallet_addr", addr.toLowerCase());
        } catch {}

        try {
          await activateSystemVault(pk, addr);
        } catch (vaultErr) {}

        try {
          await fetch('/api/auth/system-verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: addr })
          });
        } catch (e) {
          console.error('System verify failed:', e);
        }

        toast.success("Login successful");
        handleRedirect();
      } else {
        throw new Error("Unable to get private key");
      }
    } catch (err) {
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen bg-white flex items-center justify-center p-4 selection:bg-black selection:text-white">
      {/* Background Image */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/system-shots/Devine-Lu-Linvega-monochrome-pixel-art-illustration-arch-2268374-wallhere.com.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>

      {/* Login Box */}
      <div className="relative z-10 w-full max-w-[420px] bg-white p-12 border-[3px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-black mb-2 text-center">
          Sign In
        </h1>
        <p className="text-xs font-bold text-black mb-10 text-center uppercase tracking-widest">
          Enter your password to access
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-8 w-full">
          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full bg-white border-2 border-black px-4 py-4 text-black text-center font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-black transition-all placeholder:text-black/30"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors disabled:opacity-50"
            style={{
              padding: "16px 32px",
              width: "max-content",
              border: "2px solid black",
              margin: "0 auto",
            }}
          >
            {loading ? "UNLOCKING" : "SIGN IN"}
          </button>
        </form>
      </div>
    </div>
  );
}

