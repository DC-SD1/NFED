import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  generateInvitationToken,
  type InvitationPayload,
  InvitationTokenError,
  isTokenExpired,
  validateInvitationToken,
} from "../invitation-token";

// Mock the logger
vi.mock("../logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Helper function to create C# formatted date strings
function createCSharpDateString(date: Date, format: "default" | "ms" | "alt") {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const minute = String(date.getUTCMinutes()).padStart(2, "0");
  const second = String(date.getUTCSeconds()).padStart(2, "0");

  switch (format) {
    case "default":
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    case "ms": {
      const ms = String(date.getUTCMilliseconds()).padStart(3, "0");
      return `${year}-${month}-${day} ${hour}:${minute}:${second}.${ms}`;
    }
    case "alt":
      return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
  }
}

describe("invitation-token", () => {
  beforeEach(() => {
    // Reset environment variables
    delete process.env.INVITATION_EXPIRATION_HOURS;
    // Reset all mocks
    vi.clearAllMocks();
    // Reset system time
    vi.useRealTimers();
  });

  describe("generateInvitationToken", () => {
    it("should generate a valid base64 token for a valid email", () => {
      const email = "test@example.com";
      const token = generateInvitationToken(email);

      // Verify token is base64
      expect(() => Buffer.from(token, "base64")).not.toThrow();

      // Decode and verify payload
      const decoded = Buffer.from(token, "base64").toString("utf8");
      const payload: InvitationPayload = JSON.parse(decoded);

      expect(payload.email).toBe(email.toLowerCase());
      expect(payload.createdDate).toBeDefined();
      expect(new Date(payload.createdDate).getTime()).toBeLessThanOrEqual(
        new Date().getTime(),
      );
    });

    it("should normalize email to lowercase", () => {
      const email = "Test@EXAMPLE.com";
      const token = generateInvitationToken(email);

      const decoded = Buffer.from(token, "base64").toString("utf8");
      const payload: InvitationPayload = JSON.parse(decoded);

      expect(payload.email).toBe("test@example.com");
    });

    it("should trim whitespace from email", () => {
      const email = "  test@example.com  ";
      const token = generateInvitationToken(email);

      const decoded = Buffer.from(token, "base64").toString("utf8");
      const payload: InvitationPayload = JSON.parse(decoded);

      expect(payload.email).toBe("test@example.com");
    });

    it("should throw error for invalid email format", () => {
      expect(() => generateInvitationToken("invalid-email")).toThrow(
        InvitationTokenError,
      );
      expect(() => generateInvitationToken("invalid-email")).toThrow(
        "Invalid email format for token generation",
      );
    });

    it("should throw error for empty email", () => {
      expect(() => generateInvitationToken("")).toThrow(InvitationTokenError);
      expect(() => generateInvitationToken("")).toThrow(
        "Email is required for token generation",
      );
    });

    it("should throw error for non-string email", () => {
      expect(() => generateInvitationToken(null as any)).toThrow(
        InvitationTokenError,
      );
      expect(() => generateInvitationToken(undefined as any)).toThrow(
        InvitationTokenError,
      );
      expect(() => generateInvitationToken(123 as any)).toThrow(
        InvitationTokenError,
      );
    });
  });

  describe("validateInvitationToken", () => {
    it("should validate a valid token successfully", () => {
      const email = "test@example.com";
      const token = generateInvitationToken(email);

      const result = validateInvitationToken(token);
      expect(result).toBe(email);
    });

    it("should throw error for expired token", () => {
      const email = "test@example.com";
      // Set time to past
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 25); // 25 hours ago
      vi.setSystemTime(pastDate);

      const token = generateInvitationToken(email);

      // Reset to current time
      vi.useRealTimers();

      expect(() => validateInvitationToken(token)).toThrow(
        InvitationTokenError,
      );
      expect(() => validateInvitationToken(token)).toThrow(
        "Invitation token has expired",
      );
    });

    it("should respect custom expiration time from environment", () => {
      process.env.INVITATION_EXPIRATION_HOURS = "48"; // 48 hours
      const email = "test@example.com";

      // Set time to past (more than 24 hours but less than 48)
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 36); // 36 hours ago
      vi.setSystemTime(pastDate);

      const token = generateInvitationToken(email);

      // Reset to current time
      vi.useRealTimers();

      // Should not throw because it's within 48 hours
      expect(() => validateInvitationToken(token)).not.toThrow();
    });

    it("should handle invalid environment variable gracefully", () => {
      process.env.INVITATION_EXPIRATION_HOURS = "invalid";
      const email = "test@example.com";
      const token = generateInvitationToken(email);

      // Should use default 24 hours
      expect(() => validateInvitationToken(token)).not.toThrow();
    });

    it("should throw error for invalid base64 token", () => {
      const invalidToken = "not-valid-base64!!!";
      expect(() => validateInvitationToken(invalidToken)).toThrow(
        InvitationTokenError,
      );
      expect(() => validateInvitationToken(invalidToken)).toThrow(
        "Invalid token format",
      );
    });

    it("should throw error for malformed JSON in token", () => {
      const invalidJson = Buffer.from("{ invalid json", "utf8").toString(
        "base64",
      );
      expect(() => validateInvitationToken(invalidJson)).toThrow(
        InvitationTokenError,
      );
      expect(() => validateInvitationToken(invalidJson)).toThrow(
        "Invalid token format",
      );
    });

    it("should throw error for token without email", () => {
      const payload = { createdDate: new Date().toISOString() };
      const token = Buffer.from(JSON.stringify(payload)).toString("base64");

      expect(() => validateInvitationToken(token)).toThrow(
        InvitationTokenError,
      );
      expect(() => validateInvitationToken(token)).toThrow(
        "Invalid email in token payload",
      );
    });

    it("should throw error for token with invalid email format", () => {
      const payload = {
        email: "invalid-email",
        createdDate: new Date().toISOString(),
      };
      const token = Buffer.from(JSON.stringify(payload)).toString("base64");

      expect(() => validateInvitationToken(token)).toThrow(
        InvitationTokenError,
      );
      expect(() => validateInvitationToken(token)).toThrow(
        "Malformed email in token payload",
      );
    });

    it("should throw error for token without createdDate", () => {
      const payload = { email: "test@example.com" };
      const token = Buffer.from(JSON.stringify(payload)).toString("base64");

      expect(() => validateInvitationToken(token)).toThrow(
        InvitationTokenError,
      );
      expect(() => validateInvitationToken(token)).toThrow(
        "Invalid creation date in token payload",
      );
    });

    it("should throw error for token with invalid date format", () => {
      const payload = {
        email: "test@example.com",
        createdDate: "invalid-date",
      };
      const token = Buffer.from(JSON.stringify(payload)).toString("base64");

      expect(() => validateInvitationToken(token)).toThrow(
        InvitationTokenError,
      );
      expect(() => validateInvitationToken(token)).toThrow(
        "Invalid date format in token payload",
      );
    });

    it("should throw error for empty token", () => {
      expect(() => validateInvitationToken("")).toThrow(InvitationTokenError);
      expect(() => validateInvitationToken("")).toThrow(
        "Token is required for validation",
      );
    });

    it("should throw error for non-string token", () => {
      expect(() => validateInvitationToken(null as any)).toThrow(
        InvitationTokenError,
      );
      expect(() => validateInvitationToken(undefined as any)).toThrow(
        InvitationTokenError,
      );
    });
  });

  describe("isTokenExpired", () => {
    it("should return false for valid non-expired token", () => {
      const email = "test@example.com";
      const token = generateInvitationToken(email);

      expect(isTokenExpired(token)).toBe(false);
    });

    it("should return true for expired token", () => {
      const email = "test@example.com";
      // Set time to past
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 25); // 25 hours ago
      vi.setSystemTime(pastDate);

      const token = generateInvitationToken(email);

      // Reset to current time
      vi.useRealTimers();

      expect(isTokenExpired(token)).toBe(true);
    });

    it("should return null for invalid token format", () => {
      const invalidToken = "not-valid-base64!!!";
      expect(isTokenExpired(invalidToken)).toBe(null);
    });

    it("should return null for token with invalid structure", () => {
      const payload = { foo: "bar" };
      const token = Buffer.from(JSON.stringify(payload)).toString("base64");
      expect(isTokenExpired(token)).toBe(null);
    });
  });

  describe("InvitationTokenError", () => {
    it("should create error with message and code", () => {
      const error = new InvitationTokenError("Test message", "TEST_CODE");
      expect(error.message).toBe("Test message");
      expect(error.code).toBe("TEST_CODE");
      expect(error.name).toBe("InvitationTokenError");
      expect(error instanceof Error).toBe(true);
    });
  });
});

describe("invitation-token C# date formats", () => {
  describe("validateInvitationToken with C# formats", () => {
    it("should validate token with C# default DateTime format", () => {
      const email = "test@example.com";
      const currentTime = new Date();
      const csharpDate = createCSharpDateString(currentTime, "default");
      const payload = {
        email,
        createdDate: csharpDate,
      };
      const token = Buffer.from(JSON.stringify(payload)).toString("base64");

      expect(() => validateInvitationToken(token)).not.toThrow();
      expect(validateInvitationToken(token)).toBe(email);
    });

    it("should validate token with C# DateTime format with milliseconds", () => {
      const email = "test@example.com";
      const currentTime = new Date();
      const csharpDate = createCSharpDateString(currentTime, "ms");
      const payload = {
        email,
        createdDate: csharpDate,
      };
      const token = Buffer.from(JSON.stringify(payload)).toString("base64");

      expect(() => validateInvitationToken(token)).not.toThrow();
      expect(validateInvitationToken(token)).toBe(email);
    });

    it("should validate token with C# alternative date format", () => {
      const email = "test@example.com";
      const currentTime = new Date();
      const csharpDate = createCSharpDateString(currentTime, "alt");
      const payload = {
        email,
        createdDate: csharpDate,
      };
      const token = Buffer.from(JSON.stringify(payload)).toString("base64");

      expect(() => validateInvitationToken(token)).not.toThrow();
      expect(validateInvitationToken(token)).toBe(email);
    });

    it("should handle expired token with C# date format", () => {
      const pastDate = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
      const payload = {
        email: "test@example.com",
        createdDate: pastDate.toISOString(),
      };
      const token = Buffer.from(JSON.stringify(payload)).toString("base64");

      expect(() => validateInvitationToken(token)).toThrow(
        "Invitation token has expired",
      );
    });
  });
});
