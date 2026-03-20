import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { logger } from "@/lib/utils/logger";

import { routing } from "./i18n/routing";

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
  "/country(.*)",
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
  "/:locale/country(.*)",
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

  // Protect all routes that are not public using Clerk session
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // Role-based authorization is now handled client-side
  // This ensures we always use fresh role data from the backend
  // rather than potentially stale Clerk metadata

  // Return the intlMiddleware response
  return intlMiddleware(request);
});

export const config = {
  // Match all pathnames except for
  // - … if they start with `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: [
    // Include all routes except Next.js internals and static files
    "/((?!_next|_vercel|.*\\..*).*)",
    // Explicitly include API routes
    "/api/(.*)",
  ],
};
