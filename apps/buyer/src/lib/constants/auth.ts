export const AUTH_ROUTES = {
  ONBOARDING: "/onboarding/marketing",
  PASSWORD_RESET: "/password?mode=reset",
  DASHBOARD: "/dashboard",
} as const;

export const ERROR_CODES = {
  SYSTEM_NOT_READY: "SYSTEM_NOT_READY",
  SIGNUP_NOT_READY: "SIGNUP_NOT_READY",
  SIGNIN_NOT_READY: "SIGNIN_NOT_READY",
  SESSION_NOT_READY: "SESSION_NOT_READY",
  SESSION_CREATION_FAILED: "SESSION_CREATION_FAILED",
  LOGIN_SESSION_CREATION_FAILED: "LOGIN_SESSION_CREATION_FAILED",
  VERIFICATION_INCOMPLETE: "VERIFICATION_INCOMPLETE",
  RESET_VERIFICATION_INCOMPLETE: "RESET_VERIFICATION_INCOMPLETE",
  LOGIN_VERIFICATION_INCOMPLETE: "LOGIN_VERIFICATION_INCOMPLETE",
  MISSING_REQUIRED_DATA: "MISSING_REQUIRED_DATA",
} as const;

export const SUCCESS_MESSAGES = {
  SIGNUP_RESEND: "Verification code sent successfully! Check your email.",
  RESET_RESEND: "Password reset code sent successfully! Check your email.",
  VERIFY_RESEND: "Login verification code sent successfully! Check your email.",
} as const;

export const ERROR_MESSAGES = {
  VERIFICATION_FAILED: "Verification failed. Please try again.",
  RESEND_FAILED: "Failed to resend verification code.",
  REGISTRATION_FAILED: "Failed to complete registration. Please try again.",
  AUTH_ERROR: "Authentication error occurred. Please try again.",
  API_ERROR: "API request failed. Please try again.",
} as const;

export const RESEND_COOLDOWN_SECONDS = 60;
export const MAX_OTP_ATTEMPTS = 3;
export const OTP_EXPIRY_MINUTES = 10;
export const LOCKOUT_DURATION_MINUTES = 15;

export type AuthMode = "signup" | "reset" | "verify";