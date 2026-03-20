"use client";

import { Button } from "@cf/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@cf/ui/components/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@cf/ui/components/input-otp";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

import { MAX_OTP_ATTEMPTS } from "@/lib/constants/auth";
import { useSignUpVerification } from "@/lib/hooks/use-sign-up-verification";
import { type OtpFormData, otpSchema } from "@/lib/schemas/sign-up";
import { useSignUpStore } from "@/lib/stores/sign-up-store";
import { maskEmail } from "@/lib/utils/string-helpers";
import { showWarningToast } from "@/lib/utils/toast";

interface OtpFormProps {
  mode?: "signup" | "reset" | "verify";
}

const OTP_LENGTH = 6;

export function OtpForm({ mode = "signup" }: OtpFormProps) {
  const t = useTranslations("auth");
  const basicInfo = useSignUpStore((state) => state.basicInfo);
  
  const {
    verifyAndRegister,
    resendCode,
    isLoading,
    isAwaitingRetry,
    countdown,
    resendDisabled,
    attemptCount,
    isLocked,
  } = useSignUpVerification({ mode });

  const [isResending, setIsResending] = useState(false);

  const form = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const email = basicInfo.email || "user@example.com";
  const maskedEmail = maskEmail(email);

  // Calculate remaining attempts
  const remainingAttempts = MAX_OTP_ATTEMPTS - attemptCount;

  // Show warning toast when attempts are low
  React.useEffect(() => {
    if (remainingAttempts === 2 && attemptCount > 0) {
      showWarningToast(t("otpAttemptsWarning", { attempts: 2 }));
    } else if (remainingAttempts === 1 && attemptCount > 0) {
      showWarningToast(t("otpLastAttemptWarning"));
    }
  }, [attemptCount, remainingAttempts, t]);

  // The error toast for lockout is handled in the useSignUpVerification hook

  const handleSubmit = async (data: OtpFormData) => {
    await verifyAndRegister(data.otp);
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendCode(t("otpResendSuccess"));
      // Success toast is shown in the resendCode function with localized message
    } catch (error) {
      // Error is already handled in resendCode
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <p className="text-foreground text-center text-sm">
            {t("enterCode")} <span className="font-medium">{maskedEmail}</span>
          </p>

          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputOTP
                    maxLength={OTP_LENGTH}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading || isLocked}
                    containerClassName="justify-center"
                  >
                    <InputOTPGroup className="gap-2">
                      {Array.from({ length: OTP_LENGTH }, (_, index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="!bg-primary-light data-[active=true]:!border-primary data-[active=true]:!ring-primary/20 focus:!border-primary focus:!ring-primary/20 !rounded-lg !border !border-gray-200 text-center text-lg font-medium !shadow-none focus:!ring-2 data-[active=true]:!ring-2 sm:size-14 sm:text-xl"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage className="text-center" />
              </FormItem>
            )}
          />
        </div>

        {isAwaitingRetry && (
          <div className="text-destructive space-y-2 text-center text-sm">
            <p>We could not complete your registration. Please try again.</p>
            <Button
              type="button"
              variant="link"
              onClick={() => handleSubmit(form.getValues())}
              disabled={isLoading}
              className="text-primary hover:text-primary/80"
            >
              Retry Registration
            </Button>
          </div>
        )}

        <div className="space-y-4">
          <Button
            type="submit"
            className="bg-primary h-12 w-full rounded-xl text-base font-medium text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading || form.watch("otp").length !== OTP_LENGTH || isLocked}
          >
            {isLoading ? t("verifying") : t("apply")}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {t("didntReceiveOtp")}{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendDisabled || isLoading || isResending || isLocked}
                className={
                  resendDisabled || isLoading || isResending || isLocked
                    ? "cursor-not-allowed text-gray-400"
                    : "text-foreground hover:text-primary font-medium underline"
                }
              >
                {isResending ? t("sending") : t("sendAgain")}
              </button>
            </p>
            {resendDisabled && countdown > 0 && (
              <p className="text-primary mt-2 text-sm">
                <span className="font-medium">{t("canResendCodeIn")} </span>
                <span className="font-bold">
                  {String(Math.floor(countdown / 60)).padStart(2, "0")}:
                  {String(countdown % 60).padStart(2, "0")}
                </span>
              </p>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}