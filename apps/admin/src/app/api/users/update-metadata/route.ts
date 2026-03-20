import { auth, clerkClient } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { determinePrimaryRole, updateMetadataSchema } from "@/lib/schemas/auth";
import { logger } from "@/lib/utils/logger";

/**
 * API endpoint to update user metadata in Clerk
 * This should only be called after successful backend registration
 */
// Handle CORS preflight
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateMetadataSchema.safeParse(body);

    if (!validation.success) {
      logger.warn("Invalid metadata update request", {
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
        role: primaryRole,
        roles: roles,
      },
    });

    logger.info("Updated Clerk metadata", {
      userId,
      primaryRole,
      roles,
    });

    return NextResponse.json({
      success: true,
      primaryRole,
      roles,
    });
  } catch (error) {
    logger.error("Failed to update Clerk metadata", { error });
    return NextResponse.json(
      { error: "Failed to update user metadata" },
      { status: 500 },
    );
  }
}
