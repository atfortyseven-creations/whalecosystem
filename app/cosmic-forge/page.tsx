import React from "react";
import { CosmicForgePanel } from "@/components/forge/CosmicForgePanel";

export const dynamic = "force-dynamic";

export default function CosmicForgePage() {
    return (
        <div className="bg-[#FAF9F6] w-full min-h-full">
            <CosmicForgePanel />
        </div>
    );
}
