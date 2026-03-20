"use client";

import { useTranslations } from "next-intl";

import SuccessPage from "@/components/dashboard/success-page";

export default function InviteCompletePage() {
  const t = useTranslations("dashboard.inviteManager");
  const tCommon = useTranslations("common");

  return (
    <SuccessPage
      title={t("inviteSuccess")}
      description={t("inviteSuccessDescription")}
      doneText={tCommon("done")}
      redirectUrl="/farm-owner/farm-managers"
    />
  );
}
