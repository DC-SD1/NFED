"use client";

import { useTranslations } from "next-intl";

import TopLeftHeaderLayout from "@/components/dashboard/top-left-header";
import SelectGrowOption from "@/components/forms/select-grow-option";

export default function Page() {
  const t = useTranslations("dashboard.grow");

  return (
    <TopLeftHeaderLayout>
      <div className="min-h-screen  py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-sm sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
          <h1 className="text-start text-3xl font-semibold tracking-tight  sm:text-center">
            {t("selectTitle")}
          </h1>

          <SelectGrowOption />
        </div>
      </div>
    </TopLeftHeaderLayout>
  );
}
