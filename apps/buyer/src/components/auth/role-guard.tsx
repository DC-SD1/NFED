"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import { useUser } from "@/lib/context";

interface RoleGuardProps {
  allowedRoles: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
  redirectTo?: string;
  children: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user roles
 * Now handles loading states and redirects after roles are fetched
 * @param allowedRoles - Array of roles that are allowed to see the content
 * @param requireAll - If true, user must have ALL specified roles. If false, user needs ANY of the roles
 * @param fallback - Content to show when user doesn't have required roles
 * @param loadingFallback - Content to show while roles are being fetched
 * @param redirectTo - Optional URL to redirect to if user lacks required roles
 * @param children - Content to show when user has required roles
 */
export function RoleGuard({
  allowedRoles,
  requireAll = false,
  fallback = null,
  loadingFallback = <div>Loading...</div>,
  redirectTo,
  children,
}: RoleGuardProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const { roles, isAuthenticated } = useUser();
  const router = useRouter();
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";

  // Still loading Clerk or waiting for roles
  const isLoading = !isLoaded || (isSignedIn && (!roles || roles.length === 0));

  useEffect(() => {
    // Only redirect if we've finished loading and user doesn't have required roles
    if (!isLoading && isAuthenticated && roles && roles.length > 0) {
      const hasRequiredRoles = requireAll
        ? allowedRoles.every((role) => roles.includes(role))
        : allowedRoles.some((role) => roles.includes(role));

      if (!hasRequiredRoles && redirectTo) {
        router.push(`/${locale}${redirectTo}`);
      }
    }
  }, [
    isLoading,
    isAuthenticated,
    roles,
    allowedRoles,
    requireAll,
    redirectTo,
    router,
    locale,
  ]);

  // Show loading state while Clerk loads or roles are being fetched
  if (isLoading) {
    return <>{loadingFallback}</>;
  }

  // Not authenticated
  if (!isAuthenticated || !roles || roles.length === 0) {
    return <>{fallback}</>;
  }

  const hasRequiredRoles = requireAll
    ? allowedRoles.every((role) => roles.includes(role))
    : allowedRoles.some((role) => roles.includes(role));

  if (!hasRequiredRoles) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
