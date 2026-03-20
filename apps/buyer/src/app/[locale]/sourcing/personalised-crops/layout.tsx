"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useMemo } from "react";

import SourcingSidebarCompound from "../_components/sourcing-layout";

export default function SourcingLayout(
  props: LayoutProps<"/[locale]/sourcing/personalised-crops">,
) {
  const t = useTranslations();

  const navItems = useMemo(
    () => [
      {
        label: t("sourcing.steps.cropSpecification"),
        href: "/sourcing/personalised-crops/crop-specification",
      },
      {
        label: t("sourcing.steps.shippingMethod"),
        href: "/sourcing/personalised-crops/shipping-method",
      },
      {
        label: t("sourcing.steps.paymentDetails"),
        href: "/sourcing/personalised-crops/payment-details",
      },
      {
        label: t("sourcing.steps.sourcingReview"),
        href: "/sourcing/personalised-crops/sourcing-review",
      },
      {
        label: t("sourcing.steps.documentProcessing"),
        href: "/sourcing/personalised-crops/document-processing",
      },
      {
        label: t("sourcing.steps.offerReview"),
        href: "/sourcing/personalised-crops/offer-review",
      },
      {
        label: t("sourcing.steps.salesContract"),
        href: "/sourcing/personalised-crops/sales-contract",
      },
    ],
    [t],
  );

  return (
    <div className="flex min-h-screen flex-col">
      {/* Sticky Navigation */}
      <div className="sticky top-0 z-10 bg-white">
        <SourcingSidebarCompound.Navigation />
      </div>

      {/* Main Content Area with Sticky Sidebar and Estimator */}
      <div className="flex flex-1 pb-[140px] pt-6">
        <div className="mx-auto flex w-full max-w-screen-xl justify-between">
          {/* Sticky Sidebar */}
          <div className="sticky left-0 top-[72px] mr-6 h-fit w-full max-w-[288px]">
            <SourcingSidebarCompound.Sidebar navItems={navItems} />
          </div>

          {/* Scrollable Content Area */}
          <div className="w-full min-w-[536px]">
            <SourcingSidebarCompound.Layout>
              {props.children as ReactNode}
            </SourcingSidebarCompound.Layout>
          </div>

          {/* Sticky Estimator */}
          <div className="sticky top-[72px] ml-6 h-fit w-full max-w-[400px]">
            <SourcingSidebarCompound.Estimator />
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <SourcingSidebarCompound.Footer />
    </div>
  );
}
