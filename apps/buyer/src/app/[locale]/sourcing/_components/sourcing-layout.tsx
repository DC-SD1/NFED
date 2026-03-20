"use client";

import { useRouter } from "@bprogress/next/app";
import { Button, cn, Popover, PopoverContent, PopoverTrigger } from "@cf/ui";
import { IconCheck, IconDotsVertical, IconX } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { useEffect } from "react";

import { useSourcingStore } from "@/lib/stores/sourcing-store";

import CancelSourcingDialog from "./cancel-sourcing-dialog";
import DeclineOfferDialog from "./decline-offer-dialog";
import { EstimatorItemCard } from "./estimator-item-card";
import GenerateContractDialog from "./generate-contract-dialog";
import RenegotiateOfferDialog from "./renegotiate-offer-dialog";
import SaveAndExitDialog from "./save-and-exit-dialog";
import { SubmitForProcessingDialog } from "./submit-for-processing-dialog";

/**
 * SourcingNavigation component renders the top navigation bar for sourcing pages
 *
 * @returns JSX element representing the sourcing navigation bar
 *
 * @example
 * ```tsx
 * <SourcingNavigation />
 * ```
 */
export function SourcingNavigation() {
  const { currentStep: _currentStep, steps: _steps } = useSourcingStore();

  const t = useTranslations();

  const router = useRouter();
  const pathname = usePathname();
  const isOfferDeclinedPage = pathname.includes("/offer-declined");

  return (
    <div className="mx-auto flex h-[72px] max-w-screen-xl items-center justify-between">
      <p className="text-[24px] font-bold">{t("sourcing.navigation.title")}</p>

      {!isOfferDeclinedPage && (
        <Popover>
          <PopoverTrigger asChild>
            <Button className="flex-items-center h-[40px] w-[40px] justify-center rounded-full bg-[#F5F5F5] hover:bg-[#F5F5F5] focus:bg-[#F5F5F5]">
              <IconDotsVertical className="!size-5 text-[#161D1D]" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            align="end"
            className="flex w-fit flex-col items-start p-0"
          >
            <CancelSourcingDialog />

            <SaveAndExitDialog />
          </PopoverContent>
        </Popover>
      )}

      {isOfferDeclinedPage && (
        <Button
          onClick={() => {
            router.push("/home");
          }}
          className="flex-items-center h-[40px] w-[40px] justify-center rounded-full bg-[#F5F5F5] hover:bg-[#F5F5F5] focus:bg-[#F5F5F5]"
        >
          <IconX className="!size-5 text-[#161D1D]" />
        </Button>
      )}
    </div>
  );
}

/**
 * Navigation item interface for the sourcing sidebar
 */
interface NavigationItem {
  /** The display label for the navigation item */
  label: string;
  /** The href/link destination for the navigation item */
  href: string;
}

/**
 * Props interface for the SourcingSidebar component
 */
interface SourcingSidebarProps {
  /** Array of navigation items to display in the sidebar */
  navItems: NavigationItem[];
}

/**
 * Props interface for the SourcingContentLayout component
 */
interface SourcingContentLayoutProps {
  /** Child components to be rendered within the layout */
  children: React.ReactNode;
}

/**
 * SourcingSidebar component renders a vertical navigation sidebar with step indicators
 *
 * @param props - The component props
 * @param props.navItems - Array of navigation items with labels and hrefs
 * @returns JSX element representing the sourcing sidebar
 *
 * @example
 * ```tsx
 * const navItems = [
 *   { label: 'Step 1', href: '/sourcing/step1' },
 *   { label: 'Step 2', href: '/sourcing/step2' }
 * ];
 *
 * <SourcingSidebar navItems={navItems} />
 * ```
 */
export function SourcingSidebar({ navItems }: SourcingSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentStep,
    steps: _steps,
    setCurrentStep,
    markStepVisited,
    getStepStatus,
    setStepsFromNavItems,
  } = useSourcingStore();

  // Initialize/replace steps in the sourcing store from the provided nav items
  useEffect(() => {
    if (navItems && navItems.length > 0) {
      setStepsFromNavItems(navItems);
    }
  }, [navItems, setStepsFromNavItems]);

  // Determine current step based on pathname
  useEffect(() => {
    const currentStepIndex = navItems.findIndex((item) =>
      pathname.includes(item.href),
    );

    if (currentStepIndex !== -1) {
      setCurrentStep(currentStepIndex);
      // Mark current step as visited
      const currentItem = navItems[currentStepIndex];
      const stepId =
        currentItem.href.split("/").pop() ||
        currentItem.label.toLowerCase().replace(/\s+/g, "-");
      markStepVisited(stepId);
    }
  }, [pathname, navItems, setCurrentStep, markStepVisited]);

  return (
    <div className="h-[284px] w-full max-w-[288px]">
      <div className="flex items-center gap-4">
        <div className="flex h-[284px] w-[28px] flex-col items-center justify-between rounded-full bg-[#F5F5F5] py-1">
          {navItems.map((item, index) => {
            const stepId =
              item.href.split("/").pop() ||
              item.label.toLowerCase().replace(/\s+/g, "-");
            const stepStatus = getStepStatus(stepId);
            const isActive = index === currentStep;
            const isCompleted = stepStatus === "completed";

            // Determine background color based on status
            const bgColor = isCompleted
              ? "bg-[hsl(var(--success))]"
              : isActive
                ? "bg-[#161D1D]"
                : "bg-[#586665]";

            return (
              <div
                key={index}
                className={cn(
                  "flex size-[20px] items-center justify-center rounded-full text-xs text-[#F4FBFB]",
                  bgColor,
                )}
              >
                {isCompleted ? <IconCheck className="size-3" /> : index + 1}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-[18.5px]">
          {navItems.map((item, index) => {
            const stepId =
              item.href.split("/").pop() ||
              item.label.toLowerCase().replace(/\s+/g, "-");
            const stepStatus = getStepStatus(stepId);
            const isActive = index === currentStep;
            const isCompleted = stepStatus === "completed";

            // Determine text color and weight based on status
            const textColor = isCompleted
              ? "text-[#161D1D] font-bold"
              : isActive
                ? "text-[#161D1D] font-bold"
                : "text-[#586665]";

            return (
              <button
                key={item.href}
                type="button"
                disabled={!isCompleted}
                aria-disabled={!isCompleted}
                onClick={() => {
                  if (isCompleted) router.push(item.href);
                }}
                className={cn(
                  textColor,
                  "text-left",
                  isCompleted
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-60",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Helper function to format incoterms for display
 */
function formatIncoterms(incoterms?: string): string {
  if (!incoterms) return "";

  const incotermMap: Record<string, string> = {
    exw: "EXW",
    fca: "FCA",
    fas: "FAS",
    fob: "FOB",
    cfr: "CFR",
    cif: "CIF",
    cpt: "CPT",
    cip: "CIP",
    dap: "DAP",
    dpu: "DPU",
    ddp: "DDP",
  };

  return incotermMap[incoterms.toLowerCase()] || incoterms.toUpperCase();
}

/**
 * Helper function to format shipping method for display
 */
function formatShippingMethod(shippingMethod?: string): string {
  if (!shippingMethod) return "";

  const methodMap: Record<string, string> = {
    air: "Air",
    land: "Land",
    sea: "Sea",
  };

  return methodMap[shippingMethod.toLowerCase()] || shippingMethod;
}

/**
 * Helper function to get freight price subtitle
 */
function getFreightPriceSubtitle(
  shippingMethod?: string,
  incoterms?: string,
  country?: string,
): string {
  if (!shippingMethod || !incoterms || !country) {
    return "Select shipping method";
  }

  const formattedIncoterms = formatIncoterms(incoterms);
  return `${formattedIncoterms}, ${country}`;
}

/**
 * Helper function to get freight price quantity
 */
function getFreightPriceQuantity(shippingMethod?: string): string {
  if (!shippingMethod) {
    return "";
  }

  return formatShippingMethod(shippingMethod);
}

/**
 * SourcingEstimator component renders a placeholder area for estimation tools
 *
 * @returns JSX element representing the sourcing estimator placeholder
 *
 * @example
 * ```tsx
 * <SourcingEstimator />
 * ```
 */
export function SourcingEstimator() {
  const t = useTranslations();
  const { shippingMethod, currentStep } = useSourcingStore();

  // Show freight price card from shipping method step onwards (step index 1 and beyond)
  const shouldShowFreightPrice = currentStep >= 1;

  // Determine if freight price should show as pending
  // Only show pending on the shipping method step itself (step 1) if data is incomplete
  // On subsequent steps (step 2+), always show the completed data if available
  const isFreightPricePending =
    currentStep === 1 &&
    (!shippingMethod?.shippingMethod ||
      !shippingMethod?.incoterms ||
      !shippingMethod?.country);

  // Get freight price display values
  const freightPriceSubtitle = getFreightPriceSubtitle(
    shippingMethod?.shippingMethod,
    shippingMethod?.incoterms,
    shippingMethod?.country,
  );

  const freightPriceQuantity = getFreightPriceQuantity(
    shippingMethod?.shippingMethod,
  );

  return (
    <div className="h-[738px] w-full max-w-[400px]">
      <div className="relative size-full h-full space-y-4 rounded-xl bg-[#F5F5F5] p-4">
        <div className="space-y-2">
          <p className="text-[24px] font-bold">
            {t("sourcing.estimator.title")}
          </p>
          <p className="text-sm">{t("sourcing.estimator.description")}</p>
        </div>

        {/* <div className="flex h-full flex-col items-center justify-center">
          <p className="text-sm text-[#586665]">
            {t("sourcing.estimator.placeholder")}
          </p>
        </div> */}

        <div className="space-y-2">
          <EstimatorItemCard
            title="Farmgate price"
            subtitle="Unit/Qty"
            price="GHS 60,000"
            quantity="120MT"
          />
          {/* <EstimatorItemCard
            title="Warehouse services"
            subtitle="Paragraph"
            price="GHS 1,800"
            quantity="Paragraph"
          /> */}
          <EstimatorItemCard
            title="Packaging cost"
            subtitle="50KG PP bags"
            price="GHS 800"
            quantity="12 bags"
          />
          <EstimatorItemCard
            title="Testing cost"
            subtitle="Unit/Qty"
            price="GHS 1,000"
            quantity="4 tests"
          />
          <EstimatorItemCard title="Local delivery" price="GHS 1,000" />
          <EstimatorItemCard title="Port charges" price="GHS 1,000" />
          {shouldShowFreightPrice && (
            <EstimatorItemCard
              title="Freight price"
              subtitle={freightPriceSubtitle}
              price={isFreightPricePending ? "" : "GHS 6,000"}
              quantity={freightPriceQuantity}
              isPending={isFreightPricePending}
            />
          )}

          {/* <EstimatorItemCard
            title="Payment fees"
            subtitle="Cash against document "
            price="GHS 600"
            quantity="Full payment"
          /> */}

          <div className="absolute bottom-4 left-4 right-4 flex h-[56px] items-center justify-between rounded-xl bg-white p-4">
            <p className="text-[#161D1D]">Current estimate</p>
            <p className="font-bold text-[#161D1D]">GHS 68,900.00</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * SourcingContentLayout component provides the main content container for sourcing pages
 *
 * @param props - The component props
 * @param props.children - Child components to be rendered within the layout
 * @returns JSX element representing the sourcing content layout container
 *
 * @example
 * ```tsx
 * <SourcingContentLayout>
 *   <YourContent />
 * </SourcingContentLayout>
 * ```
 */
export function SourcingContentLayout({
  children,
}: SourcingContentLayoutProps) {
  const { currentStep, steps } = useSourcingStore();

  const hasPendingChanges = steps?.[currentStep]
    ? !steps[currentStep].isCompleted // For crop specification (quantity) - there is an auto-save, so this become true.
    : false;

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // if (!hasPendingChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasPendingChanges]);

  return <div className="w-full min-w-[536px]">{children}</div>;
}

/**
 * SourcingFooter component renders a fixed bottom footer with continue button
 *
 * @returns JSX element representing the sourcing footer
 *
 * @example
 * ```tsx
 * <SourcingFooter />
 * ```
 */
export function SourcingFooter() {
  const { currentStep, steps, canContinueCurrentStep, saveAndContinue } =
    useSourcingStore();
  const t = useTranslations();
  const router = useRouter();

  const pathname = usePathname();
  const isSourcingReviewPage = pathname.includes("/sourcing-review");
  const isOfferReviewPage = pathname.includes("/offer-review");

  // Handle continue button click
  const handleContinue = async () => {
    try {
      // Save current step data and continue
      const success = await saveAndContinue();

      if (success && currentStep < steps.length - 1) {
        const nextStep = steps[currentStep + 1];
        if (nextStep) {
          router.push(nextStep.href);
        }
      }
    } catch (error) {
      console.error("Error saving step data:", error);
      // Could show error toast here
    }
  };

  // Handle back button click - navigate to previous step
  const handleBack = () => {
    if (currentStep > 0) {
      const previousStep = steps[currentStep - 1];
      if (previousStep) {
        router.push(previousStep.href);
      }
    }
  };

  // Show back button only after the first step (currentStep > 0)
  const showBackButton = currentStep > 0;

  return (
    <footer className="fixed inset-x-0 bottom-0 flex h-[116px] w-full items-center border-t bg-white">
      {!isOfferReviewPage && (
        <div className="mx-auto flex w-full max-w-screen-xl items-center justify-end gap-4">
          {showBackButton && (
            <Button
              size="lg"
              className="h-[56px] w-[220px] rounded-xl bg-[#F5F5F5] font-bold text-[hsl(var(--text-dark))] hover:bg-[#F5F5F5] hover:text-[hsl(var(--text-dark))] focus:bg-[#F5F5F5] focus:text-[hsl(var(--text-dark))]"
              onClick={handleBack}
            >
              {t("sourcing.footer.back")}
            </Button>
          )}

          {isSourcingReviewPage && (
            <SubmitForProcessingDialog onSuccess={handleContinue} />
          )}

          {!isSourcingReviewPage && (
            <Button
              size="lg"
              className="h-[56px] w-[220px] rounded-xl font-bold"
              disabled={!canContinueCurrentStep()}
              onClick={handleContinue}
            >
              {t("sourcing.footer.continue")}
            </Button>
          )}
        </div>
      )}

      {isOfferReviewPage && (
        <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between gap-4">
          <DeclineOfferDialog />

          <div className="mx-auto flex w-full max-w-screen-xl items-center justify-end gap-4">
            <RenegotiateOfferDialog />

            <GenerateContractDialog />
          </div>
        </div>
      )}
    </footer>
  );
}

/**
 * Compound component pattern for SourcingSidebar
 * Provides access to related components through dot notation
 */
const SourcingSidebarCompound = SourcingSidebar as typeof SourcingSidebar & {
  /** The main sidebar component */
  Sidebar: typeof SourcingSidebar;
  /** The estimator component */
  Estimator: typeof SourcingEstimator;
  /** The content layout component */
  Layout: typeof SourcingContentLayout;
  /** The navigation component */
  Navigation: typeof SourcingNavigation;
  /** The footer component */
  Footer: typeof SourcingFooter;
};

// Attach compound components
SourcingSidebarCompound.Sidebar = SourcingSidebar;
SourcingSidebarCompound.Estimator = SourcingEstimator;
SourcingSidebarCompound.Layout = SourcingContentLayout;
SourcingSidebarCompound.Navigation = SourcingNavigation;
SourcingSidebarCompound.Footer = SourcingFooter;

export default SourcingSidebarCompound;
