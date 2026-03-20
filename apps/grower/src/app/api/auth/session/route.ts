import { NextResponse } from "next/server";

import { 
  getAuthCookies,
  hasValidAuthCookies
} from "@/lib/server/cookies";
import { logger } from "@/lib/utils/logger";
import {
  UserMetadataSchema} from "@/types/auth";

/**
 * GET /api/auth/session
 * 
 * Retrieve current session status and user data for React Server Components.
 * Validates authentication cookies and returns session information.
 */
export async function GET() {
  try {
    // Check if auth cookies are valid
    const isValid = await hasValidAuthCookies();
    
    if (!isValid) {
      return NextResponse.json(
        { 
          isAuthenticated: false,
          message: "No valid session found"
        },
        { status: 401 }
      );
    }

    // Get authentication data from cookies
    const { userMetadata } = await getAuthCookies();
    
    if (!userMetadata) {
      logger.warn("Valid cookies but missing user metadata");
      return NextResponse.json(
        { 
          isAuthenticated: false,
          message: "Session data incomplete"
        },
        { status: 401 }
      );
    }

    // Validate user metadata structure
    const validationResult = UserMetadataSchema.safeParse(userMetadata);
    
    if (!validationResult.success) {
      logger.error("Invalid user metadata format in cookies", {
        errors: validationResult.error.flatten()
      });
      return NextResponse.json(
        { 
          isAuthenticated: false,
          message: "Invalid session data"
        },
        { status: 401 }
      );
    }

    const validatedMetadata = validationResult.data;
    
    // Check if session is not expired (double-check)
    const currentTime = Date.now();
    if (currentTime >= validatedMetadata.expiresAt) {
      logger.info("Session expired", {
        userId: validatedMetadata.userId,
        expiresAt: new Date(validatedMetadata.expiresAt).toISOString(),
        currentTime: new Date(currentTime).toISOString()
      });
      
      return NextResponse.json(
        { 
          isAuthenticated: false,
          message: "Session expired"
        },
        { status: 401 }
      );
    }

    // Return user session data (excluding sensitive tokens)
    const sessionResponse = {
      isAuthenticated: true,
      user: {
        userId: validatedMetadata.userId,
        email: validatedMetadata.email,
        roles: validatedMetadata.roles,
        expiresAt: validatedMetadata.expiresAt
      }
    };

    // Add cache headers to prevent caching of session data
    const headers = new Headers();
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    headers.set("Pragma", "no-cache");
    headers.set("Expires", "0");

    return NextResponse.json(sessionResponse, { 
      status: 200,
      headers 
    });

  } catch (error) {
    logger.error("Unexpected error in session endpoint", error);
    return NextResponse.json(
      { 
        isAuthenticated: false,
        message: "Internal server error"
      },
      { status: 500 }
    );
  }
}

/**
 * HEAD /api/auth/session
 * 
 * Lightweight session check that only returns status headers.
 * Useful for quick authentication checks without payload.
 */
export async function HEAD() {
  try {
    const isValid = await hasValidAuthCookies();
    
    const headers = new Headers();
    headers.set("X-Authenticated", isValid ? "true" : "false");
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    
    return new Response(null, {
      status: isValid ? 200 : 401,
      headers
    });
  } catch (error) {
    logger.error("Error in session HEAD check", error);
    return new Response(null, { status: 500 });
  }
}