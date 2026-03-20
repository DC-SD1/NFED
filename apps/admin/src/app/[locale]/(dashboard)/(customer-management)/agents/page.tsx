import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import AgentsContent from "@/components/customer-management/agents/agents-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("customerManagement.agents");

  return {
    title: t("pageTitle"),
  };
}

export default async function AgentsPage() {
  return <AgentsContent />;
}
