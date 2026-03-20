import { getPublicApiClient } from "@/lib/api";
import { syncRolesToClerkMetadata } from "@/lib/api/clerk-metadata";
import { ROLES } from "@/lib/schemas/auth";
import { verifyClerkToken } from "@/lib/server/clerk";
import { authApiService } from "@/lib/services/auth/auth-api.service";
import { AUTH_CONFIG } from "@/lib/stores/auth/auth-store.config";
import { logger } from "@/lib/utils/logger";
import type {
  AuthError,
  OperationResult,
  TokenExchangeResponse,
} from "@/types/auth-store.types";
import { AuthErrorCode } from "@/types/auth-store.types";

/**
 * Service for handling token exchange operations with retry logic
 */
export class TokenExchangeService {
  /**
   * Exchange Clerk token for backend tokens with retry logic
   */
  async exchange(
    clerkToken: string,
    sessionId?: string,
  ): Promise<OperationResult<TokenExchangeResponse>> {
    if (!clerkToken) {
      logger.error("No Clerk token provided for exchange");
      return {
        success: false,
        error: {
          code: "NO_CLERK_TOKEN" as AuthErrorCode,
          message: "No Clerk token provided for exchange",
        },
        reason: "no_clerk_token",
      };
    }

    // Attempt exchange with retry logic
    const result = await this.exchangeWithRetry(clerkToken, sessionId);

    // Sync roles if exchange was successful
    if (result.success && result.data?.roles && result.data.roles.length > 0) {
      await this.syncRoles(result.data.roles);
    }

    return result;
  }

  /**
   * Exchange tokens with retry logic
   */
  private async exchangeWithRetry(
    clerkToken: string,
    sessionId?: string,
    attempt = 1,
  ): Promise<OperationResult<TokenExchangeResponse>> {
    try {
      const data = await authApiService.exchangeTokens(clerkToken);

      logger.info("Token exchange successful", {
        sessionId,
        userId: data.userId,
        attempt,
      });

      return {
        success: true,
        data,
        reason: "exchange_successful",
      };
    } catch (error) {
      const authError = this.normalizeError(error);

      // Check if we should retry
      if (
        this.shouldRetry(authError) &&
        attempt < AUTH_CONFIG.retry.maxAttempts
      ) {
        const delay = this.calculateRetryDelay(attempt);

        logger.warn(
          `Token exchange failed, retrying in ${delay}ms (attempt ${attempt}/${AUTH_CONFIG.retry.maxAttempts})`,
          {
            error: authError.message,
            sessionId,
          },
        );

        await this.delay(delay);
        return this.exchangeWithRetry(clerkToken, sessionId, attempt + 1);
      }

      // No more retries or non-retryable error
      logger.error("Token exchange failed after all attempts", {
        error: authError,
        attempts: attempt,
      });

      return {
        success: false,
        error: authError,
        reason: "exchange_failed",
      };
    }
  }

  /**
   * Sync roles to Clerk metadata
   */
  private async syncRoles(roles: string[]): Promise<void> {
    try {
      await syncRolesToClerkMetadata(roles);
      logger.info("Roles synced to Clerk metadata as part of token exchange", {
        roles,
      });
    } catch (syncError) {
      logger.warn(
        "Failed to sync roles to Clerk metadata after token exchange",
        { syncError },
      );
      // Don't fail the token exchange if role sync fails
    }
  }

  /**
   * Determine if an error is retryable
   */
  private shouldRetry(error: AuthError): boolean {
    // Retry on network or CORS errors
    return (
      error.code === AuthErrorCode.NETWORK_ERROR ||
      error.code === AuthErrorCode.CORS_ERROR
    );
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number): number {
    return (
      AUTH_CONFIG.retry.initialDelay *
      Math.pow(AUTH_CONFIG.retry.backoffMultiplier, attempt - 1)
    );
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Normalize errors to AuthError type
   */
  private normalizeError(error: unknown): AuthError {
    if (this.isAuthError(error)) {
      return error;
    }

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

  /**
   * Handle USER_NOT_FOUND error with fallback registration
   * @param clerkToken - The Clerk JWT token
   * @param originalError - The original error details from the login attempt
   * @returns Raw API response that will be validated by TokenExchangeResponseSchema
   */
  async handleUserNotFoundWithRegistration(
    clerkToken: string,
    originalError: {
      message?: string;
      code?: string;
      traceId?: string;
    },
  ): Promise<any> {
    logger.info("USER_NOT_FOUND detected, attempting fallback registration", {
      traceId: originalError.traceId,
    });

    try {
      // Verify Clerk token to extract user data
      const clerkUser = await verifyClerkToken(clerkToken);

      logger.error(
          "##CLERK",
          { clerkUser },
      );

      if (!clerkUser?.email) {
        logger.error(
          "Unable to extract user data from Clerk token for fallback registration",
          {
            hasClerkUser: !!clerkUser,
            hasEmail: !!clerkUser?.email,
          },
        );
        throw new Error("Invalid token data for registration");
      }

      logger.info("Attempting fallback user registration", {
        authId: clerkUser.sub,
        email: clerkUser.email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
      });

      // Attempt registration with extracted user data
      const api = getPublicApiClient();
      const registrationResponse = await api.client.POST("/admin/register", {
        body: {
          email: clerkUser.email,
          authId: clerkUser.sub,
          firstName: clerkUser.firstName || "",
          lastName: clerkUser.lastName || "",
          phoneNumber: '0',
          roles: [ROLES.ADMIN], // Default role for new users
        },
      });

      const response = registrationResponse as any;
      if (response.error) {
        const regError = response.error.errors?.[0];
        logger.error("Fallback registration failed", {
          error: response.error,
          errorCode: regError?.code,
          errors: JSON.stringify(regError.errors),
          traceId: response.error.traceId,
        });
        throw new Error(regError?.message || "Registration failed");
      }

      logger.info("Fallback registration successful, retrying login", {
        userId: response.data?.userId,
      });

      // Add a small delay to ensure registration is processed
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Retry login after successful registration
      const retryResponse = await api.client.POST("/users/login", {
        body: { token: clerkToken },
      });

      if (retryResponse.error) {
        logger.error("Login failed even after successful registration", {
          error: retryResponse.error,
          registeredUserId: response.data?.userId,
        });
        throw new Error("Login failed after registration");
      }

      if (!retryResponse.data) {
        throw new Error("No data returned from login after registration");
      }

      logger.info("Fallback registration and login completed successfully");

      // Return the raw API response - it will be validated by TokenExchangeResponseSchema
      return retryResponse.data;
    } catch (fallbackError) {
      logger.error(
        "Fallback registration process failed, returning original error",
        {
          fallbackError:
            fallbackError instanceof Error
              ? fallbackError.message
              : fallbackError,
          originalError,
        },
      );

      // Re-throw to let the caller handle the original error
      throw fallbackError;
    }
  }
}

// Export singleton instance
export const tokenExchangeService = new TokenExchangeService();
