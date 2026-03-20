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
  maxAge: 15 * 60, // 15 minutes in seconds
};

const REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  ...DEFAULT_COOKIE_OPTIONS,
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  sameSite: "strict", // Stricter for refresh tokens
};

const USER_METADATA_COOKIE_OPTIONS: CookieOptions = {
  ...DEFAULT_COOKIE_OPTIONS,
  httpOnly: false, // Allow client-side access for user info
  maxAge: 15 * 60, // Same as access token
};

/**
 * Set authentication cookies with appropriate security options
 */
export async function setAuthCookies(session: AuthSession): Promise<void> {
  try {
    // Set access token cookie (signed, HTTP-only)
    await setSecureCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN, session.accessToken, {
      ...ACCESS_TOKEN_COOKIE_OPTIONS,
      sign: true,
      encrypt: false, // JWTs are already signed
    });

    // Set refresh token cookie (signed, HTTP-only)
    await setSecureCookie(
      AUTH_COOKIE_NAMES.REFRESH_TOKEN,
      session.refreshToken,
      {
        ...REFRESH_TOKEN_COOKIE_OPTIONS,
        sign: true,
        encrypt: false, // JWTs are already signed
      },
    );

    // Set user metadata cookie (encrypted and signed, non-httpOnly for client access)
    const userMetadata: UserMetadata = {
      userId: session.userId,
      email: session.email,
      roles: session.roles.length > 0 ? session.roles : [ROLES.FARM_OWNER], // Default to 'user' role if none provided
      expiresAt: session.expiresAt,
    };

    await setSecureCookie(
      AUTH_COOKIE_NAMES.USER_METADATA,
      JSON.stringify(userMetadata),
      {
        ...USER_METADATA_COOKIE_OPTIONS,
        sign: true,
        encrypt: true, // Encrypt sensitive user data
      },
    );

    logger.info("Auth cookies set successfully", { userId: session.userId });
  } catch (error) {
    logger.error("Failed to set auth cookies", error);
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
    // Update access token (signed)
    await setSecureCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
      ...ACCESS_TOKEN_COOKIE_OPTIONS,
      sign: true,
      encrypt: false,
    });

    // Update user metadata with new expiration (encrypted and signed)
    await setSecureCookie(
      AUTH_COOKIE_NAMES.USER_METADATA,
      JSON.stringify(userMetadata),
      {
        ...USER_METADATA_COOKIE_OPTIONS,
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
  const { accessToken, userMetadata } = await getAuthCookies();

  if (!accessToken || !userMetadata) {
    return false;
  }

  // Check if the session is not expired
  const now = Date.now();
  return userMetadata.expiresAt > now;
}
