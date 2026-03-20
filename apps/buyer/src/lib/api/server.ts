import { type ApiClient, createApiClient } from "@cf/api";
import { auth } from "@clerk/nextjs/server";

import { ApiError } from "../errors";
import { logger } from "../utils/logger";
import { exchangeClerkToken } from "./auth";

/**
 * Server-side function for getting an API client in Server Components,
 * Route Handlers, and Server Actions.
 *
 * @example
 * ```tsx
 * // In a Server Component
 * export default async function FarmPage() {
 *   const api = await getServerApiClient();
 *   const { data } = await api.GET("/farms");
 *   // ...
 * }
 * ```
 *
 * @example
 * ```tsx
 * // In a Route Handler
 * export async function GET() {
 *   const api = await getServerApiClient();
 *   const { data } = await api.GET("/farms");
 *   return Response.json(data);
 * }
 * ```
 */
export async function getServerApiClient(): Promise<ApiClient> {
  const { getToken, userId } = await auth();

  // Return unauthenticated client for public endpoints
  if (!userId) {
    return createApiClient({
      authTokenProvider: async () => null,
    });
  }

  // Get Clerk token for this request
  const clerkToken = await getToken();

  if (!clerkToken) {
    throw new ApiError("Failed to get Clerk token for authenticated request", {
      status: 401,
      errorCode: "AUTH_NO_CLERK_TOKEN",
      errorType: "AUTHENTICATION_ERROR",
    });
  }

  try {
    // Exchange Clerk token for internal JWT
    const { accessToken } = await exchangeClerkToken(clerkToken);

    // Return client with static token for this request
    return createApiClient({
      authTokenProvider: async () => accessToken,
    });
  } catch (error) {
    logger.error("Failed to create server API client", error);

    if (error instanceof Error && "status" in error && error.status === 401) {
      throw new ApiError("Authentication failed", {
        status: 401,
        errorCode: "AUTH_EXCHANGE_FAILED",
        errorType: "AUTHENTICATION_ERROR",
        originalError: error,
      });
    }

    throw error;
  }
}
