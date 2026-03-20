import { LRUCache } from "lru-cache";
import { NextResponse } from "next/server";

import { logger } from "@/lib/utils/logger";

const isDevelopment = process.env.NODE_ENV === "development";
/**
 * Multiply every limit when running in development so hot-reloads,
 * Cypress/Playwright tests, etc. don’t get throttled.
 */
const RATE_LIMIT_FACTOR = isDevelopment ? 10 : 1;

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (identifier: string) => string; // Custom key generator
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * Simple in-memory rate limiter using LRU cache
 * For production, consider using Redis or similar
 */
class RateLimiter {
  private cache: LRUCache<string, RateLimitEntry>;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.cache = new LRUCache<string, RateLimitEntry>({
      max: 10000, // Maximum number of items in cache
      ttl: config.windowMs, // TTL matches the rate limit window
    });
  }

  /**
   * Check if request should be rate limited
   * @returns true if request is allowed, false if rate limited
   */
  check(identifier: string): {
    allowed: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
  } {
    const key = this.config.keyGenerator
      ? this.config.keyGenerator(identifier)
      : identifier;

    const now = Date.now();
    const entry = this.cache.get(key);

    if (!entry || now > entry.resetTime) {
      // New window or expired entry
      const resetTime = now + this.config.windowMs;
      this.cache.set(key, {
        count: 1,
        resetTime,
      });

      return {
        allowed: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        resetTime,
      };
    }

    // Existing entry in current window
    if (entry.count >= this.config.maxRequests) {
      return {
        allowed: false,
        limit: this.config.maxRequests,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    // Increment count
    entry.count += 1;
    this.cache.set(key, entry);

    return {
      allowed: true,
      limit: this.config.maxRequests,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Reset rate limit for a specific identifier
   */
  reset(identifier: string): void {
    const key = this.config.keyGenerator
      ? this.config.keyGenerator(identifier)
      : identifier;
    this.cache.delete(key);
  }
}

// Create rate limiters for different scenarios
const rateLimiters = {
  // General API rate limiter
  api: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100 * RATE_LIMIT_FACTOR, // 100 req/min (1000 in dev)
  }),

  // Stricter rate limiter for auth endpoints
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 30 * RATE_LIMIT_FACTOR, // 30 req/15 min (300 in dev)
  }),

  // Rate limiter for expensive operations
  expensive: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20 * RATE_LIMIT_FACTOR, // 20 req/hr (200 in dev)
  }),
};

/**
 * Rate limit middleware for API routes
 */
export async function rateLimitMiddleware(
  request: Request,
  identifier: string,
  limiterType: keyof typeof rateLimiters = "api",
): Promise<NextResponse | null> {
  const limiter = rateLimiters[limiterType];
  const result = limiter.check(identifier);

  // Add rate limit headers
  const headers = new Headers();
  headers.set("X-RateLimit-Limit", result.limit.toString());
  headers.set("X-RateLimit-Remaining", result.remaining.toString());
  headers.set("X-RateLimit-Reset", new Date(result.resetTime).toISOString());

  if (!result.allowed) {
    logger.warn("Rate limit exceeded", {
      identifier,
      limiterType,
      limit: result.limit,
    });

    // Match the backend error response format
    return NextResponse.json(
      {
        errors: [
          {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests, please try again later",
            type: 7,
          },
        ],
        traceId: `rate-limit-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
      {
        status: 429,
        headers,
      },
    );
  }

  // Request is allowed, return null to continue
  return null;
}

/**
 * Get identifier from request for rate limiting
 * Uses user ID if authenticated, otherwise falls back to IP
 */
export async function getRateLimitIdentifier(
  request: Request,
  userId?: string | null,
): Promise<string> {
  // ToDo Use Device Id/ Browser Fingerprint
  // Prefer user ID for authenticated requests
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  return `ip:${ip}`;
}

/**
 * Check if a path should be rate limited differently
 */
export function getRateLimiterType(path: string): keyof typeof rateLimiters {
  // Auth endpoints get stricter limits
  if (
    path.includes("/auth/") ||
    path.includes("/login") ||
    path.includes("/register")
  ) {
    return "auth";
  }

  // Expensive operations
  if (
    path.includes("/export") ||
    path.includes("/report") ||
    path.includes("/analytics")
  ) {
    return "expensive";
  }

  // Default API rate limiter
  return "api";
}
