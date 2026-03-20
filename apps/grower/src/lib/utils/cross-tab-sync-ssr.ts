/* eslint-disable @typescript-eslint/no-empty-function */
"use client";

import type { AuthStoreApi } from "@/lib/stores/auth-store-ssr";

import { logger } from "./logger";

/**
 * Cross-tab synchronization using BroadcastChannel API
 * Automatically syncs auth state changes across browser tabs
 * This version works with the SSR-safe auth store
 */

let authChannel: BroadcastChannel | null = null;
let isInitialized = false;
let storeUnsubscribe: (() => void) | null = null;

/**
 * Initialize cross-tab sync with the auth store
 * Call this once when your app starts, passing the store instance
 */
export function initializeCrossTabSyncWithStore(
  store: AuthStoreApi,
): () => void {
  if (typeof window === "undefined" || isInitialized) {
    return () => {}; // No-op for SSR or if already initialized
  }

  try {
    authChannel = new BroadcastChannel("auth-sync");
    isInitialized = true;

    // Listen for messages from other tabs
    authChannel.onmessage = (event) => {
      try {
        if (event.data.type === "AUTH_STATE_UPDATE") {
          const { authState } = event.data;
          logger.info("Received auth state update from another tab", authState);

          // Update this tab's store with the new state from another tab
          const currentState = store.getState();
          store.setState({ ...currentState, ...authState });
        }
      } catch (error) {
        logger.error("Failed to handle cross-tab auth sync message", error);
      }
    };

    // Subscribe to auth store changes and broadcast to other tabs
    storeUnsubscribe = store.subscribe((state, prevState) => {
      // Only broadcast if auth-related state has changed
      const authState = {
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        userId: state.userId,
        email: state.email,
        roles: state.roles,
      };

      const prevAuthState = {
        accessToken: prevState.accessToken,
        refreshToken: prevState.refreshToken,
        expiresAt: prevState.expiresAt,
        userId: prevState.userId,
        email: prevState.email,
        roles: prevState.roles,
      };

      // Check if auth state changed
      if (JSON.stringify(authState) !== JSON.stringify(prevAuthState)) {
        if (authChannel) {
          try {
            authChannel.postMessage({
              type: "AUTH_STATE_UPDATE",
              authState,
              timestamp: Date.now(),
            });
            logger.info("Broadcasted auth state update to other tabs");
          } catch (error) {
            logger.error("Failed to broadcast auth state update", error);
          }
        }
      }
    });

    logger.info("Cross-tab auth synchronization initialized");

    // Return cleanup function
    return () => {
      try {
        if (storeUnsubscribe) {
          storeUnsubscribe();
          storeUnsubscribe = null;
        }
        if (authChannel) {
          authChannel.close();
          authChannel = null;
        }
        isInitialized = false;
        logger.info("Cross-tab auth synchronization cleaned up");
      } catch (error) {
        logger.error("Error during cross-tab sync cleanup", error);
      }
    };
  } catch (error) {
    logger.error("Failed to initialize cross-tab sync", error);
    return () => {}; // Return no-op cleanup
  }
}

/**
 * Check if cross-tab sync is supported
 */
export function isCrossTabSyncSupported(): boolean {
  return typeof window !== "undefined" && "BroadcastChannel" in window;
}

/**
 * Get current sync status
 */
export function getCrossTabSyncStatus() {
  return {
    isSupported: isCrossTabSyncSupported(),
    isInitialized,
    hasChannel: !!authChannel,
  };
}
