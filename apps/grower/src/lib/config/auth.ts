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
  [ROLES.FARM_OWNER]: {
    dashboard: "/farm-owner",
    allowedPaths: [
      "/farm-owner",
      "/farm-owner/*",
      "/profile",
      "/profile/*",
      "/settings",
      "/settings/*",
      "/farms",
      "/farms/*",
      "/onboarding",
      "/onboarding/*",
      "/test-api",
    ],
  },
  [ROLES.AGENT]: {
    dashboard: "/agent",
    allowedPaths: [
      "/agent",
      "/agent/*",
      "/profile",
      "/profile/*",
      "/settings",
      "/settings/*",
      "/clients",
      "/clients/*",
      "/onboarding",
      "/onboarding/*",
      "/test-api",
    ],
  },
  [ROLES.FARM_MANAGER]: {
    // TODO : Confirm these paths with the team
    dashboard: "/farm-manager",
    allowedPaths: [
      "/farm-manager",
      "/farm-manager/*",
      "/profile",
      "/profile/*",
      "/settings",
      "/settings/*",
      "/contracts",
      "/contracts/*",
      "/onboarding",
      "/onboarding/*",
      "/test-api",
    ],
  },
  default: {
    dashboard: "/dashboard",
    allowedPaths: [
      "/dashboard",
      "/dashboard/*",
      "/profile",
      "/profile/*",
      "/settings",
      "/settings/*",
      "/onboarding",
      "/onboarding/*",
      "/test-api",
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
