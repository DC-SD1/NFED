"use client";

import { useTranslations } from "next-intl";

import SuccessPage from "@/components/dashboard/success-page";

export default function HireRequestSuccessPage() {
  const tCommon = useTranslations("common");
  const t = useTranslations("dashboard.hireManager");

  return (
    <SuccessPage
      title={t("requestSent")}
      description={t("sentDescription")}
      doneText={tCommon("done")}
      redirectUrl="/farm-owner/farm-managers"
    />
  );
}
