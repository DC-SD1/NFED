import { z } from "zod";

/**
 * Role constants - single source of truth for all role names
 * Use these constants instead of hardcoded strings throughout the application
 */
export const ROLES = {
  BUYER: "Buyer",
  FARM_OWNER: "FarmOwner",
  FARM_MANAGER: "FarmManager",
  AGENT: "Agent",
} as const;

/**
 * Valid roles in the system
 * Derived from ROLES constants to ensure consistency
 */
export const validRoles = z.enum([
  ROLES.BUYER,
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
 * This handles the backend still using different role name conventions
 */
export function mapLegacyRoles(roles: string[]): string[] {
  return roles.map((role) => {
    if (role === "Buyer") return ROLES.BUYER;
    if (role === "FarmOwner" || role === "Farmer") return ROLES.FARM_OWNER;
    if (role === "FarmManager") return ROLES.FARM_MANAGER;
    if (role === "Agent") return ROLES.AGENT;
    return role;
  });
}

/**
 * Helper to determine primary role based on precedence
 * Buyer > FarmOwner > Agent > FarmManager > First role in array
 */
export function determinePrimaryRole(roles: ValidRole[]): ValidRole {
  if (roles.includes(ROLES.BUYER)) return ROLES.BUYER;
  if (roles.includes(ROLES.FARM_OWNER)) return ROLES.FARM_OWNER;
  if (roles.includes(ROLES.AGENT)) return ROLES.AGENT;
  if (roles.includes(ROLES.FARM_MANAGER)) return ROLES.FARM_MANAGER;
  return roles[0] || ROLES.BUYER; // Default to Buyer if somehow empty
}
