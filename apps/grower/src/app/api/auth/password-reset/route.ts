import { PasswordResetRateLimiter } from "@cf/redis";
import { clerkClient } from "@clerk/nextjs/server";
import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";

import { logger } from "@/lib/utils/logger";

const rateLimiter = new PasswordResetRateLimiter();

function getIpAddress(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() || realIp || "unknown";
  return ip;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_REQUEST",
            message: "Email address is required",
          },
        },
        { status: 400 },
      );
    }

    // Get IP address for rate limiting
    const ip = getIpAddress(request);

    // Check rate limits
    const rateLimitResult = await rateLimiter.checkRateLimit(email, ip);

    if (!rateLimitResult.allowed) {
      logger.warn("Password reset rate limit exceeded", {
        email: email.substring(0, 3) + "***", // Partial email for debugging
        ip,
        retryAfter: rateLimitResult.retryAfter,
      });

      const headers = new Headers();
      headers.set("X-RateLimit-Limit", rateLimitResult.limit.toString());
      headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
      headers.set("X-RateLimit-Reset", new Date(rateLimitResult.resetTime).toISOString());
      
      if (rateLimitResult.retryAfter) {
        headers.set("Retry-After", rateLimitResult.retryAfter.toString());
      }

      // Generic message to prevent enumeration
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many password reset attempts. Please try again later.",
          },
        },
        { 
          status: 429,
          headers,
        },
      );
    }

    try {
      // Try to find the user by email using Clerk
      const clerk = await clerkClient();
      const users = await clerk.users.getUserList({
        emailAddress: [email],
      });

      const user = users.data[0];

      // Log the attempt (but not the full email for privacy)
      logger.info("Password reset rate limit check passed", {
        email: email.substring(0, 3) + "***",
        userExists: !!user,
      });

      // Always return success to prevent enumeration
      // The actual password reset is handled client-side through Clerk
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent.",
      });
      
    } catch (clerkError: any) {
      // Log the actual error but return generic message
      logger.error("Clerk error during password reset", {
        error: clerkError?.message || "Unknown error",
        email: email.substring(0, 3) + "***",
      });

      // Still return success to prevent enumeration
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent.",
      });
    }
  } catch (error: any) {
    logger.error("Password reset request failed", {
      error: error?.message || "Unknown error",
    });

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Something went wrong. Please try again later.",
        },
      },
      { status: 500 },
    );
  }
}