"use client";

import { Button } from "@cf/ui";
import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { PasswordForm } from "@/components/forms/password-form";
import type { PasswordFormData } from "@/lib/schemas/sign-up";
import { useAuthActions } from "@/lib/stores/auth/auth-store-ssr";
import { useSignUpStore } from "@/lib/stores/sign-up-store";
import { useLocalizedErrorHandler } from "@/lib/utils/localized-error-handler";
import { logger } from "@/lib/utils/logger";
import { showSuccessToast } from "@/lib/utils/toast";

export default function PasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "signup";
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("auth");
  const { isLoaded, signUp } = useSignUp();
  const { isLoaded: isSignInLoaded, signIn } = useSignIn();
  const { handleError, handleClerkError } = useLocalizedErrorHandler();
  const { signOut } = useClerk();
  const authActions = useAuthActions();

  // Sign-up store integration
  const { basicInfo, setCurrentStep, isInvite, setIsInvite } = useSignUpStore();

  const handleSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);

    try {
      if (mode === "signup") {
        // Check if Clerk is loaded and we have basic info
        if (!isLoaded || !signUp) {
          handleError(
            new Error("SYSTEM_NOT_READY"),
            "System is not ready. Please try again.",
          );
          return;
        }

        if (!basicInfo.email) {
          handleError(
            new Error("MISSING_BASIC_INFO"),
            "Missing basic information. Please start over.",
          );
          router.push("/sign-up");
          return;
        }

        // Create account with Clerk
        const result = await signUp.create({
          emailAddress: basicInfo.email,
          password: data.password,
          firstName: basicInfo.firstName,
          lastName: basicInfo.lastName,
        });

        // Don't store user ID here - it doesn't exist yet
        // The actual user ID will be set after OTP verification completes
        logger.info("Clerk sign-up initiated", {
          sessionId: result.id,
          status: result.status,
        });
        setCurrentStep(3);

        // Send email verification code
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });

        // Navigate to OTP verification
        router.replace("/otp?mode=signup");
      } else if (mode === "reset") {
        if (!signIn || !isSignInLoaded) {
          handleError(
            new Error("SYSTEM_NOT_READY"),
            "System is not ready. Please try again.",
          );
          return;
        }

        const result = await signIn.resetPassword({
          password: data.password,
        });

        if (result.status === "complete") {
          // Clear the auth store first to ensure clean state
          authActions.clearStore();

          // Don't activate the new session - just sign out completely
          await signOut({ redirectUrl: "/sign-in" });

          // Show success message
          showSuccessToast(t("password_updated"));
        } else {
          throw new Error("RESET_INCOMPLETE");
        }
      } else if (mode === "change") {
        // TODO: Handle password change
        console.log("Change password:", data.password);
      }
    } catch (error) {
      // Log the error for debugging
      logger.error("Error in password form submission", error, {
        mode,
        errorType: typeof error,
        errorKeys:
          error && typeof error === "object" ? Object.keys(error) : "N/A",
        errorMessage: error instanceof Error ? error.message : "N/A",
        errorCode: (error as any)?.code || "N/A",
        errorStatus: (error as any)?.status || "N/A",
      });

      // Test error mapping with a known error structure
      if (
        error &&
        typeof error === "object" &&
        (error as any)?.code === "identifier_already_exists"
      ) {
        // This is a test case to see if our error mapping works
        logger.info("Testing error mapping for identifier_already_exists");
        handleError(
          error,
          "This email is already registered. Please sign in instead.",
        );
        return;
      }

      // Use handleClerkError for better error parsing
      handleClerkError(error, "Sign-up failed. Please try again.");
      // Don't re-throw the error - we've handled it with the toast
      return;
    } finally {
      setIsLoading(false);
      setIsInvite(false);
    }
  };

  const getSubmitButtonText = () => {
    if (isInvite) {
      return t("setNewPassword");
    }
    switch (mode) {
      case "reset":
        return t("saveNewPassword");
      case "change":
        return t("saveNewPassword");
      default:
        return t("next");
    }
  };

  return (
    <div className="mx-auto w-full max-w-sm space-y-14 pt-10 md:max-w-lg md:pt-0 lg:max-w-2xl">
      <Button
        size="icon"
        variant="outline"
        className="size-10 bg-[#F5F5F5] text-black hover:bg-[#F5F5F5]/80 hover:text-black"
        asChild
      >
        <Link href="/sign-in">
          <ArrowLeftIcon className="size-4" />
        </Link>
      </Button>

      <PasswordForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitButtonText={getSubmitButtonText()}
      />
    </div>
  );
}
