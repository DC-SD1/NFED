"use client";

import { useTranslations } from "next-intl";

import TopLeftHeaderLayout from "@/components/dashboard/top-left-header";
import IdDocumentUploadForm from "@/components/forms/resident-kyc-submit";

export default function KycResidentSubmit() {
  const t = useTranslations("dashboard.kyc");

  return (
    <TopLeftHeaderLayout>
      <div className="mb-24 px-4 md:items-center md:justify-center md:px-6 md:pt-0 lg:px-8 xl:mb-0">
        <div className="mx-auto w-full max-w-lg md:max-w-4xl lg:max-w-2xl">
          <h1 className="mb-4 text-start text-3xl font-semibold tracking-tight lg:text-center ">
            {t("uploadTitle")}
          </h1>

          <IdDocumentUploadForm />
        </div>
      </div>
    </TopLeftHeaderLayout>
  );
}
