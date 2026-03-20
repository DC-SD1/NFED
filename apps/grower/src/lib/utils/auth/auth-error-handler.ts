import { ApiError } from "@/lib/errors";
import { logger } from "@/lib/utils/logger";
import type { AuthError, ErrorStrategy } from "@/types/auth-store.types";
import { AuthErrorCode } from "@/types/auth-store.types";

/**
 * Strategy for handling API errors
 */
class ApiErrorStrategy implements ErrorStrategy {
  canHandle(error: unknown): boolean {
    return error instanceof ApiError;
  }

  handle(error: unknown): AuthError {
    const apiError = error as ApiError;
    let code: AuthErrorCode = AuthErrorCode.UNKNOWN_ERROR;

    // Map specific error codes
    if (apiError.errorCode === "AUTH_INVALID_REFRESH_TOKEN") {
      code = AuthErrorCode.INVALID_REFRESH_TOKEN;
    } else if (
      apiError.errorCode === "AUTHENTICATION_FAILED" ||
      apiError.status === 401
    ) {
      code = AuthErrorCode.AUTHENTICATION_FAILED;
    } else if (apiError.status && apiError.status >= 500) {
      code = AuthErrorCode.SERVER_ERROR;
    }

    return {
      code,
      message: apiError.message,
      status: apiError.status,
      originalError: apiError,
    };
  }

  shouldRetry(error: unknown): boolean {
    const apiError = error as ApiError;
    // Don't retry on client errors (4xx) except for rate limiting
    return (
      !apiError.status || apiError.status >= 500 || apiError.status === 429
    );
  }

  shouldLogout(error: unknown): boolean {
    const apiError = error as ApiError;

    // Only logout on specific auth failures, not generic 401s
    if (
      apiError.errorCode === "AUTH_INVALID_REFRESH_TOKEN" ||
      apiError.errorCode === "AUTHENTICATION_FAILED"
    ) {
      return true;
    }

    // Don't logout on REFRESH_TOKEN_USED - this can happen due to concurrency
    // and another request might have successfully refreshed the token
    if (apiError.errorCode === "REFRESH_TOKEN_USED") {
      return false;
    }

    // Also logout if it's a 401 with refresh token related error
    if (apiError.status === 401 && apiError.errorCode) {
      return apiError.errorCode.includes("REFRESH_TOKEN");
    }

    return false;
  }
}

/**
 * Strategy for handling network errors
 */
class NetworkErrorStrategy implements ErrorStrategy {
  canHandle(error: unknown): boolean {
    return (
      error instanceof Error &&
      (error.message.includes("Network") ||
        error.message.includes("fetch") ||
        error.message.includes("CORS"))
    );
  }

  handle(error: unknown): AuthError {
    const networkError = error as Error;
    const code: AuthErrorCode = networkError.message.includes("CORS")
      ? AuthErrorCode.CORS_ERROR
      : AuthErrorCode.NETWORK_ERROR;

    return {
      code,
      message: networkError.message,
      originalError: networkError,
    };
  }

  shouldRetry(): boolean {
    // Always retry network errors
    return true;
  }

  shouldLogout(): boolean {
    // Don't logout on network errors
    return false;
  }
}

/**
 * Strategy for handling auth-specific errors
 */
class AuthErrorStrategy implements ErrorStrategy {
  canHandle(error: unknown): boolean {
    return this.isAuthError(error);
  }

  handle(error: unknown): AuthError {
    return error as AuthError;
  }

  shouldRetry(error: unknown): boolean {
    const authError = error as AuthError;
    // Retry on network/CORS errors
    return (
      authError.code === AuthErrorCode.NETWORK_ERROR ||
      authError.code === AuthErrorCode.CORS_ERROR
    );
  }

  shouldLogout(error: unknown): boolean {
    const authError = error as AuthError;
    return (
      authError.code === AuthErrorCode.AUTHENTICATION_FAILED ||
      authError.code === AuthErrorCode.INVALID_REFRESH_TOKEN
    );
  }

  private isAuthError(error: unknown): error is AuthError {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      "message" in error
    );
  }
}

/**
 * Default strategy for unknown errors
 */
class DefaultErrorStrategy implements ErrorStrategy {
  canHandle(): boolean {
    // Always handles as fallback
    return true;
  }

  handle(error: unknown): AuthError {
    return {
      code: AuthErrorCode.UNKNOWN_ERROR,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
      originalError: error,
    };
  }

  shouldRetry(): boolean {
    // Don't retry unknown errors by default
    return false;
  }

  shouldLogout(): boolean {
    // Don't logout on unknown errors
    return false;
  }
}

/**
 * Main error handler using strategy pattern
 */
export class AuthErrorHandler {
  private strategies: ErrorStrategy[] = [
    new ApiErrorStrategy(),
    new NetworkErrorStrategy(),
    new AuthErrorStrategy(),
    new DefaultErrorStrategy(), // Must be last
  ];

  /**
   * Handle an error and return normalized AuthError
   */
  handle(error: unknown, operationType: "refresh" | "exchange"): AuthError {
    logger.error(`Token ${operationType} failed`, error);

    // Find the first strategy that can handle this error
    const strategy = this.strategies.find((s) => s.canHandle(error));

    // DefaultErrorStrategy always handles, so this should never be null
    if (!strategy) {
      throw new Error("No error strategy found - this should never happen");
    }

    return strategy.handle(error);
  }

  /**
   * Determine if error is retryable
   */
  shouldRetry(error: unknown): boolean {
    const strategy = this.strategies.find((s) => s.canHandle(error));
    return strategy?.shouldRetry(error) ?? false;
  }

  /**
   * Determine if error requires logout
   */
  shouldLogout(error: unknown): boolean {
    const strategy = this.strategies.find((s) => s.canHandle(error));
    return strategy?.shouldLogout(error) ?? false;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(error: AuthError): string {
    switch (error.code) {
      case AuthErrorCode.NO_CLERK_TOKEN:
        return "Authentication failed. Please try signing in again.";
      case AuthErrorCode.INVALID_REFRESH_TOKEN:
      case AuthErrorCode.AUTHENTICATION_FAILED:
        return "Your session has expired. Please sign in again.";
      case AuthErrorCode.SERVER_ERROR:
        return "Server error during authentication. Please try again later.";
      case AuthErrorCode.NETWORK_ERROR:
        return "Network error during authentication. Please check your connection.";
      case AuthErrorCode.CORS_ERROR:
        return "Authentication service configuration error. Please contact support.";
      default:
        return "Authentication failed. Please try signing in again if issues persist.";
    }
  }
}

// Export singleton instance
export const authErrorHandler = new AuthErrorHandler();
