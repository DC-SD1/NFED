import axios from "axios";
import { type NextRequest, NextResponse } from "next/server";
import { fetch } from "undici";

import {
  handleFetchError,
  processBackendResponse,
} from "@/lib/server/api-proxy-handler";
import {
  BLOCKED_REQUEST_HEADERS,
  calculateDuration,
  CONDITIONAL_HEADERS,
  formatProxyError,
  generateRequestId,
  prepareRequestBody,
  refreshTokenIfNeeded,
  sanitizeHeaders,
} from "@/lib/server/api-proxy-utils";
import { getAccessToken, getUserMetadata } from "@/lib/server/cookies";
import {
  getRateLimiterType,
  getRateLimitIdentifier,
  rateLimitMiddleware,
} from "@/lib/server/rate-limiter";
import { logger } from "@/lib/utils/logger";

// Configuration
const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:8000";
const REQUEST_TIMEOUT = parseInt(process.env.API_PROXY_TIMEOUT || "30000", 10); // 30 seconds default
const MAX_REQUEST_SIZE = parseInt(
  process.env.MAX_REQUEST_SIZE || "10485760",
  10,
); // 10MB default

/**
 * Enhanced API Proxy Route Handler
 *
 * Features:
 * - Automatic token refresh when expired
 * - Request/response interception and monitoring
 * - Security header management
 * - Proper content type handling
 * - Request tracing with IDs
 * - Comprehensive error handling
 * - Performance monitoring
 */
 
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const requestId = generateRequestId();
  const startTime = performance.now();

  // Add request ID to response headers for tracing
  const responseHeaders = new Headers();
  responseHeaders.set("x-request-id", requestId);

  try {
    const { path } = await params;
    const pathString = path.join("/");

    // Get user ID for rate limiting
    const userMetadata = await getUserMetadata();
    const userId = userMetadata?.userId;

    // Apply rate limiting
    const rateLimitIdentifier = await getRateLimitIdentifier(request, userId);
    const limiterType = getRateLimiterType(pathString);
    const rateLimitResponse = await rateLimitMiddleware(
      request,
      rateLimitIdentifier,
      limiterType,
    );

    if (rateLimitResponse) {
      // Add request ID to rate limit response
      rateLimitResponse.headers.set("x-request-id", requestId);
      return rateLimitResponse;
    }

    // Validate request size
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_REQUEST_SIZE) {
      logger.warn("Request size exceeds limit", {
        requestId,
        size: contentLength,
        limit: MAX_REQUEST_SIZE,
      });

      return NextResponse.json(
        formatProxyError(
          new Error("Request size exceeds limit"),
          requestId,
          "Payload too large",
        ),
        { status: 413, headers: responseHeaders },
      );
    }

    // Construct the backend URL - no /api prefix needed
    const backendUrl = `${BACKEND_API_URL}/${pathString}`;
    const searchParams = request.nextUrl.searchParams.toString();
    const urlWithParams = searchParams
      ? `${backendUrl}?${searchParams}`
      : backendUrl;

    // Check and refresh token if needed
    const refreshedToken = await refreshTokenIfNeeded();

    // Get the current access token (might be refreshed)
    const accessToken = refreshedToken || (await getAccessToken());

    // Prepare headers for the backend request
    const headers = sanitizeHeaders(request.headers, BLOCKED_REQUEST_HEADERS);

    // Add authorization header if we have a token
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    } else {
      // This shouldn't happen after cookie verification, but log with details
      const { verifyAuthCookies } = await import(
        "@/lib/server/cookie-verification"
      );
      const verification = await verifyAuthCookies();

      logger.error(
        "No access token available for request despite cookie check",
        {
          requestId,
          path: pathString,
          userMetadata: userMetadata
            ? {
                userId: userMetadata.userId,
                hasExpiresAt: !!userMetadata.expiresAt,
              }
            : null,
          verification: {
            issues: verification.issues,
            details: verification.details,
          },
        },
      );
    }

    // Forward conditional headers for caching
    CONDITIONAL_HEADERS.forEach((header) => {
      const value = request.headers.get(header);
      if (value) {
        headers.set(header, value);
      }
    });

    // Add proxy-specific headers
    headers.set(
      "x-forwarded-for",
      request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown",
    );
    headers.set("x-forwarded-host", request.headers.get("host") || "unknown");
    headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));
    headers.set("x-request-id", requestId);

    // Prepare the request body
    const contentType = request.headers.get("content-type");
    const body = await prepareRequestBody(request, contentType);

    // Remove content-type header for GET requests to avoid confusion
    if (request.method === "GET" || request.method === "HEAD") {
      headers.delete("content-type");
    }

    logger.info("Proxying API request", {
      requestId,
      method: request.method,
      path: pathString,
      hasAuth: !!accessToken,
      userId: userMetadata?.userId,
      tokenRefreshed: !!refreshedToken,
    });

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      // Use axios for multipart/form-data requests as it handles file uploads more reliably
      if (
        contentType?.includes("multipart/form-data") ||
        (body instanceof ReadableStream && contentType?.includes("form-data"))
      ) {
        // Convert headers to plain object for axios
        const axiosHeaders: Record<string, string> = {};
        headers.forEach((value, key) => {
          axiosHeaders[key] = value;
        });

        // Keep the original content-type with boundary for multipart requests

        // Convert ReadableStream to Buffer for axios
        let axiosData = body;
        if (body instanceof ReadableStream) {
          const reader = body.getReader();
          const chunks: Uint8Array[] = [];

          try {
            // eslint-disable-next-line no-constant-condition
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              chunks.push(value);
            }

            // Combine all chunks into a single buffer
            const totalLength = chunks.reduce(
              (acc, chunk) => acc + chunk.length,
              0,
            );
            const buffer = new Uint8Array(totalLength);
            let offset = 0;

            for (const chunk of chunks) {
              buffer.set(chunk, offset);
              offset += chunk.length;
            }

            axiosData = buffer;
          } finally {
            reader.releaseLock();
          }
        }

        const axiosResponse = await axios({
          method: request.method,
          url: urlWithParams,
          data: axiosData,
          headers: axiosHeaders,
          timeout: REQUEST_TIMEOUT,
          signal: controller.signal,
          validateStatus: () => true, // Don't throw on HTTP errors
        });

        clearTimeout(timeoutId);

        // Convert axios response to Response-like object for processBackendResponse
        const response = new Response(
          axiosResponse.data ? JSON.stringify(axiosResponse.data) : null,
          {
            status: axiosResponse.status,
            statusText: axiosResponse.statusText,
            headers: new Headers(
              axiosResponse.headers as Record<string, string>,
            ),
          },
        );

        return await processBackendResponse(response, {
          requestId,
          startTime,
          pathString,
        });
      } else {
        // Use undici's fetch for non-multipart requests
        const fetchHeaders = headers;

        // Prepare fetch options
        const fetchOptions: RequestInit = {
          method: request.method,
          headers: fetchHeaders,
          signal: controller.signal,
          credentials: "omit",
        };

        // Only add body for methods that support it
        if (body !== undefined) {
          fetchOptions.body = body;
          // Only add duplex for streaming bodies (ReadableStream)
          if (body instanceof ReadableStream) {
            // @ts-expect-error - Next.js specific option
            fetchOptions.duplex = "half"; // Required for streaming request bodies
          }
        }

        // Make the request to the backend
        const backendResponse = await fetch(urlWithParams, fetchOptions as any);

        clearTimeout(timeoutId);

        // Process the backend response
        return await processBackendResponse(backendResponse as Response, {
          requestId,
          startTime,
          pathString,
        });
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);

      // Log detailed error information
      logger.error("Backend fetch failed", {
        requestId,
        error:
          fetchError instanceof Error ? fetchError.message : "Unknown error",
        errorType: fetchError instanceof Error ? fetchError.name : "Unknown",
        errorStack: fetchError instanceof Error ? fetchError.stack : undefined,
        method: request.method,
        contentType,
        backendUrl: urlWithParams,
        bodyType:
          body === undefined
            ? "no-body"
            : body instanceof FormData
              ? "FormData"
              : body instanceof ReadableStream
                ? "ReadableStream"
                : typeof body,
      });

      return handleFetchError(
        fetchError,
        requestId,
        pathString,
        REQUEST_TIMEOUT,
      );
    }
  } catch (error) {
    const duration = calculateDuration(startTime);

    logger.error("API proxy error", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      duration,
    });

    return handleFetchError(error, requestId, "", REQUEST_TIMEOUT);
  }
}

// Export handlers for all HTTP methods
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;
