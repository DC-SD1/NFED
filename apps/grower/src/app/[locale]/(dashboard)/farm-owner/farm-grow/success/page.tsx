"use client";

import { useTranslations } from "next-intl";

import SuccessPage from "@/components/dashboard/success-page";

export default function BuyerOrderSuccessPage() {
  const t = useTranslations("dashboard.grow.success");
  const tCommon = useTranslations("common");

  return (
    <SuccessPage
      title={t("title")}
      description={t("message")}
      doneText={tCommon("done")}
      redirectUrl="/farm-owner/farm-lands"
    />
  );
}
