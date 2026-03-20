import { NextResponse } from "next/server";

import {
  addSecurityHeaders,
  BLOCKED_RESPONSE_HEADERS,
  CACHE_HEADERS,
  calculateDuration,
  formatProxyError,
  sanitizeHeaders,
} from "@/lib/server/api-proxy-utils";
import { logger } from "@/lib/utils/logger";

interface ProxyResponseOptions {
  requestId: string;
  startTime: number;
  pathString: string;
}

/**
 * Process the backend response and prepare the client response
 */
export async function processBackendResponse(
  backendResponse: Response,
  options: ProxyResponseOptions,
): Promise<NextResponse> {
  const { requestId, startTime, pathString } = options;

  // Create response headers with request ID
  const responseHeaders = new Headers();
  responseHeaders.set("x-request-id", requestId);

  // Process response headers
  const backendHeaders = sanitizeHeaders(
    backendResponse.headers,
    BLOCKED_RESPONSE_HEADERS,
  );

  // Copy backend headers to response
  backendHeaders.forEach((value, key) => {
    responseHeaders.set(key, value);
  });

  // Ensure cache-related headers are properly forwarded
  CACHE_HEADERS.forEach((header) => {
    const value = backendResponse.headers.get(header);
    if (value && !responseHeaders.has(header)) {
      responseHeaders.set(header, value);
    }
  });

  // Add security headers
  addSecurityHeaders(responseHeaders);

  // Add performance metrics
  const duration = calculateDuration(startTime);
  responseHeaders.set("x-response-time", `${duration}ms`);

  // Log response details
  logger.info("API proxy response", {
    requestId,
    status: backendResponse.status,
    duration,
    path: pathString,
  });

  // Handle different response types
  const responseContentType = backendResponse.headers.get("content-type");
  const contentLength = backendResponse.headers.get("content-length");

  // Handle empty responses (including those with content-encoding)
  // Check both explicit content-length="0" and 204 No Content status
  if (contentLength === "0" || backendResponse.status === 204) {
    // Remove content-encoding header for empty responses to prevent decoding errors
    responseHeaders.delete("content-encoding");
    return new NextResponse(null, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  }

  // For streaming responses or large files, pass through directly
  if (
    responseContentType?.includes("stream") ||
    responseContentType?.includes("octet-stream")
  ) {
    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  }

  // For JSON responses, pass through directly to preserve exact structure
  if (responseContentType?.includes("application/json")) {
    // Clone response before consuming body to allow fallback on error
    const responseClone = backendResponse.clone();

    try {
      const jsonData = await backendResponse.json();
      return NextResponse.json(jsonData, {
        status: backendResponse.status,
        headers: responseHeaders,
      });
    } catch (jsonError) {
      logger.error("Error", jsonError);
      // If JSON parsing fails, use the cloned response to get text
      const textData = await responseClone.text();

      // If the response body is empty or just whitespace, handle it as an empty response
      if (textData?.trim().length === 0) {
        // Remove content-encoding header for empty responses to prevent decoding errors
        responseHeaders.delete("content-encoding");
        return new NextResponse(null, {
          status: backendResponse.status,
          statusText: backendResponse.statusText,
          headers: responseHeaders,
        });
      }

      // Otherwise, return the text data as-is
      return new NextResponse(textData, {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        headers: responseHeaders,
      });
    }
  }

  // For problem+json (error responses), pass through directly
  if (responseContentType?.includes("application/problem+json")) {
    const jsonData = await backendResponse.json();
    return NextResponse.json(jsonData, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  }

  // For all other responses, check if empty before returning
  const responseBody = await backendResponse.text();

  // If the response body is empty or just whitespace, handle it properly
  if (responseBody?.trim().length === 0) {
    // Remove content-encoding header for empty responses to prevent decoding errors
    responseHeaders.delete("content-encoding");
    return new NextResponse(null, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  }

  return new NextResponse(responseBody, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: responseHeaders,
  });
}

/**
 * Handle fetch errors and create appropriate responses
 */
export function handleFetchError(
  error: unknown,
  requestId: string,
  pathString: string,
  timeout: number,
): NextResponse {
  const responseHeaders = new Headers();
  responseHeaders.set("x-request-id", requestId);

  if (error instanceof Error && error.name === "AbortError") {
    logger.error("API proxy request timeout", {
      requestId,
      path: pathString,
      timeout,
    });

    return NextResponse.json(
      formatProxyError(
        new Error("Request timeout"),
        requestId,
        `Request timed out after ${timeout}ms`,
      ),
      { status: 504, headers: responseHeaders },
    );
  }

  // Check if error is related to network/connection issues
  if (
    error instanceof Error &&
    (error.message.includes("ECONNREFUSED") ||
      error.message.includes("ENOTFOUND") ||
      error.message.includes("fetch failed"))
  ) {
    console.log("Backend service unavailable:", error);
    return NextResponse.json(
      formatProxyError(error, requestId, "Backend service unavailable"),
      { status: 503, headers: responseHeaders },
    );
  }

  return NextResponse.json(
    formatProxyError(error, requestId, "Internal proxy error"),
    { status: 500, headers: responseHeaders },
  );
}
