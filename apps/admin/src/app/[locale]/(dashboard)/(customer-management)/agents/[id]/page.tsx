import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import AgentDetailContent from "@/components/customer-management/agents/details/agent-detail-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("customerManagement.agents.details");

  return {
    title: t("pageTitle"),
  };
}

export default function AgentDetailPage() {
  return <AgentDetailContent />;
}
