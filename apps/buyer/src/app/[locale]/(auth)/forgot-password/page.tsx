"use client";

import { Button } from "@cf/ui";
import { useClerk, useSignIn } from "@clerk/nextjs";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import React from "react";

import { ForgotEmailForm } from "@/components/forms/forgot-email-form";
import { logger } from "@/lib/logger";
import { useSignUpStore } from "@/lib/stores/sign-up-store";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  const { signIn, isLoaded } = useSignIn();
  const { signOut } = useClerk();
  const { setBasicInfo } = useSignUpStore();

  const handleForgotPassword = async (email: string) => {
    logger.info("Email submitted for password reset:", { email });

    if (!isLoaded || !signIn) {
      logger.error("Clerk SignIn not loaded");
      return;
    }

    try {
      // Call our API route which handles rate limiting
      const response = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.status === 429) {
        // Rate limited
        const retryAfter = response.headers.get("Retry-After");
        const message = retryAfter
          ? t("rateLimitedWithTime", { seconds: retryAfter })
          : t("rateLimitExceeded");
        showErrorToast(message);
        return;
      }

      if (!response.ok) {
        showErrorToast(data.error?.message || t("somethingWentWrong"));
        return;
      }

      // Now proceed with Clerk flow for OTP
      await signOut({ redirectUrl: "/" });
      await signIn.create({ identifier: email });

      const firstFactor = signIn.supportedFirstFactors?.find(
        (factor) => factor.strategy === "reset_password_email_code",
      );

      if (
        !firstFactor ||
        firstFactor.strategy !== "reset_password_email_code"
      ) {
        logger.error("Reset password not enabled for this account");
        showErrorToast(t("resetNotEnabled"));
        return;
      }

      await signIn.prepareFirstFactor({
        strategy: "reset_password_email_code",
        emailAddressId: firstFactor.emailAddressId,
      });

      setBasicInfo({ email: email });
      showSuccessToast(t("passwordResetCodeSent", { email }));
      router.push("/otp?mode=reset");
    } catch (error: any) {
      logger.error("Password reset request failed", {
        error: error?.message || "Unknown error",
      });

      const message = error?.errors?.[0]?.code;

      if (message === "form_identifier_not_found") {
        // We shouldn't show this to prevent enumeration
        // The API already handles this
        showSuccessToast(t("passwordResetCodeSent", { email }));
        router.push("/otp?mode=reset");
        return;
      } else {
        showErrorToast(t("somethingWentWrong"));
      }
    }
  };

  return (
    <div className="space-y-6 md:space-y-10">
      <div className="space-y-12 text-start">
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
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            {t("recoverPasswordTitle")}
          </h1>
          <p className="text-start text-base leading-relaxed text-gray-600">
            {t("reset_password_subtitle")}
          </p>
        </div>
        <ForgotEmailForm onSubmit={handleForgotPassword} />
      </div>
    </div>
  );
}
