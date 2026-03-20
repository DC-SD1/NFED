import type { SetActiveParams } from "@clerk/types";

// Token exchange retry configuration
export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  backoffMultiplier: number;
}

// Main auth state interface
export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  userId: string | null;
  email: string | null;
  roles: string[] | null;
  isOperationInProgress: boolean;
  isTokenExchangeHandled: boolean;
}

// Token data subset (for storage operations)
export type TokenData = Pick<AuthState, 'accessToken' | 'refreshToken' | 'expiresAt' | 'userId' | 'email' | 'roles'>;

// Auth action interfaces
export interface AuthActions {
  exchangeTokens: (
    clerkToken: string,
    sessionId?: string,
  ) => Promise<{ success: boolean; reason?: string }>;
  refreshTokens: () => Promise<{ success: boolean; reason?: string }>;
  logout: (
    signOutFn: () => Promise<void>,
    router: { replace: (url: string) => void },
    locale?: string
  ) => Promise<void>;
  clearStore: () => void;
  setTokens: (tokens: Partial<AuthState>) => void;
  setUserData: (data: {
    userId: string;
    email: string;
    roles: string[];
    expiresAt: number;
  }) => void;
  setTokenExchangeHandled: (handled: boolean) => void;
  handleTokenOperationError: (
    error: unknown,
    operationType: "refresh" | "exchange",
  ) => Promise<void>;
}

// Combined store state
export type AuthStoreState = AuthState & { actions: AuthActions };

// Token exchange response
export interface TokenExchangeResponse {
  expiresAt: number;
  userId: string;
  email: string;
  roles: string[];
}

// Token refresh response
export interface TokenRefreshResponse {
  expiresAt: number;
}

// Operation result types
export interface OperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: AuthError;
  reason?: string;
}

// Auth error types
export interface AuthError {
  code: AuthErrorCode;
  message: string;
  status?: number;
  originalError?: unknown;
}

export enum AuthErrorCode {
  // Token errors
  NO_CLERK_TOKEN = "NO_CLERK_TOKEN",
  INVALID_REFRESH_TOKEN = "AUTH_INVALID_REFRESH_TOKEN",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  
  // Authentication errors
  AUTHENTICATION_FAILED = "AUTHENTICATION_FAILED",
  SESSION_CREATION_FAILED = "SESSION_CREATION_FAILED",
  
  // Operation errors
  OPERATION_IN_PROGRESS = "OPERATION_IN_PROGRESS",
  TOKENS_ALREADY_VALID = "TOKENS_ALREADY_VALID",
  
  // Network errors
  NETWORK_ERROR = "NETWORK_ERROR",
  CORS_ERROR = "CORS_ERROR",
  
  // Server errors
  SERVER_ERROR = "SERVER_ERROR",
  
  // Unknown errors
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

// Error strategy interface for error handler
export interface ErrorStrategy {
  canHandle(error: unknown): boolean;
  handle(error: unknown): AuthError;
  shouldRetry(error: unknown): boolean;
  shouldLogout(error: unknown): boolean;
}

// Clerk integration types
export interface ClerkIntegration {
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
  setActive: (params: SetActiveParams) => Promise<void>;
}