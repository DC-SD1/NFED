import { extractErrorMessage,mapErrorToLocaleKey } from "../error-mapper";

describe("mapErrorToLocaleKey", () => {
  it("should map SharedKernelError codes correctly", () => {
    const error = {
      errors: [
        {
          code: "AUTH_INVALID_CREDENTIALS",
          message: "Invalid credentials provided",
          type: 1,
        },
      ],
    };

    expect(mapErrorToLocaleKey(error)).toBe("auth.errors.invalid_credentials");
  });

  it("should map Clerk error codes correctly", () => {
    const clerkError = {
      code: "incorrect_password",
      message: "Password is incorrect",
    };

    expect(mapErrorToLocaleKey(clerkError)).toBe("auth.errors.invalid_credentials");
  });

  it("should map HTTP status codes correctly", () => {
    const httpError = {
      status: 401,
      message: "Unauthorized",
    };

    expect(mapErrorToLocaleKey(httpError)).toBe("api.errors.unauthorized");
  });

  it("should handle Error instances with attached properties", () => {
    const error = new Error("Request failed");
    (error as any).errorCode = "AUTH_TOKEN_EXPIRED";
    (error as any).status = 401;

    expect(mapErrorToLocaleKey(error)).toBe("auth.errors.token_expired");
  });

  it("should handle network errors by message content", () => {
    const networkError = new Error("Network request failed");

    expect(mapErrorToLocaleKey(networkError)).toBe("common.errors.network_error");
  });

  it("should return default error for unknown errors", () => {
    expect(mapErrorToLocaleKey(null)).toBe("common.errors.unknown_error");
    expect(mapErrorToLocaleKey(undefined)).toBe("common.errors.unknown_error");
    expect(mapErrorToLocaleKey({})).toBe("common.errors.unknown_error");
  });

  it("should handle string errors", () => {
    expect(mapErrorToLocaleKey("Network error occurred")).toBe("common.errors.network_error");
    expect(mapErrorToLocaleKey("401 Unauthorized")).toBe("auth.errors.unauthorized");
    expect(mapErrorToLocaleKey("Something went wrong")).toBe("common.errors.unknown_error");
  });
});

describe("extractErrorMessage", () => {
  it("should extract message from Error instances", () => {
    const error = new Error("Test error message");
    expect(extractErrorMessage(error)).toBe("Test error message");
  });

  it("should extract message from openapi-fetch error structure", () => {
    const error = {
      errors: [
        {
          code: "AUTH_INVALID_CREDENTIALS",
          message: "Invalid credentials provided",
        },
      ],
    };

    expect(extractErrorMessage(error)).toBe("Invalid credentials provided");
  });

  it("should extract message from Clerk error structure", () => {
    const clerkError = {
      code: "incorrect_password",
      message: "Password is incorrect",
      longMessage: "The password you entered is incorrect. Please try again.",
    };

    expect(extractErrorMessage(clerkError)).toBe("Password is incorrect");
  });

  it("should handle string errors", () => {
    expect(extractErrorMessage("Simple error message")).toBe("Simple error message");
  });

  it("should return default message for unknown errors", () => {
    expect(extractErrorMessage(null)).toBe("An unknown error occurred");
    expect(extractErrorMessage(undefined)).toBe("An unknown error occurred");
    expect(extractErrorMessage({})).toBe("An unknown error occurred");
  });
});