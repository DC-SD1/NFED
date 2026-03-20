import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import FormalGrowerDetailContent from "@/components/customer-management/formal-grower/details/formal-grower-detail-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("customerManagement.formalGrower.details");

  return {
    title: t("pageTitle"),
  };
}

export default function FormalGrowerDetailPage() {
  return <FormalGrowerDetailContent />;
}
