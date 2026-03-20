import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock all dependencies before importing the component
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));


vi.mock("@/lib/stores/sign-up-store", () => ({
  useSignUpStore: vi.fn(() => ({
    setBasicInfo: vi.fn(),
    setCurrentStep: vi.fn(),
  })),
}));

vi.mock("@/components/forms/basic-info-form", () => ({
  BasicInfoForm: vi.fn(
    ({ onSubmit, isLoading }: { onSubmit: any; isLoading: boolean }) => (
      <div data-testid="basic-info-form">
        <button
          onClick={() =>
            onSubmit({
              firstName: "John",
              lastName: "Doe",
              email: "john.doe@example.com",
              country: "GH",
            })
          }
          disabled={isLoading}
          data-testid="submit-button"
        >
          {isLoading ? "Submitting..." : "Submit"}
        </button>
      </div>
    ),
  ),
}));

vi.mock("@/components/auth/auth-divider", () => ({
  AuthDivider: vi.fn(() => <div data-testid="auth-divider" />),
}));

vi.mock("@/components/auth/google-oauth-button", () => ({
  GoogleOAuthButton: vi.fn(() => <div data-testid="google-oauth-button" />),
}));

// Import the component after mocking
import { SignUpForm } from "./sign-up-form";

describe("SignUpForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("should render all form components correctly", () => {
      render(<SignUpForm />);

      expect(screen.getByTestId("basic-info-form")).toBeInTheDocument();
      expect(screen.getByTestId("auth-divider")).toBeInTheDocument();
      expect(screen.getByTestId("google-oauth-button")).toBeInTheDocument();
    });

    it("should render submit button in enabled state initially", () => {
      render(<SignUpForm />);

      const submitButton = screen.getByTestId("submit-button");
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent("Submit");
    });
  });

  describe("Form Submission Flow", () => {
    it("should handle form submission correctly", async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      const submitButton = screen.getByTestId("submit-button");

      // Submit the form
      await user.click(submitButton);

      // The form should be submitted and the button should show loading state
      await waitFor(() => {
        expect(submitButton).toHaveTextContent("Submitting...");
        expect(submitButton).toBeDisabled();
      });
    });

    it("should show loading state during form submission", async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      const submitButton = screen.getByTestId("submit-button");

      // Submit the form
      await user.click(submitButton);

      // Check that loading state is shown
      await waitFor(() => {
        expect(submitButton).toHaveTextContent("Submitting...");
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe("Integration with Child Components", () => {
    it("should render BasicInfoForm component", () => {
      render(<SignUpForm />);
      expect(screen.getByTestId("basic-info-form")).toBeInTheDocument();
    });

    it("should render AuthDivider component", () => {
      render(<SignUpForm />);
      expect(screen.getByTestId("auth-divider")).toBeInTheDocument();
    });

    it("should render GoogleOAuthButton component", () => {
      render(<SignUpForm />);
      expect(screen.getByTestId("google-oauth-button")).toBeInTheDocument();
    });
  });

  describe("Component Lifecycle", () => {
    it("should maintain component state across re-renders", () => {
      const { rerender } = render(<SignUpForm />);

      // Re-render the component
      rerender(<SignUpForm />);

      // All components should still be present
      expect(screen.getByTestId("basic-info-form")).toBeInTheDocument();
      expect(screen.getByTestId("auth-divider")).toBeInTheDocument();
      expect(screen.getByTestId("google-oauth-button")).toBeInTheDocument();
    });

    it("should handle multiple form submissions correctly", async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      const submitButton = screen.getByTestId("submit-button");

      // Submit multiple times
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      // Button should show loading state after each submission
      await waitFor(() => {
        expect(submitButton).toHaveTextContent("Submitting...");
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper test IDs for testing", () => {
      render(<SignUpForm />);

      expect(screen.getByTestId("basic-info-form")).toBeInTheDocument();
      expect(screen.getByTestId("auth-divider")).toBeInTheDocument();
      expect(screen.getByTestId("google-oauth-button")).toBeInTheDocument();
      expect(screen.getByTestId("submit-button")).toBeInTheDocument();
    });

    it("should maintain button state during loading", async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      const submitButton = screen.getByTestId("submit-button");

      // Submit the form
      await user.click(submitButton);

      // Button should show loading state
      await waitFor(() => {
        expect(submitButton).toHaveTextContent("Submitting...");
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe("Component Structure", () => {
    it("should have correct CSS classes for layout", () => {
      render(<SignUpForm />);

      const container = screen.getByTestId("basic-info-form").parentElement;
      expect(container).toHaveClass("space-y-6");

      const authSection = screen.getByTestId("auth-divider").parentElement;
      expect(authSection).toHaveClass("space-y-4");
    });

    it("should render components in correct order", () => {
      render(<SignUpForm />);

      const container = screen.getByTestId("basic-info-form").parentElement;
      const children = Array.from(container?.children || []);

      // First child should be BasicInfoForm
      expect(children[0]).toContainElement(
        screen.getByTestId("basic-info-form"),
      );

      // Second child should be the auth section
      expect(children[1]).toContainElement(screen.getByTestId("auth-divider"));
      expect(children[1]).toContainElement(
        screen.getByTestId("google-oauth-button"),
      );
    });
  });
});
