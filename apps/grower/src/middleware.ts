import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";
import { AUTH_COOKIE_NAMES } from "./lib/server/cookies";
import { logger } from "./lib/utils/logger";

const intlMiddleware = createIntlMiddleware(routing);

// Define public routes that do not require authentication
// Routes work with locale prefixes automatically
const isPublicRoute = createRouteMatcher([
  // Marketing/landing page routes
  "/",
  "/:locale",
  // Auth-related routes
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/password(.*)",
  "/forgot-password(.*)",
  "/otp(.*)",
  "/onboarding(.*)",
  "/test-auth(.*)",
  "/sso-callback(.*)",
  "/invite(.*)",
  "/oops(.*)",
  // Also explicitly match with locale prefixes for clarity
  "/:locale/sign-in(.*)",
  "/:locale/forgot-password(.*)",
  "/:locale/sign-up(.*)",
  "/:locale/password(.*)",
  "/:locale/otp(.*)",
  "/:locale/onboarding(.*)",
  "/:locale/test-auth(.*)",
  "/:locale/sso-callback(.*)",
  "/:locale/invite(.*)",
  "/:locale/oops(.*)",
]);

// Create the middleware with Clerk v6 syntax
export default clerkMiddleware(async (auth, request) => {
  // Handle API routes before any locale processing
  if (request.nextUrl.pathname.startsWith("/api")) {
    // API routes bypass locale handling entirely
    // API routes handle their own authentication
    return NextResponse.next();
  }

  // For non-API routes, use the normal flow with locale handling
  // Debug: Log the pathname being checked
  logger.info("MIDDLEWARE_PATH:", {
    pathname: request.nextUrl.pathname,
    isPublicRoute: isPublicRoute(request),
  });

  // Add grace period for auth initialization
  const isInitialPageLoad = !request.cookies.get("auth-initialized");

  // Protect all routes that are not public before locale processing
  // This ensures auth check happens with the original path
  if (!isPublicRoute(request)) {
    try {
      await auth.protect();

      // After Clerk auth, check our internal auth cookies
      const cookies = request.cookies;
      const hasAccessToken =
        cookies.has(AUTH_COOKIE_NAMES.ACCESS_TOKEN) ||
        cookies.has(`__Secure-${AUTH_COOKIE_NAMES.ACCESS_TOKEN}`);
      const hasRefreshToken =
        cookies.has(AUTH_COOKIE_NAMES.REFRESH_TOKEN) ||
        cookies.has(`__Secure-${AUTH_COOKIE_NAMES.REFRESH_TOKEN}`);
      const hasUserMetadata =
        cookies.has(AUTH_COOKIE_NAMES.USER_METADATA) ||
        cookies.has(`__Secure-${AUTH_COOKIE_NAMES.USER_METADATA}`);

      // Only attempt recovery if we have a refresh token but no access token
      // The access token cookie expires with the token, so if it's missing, we need to refresh
      if (hasRefreshToken && hasUserMetadata && !hasAccessToken) {
        logger.info("MIDDLEWARE_COOKIE_RECOVERY:", {
          pathname: request.nextUrl.pathname,
          hasAccessToken,
          hasRefreshToken,
          hasUserMetadata,
          message: "Attempting cookie recovery in middleware",
        });

        try {
          // Create a new request to our existing refresh endpoint
          const refreshUrl = new URL("/api/auth/refresh", request.url);
          const refreshResponse = await fetch(refreshUrl.toString(), {
            method: "POST",
            headers: {
              Cookie: request.headers.get("cookie") || "",
              "Content-Type": "application/json",
            },
          });

          if (refreshResponse.ok) {
            logger.info("MIDDLEWARE_COOKIE_RECOVERY_SUCCESS:", {
              pathname: request.nextUrl.pathname,
              status: refreshResponse.status,
            });

            // Apply intl middleware
            const response = intlMiddleware(request);

            // Extract and apply Set-Cookie headers from refresh response
            const setCookieHeaders = refreshResponse.headers.getSetCookie();
            setCookieHeaders.forEach((cookie) => {
              response.headers.append("Set-Cookie", cookie);
            });

            return response;
          } else {
            logger.warn("MIDDLEWARE_COOKIE_RECOVERY_FAILED:", {
              pathname: request.nextUrl.pathname,
              status: refreshResponse.status,
              statusText: refreshResponse.statusText,
            });
          }
        } catch (recoveryError) {
          logger.error("MIDDLEWARE_COOKIE_RECOVERY_ERROR:", {
            pathname: request.nextUrl.pathname,
            error:
              recoveryError instanceof Error
                ? recoveryError.message
                : String(recoveryError),
          });
        }
      }
    } catch (error) {
      // During initial load, allow passage but mark for client-side check
      // This prevents race conditions where server redirects before client auth is ready
      if (isInitialPageLoad) {
        logger.info("AUTH_GRACE_PERIOD:", {
          pathname: request.nextUrl.pathname,
          message: "Allowing initial page load with grace period",
        });

        // Apply intl middleware first to handle locale
        const intlResponse = intlMiddleware(request);

        // Set a short-lived cookie to indicate auth has been initialized
        intlResponse.cookies.set("auth-initialized", "true", {
          maxAge: 300, // 5 minutes grace period for auth initialization
          httpOnly: true,
          sameSite: "lax",
        });

        return intlResponse;
      }

      // Additional grace: if we have a refresh token cookie, allow pass-through
      // and let the client/session-sync complete recovery instead of redirecting.
      try {
        const hasRefresh =
          request.cookies.has(AUTH_COOKIE_NAMES.REFRESH_TOKEN) ||
          request.cookies.has(`__Secure-${AUTH_COOKIE_NAMES.REFRESH_TOKEN}`);
        if (hasRefresh) {
          logger.info("AUTH_GRACE_WITH_REFRESH:", {
            pathname: request.nextUrl.pathname,
            message:
              "Refresh token present; allowing pass-through to avoid loop",
          });
          const intlResponse = intlMiddleware(request);
          // Ensure auth-initialized cookie is set to avoid repeating this path
          intlResponse.cookies.set("auth-initialized", "true", {
            maxAge: 300,
            httpOnly: true,
            sameSite: "lax",
          });
          return intlResponse;
        }
      } catch (cookieErr) {
        logger.warn("AUTH_GRACE_WITH_REFRESH_CHECK_FAILED", {
          error:
            cookieErr instanceof Error ? cookieErr.message : String(cookieErr),
        });
      }
      // If not initial load, throw the error as normal
      throw error;
    }
  }

  // Apply intl middleware after auth check
  const intlResponse = intlMiddleware(request);

  // Role-based authorization is now handled client-side
  // This ensures we always use fresh role data from the backend
  // rather than potentially stale Clerk metadata

  // Return the intlMiddleware response
  return intlResponse;
});

export const config = {
  // Match all pathnames except for
  // - … if they start with `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: [
    // Explicitly include root path
    "/",
    // Include all other routes except Next.js internals and static files
    "/((?!_next|_vercel|.*\\..*).+)",
    // Explicitly include API routes
    "/api/(.*)",
  ],
};
