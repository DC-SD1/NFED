/**
 * Client-side CSRF utilities
 */

import { logger } from "./logger";

/**
 * Get CSRF token from cookie
 */
export function getCsrfToken(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  // Try secure prefixed cookie first (production)
  let match = document.cookie.match(/(?:^|; )__Secure-cf-csrf-token=([^;]*)/);
  if (match?.[1]) {
    return decodeURIComponent(match[1]);
  }

  // Fallback to unprefixed cookie (development)
  match = document.cookie.match(/(?:^|; )cf-csrf-token=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

/**
 * Add CSRF token to request headers
 */
export function addCsrfHeader(headers: HeadersInit = {}): HeadersInit {
  const csrfToken = getCsrfToken();

  if (!csrfToken) {
    logger.warn("No CSRF token found in cookies");
    return headers;
  }

  // Handle different header formats
  if (headers instanceof Headers) {
    headers.set("X-CSRF-Token", csrfToken);
    return headers;
  } else if (Array.isArray(headers)) {
    return [...headers, ["X-CSRF-Token", csrfToken]];
  } else {
    return {
      ...headers,
      "X-CSRF-Token": csrfToken,
    };
  }
}

/**
 * Ensure CSRF token exists by fetching from server if needed
 */
async function ensureCsrfToken(): Promise<void> {
  const token = getCsrfToken();
  if (!token) {
    try {
      // Use origin to ensure we don't inherit locale prefixes
      const url = new URL("/api/auth/csrf", window.location.origin);
      await fetch(url.toString(), { method: "GET" });
    } catch (error) {
      logger.warn("Failed to fetch CSRF token", {
        error,
      });
    }
  }
}

/**
 * Fetch wrapper that automatically includes CSRF token
 */
export async function fetchWithCsrf(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  // Only add CSRF for state-changing methods
  const method = options.method?.toUpperCase() || "GET";

  if (
    method === "POST" ||
    method === "PUT" ||
    method === "DELETE" ||
    method === "PATCH"
  ) {
    // Ensure CSRF token exists before making the request
    await ensureCsrfToken();
    options.headers = addCsrfHeader(options.headers);
  }

  return fetch(url, options);
}
