"use client";

import { useTranslations } from "next-intl";

import SuccessPage from "@/components/dashboard/success-page";

export default function HireRequestSuccessPage() {
  const tCommon = useTranslations("common");
  const t = useTranslations("dashboard.assignSelf");

  return (
    <SuccessPage
      title={t("allSet")}
      description={t("setDescription")}
      doneText={tCommon("done")}
      redirectUrl="/farm-owner/farm-managers"
    />
  );
}
