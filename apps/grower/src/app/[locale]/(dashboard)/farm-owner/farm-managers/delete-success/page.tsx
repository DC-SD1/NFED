"use client";

import { useTranslations } from "next-intl";

import SuccessPage from "@/components/dashboard/success-page";

export default function ManagerDeleteSuccessPage() {
  const tCommon = useTranslations("common");

  return (
    <SuccessPage
      title={tCommon("deactivated")}
      description={tCommon("deactivatedDescription")}
      doneText={tCommon("done")}
      redirectUrl="/farm-owner/farm-managers"
    />
  );
}
