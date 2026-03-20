import { AUTH_CONFIG } from "@/lib/stores/auth/auth-store.config";
import { fetchWithCsrf } from "@/lib/utils/csrf-client";
import { logger } from "@/lib/utils/logger";
import type {
  AuthError,
  AuthErrorCode,
  TokenExchangeResponse,
  TokenRefreshResponse,
} from "@/types/auth-store.types";

/**
 * Service for handling authentication API calls
 * Centralizes all auth-related HTTP requests
 */
export class AuthApiService {
  /**
   * Exchange Clerk token for backend tokens
   */
  async exchangeTokens(clerkToken: string): Promise<TokenExchangeResponse> {
    try {
      logger.info("Attempting token exchange", {
        apiUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
        hasClerkToken: !!clerkToken,
      });

      const response = await fetchWithCsrf(AUTH_CONFIG.endpoints.exchange, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkToken }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw this.createApiError(
          error.message || "Token exchange failed",
          response.status,
          error.code,
        );
      }

      const data = await response.json();

      logger.info("Token exchange successful", {
        userId: data.userId,
      });

      return data as TokenExchangeResponse;
    } catch (error) {
      logger.error("Token exchange failed", error);
      throw this.normalizeError(error);
    }
  }

  /**
   * Refresh authentication tokens
   */
  async refreshTokens(): Promise<TokenRefreshResponse> {
    try {
      logger.info("Attempting token refresh");

      const response = await fetchWithCsrf(AUTH_CONFIG.endpoints.refresh, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw this.createApiError(
          error.message || "Token refresh failed",
          response.status,
          error.code,
        );
      }

      const data = await response.json();

      logger.info("Token refresh successful");

      return data as TokenRefreshResponse;
    } catch (error) {
      logger.error("Token refresh failed", error);
      throw this.normalizeError(error);
    }
  }

  /**
   * Logout and revoke tokens
   */
  async logout(): Promise<void> {
    try {
      await fetchWithCsrf(AUTH_CONFIG.endpoints.logout, {
        method: "POST",
      });

      logger.info("Logout API call successful - backend tokens revoked");
    } catch (error) {
      // Log but don't throw - logout should continue even if API fails
      if (error instanceof Error && error.message.includes("403")) {
        logger.warn(
          "Logout API returned 403 (likely CSRF issue) - proceeding with client-side logout",
          { error: error.message },
        );
      } else {
        logger.error(
          "Failed to call logout API - proceeding with client-side logout",
          {
            error: error instanceof Error ? error.message : "Unknown error",
          },
        );
      }
    }
  }

  /**
   * Create a standardized API error
   */
  private createApiError(
    message: string,
    status?: number,
    code?: string,
  ): AuthError {
    let errorCode: AuthErrorCode = "UNKNOWN_ERROR" as AuthErrorCode;

    // Map error codes
    if (code === "AUTH_INVALID_REFRESH_TOKEN") {
      errorCode = "INVALID_REFRESH_TOKEN" as AuthErrorCode;
    } else if (code === "AUTHENTICATION_FAILED" || status === 401) {
      errorCode = "AUTHENTICATION_FAILED" as AuthErrorCode;
    } else if (status && status >= 500) {
      errorCode = "SERVER_ERROR" as AuthErrorCode;
    }

    return {
      code: errorCode,
      message,
      status,
    };
  }

  /**
   * Normalize various error types into AuthError
   */
  private normalizeError(error: unknown): AuthError {
    // Already an AuthError
    if (this.isAuthError(error)) {
      return error;
    }

    // Network or CORS error
    if (error instanceof Error) {
      if (error.message.includes("CORS")) {
        return {
          code: "CORS_ERROR" as AuthErrorCode,
          message: error.message,
          originalError: error,
        };
      }
      if (
        error.message.includes("Network") ||
        error.message.includes("fetch")
      ) {
        return {
          code: "NETWORK_ERROR" as AuthErrorCode,
          message: error.message,
          originalError: error,
        };
      }
    }

    // Unknown error
    return {
      code: "UNKNOWN_ERROR" as AuthErrorCode,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
      originalError: error,
    };
  }

  /**
   * Type guard for AuthError
   */
  private isAuthError(error: unknown): error is AuthError {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      "message" in error
    );
  }
}

// Export singleton instance
export const authApiService = new AuthApiService();
