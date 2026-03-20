"use client";

import { Card } from "@cf/ui/components/card";
import { toast } from "@cf/ui/components/sonner";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import mailIcon from "@/assets/images/mail.png";
import { OtpForm } from "@/components/forms/otp-form";
import { Logo } from "@/components/logo";
import { useSignUpStore } from "@/lib/stores/sign-up-store";

export default function OtpPage() {
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") || "signup") as
    | "signup"
    | "reset"
    | "verify";
  const [isMobile, setIsMobile] = useState(false);
  const email = searchParams.get("email")!;
  const t = useTranslations("auth");
  const tAlt = useTranslations("alt");
  const e = useTranslations("auth.errors");
  const { isLoaded: suLoaded, signUp } = useSignUp();
  const { isLoaded: siLoaded, signIn } = useSignIn();
  const { setBasicInfo, setIsInvite } = useSignUpStore();

  const [sentOnce, setSentOnce] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Early return if no email or already sent
    if (!email || sentOnce) return;

    // Check if Clerk is loaded based on mode
    const isClerkReady =
      mode === "reset" ? siLoaded && signIn : suLoaded && signUp;

    // Only proceed if Clerk is ready
    if (!isClerkReady) return;

    const triggerOtp = async () => {
      try {
        setBasicInfo({ email });
        setIsInvite(true);
        if (mode === "reset") {
          if (!signIn) return; // Type guard for TypeScript
          const signInAttempt = await signIn.create({
            identifier: email,
          });

          const resetPasswordFactor = signInAttempt.supportedFirstFactors?.find(
            (factor) => factor.strategy === "reset_password_email_code",
          ) as
            | { strategy: "reset_password_email_code"; emailAddressId: string }
            | undefined;

          if (!resetPasswordFactor) {
            toast.error(e("email_not_found"));
            return;
          }
          await signIn.prepareFirstFactor({
            strategy: "reset_password_email_code",
            emailAddressId: resetPasswordFactor.emailAddressId,
          });
        } else if (mode === "verify") {
          if (!signUp) return; // Type guard for TypeScript
          await signUp.create({ emailAddress: email });
          await signUp.prepareEmailAddressVerification({
            strategy: "email_code",
          });
        } else {
          if (!signUp) return; // Type guard for TypeScript
          await signUp.create({ emailAddress: email });
          await signUp.prepareEmailAddressVerification({
            strategy: "email_code",
          });
        }

        toast.success(t("otpSent"));
        setSentOnce(true);
      } catch (err) {
        setBasicInfo({});
        setIsInvite(false);
        toast.error(t("otpError"));
      }
    };

    void triggerOtp();
  }, [
    mode,
    email,
    suLoaded,
    signUp,
    siLoaded,
    signIn,
    setBasicInfo,
    sentOnce,
    setIsInvite,
    t,
    e,
  ]);

  const getPageTitle = () => {
    switch (mode) {
      case "reset":
        return t("resetPasswordVerification");
      case "verify":
        return t("loginVerification");
      default:
        return t("otpVerification");
    }
  };

  const content = (
    <>
      <div className="space-y-6">
        {/* Mail icon */}
        <div className="flex justify-center">
          <Image
            src={mailIcon}
            alt={tAlt("mailIcon")}
            width={120}
            height={120}
            className="mb-4"
          />
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            {getPageTitle()}
          </h1>
        </div>

        <OtpForm mode={mode} />
      </div>
    </>
  );

  // Mobile and tablet layout with green background and card
  // if (isMobile) {
  //   return (
  //     <div className="flex flex-col justify-center items-center p-4 min-h-screen">
  //       {/* Logo for mobile */}
  //       <Logo useAlternativeLogo={true} />

  //       <Card className="p-6 w-full max-w-sm bg-white rounded-3xl border-0 shadow-lg">
  //         {content}
  //       </Card>
  //     </div>
  //   );
  // }

  // Mobile and tablet layout
  if (isMobile) {
    return (
      <div className="flex flex-col p-4">
        {/* Logo for mobile */}
        <Logo useAlternativeLogo={true} />

        <Card className="w-full max-w-sm rounded-3xl border-0 bg-white p-6 shadow-lg md:max-w-lg">
          {content}
        </Card>
      </div>
    );
  }

  // Desktop layout (uses auth layout)
  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: "calc(100svh - 100px)" }}
    >
      {content}
    </div>
  );
}
