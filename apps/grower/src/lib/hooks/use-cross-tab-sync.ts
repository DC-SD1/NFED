"use client";

import { useContext, useEffect } from "react";

import { AuthStoreContext } from "@/lib/stores/auth-store-ssr";
import { initializeCrossTabSyncWithStore } from "@/lib/utils/cross-tab-sync-ssr";

/**
 * Hook to initialize cross-tab synchronization with the auth store
 * This should be called once at the app level
 */
export function useCrossTabSync() {
  const store = useContext(AuthStoreContext);

  useEffect(() => {
    if (!store) return;

    const cleanup = initializeCrossTabSyncWithStore(store);
    return cleanup;
  }, [store]);
}
