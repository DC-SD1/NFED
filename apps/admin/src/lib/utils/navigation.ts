import { redirect } from "next/navigation";

import {
  isAuthPage,
  isPathAllowed, ROLE_ROUTING_CONFIG,
} from "@/lib/config/auth";
import { determinePrimaryRole, type ValidRole } from "@/lib/schemas/auth";

/**
 * Redirect to the sign-in page with the current locale
 * @param locale - The current locale (defaults to 'en' if not provided)
 */
export function redirectToSignIn(locale = "en"): never {
  redirect(`/${locale}/`);
}

/**
 * Get the sign-in URL for the current locale
 * @param locale - The current locale (defaults to 'en' if not provided)
 * @returns The sign-in URL
 */
export function getSignInUrl(locale = "en"): string {
  return `/${locale}/`;
}

/**
 * Get role-based destination URL
 */
export function getRoleBasedDestination(
  roles: string[],
  locale: string,
): string {
  const primaryRole = determinePrimaryRole(roles as ValidRole[]);

  // Use the role config if it exists, otherwise use default
  const roleConfig =
    primaryRole && primaryRole in ROLE_ROUTING_CONFIG
      ? ROLE_ROUTING_CONFIG[primaryRole]
      : ROLE_ROUTING_CONFIG.default;

  return `/${locale}${roleConfig.dashboard}`;
}

/**
 * Check if redirect is needed based on user roles and current path
 */
export function shouldRedirectForRole(
  pathname: string,
  roles: string[],
  locale: string,
): boolean {
  // Never redirect if user is on onboarding pages
  // if (pathname.includes("/")) {
  //   return false;
  // }

  // Never redirect if user is on SSO callback
  if (pathname.includes("/sso-callback")) {
    return false;
  }

  const primaryRole = determinePrimaryRole(roles as ValidRole[]);

  // Use the role config if it exists, otherwise use default
  const roleConfig =
    primaryRole && primaryRole in ROLE_ROUTING_CONFIG
      ? ROLE_ROUTING_CONFIG[primaryRole]
      : ROLE_ROUTING_CONFIG.default;

  const allowedPaths = roleConfig.allowedPaths.map((p) => `/${locale}${p}`);
  
  // If already on the role's dashboard, don't redirect
  const targetDashboard = `/${locale}${roleConfig.dashboard}`;
  if (pathname === targetDashboard || pathname.startsWith(targetDashboard + "/")) {
    return false;
  }

  return isAuthPage(pathname) || !isPathAllowed(pathname, allowedPaths);
}
