import { ReactNode } from "react";

// SOVEREIGN FIX: Use h-screen + overflow-hidden to prevent page-level
// scroll bleed from WhaleProShell's internal h-[100dvh] container.
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dark h-screen overflow-hidden bg-background text-foreground">
      {children}
    </div>
  );
}
