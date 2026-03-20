import { authApiService } from "@/lib/services/auth/auth-api.service";
import { logger } from "@/lib/utils/logger";
import type {
  AuthError,
  OperationResult,
  TokenRefreshResponse,
} from "@/types/auth-store.types";
import { AuthErrorCode } from "@/types/auth-store.types";

/**
 * Service for handling token refresh operations
 */
export class TokenRefreshService {
  /**
   * Refresh authentication tokens
   */
  async refresh(
    currentExpiresAt?: number | null,
  ): Promise<OperationResult<TokenRefreshResponse>> {
    try {
      // Log if token has expired
      if (currentExpiresAt && currentExpiresAt <= Date.now() / 1000) {
        logger.info("Token has expired, attempting refresh");
      }

      const data = await authApiService.refreshTokens();

      logger.info("Token refresh successful");

      return {
        success: true,
        data,
        reason: "refresh_successful",
      };
    } catch (error) {
      logger.error("Token refresh failed", error);

      return {
        success: false,
        error: this.normalizeError(error),
        reason: "refresh_failed",
      };
    }
  }

  /**
   * Check if tokens need refreshing
   */
  needsRefresh(expiresAt?: number | null): boolean {
    if (!expiresAt) return true;

    // Refresh if token expires in less than 5 minutes
    const fiveMinutesFromNow = Date.now() / 1000 + 5 * 60;
    return expiresAt <= fiveMinutesFromNow;
  }

  /**
   * Normalize errors
   */
  private normalizeError(error: unknown): AuthError {
    if (this.isAuthError(error)) {
      return error;
    }

    return {
      code: AuthErrorCode.UNKNOWN_ERROR,
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
export const tokenRefreshService = new TokenRefreshService();
