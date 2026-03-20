/**
 * Zustand cookie storage adapter for client-side state persistence
 * This adapter allows Zustand stores to persist state in cookies instead of localStorage
 */

import type { StateStorage } from "zustand/middleware";

import { logger } from "../utils/logger";

// Cookie utility functions for client-side
const CookieUtils = {
  get(name: string): string | undefined {
    if (typeof document === "undefined") return undefined;

    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)"),
    );
    return match?.[2] ? decodeURIComponent(match[2]) : undefined;
  },

  set(
    name: string,
    value: string,
    options: {
      expires?: number; // days
      path?: string;
      domain?: string;
      secure?: boolean;
      sameSite?: "strict" | "lax" | "none";
    } = {},
  ): void {
    if (typeof document === "undefined") return;

    let cookieString = `${name}=${encodeURIComponent(value)}`;

    if (options.expires) {
      const date = new Date();
      date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000);
      cookieString += `; expires=${date.toUTCString()}`;
    }

    if (options.path) {
      cookieString += `; path=${options.path}`;
    }

    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    if (options.secure) {
      cookieString += "; secure";
    }

    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }

    document.cookie = cookieString;
  },

  remove(
    name: string,
    options: {
      path?: string;
      domain?: string;
    } = {},
  ): void {
    if (typeof document === "undefined") return;

    let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC`;

    if (options.path) {
      cookieString += `; path=${options.path}`;
    }

    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    document.cookie = cookieString;
  },
};

// Cookie storage adapter for Zustand
export const cookieStorage: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      // For SSR, return null (will be hydrated from server)
      if (typeof window === "undefined") {
        return null;
      }

      const value = CookieUtils.get(name);
      return value || null;
    } catch (error) {
      logger.error("Error reading cookie from Zustand storage:", {
        error,
      });
      return null;
    }
  },

  setItem: (name: string, value: string): void => {
    try {
      // Skip on server
      if (typeof window === "undefined") {
        return;
      }

      // Set cookie with appropriate options
      CookieUtils.set(name, value, {
        expires: 7, // 7 days
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    } catch (error) {
      logger.error("Error writing cookie to Zustand storage:", {
        error,
      });
    }
  },

  removeItem: (name: string): void => {
    try {
      // Skip on server
      if (typeof window === "undefined") {
        return;
      }

      CookieUtils.remove(name, { path: "/" });
    } catch (error) {
      logger.error("Error removing cookie from Zustand storage:", {
        error,
      });
    }
  },
};

// Helper to create a cookie-persisted store with proper SSR handling
export function createCookiePersistedStore(
  name: string,
  options?: {
    expires?: number;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
  },
): StateStorage {
  return {
    getItem: cookieStorage.getItem,
    setItem: (key: string, value: string) => {
      try {
        if (typeof window === "undefined") return;

        CookieUtils.set(key, value, {
          expires: options?.expires || 7,
          path: "/",
          secure: options?.secure ?? process.env.NODE_ENV === "production",
          sameSite: options?.sameSite || "strict",
        });
      } catch (error) {
        logger.error("Error in cookie storage setItem:", {
          error,
        });
      }
    },
    removeItem: cookieStorage.removeItem,
  };
}

// Type-safe cookie names for auth data
export const AUTH_COOKIE_KEYS = {
  USER_ID: "cf-user-id",
  EMAIL: "cf-user-email",
  ROLES: "cf-user-roles",
  EXPIRES_AT: "cf-user-expires",
} as const;

// Helper to get initial auth state from cookies (for SSR)
export function getInitialAuthStateFromCookies(): {
  userId: string | null;
  email: string | null;
  roles: string[] | null;
  expiresAt: number | null;
} {
  if (typeof window === "undefined") {
    // Server-side: would need to use Next.js cookies() here
    return {
      userId: null,
      email: null,
      roles: null,
      expiresAt: null,
    };
  }

  // Client-side: read from cookies
  const userId = CookieUtils.get(AUTH_COOKIE_KEYS.USER_ID) || null;
  const email = CookieUtils.get(AUTH_COOKIE_KEYS.EMAIL) || null;
  const rolesStr = CookieUtils.get(AUTH_COOKIE_KEYS.ROLES);
  const expiresAtStr = CookieUtils.get(AUTH_COOKIE_KEYS.EXPIRES_AT);

  let roles: string[] | null = null;
  if (rolesStr) {
    try {
      roles = JSON.parse(rolesStr);
    } catch {
      logger.error("Failed to parse roles from cookie");
    }
  }

  let expiresAt: number | null = null;
  if (expiresAtStr) {
    const parsed = parseInt(expiresAtStr, 10);
    if (!isNaN(parsed)) {
      expiresAt = parsed;
    }
  }

  return {
    userId,
    email,
    roles,
    expiresAt,
  };
}
