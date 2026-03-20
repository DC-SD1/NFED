import { auth, clerkClient } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  determinePrimaryRole,
  mapLegacyRoles,
  syncRolesSchema,
} from "@/lib/schemas/auth";
import { logger } from "@/lib/utils/logger";

/**
 * API endpoint to sync user roles from our backend token data to Clerk metadata
 * This is useful for existing users who signed up before role metadata was implemented
 *
 * This endpoint should be called after token exchange when we have the user's roles
 * from the backend but they're not yet in Clerk metadata
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if roles are already in Clerk metadata (types now flow automatically)
    const existingRoles = sessionClaims?.publicMetadata?.roles;
    if (existingRoles && existingRoles.length > 0) {
      const primaryRole = determinePrimaryRole(existingRoles);
      return NextResponse.json({
        success: true,
        message: "Roles already synced",
        primaryRole,
        roles: existingRoles,
      });
    }

    // Parse and validate request body
    const body = await request.json();

    // Map legacy role names from backend
    if (body.roles && Array.isArray(body.roles)) {
      body.roles = mapLegacyRoles(body.roles);
    }

    const validation = syncRolesSchema.safeParse(body);

    if (!validation.success) {
      logger.warn("Invalid roles sync request", {
        userId,
        errors: validation.error.flatten(),
      });
      return NextResponse.json(
        {
          error: "Invalid request",
          details: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { roles } = validation.data;

    // Determine primary role using helper function
    const primaryRole = determinePrimaryRole(roles);

    // Update user's public metadata in Clerk
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        roles: roles,
      },
    });

    logger.info("Synced roles to Clerk metadata", {
      userId,
      primaryRole,
      roles,
    });

    return NextResponse.json({
      success: true,
      message: "Roles synced successfully",
      primaryRole,
      roles,
    });
  } catch (error) {
    logger.error("Failed to sync roles to Clerk metadata", { error });
    return NextResponse.json(
      { error: "Failed to sync user roles" },
      { status: 500 },
    );
  }
}
