import { createApiClientWithToken } from "@/lib/api";

import { ApiError } from "../errors";
import { logger } from "../utils/logger";

/**
 * Revoke the refresh token on the server to invalidate the session
 * @param refreshToken - The refresh token to revoke
 * @param accessToken - The access token for authentication
 * @returns Promise that resolves when token is successfully revoked
 */
export async function revokeTokenOnServer(
  refreshToken: string,
  accessToken?: string | null,
): Promise<void> {
  if (!accessToken) {
    logger.warn("No access token provided for token revocation");
    throw new Error("Access token is required for token revocation");
  }

  // Use the provided access token
  const api = createApiClientWithToken(accessToken);

  try {
    // Call the revoke endpoint using openapi-fetch
    const response = await api.client.POST("/users/revoke-token", {
      body: {
        refreshToken,
      },
    });

    // Handle openapi-fetch error responses
    if (response.error) {
      const errorDetails = response.error;

      logger.error("Token revocation failed", {
        status: response.response?.status,
        statusText: response.response?.statusText,
        error: response.error,
        traceId: errorDetails.traceId,
      });

      // Throw custom ApiError with proper structure for SharedKernelError handling
      throw new ApiError("Token revocation failed", {
        status: response.response?.status,
        errorCode: "AUTH_TOKEN_INVALID",
        errorType: "TOKEN_REVOCATION_FAILED",
        traceId: errorDetails.traceId,
        timestamp: errorDetails.timestamp,
        originalError: response.error,
      });
    }

    logger.info("Token revocation successful");
  } catch (error) {
    // Re-throw ApiError as-is, preserve other errors
    if (error instanceof ApiError) {
      throw error;
    }

    logger.error("Unexpected error during token revocation", error);
    throw error;
  }
}
