"use client";

import { useCrossTabSync } from "@/lib/hooks/use-cross-tab-sync";
import { useSessionSync } from "@/lib/hooks/use-session-sync";

export function SimplifiedAuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize cross-tab synchronization
  useCrossTabSync();

  // The hook handles all session synchronization logic
  useSessionSync();

  return <>{children}</>;
}
