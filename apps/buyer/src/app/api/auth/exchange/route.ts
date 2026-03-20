import { NextResponse } from "next/server";

import { getPublicApiClient } from "@/lib/api";
import { ApiError } from "@/lib/errors";
import { mapLegacyRoles } from "@/lib/schemas/auth";
import {
  clearAuthCookies,
  getCsrfToken,
  setAuthCookies,
  setCsrfTokenCookie,
} from "@/lib/server/cookies";
import { tokenExchangeService } from "@/lib/services/auth/token-exchange.service";
import { logger } from "@/lib/utils/logger";
import {
  type AuthSession,
  TokenExchangeRequestSchema,
  TokenExchangeResponseSchema,
} from "@/types/auth";

/**
 * POST /api/auth/exchange
 *
 * Exchange a Clerk token for backend authentication tokens.
 * Sets secure HTTP-only cookies for tokens and regular cookies for user metadata.
 */
// Handle CORS preflight
export async function OPTIONS(_request: Request) {
  return new NextResponse(null, { status: 200 });
}

export async function POST(request: Request) {
  // Note: Exchange endpoint is for initial authentication
  // Check if we already have valid auth cookies first
  const { hasAuthCookies } = await import("@/lib/server/cookie-verification");
  const hasValidCookies = await hasAuthCookies();

  if (hasValidCookies) {
    // If we already have valid cookies, don't re-exchange
    // This prevents clearing cookies during navigation
    const { getUserMetadata } = await import("@/lib/server/cookies");
    const metadata = await getUserMetadata();

    logger.info(
      "Exchange endpoint: Valid cookies already exist, skipping exchange",
      {
        userId: metadata?.userId,
        hasMetadata: !!metadata,
      },
    );

    // Return the existing user data
    if (metadata) {
      return NextResponse.json({
        userId: metadata.userId,
        email: metadata.email,
        roles: metadata.roles,
        expiresAt: metadata.expiresAt,
      });
    }
  }

  const csrfHeader = request.headers.get("X-CSRF-Token");
  const csrfCookie = await getCsrfToken();

  logger.info("Exchange endpoint CSRF check", {
    hasHeader: !!csrfHeader,
    headerValue: csrfHeader,
    hasCookie: !!csrfCookie,
    cookieValue: csrfCookie,
  });

  // Only clear cookies if we're doing a fresh authentication
  // This prevents cookie loss during navigation
  logger.info("Exchange endpoint: Clearing cookies for fresh authentication");
  await clearAuthCookies();

  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = TokenExchangeRequestSchema.safeParse(body);

    if (!validationResult.success) {
      logger.warn("Invalid token exchange request", {
        errors: validationResult.error.flatten(),
      });
      return NextResponse.json(
        {
          message: "Invalid request",
          errors: validationResult.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { clerkToken } = validationResult.data;

    // Call backend /users/login endpoint
    const api = getPublicApiClient();
    let response = await api.client.POST("/users/login", {
      body: { token: clerkToken },
    });

    // Handle backend error responses
    if (response.error) {
      const errorDetails = response.error;
      // Note: Could also use ApiError.fromAPIErrorResponse(errorDetails, response.response?.status)
      // for more structured error handling if needed
      const firstError = errorDetails.errors?.[0];

      logger.error("Backend login failed", {
        status: response.response?.status,
        statusText: response.response?.statusText,
        error: response.error,
        errorCode: firstError?.code,
        traceId: errorDetails.traceId,
      });

      // Handle specific error cases
      if (response.response?.status === 401) {
        return NextResponse.json(
          { message: "Invalid authentication token" },
          { status: 401 },
        );
      }

      if (response.response?.status === 403) {
        return NextResponse.json(
          { message: "Access forbidden" },
          { status: 403 },
        );
      }

      // Handle USER_NOT_FOUND with fallback registration
      if (firstError?.code === "USER_NOT_FOUND") {
        try {
          const registrationData =
            await tokenExchangeService.handleUserNotFoundWithRegistration(
              clerkToken,
              {
                message: firstError.message,
                code: firstError.code,
                traceId: errorDetails.traceId,
              },
            );

          // Use the registration data directly - it will be validated by TokenExchangeResponseSchema
          response = {
            data: registrationData,
            error: undefined,
            response: new Response(),
          };
        } catch (fallbackError) {
          // Return the original USER_NOT_FOUND error
          return NextResponse.json(
            {
              message: firstError?.message || "User not found",
              errorCode: firstError?.code,
              traceId: errorDetails.traceId,
            },
            { status: response.response?.status || 404 },
          );
        }
      } else {
        // Generic error response for non-USER_NOT_FOUND errors
        return NextResponse.json(
          {
            message: firstError?.message || "Authentication failed",
            errorCode: firstError?.code,
            traceId: errorDetails.traceId,
          },
          { status: response.response?.status || 500 },
        );
      }
    }

    // Validate successful response data
    const responseValidation = TokenExchangeResponseSchema.safeParse(
      response.data,
    );

    if (!responseValidation.success) {
      logger.error("Invalid backend response format", {
        errors: responseValidation.error.flatten(),
        data: response.data,
        rawExpiresAt: response.data?.expiresAt,
        expiresAtType: typeof response.data?.expiresAt,
        zodErrors: responseValidation.error.issues,
      });
      return NextResponse.json(
        { message: "Invalid server response" },
        { status: 500 },
      );
    }

    const tokenData = responseValidation.data;

    // Map legacy role names from backend (e.g., "Farmer" -> "FarmOwner")
    const mappedRoles = mapLegacyRoles(tokenData.roles);

    // Create AuthSession object
    const session: AuthSession = {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      userId: tokenData.userId,
      email: tokenData.email,
      roles: mappedRoles,
      expiresAt: tokenData.expiresAt, // Access token expiration
    };

    // Log token expiration times for debugging
    logger.info("Token expiration times", {
      accessTokenExpiresAt: new Date(session.expiresAt).toISOString(),
      accessTokenExpiresInMs: session.expiresAt - Date.now(),
      refreshTokenWillExpireAt: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    });

    // Set authentication cookies
    await setAuthCookies(session);

    // Generate and set CSRF token for future requests
    const csrfToken = crypto.randomUUID();
    await setCsrfTokenCookie(csrfToken);

    // Verify cookies were actually set
    const { hasAuthCookies } = await import("@/lib/server/cookie-verification");
    const cookiesSet = await hasAuthCookies();

    if (!cookiesSet) {
      logger.error("Failed to verify cookies after setting", {
        userId: session.userId,
      });

      // Attempt to set cookies again
      logger.info("Retrying cookie setting");
      await setAuthCookies(session);

      // Check again
      const retriedCookiesSet = await hasAuthCookies();
      if (!retriedCookiesSet) {
        logger.error("Cookie setting failed after retry", {
          userId: session.userId,
        });
      }
    }

    // Return user metadata (not tokens) to the client
    return NextResponse.json({
      userId: session.userId,
      email: session.email,
      roles: session.roles,
      expiresAt: session.expiresAt,
      csrfToken,
    });
  } catch (error) {
    // Handle unexpected errors
    if (error instanceof ApiError) {
      logger.error("API error during token exchange", {
        message: error.message,
        status: error.status,
        errorCode: error.errorCode,
        traceId: error.traceId,
      });
      return NextResponse.json(
        {
          message: error.message,
          errorCode: error.errorCode,
          traceId: error.traceId,
        },
        { status: error.status || 500 },
      );
    }

    logger.error("Unexpected error during token exchange", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
