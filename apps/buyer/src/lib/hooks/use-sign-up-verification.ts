"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { type AuthMode, ERROR_MESSAGES } from "@/lib/constants/auth";
import { type VerificationResult } from "@/lib/services/auth/types";
import { verificationStrategies } from "@/lib/services/auth/verification-strategies";
import { type BasicInfo, useSignUpStore } from "@/lib/stores/sign-up-store";
import { useLocalizedErrorHandler } from "@/lib/utils/localized-error-handler";
import { logger } from "@/lib/utils/logger";
import { showSuccessToast } from "@/lib/utils/toast";

import { useBackendRegistration } from "./use-backend-registration";
import { useCountdownTimer } from "./use-countdown-timer";
import { useSystemReadiness } from "./use-system-readiness";

interface UseSignUpVerificationProps {
  mode?: AuthMode;
}

// Helper function to sync Clerk data to store
function syncClerkDataToStore(
  result: VerificationResult,
  basicInfo: Partial<BasicInfo>,
  setBasicInfo: (info: Partial<BasicInfo>) => void,
) {
  logger.info("syncClerkDataToStore called", {
    hasFirstName: !!result.first_name,
    hasLastName: !!result.last_name,
    hasEmail: !!result.email_address,
    currentBasicInfo: basicInfo,
  });

  if (result.first_name || result.last_name || result.email_address) {
    const updates: Partial<BasicInfo> = {};

    if (result.first_name) updates.firstName = result.first_name;
    if (result.last_name) updates.lastName = result.last_name;
    if (result.email_address) updates.email = result.email_address;

    setBasicInfo({
      ...basicInfo,
      ...updates,
    });

    logger.info("Updated basicInfo with Clerk verification data", {
      updates,
      hasAllRequired: !!(
        updates.firstName &&
        updates.lastName &&
        updates.email
      ),
    });
  } else {
    logger.warn("No user data to sync from Clerk verification result");
  }
}

interface SignupVerificationOptions {
  result: VerificationResult;
  setOtpVerified: (verified: boolean) => void;
  setIsRegistering: (isRegistering: boolean) => void;
  setActive:
    | ((params: { session: string | null }) => Promise<void>)
    | undefined;
  setApiData: (data: { clerkUserId?: string }) => void;
  basicInfo: Partial<BasicInfo>;
  setBasicInfo: (info: Partial<BasicInfo>) => void;
  handleSignupRegistration: () => Promise<boolean>;
  setIsAwaitingRetry: (isAwaitingRetry: boolean) => void;
  handleError: (error: unknown, message: string) => void;
}

// Helper function to handle signup-specific verification
async function handleSignupVerification(options: SignupVerificationOptions) {
  const {
    result,
    setOtpVerified,
    setIsRegistering,
    setActive,
    setApiData,
    basicInfo,
    setBasicInfo,
    handleSignupRegistration,
    setIsAwaitingRetry,
    handleError,
  } = options;
  setOtpVerified(true);
  setIsRegistering(true);

  if (result.createdSessionId && setActive) {
    await setActive({ session: result.createdSessionId });
  }

  if (result.created_user_id) {
    logger.info("Setting clerkUserId from verification result", {
      userId: result.created_user_id,
    });
    setApiData({ clerkUserId: result.created_user_id });
  } else {
    logger.warn("No created_user_id in verification result", {
      resultKeys: Object.keys(result),
      status: result.status,
    });
  }

  syncClerkDataToStore(result, basicInfo, setBasicInfo);

  try {
    const registrationSuccess = await handleSignupRegistration();
    if (!registrationSuccess) {
      setIsAwaitingRetry(true);
      return false;
    }
    return true;
  } catch (error) {
    setIsAwaitingRetry(true);
    handleError(error, ERROR_MESSAGES.REGISTRATION_FAILED);
    // Clear persisted sign-up data to prevent navigation to onboarding with incomplete registration
    logger.warn("Clearing sign-up store due to registration failure");
    localStorage.removeItem("sign-up-storage");
    return false;
  }
}

/**
 * Refactored hook for handling OTP verification across different authentication modes
 * Uses strategy pattern to handle signup, password reset, and login verification
 */
export function useSignUpVerification({
  mode = "signup",
}: UseSignUpVerificationProps = {}) {
  const router = useRouter();
  const { signOut } = useAuth();

  // Store hooks
  const {
    setOtpVerified,
    setCurrentStep,
    setIsRegistering,
    basicInfo,
    setApiData,
    setBasicInfo,
    clearBasicInfo,
  } = useSignUpStore();

  // Custom hooks
  const {
    countdown,
    isDisabled: resendDisabled,
    startCountdown,
  } = useCountdownTimer(60);
  const { register: registerOnBackend } = useBackendRegistration();
  const { isReady, checkReadiness, authInstance, setActive } =
    useSystemReadiness(mode);

  // Error handling
  const { handleError, handleClerkError } = useLocalizedErrorHandler();

  // Local state
  const [isLoading, setIsLoading] = useState(false);
  const [isAwaitingRetry, setIsAwaitingRetry] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  // Get the appropriate strategy
  const strategy = verificationStrategies[mode];

  /**
   * Handle backend registration for signup mode
   */
  const handleSignupRegistration = useCallback(async () => {
    try {
      const result = await registerOnBackend();

      if (result.success) {
        setIsRegistering(false);
        setCurrentStep(4);
        return true;
      }

      return false;
    } catch (error) {
      logger.error("Backend registration failed", error);

      // Sign out the user to prevent invalid state
      try {
        await signOut();
      } catch (signOutError) {
        logger.error(
          "Failed to sign out after registration failure",
          signOutError,
        );
      } finally {
        setIsRegistering(false);
      }

      throw error;
    }
  }, [registerOnBackend, setIsRegistering, setCurrentStep, signOut]);

  /**
   * Verify OTP code and handle the appropriate authentication flow
   */
  const verifyAndRegister = useCallback(
    async (otp: string) => {
      // Check if locked out
      if (isLocked && lockoutEndTime && Date.now() < lockoutEndTime) {
        return;
      }

      setIsLoading(true);
      setIsAwaitingRetry(false);
      setLastError(null);

      try {
        checkReadiness();

        // First check rate limit via our API
        const identifier =
          basicInfo.email ||
          (mode !== "signup" ? (authInstance as any)?.identifier : null) ||
          "unknown";
        const rateLimitResponse = await fetch("/api/auth/otp-verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            otp,
            identifier,
            mode,
          }),
        });

        const rateLimitData = await rateLimitResponse.json();

        if (rateLimitResponse.status === 429) {
          // Rate limited
          const retryAfter = rateLimitData.error?.retryAfter ?? 900; // Default 15 minutes
          setIsLocked(true);
          const lockoutEnd = Date.now() + retryAfter * 1000;
          setLockoutEndTime(lockoutEnd);
          setLastError(
            rateLimitData.error?.message ??
              "Too many attempts. Please try again later.",
          );
          setAttemptCount(3); // Set to max to show user they're locked out
          return;
        }

        // Update remaining attempts from server
        if (rateLimitData.remaining !== undefined) {
          setAttemptCount(3 - rateLimitData.remaining);
        }

        // Verify OTP using the strategy
        const result = await strategy.verify({
          otp,
          signUp: mode === "signup" ? (authInstance as any) : undefined,
          signIn: mode !== "signup" ? (authInstance as any) : undefined,
          setActive,
        });

        // Reset attempt count on successful verification
        setAttemptCount(0);
        setIsLocked(false);
        setLockoutEndTime(null);

        // Reset rate limit on server after successful verification
        await fetch("/api/auth/otp-verify", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier,
            mode,
          }),
        });

        // Handle signup-specific logic
        if (mode === "signup" && result.status === "complete") {
          const success = await handleSignupVerification({
            result,
            setOtpVerified,
            setIsRegistering,
            setActive,
            setApiData,
            basicInfo,
            setBasicInfo,
            handleSignupRegistration,
            setIsAwaitingRetry,
            handleError,
          });

          if (!success) {
            return;
          }

          // Only proceed to onboarding if registration was successful
          // Reset flow and ensure localStorage is cleared before navigation
          clearBasicInfo();

          // Handle success for signup mode
          await strategy.handleSuccess({
            result,
            router,
            setActive,
          });
        } else {
          // Handle success for non-signup modes (reset, verify)
          await strategy.handleSuccess({
            result,
            router,
            setActive,
          });
        }
      } catch (error: any) {
        // Don't increment attempt count here - it's handled by the server
        // Just set the error message
        setLastError(
          error?.errors?.[0]?.message || "Invalid code. Please try again.",
        );

        handleClerkError(error, ERROR_MESSAGES.VERIFICATION_FAILED);
      } finally {
        setIsLoading(false);
      }
    },
    [
      mode,
      strategy,
      checkReadiness,
      authInstance,
      setActive,
      setOtpVerified,
      setIsRegistering,
      handleSignupRegistration,
      router,
      handleError,
      handleClerkError,
      setBasicInfo,
      basicInfo,
      setApiData,
      isLocked,
      lockoutEndTime,
      clearBasicInfo,
    ],
  );

  /**
   * Resend OTP code
   */
  const resendCode = useCallback(
    async (successMessage?: string) => {
      startCountdown();

      try {
        checkReadiness();

        await strategy.resend({
          signUp: mode === "signup" ? (authInstance as any) : undefined,
          signIn: mode !== "signup" ? (authInstance as any) : undefined,
          email: basicInfo.email,
        });

        showSuccessToast(successMessage || strategy.getResendSuccessMessage());
      } catch (error) {
        logger.error("Error resending OTP", error, {
          mode,
          email: basicInfo.email
            ? `***@${basicInfo.email.split("@")[1]}`
            : "unknown",
        });
        handleClerkError(error, ERROR_MESSAGES.RESEND_FAILED);
      }
    },
    [
      mode,
      strategy,
      checkReadiness,
      authInstance,
      basicInfo.email,
      startCountdown,
      handleClerkError,
    ],
  );

  return {
    verifyAndRegister,
    resendCode,
    isLoading,
    isAwaitingRetry,
    countdown,
    resendDisabled,
    isReady,
    attemptCount,
    isLocked,
    lockoutEndTime,
    lastError,
  };
}
