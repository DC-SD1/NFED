import type { RetryConfig } from "../../../types/auth-store.types";

// Authentication configuration constants
export const AUTH_CONFIG = {
  // Token exchange retry configuration
  retry: {
    maxAttempts: 3,
    initialDelay: 1000, // 1 second
    backoffMultiplier: 2,
  } as RetryConfig,

  // Operation configuration
  operations: {
    resendCooldownSeconds: 60,
  },

  // API endpoints (relative to base URL)
  endpoints: {
    exchange: "/api/auth/exchange",
    refresh: "/api/auth/refresh",
    logout: "/api/auth/logout",
  },

  // Storage configuration
  storage: {
    name: "auth-storage",
    // Fields to persist to cookies (sensitive tokens excluded)
    persistFields: ["userId", "email", "roles", "expiresAt"] as const,
  },

  // Logging configuration
  logging: {
    enabled: process.env.NODE_ENV === "development",
    verboseErrors: process.env.NODE_ENV === "development",
  },
} as const;

// Re-export for convenience
export type AuthConfigType = typeof AUTH_CONFIG;
