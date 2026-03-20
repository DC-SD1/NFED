import { logger } from "@/lib/utils/logger";
import type { AuthSession, CookieOptions, UserMetadata } from "@/types/auth";

import { ROLES } from "../schemas/auth";
import {
  clearSecureCookie,
  getSecureCookie,
  setSecureCookie,
} from "./secure-cookies";

// Cookie names as constants
export const AUTH_COOKIE_NAMES = {
  ACCESS_TOKEN: "cf-auth-access",
  REFRESH_TOKEN: "cf-auth-refresh",
  USER_METADATA: "cf-auth-user",
  CSRF_TOKEN: "cf-csrf-token",
} as const;

// Default cookie options for different token types
const DEFAULT_COOKIE_OPTIONS: CookieOptions = {
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};

const ACCESS_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  ...DEFAULT_COOKIE_OPTIONS,
  // maxAge will be set dynamically based on actual token expiration
};

const REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  ...DEFAULT_COOKIE_OPTIONS,
  sameSite: "lax", // Use lax to allow cookies during navigation
  // maxAge will be set dynamically based on actual token expiration
};

const USER_METADATA_COOKIE_OPTIONS: CookieOptions = {
  ...DEFAULT_COOKIE_OPTIONS,
  httpOnly: false, // Allow client-side access for user info
  // maxAge will be set dynamically based on actual token expiration
};

/**
 * Set authentication cookies with appropriate security options
 */
export async function setAuthCookies(session: AuthSession): Promise<void> {
  const operationId = crypto.randomUUID();

  logger.info("Starting auth cookie set operation", {
    operationId,
    userId: session.userId,
    email: session.email,
    roles: session.roles,
    accessTokenExpiresAt: new Date(session.expiresAt).toISOString(),
    refreshTokenExpiresAt: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString(),
  });

  try {
    // Calculate dynamic cookie expiration based on actual token expiration
    const now = Date.now();

    // Access token: use expiresAt from session
    const accessTokenExpiresAt = session.expiresAt;

    // Refresh token: always 30 days from now
    const refreshTokenExpiresAt = now + 30 * 24 * 60 * 60 * 1000; // 30 days in ms

    // Calculate maxAge in seconds (cookie expiration expects seconds, not milliseconds)
    const accessTokenMaxAge = Math.max(
      0,
      Math.floor((accessTokenExpiresAt - now) / 1000),
    );
    const refreshTokenMaxAge = Math.max(
      0,
      Math.floor((refreshTokenExpiresAt - now) / 1000),
    );

    // Log actual cookie expiration times for debugging
    logger.info("Cookie expiration calculation", {
      operationId,
      now: new Date(now).toISOString(),
      accessTokenExpiresAt: new Date(accessTokenExpiresAt).toISOString(),
      refreshTokenExpiresAt: new Date(refreshTokenExpiresAt).toISOString(),
      accessTokenMaxAge: `${accessTokenMaxAge}s (${Math.floor(accessTokenMaxAge / 60)} minutes)`,
      refreshTokenMaxAge: `${refreshTokenMaxAge}s (${Math.floor(refreshTokenMaxAge / 3600)} hours)`,
      cookieExpirationTimes: {
        accessToken: new Date(now + accessTokenMaxAge * 1000).toISOString(),
        refreshToken: new Date(now + refreshTokenMaxAge * 1000).toISOString(),
        userMetadata: new Date(now + accessTokenMaxAge * 1000).toISOString(),
      },
    });
    await setSecureCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN, session.accessToken, {
      ...ACCESS_TOKEN_COOKIE_OPTIONS,
      maxAge: accessTokenMaxAge,
      sign: true,
      encrypt: false, // JWTs are already signed
    });

    // Set refresh token cookie (signed, HTTP-only)
    logger.info("Setting refresh token cookie", {
      operationId,
      cookieName: AUTH_COOKIE_NAMES.REFRESH_TOKEN,
      tokenLength: session.refreshToken.length,
      tokenPrefix: session.refreshToken.substring(0, 20) + "...",
      maxAge: refreshTokenMaxAge,
      options: REFRESH_TOKEN_COOKIE_OPTIONS,
    });

    await setSecureCookie(
      AUTH_COOKIE_NAMES.REFRESH_TOKEN,
      session.refreshToken,
      {
        ...REFRESH_TOKEN_COOKIE_OPTIONS,
        maxAge: refreshTokenMaxAge,
        sign: true,
        encrypt: false, // JWTs are already signed
      },
    );

    // Set user metadata cookie (encrypted and signed, non-httpOnly for client access)
    const userMetadata: UserMetadata = {
      userId: session.userId,
      email: session.email,
      roles: session.roles.length > 0 ? session.roles : [ROLES.FARM_OWNER], // Default to 'user' role if none provided
      expiresAt: session.expiresAt, // Access token expiration
    };

    logger.info("Setting user metadata cookie", {
      operationId,
      cookieName: AUTH_COOKIE_NAMES.USER_METADATA,
      metadata: userMetadata,
      options: USER_METADATA_COOKIE_OPTIONS,
    });

    await setSecureCookie(
      AUTH_COOKIE_NAMES.USER_METADATA,
      JSON.stringify(userMetadata),
      {
        ...USER_METADATA_COOKIE_OPTIONS,
        maxAge: refreshTokenMaxAge, // Should expire with refresh token, not access token because we are using refresh token to get a new access token and metadata is critical
        sign: true,
        encrypt: true, // Encrypt sensitive user data
      },
    );

    logger.info("Auth cookies set successfully", {
      operationId,
      userId: session.userId,
      cookiesSet: [
        AUTH_COOKIE_NAMES.ACCESS_TOKEN,
        AUTH_COOKIE_NAMES.REFRESH_TOKEN,
        AUTH_COOKIE_NAMES.USER_METADATA,
      ],
    });
  } catch (error) {
    logger.error("Failed to set auth cookies", {
      operationId,
      userId: session.userId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new Error("Failed to set authentication cookies");
  }
}

/**
 * Get authentication cookies
 */
export async function getAuthCookies(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
  userMetadata: UserMetadata | null;
}> {
  try {
    // Get access token (signed)
    const accessToken = await getSecureCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN, {
      sign: true,
      decrypt: false,
    });

    // Get refresh token (signed)
    const refreshToken = await getSecureCookie(
      AUTH_COOKIE_NAMES.REFRESH_TOKEN,
      { sign: true, decrypt: false },
    );

    // Get user metadata (encrypted and signed)
    const userMetadataStr = await getSecureCookie(
      AUTH_COOKIE_NAMES.USER_METADATA,
      { sign: true, decrypt: true },
    );

    let userMetadata: UserMetadata | null = null;
    if (userMetadataStr) {
      try {
        userMetadata = JSON.parse(userMetadataStr) as UserMetadata;
      } catch {
        logger.warn("Failed to parse user metadata cookie");
      }
    }

    return {
      accessToken,
      refreshToken,
      userMetadata,
    };
  } catch (error) {
    logger.error("Failed to get auth cookies", error);
    return {
      accessToken: null,
      refreshToken: null,
      userMetadata: null,
    };
  }
}

/**
 * Get access token from cookies
 */
export async function getAccessToken(): Promise<string | null> {
  return await getSecureCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN, {
    sign: true,
    decrypt: false,
  });
}

/**
 * Get refresh token from cookies
 */
export async function getRefreshToken(): Promise<string | null> {
  return await getSecureCookie(AUTH_COOKIE_NAMES.REFRESH_TOKEN, {
    sign: true,
    decrypt: false,
  });
}

/**
 * Get user metadata from cookies
 */
export async function getUserMetadata(): Promise<UserMetadata | null> {
  const userMetadataStr = await getSecureCookie(
    AUTH_COOKIE_NAMES.USER_METADATA,
    { sign: true, decrypt: true },
  );

  if (!userMetadataStr) {
    return null;
  }

  try {
    return JSON.parse(userMetadataStr) as UserMetadata;
  } catch {
    logger.warn("Failed to parse user metadata cookie");
    return null;
  }
}

/**
 * Clear all authentication cookies
 */
export async function clearAuthCookies(): Promise<void> {
  try {
    // Clear all auth cookies
    await clearSecureCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN);
    await clearSecureCookie(AUTH_COOKIE_NAMES.REFRESH_TOKEN);
    await clearSecureCookie(AUTH_COOKIE_NAMES.USER_METADATA);
    await clearSecureCookie(AUTH_COOKIE_NAMES.CSRF_TOKEN);

    logger.info("Auth cookies cleared successfully");
  } catch (error) {
    logger.error("Failed to clear auth cookies", error);
    throw new Error("Failed to clear authentication cookies");
  }
}

/**
 * Update only the access token and user metadata cookies (used after token refresh)
 */
export async function updateAccessTokenCookie(
  accessToken: string,
  userMetadata: UserMetadata,
): Promise<void> {
  try {
    const now = Date.now();

    // Access token expiration from userMetadata.expiresAt
    const accessTokenExpiresAt = userMetadata.expiresAt;
    const accessTokenMaxAge = Math.max(
      0,
      Math.floor((accessTokenExpiresAt - now) / 1000),
    );

    // For user metadata, use 30 days (same as refresh token)
    const metadataMaxAge = 30 * 24 * 60 * 60; // 30 days in seconds

    logger.info("Updating access token cookie", {
      accessTokenExpiresAt: new Date(accessTokenExpiresAt).toISOString(),
      accessTokenMaxAge: `${accessTokenMaxAge}s (${Math.floor(accessTokenMaxAge / 60)} minutes)`,
      metadataMaxAge: `${metadataMaxAge}s (${Math.floor(metadataMaxAge / 3600)} hours)`,
    });

    // Update access token (signed)
    await setSecureCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
      ...ACCESS_TOKEN_COOKIE_OPTIONS,
      maxAge: accessTokenMaxAge,
      sign: true,
      encrypt: false,
    });

    // Update user metadata with new expiration (encrypted and signed)
    await setSecureCookie(
      AUTH_COOKIE_NAMES.USER_METADATA,
      JSON.stringify(userMetadata),
      {
        ...USER_METADATA_COOKIE_OPTIONS,
        maxAge: metadataMaxAge,
        sign: true,
        encrypt: true,
      },
    );

    logger.info("Access token cookie updated successfully");
  } catch (error) {
    logger.error("Failed to update access token cookie", error);
    throw new Error("Failed to update access token cookie");
  }
}

/**
 * Set CSRF token cookie
 */
export async function setCsrfTokenCookie(csrfToken: string): Promise<void> {
  await setSecureCookie(AUTH_COOKIE_NAMES.CSRF_TOKEN, csrfToken, {
    ...DEFAULT_COOKIE_OPTIONS,
    httpOnly: false, // Must be readable by JavaScript for CSRF protection
    sameSite: "strict",
    sign: true,
    encrypt: false, // CSRF tokens don't need encryption
  });
}

/**
 * Get CSRF token from cookies
 */
export async function getCsrfToken(): Promise<string | null> {
  return await getSecureCookie(AUTH_COOKIE_NAMES.CSRF_TOKEN, {
    sign: true,
    decrypt: false,
  });
}

/**
 * Validate if authentication cookies are present and not expired
 */
export async function hasValidAuthCookies(): Promise<boolean> {
  const { accessToken, userMetadata, refreshToken } = await getAuthCookies();

  // If we have an access token and user metadata, consider the session valid.
  // We avoid relying on metadata.expiresAt here because it can drift from the
  // real token validity and cause redirect loops. Middleware/clients handle refresh.
  if (accessToken && userMetadata) {
    return true;
  }

  // If we only have a refresh token + metadata, signal not valid so middleware can refresh
  if (refreshToken && userMetadata) {
    logger.info("Refresh token present without access token; needs refresh");
    return false;
  }

  return false;
}
