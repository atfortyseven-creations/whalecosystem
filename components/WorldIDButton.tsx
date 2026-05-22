"use client";

import { IDKitWidget, ISuccessResult, VerificationLevel } from "@identity/idkit";
import { useRouter } from "next/navigation";

export default function VerifyWorldID() {
  const router = useRouter();

  // 1. READ ENVIRONMENT VARIABLES
  const app_id = process.env.NEXT_PUBLIC_AUTH_APP_ID as `app_${string}`;
  const action = process.env.NEXT_PUBLIC_AUTH_ACTION;

  // 2. SECURITY LOGS FOR DEBUG
  console.log("--- World ID Config Check ---");
  console.log("App ID loaded:", app_id ? "YES " : "NO ");
  console.log("Action ID loaded:", action ? `YES (${action}) ` : "NO ");

  const handleVerify = async (proof: ISuccessResult) => {
    console.log("Proof received from IDKit:", proof);
    // Here you could send the proof to your backend if necessary
  };

  const onSuccess = (result: ISuccessResult) => {
    console.log("Verification Successful :", result);
    // REDIRECTION TO MARKETS (Valid route)
    router.push("/markets");
  };

  const onError = (error: any) => {
    console.error("VERIFICATION ERROR :", error);

    // Detailed user alert
    alert(
      `Identity Error: ${error.code || "Unknown"}\n` +
      `Detail: ${error.message || "The verification was declined or cancelled."}\n\n` +
      `Tip: Check if your App in the Identity Developer Portal is in PRODUCTION mode.`
    );
  };

  if (!app_id || !action) {
    return (
      <div className="p-4 bg-indigo-500/20 border border-indigo-500 text-white rounded-lg">
        Configuration Error: Missing environment variables (APP_ID or ACTION).
      </div>
    );
  }

  return (
    <IDKitWidget
      app_id={app_id}
      action={action}
      onSuccess={onSuccess}
      handleVerify={handleVerify}
      onError={onError}
      // CHANGE THIS: 'device' for simulator, 'orb' for real users with the App
      verification_level={VerificationLevel.Device}
    >
      {({ open }: { open: () => void }) => (
        <button
          onClick={open}
          className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all shadow-xl"
        >
          Verify Identity with WhaleAlert ID
        </button>
      )}
    </IDKitWidget>
  );
}
