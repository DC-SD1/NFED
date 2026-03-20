import { NextResponse } from "next/server";

import { getCsrfToken, setCsrfTokenCookie } from "@/lib/server/cookies";
import { generateCsrfToken } from "@/lib/server/csrf";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/auth/csrf
 *
 * Get or generate a CSRF token for the current session
 */
export async function GET() {
  try {
    // Check if CSRF token already exists
    let csrfToken = await getCsrfToken();

    // If no token exists, generate and set one
    if (!csrfToken) {
      csrfToken = generateCsrfToken();
      await setCsrfTokenCookie(csrfToken);
      logger.info("Generated new CSRF token");
    }

    return NextResponse.json({
      csrfToken,
      success: true,
    });
  } catch (error) {
    logger.error("Failed to get/generate CSRF token", error);
    return NextResponse.json(
      { message: "Failed to generate CSRF token" },
      { status: 500 },
    );
  }
}
