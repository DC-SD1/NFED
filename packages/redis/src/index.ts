import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn("Upstash Redis environment variables not configured");
    return null;
  }

  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  return redis;
}

export { OtpVerificationRateLimiter,PasswordResetRateLimiter } from "./rate-limiter";
export type { RatelimitConfig } from "@upstash/ratelimit";
export { Ratelimit } from "@upstash/ratelimit";
export { Redis } from "@upstash/redis";