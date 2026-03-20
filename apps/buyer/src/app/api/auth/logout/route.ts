import { NextResponse } from "next/server";

import { revokeTokenOnServer } from "@/lib/api/token-revocation";
import {
  clearAuthCookies,
  getAccessToken,
  getRefreshToken,
} from "@/lib/server/cookies";
import { logger } from "@/lib/utils/logger";

/**
 * POST /api/auth/logout
 *
 * Handle user logout by revoking tokens on the backend and clearing all auth cookies.
 * Ensures client-side logout even if backend revocation fails.
 */
export async function POST() {
  // Validate CSRF token for logout requests
  // const isValidCsrf = await validateCsrfToken(request);
  // if (!isValidCsrf) {
  //   logger.warn("Logout called without valid CSRF token");
  //   return createCsrfErrorResponse();
  // }

  try {
    // Get tokens from HTTP-only cookies
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();

    // Attempt to revoke tokens on backend
    if (accessToken && refreshToken) {
      try {
        await revokeTokenOnServer(refreshToken, accessToken);
        logger.info("Backend token revocation successful");
      } catch (backendError) {
        // Log the error but continue with logout
        // Client-side logout should succeed even if backend fails
        logger.warn(
          "Backend token revocation failed, proceeding with client logout",
          {
            error:
              backendError instanceof Error
                ? backendError.message
                : "Unknown error",
          },
        );
      }
    } else {
      logger.info(
        "No tokens found for revocation, proceeding with cookie cleanup",
      );
    }

    // Clear all authentication cookies regardless of backend response
    await clearAuthCookies();

    logger.info("Logout completed successfully");

    return NextResponse.json(
      {
        message: "Logged out successfully",
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Unexpected error during logout", error);

    // Even on error, try to clear cookies
    try {
      await clearAuthCookies();
    } catch (clearError) {
      logger.error("Failed to clear cookies during error recovery", clearError);
    }

    return NextResponse.json(
      {
        message: "Logout completed with errors",
        success: false,
      },
      { status: 500 },
    );
  }
}
