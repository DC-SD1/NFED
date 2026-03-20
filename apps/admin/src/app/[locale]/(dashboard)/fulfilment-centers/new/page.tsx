import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import AddCenterContent from "@/components/fulfilment-centers/add-center-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("fulfillmentCenters");

  return {
    title: t("pageTitle"),
  };
}

export default async function AddNewCenterPage() {
  return <AddCenterContent />;
}
