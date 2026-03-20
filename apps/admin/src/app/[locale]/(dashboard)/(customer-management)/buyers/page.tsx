import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import BuyerContent from "@/components/customer-management/buyer/buyer-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("customerManagement.buyer");

  return {
    title: t("pageTitle"),
  };
}

export default async function BuyerPage() {
  return <BuyerContent />;
}
