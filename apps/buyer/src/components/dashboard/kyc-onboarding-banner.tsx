"use client";

import { Button } from "@cf/ui";
import { IconArrowRight, IconHelp } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import * as React from "react";

import { useKycStatus } from "@/lib/hooks/use-kyc-status";
import { cn } from "@/lib/utils";

interface KycOnboardingBannerProps {
  className?: string;
}

export function KycOnboardingBanner({ className }: KycOnboardingBannerProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const {
    isPending,
    isAccepted,
    isDraft,
    isSubmitted,
    needsResubmission,
    kycId,
  } = useKycStatus();

  // Extract locale from pathname (assumes /[locale]/...)
  const locale = React.useMemo(() => {
    const parts = pathname.split("/");
    return parts[1] || "en";
  }, [pathname]);

  // Show loading skeleton while API is loading
  if (isPending) {
    return (
      <div
        className={cn(
          "flex w-full flex-col justify-between gap-4 rounded-2xl p-6 md:p-7 lg:h-[96px] lg:flex-row lg:items-center lg:gap-0 lg:p-8",
          "bg-gradient-to-l from-[hsl(var(--text-dark))] via-[#00554A] to-[#001F29]",
          className,
        )}
      >
        <div className="w-full lg:w-[654px]">
          <div className="h-4 w-3/4 animate-pulse rounded bg-white/20"></div>
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-white/20"></div>
        </div>
        <div className="w-full md:w-max lg:w-[232px]">
          <div className="h-[48px] w-full animate-pulse rounded-xl bg-white/20"></div>
        </div>
      </div>
    );
  }

  // If status is Accepted, don't show the banner
  if (isAccepted()) {
    return null;
  }

  // Determine banner content based on API status
  let bannerConfig = {
    message: "",
    buttonText: "",
    href: "",
    showCompleteTheme: false,
    showResubmitTheme: false,
  };

  if (isDraft()) {
    bannerConfig = {
      message: t("kycBanner.draftMessage"),
      buttonText: t("kycBanner.continueOnboarding"),
      href: `/${locale}/onboarding/review`,
      showCompleteTheme: false,
      showResubmitTheme: false,
    };
  } else if (isSubmitted()) {
    bannerConfig = {
      message: t("kycBanner.underReview"),
      buttonText: t("kycBanner.contactSupport"),
      href: "mailto:support@completefarmer.com",
      showCompleteTheme: true,
      showResubmitTheme: false,
    };
  } else if (needsResubmission()) {
    bannerConfig = {
      message: t("kycBanner.resubmissionRequired"),
      buttonText: t("kycBanner.updateDocuments"),
      href: kycId
        ? `/${locale}/onboarding/review/${kycId}`
        : `/${locale}/onboarding/review`,
      showCompleteTheme: false,
      showResubmitTheme: true,
    };
  } else {
    // Show a strong default i18n message if there's truly no KYC status recognized
    bannerConfig = {
      message: t("kycBanner.noStatusMessage"),
      buttonText: t("kycBanner.noStatusButton"),
      href: `/${locale}/onboarding`,
      showCompleteTheme: false,
      showResubmitTheme: false,
    };
  }

  const { message, buttonText, href, showCompleteTheme, showResubmitTheme } =
    bannerConfig;

  return (
    <div
      className={cn(
        "flex w-full flex-col justify-between gap-4 rounded-2xl p-6 md:p-7 lg:h-[96px] lg:flex-row lg:items-center lg:gap-0 lg:p-8",
        {
          "bg-gradient-to-l from-[#8AD0EE] to-[#81D5CE] text-[#161D1D]":
            showCompleteTheme,
          "bg-gradient-to-l from-[#4C3600] to-[#995917] text-white":
            showResubmitTheme,
          "bg-gradient-to-l from-[hsl(var(--text-dark))] via-[#00554A] to-[#001F29] text-white":
            !showCompleteTheme && !showResubmitTheme,
        },
        className,
      )}
    >
      <div className="w-full lg:w-[654px]">
        <p>{message}</p>
      </div>

      {!showCompleteTheme ? (
        <div className="w-full md:w-max lg:w-[232px]">
          <Button
            className={cn(
              "h-[48px] w-full rounded-xl",
              needsResubmission()
                ? "bg-[#F5F5F5] font-bold text-[hsl(var(--text-dark))] hover:bg-[#F5F5F5]"
                : "",
            )}
            asChild
          >
            <Link href={href}>
              {buttonText}{" "}
              {!needsResubmission() ? (
                <IconArrowRight className="!size-5 rounded-3xl" />
              ) : null}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="w-full md:w-max lg:w-[232px]">
          <Button
            className="h-[48px] w-full rounded-xl bg-[#F5F5F5] font-bold text-[hsl(var(--text-dark))] hover:bg-[#F5F5F5]"
            asChild
          >
            <Link href={href}>
              <IconHelp className="!size-5 rounded-3xl" />
              {buttonText}
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
