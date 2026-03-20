import { verifyToken } from "@clerk/backend";

import { logger } from "@/lib/utils/logger";

interface ClerkJWTPayload {
  sub: string; // User ID
  email?: string;
  firstName?: string;
  lastName?: string;
  publicMetadata?: {
    roles?: string[];
  };
}

/**
 * Verify a Clerk JWT token server-side
 * @param token - The JWT token from Clerk
 * @returns The decoded JWT payload if valid, null otherwise
 */
export async function verifyClerkToken(
  token: string,
): Promise<ClerkJWTPayload | null> {
  try {
    const secretKey = process.env.CLERK_SECRET_KEY;

    if (!secretKey) {
      logger.error("CLERK_SECRET_KEY not configured");
      return null;
    }

    // Verify the JWT using Clerk's backend SDK
    const verifiedToken = await verifyToken(token, {
      secretKey,
    });

    if (!verifiedToken?.sub) {
      logger.error("Invalid Clerk token structure", {
        hasToken: !!verifiedToken,
      });
      return null;
    }

    logger.info("Clerk token verified successfully", {
      userId: verifiedToken.sub,
    });

    return verifiedToken as ClerkJWTPayload;
  } catch (error) {
    logger.error("Failed to verify Clerk token", error);
    return null;
  }
}
