import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import CompletedRequestContent from "@/components/all-requests/completed-request-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("allRequests.pageTitles");

  return {
    title: t("completed"),
  };
}

export default async function CompletedRequestPage() {
  return <CompletedRequestContent />;
}
