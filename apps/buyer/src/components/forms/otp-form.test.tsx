import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ----- Mocks -----
// Mock translations
vi.mock("next-intl", () => ({
  useTranslations: vi.fn(() => {
    return (key: string, values?: Record<string, any>) => {
      const map: Record<string, string> = {
        enterCode: "Enter the code sent to",
        verifying: "Verifying...",
        apply: "Apply",
        didntReceiveOtp: "Didn't receive the code?",
        sending: "Sending...",
        sendAgain: "Send again",
        canResendCodeIn: "You can resend the code in",
        otpLastAttemptWarning: "Last attempt remaining",
      };
      if (key === "otpAttemptsWarning") {
        return `You have ${values?.attempts} attempts left`;
      }
      return map[key] ?? key;
    };
  }),
}));

// Mock store
vi.mock("@/lib/stores/sign-up-store", () => ({
  useSignUpStore: (selector: any) =>
    selector({ basicInfo: { email: "john.doe@example.com" } }),
}));

// Mock email masker
vi.mock("@/lib/utils/string-helpers", () => ({
  maskEmail: vi.fn(() => "j***@example.com"),
}));

// Mock toast
const showWarningToast = vi.fn();
vi.mock("@/lib/utils/toast", () => ({
  showWarningToast: (...args: any[]) => showWarningToast(...args),
}));

// Mock constants
vi.mock("@/lib/constants/auth", () => ({
  MAX_OTP_ATTEMPTS: 3,
}));

// Mock Input OTP UI to a simple input for easier interaction
vi.mock("@cf/ui/components/input-otp", () => ({
  InputOTP: ({ value, onChange, disabled, children }: any) => (
    <div>
      <input
        data-testid="otp-input"
        value={value}
        onChange={(e) => onChange?.((e.target as HTMLInputElement).value)}
        disabled={disabled}
      />
      {children}
    </div>
  ),
  InputOTPGroup: ({ children }: any) => <div>{children}</div>,
  InputOTPSlot: ({ index }: any) => <span data-testid={`otp-slot-${index}`} />,
}));

// Dynamically controlled hook state for useSignUpVerification
let mockVerifyAndRegister = vi.fn();
let mockResendCode = vi.fn();
let mockVerificationState = {
  isLoading: false,
  isAwaitingRetry: false,
  countdown: 0,
  resendDisabled: false,
  attemptCount: 0,
  isLocked: false,
};

vi.mock("@/lib/hooks/use-sign-up-verification", () => ({
  useSignUpVerification: () => ({
    verifyAndRegister: (...args: any[]) => mockVerifyAndRegister(...args),
    resendCode: (...args: any[]) => mockResendCode(...args),
    ...mockVerificationState,
  }),
}));

// Import after mocks
import { OtpForm } from "./otp-form";

describe("OtpForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAndRegister = vi.fn().mockResolvedValue(undefined);
    mockResendCode = vi.fn().mockResolvedValue(undefined);
    mockVerificationState = {
      isLoading: false,
      isAwaitingRetry: false,
      countdown: 0,
      resendDisabled: false,
      attemptCount: 0,
      isLocked: false,
    };
  });

  it("renders masked email and basic layout", () => {
    render(<OtpForm />);

    expect(screen.getByText("Enter the code sent to")).toBeInTheDocument();
    expect(screen.getByText("j***@example.com")).toBeInTheDocument();

    // Submit and resend controls
    expect(screen.getByRole("button", { name: "Apply" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Send again" }),
    ).toBeInTheDocument();
  });

  it("enables submit after entering 6-digit OTP and submits value", async () => {
    const user = userEvent.setup();
    render(<OtpForm />);

    const submitButton = screen.getByRole("button", { name: "Apply" });
    expect(submitButton).toBeDisabled();

    const otpInput = screen.getByTestId("otp-input");
    await user.type(otpInput, "123456");

    expect(submitButton).toBeEnabled();

    await user.click(submitButton);
    await waitFor(() => {
      expect(mockVerifyAndRegister).toHaveBeenCalledWith("123456");
    });
  });

  it("shows verifying state when loading", () => {
    mockVerificationState.isLoading = true;
    render(<OtpForm />);

    const submitButton = screen.getByRole("button", { name: "Verifying..." });
    expect(submitButton).toBeDisabled();
  });

  it("handles resend flow and shows sending state", async () => {
    const user = userEvent.setup();
    // Keep resendCode pending briefly
    let resolveResend!: () => void;
    mockResendCode.mockImplementation(
      () =>
        new Promise<void>((res) => {
          resolveResend = res;
        }),
    );

    render(<OtpForm />);
    const resendButton = screen.getByRole("button", { name: "Send again" });
    await user.click(resendButton);

    // Button text switches to sending immediately due to local isResending state
    expect(
      screen.getByRole("button", { name: "Sending..." }),
    ).toBeInTheDocument();
    expect(mockResendCode).toHaveBeenCalledTimes(1);

    // Settle the promise
    resolveResend();
  });

  it("shows countdown timer when resend is disabled", () => {
    mockVerificationState.resendDisabled = true;
    mockVerificationState.countdown = 65; // 01:05
    render(<OtpForm />);

    expect(screen.getByText("You can resend the code in")).toBeInTheDocument();
    expect(screen.getByText("01:05")).toBeInTheDocument();
  });

  it("renders retry UI when awaiting retry and triggers verification on click", async () => {
    const user = userEvent.setup();
    mockVerificationState.isAwaitingRetry = true;
    render(<OtpForm />);

    // Provide an OTP value so retry uses it
    const otpInput = screen.getByTestId("otp-input");
    await user.type(otpInput, "654321");

    const retryButton = screen.getByRole("button", {
      name: "Retry Registration",
    });
    await user.click(retryButton);

    await waitFor(() => {
      expect(mockVerifyAndRegister).toHaveBeenCalledWith("654321");
    });
  });

  it("emits warnings when attempts are low (2 and 1 remaining)", async () => {
    // Case: remaining 2 => attemptCount = 1, MAX = 3
    mockVerificationState.attemptCount = 1;
    render(<OtpForm />);
    await waitFor(() => {
      expect(showWarningToast).toHaveBeenCalledWith("You have 2 attempts left");
    });

    // Case: remaining 1 => attemptCount = 2
    showWarningToast.mockClear();
    mockVerificationState.attemptCount = 2;
    render(<OtpForm />);
    await waitFor(() => {
      expect(showWarningToast).toHaveBeenCalledWith("Last attempt remaining");
    });
  });

  it("disables inputs and actions when locked", () => {
    mockVerificationState.isLocked = true;
    render(<OtpForm />);

    const otpInput = screen.getByTestId("otp-input");
    const submitButton = screen.getByRole("button", { name: "Apply" });
    const resendButton = screen.getByRole("button", { name: "Send again" });

    expect(otpInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(resendButton).toBeDisabled();
  });
});
