import {refreshAccessToken} from "@/lib/api/token-refresh";
import {getRefreshToken, getUserMetadata, setAuthCookies,} from "@/lib/server/cookies";
import {parseApiDateTime} from "@/lib/utils/date-converter";
import {logger} from "@/lib/utils/logger";
import type {AuthSession} from "@/types/auth";

/**
 * Check if an access token is expired or about to expire
 * @param expiresAt - Access token expiration timestamp in milliseconds
 * @param bufferSeconds - Seconds before expiration to consider token as expired (default: 30)
 */
export function isTokenExpired(
  expiresAt: number,
  bufferSeconds = 30,
): boolean {
  const now = Date.now();
  const bufferMs = bufferSeconds * 1000;
  const expirationThreshold = expiresAt - bufferMs;
  return now >= expirationThreshold;
}

/**
 * Refresh access token if needed and update cookies
 * @returns New access token if refreshed, null otherwise
 */
export async function refreshTokenIfNeeded(): Promise<string | null> {
  const MAX_RETRY_ATTEMPTS = 2;

  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      // Get refresh token first - if we don't have one, no point checking anything else
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        logger.info("No refresh token available, skipping token refresh");
        return null;
      }


      // Get current user metadata to check expiration
      const userMetadata = await getUserMetadata();
      let shouldRefresh = false;
      let refreshReason = "";

      if (userMetadata) {
        // We have user metadata, check if token is expired
        const tokenExpiresAt = userMetadata.expiresAt;

        // Check if token is expired or about to expire
        const timeUntilExpiry = tokenExpiresAt - Date.now();
        const isExpired = isTokenExpired(tokenExpiresAt);

        if (!isExpired) {
          return null;
        }

        // Token is expired or about to expire
        shouldRefresh = true;
        refreshReason = "token_expired";

        // Log when token is about to expire or already expired
        if (timeUntilExpiry > 0) {
          logger.warn("Token about to expire, refreshing", {
            expiresAt: new Date(tokenExpiresAt).toISOString(),
            secondsUntilExpiry: Math.floor(timeUntilExpiry / 1000),
            userId: userMetadata.userId,
          });
        } else {
          logger.warn("Token already expired, refreshing", {
            expiredAt: new Date(tokenExpiresAt).toISOString(),
            expiredForSeconds: Math.floor(-timeUntilExpiry / 1000),
            userId: userMetadata.userId,
          });
        }
      } else {
        // No user metadata available (likely expired cookie)
        // But we have a refresh token, so attempt refresh to restore full session
        shouldRefresh = true;
        refreshReason = "metadata_missing";

        logger.warn(
          "User metadata missing but refresh token available, attempting refresh",
          {
            reason: "metadata_expired_but_refresh_token_available",
          },
        );
      }

      // If we don't need to refresh, return early
      if (!shouldRefresh) {
        return null;
      }

      logger.info("Attempting token refresh", {
        attempt,
        maxAttempts: MAX_RETRY_ATTEMPTS,
        reason: refreshReason,
      });

      const refreshResult = await refreshAccessToken(refreshToken);

      // Parse the expiresAt value using our robust converter
      const parsedExpiresAt = parseApiDateTime(refreshResult.expiresAt);

      // Create new session with refreshed tokens
      // If userMetadata is null, we need to get user info from the refresh result
      if (!userMetadata) {
        logger.error(
          "Cannot create session: userMetadata is null after token refresh",
          {
            refreshResultKeys: Object.keys(refreshResult),
            hasAccessToken: !!refreshResult.accessToken,
            hasRefreshToken: !!refreshResult.refreshToken,
          },
        );

        // Return the access token but don't set cookies if we can't get user info
        return refreshResult.accessToken;
      }

      const newSession: AuthSession = {
        accessToken: refreshResult.accessToken,
        refreshToken: refreshResult.refreshToken,
        userId: userMetadata.userId,
        email: userMetadata.email,
        roles: userMetadata.roles,
        expiresAt: parsedExpiresAt, // Already in milliseconds from parseApiDateTime
      };

      // Update all auth cookies
      try {
        await setAuthCookies(newSession);
      } catch (cookieError) {
        logger.error("CRITICAL: setAuthCookies failed in api-proxy-utils", {
          error:
            cookieError instanceof Error
              ? cookieError.message
              : String(cookieError),
          stack: cookieError instanceof Error ? cookieError.stack : undefined,
        });
        throw cookieError; // Re-throw so the refresh fails properly
      }

      // Verify the new refresh token was stored
      const verifyRefreshToken = await getRefreshToken();
      
      // CRITICAL: If the new refresh token wasn't stored properly, this is a major issue
      if (verifyRefreshToken !== newSession.refreshToken) {
        logger.error("CRITICAL: New refresh token was not stored properly!", {
          userId: userMetadata.userId
        });
      }

      return refreshResult.accessToken;
    } catch (error) {
      logger.error(
        `Failed to refresh token (attempt ${attempt}/${MAX_RETRY_ATTEMPTS})`,
        error,
      );

      // If this was not the last attempt, wait briefly before retrying
      if (attempt < MAX_RETRY_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        continue;
      }

      return null;
    }
  }

  return null;
}

/**
 * Generate a unique request ID for tracing
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Headers that should not be forwarded to the backend
 */
export const BLOCKED_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "keep-alive",
  "upgrade",
  "te",
  "trailer",
  "transfer-encoding",
  "proxy-authorization",
  "proxy-authenticate",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-real-ip",
  "cf-ipcountry",
  "cf-ray",
  "cf-connecting-ip",
]);

/**
 * Headers that should not be returned to the client
 */
export const BLOCKED_RESPONSE_HEADERS = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
  "proxy-authenticate",
  "proxy-authorization",
  "content-encoding",
]);

/**
 * Sanitize headers by removing blocked ones
 */
export function sanitizeHeaders(
  headers: Headers,
  blockedHeaders: Set<string>,
): Headers {
  const sanitized = new Headers();

  headers.forEach((value, key) => {
    if (!blockedHeaders.has(key.toLowerCase())) {
      sanitized.set(key, value);
    }
  });

  return sanitized;
}

/**
 * Format proxy-specific error response to match backend error structure
 * This ensures the client receives consistent error formats
 */
export interface ProxyErrorResponse {
  errors: {
    code: string;
    message: string;
    type: number;
  }[];
  traceId: string;
  timestamp: string;
}

export function formatProxyError(
  error: unknown,
  requestId: string,
  context?: string,
): ProxyErrorResponse {
  const timestamp = new Date().toISOString();
  const message =
    error instanceof Error
      ? `${context ? `${context}: ` : ""}${error.message}`
      : context || "An unexpected error occurred";

  // Format to match SharedKernelCFErrorResponse structure
  return {
    errors: [
      {
        code: "PROXY_ERROR",
        message,
        type: 7, // Using highest error type for proxy errors
      },
    ],
    traceId: requestId,
    timestamp,
  };
}

/**
 * Check if a request method supports a body
 */
export function methodSupportsBody(method: string): boolean {
  const methodsWithBody = ["POST", "PUT", "PATCH", "DELETE"];
  return methodsWithBody.includes(method.toUpperCase());
}

/**
 * Prepare request body based on content type
 */
export async function prepareRequestBody(
  request: Request,
  contentType: string | null,
): Promise<BodyInit | undefined> {
  if (!methodSupportsBody(request.method)) {
    return undefined;
  }

  if (!contentType) {
    // No content type header - for file uploads from openapi-fetch,
    // return the raw body stream to preserve file content
    return request.body || undefined;
  }

  // Handle different content types
  if (contentType.includes("application/json")) {
    try {
      const jsonBody = await request.json();
      return JSON.stringify(jsonBody);
    } catch (_) {
      // If JSON parsing fails, return empty object
      return JSON.stringify({});
    }
  } else if (contentType.includes("multipart/form-data")) {
    // Return the raw body stream to preserve file content
    return request.body || undefined;
  } else if (contentType.includes("application/x-www-form-urlencoded")) {
    return await request.text();
  } else if (contentType.includes("text/")) {
    return await request.text();
  } else {
    // Default to blob for binary data
    return await request.blob();
  }
}

/**
 * Add security headers to response
 */
export function addSecurityHeaders(headers: Headers): void {
  // Add security headers if not already present
  if (!headers.has("x-content-type-options")) {
    headers.set("x-content-type-options", "nosniff");
  }
  if (!headers.has("x-frame-options")) {
    headers.set("x-frame-options", "DENY");
  }
  if (!headers.has("x-xss-protection")) {
    headers.set("x-xss-protection", "1; mode=block");
  }
  if (!headers.has("referrer-policy")) {
    headers.set("referrer-policy", "strict-origin-when-cross-origin");
  }
}

/**
 * Calculate request duration in milliseconds
 */
export function calculateDuration(startTime: number): number {
  return Math.round(performance.now() - startTime);
}

/**
 * Headers that should be forwarded for caching
 */
export const CACHE_HEADERS = [
  "cache-control",
  "etag",
  "last-modified",
  "expires",
  "vary",
  "age",
];

/**
 * Headers that should be forwarded for conditional requests
 */
export const CONDITIONAL_HEADERS = [
  "if-none-match",
  "if-modified-since",
  "if-match",
  "if-unmodified-since",
  "if-range",
];

/**
 * Check if a request method is cacheable
 */
export function isCacheableMethod(method: string): boolean {
  return ["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());
}

/**
 * Check if a response status is cacheable
 */
export function isCacheableStatus(status: number): boolean {
  return [200, 203, 204, 206, 300, 301, 404, 405, 410, 414, 501].includes(
    status,
  );
}

/**
 * Extract cache directives from Cache-Control header
 */
export function parseCacheControl(
  header: string | null,
): Map<string, string | boolean> {
  const directives = new Map<string, string | boolean>();

  if (!header) {
    return directives;
  }

  const parts = header.toLowerCase().split(",");

  for (const part of parts) {
    const [key, value] = part.trim().split("=");
    if (key) {
      directives.set(key, value || true);
    }
  }

  return directives;
}

/**
 * Check if response should be cached based on headers
 */
export function shouldCacheResponse(
  method: string,
  status: number,
  headers: Headers,
): boolean {
  if (!isCacheableMethod(method) || !isCacheableStatus(status)) {
    return false;
  }

  const cacheControl = parseCacheControl(headers.get("cache-control"));

  // Don't cache if explicitly told not to
  if (
    cacheControl.has("no-store") ||
    cacheControl.has("private") ||
    cacheControl.has("no-cache")
  ) {
    return false;
  }

  // Cache if has explicit cache headers
  if (
    cacheControl.has("public") ||
    cacheControl.has("max-age") ||
    cacheControl.has("s-maxage") ||
    headers.has("etag") ||
    headers.has("last-modified")
  ) {
    return true;
  }

  return false;
}
