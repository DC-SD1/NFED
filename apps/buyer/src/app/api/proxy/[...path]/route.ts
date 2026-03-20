import axios from "axios";
import { type NextRequest, NextResponse } from "next/server";

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
const REQUEST_TIMEOUT = parseInt(process.env.API_PROXY_TIMEOUT || "30000", 10); // 30s default
const MAX_REQUEST_SIZE = parseInt(
  process.env.MAX_REQUEST_SIZE || "10485760",
  10,
); // 10MB

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const requestId = generateRequestId();
  const startTime = performance.now();

  const responseHeaders = new Headers();
  responseHeaders.set("x-request-id", requestId);

  try {
    const { path } = await params;
    const pathString = path.join("/");

    // Rate limiting identifier (user if available, otherwise IP)
    const userMetadata = await getUserMetadata();
    const userId = userMetadata?.userId;
    const rateLimitIdentifier = await getRateLimitIdentifier(request, userId);
    const limiterType = getRateLimiterType(pathString);
    const rateLimitResponse = await rateLimitMiddleware(
      request,
      rateLimitIdentifier,
      limiterType,
    );
    if (rateLimitResponse) {
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

    // Construct backend URL
    const backendUrl = `${BACKEND_API_URL}/${pathString}`;
    const searchParams = request.nextUrl.searchParams.toString();
    const urlWithParams = searchParams
      ? `${backendUrl}?${searchParams}`
      : backendUrl;

    // Refresh token if needed
    const refreshedToken = await refreshTokenIfNeeded();
    const accessToken = refreshedToken || (await getAccessToken());

    // Prepare headers for the backend request
    const headers = sanitizeHeaders(request.headers, BLOCKED_REQUEST_HEADERS);

    // Authorization header
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    } else {
      logger.error("No access token available for proxied request", {
        requestId,
        path: pathString,
        hasUserMetadata: !!userMetadata,
      });
    }

    // Forward conditional headers for caching semantics
    CONDITIONAL_HEADERS.forEach((header) => {
      const value = request.headers.get(header);
      if (value) headers.set(header, value);
    });

    // Proxy tracing headers
    headers.set(
      "x-forwarded-for",
      request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown",
    );
    headers.set("x-forwarded-host", request.headers.get("host") || "unknown");
    headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));
    headers.set("x-request-id", requestId);

    // Prepare body
    const contentType = request.headers.get("content-type");
    const body = await prepareRequestBody(request, contentType);

    // If GET/HEAD, ensure no content-type header
    if (request.method === "GET" || request.method === "HEAD") {
      headers.delete("content-type");
    }

    // If sending FormData, let fetch set boundary automatically
    if (body instanceof FormData) {
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

    // Timeout with AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      if (
        contentType?.includes("multipart/form-data") ||
        (body instanceof ReadableStream && contentType?.includes("form-data"))
      ) {
        const axiosHeaders: Record<string, string> = {};
        headers.forEach((value, key) => {
          axiosHeaders[key] = value;
        });

        let axiosData = body as any;
        if (body instanceof ReadableStream) {
          const reader = body.getReader();
          const chunks: Uint8Array[] = [];
          try {
            let isDone = false;
            while (!isDone) {
              const { done, value } = await reader.read();
              isDone = done;
              if (value) chunks.push(value);
            }
            const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
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
          method: request.method as any,
          url: urlWithParams,
          data: axiosData,
          headers: axiosHeaders,
          timeout: REQUEST_TIMEOUT,
          signal: controller.signal as any,
          validateStatus: () => true,
        });

        clearTimeout(timeoutId);

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
        const fetchOptions: RequestInit = {
          method: request.method,
          headers,
          signal: controller.signal,
          credentials: "omit",
        };

        if (body !== undefined) {
          fetchOptions.body = body as any;
          if (body instanceof ReadableStream) {
            // @ts-expect-error - Next.js specific option
            fetchOptions.duplex = "half";
          }
        }

        const backendResponse = await fetch(urlWithParams, fetchOptions as any);
        clearTimeout(timeoutId);

        return await processBackendResponse(backendResponse, {
          requestId,
          startTime,
          pathString,
        });
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      logger.error("Backend fetch failed", {
        requestId,
        error:
          fetchError instanceof Error ? fetchError.message : "Unknown error",
        errorType: fetchError instanceof Error ? fetchError.name : "Unknown",
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
      duration,
    });
    return handleFetchError(error, requestId, "", REQUEST_TIMEOUT);
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;
