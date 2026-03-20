import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import NewRequestContent from "@/components/all-requests/new-request-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("allRequests.pageTitles");

  return {
    title: t("new"),
  };
}

export default async function NewRequestPage() {
  return <NewRequestContent />;
}
