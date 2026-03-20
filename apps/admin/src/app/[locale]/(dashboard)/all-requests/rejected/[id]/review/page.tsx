import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import ReviewKycContent from "@/components/all-requests/review/review-kyc-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("allRequests.reviewKyc");

  return {
    title: t("pageTitle"),
  };
}

export default async function RejectedRequestReviewPage() {
  return <ReviewKycContent />;
}
