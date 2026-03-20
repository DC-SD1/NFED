import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import FulfilmentCentersContent from "@/components/fulfilment-centers/fulfilment-centers-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("fulfillmentCenters");

  return {
    title: t("pageTitle"),
  };
}

export default async function FulfilmentCenterPage() {
  return <FulfilmentCentersContent />;
}
