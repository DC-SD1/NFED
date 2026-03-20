import { redirect } from "next/navigation";

import {
  isAuthPage,
  isPathAllowed,
  ROLE_ROUTING_CONFIG,
} from "@/lib/config/auth";
import { determinePrimaryRole, type ValidRole } from "@/lib/schemas/auth";

/**
 * Redirect to the sign-in page with the current locale
 * @param locale - The current locale (defaults to 'en' if not provided)
 */
export function redirectToSignIn(locale = "en"): never {
  redirect(`/${locale}/sign-in`);
}

/**
 * Get the sign-in URL for the current locale
 * @param locale - The current locale (defaults to 'en' if not provided)
 * @returns The sign-in URL
 */
export function getSignInUrl(locale = "en"): string {
  return `/${locale}/sign-in`;
}

/**
 * Build a sign-in URL with optional query parameters
 */
export function getSignInUrlWithQuery(
  locale = "en",
  query?: Record<string, string | undefined>,
): string {
  const base = `/${locale}/sign-in`;
  if (!query) return base;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === "string" && value.length > 0) {
      params.set(key, value);
    }
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
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
  if (pathname.includes("/onboarding")) {
    return false;
  }

  const primaryRole = determinePrimaryRole(roles as ValidRole[]);

  // Use the role config if it exists, otherwise use default
  const roleConfig =
    primaryRole && primaryRole in ROLE_ROUTING_CONFIG
      ? ROLE_ROUTING_CONFIG[primaryRole]
      : ROLE_ROUTING_CONFIG.default;

  const allowedPaths = roleConfig.allowedPaths.map((p) => `/${locale}${p}`);

  return isAuthPage(pathname) || !isPathAllowed(pathname, allowedPaths);
}
