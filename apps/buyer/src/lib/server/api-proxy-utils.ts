import { refreshAccessToken } from "@/lib/api/token-refresh";
import {
  getRefreshToken,
  getUserMetadata,
  setAuthCookies,
} from "@/lib/server/cookies";
import { logger } from "@/lib/utils/logger";
import type { AuthSession } from "@/types/auth";

/**
 * Check if an access token is expired or about to expire
 * @param expiresAt - Expiration timestamp in milliseconds
 * @param bufferMinutes - Minutes before expiration to consider token as expired (default: 2)
 */
export function isTokenExpired(expiresAt: number, bufferMinutes = 2): boolean {
  const now = Date.now();
  const bufferMs = bufferMinutes * 60 * 1000;
  return now >= expiresAt - bufferMs;
}

/**
 * Refresh access token if needed and update cookies
 * @returns New access token if refreshed, null otherwise
 */
export async function refreshTokenIfNeeded(): Promise<string | null> {
  try {
    // Get current user metadata to check expiration
    const userMetadata = await getUserMetadata();
    if (!userMetadata) {
      logger.info("No user metadata found, skipping token refresh");
      return null;
    }

    // Check if token is expired or about to expire
    if (!isTokenExpired(userMetadata.expiresAt)) {
      logger.info("Token not expired, skipping refresh");
      return null;
    }

    // Get refresh token
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      logger.warn("No refresh token available for expired access token");
      return null;
    }

    logger.info("Access token expired or expiring soon, refreshing", {
      expiresAt: new Date(userMetadata.expiresAt).toISOString(),
      userId: userMetadata.userId,
    });

    // Refresh the token
    const refreshResult = await refreshAccessToken(refreshToken);

    // Create new session with refreshed tokens
    const newSession: AuthSession = {
      accessToken: refreshResult.accessToken,
      refreshToken: refreshResult.refreshToken,
      userId: userMetadata.userId,
      email: userMetadata.email,
      roles: userMetadata.roles,
      expiresAt: refreshResult.expiresAt * 1000, // Convert to milliseconds
    };

    // Update all auth cookies
    await setAuthCookies(newSession);

    logger.info("Token refresh successful", {
      userId: userMetadata.userId,
      newExpiresAt: new Date(refreshResult.expiresAt * 1000).toISOString(),
    });

    return refreshResult.accessToken;
  } catch (error) {
    logger.error("Failed to refresh token", error);
    return null;
  }
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
    // No content type, try to read as blob
    return await request.blob();
  }

  // Handle different content types
  if (contentType.includes("application/json")) {
    const json = await request.json();
    return JSON.stringify(json);
  } else if (contentType.includes("multipart/form-data")) {
    // FormData should be passed as-is
    return await request.formData();
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
