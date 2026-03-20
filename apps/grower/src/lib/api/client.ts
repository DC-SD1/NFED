"use client";

import { type ApiClient, createApiClient } from "@cf/api";
import { useMemo } from "react";

import { useAuthActions, useAuthTokens } from "../stores/auth-store-ssr";
import { logger } from "../utils/logger";

/**
 * Client-side hook for getting an authenticated API client.
 * Uses the internal JWT tokens from TokenProvider.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const api = useApiClient();
 *   const { data } = api.useQuery("get", "/farms");
 *   // ...
 * }
 * ```
 */
export function useApiClient(): ApiClient {
  const { expiresAt } = useAuthTokens();
  const { refreshTokens } = useAuthActions();

  return useMemo(
    () =>
      createApiClient({
        // Client-side uses the proxy endpoint which handles auth server-side
        authTokenProvider: async () => null,

        // Token expiration checker for proactive refresh
        tokenExpirationChecker: () => {
          // Use expiresAt from metadata to check expiration
          if (!expiresAt) return false;

          // Check if token expires within 30 seconds
          const now = Date.now() / 1000;
          const buffer = 30; // 30 second buffer
          return expiresAt - buffer < now;
        },

        onTokenRefresh: async () => {
          try {
            logger.info("API client initiating token refresh");

            const result = await refreshTokens();

            if (result.success) {
              logger.info("API client token refresh successful");
              return true;
            } else {
              logger.warn("API client token refresh failed", {
                reason: result.reason,
              });
              return false;
            }
          } catch (error) {
            logger.error("API client token refresh error", error);
            return false;
          }
        },

        onLogout: async () => {
          logger.info("API client logout triggered - handled by auth store");
        },

        // Use the proxy endpoint for client-side API calls
        baseUrl: "/api/proxy",
      }),
    [expiresAt, refreshTokens],
  );
}
