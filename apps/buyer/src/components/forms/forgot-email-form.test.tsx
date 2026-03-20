import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock translations
vi.mock("next-intl", () => ({
  useTranslations: vi.fn(() => {
    return (key: string) => {
      const map: Record<string, string> = {
        email: "Email",
        enterEmail: "Enter your email",
        noUserFound: "No user found.",
        createAccount: "Create Account",
        sending: "Sending...",
        send_reset_link: "Send reset link",
      };
      return map[key] ?? key;
    };
  }),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href as string} {...props}>
      {children}
    </a>
  ),
}));

// Use real UI components for form & button

// Import after mocks
import { ForgotEmailForm } from "./forgot-email-form";

describe("ForgotEmailForm", () => {
  beforeEach(() => {
    // No global restore to keep module mocks intact
  });

  it("renders and keeps submit disabled until a valid email is entered", async () => {
    const user = userEvent.setup();
    render(<ForgotEmailForm onSubmit={vi.fn()} userNotFound={false} />);

    const submitButton = screen.getByRole("button", {
      name: "Send reset link",
    });
    expect(submitButton).toBeDisabled();

    const emailInput = screen.getByLabelText("Email");
    await user.type(emailInput, "not-an-email");
    expect(submitButton).toBeDisabled();

    await user.clear(emailInput);
    await user.type(emailInput, "john.doe@example.com");
    expect(submitButton).toBeEnabled();
  });

  it("submits the entered email and shows loading state", async () => {
    const user = userEvent.setup();
    let resolveSubmit!: () => void;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((res) => {
          resolveSubmit = res;
        }),
    );

    render(<ForgotEmailForm onSubmit={onSubmit} userNotFound={false} />);

    const emailInput = screen.getByLabelText("Email");
    await user.type(emailInput, "jane@example.com");

    const submitButton = screen.getByRole("button", {
      name: "Send reset link",
    });
    await user.click(submitButton);

    // Loading state
    expect(
      screen.getByRole("button", { name: "Sending..." }),
    ).toBeInTheDocument();

    // Finish async submit
    resolveSubmit();

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith("jane@example.com");
    });

    // Back to idle state
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Send reset link" }),
      ).toBeInTheDocument();
    });
  });

  it("shows user-not-found message and a link to sign-up when prop is true", () => {
    render(<ForgotEmailForm onSubmit={vi.fn()} userNotFound={true} />);

    expect(screen.getByText("No user found.")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Create Account" });
    expect(link).toHaveAttribute("href", "/sign-up");
  });
});
