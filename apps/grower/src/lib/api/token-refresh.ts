import { getPublicApiClient } from "@/lib/api";

import { ApiError } from "../errors";
import { logger } from "../utils/logger";

interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string | number; // Can be ISO string, Unix seconds, Unix ms, or C# ticks
}

/**
 * Refresh the access token using the refresh token
 * @param refreshToken - The refresh token to use for getting new tokens
 * @returns New access token, refresh token, and expiration time
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<TokenRefreshResponse> {
  // Create unauthenticated API client since we're using refresh token
  const api = getPublicApiClient();

  // Call the refresh endpoint using openapi-fetch
  const response = await api.client.POST("/users/refresh-token", {
    body: {
      refreshToken,
    },
  });

  // Handle openapi-fetch error responses
  if (response.error) {
    const errorDetails = response.error;
    const firstError = errorDetails.errors?.[0];

    logger.error("Token refresh failed", {
      status: response.response?.status,
      statusText: response.response?.statusText,
      error: response.error,
      errorCode: firstError?.code,
      traceId: errorDetails.traceId,
    });

    // Throw custom ApiError with proper structure for SharedKernelError handling
    throw new ApiError(
      firstError?.message ||
        `Token refresh failed: ${response.response?.status} ${response.response?.statusText}`,
      {
        status: response.response?.status,
        errorCode: firstError?.code,
        errorType: String(firstError?.type),
        traceId: errorDetails.traceId,
        timestamp: errorDetails.timestamp,
        originalError: response.error,
      },
    );
  }

  // Validate response structure from successful response
  const data = response.data;
  if (!data?.accessToken || !data?.refreshToken || !data?.expiresAt) {
    logger.error("Invalid token refresh response", { data });
    throw new Error("Invalid token refresh response structure");
  }

  // Log raw response for debugging
  logger.info("Token refresh API response", {
    rawExpiresAt: data.expiresAt,
    expiresAtType: typeof data.expiresAt,
  });

  // Return the raw data - the Zod schema in the route will handle conversion
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: data.expiresAt, // Pass through raw value, let schema handle conversion
  };
}
