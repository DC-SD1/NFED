import "@testing-library/jest-dom";

import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {
    void 0;
  }
  disconnect() {
    void 0;
  }
  observe() {
    void 0;
  }
  unobserve() {
    void 0;
  }
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {
    void 0;
  }
  disconnect() {
    void 0;
  }
  observe() {
    void 0;
  }
  unobserve() {
    void 0;
  }
} as any;

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useParams: vi.fn(),
  usePathname: vi.fn(),
  redirect: vi.fn(),
}));

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
  useLocale: vi.fn(() => "en"),
}));

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(),
  getLocale: vi.fn(() => "en"),
}));

// Mock Clerk
vi.mock("@clerk/nextjs", () => ({
  useSignIn: vi.fn(),
  useAuth: vi.fn(),
  useUser: vi.fn(),
  SignIn: vi.fn(),
  SignUp: vi.fn(),
}));

// Mock React Hook Form (partial mock to preserve actual exports like FormProvider)
vi.mock("react-hook-form", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as Record<string, any>),
    // If needed, you can override specific methods here. For now, keep actual behavior.
  };
});

// Mock Zustand stores
vi.mock("@/lib/stores/auth-store-ssr", () => ({
  useAuthActions: vi.fn(),
  useAuthUser: vi.fn(),
  useAuthStoreContext: vi.fn(),
}));

vi.mock("@/lib/stores/sign-up-store", () => ({
  useSignUpStore: vi.fn(),
}));

// Mock utility functions
vi.mock("@/lib/utils/localized-error-handler", () => ({
  useLocalizedErrorHandler: vi.fn(),
}));

// Mock services
vi.mock("@/lib/services/auth/auth-api.service", () => ({
  authApiService: {
    logout: vi.fn(),
  },
}));

// Mock logger
vi.mock("@/lib/utils/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock UI components that might not be available in test environment
vi.mock("@cf/ui", () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(" "),
}));

// Mock CSS modules
vi.mock("*.module.css", () => ({}));

// Mock image imports
vi.mock("*.png", () => "test-image.png");
vi.mock("*.jpg", () => "test-image.jpg");
vi.mock("*.jpeg", () => "test-image.jpeg");
vi.mock("*.svg", () => "test-image.svg");

// Mock environment variables
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "test-publishable-key";
process.env.CLERK_SECRET_KEY = "test-secret-key";
process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL = "/sign-in";
process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL = "/sign-up";
process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL = "/dashboard";
process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL = "/onboarding";

// Mock fetch globally
global.fetch = vi.fn();

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
