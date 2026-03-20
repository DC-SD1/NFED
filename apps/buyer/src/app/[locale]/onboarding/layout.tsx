"use client";

import { Button } from "@cf/ui";
import { IconX } from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { OnboardingSidebar } from "@/app/[locale]/onboarding/_components/onboarding/onboarding-sidebar";
import { KycResubmissionTrackerProvider } from "@/lib/hooks/use-kyc-resubmission-tracker";
import { useKycStatus } from "@/lib/hooks/use-kyc-status";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";

import { ConfirmationDialog } from "./_components/onboarding/dialog/confirmation-dialog";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const {
    setAttemptedAuthorizedRepresentative,
    setAttemptedFinancialStanding,
    setSkippedAuthorizedRepresentative,
    setSkippedFinancialStanding,
    canSkipAuthorizedRepresentative,
    canSkipFinancialStanding,
  } = useOnboardingStore();

  // Get KYC status to determine if skip button should be hidden
  const { needsResubmission, isStatus } = useKycStatus();
  // Check if we're on a nested onboarding route (not just /onboarding)
  const isNestedOnboardingRoute =
    pathname.split("/").filter(Boolean).length > 2;

  if (!isNestedOnboardingRoute) {
    // Just render the content without sidebar for root /onboarding page
    return <div>{children}</div>;
  }

  // Determine current step based on pathname (same logic as desktop sidebar)
  let currentStep = 1;
  if (pathname.includes("/onboarding/basic-information")) {
    currentStep = 1;
  } else if (pathname.includes("/onboarding/company-documents")) {
    currentStep = 2;
  } else if (pathname.includes("/onboarding/review")) {
    currentStep = 3;
  }

  // Extract locale from pathname
  const pathnameParts = pathname.split("/");
  const locale = pathnameParts[1] || "en"; // Default to 'en' if not found

  // Determine if skip button should be hidden or disabled
  const shouldHideSkipButton = needsResubmission() || isStatus("Rejected");

  const isSkipDisabled = pathname.includes(
    "/onboarding/company-documents/authorized-representative",
  )
    ? !canSkipAuthorizedRepresentative
    : pathname.includes("/onboarding/company-documents/financial-standing")
      ? !canSkipFinancialStanding
      : false;

  // Handle skip button click
  const handleSkip = () => {
    if (
      pathname.includes(
        "/onboarding/company-documents/authorized-representative",
      )
    ) {
      // Skip to financial standing
      setAttemptedAuthorizedRepresentative(true);
      setSkippedAuthorizedRepresentative(true);
      router.push(`/${locale}/onboarding/company-documents/financial-standing`);
    } else if (
      pathname.includes("/onboarding/company-documents/financial-standing")
    ) {
      // Skip to review
      setAttemptedFinancialStanding(true);
      setSkippedFinancialStanding(true);
      router.push(`/${locale}/onboarding/review`);
    }
    setIsConfirmationDialogOpen(false);
  };

  const resubmissionPage =
    pathname.includes("/onboarding/review/") &&
    pathname.split("/onboarding/review/")[1] &&
    pathname.split("/onboarding/review/")[1] !== "";

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-10">
      <OnboardingSidebar />
      <div className="block space-y-8 p-4 lg:hidden">
        <div className="flex items-center justify-between">
          <p className="whitespace-nowrap text-sm font-bold md:text-xl">
            {resubmissionPage
              ? "KYC Resubmission"
              : " Completing your onboarding"}
          </p>
          <div className="flex justify-end gap-4 lg:hidden">
            {(pathname.includes(
              "/onboarding/company-documents/authorized-representative",
            ) ||
              pathname.includes(
                "/onboarding/company-documents/financial-standing",
              )) &&
              !shouldHideSkipButton && (
                <div>
                  <Button
                    className="h-[42px] w-[56px] rounded-full bg-[#F5F5F5] font-semibold text-[hsl(var(--text-dark))] hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setIsConfirmationDialogOpen(true)}
                    disabled={isSkipDisabled}
                  >
                    Skip
                  </Button>
                </div>
              )}
            <div>
              <Button
                size="icon"
                className="rounded-full bg-[#F5F5F5] text-[hsl(var(--text-dark))] hover:bg-[#F5F5F5]"
                onClick={() => router.push(`/${locale}/home`)}
              >
                <IconX />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-2 w-full rounded-full ${
                step <= currentStep ? "bg-primary" : "border-2 bg-[#DDE4E4]"
              }`}
            />
          ))}
        </div>
      </div>
      <div className="col-span-1 p-4 lg:col-span-8 lg:p-8">
        <div className="fixed right-8 hidden justify-end gap-4 lg:flex">
          {(pathname.includes(
            "/onboarding/company-documents/authorized-representative",
          ) ||
            pathname.includes(
              "/onboarding/company-documents/financial-standing",
            )) &&
            !shouldHideSkipButton && (
              <div>
                <Button
                  className="h-[42px] w-[56px] rounded-full bg-[#F5F5F5] font-semibold text-[hsl(var(--text-dark))] hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setIsConfirmationDialogOpen(true)}
                  disabled={isSkipDisabled}
                >
                  Skip
                </Button>
              </div>
            )}
          <div>
            <Button
              size="icon"
              className="rounded-full bg-[#F5F5F5] text-[hsl(var(--text-dark))] hover:bg-[#F5F5F5]"
              onClick={() => router.push(`/${locale}/home`)}
            >
              <IconX />
            </Button>
          </div>
        </div>
        <ConfirmationDialog
          onConfirm={handleSkip}
          isOpen={isConfirmationDialogOpen}
          onClose={() => setIsConfirmationDialogOpen(false)}
        />
        <KycResubmissionTrackerProvider>
          {children}
        </KycResubmissionTrackerProvider>
      </div>
    </div>
  );
}
