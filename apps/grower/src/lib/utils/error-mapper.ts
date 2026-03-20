import type { components } from "@cf/api";

import { InvitationTokenError } from "./invitation-token";
import { logger } from "./logger";

// Type definitions for different error structures
export interface ClerkAPIError {
  code: string;
  message: string;
  longMessage?: string;
  meta?: {
    paramName?: string;
  };
}

export interface OpenApiFetchError {
  errors?: components["schemas"]["SharedKernelError"][];
  traceId?: string;
  timestamp?: string;
}

export interface GenericError {
  message: string;
  name?: string;
  status?: number;
  code?: string;
}

// Error structures that can have attached properties from our API client
export interface ExtendedError extends Error {
  status?: number;
  errorCode?: string;
  errorType?: string;
  traceId?: string;
  timestamp?: string;
  originalError?: any;
  errors?: any[];
  code?: string; // For flat Clerk errors
}

// Network/HTTP status code to localization key mapping
const HTTP_STATUS_ERROR_MAP: Record<number, string> = {
  400: "api.errors.bad_request",
  401: "api.errors.unauthorized",
  403: "api.errors.forbidden",
  404: "api.errors.not_found",
  408: "api.errors.timeout",
  409: "api.errors.conflict",
  422: "api.errors.validation_error",
  429: "api.errors.rate_limit",
  500: "api.errors.internal_server_error",
  502: "api.errors.bad_gateway",
  503: "api.errors.service_unavailable",
  504: "api.errors.gateway_timeout",
};

// SharedKernelError code mapping (based on common API error patterns)
const SHARED_KERNEL_ERROR_MAP: Record<string, string> = {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: "auth.errors.invalid_credentials",
  AUTH_TOKEN_EXPIRED: "auth.errors.token_expired",
  AUTH_TOKEN_INVALID: "auth.errors.token_invalid",
  AUTH_UNAUTHORIZED: "auth.errors.unauthorized",
  AUTH_SESSION_EXPIRED: "auth.errors.session_expired",

  // Validation errors
  VALIDATION_FAILED: "api.errors.validation_failed",
  INVALID_EMAIL: "auth.errors.invalid_email",
  INVALID_PASSWORD: "auth.errors.invalid_password",
  PASSWORD_TOO_WEAK: "auth.errors.password_too_weak",
  EMAIL_ALREADY_EXISTS: "auth.errors.email_already_exists",

  // Network/General errors
  NETWORK_ERROR: "common.errors.network_error",
  TIMEOUT: "common.errors.timeout",
  SERVER_ERROR: "common.errors.server_error",
  RATE_LIMIT_EXCEEDED: "api.errors.rate_limit_exceeded",

  // User/Registration errors
  USER_NOT_FOUND: "auth.errors.user_not_found",
  USER_ALREADY_EXISTS: "auth.errors.user_already_exists",
  ACCOUNT_LOCKED: "auth.errors.account_locked",
  ACCOUNT_SUSPENDED: "auth.errors.account_suspended",
  REGISTRATION_INCOMPLETE: "auth.errors.registration_incomplete",

  // File upload errors (CSV/KML)
  INVALID_CSV: "upload.errors.invalid_csv",
  INVALID_KML: "upload.errors.invalid_kml",
  INVALID_CSV_FORMAT: "upload.errors.invalid_csv_format",
  INVALID_KML_FORMAT: "upload.errors.invalid_kml_format",
  CSV_MISSING_COLUMNS: "upload.errors.csv_missing_columns",
  CSV_INVALID_DATA: "upload.errors.csv_invalid_data",
  KML_INVALID_STRUCTURE: "upload.errors.kml_invalid_structure",
  FILE_TOO_LARGE: "upload.errors.file_too_large",
  FILE_EMPTY: "upload.errors.file_empty",
  INVALID_COORDINATES: "upload.errors.invalid_coordinates",
  COORDINATES_OUT_OF_BOUNDS: "upload.errors.coordinates_out_of_bounds",
  POLYGON_NOT_CLOSED: "upload.errors.polygon_not_closed",
  INSUFFICIENT_POINTS: "upload.errors.insufficient_points",
};

// Clerk error code mapping
const CLERK_ERROR_MAP: Record<string, string> = {
  // Authentication
  session_token_invalid: "auth.errors.session_invalid",
  session_token_expired: "auth.errors.session_expired",
  incorrect_password: "auth.errors.invalid_credentials",
  form_password_incorrect: "auth.errors.incorrect_password",
  form_password_validation_failed: "auth.errors.invalid_credentials",
  identifier_not_found: "auth.errors.user_not_found",
  form_identifier_not_found: "auth.errors.user_not_found",
  no_password_set: "auth.errors.no_password_set",
  too_many_requests: "auth.errors.too_many_attempts",
  signed_out: "auth.errors.signed_out",

  // Session errors
  session_refresh_token_not_found: "auth.errors.session_expired",
  session_refresh_user_not_found: "auth.errors.user_not_found",
  session_refresh_session_not_found: "auth.errors.session_not_found",
  expired_session_token_invalid: "auth.errors.session_invalid",
  session_refresh_expired_session_token_consumed:
    "auth.errors.session_consumed",
  session_refresh_expired_session_token_too_old: "auth.errors.session_too_old",
  session_refresh_inactive_session: "auth.errors.session_inactive",
  session_refresh_session_token_ineligible: "auth.errors.session_ineligible",
  refresh_request_origin_invalid: "auth.errors.request_origin_invalid",
  feature_not_enabled: "auth.errors.feature_not_enabled",
  invalid_session_token: "auth.errors.session_invalid",

  // Sign up errors
  identifier_already_exists: "auth.errors.email_already_exists",
  form_identifier_exists: "auth.errors.email_already_exists",
  password_not_strong_enough: "auth.errors.password_too_weak",
  form_password_not_strong_enough: "auth.errors.password_too_weak",
  form_password_pwned: "auth.errors.password_compromised",
  form_password_length_too_short: "auth.errors.password_too_short",
  invalid_email_address: "auth.errors.invalid_email",
  invalid_phone_number: "auth.errors.invalid_phone",
  form_param_format_invalid: "common.errors.invalid_format",

  // User status
  user_banned: "auth.errors.user_banned",
  user_locked: "auth.errors.account_locked",
  deprovisioned: "auth.errors.account_deprovisioned",

  // Organization errors
  organization_not_found_or_unauthorized: "auth.errors.organization_not_found",
  organization_invitation_already_accepted:
    "auth.errors.invitation_already_accepted",
  organization_invitation_identification_not_exist:
    "auth.errors.invitation_user_not_found",
  organization_invitation_not_found: "auth.errors.invitation_not_found",
  organization_invitation_not_pending: "auth.errors.invitation_not_pending",
  organization_invitation_not_unique: "auth.errors.invitation_duplicate",
  organization_invitation_revoked_code: "auth.errors.invitation_revoked",
  organization_invitation_to_deleted_organization:
    "auth.errors.organization_deleted",
  organization_invitation_identification_already_exists:
    "auth.errors.invitation_email_exists",
  organization_domain_blocked: "auth.errors.domain_blocked",
  organization_domain_common: "auth.errors.domain_common",
  organization_domain_mismatch: "auth.errors.domain_mismatch",
  organization_domain_enrollment_mode_not_enabled:
    "auth.errors.enrollment_mode_disabled",
  organization_domain_quota_exceeded: "auth.errors.domain_quota_exceeded",
  organization_membership_enterprise_connection_cannot_remove:
    "auth.errors.enterprise_connection_required",

  // OTP/Verification
  verification_code_expired: "auth.errors.otp_expired",
  verification_expired: "auth.errors.otp_expired",
  verification_code_incorrect: "auth.errors.otp_invalid",
  form_code_incorrect: "auth.errors.otp_invalid",
  verification_max_attempts_reached: "auth.errors.otp_max_attempts",
  verification_not_sent: "auth.errors.verification_not_sent",
  verification_failed: "auth.errors.verification_failed",
  verification_code_too_many_requests: "auth.errors.verification_rate_limit",

  // TOTP/MFA
  totp_incorrect_code: "auth.errors.totp_incorrect",
  totp_already_enabled: "auth.errors.totp_already_enabled",
  backup_codes_not_available: "auth.errors.backup_codes_unavailable",

  // Passkey errors
  passkey_authentication_failure: "auth.errors.passkey_failed",
  passkey_invalid_public_key_credential: "auth.errors.passkey_invalid",

  // OAuth errors
  oauth_token_exchange_error: "auth.errors.oauth_exchange_failed",
  misconfigured_oauth_provider: "auth.errors.oauth_misconfigured",

  // Strategy errors
  strategy_for_user_invalid: "auth.errors.strategy_mismatch",

  // Captcha/Security
  requires_captcha: "auth.errors.captcha_required",
  captcha_invalid: "auth.errors.captcha_invalid",
  device_blocked: "auth.errors.device_blocked",
  requires_device_attestation: "auth.errors.device_attestation_required",
  device_attestation_verification_failed:
    "auth.errors.device_attestation_failed",
  device_attestation_not_configured:
    "auth.errors.device_attestation_not_configured",
  device_attestation_misconfigured:
    "auth.errors.device_attestation_misconfigured",
  device_attestation_unsupported_platform:
    "auth.errors.device_attestation_unsupported",
  device_attestation_challenge_client_mismatch:
    "auth.errors.device_attestation_mismatch",
  invalid_device_attestation_challenge:
    "auth.errors.device_attestation_challenge_invalid",
  invalid_device_attestation_assertion:
    "auth.errors.device_attestation_assertion_invalid",
  requires_assertion: "auth.errors.assertion_required",

  // Ticket errors
  ticket_expired_code: "auth.errors.ticket_expired",
  ticket_invalid_code: "auth.errors.ticket_invalid",

  // Payment errors
  payment_attempt_failed: "auth.errors.payment_failed",
  payment_attempt_failed_card_declined: "auth.errors.card_declined",
  payment_attempt_failed_processing_error:
    "auth.errors.payment_processing_error",
  payer_not_found: "auth.errors.payer_not_found",
  payee_not_found: "auth.errors.payee_not_found",
  plan_not_found: "auth.errors.plan_not_found",
  subscription_not_found: "auth.errors.subscription_not_found",

  // General errors
  form_param_missing: "common.errors.required_field",
  form_param_invalid: "common.errors.invalid_field",
  form_param_nil: "common.errors.field_null",
  form_param_exceeds_allowed_size: "common.errors.field_too_large",
  form_param_value_invalid: "common.errors.invalid_value",
  rate_limit_exceeded: "auth.errors.rate_limit_exceeded",
  too_many_unverified_identifications: "auth.errors.too_many_unverified",
  unsupported_country_code: "auth.errors.country_not_supported",
  invalid_url_scheme: "common.errors.invalid_url_scheme",
  invalid_redirect_url: "common.errors.invalid_redirect_url",
  identification_claimed: "auth.errors.identification_claimed",

  // Request errors
  bad_request: "common.errors.bad_request",
  request_invalid_for_environment: "common.errors.invalid_environment",
  user_settings_invalid: "common.errors.invalid_settings",
  malformed_request_parameters: "common.errors.malformed_request",
  request_body_invalid: "common.errors.invalid_request_body",
  malformed_publishable_key: "common.errors.invalid_api_key",
  missing_query_parameter: "common.errors.missing_parameter",
  unsupported_content_type: "common.errors.unsupported_content_type",
  proxy_request_invalid_secret_key: "common.errors.invalid_proxy_key",

  // System errors
  maintenance_mode: "common.errors.maintenance_mode",
  internal_clerk_error: "common.errors.server_error",
  resource_not_found: "common.errors.not_found",
  resource_forbidden: "common.errors.forbidden",
  user_quota_exceeded: "common.errors.user_quota_exceeded",

  // Enhanced email deliverability
  enhanced_email_deliverability_prohibited:
    "auth.errors.enhanced_email_disabled",

  // Waitlist
  waitlist_not_accepting_entries: "auth.errors.waitlist_closed",

  // SAML errors
  saml_connection_cant_be_activated: "auth.errors.saml_incomplete",
  saml_failed_to_fetch_idp_metadata: "auth.errors.saml_metadata_fetch_failed",
  saml_failed_to_parse_idp_metadata: "auth.errors.saml_metadata_parse_failed",
};

// Invitation-specific error code mapping
const INVITATION_ERROR_MAP: Record<string, string> = {
  // Token validation errors
  INVITATION_TOKEN_EXPIRED: "auth.errors.invitation_expired",
  INVALID_TOKEN_FORMAT: "auth.errors.invitation_invalid_token_format",
  INVALID_TOKEN_EMAIL: "auth.errors.invitation_invalid_email_token",
  MALFORMED_TOKEN_EMAIL: "auth.errors.invitation_malformed_email_token",
  INVALID_TOKEN_DATE: "auth.errors.invitation_invalid_date_token",
  INVALID_TOKEN_DATE_FORMAT: "auth.errors.invitation_invalid_date_format",
  MISSING_TOKEN: "auth.errors.invitation_missing_token",
  INVALID_EMAIL_FOR_TOKEN: "auth.errors.invitation_invalid_email_for_token",
  INVALID_EMAIL_FORMAT: "auth.errors.invitation_invalid_email_format",

  // Invitation flow errors
  INVITATION_MISSING_PARAMS: "auth.errors.invitation_missing_params",
  INVITATION_USER_NOT_FOUND: "auth.errors.invitation_user_not_found",
  CLERK_USER_NOT_FOUND: "auth.errors.clerk_user_not_found",
  CLERK_API_ERROR: "auth.errors.clerk_api_error",
  INVITATION_PROCESSING_FAILED: "auth.errors.invitation_processing_failed",
  UNKNOWN_TOKEN_ERROR: "auth.errors.unknown_token_error",
  INVITATION_GENERIC_ERROR: "auth.errors.invitation_generic_error",
  invalid_token_data: "auth.errors.invitation_invalid_token_data",
};

/**
 * Maps various error objects to specific localization keys
 * @param error - Error object from various sources (Clerk, openapi-fetch, generic)
 * @returns Localization key string for translation
 */
export function mapErrorToLocaleKey(error: unknown): string {
  // Handle null/undefined
  if (!error) {
    return "common.errors.unknown_error";
  }

  // Handle InvitationTokenError instances
  if (error instanceof InvitationTokenError) {
    return INVITATION_ERROR_MAP[error.code] ?? "common.errors.unknown_error";
  }

  // Handle structured errors from objects or Error instances
  if (typeof error === "object" && error !== null) {
    const errorObj = error as ExtendedError; // Use the most encompassing type

    // Priority 1: Check for invitation error codes
    if (errorObj.code && typeof errorObj.code === "string") {
      const invitationKey = INVITATION_ERROR_MAP[errorObj.code];
      if (invitationKey) {
        return invitationKey;
      }
    }

    // Priority 2: Check for nested error structures (Clerk or openapi-fetch)
    if (
      errorObj.errors &&
      Array.isArray(errorObj.errors) &&
      errorObj.errors.length > 0
    ) {
      const firstError = errorObj.errors[0];

      if (firstError?.code && typeof firstError.code === "string") {
        // Check invitation codes first
        const invitationKey = INVITATION_ERROR_MAP[firstError.code];
        if (invitationKey) {
          return invitationKey;
        }
        // Then check Clerk-specific codes
        if (CLERK_ERROR_MAP[firstError.code]) {
          return (
            CLERK_ERROR_MAP[firstError.code] ?? "common.errors.unknown_error"
          );
        }
        // Then check for our custom API error codes
        if (SHARED_KERNEL_ERROR_MAP[firstError.code]) {
          return (
            SHARED_KERNEL_ERROR_MAP[firstError.code] ??
            "common.errors.unknown_error"
          );
        }
      }
    }

    // Priority 2: Check for our custom API error code on the top-level object
    if (errorObj.errorCode && SHARED_KERNEL_ERROR_MAP[errorObj.errorCode]) {
      return (
        SHARED_KERNEL_ERROR_MAP[errorObj.errorCode] ??
        "common.errors.unknown_error"
      );
    }

    // Priority 3: Check for flat Clerk error structure
    if (errorObj.code && typeof errorObj.code === "string") {
      if (CLERK_ERROR_MAP[errorObj.code]) {
        return CLERK_ERROR_MAP[errorObj.code] ?? "common.errors.unknown_error";
      }
    }

    // Priority 4: Check HTTP status codes
    if (errorObj.status && HTTP_STATUS_ERROR_MAP[errorObj.status]) {
      return (
        HTTP_STATUS_ERROR_MAP[errorObj.status] ?? "common.errors.unknown_error"
      );
    }

    // Priority 5: Check for network errors by message content
    if (errorObj.message && typeof errorObj.message === "string") {
      const message = errorObj.message.toLowerCase();
      if (message.includes("network") || message.includes("fetch")) {
        return "common.errors.network_error";
      }
      if (message.includes("timeout")) {
        return "common.errors.timeout";
      }
    }
  }

  // Handle string errors
  if (typeof error === "string") {
    // First check if it's an invitation error code
    const invitationError = INVITATION_ERROR_MAP[error];
    if (invitationError) {
      return invitationError;
    }

    const lowerError = error.toLowerCase();
    if (lowerError.includes("network")) {
      return "common.errors.network_error";
    }
    if (lowerError.includes("timeout")) {
      return "common.errors.timeout";
    }
    if (lowerError.includes("unauthorized") || lowerError.includes("401")) {
      return "auth.errors.unauthorized";
    }
    if (lowerError.includes("not found") || lowerError.includes("404")) {
      return "api.errors.not_found";
    }
    if (lowerError.includes("email address already exists")) {
      return "auth.errors.invitation_email_exists";
    }
    if (lowerError.includes("phone number already exists")) {
      return "auth.errors.invitation_number_exists";
    }
    if (lowerError.includes("something wrong")) {
      return "auth.errors.unknown_error";
    }
    if (lowerError.includes("invite fail")) {
      return "auth.errors.inviteFail";
    }
    if (lowerError.includes("complete invite")) {
      return "auth.error.completeInvite";
    }
    if (lowerError.includes("draft fail")) {
      return "auth.errors.draftFail";
    }
    if (lowerError.includes("contract fail")) {
      return "auth.errors.createContractFail";
    }
    if (lowerError.includes("complete contract")) {
      return "auth.errors.completeContract";
    }
    if (lowerError.includes("farm managers fail")) {
      return "auth.errors.farmManagersFail";
    }
    if (lowerError.includes("update contract fail")) {
      return "auth.errors.failedToUpdateContract";
    }
    if (lowerError.includes("fail to update manager")) {
      return "auth.errors.failToUpdateManagerDetails";
    }
    if (lowerError.includes("fail to activate manager")) {
      return "auth.errors.failToActivateManager";
    }
    if (lowerError.includes("maximum number of active/renewed contracts")) {
      return "auth.errors.max_farm_lands";
    }
  }

  // Log the unmapped error for future debugging
  logger.warn(
    "Unmapped error in mapErrorToLocaleKey, falling back to default.",
    { originalError: error },
  );

  // Default fallback
  return "common.errors.unknown_error";
}

/**
 * Extract a user-friendly error message from various error types
 * This is used as a fallback when localization keys are not available
 * SECURITY: This function extracts messages only from known safe error structures
 * @param error - Error object
 * @returns Safe, user-friendly error message
 */
export function extractErrorMessage(error: unknown): string {
  // Handle null/undefined
  if (!error) {
    return "An unknown error occurred";
  }

  // Handle string errors (these are usually safe to display)
  if (typeof error === "string") {
    return error;
  }

  // Handle InvitationTokenError instances
  if (error instanceof InvitationTokenError) {
    return error.message;
  }

  // Handle structured errors from objects or Error instances
  if (typeof error === "object" && error !== null) {
    const errorObj = error as ExtendedError;

    // Priority 1: Check for openapi-fetch error structure (our API errors)
    if (
      errorObj.errors &&
      Array.isArray(errorObj.errors) &&
      errorObj.errors.length > 0
    ) {
      const firstError = errorObj.errors[0];
      if (firstError?.message && typeof firstError.message === "string") {
        return firstError.message;
      }
    }

    // Priority 2: Check for Clerk error structure (known safe structure)
    if (
      errorObj.code &&
      errorObj.message &&
      typeof errorObj.message === "string"
    ) {
      return errorObj.message;
    }

    // Priority 3: Check for standard Error instances
    if (errorObj instanceof Error && errorObj.message) {
      return errorObj.message;
    }

    // Priority 4: Check for generic error objects with message property
    if (errorObj.message && typeof errorObj.message === "string") {
      return errorObj.message;
    }
  }

  // Log the unmapped error for debugging purposes
  logger.warn("Fallback error message triggered - no extractable message", {
    originalError: error,
  });

  // Default fallback for unknown error structures
  return "An unknown error occurred";
}
