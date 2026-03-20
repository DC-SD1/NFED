import { OtpVerificationRateLimiter } from "@cf/redis";
import { type NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logger";

const rateLimiter = new OtpVerificationRateLimiter();

export async function POST(request: NextRequest) {
  try {
    const { otp, identifier, mode } = await request.json();

    // Validate inputs
    if (!otp || typeof otp !== "string" || otp.length !== 6) {
      return NextResponse.json(
        { error: { message: "Invalid OTP code" } },
        { status: 400 },
      );
    }

    if (!identifier || typeof identifier !== "string") {
      return NextResponse.json(
        { error: { message: "Invalid identifier" } },
        { status: 400 },
      );
    }

    if (!mode || !["signup", "reset", "verify"].includes(mode)) {
      return NextResponse.json(
        { error: { message: "Invalid verification mode" } },
        { status: 400 },
      );
    }

    // Get IP address for additional tracking
    const ip =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "unknown";

    // Check rate limit
    const rateLimitResult = await rateLimiter.checkRateLimit(identifier, mode);

    if (!rateLimitResult.allowed) {
      logger.warn("OTP verification rate limit exceeded", {
        identifier: identifier.substring(0, 3) + "***",
        mode,
        ip,
        retryAfter: rateLimitResult.retryAfter,
      });

      return NextResponse.json(
        {
          error: {
            message: "Too many attempts. Please try again later.",
            code: "rate_limit_exceeded",
            retryAfter: rateLimitResult.retryAfter,
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.retryAfter ?? 900), // Default 15 min
            "X-RateLimit-Limit": String(rateLimitResult.limit),
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": new Date(
              rateLimitResult.resetTime,
            ).toISOString(),
          },
        },
      );
    }

    // Log the attempt (but not the OTP code for security)
    logger.info("OTP verification attempt", {
      identifier: identifier.substring(0, 3) + "***",
      mode,
      remaining: rateLimitResult.remaining,
      ip,
    });

    // Return rate limit info to the client
    // The actual OTP verification will be done client-side with Clerk
    return NextResponse.json(
      {
        allowed: true,
        remaining: rateLimitResult.remaining,
        resetTime: rateLimitResult.resetTime,
      },
      {
        headers: {
          "X-RateLimit-Limit": String(rateLimitResult.limit),
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": new Date(
            rateLimitResult.resetTime,
          ).toISOString(),
        },
      },
    );
  } catch (error: any) {
    logger.error("OTP verification rate limit check failed", {
      error: error?.message || "Unknown error",
    });

    // Return success to avoid blocking legitimate users if rate limiting fails
    return NextResponse.json({
      allowed: true,
      remaining: 3,
      resetTime: Date.now() + 15 * 60 * 1000,
    });
  }
}

// Endpoint to reset rate limit after successful verification
export async function DELETE(request: NextRequest) {
  try {
    const { identifier, mode } = await request.json();

    if (!identifier || !mode) {
      return NextResponse.json(
        { error: { message: "Invalid parameters" } },
        { status: 400 },
      );
    }

    await rateLimiter.reset(identifier, mode);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("Failed to reset OTP rate limit", {
      error: error?.message || "Unknown error",
    });

    return NextResponse.json(
      { error: { message: "Failed to reset rate limit" } },
      { status: 500 },
    );
  }
}
