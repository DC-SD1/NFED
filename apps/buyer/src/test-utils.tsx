import type { RenderOptions } from "@testing-library/react";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import React from "react";
import { vi } from "vitest";

// Mock providers and context
const MockProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return <MockProviders>{children}</MockProviders>;
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Mock data generators
export const createMockUser = (overrides = {}) => ({
  id: "user-123",
  email: "test@example.com",
  roles: ["farm_owner"],
  ...overrides,
});

export const createMockSignInResult = (overrides = {}) => ({
  status: "complete",
  createdSessionId: "session-123",
  ...overrides,
});

export const createMockAuthActions = (overrides = {}) => ({
  exchangeTokens: vi.fn().mockResolvedValue({ success: true }),
  logout: vi.fn(),
  clearStore: vi.fn(),
  setTokens: vi.fn(),
  setUserData: vi.fn(),
  setTokenExchangeHandled: vi.fn(),
  handleTokenOperationError: vi.fn(),
  ...overrides,
});

export const createMockTranslations = (namespace: string, overrides = {}) => {
  const baseTranslations = {
    common: {
      signIn: "Sign In",
      signUp: "Sign Up",
      ...overrides,
    },
    auth: {
      email: "Email",
      enterEmail: "Enter your email",
      password: "Password",
      enterPassword: "Enter your password",
      forgotPassword: "Forgot your password?",
      recoverPassword: "Recover password",
      processing: "Processing...",
      noAccount: "Don't have an account?",
      createAccount: "Create account",
      errors: {
        invalid_credentials: "Invalid credentials",
        mfa_not_supported: "Multi-factor authentication is not supported",
        needs_new_password: "Password needs to be reset",
        signin_incomplete: "Sign-in incomplete",
      },
      ...overrides,
    },
    metadata: {
      signInTitle: "Sign In",
      signInDescription: "Sign in to your account",
      ...overrides,
    },
  };

  return baseTranslations[namespace as keyof typeof baseTranslations] || {};
};

// Mock hook implementations
export const mockUseSignIn = (overrides = {}) => ({
  isLoaded: true,
  signIn: {
    create: vi.fn().mockResolvedValue(createMockSignInResult()),
  },
  setActive: vi.fn(),
  ...overrides,
});

export const mockUseAuth = (overrides = {}) => ({
  getToken: vi.fn().mockResolvedValue("clerk-token-123"),
  ...overrides,
});

export const mockUseRouter = (overrides = {}) => ({
  replace: vi.fn(),
  push: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  ...overrides,
});

export const mockUseParams = (overrides = {}) => ({
  locale: "en",
  ...overrides,
});

export const mockUseTranslations = (namespace: string, overrides = {}) => {
  const translations = createMockTranslations(namespace, overrides);
  return vi.fn().mockReturnValue(translations);
};

// Test helpers
export const waitForLoadingToFinish = async () => {
  // Wait for any loading states to complete
  await new Promise((resolve) => setTimeout(resolve, 0));
};

export const fillLoginForm = async (
  user: any,
  email = "test@example.com",
  password = "password123",
) => {
  const emailInput = user.getByTestId("input-email");
  const passwordInput = user.getByTestId("input-password");

  await user.type(emailInput, email);
  await user.type(passwordInput, password);

  return { emailInput, passwordInput };
};

export const submitLoginForm = async (user: any) => {
  const submitButton = user.getByTestId("submit-button");
  await user.click(submitButton);
  return submitButton;
};

// Re-export everything from testing-library
export * from "@testing-library/react";
export { customRender as render };
