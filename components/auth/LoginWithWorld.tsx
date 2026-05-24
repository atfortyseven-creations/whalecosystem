"use client";

import { useState } from "react";
import { IDKitWidget, ISuccessResult, VerificationLevel } from "@worldcoin/idkit";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Fingerprint } from "lucide-react";

export default function LoginWithWorld() {
    const { address } = useAccount();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Configuration from env
    const app_id = (process.env.NEXT_PUBLIC_AUTH_APP_ID || "app_d2014c58bb084dcb09e1f3c1c1144287") as `app_${string}`;
    const action = "login"; // Acción específica solicitada

    const handleVerify = async (proof: ISuccessResult) => {
        setIsLoading(true);
        const toastId = toast.loading("Verifying identity...");

        try {
            // Sending proof to backend
            const res = await fetch("/api/auth/verify-world-id", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    proof,
                    walletAddress: address, // Sending address if connected
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Verification failed");
            }

            // Éxito
            toast.dismiss(toastId);
            toast.success("Login successful!");

            // Redirect to wallet to view balance and DeFi
            router.push("/wallet");

        } catch (error: any) {
            console.error("Login Error:", error);
            toast.dismiss(toastId);
            toast.error(error.message || "Authentication failed");
        } finally {
            setIsLoading(false);
        }
    };

    if (!app_id) {
        return <div className="text-red-500">Error: Missing World ID App Configuration</div>;
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <IDKitWidget
                app_id={app_id}
                action={action}
                onSuccess={handleVerify}
                handleVerify={async (proof: ISuccessResult) => {
                    // Validate in onSuccess to handle backend response and redirection correctly.
                    // IDKit expects a void or throw promise
                    return;
                }}
                verification_level={VerificationLevel.Orb}
            >
                {({ open }: { open: () => void }) => (
                    <button
                        onClick={open}
                        disabled={isLoading}
                        className="flex items-center gap-3 px-6 py-3 bg-neutral-900 text-white rounded-full font-bold border border-neutral-800 hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Fingerprint className="w-5 h-5" />
                        )}
                        <span>
                            {isLoading ? "Verifying..." : "Sign in with World ID"}
                        </span>
                    </button>
                )}
            </IDKitWidget>

            {!address && (
                <p className="text-xs text-yellow-500/80">
                    Note: Please connect your wallet first to link your account.
                </p>
            )}
        </div>
    );
}

// Force Rebuild 2026-01-26

