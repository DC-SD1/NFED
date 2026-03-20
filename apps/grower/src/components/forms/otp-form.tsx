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
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { MAX_OTP_ATTEMPTS } from "@/lib/constants/auth";
import { OTP_COUNTDOWN_SECONDS } from "@/lib/constants/wallet";
import { useSignUpVerification } from "@/lib/hooks/use-sign-up-verification";
import { type OtpFormData, otpSchema } from "@/lib/schemas/sign-up";
import { useSignUpStore } from "@/lib/stores/sign-up-store";
import { maskEmail } from "@/lib/utils/string-helpers";
import { showWarningToast } from "@/lib/utils/toast";

interface OtpAction {
  verify: (otp: string) => Promise<void>;
  resend?: (successMessage?: string) => Promise<void>;
}

interface OtpFormProps {
  mode?: "signup" | "reset" | "verify";
  email?: string;
  action?: OtpAction;
  isExternalLoading?: boolean;
  isResendingExternal?: boolean;
}

const OTP_LENGTH = 6;

export function OtpForm({
  mode = "signup",
  email: customEmail,
  action,
  isExternalLoading = false,
  isResendingExternal = false,
}: OtpFormProps) {
  const t = useTranslations("auth");
  const basicInfo = useSignUpStore((state) => state.basicInfo);

  const clerkVerification = useSignUpVerification({ mode });

  const [customState, setCustomState] = useState({
    isLoading: false,
    isResending: false,
    attemptCount: 0,
    isLocked: false,
    countdown: 0,
    resendDisabled: false,
  });

  const [isResending, setIsResending] = useState(false);

  const form = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const RESEND_INTERVAL = 90; // 1 minute 30 seconds
  const [remaining, setRemaining] = useState(RESEND_INTERVAL);
  const [isRunning, setIsRunning] = useState(true);
  const [renderTimer, setRenderTimer] = useState(true);

  useEffect(() => {
    if (!isRunning || remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, remaining]);

  // Format time as mm:ss
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const isCustomMode = !!action;
  const state = isCustomMode ? customState : clerkVerification;

  const isAnyLoading =
    state.isLoading || isExternalLoading || isResendingExternal;

  const email = customEmail || basicInfo.email || "user@example.com";
  const maskedEmail = maskEmail(email);

  // Calculate remaining attempts
  const remainingAttempts = MAX_OTP_ATTEMPTS - state.attemptCount;

  // Show warning toast when attempts are low
  React.useEffect(() => {
    if (remainingAttempts === 2 && state.attemptCount > 0) {
      showWarningToast(t("otpAttemptsWarning", { attempts: 2 }));
    } else if (remainingAttempts === 1 && state.attemptCount > 0) {
      showWarningToast(t("otpLastAttemptWarning"));
    }
  }, [state.attemptCount, remainingAttempts, t]);

  // The error toast for lockout is handled in the useSignUpVerification hook

  const handleSubmit = async (data: OtpFormData) => {
    if (isCustomMode && action) {
      setCustomState((prev) => ({ ...prev, isLoading: true }));
      try {
        await action.verify(data.otp);
        setCustomState((prev) => ({
          ...prev,
          attemptCount: 0,
          isLoading: false,
        }));
      } catch (error) {
        const newAttemptCount = customState.attemptCount + 1;
        const isLocked = newAttemptCount >= MAX_OTP_ATTEMPTS;

        setCustomState((prev) => ({
          ...prev,
          attemptCount: newAttemptCount,
          isLocked,
          isLoading: false,
        }));

        if (isLocked) {
          console.error("OTP attempts exceeded");
        }
      }
    } else {
      await clerkVerification.verifyAndRegister(data.otp);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setRenderTimer(false);

    try {
      if (isCustomMode && action?.resend) {
        setCustomState((prev) => ({ ...prev, isResending: true }));
        await action.resend(t("otpResendSuccess"));

        setCustomState((prev) => ({
          ...prev,
          countdown: OTP_COUNTDOWN_SECONDS,
          resendDisabled: true,
          isResending: false,
        }));

        const timer = setInterval(() => {
          setCustomState((prev) => {
            const newCountdown = prev.countdown - 1;
            if (newCountdown <= 0) {
              clearInterval(timer);
              return { ...prev, countdown: 0, resendDisabled: false };
            }
            return { ...prev, countdown: newCountdown };
          });
        }, 1000);
      } else {
        await clerkVerification.resendCode(t("otpResendSuccess"));
      }
    } catch (error) {
      if (isCustomMode) {
        setCustomState((prev) => ({ ...prev, isResending: false }));
      }
    } finally {
      setIsResending(false);
      setIsRunning(false);
      setRemaining(RESEND_INTERVAL);
      setIsRunning(true);
    }
  };

  const getButtonText = () => {
    if (isExternalLoading) return "Updating...";
    if (isResendingExternal) return "Resending...";
    if (state.isLoading) return t("verifying");
    return t("apply");
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
                    disabled={isAnyLoading || state.isLocked}
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

        {(isCustomMode ? false : clerkVerification.isAwaitingRetry) && (
          <div className="text-destructive space-y-2 text-center text-sm">
            <p>We could not complete your registration. Please try again.</p>
            <Button
              type="button"
              variant="link"
              onClick={() => handleSubmit(form.getValues())}
              disabled={isAnyLoading}
              className="text-primary hover:text-primary/80"
            >
              Retry Registration
            </Button>
          </div>
        )}

        <div className="space-y-4">
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 h-12 w-full rounded-xl text-base font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={
              isAnyLoading ||
              form.watch("otp").length !== OTP_LENGTH ||
              state.isLocked
            }
          >
            <div className="flex items-center justify-center space-x-2">
              {isAnyLoading && (
                <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              )}
              <span>{getButtonText()}</span>
            </div>
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {t("didntReceiveOtp")}{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={
                  remaining > 0 ||
                  state.resendDisabled ||
                  isAnyLoading ||
                  isResending ||
                  state.isLocked ||
                  (isCustomMode && !action?.resend)
                }
                className={
                  remaining > 0 ||
                  state.resendDisabled ||
                  isAnyLoading ||
                  isResending ||
                  state.isLocked ||
                  (isCustomMode && !action?.resend)
                    ? "cursor-not-allowed text-gray-400"
                    : "text-foreground hover:text-primary font-medium underline"
                }
              >
                {isResending ? (
                  <span className="flex items-center justify-center space-x-1">
                    <div className="border-gray-dark size-3 animate-spin rounded-full border border-t-transparent"></div>
                    <span>{t("sending")}</span>
                  </span>
                ) : (
                  t("sendAgain")
                )}
              </button>
            </p>
            {state.resendDisabled && state.countdown > 0 && (
              <p className="text-primary mt-2 text-sm">
                <span className="font-medium">{t("canResendCodeIn")} </span>
                <span className="font-bold">
                  {String(Math.floor(state.countdown / 60)).padStart(2, "0")}:
                  {String(state.countdown % 60).padStart(2, "0")}
                </span>
              </p>
            )}
          </div>
        </div>
        {renderTimer && (
          <div className="w-full justify-center text-center">
            <p className="text-primary self-center font-bold">
              {formatTime(remaining)}
            </p>
          </div>
        )}
      </form>
    </Form>
  );
}
