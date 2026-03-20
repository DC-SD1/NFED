import { z } from "zod";

/**
 * Role constants - single source of truth for all role names
 * Use these constants instead of hardcoded strings throughout the application
 */
export const ROLES = {
  FARM_OWNER: "FarmOwner",
  FARM_MANAGER: "FarmManager",
  AGENT: "Agent",
} as const;

/**
 * Valid roles in the system
 * Derived from ROLES constants to ensure consistency
 */
export const validRoles = z.enum([
  ROLES.FARM_OWNER,
  ROLES.AGENT,
  ROLES.FARM_MANAGER,
]);

export type ValidRole = z.infer<typeof validRoles>;

/**
 * Schema for syncing roles to Clerk metadata
 */
export const syncRolesSchema = z.object({
  roles: z.array(validRoles).min(1, "At least one role is required"),
});

export type SyncRolesRequest = z.infer<typeof syncRolesSchema>;

/**
 * Schema for updating user metadata
 * Currently same as sync roles, but kept separate for future extensibility
 */
export const updateMetadataSchema = z.object({
  roles: z.array(validRoles).min(1, "At least one role is required"),
});

export type UpdateMetadataRequest = z.infer<typeof updateMetadataSchema>;

/**
 * Helper to map legacy role names to current role names
 * This handles the backend still using "Farmer" instead of "FarmOwner"
 */
export function mapLegacyRoles(roles: string[]): string[] {
  return roles.map((role) => (role === "Farmer" ? ROLES.FARM_OWNER : role));
}

/**
 * Helper to determine primary role based on precedence
 * FarmOwner > Agent > First role in array
 */
export function determinePrimaryRole(roles: ValidRole[]): ValidRole {
  if (roles.includes(ROLES.FARM_OWNER)) return ROLES.FARM_OWNER;
  if (roles.includes(ROLES.AGENT)) return ROLES.AGENT;
  return roles[0] || ROLES.FARM_OWNER; // Default to FarmOwner if somehow empty
}
