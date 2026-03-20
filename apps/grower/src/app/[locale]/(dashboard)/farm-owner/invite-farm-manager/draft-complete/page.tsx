"use client";

import { useTranslations } from "next-intl";

import SuccessPage from "@/components/dashboard/success-page";

export default function DraftCompletePage() {
  const t = useTranslations("dashboard.inviteManager");
  const tCommon = useTranslations("common");

  return (
    <SuccessPage
      title={t("draftSuccess")}
      description={t("draftSuccessDescription")}
      doneText={tCommon("done")}
      redirectUrl="/farm-owner/farm-managers"
    />
  );
}
