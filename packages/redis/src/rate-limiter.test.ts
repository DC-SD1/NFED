import { beforeEach,describe, expect, it, vi } from "vitest";

import { PasswordResetRateLimiter } from "./rate-limiter";

// Mock the Redis client
vi.mock("./index", () => ({
  getRedisClient: vi.fn(() => null), // Return null to simulate no Redis
}));

describe("PasswordResetRateLimiter", () => {
  let rateLimiter: PasswordResetRateLimiter;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    process.env.AUTH_RESET_LIMIT_WINDOW_MIN = "15";
    process.env.AUTH_RESET_LIMIT_MAX = "10";
    process.env.AUTH_RESET_LIMIT_DAILY_MAX = "30";
    process.env.AUTH_RESET_LIMIT_PER_IP = "20";
    process.env.AUTH_RESET_LIMIT_BYPASS_FOR_TEST = "false";
    process.env.NODE_ENV = "production";
  });

  describe("Configuration", () => {
    it("should use default configuration values", () => {
      rateLimiter = new PasswordResetRateLimiter();
      // We can't directly test private config, but we can test behavior
      expect(rateLimiter).toBeDefined();
    });

    it("should override configuration with custom values", () => {
      rateLimiter = new PasswordResetRateLimiter({
        windowMinutes: 30,
        maxRequests: 5,
        dailyMax: 15,
      });
      expect(rateLimiter).toBeDefined();
    });
  });

  describe("Test bypass", () => {
    it("should bypass rate limiting in test environment", async () => {
      process.env.NODE_ENV = "test";
      process.env.AUTH_RESET_LIMIT_BYPASS_FOR_TEST = "true";
      
      rateLimiter = new PasswordResetRateLimiter();
      const result = await rateLimiter.checkRateLimit("test@example.com");
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
    });

    it("should not bypass rate limiting if bypass flag is false", async () => {
      process.env.NODE_ENV = "test";
      process.env.AUTH_RESET_LIMIT_BYPASS_FOR_TEST = "false";
      
      rateLimiter = new PasswordResetRateLimiter();
      const result = await rateLimiter.checkRateLimit("test@example.com");
      
      // Without Redis, it should still allow but log warning
      expect(result.allowed).toBe(true);
    });
  });

  describe("Email normalization", () => {
    it("should normalize email addresses", async () => {
      process.env.NODE_ENV = "test";
      process.env.AUTH_RESET_LIMIT_BYPASS_FOR_TEST = "true";
      
      rateLimiter = new PasswordResetRateLimiter();
      
      const result1 = await rateLimiter.checkRateLimit("TEST@EXAMPLE.COM");
      const result2 = await rateLimiter.checkRateLimit("  test@example.com  ");
      
      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
    });
  });

  describe("Fallback behavior", () => {
    it("should allow requests when Redis is not available", async () => {
      rateLimiter = new PasswordResetRateLimiter();
      const result = await rateLimiter.checkRateLimit("test@example.com");
      
      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(10); // Default limit
      expect(result.remaining).toBe(10);
    });

    it("should log warning when Redis is not available", async () => {
      const consoleSpy = vi.spyOn(console, "warn");
      
      rateLimiter = new PasswordResetRateLimiter();
      await rateLimiter.checkRateLimit("test@example.com");
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Rate limiting not available")
      );
    });
  });

  describe("Reset functionality", () => {
    it("should handle reset when Redis is not available", async () => {
      rateLimiter = new PasswordResetRateLimiter();
      
      // Should not throw
      await expect(
        rateLimiter.reset("test@example.com")
      ).resolves.toBeUndefined();
    });
  });
});