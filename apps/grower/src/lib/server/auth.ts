import { redirect } from "next/navigation";

import { getAuthCookies, hasValidAuthCookies } from "@/lib/server/cookies";
import { logger } from "@/lib/utils/logger";
import { type UserMetadata, UserMetadataCookieSchema } from "@/types/auth";

/**
 * Get the current authentication session from cookies.
 * This is a more efficient alternative to calling the /api/auth/session endpoint
 * for server components that already have access to cookies.
 *
 * @returns UserMetadata if authenticated, null otherwise
 */
export async function getServerAuth(): Promise<UserMetadata | null> {
  try {
    // First check if we have valid auth cookies
    let isValid = await hasValidAuthCookies();

    if (!isValid) {
      // Attempt a last-chance refresh on the server if we have a refresh token
      try {
        const { refreshTokenIfNeeded } = await import(
          "@/lib/server/api-proxy-utils"
        );
        const refreshed = await refreshTokenIfNeeded();
        if (refreshed) {
          // Re-check cookies after refresh
          isValid = await hasValidAuthCookies();
        }
      } catch (e) {
        logger.warn(
          "Server-side token refresh attempt failed in getServerAuth",
          {
            error: e instanceof Error ? e.message : String(e),
          },
        );
      }

      if (!isValid) {
        // Cookie recovery failed or no valid session
        logger.info("Invalid auth cookies detected in getServerAuth", {
          message: "Cookie recovery should have been attempted in middleware",
        });
        return null;
      }
    }

    // Get authentication data from cookies
    const { userMetadata } = await getAuthCookies();

    if (!userMetadata) {
      logger.warn("Valid cookies but missing user metadata in getServerAuth");
      return null;
    }

    // Validate the metadata structure
    let validationResult;
    try {
      validationResult = UserMetadataCookieSchema.safeParse(userMetadata);
    } catch (validationError) {
      logger.error("getServerAuth: Schema validation threw an error", {
        error:
          validationError instanceof Error
            ? validationError.message
            : String(validationError),
        stack:
          validationError instanceof Error ? validationError.stack : undefined,
        userMetadata,
      });
      // Continue to attempt validation to see the actual error
      // This is for debugging purposes
      try {
        validationResult = UserMetadataCookieSchema.safeParse(userMetadata);
      } catch (secondError) {
        logger.error("getServerAuth: Second validation attempt also failed", {
          error:
            secondError instanceof Error
              ? secondError.message
              : String(secondError),
          stack: secondError instanceof Error ? secondError.stack : undefined,
        });
        return null;
      }
    }

    if (!validationResult.success) {
      logger.error("Invalid user metadata format in getServerAuth", {
        errors: validationResult.error.flatten(),
        rawErrors: validationResult.error.issues,
        userMetadata,
        userMetadataType: typeof userMetadata,
        expiresAtType: typeof userMetadata?.expiresAt,
        expiresAtValue: userMetadata?.expiresAt,
      });
      return null;
    }

    // Additional expiration check
    const currentTime = Date.now();
    if (currentTime >= validationResult.data.expiresAt) {
      logger.info("Session expired in getServerAuth", {
        userId: validationResult.data.userId,
        expiresAt: new Date(validationResult.data.expiresAt).toISOString(),
      });
      return null;
    }

    return validationResult.data;
  } catch (error) {
    logger.error("Error in getServerAuth", error);
    return null;
  }
}

/**
 * Require authentication for a server component.
 * Redirects to login page if not authenticated.
 *
 * @param redirectTo - Optional custom redirect path (default: "/sign-in")
 * @returns UserMetadata of authenticated user
 * @throws Redirects to login if not authenticated
 */
export async function requireAuth(redirectTo = "/"): Promise<UserMetadata> {
  const user = await getServerAuth();

  if (!user) {
    logger.info("Unauthenticated access attempt, redirecting to login");
    redirect(redirectTo);
  }

  return user;
}

/**
 * Check if the current user has a specific role.
 *
 * @param role - The role to check for
 * @returns true if user has the role, false otherwise
 */
export async function hasRole(role: string): Promise<boolean> {
  const user = await getServerAuth();
  return user?.roles?.includes(role) || false;
}

/**
 * Check if the current user has any of the specified roles.
 *
 * @param roles - Array of roles to check for
 * @returns true if user has any of the roles, false otherwise
 */
export async function hasAnyRole(roles: string[]): Promise<boolean> {
  const user = await getServerAuth();
  if (!user?.roles) return false;

  return roles.some((role) => user.roles.includes(role));
}

/**
 * Check if the current user has all of the specified roles.
 *
 * @param roles - Array of roles to check for
 * @returns true if user has all of the roles, false otherwise
 */
export async function hasAllRoles(roles: string[]): Promise<boolean> {
  const user = await getServerAuth();
  if (!user?.roles) return false;

  return roles.every((role) => user.roles.includes(role));
}

/**
 * Require specific role(s) for a server component.
 * Redirects to unauthorized page if user doesn't have the required role(s).
 *
 * @param requiredRoles - Single role or array of roles required
 * @param options - Configuration options
 * @returns UserMetadata of authenticated and authorized user
 * @throws Redirects if not authenticated or not authorized
 */
export async function requireRole(
  requiredRoles: string | string[],
  options: {
    requireAll?: boolean;
    unauthorizedRedirect?: string;
    loginRedirect?: string;
  } = {},
): Promise<UserMetadata> {
  const {
    requireAll = false,
    unauthorizedRedirect = "/unauthorized",
    loginRedirect = "/sign-in",
  } = options;

  // First ensure user is authenticated
  const user = await requireAuth(loginRedirect);

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  // Check role requirements
  // ✅ FIX: Use the already-retrieved user data instead of calling getServerAuth() again
  const hasRequiredRoles = requireAll
    ? roles.every((role) => user.roles.includes(role)) // Direct role check
    : roles.some((role) => user.roles.includes(role)); // Direct role check

  if (!hasRequiredRoles) {
    logger.warn("Unauthorized access attempt", {
      userId: user.userId,
      userRoles: user.roles,
      requiredRoles: roles,
      requireAll,
    });
    redirect(unauthorizedRedirect);
  }

  return user;
}

/**
 * Get authentication status without throwing or redirecting.
 * Useful for conditional rendering in server components.
 *
 * @returns Object with authentication status and user data
 */
export async function getAuthStatus(): Promise<{
  isAuthenticated: boolean;
  user: UserMetadata | null;
  isExpired: boolean;
}> {
  const user = await getServerAuth();

  if (!user) {
    return {
      isAuthenticated: false,
      user: null,
      isExpired: false,
    };
  }

  const currentTime = Date.now();
  const isExpired = currentTime >= user.expiresAt;

  return {
    isAuthenticated: !isExpired,
    user,
    isExpired,
  };
}

/**
 * Server Component wrapper that provides authentication context.
 * This is a pattern for wrapping server components with auth requirements.
 *
 * @example
 * ```tsx
 * // In your page.tsx
 * export default async function ProtectedPage() {
 *   return withAuth(async (user) => {
 *     // Your component logic here with access to user
 *     return <div>Welcome {user.email}</div>;
 *   });
 * }
 * ```
 */
export async function withAuth<T>(
  callback: (user: UserMetadata) => Promise<T>,
  options?: {
    loginRedirect?: string;
  },
): Promise<T> {
  const user = await requireAuth(options?.loginRedirect);
  return callback(user);
}

/**
 * Server Component wrapper that provides role-based authentication.
 *
 * @example
 * ```tsx
 * // In your admin page.tsx
 * export default async function AdminPage() {
 *   return withRole("admin", async (user) => {
 *     return <AdminDashboard user={user} />;
 *   });
 * }
 * ```
 */
export async function withRole<T>(
  requiredRoles: string | string[],
  callback: (user: UserMetadata) => Promise<T>,
  options?: {
    requireAll?: boolean;
    unauthorizedRedirect?: string;
    loginRedirect?: string;
  },
): Promise<T> {
  const user = await requireRole(requiredRoles, options);
  return callback(user);
}
