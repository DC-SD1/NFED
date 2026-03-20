"use client";

import { useTranslations } from "next-intl";

import TopLeftHeaderLayout from "@/components/dashboard/top-left-header";
import FarmSearchForm from "@/components/forms/select-farm-form";

export default function SelfManagerAssignPage() {
  const t = useTranslations("dashboard.assignSelf");

  return (
    <TopLeftHeaderLayout>
      <div className="flex flex-col items-center justify-center p-2 md:px-12">
        <div className="w-full max-w-4xl space-y-8 md:max-w-6xl lg:max-w-2xl">
          {/* Header */}
          <div className="space-y-3 text-left md:text-center">
            <h1 className="text-foreground text-3xl font-semibold leading-9">
              {t("selectLand")}
            </h1>
            <p className="text-muted-foreground w-2/3 break-words text-sm leading-6 md:w-full">
              {t("selectLandSub")}
            </p>
            <FarmSearchForm selfAssign />
          </div>
        </div>
      </div>
    </TopLeftHeaderLayout>
  );
}
