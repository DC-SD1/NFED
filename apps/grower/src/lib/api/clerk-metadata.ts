import { useUser } from "@clerk/nextjs";

import type { ValidRole } from "@/lib/schemas/auth";

import { fetchWithCsrf } from "../utils/csrf-client";
import { logger } from "../utils/logger";

/**
 * Updates the user's metadata in Clerk after successful backend registration
 * This calls our secure API endpoint to update the metadata server-side
 */
export async function updateClerkUserMetadata(
  roles: string[],
): Promise<boolean> {
  try {
    // Call our API endpoint to update Clerk metadata
    // Use absolute path to avoid locale prefix issues
    const apiUrl = new URL(
      "/api/users/update-metadata",
      window.location.origin,
    );
    const response = await fetchWithCsrf(apiUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roles }),
    });

    if (!response.ok) {
      const error = await response.json();
      logger.error("Failed to update Clerk metadata", {
        status: response.status,
        error,
      });
      return false;
    }

    return true;
  } catch (error) {
    logger.error("Failed to update Clerk user metadata", error, { roles });
    return false;
  }
}

/**
 * Syncs user roles from backend to Clerk metadata
 * This is useful for existing users who don't have roles in Clerk metadata yet
 */
export async function syncRolesToClerkMetadata(
  roles: string[],
): Promise<boolean> {
  try {
    // Call our API endpoint to sync roles to Clerk metadata
    // Use absolute path to avoid locale prefix issues
    const apiUrl = new URL("/api/users/sync-roles", window.location.origin);
    const response = await fetchWithCsrf(apiUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roles }),
    });

    if (!response.ok) {
      const error = await response.json();
      logger.error("Failed to sync roles to Clerk metadata", {
        status: response.status,
        error,
      });
      return false;
    }

    const result = await response.json();
    logger.info("Successfully synced roles to Clerk metadata", {
      message: result.message,
      primaryRole: result.primaryRole,
      roles: result.roles,
    });

    return true;
  } catch (error) {
    logger.error("Failed to sync roles to Clerk metadata", error, { roles });
    return false;
  }
}

/**
 * Hook to get the current user's role from Clerk metadata
 * This can be used to verify that the role has been properly stored
 * Types now flow automatically from our global type augmentation
 */
export function useClerkUserRole() {
  const { user } = useUser();

  // No more type assertions needed - types flow from clerk.d.ts
  const role = user?.publicMetadata?.role;
  const roles = user?.publicMetadata?.roles;

  return {
    primaryRole: role,
    roles: roles || [],
    hasRole: (checkRole: ValidRole) =>
      roles && Array.isArray(roles) && roles.includes(checkRole) ? true : false,
    isPrimaryRole: (checkRole: ValidRole) => role === checkRole,
  };
}
