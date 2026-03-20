import type { components } from "@cf/api";
import { z } from "zod";

import { parseApiDateTime } from "@/lib/utils/date-converter";

// Generated API types (these are the source of truth from the backend)
export type APILoginResponse =
  components["schemas"]["UserModuleApiEndpointsLoginLoginUserResponse"];
export type APIRefreshResponse =
  components["schemas"]["UserModuleApiEndpointsRefreshTokenRefreshTokenResponse"];
export type APIErrorResponse =
  components["schemas"]["SharedKernelCFErrorResponse"];
export type APIError = components["schemas"]["SharedKernelError"];

// Core authentication interfaces
// NOTE: These interfaces represent the internal application format after API processing
// The API returns expiresAt as ISO strings, but we convert them to Unix timestamps
// for consistent internal handling. Use the Zod schemas for API validation/conversion.

/**
 * Core metadata for an authenticated user (internal application format)
 * @property userId - Unique user identifier
 * @property email - User's email address
 * @property roles - Array of user roles
 * @property expiresAt - Unix timestamp (ms) when metadata expires
 * @property country - Optional country code
 */
export interface UserMetadata {
  userId: string;
  email: string;
  roles: string[];
  expiresAt: number; // Unix timestamp in milliseconds
  country?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession extends UserMetadata, AuthTokens {}

// Cookie-specific interfaces
export interface CookieData {
  name: string;
  value: string;
  options?: CookieOptions;
}

export interface CookieOptions {
  path?: string;
  domain?: string;
  maxAge?: number; // in seconds
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

// Backend API response types
export interface TokenExchangeResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  roles: string[];
  expiresAt: number;
  country?: string | null;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken?: string; // Optional for refresh token rotation
  expiresAt: number;
}

// Zod schemas for runtime validation
export const UserMetadataSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  roles: z.array(z.string()),
  expiresAt: z.preprocess(parseApiDateTime, z.number().int().positive()),
  country: z.string().nullable().optional(),
});

export const AuthTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

export const AuthSessionSchema = UserMetadataSchema.merge(AuthTokensSchema);

export const TokenExchangeResponseSchema =
  UserMetadataSchema.merge(AuthTokensSchema);

export const TokenRefreshResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1).optional(),
  expiresAt: z.preprocess(parseApiDateTime, z.number().int().positive()),
});

// Request body schemas
export const TokenExchangeRequestSchema = z.object({
  clerkToken: z.string().min(1),
});

export const TokenRefreshRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

// Type guards
export function isUserMetadata(data: unknown): data is UserMetadata {
  return UserMetadataSchema.safeParse(data).success;
}

export function isAuthSession(data: unknown): data is AuthSession {
  return AuthSessionSchema.safeParse(data).success;
}

// Utility types
export type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: z.ZodError };

export function safeParseUserMetadata(
  data: unknown,
): SafeParseResult<UserMetadata> {
  const result = UserMetadataSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

export function safeParseAuthSession(
  data: unknown,
): SafeParseResult<AuthSession> {
  const result = AuthSessionSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
