import { logger } from "@/lib/utils/logger";
import type { UserMetadata } from "@/types/auth";

import {
  AUTH_COOKIE_NAMES,
  getAccessToken,
  getAuthCookies,
  getRefreshToken,
  getUserMetadata,
} from "./cookies";

export interface CookieVerificationResult {
  isValid: boolean;
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  hasUserMetadata: boolean;
  userMetadata: UserMetadata | null;
  issues: string[];
  details: {
    accessTokenPresent: boolean;
    refreshTokenPresent: boolean;
    userMetadataPresent: boolean;
    userMetadataParseable: boolean;
    userMetadataHasRequiredFields: boolean;
    tokensNotExpired: boolean;
  };
}

/**
 * Verify that all required authentication cookies are present and valid
 */
export async function verifyAuthCookies(): Promise<CookieVerificationResult> {
  const issues: string[] = [];
  const details = {
    accessTokenPresent: false,
    refreshTokenPresent: false,
    userMetadataPresent: false,
    userMetadataParseable: false,
    userMetadataHasRequiredFields: false,
    tokensNotExpired: false,
  };

  try {
    // Get all auth cookies
    const { accessToken, refreshToken, userMetadata } = await getAuthCookies();

    // Check access token
    details.accessTokenPresent = !!accessToken;
    if (!accessToken) {
      issues.push(`Missing ${AUTH_COOKIE_NAMES.ACCESS_TOKEN} cookie`);
    }

    // Check refresh token
    details.refreshTokenPresent = !!refreshToken;
    if (!refreshToken) {
      issues.push(`Missing ${AUTH_COOKIE_NAMES.REFRESH_TOKEN} cookie`);
    }

    // Check user metadata
    details.userMetadataPresent = !!userMetadata;
    if (!userMetadata) {
      issues.push(`Missing ${AUTH_COOKIE_NAMES.USER_METADATA} cookie`);
    } else {
      details.userMetadataParseable = true;

      // Verify required fields
      const requiredFields = ["userId", "email", "roles", "expiresAt"];
      const missingFields = requiredFields.filter(
        (field) => !(field in userMetadata),
      );

      if (missingFields.length > 0) {
        issues.push(
          `User metadata missing fields: ${missingFields.join(", ")}`,
        );
      } else {
        details.userMetadataHasRequiredFields = true;

        // Check token expiration
        const now = Date.now();
        const tokenExpiresAt = userMetadata.expiresAt;

        if (tokenExpiresAt <= now) {
          issues.push("Tokens are expired");
        } else {
          details.tokensNotExpired = true;
        }
      }
    }

    const isValid = issues.length === 0;

    logger.info("Cookie verification completed", {
      isValid,
      issues,
      details,
      userId: userMetadata?.userId,
    });

    return {
      isValid,
      hasAccessToken: details.accessTokenPresent,
      hasRefreshToken: details.refreshTokenPresent,
      hasUserMetadata:
        details.userMetadataPresent && details.userMetadataParseable,
      userMetadata,
      issues,
      details,
    };
  } catch (error) {
    logger.error("Cookie verification failed with error", error);
    issues.push(
      "Cookie verification error: " +
        (error instanceof Error ? error.message : "Unknown error"),
    );

    return {
      isValid: false,
      hasAccessToken: false,
      hasRefreshToken: false,
      hasUserMetadata: false,
      userMetadata: null,
      issues,
      details,
    };
  }
}

/**
 * Quick check if auth cookies exist (without full validation)
 */
export async function hasAuthCookies(): Promise<boolean> {
  try {
    const accessToken = await getAccessToken();
    const userMetadata = await getUserMetadata();

    return !!accessToken && !!userMetadata;
  } catch {
    return false;
  }
}

/**
 * Get a detailed cookie status report for debugging
 */
export async function getCookieStatusReport(): Promise<{
  timestamp: string;
  cookies: {
    accessToken: { exists: boolean; length?: number };
    refreshToken: { exists: boolean; length?: number };
    userMetadata: {
      exists: boolean;
      data?: Partial<UserMetadata>;
      error?: string;
    };
  };
  verification: CookieVerificationResult;
}> {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();
  const userMetadata = await getUserMetadata();
  const verification = await verifyAuthCookies();

  return {
    timestamp: new Date().toISOString(),
    cookies: {
      accessToken: {
        exists: !!accessToken,
        length: accessToken?.length,
      },
      refreshToken: {
        exists: !!refreshToken,
        length: refreshToken?.length,
      },
      userMetadata: {
        exists: !!userMetadata,
        data: userMetadata
          ? {
              userId: userMetadata.userId,
              email: userMetadata.email,
              roles: userMetadata.roles,
              expiresAt: userMetadata.expiresAt,
            }
          : undefined,
      },
    },
    verification,
  };
}
