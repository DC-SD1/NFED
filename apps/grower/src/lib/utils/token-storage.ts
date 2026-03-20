/**
 * Secure token storage utilities
 * Uses sessionStorage for tokens to ensure they're cleared when browser closes
 */

import type { TokenData } from "@/types/auth-store.types";

import { logger } from "./logger";

const TOKEN_STORAGE_KEY = "cf_auth_tokens";
const TOKEN_LOCK_KEY = "cf_token_refresh_lock";
const LOCK_TIMEOUT_MS = 30000; // 30 seconds

/**
 * Safely store tokens in both session and local storage for cross-tab synchronization
 * - sessionStorage: Cleared when browser/tab closes (primary storage)
 * - localStorage: Used for cross-tab synchronization
 */
export function saveTokensToStorage(tokens: TokenData): void {
  try {
    if (typeof window === "undefined") return;

    // Only store if we have valid tokens
    if (tokens.accessToken && tokens.refreshToken) {
      const tokenData = {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        userId: tokens.userId,
        email: tokens.email,
        roles: tokens.roles,
        timestamp: Date.now(), // Add timestamp for cross-tab coordination
      };

      // Primary storage in sessionStorage
      sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));

      // Cross-tab synchronization via localStorage
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));

      logger.info("Tokens saved to session and local storage");
    }
  } catch (error) {
    logger.error("Failed to save tokens to storage", error);
  }
}

/**
 * Load tokens from storage with fallback to localStorage for cross-tab sync
 * Returns null if no valid tokens found
 */
export function loadTokensFromStorage(): TokenData | null {
  try {
    if (typeof window === "undefined") return null;

    // Try sessionStorage first (preferred)
    let storedData = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    let source = "session";

    // Fallback to localStorage for cross-tab synchronization
    if (!storedData) {
      storedData = localStorage.getItem(TOKEN_STORAGE_KEY);
      source = "local";
    }

    if (!storedData) return null;

    const tokens = JSON.parse(storedData);

    // Validate token data
    if (!tokens.accessToken || !tokens.refreshToken || !tokens.expiresAt) {
      logger.warn("Invalid token data in storage");
      clearTokensFromStorage();
      return null;
    }

    // Check if tokens are expired
    const now = Date.now() / 1000; // Current time in seconds
    if (tokens.expiresAt <= now) {
      logger.info("Stored tokens are expired");
      clearTokensFromStorage();
      return null;
    }

    // If loaded from localStorage, also store in sessionStorage for this tab
    if (source === "local") {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, storedData);
      logger.info("Tokens synchronized from localStorage to sessionStorage");
    }

    logger.info(`Tokens loaded from ${source} storage`);

    // Remove timestamp before returning
    const { timestamp: _timestamp, ...tokenState } = tokens;
    return tokenState;
  } catch (error) {
    logger.error("Failed to load tokens from storage", error);
    clearTokensFromStorage();
    return null;
  }
}

/**
 * Clear tokens from both session and local storage
 */
export function clearTokensFromStorage(): void {
  try {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    // Also clear the lock when clearing tokens
    localStorage.removeItem(TOKEN_LOCK_KEY);
    logger.info("Tokens cleared from session and local storage");
  } catch (error) {
    logger.error("Failed to clear tokens from storage", error);
  }
}

/**
 * Check if we have stored tokens without loading them
 */
export function hasStoredTokens(): boolean {
  try {
    if (typeof window === "undefined") return false;
    return (
      sessionStorage.getItem(TOKEN_STORAGE_KEY) !== null ||
      localStorage.getItem(TOKEN_STORAGE_KEY) !== null
    );
  } catch {
    return false;
  }
}

/**
 * Cross-tab locking mechanism for token refresh operations
 */
export function acquireTokenRefreshLock(): boolean {
  try {
    if (typeof window === "undefined") return false;

    const lockData = localStorage.getItem(TOKEN_LOCK_KEY);
    const now = Date.now();

    // Check if lock exists and is still valid
    if (lockData) {
      const lockTimestamp = parseInt(lockData, 10);
      if (now - lockTimestamp < LOCK_TIMEOUT_MS) {
        logger.info("Token refresh lock already held by another tab");
        return false; // Lock is held by another tab
      }
    }

    // Acquire the lock
    localStorage.setItem(TOKEN_LOCK_KEY, now.toString());
    logger.info("Token refresh lock acquired");
    return true;
  } catch (error) {
    logger.error("Failed to acquire token refresh lock", error);
    return false;
  }
}

/**
 * Release the cross-tab token refresh lock
 */
export function releaseTokenRefreshLock(): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_LOCK_KEY);
    logger.info("Token refresh lock released");
  } catch (error) {
    logger.error("Failed to release token refresh lock", error);
  }
}

/**
 * Set up listener for cross-tab token synchronization
 */
export function setupCrossTabTokenSync(
  onTokensUpdated: (tokens: TokenData | null) => void,
): () => void {
  if (typeof window === "undefined")
    return () => {
      /* no-op */
    };

  const handleStorageChange = (event: StorageEvent) => {
    // Only respond to changes to our token key
    if (event.key !== TOKEN_STORAGE_KEY) return;

    try {
      if (event.newValue) {
        // Tokens were updated in another tab
        const tokens = JSON.parse(event.newValue);

        // Validate the new tokens
        if (tokens.accessToken && tokens.refreshToken && tokens.expiresAt) {
          // Check if tokens are not expired
          const now = Date.now() / 1000;
          if (tokens.expiresAt > now) {
            // Update sessionStorage in this tab
            sessionStorage.setItem(TOKEN_STORAGE_KEY, event.newValue);

            // Remove timestamp before calling callback
            const { timestamp: _timestamp, ...tokenState } = tokens;
            logger.info("Tokens synchronized from another tab");
            onTokensUpdated(tokenState);
            return;
          }
        }
      }

      // If we reach here, tokens were cleared or invalid
      logger.info("Tokens cleared in another tab");
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      onTokensUpdated(null);
    } catch (error) {
      logger.error("Failed to handle cross-tab token sync", error);
    }
  };

  window.addEventListener("storage", handleStorageChange);
  logger.info("Cross-tab token synchronization listener set up");

  // Return cleanup function
  return () => {
    window.removeEventListener("storage", handleStorageChange);
    logger.info("Cross-tab token synchronization listener cleaned up");
  };
}
