/**
 * Authentication and routing configuration
 */
import { ROLES, type ValidRole } from "@/lib/schemas/auth";

export interface RoleRoutingConfig {
  dashboard: string;
  allowedPaths: string[];
}

const adminsAllowedPaths: string[] = [
  "/dashboard",
  "/dashboard/*",
  "/user-management",
  "/user-management/*",
  "/formal-growers",
  "/formal-growers/*",
  "/buyers",
  "/buyers/*",
  "/agents",
  "/agents/*",
  "/all-requests",
  "/all-requests/*",
  "/fulfilment-centers",
  "/fulfilment-centers/*",
];

const operationsAllowedPaths: string[] = [
  "/dashboard",
  "/dashboard/*",
  "/formal-growers",
  "/formal-growers/*",
  "/buyers",
  "/buyers/*",
  "/agents",
  "/agents/*",
  "/fulfilment-centers",
  "/fulfilment-centers/*",
];

/**
 * Role-based routing configuration
 * Supports wildcards: "/path/*" matches any sub-path
 */
export const ROLE_ROUTING_CONFIG: Record<
  ValidRole | "default",
  RoleRoutingConfig
> = {
  [ROLES.SUPER_ADMIN]: {
    dashboard: "/dashboard",
    allowedPaths: adminsAllowedPaths,
  },
  [ROLES.ADMIN]: {
    dashboard: "/dashboard",
    allowedPaths: adminsAllowedPaths,
  },
  [ROLES.CHIEF_OPERATIONS_OFFICER]: {
    dashboard: "/dashboard",
    allowedPaths: operationsAllowedPaths,
  },
  [ROLES.OPERATIONS_DIRECTOR]: {
    dashboard: "/dashboard",
    allowedPaths: operationsAllowedPaths,
  },
  [ROLES.REGIONAL_OPERATIONS_MANAGER]: {
    dashboard: "/dashboard",
    allowedPaths: operationsAllowedPaths,
  },
  default: {
    dashboard: "/dashboard",
    allowedPaths: [
      "/dashboard",
      "/dashboard/*",
      "/formal-growers",
      "/formal-growers/*",
      "/buyers",
      "/buyers/*",
      "/agents",
      "/agents/*",
      "/fulfilment-centers",
      "/fulfilment-centers/*",
    ],
  },
};

/**
 * Authentication page path segments
 * Used to identify auth-related pages
 */
export const AUTH_PATH_SEGMENTS = ["otp", "password", "verify", "reset"];

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
