/**
 * Authentication and routing configuration
 */

import { ROLES, type ValidRole } from "@/lib/schemas/auth";

export interface RoleRoutingConfig {
  dashboard: string;
  allowedPaths: string[];
}

/**
 * Role-based routing configuration
 * Supports wildcards: "/path/*" matches any sub-path
 */
export const ROLE_ROUTING_CONFIG: Record<
  ValidRole | "default",
  RoleRoutingConfig
> = {
  [ROLES.BUYER]: {
    dashboard: "/home",
    allowedPaths: [
      "/profile",
      "/profile/*",
      "/settings",
      "/settings/*",
      "/farms",
      "/farms/*",
      "/products",
      "/products/*",
      "/onboarding",
      "/onboarding/*",
      "/test-api",
      "/sourcing",
      "/sourcing/*",
    ],
  },
  [ROLES.FARM_OWNER]: {
    dashboard: "/home",
    allowedPaths: [
      "/profile",
      "/profile/*",
      "/settings",
      "/settings/*",
      "/farms",
      "/farms/*",
      "/products",
      "/products/*",
      "/onboarding",
      "/onboarding/*",
      "/test-api",
      "/sourcing",
      "/sourcing/*",
    ],
  },
  [ROLES.AGENT]: {
    dashboard: "/home",
    allowedPaths: [
      "/profile",
      "/profile/*",
      "/settings",
      "/settings/*",
      "/clients",
      "/clients/*",
      "/products",
      "/products/*",
      "/onboarding",
      "/onboarding/*",
      "/test-api",
      "/sourcing",
      "/sourcing/*",
    ],
  },
  [ROLES.FARM_MANAGER]: {
    // TODO : Confirm these paths with the team
    dashboard: "/home",
    allowedPaths: [
      "/profile",
      "/profile/*",
      "/settings",
      "/settings/*",
      "/contracts",
      "/contracts/*",
      "/products",
      "/products/*",
      "/onboarding",
      "/onboarding/*",
      "/test-api",
      "/sourcing",
      "/sourcing/*",
    ],
  },
  default: {
    dashboard: "/home",
    allowedPaths: [
      "/home",
      "/home/*",
      "/products",
      "/products/*",
      "/profile",
      "/profile/*",
      "/settings",
      "/settings/*",
      "/onboarding",
      "/onboarding/*",
      "/test-api",
      "/sourcing",
      "/sourcing/*",
    ],
  },
};

/**
 * Authentication page path segments
 * Used to identify auth-related pages
 */
export const AUTH_PATH_SEGMENTS = [
  "sign-in",
  "sign-up",
  "otp",
  "password",
  "verify",
  "reset",
];

/**
 * Check if a pathname matches any of the allowed path patterns
 * @param pathname - The current pathname to check
 * @param allowedPaths - Array of allowed path patterns (supports wildcards)
 * @returns true if the pathname matches any allowed pattern
 */
export function isPathAllowed(
  pathname: string,
  allowedPaths: string[],
): boolean {
  return allowedPaths.some((pattern) => {
    if (pattern.endsWith("/*")) {
      // Wildcard match - check if pathname starts with the base path
      const basePath = pattern.slice(0, -2); // remove '/*'
      return pathname === basePath || pathname.startsWith(basePath + "/");
    }
    // Exact match
    return pattern === pathname;
  });
}

/**
 * Check if a pathname is an authentication page
 * @param pathname - The current pathname to check
 * @returns true if the pathname is an auth page
 */
export function isAuthPage(pathname: string): boolean {
  return AUTH_PATH_SEGMENTS.some((segment) => pathname.includes(segment));
}
