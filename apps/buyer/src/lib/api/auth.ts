import { createApiClientWithToken } from "@/lib/api";

import { logger } from "../utils/logger";

interface TokenExchangeResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
  email: string;
  roles: string[];
}

/**
 * Exchange Clerk access token for internal JWT tokens
 * @param clerkToken - The Clerk access token
 * @returns Internal JWT tokens (accessToken, refreshToken, expiresAt)
 */
export async function exchangeClerkToken(
  clerkToken: string,
): Promise<TokenExchangeResponse> {
  try {
    logger.info("Starting Clerk token exchange", {
      apiUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
      endpoint: "/users/login",
    });

    // Create API client with Clerk token for authentication
    const api = createApiClientWithToken(clerkToken);

    // Use the typed openapi-fetch client to call the login endpoint
    const response = await api.client.POST("/users/login", {
      body: {
        token: clerkToken,
      },
    });

    // Handle openapi-fetch error responses
    if (response.error) {
      const errorDetails = response.error;
      const firstError = errorDetails.errors?.[0];

      logger.error("Token exchange failed", {
        status: response.response?.status,
        statusText: response.response?.statusText,
        error: response.error,
        errorCode: firstError?.code,
        traceId: errorDetails.traceId,
      });

      // Create a more detailed error with proper structure
      const error = new Error(
        firstError?.message ||
          `Token exchange failed: ${response.response?.status} ${response.response?.statusText}`,
      );

      // Attach properly typed error data for consistent error handling
      Object.assign(error, {
        status: response.response?.status,
        errorCode: firstError?.code,
        errorType: firstError?.type,
        traceId: errorDetails.traceId,
        timestamp: errorDetails.timestamp,
        originalError: response.error,
      });

      throw error;
    }

    // Validate response structure from successful response
    const data = response.data;
    if (
      !data?.accessToken ||
      !data.refreshToken ||
      !data.expiresAt ||
      !data.userId ||
      !data.email ||
      !data.roles
    ) {
      logger.error("Invalid token exchange response", { data });
      throw new Error("Invalid token exchange response structure");
    }

    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: Number(data.expiresAt),
      userId: data.userId,
      email: data.email,
      roles: data.roles,
    };
  } catch (error) {
    // Check if it's a network/CORS error
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      logger.error("CORS or network error during token exchange", {
        error: error.message,
        apiUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
        endpoint: "/users/login",
        hint: "Check if backend CORS allows this origin and includes credentials",
      });
    } else {
      logger.error("Error during token exchange", error);
    }
    throw error;
  }
}
