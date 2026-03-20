import type { components } from "@cf/api";

import { createApiClientWithToken } from "@/lib/api";

import { ApiError } from "../errors";
import { ROLES } from "../schemas/auth";
import { logger } from "../utils/logger";

// Use generated OpenAPI types
type UserRegistrationData =
  components["schemas"]["UserModuleApiEndpointsRegisterRegisterUserRequest"];

// Define the actual backend response structure (what the backend actually returns)
// Backend only returns userId as per OpenAPI spec
interface BackendUserRegistrationResponse {
  userId: string;
}

/**
 * Register a new user on the backend after successful Clerk sign-up
 * @param userData - User data including Clerk authId and profile information
 * @param clerkToken - Clerk access token for authentication
 * @returns Complete user data from backend registration
 */
export async function registerUserOnBackend(
  userData: UserRegistrationData,
  clerkToken: string,
): Promise<BackendUserRegistrationResponse> {
  logger.info("Starting backend user registration", {
    apiUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    endpoint: "/users/register",
    authId: userData.authId,
  });

  try {
    // Create API client with Clerk token for authentication
    const api = createApiClientWithToken(clerkToken);

    // Call the registration endpoint using openapi-fetch
    const response = await api.client.POST("/users/register", {
      body: {
        email: userData.email,
        authId: userData.authId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: undefined,
        roles: userData.roles || [ROLES.BUYER], // Default to FarmOwner role
      },
    });

    // Handle openapi-fetch error responses
    if (response.error) {
      const errorDetails = response.error;
      const firstError = errorDetails.errors?.[0];

      logger.error("User registration failed", {
        status: response.response?.status,
        statusText: response.response?.statusText,
        error: response.error,
        errorCode: firstError?.code,
        traceId: errorDetails.traceId,
        userData: {
          // Only log non-PII identifiers for correlation
          authId: userData.authId,
        },
      });

      // Throw custom ApiError with proper structure
      throw new ApiError(
        firstError?.message ||
          `User registration failed: ${response.response?.status} ${response.response?.statusText}`,
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
    const data = response.data as unknown;

    // Handle both response formats:
    // 1. Object with userId property: { userId: "uuid" }
    // 2. Plain string UUID: "uuid"
    let userId: string;

    if (typeof data === "string" && data.length > 0) {
      // Backend returned plain UUID string
      userId = data;
      logger.info("Backend returned plain UUID string", { userId });
    } else if (
      data &&
      typeof data === "object" &&
      "userId" in data &&
      typeof (data as any).userId === "string"
    ) {
      // Backend returned object with userId property
      userId = (data as any).userId;
      logger.info("Backend returned object with userId", { userId });
    } else {
      logger.error("Invalid user registration response structure", {
        data,
        dataType: typeof data,
        hasUserId: data && typeof data === "object" ? "userId" in data : false,
      });
      throw new Error("Invalid user registration response structure");
    }

    return {
      userId,
    };
  } catch (error) {
    // Check if it's a network/CORS error
    if (
      error instanceof TypeError &&
      error.message.includes("Failed to fetch")
    ) {
      logger.error("CORS or network error during user registration", {
        error: error.message,
        apiUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
        endpoint: "/users/register",
        hint: "Check if backend CORS allows this origin and includes credentials",
      });
    }
    throw error;
  }
}
