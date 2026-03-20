import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import InProgressRequestContent from "@/components/all-requests/in-progress-request-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("allRequests.pageTitles");

  return {
    title: t("inProgress"),
  };
}

export default async function InProgressRequestPage() {
  return <InProgressRequestContent />;
}
