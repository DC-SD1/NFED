"use client";

import { useTranslations } from "next-intl";

import TopLeftHeaderLayout from "@/components/dashboard/top-left-header";
import SalaryRangeForm from "@/components/forms/salary-range-form";

export default function WorkConditionsPage() {
  const t = useTranslations("dashboard.hireManager");
  return (
    <TopLeftHeaderLayout>
      <div className="flex flex-col items-center justify-center px-2 lg:px-4">
        <div className="w-full max-w-4xl space-y-8 md:max-w-6xl lg:max-w-2xl">
          {/* Header */}
          <div className="space-y-3 text-left lg:text-center">
            <h1 className="text-start text-3xl font-bold tracking-tight lg:text-center">
              {t("workConditions")}
            </h1>
            <p className="text-muted-foreground text-sm leading-6">
              {t("workConditionsSub")}
            </p>
            <SalaryRangeForm />
          </div>
        </div>
      </div>
    </TopLeftHeaderLayout>
  );
}
