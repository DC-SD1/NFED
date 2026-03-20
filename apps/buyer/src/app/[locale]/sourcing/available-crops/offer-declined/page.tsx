import Image from "next/image";
import { useTranslations } from "next-intl";

import DocumentRejectedImg from "@/assets/images/sourcing/document-rejected.png";

import ReturnToHomeButton from "./_components/return-to-home-button";

export default function OfferDeclined() {
  const t = useTranslations();

  return (
    <div className="flex h-[600px] flex-1 flex-col items-center justify-center gap-y-6">
      <Image src={DocumentRejectedImg.src} alt={""} width={160} height={160} />
      <div className="space-y-2 ">
        <p className="text-center text-[20px] font-bold">
          {t("sourcing.orderDeclined.title")}
        </p>
        <p className="mx-auto w-[70%] text-center text-sm text-[#586665]">
          {t("sourcing.orderDeclined.description")}
        </p>
      </div>

      <ReturnToHomeButton />
    </div>
  );
}
