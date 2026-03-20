import { getPublicApiClient } from "@/lib/api";

import { ApiError } from "../errors";
import { logger } from "../utils/logger";

interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
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

  // Parse and validate expiresAt
  const expiresAtNum = parseInt(data.expiresAt, 10);
  if (isNaN(expiresAtNum)) {
    logger.error("Invalid expiresAt format from API", {
      expiresAt: data.expiresAt,
    });
    throw new Error("Invalid expiresAt format in token refresh response");
  }

  logger.info("Token refresh successful", {
    expiresAt: new Date(expiresAtNum * 1000).toISOString(),
  });

  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: expiresAtNum,
  };
}
