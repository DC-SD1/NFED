"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import TopLeftHeaderLayout from "@/components/dashboard/top-left-header";
import { FarmDashboardCards } from "@/components/farm-plan/summary";
import { useFarmPlan } from "@/lib/queries/farm-plan-query";

export default function PlanSummaryPage() {
  const t = useTranslations("farmPlan.summary");
  const searchParams = useSearchParams();
  const farmPlanId = searchParams.get("farmPlanId");
  const { farmPlanData, isLoading } = useFarmPlan(farmPlanId ?? undefined);

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <TopLeftHeaderLayout buttonClassName="px-2">
      <div className="flex min-h-screen flex-col items-center px-2 lg:px-4">
        <div className="max-w-[95vw] space-y-6 pt-4 md:pt-6 lg:pt-6">
          <div className="text-left">
            <h1 className="text-foreground text-2xl font-semibold md:text-3xl lg:text-4xl">
              {t("title")}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {t("description")}
            </p>
            <div className="mt-3 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground text-sm font-semibold">
                  <span className="bg-primary mr-1.5 inline-block size-2 rounded-full align-middle"></span>
                  {t("dataAutoSaved")}
                </span>
                <span className="text-muted-foreground ml-3.5 text-xs">
                  {isLoading
                    ? t("lastUpdated", { date: "..." })
                    : t("lastUpdated", {
                        date: formatDateTime(farmPlanData?.updatedAt) ?? "N/A",
                      })}
                </span>
              </div>
            </div>
          </div>
          <FarmDashboardCards farmPlanId={farmPlanId ?? undefined} />
        </div>
      </div>
    </TopLeftHeaderLayout>
  );
}
