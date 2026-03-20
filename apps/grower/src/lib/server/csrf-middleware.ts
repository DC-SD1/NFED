import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getCsrfToken } from "@/lib/server/cookies";
import { generateCsrfToken } from "@/lib/server/csrf";

/**
 * Middleware to ensure CSRF token is set for all requests
 * This should be applied to all routes that might need CSRF protection
 */
export async function csrfMiddleware(_request: NextRequest): Promise<NextResponse | null> {
  // Check if CSRF token cookie exists
  const existingToken = await getCsrfToken();
  
  // If no token exists, generate and set one
  if (!existingToken) {
    const response = NextResponse.next();
    const newToken = generateCsrfToken();
    
    // Set the CSRF token cookie with proper prefixes for production
    const cookieName = process.env.NODE_ENV === "production" ? "__Secure-cf-csrf-token" : "cf-csrf-token";
    
    response.cookies.set(cookieName, newToken, {
      path: "/",
      httpOnly: false, // Must be readable by JavaScript
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
    });
    
    return response;
  }
  
  return null; // Continue with the request
}