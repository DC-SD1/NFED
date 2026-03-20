"use client";

import { determinePrimaryRole, type ValidRole } from "@/lib/schemas/auth";

import { useAuthUser, useIsAuthenticated } from "../stores/auth-store-ssr";

export interface UserInfo {
  userId: string | null;
  email: string | null;
  roles: string[] | null;
  isAuthenticated: boolean;
  isPrimaryRole: (role: string) => boolean;
  hasRole: (role: string) => boolean;
}

/**
 * Hook to access user information from the auth store
 */
export function useUser(): UserInfo {
  const { userId, email, roles } = useAuthUser();
  const isAuthenticated = useIsAuthenticated();

  const isPrimaryRole = (role: string): boolean => {
    if (!roles || roles.length === 0) return false;

    // Use centralized primary role determination logic
    const primaryRole = determinePrimaryRole(roles as ValidRole[]);
    return primaryRole === role;
  };

  const hasRole = (role: string): boolean => {
    return roles?.includes(role) ?? false;
  };

  return {
    userId,
    email,
    roles,
    isAuthenticated,
    isPrimaryRole,
    hasRole,
  };
}
