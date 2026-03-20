"use client";

import { ChevronRight } from "@cf/ui/icons";
import { useTranslations } from "next-intl";

import SuccessPage from "@/components/dashboard/success-page";

export default function FarmPlanSuccessPage() {
  const t = useTranslations("farmPlan.planSummary.success");

  return (
    <SuccessPage
      title={t("title")}
      description={t("description")}
      doneText={t("done")}
      redirectUrl="/farm-owner"
      icon={<ChevronRight className="text-primary size-4" />}
    />
  );
}
