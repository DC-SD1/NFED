import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import FulfilmentCenterDetailContent from "@/components/fulfilment-centers/details/fulfilment-center-detail-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("fulfillmentCenters.details");

  return {
    title: t("pageTitle"),
  };
}

export default async function FulfilmentCenterDetailContentPage() {
  return <FulfilmentCenterDetailContent />;
}
