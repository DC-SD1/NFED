import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import RejectedRequestContent from "@/components/all-requests/rejected-request-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("allRequests.pageTitles");

  return {
    title: t("inProgress"),
  };
}

export default async function RejectedRequestPage() {
  return <RejectedRequestContent />;
}
