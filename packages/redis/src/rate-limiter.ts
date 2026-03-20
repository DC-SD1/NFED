import { Ratelimit } from "@upstash/ratelimit";
import type { Redis } from "@upstash/redis";
import { createHash } from "crypto";

import { getRedisClient } from "./index";

interface RateLimitConfig {
  windowMinutes: number;
  maxRequests: number;
  dailyMax?: number;
  bypassForTest?: boolean;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export class PasswordResetRateLimiter {
  private emailLimiter: Ratelimit | null = null;
  private ipLimiter: Ratelimit | null = null;
  private dailyEmailLimiter: Ratelimit | null = null;
  private config: RateLimitConfig;
  private redis: Redis | null;

  constructor(config?: Partial<RateLimitConfig>) {
    this.config = {
      windowMinutes: parseInt(process.env.AUTH_RESET_LIMIT_WINDOW_MIN ?? "15"),
      maxRequests: parseInt(process.env.AUTH_RESET_LIMIT_MAX ?? "10"),
      dailyMax: parseInt(process.env.AUTH_RESET_LIMIT_DAILY_MAX ?? "30"),
      bypassForTest: process.env.AUTH_RESET_LIMIT_BYPASS_FOR_TEST === "true",
      ...config,
    };

    this.redis = getRedisClient();
    this.initializeLimiters();
  }

  private initializeLimiters(): void {
    if (!this.redis) {
      console.warn("Redis not available, rate limiting will use in-memory fallback");
      return;
    }

    // Email rate limiter: sliding window
    this.emailLimiter = new Ratelimit({
      redis: this.redis,
      limiter: Ratelimit.slidingWindow(
        this.config.maxRequests,
        `${this.config.windowMinutes} m`,
      ),
      prefix: "password-reset:email",
      analytics: true,
    });

    // IP rate limiter: sliding window with higher limit
    const ipMaxRequests = parseInt(process.env.AUTH_RESET_LIMIT_PER_IP ?? "20");
    this.ipLimiter = new Ratelimit({
      redis: this.redis,
      limiter: Ratelimit.slidingWindow(
        ipMaxRequests,
        `${this.config.windowMinutes} m`,
      ),
      prefix: "password-reset:ip",
      analytics: true,
    });

    // Daily email limiter: fixed window
    if (this.config.dailyMax) {
      this.dailyEmailLimiter = new Ratelimit({
        redis: this.redis,
        limiter: Ratelimit.fixedWindow(this.config.dailyMax, "24 h"),
        prefix: "password-reset:daily",
        analytics: true,
      });
    }
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private hashIdentifier(identifier: string): string {
    return createHash("sha256").update(identifier).digest("hex");
  }

  async checkRateLimit(
    email: string,
    ip?: string,
  ): Promise<RateLimitResult> {
    // Bypass for tests
    if (this.config.bypassForTest && process.env.NODE_ENV === "test") {
      return {
        allowed: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        resetTime: Date.now() + this.config.windowMinutes * 60 * 1000,
      };
    }

    // If Redis not available, allow the request but log warning
    if (!this.redis || !this.emailLimiter) {
      console.warn("Rate limiting not available, allowing request");
      return {
        allowed: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        resetTime: Date.now() + this.config.windowMinutes * 60 * 1000,
      };
    }

    const normalizedEmail = this.normalizeEmail(email);
    const hashedEmail = this.hashIdentifier(normalizedEmail);
    const results: RateLimitResult[] = [];

    // Check email rate limit
    const emailResult = await this.emailLimiter.limit(hashedEmail);
    results.push({
      allowed: emailResult.success,
      limit: emailResult.limit,
      remaining: emailResult.remaining,
      resetTime: emailResult.reset,
      retryAfter: emailResult.success ? undefined : Math.ceil((emailResult.reset - Date.now()) / 1000),
    });

    // Check IP rate limit if provided
    if (ip && this.ipLimiter) {
      const ipResult = await this.ipLimiter.limit(ip);
      results.push({
        allowed: ipResult.success,
        limit: ipResult.limit,
        remaining: ipResult.remaining,
        resetTime: ipResult.reset,
        retryAfter: ipResult.success ? undefined : Math.ceil((ipResult.reset - Date.now()) / 1000),
      });
    }

    // Check daily limit
    if (this.dailyEmailLimiter) {
      const dailyResult = await this.dailyEmailLimiter.limit(hashedEmail);
      results.push({
        allowed: dailyResult.success,
        limit: dailyResult.limit,
        remaining: dailyResult.remaining,
        resetTime: dailyResult.reset,
        retryAfter: dailyResult.success ? undefined : Math.ceil((dailyResult.reset - Date.now()) / 1000),
      });
    }

    // Find the most restrictive result
    const mostRestrictive = results.reduce((prev, curr) => {
      if (!curr.allowed) return curr;
      if (!prev.allowed) return prev;
      return curr.remaining < prev.remaining ? curr : prev;
    });

    // Log if approaching limit (80% threshold)
    if (mostRestrictive.allowed && mostRestrictive.remaining <= Math.ceil(mostRestrictive.limit * 0.2)) {
      console.warn("Password reset rate limit approaching", {
        email: hashedEmail.substring(0, 8), // Log partial hash for debugging
        remaining: mostRestrictive.remaining,
        limit: mostRestrictive.limit,
      });
    }

    return mostRestrictive;
  }

  async reset(email: string): Promise<void> {
    if (!this.redis) return;
    
    const normalizedEmail = this.normalizeEmail(email);
    const hashedEmail = this.hashIdentifier(normalizedEmail);
    
    // Reset all limiters for this email
    const keys = [
      `password-reset:email:${hashedEmail}`,
      `password-reset:daily:${hashedEmail}`,
    ];
    
    await Promise.all(keys.map(key => this.redis?.del(key)));
  }
}

export class OtpVerificationRateLimiter {
  private attemptLimiter: Ratelimit | null = null;
  private lockoutLimiter: Ratelimit | null = null;
  private config: {
    maxAttempts: number;
    windowMinutes: number;
    lockoutMinutes: number;
    bypassForTest?: boolean;
  };
  private redis: Redis | null;

  constructor(config?: Partial<{
    maxAttempts: number;
    windowMinutes: number;
    lockoutMinutes: number;
    bypassForTest?: boolean;
  }>) {
    this.config = {
      maxAttempts: parseInt(process.env.AUTH_OTP_LIMIT_MAX ?? "3"),
      windowMinutes: parseInt(process.env.AUTH_OTP_LIMIT_WINDOW_MIN ?? "15"),
      lockoutMinutes: parseInt(process.env.AUTH_OTP_LOCKOUT_MIN ?? "15"),
      bypassForTest: process.env.AUTH_OTP_LIMIT_BYPASS_FOR_TEST === "true",
      ...config,
    };

    this.redis = getRedisClient();
    this.initializeLimiters();
  }

  private initializeLimiters(): void {
    if (!this.redis) {
      console.warn("Redis not available, OTP rate limiting will use in-memory fallback");
      return;
    }

    // OTP attempt limiter: fixed window
    this.attemptLimiter = new Ratelimit({
      redis: this.redis,
      limiter: Ratelimit.fixedWindow(
        this.config.maxAttempts,
        `${this.config.windowMinutes} m`,
      ),
      prefix: "otp-verify:attempt",
      analytics: true,
    });

    // Lockout limiter: tracks if user is in lockout period
    this.lockoutLimiter = new Ratelimit({
      redis: this.redis,
      limiter: Ratelimit.fixedWindow(
        1, // Just tracking lockout state
        `${this.config.lockoutMinutes} m`,
      ),
      prefix: "otp-verify:lockout",
      analytics: false,
    });
  }

  private normalizeIdentifier(identifier: string): string {
    return identifier.trim().toLowerCase();
  }

  private hashIdentifier(identifier: string): string {
    return createHash("sha256").update(identifier).digest("hex");
  }

  async checkRateLimit(
    identifier: string, // email or session ID
    mode: "signup" | "reset" | "verify",
  ): Promise<RateLimitResult> {
    // Bypass for tests
    if (this.config.bypassForTest && process.env.NODE_ENV === "test") {
      return {
        allowed: true,
        limit: this.config.maxAttempts,
        remaining: this.config.maxAttempts,
        resetTime: Date.now() + this.config.windowMinutes * 60 * 1000,
      };
    }

    // If Redis not available, allow the request but log warning
    if (!this.redis || !this.attemptLimiter || !this.lockoutLimiter) {
      console.warn("OTP rate limiting not available, allowing request");
      return {
        allowed: true,
        limit: this.config.maxAttempts,
        remaining: this.config.maxAttempts,
        resetTime: Date.now() + this.config.windowMinutes * 60 * 1000,
      };
    }

    const normalizedId = this.normalizeIdentifier(identifier);
    const hashedId = this.hashIdentifier(`${mode}:${normalizedId}`);

    // Check if in lockout period
    const lockoutKey = `${hashedId}:locked`;
    const lockoutResult = await this.lockoutLimiter.limit(lockoutKey);
    
    if (!lockoutResult.success) {
      // User is locked out
      return {
        allowed: false,
        limit: 0,
        remaining: 0,
        resetTime: lockoutResult.reset,
        retryAfter: Math.ceil((lockoutResult.reset - Date.now()) / 1000),
      };
    }

    // Check attempt limit
    const attemptResult = await this.attemptLimiter.limit(hashedId);
    
    // If this was their last attempt and it failed, trigger lockout
    if (!attemptResult.success || attemptResult.remaining === 0) {
      // Set lockout flag
      await this.redis.set(
        `otp-verify:lockout:${lockoutKey}`,
        "1",
        { ex: this.config.lockoutMinutes * 60 },
      );
      
      return {
        allowed: attemptResult.success,
        limit: attemptResult.limit,
        remaining: attemptResult.remaining,
        resetTime: attemptResult.reset,
        retryAfter: attemptResult.success ? undefined : this.config.lockoutMinutes * 60,
      };
    }

    return {
      allowed: attemptResult.success,
      limit: attemptResult.limit,
      remaining: attemptResult.remaining,
      resetTime: attemptResult.reset,
      retryAfter: attemptResult.success ? undefined : Math.ceil((attemptResult.reset - Date.now()) / 1000),
    };
  }

  async reset(identifier: string, mode: "signup" | "reset" | "verify"): Promise<void> {
    if (!this.redis) return;
    
    const normalizedId = this.normalizeIdentifier(identifier);
    const hashedId = this.hashIdentifier(`${mode}:${normalizedId}`);
    
    // Reset all limiters for this identifier
    const keys = [
      `otp-verify:attempt:${hashedId}`,
      `otp-verify:lockout:${hashedId}:locked`,
    ];
    
    await Promise.all(keys.map(key => this.redis?.del(key)));
  }
}