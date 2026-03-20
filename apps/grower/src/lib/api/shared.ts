import { type ApiClient, createApiClient } from "@cf/api";

/**
 * Create an API client with a specific token.
 * This is a client-safe function that can be used in both client and server contexts.
 *
 * @param token - The authentication token to use
 *
 * @example
 * ```tsx
 * // For Clerk token exchange
 * const api = createApiClientWithToken(clerkToken);
 * const { data } = await api.POST("/users/login", { body: {} });
 * ```
 */
export function createApiClientWithToken(token: string): ApiClient {
  return createApiClient({
    authTokenProvider: async () => token,
  });
}

/**
 * Create an unauthenticated API client for public endpoints.
 * This is a client-safe function that can be used in both client and server contexts.
 *
 * @example
 * ```tsx
 * const api = getPublicApiClient();
 * const { data } = await api.GET("/health");
 * ```
 */
export function getPublicApiClient(): ApiClient {
  return createApiClient({
    authTokenProvider: async () => null,
  });
}
