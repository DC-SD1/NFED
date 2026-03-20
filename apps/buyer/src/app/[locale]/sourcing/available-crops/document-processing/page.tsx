import Image from "next/image";
import { useTranslations } from "next-intl";

import DocumentProcessingImg from "@/assets/images/sourcing/document-processing.png";

import NavigateToOfferReviewPlaceholder from "./_components/navigate-to-offer-review-placeholder";

export default function DocumentProcessingPage() {
  const t = useTranslations();

  return (
    <div className="flex h-[600px] flex-1 flex-col items-center justify-center gap-y-6">
      <Image
        src={DocumentProcessingImg.src}
        alt={""}
        width={160}
        height={160}
      />
      <div className="space-y-2 ">
        <p className="text-center text-[20px] font-bold">
          {t("sourcing.documentProcessing.title")}
        </p>
        <p className="mx-auto w-[70%] text-center text-sm text-[#586665]">
          {t("sourcing.documentProcessing.description")}
        </p>
      </div>

      <NavigateToOfferReviewPlaceholder />
    </div>
  );
}
