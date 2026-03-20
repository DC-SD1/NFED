import { logger } from "./logger";

/**
 * Custom error class for invitation token errors
 */
export class InvitationTokenError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = "InvitationTokenError";
  }
}

/**
 * Interface for the invitation token payload
 */
export interface InvitationPayload {
  email: string;
  createdDate: string; // Alternative field name from C# backend
}

// Default expiration time in hours (can be overridden by environment variable)
const DEFAULT_EXPIRATION_HOURS = 24;

/**
 * Get the invitation expiration time in hours from environment or use default
 */
function getExpirationHours(): number {
  const envValue = process.env.INVITATION_EXPIRATION_HOURS;
  if (envValue) {
    const parsed = parseInt(envValue, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
    logger.warn("Invalid INVITATION_EXPIRATION_HOURS value, using default", {
      value: envValue,
      default: DEFAULT_EXPIRATION_HOURS,
    });
  }
  return DEFAULT_EXPIRATION_HOURS;
}

/**
 * Generates a base64-encoded invitation token
 * @param email The email address for the invitation
 * @returns A base64-encoded token string
 */
export function generateInvitationToken(email: string): string {
  if (!email || typeof email !== "string") {
    throw new InvitationTokenError(
      "Email is required for token generation",
      "INVALID_EMAIL_FOR_TOKEN",
    );
  }

  // Trim and validate email
  const trimmedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    throw new InvitationTokenError(
      "Invalid email format for token generation",
      "INVALID_EMAIL_FORMAT",
    );
  }

  const payload: InvitationPayload = {
    email: trimmedEmail,
    createdDate: new Date().toISOString(),
  };

  const jsonPayload = JSON.stringify(payload);
  const token = Buffer.from(jsonPayload).toString("base64");

  logger.info("Generated invitation token", {
    email: payload.email,
    expiresInHours: getExpirationHours(),
  });

  return token;
}

/**
 * Attempts to parse a date string from multiple common formats
 * Supports ISO 8601 and common C# DateTime formats
 * @param dateString The date string to parse
 * @returns A Date object if parsing succeeds, null otherwise
 */
function parseDateFromMultipleFormats(dateString: string): Date | null {
  if (!dateString || typeof dateString !== "string") {
    return null;
  }

  // Try standard ISO parsing first (fastest)
  const isoDate = new Date(dateString);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  // Common C# DateTime formats
  const dateFormats = [
    // C# default format: "2024-01-20 15:30:45"
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/,
    // C# with milliseconds: "2024-01-20 15:30:45.123"
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/,
    // C# alternative: "2024/01/20 15:30:45"
    /^(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/,
    // US format: "01/20/2024 3:30:45 PM"
    /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s+(AM|PM)$/i,
  ] as const;

  // Try C# default format (most likely)
  const defaultFormat = dateFormats[0];
  const defaultMatch = defaultFormat ? dateString.match(defaultFormat) : null;
  if (defaultMatch && defaultMatch.length >= 7) {
    const [, year, month, day, hour, minute, second] = defaultMatch;
    if (year && month && day && hour && minute && second) {
      // Construct as UTC since C# uses DateTime.UtcNow
      const date = new Date(
        Date.UTC(
          parseInt(year, 10),
          parseInt(month, 10) - 1,
          parseInt(day, 10),
          parseInt(hour, 10),
          parseInt(minute, 10),
          parseInt(second, 10),
        ),
      );
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  // Try C# format with milliseconds
  const msFormat = dateFormats[1];
  const msMatch = msFormat ? dateString.match(msFormat) : null;
  if (msMatch && msMatch.length >= 8) {
    const [, year, month, day, hour, minute, second, ms] = msMatch;
    if (year && month && day && hour && minute && second && ms) {
      const date = new Date(
        Date.UTC(
          parseInt(year, 10),
          parseInt(month, 10) - 1,
          parseInt(day, 10),
          parseInt(hour, 10),
          parseInt(minute, 10),
          parseInt(second, 10),
          parseInt(ms, 10),
        ),
      );
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  // Try alternative format
  const altFormat = dateFormats[2];
  const altMatch = altFormat ? dateString.match(altFormat) : null;
  if (altMatch && altMatch.length >= 7) {
    const [, year, month, day, hour, minute, second] = altMatch;
    if (year && month && day && hour && minute && second) {
      const date = new Date(
        Date.UTC(
          parseInt(year, 10),
          parseInt(month, 10) - 1,
          parseInt(day, 10),
          parseInt(hour, 10),
          parseInt(minute, 10),
          parseInt(second, 10),
        ),
      );
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  // Try US format with AM/PM
  const usFormat = dateFormats[3];
  const usMatch = usFormat ? dateString.match(usFormat) : null;
  if (usMatch && usMatch.length >= 8) {
    const [, month, day, year, hour, minute, second, ampm] = usMatch;
    if (month && day && year && hour && minute && second && ampm) {
      let hourNum = parseInt(hour, 10);
      if (ampm.toUpperCase() === "PM" && hourNum !== 12) {
        hourNum += 12;
      } else if (ampm.toUpperCase() === "AM" && hourNum === 12) {
        hourNum = 0;
      }
      const date = new Date(
        Date.UTC(
          parseInt(year, 10),
          parseInt(month, 10) - 1,
          parseInt(day, 10),
          hourNum,
          parseInt(minute, 10),
          parseInt(second, 10),
        ),
      );
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  // Log the unrecognized format for debugging
  logger.warn("Unrecognized date format in invitation token", {
    dateString,
    attemptedFormats: [
      "ISO 8601",
      "YYYY-MM-DD HH:mm:ss",
      "YYYY-MM-DD HH:mm:ss.fff",
      "YYYY/MM/DD HH:mm:ss",
      "MM/DD/YYYY h:mm:ss AM/PM",
    ],
  });

  return null;
}

/**
 * Validates and decodes a base64-encoded invitation token
 * @param token The base64-encoded token string
 * @returns The decoded email if the token is valid and not expired
 * @throws InvitationTokenError if the token is invalid or expired
 */
export function validateInvitationToken(token: string): string {
  if (!token || typeof token !== "string") {
    throw new InvitationTokenError(
      "Token is required for validation",
      "MISSING_TOKEN",
    );
  }

  let payload: InvitationPayload;

  try {
    // Decode base64 to JSON string
    const decoded = Buffer.from(token, "base64").toString("utf8");
    payload = JSON.parse(decoded);
  } catch (error) {
    logger.warn("Failed to decode invitation token", { token, error });
    throw new InvitationTokenError(
      "Invalid token format",
      "INVALID_TOKEN_FORMAT",
    );
  }

  // Validate payload structure
  if (!payload.email || typeof payload.email !== "string") {
    throw new InvitationTokenError(
      "Invalid email in token payload",
      "INVALID_TOKEN_EMAIL",
    );
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(payload.email)) {
    throw new InvitationTokenError(
      "Malformed email in token payload",
      "MALFORMED_TOKEN_EMAIL",
    );
  }

  // Support both field names for backward compatibility
  const dateField = payload.createdDate;

  if (!dateField || typeof dateField !== "string") {
    logger.warn("Missing or invalid date field in token payload", {
      hasCreatedDate: !!payload.createdDate,
      createdDateType: typeof payload.createdDate,
    });
    throw new InvitationTokenError(
      "Invalid creation date in token payload",
      "INVALID_TOKEN_DATE",
    );
  }

  // Parse createdDate with multiple format support
  const createdDate = parseDateFromMultipleFormats(dateField);
  if (!createdDate) {
    throw new InvitationTokenError(
      "Invalid date format in token payload",
      "INVALID_TOKEN_DATE_FORMAT",
    );
  }

  // Check expiration
  const expirationHours = getExpirationHours();
  const expirationTime = new Date(
    createdDate.getTime() + expirationHours * 60 * 60 * 1000,
  );
  const now = new Date();

  if (now > expirationTime) {
    logger.warn("Invitation token has expired", {
      email: payload.email,
      createdDate: dateField,
      expirationTime: expirationTime.toISOString(),
      now: now.toISOString(),
    });
    throw new InvitationTokenError(
      "Invitation token has expired",
      "INVITATION_TOKEN_EXPIRED",
    );
  }

  logger.info("Invitation token validated successfully", {
    email: payload.email,
    createdDate: dateField,
    hoursRemaining: Math.floor(
      (expirationTime.getTime() - now.getTime()) / (1000 * 60 * 60),
    ),
  });

  return payload.email;
}

/**
 * Check if a token is expired without throwing an error
 * @param token The base64-encoded token string
 * @returns true if the token is expired, false if valid, null if invalid format
 */
export function isTokenExpired(token: string): boolean | null {
  try {
    validateInvitationToken(token);
    return false; // Token is valid and not expired
  } catch (error) {
    if (
      error instanceof InvitationTokenError &&
      error.code === "INVITATION_TOKEN_EXPIRED"
    ) {
      return true; // Token is expired
    }
    return null; // Token has invalid format or other error
  }
}
