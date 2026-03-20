"use client";

import { useTranslations } from "next-intl";

import TopLeftHeaderLayout from "@/components/dashboard/top-left-header";
import { ResidentTypeForm } from "@/components/forms/kyc-resident-details";

export default function KycPage() {
  const t = useTranslations("dashboard.kyc");

  return (
    <TopLeftHeaderLayout>
      <div className="px-4 py-6 md:items-center md:justify-center md:px-6 md:pt-0 lg:px-8">
        <div className="mx-auto w-full max-w-lg md:max-w-4xl lg:max-w-2xl">
          <h1 className="mb-4 text-start text-3xl font-semibold tracking-tight sm:text-xl md:text-2xl lg:text-center ">
            {t("kycTitle")}
          </h1>

          <ResidentTypeForm />
        </div>
      </div>
    </TopLeftHeaderLayout>
  );
}
