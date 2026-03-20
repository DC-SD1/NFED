import type { NextRequest } from "next/server";

import { getCsrfToken } from "@/lib/server/cookies";
import { logger } from "@/lib/utils/logger";

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomUUID();
}

/**
 * Validate CSRF token using double-submit cookie pattern
 * 
 * @param request - The incoming request
 * @returns true if CSRF token is valid, false otherwise
 */
export async function validateCsrfToken(request: Request | NextRequest): Promise<boolean> {
  // Skip CSRF validation for GET and HEAD requests
  const method = request.method;
  if (method === "GET" || method === "HEAD") {
    return true;
  }

  try {
    // Get CSRF token from cookie
    const csrfCookie = await getCsrfToken();
    
    // Get CSRF token from header
    const csrfHeader = request.headers.get("X-CSRF-Token");
    
    // Both must be present and match
    if (!csrfCookie || !csrfHeader) {
      logger.warn("CSRF token missing", {
        hasCookie: !!csrfCookie,
        hasHeader: !!csrfHeader,
        method: request.method,
        url: request.url
      });
      return false;
    }
    
    if (csrfCookie !== csrfHeader) {
      logger.warn("CSRF token mismatch", {
        method: request.method,
        url: request.url
      });
      return false;
    }
    
    // Additional security: Validate Origin/Referer headers
    const origin = request.headers.get("Origin");
    const referer = request.headers.get("Referer");
    const host = request.headers.get("Host");
    
    // If Origin header is present, validate it
    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          logger.warn("CSRF Origin mismatch", {
            origin: originHost,
            host,
            method: request.method,
            url: request.url
          });
          return false;
        }
      } catch (e) {
        logger.error("Invalid Origin header", { origin });
        return false;
      }
    }
    
    // If no Origin but Referer is present, validate it
    if (!origin && referer && host) {
      try {
        const refererHost = new URL(referer).host;
        if (refererHost !== host) {
          logger.warn("CSRF Referer mismatch", {
            referer: refererHost,
            host,
            method: request.method,
            url: request.url
          });
          return false;
        }
      } catch (e) {
        logger.error("Invalid Referer header", { referer });
        return false;
      }
    }
    
    // For state-changing requests, require either Origin or Referer
    if (!origin && !referer && (method === "POST" || method === "PUT" || method === "DELETE")) {
      logger.warn("CSRF validation failed: No Origin or Referer header", {
        method: request.method,
        url: request.url
      });
      return false;
    }
    
    return true;
  } catch (error) {
    logger.error("Error validating CSRF token", error);
    return false;
  }
}

/**
 * Create a CSRF error response
 */
export function createCsrfErrorResponse() {
  return new Response(
    JSON.stringify({ 
      message: "CSRF validation failed",
      error: "INVALID_CSRF_TOKEN"
    }),
    {
      status: 403,
      headers: {
        "Content-Type": "application/json",
      }
    }
  );
}