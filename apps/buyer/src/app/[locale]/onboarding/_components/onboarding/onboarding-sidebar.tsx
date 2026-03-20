"use client";

import { cn } from "@cf/ui";
import { IconInfoSmall } from "@tabler/icons-react";
import { Check } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { useOnboardingStore } from "@/lib/stores/onboarding-store";

function getOnboardingSteps(t: any) {
  return [
    {
      index: 1,
      title: t("buyerOnboarding.sidebar.basicInformation"),
      children: [
        {
          title: t("buyerOnboarding.sidebar.organizationInformation"),
          href: "/onboarding/basic-information/organisation-information",
        },
        {
          title: t("buyerOnboarding.sidebar.cropInterest"),
          href: "/onboarding/basic-information/crop-interest",
        },
      ],
    },
    {
      index: 2,
      title: t("buyerOnboarding.sidebar.companyDocuments"),
      children: [
        {
          title: t("buyerOnboarding.sidebar.corporateIdentity"),
          href: "/onboarding/company-documents/corporate-identity",
        },
        {
          title: t("buyerOnboarding.sidebar.authorizedRepresentative"),
          href: "/onboarding/company-documents/authorized-representative",
        },
        {
          title: t("buyerOnboarding.sidebar.financialStanding"),
          href: "/onboarding/company-documents/financial-standing",
        },
      ],
    },
    {
      index: 3,
      title: t("buyerOnboarding.sidebar.reviewAndSubmit"),
      href: "/onboarding/review",
    },
  ];
}

export function OnboardingSidebar() {
  const pathname = usePathname();
  const t = useTranslations() as any;
  const onboardingSteps = useMemo(() => getOnboardingSteps(t), [t]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [visitedChildren, setVisitedChildren] = useState<
    Record<number, string[]>
  >({});

  const {
    isOrganisationInformationComplete,
    isCropInterestComplete,
    isCorporateIdentityComplete,
    isAuthorizedRepresentativeComplete,
    isFinancialStandingComplete,
    attemptedAuthorizedRepresentative,
    attemptedFinancialStanding,
    skippedAuthorizedRepresentative,
    skippedFinancialStanding,
  } = useOnboardingStore();

  // Completion map; for AR and Financial, only consider incomplete if the step was attempted/skipped
  const childCompletionByHref: Record<string, boolean | null> = {
    "/onboarding/basic-information/organisation-information":
      isOrganisationInformationComplete(),
    "/onboarding/basic-information/crop-interest": isCropInterestComplete(),
    "/onboarding/company-documents/corporate-identity":
      isCorporateIdentityComplete(),
    "/onboarding/company-documents/authorized-representative":
      skippedAuthorizedRepresentative
        ? null
        : attemptedAuthorizedRepresentative
          ? isAuthorizedRepresentativeComplete()
          : null,
    "/onboarding/company-documents/financial-standing": skippedFinancialStanding
      ? null
      : attemptedFinancialStanding
        ? isFinancialStandingComplete()
        : null,
  };

  useEffect(() => {
    // Determine current step based on pathname
    let newStep = 1;
    if (pathname.includes("/onboarding/basic-information")) {
      newStep = 1;
    } else if (pathname.includes("/onboarding/company-documents")) {
      newStep = 2;
    } else if (pathname.includes("/onboarding/review")) {
      newStep = 3;
    }
    setCurrentStep(newStep);

    // Track visited children
    const currentStepData = onboardingSteps.find(
      (step) => step.index === newStep,
    );
    if (currentStepData?.children) {
      const currentChildIndex = currentStepData.children.findIndex((child) =>
        pathname.includes(child.href),
      );

      if (currentChildIndex >= 0) {
        // Mark all children up to and including the current one as visited
        const visitedChildHrefs = currentStepData.children
          .slice(0, currentChildIndex + 1)
          .map((child) => child.href);

        setVisitedChildren((prev) => ({
          ...prev,
          [newStep]: visitedChildHrefs,
        }));
      }
    }
  }, [pathname, onboardingSteps]);

  return (
    <div className="sticky top-0 hidden h-screen space-y-10 p-8 lg:col-span-4 lg:block">
      <h4 className="text-2xl font-bold">Completing your onboarding</h4>
      <div className="flex">
        <div className="rounded-full bg-[#F5F5F5] p-2">
          {onboardingSteps.map((step, index) => {
            const isActive = currentStep === step.index;
            const isLastStep = index === onboardingSteps.length - 1;
            const hasIncompleteChild = step.children?.some((child) => {
              const isTargeted =
                child.href ===
                  "/onboarding/company-documents/authorized-representative" ||
                child.href ===
                  "/onboarding/company-documents/financial-standing";
              const status = childCompletionByHref[child.href];
              // Do not mark as incomplete if the step was explicitly skipped
              const isSkipped =
                (child.href ===
                  "/onboarding/company-documents/authorized-representative" &&
                  skippedAuthorizedRepresentative) ||
                (child.href ===
                  "/onboarding/company-documents/financial-standing" &&
                  skippedFinancialStanding);
              return isTargeted && status === false && !isSkipped;
            });

            return (
              <div
                key={step.index}
                className={cn("flex flex-col items-center", {
                  "mb-8": !isLastStep,
                })}
              >
                <div className="flex size-7 items-center justify-center">
                  <div
                    className={cn(
                      "z-10 flex size-7 items-center justify-center rounded-full text-sm",
                      {
                        "bg-[hsl(var(--error))] text-white":
                          step.index < currentStep && hasIncompleteChild,
                        "bg-[hsl(var(--success))] text-white":
                          step.index < currentStep && !hasIncompleteChild,
                        "bg-[#161D1D] text-[#F4FBFB]":
                          step.index === currentStep,
                        "bg-[#586665] text-[#F4FBFB]": step.index > currentStep,
                      },
                    )}
                  >
                    {step.index < currentStep ? (
                      hasIncompleteChild ? (
                        <IconInfoSmall className="size-4" />
                      ) : (
                        <Check className="size-4" />
                      )
                    ) : (
                      step.index
                    )}
                  </div>
                </div>
                {(isActive || step.index < currentStep) && step.children && (
                  <div className="mt-6 flex flex-col items-center space-y-6">
                    {step.children.map((child) => {
                      const isChildActive = pathname.includes(child.href);
                      const isChildVisited = visitedChildren[
                        step.index
                      ]?.includes(child.href);
                      const shouldShowActiveColor =
                        step.index < currentStep ||
                        isChildActive ||
                        isChildVisited;
                      return (
                        <div key={child.href} className="flex h-5 items-center">
                          <div
                            className={cn(
                              "size-2 rounded-full",
                              shouldShowActiveColor
                                ? "bg-[#00554A]"
                                : "bg-[#586665]",
                            )}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="ml-4 mt-2">
          {onboardingSteps.map((step, index) => {
            const isActive = currentStep === step.index;
            const isLastStep = index === onboardingSteps.length - 1;
            const isStepActiveForLink =
              step.href && pathname.includes(step.href);
            const hasIncompleteChild = step.children?.some((child) => {
              const isTargeted =
                child.href ===
                  "/onboarding/company-documents/authorized-representative" ||
                child.href ===
                  "/onboarding/company-documents/financial-standing";
              const isSkipped =
                (child.href ===
                  "/onboarding/company-documents/authorized-representative" &&
                  skippedAuthorizedRepresentative) ||
                (child.href ===
                  "/onboarding/company-documents/financial-standing" &&
                  skippedFinancialStanding);
              return (
                isTargeted &&
                childCompletionByHref[child.href] === false &&
                !isSkipped
              );
            });

            return (
              <div
                key={step.index}
                className={cn("flex flex-col", { "mb-8": !isLastStep })}
              >
                <div className="flex h-7 items-center">
                  <h5
                    className={cn("text-base", {
                      "font-bold": step.index <= currentStep,
                    })}
                  >
                    <span
                      className={cn({
                        "font-semibold text-[#161D1D]": isStepActiveForLink,
                        "text-[hsl(var(--error))]": hasIncompleteChild,
                      })}
                    >
                      {step.title}
                    </span>
                  </h5>
                </div>

                {(isActive || step.index < currentStep) && step.children && (
                  <div className="mt-6 space-y-6">
                    {step.children.map((child) => {
                      const isChildActive = pathname.includes(child.href);
                      const isChildVisited = visitedChildren[
                        step.index
                      ]?.includes(child.href);
                      const isStepPassed = step.index < currentStep;
                      const isChildComplete = childCompletionByHref[child.href];
                      const isTargeted =
                        child.href ===
                          "/onboarding/company-documents/authorized-representative" ||
                        child.href ===
                          "/onboarding/company-documents/financial-standing";
                      const isSkipped =
                        (child.href ===
                          "/onboarding/company-documents/authorized-representative" &&
                          skippedAuthorizedRepresentative) ||
                        (child.href ===
                          "/onboarding/company-documents/financial-standing" &&
                          skippedFinancialStanding);
                      return (
                        <div key={child.href} className="flex h-5 items-center">
                          <span
                            className={cn("text-sm", {
                              "font-semibold text-[#00554A]": isChildActive,
                              "text-[#161D1D]":
                                !isChildActive &&
                                (isChildVisited || isStepPassed),
                              "text-gray-500":
                                !isChildActive &&
                                !isChildVisited &&
                                !isStepPassed,
                              // Only show incomplete red for targeted pages after attempt
                              "text-[hsl(var(--error))]":
                                isTargeted &&
                                isChildComplete === false &&
                                !isSkipped,
                            })}
                          >
                            {child.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
