/* eslint-disable max-lines-per-function */
import { Button, Skeleton } from "@cf/ui";
import { useQueryClient } from "@tanstack/react-query";
import {
  Calendar1Icon,
  ChevronRight,
  Edit,
  Loader2,
  MapPin,
  PlusIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQueryState } from "nuqs";
import { useMemo } from "react";

import { useApiClient } from "@/lib/api";
import {
  FARM_PLAN_QUERY_KEY_ROOT,
  useFarmPlan,
} from "@/lib/queries/farm-plan-query";
import { FARM_PLANS_QUERY_KEY_ROOT } from "@/lib/queries/farm-plans-query";
import { useModal } from "@/lib/stores/use-modal";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

import FarmDetailsComponent from "./details-card";
import MaterialRequirements from "./materials-card";
import ProductionTimeline from "./production-timeline-card";
import { SummaryCard } from "./summary-cards";

interface FarmDashboardCardsProps {
  farmPlanId?: string;
}

export const FarmDashboardCards = ({ farmPlanId }: FarmDashboardCardsProps) => {
  const t = useTranslations("farmPlan.summary");
  const [activeTab, setActiveTab] = useQueryState("tab", {
    defaultValue: t("tabs.overview"),
  });
  const router = useRouter();
  const api = useApiClient();
  const queryClient = useQueryClient();

  const { onOpen, onClose } = useModal();
  const { farmPlanData: plan, isLoading, isError } = useFarmPlan(farmPlanId);

  const { mutate, isPending } = api.useMutation(
    "post",
    "/farm-planning/activate",
    {
      onSuccess: async (_data, _variables) => {
        // Invalidate queries to refresh the data
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: FARM_PLAN_QUERY_KEY_ROOT,
          }),
          queryClient.invalidateQueries({
            queryKey: FARM_PLANS_QUERY_KEY_ROOT,
          }),
        ]);
        showSuccessToast(t("modal.successMessage"));
        onClose();
        router.push(`/farm-owner/`);
      },
      onError: (error) => {
        const errorMessage = error.errors?.[0]?.message ?? "";
        showErrorToast(errorMessage);
      },
    },
  );

  const handleSaveFarmPlan = () => {
    onOpen("Confirmation", {
      title: t("modal.nameThePlan"),
      subtitle: t("modal.giveNameSubtitle"),
      inputLabel: t("modal.inputLabel"),
      inputPlaceholder: t("modal.inputPlaceholder"),
      confirmText: t("modal.saveAndContinue"),
      cancelText: t("modal.cancel"),
      onConfirm: (farmName: string) => {
        mutate({
          body: {
            name: farmName,
            farmPlanId,
          },
        });
      },
    });
  };

  const handleFarmPlan = () => {
    router.push(
      `/farm-owner/farm-grow?farmId=${plan?.farmId}&landId=${plan?.landId}`,
    );
    // /production-plan?farmId=${id}&landId=${landId}
  };

  const handleEditFarmData = () => {
    router.push(
      `/farm-owner/farm-plan/edit?farmPlanId=${farmPlanId}&farmId=${plan?.farmId}&landId=${plan?.landId}`,
    );
  };

  const handleStartNewPlan = () => {
    router.push(
      `/farm-owner/farm-plan/production-plan?farmPlanId=${farmPlanId}&farmId=${plan?.farmId}&landId=${plan?.landId}`,
    );
  };

  const metricsData = useMemo(() => {
    const scheduleCount = plan?.schedule?.length ?? 0;
    const bomCount = plan?.bom?.length ?? 0;
    const totalCost = plan?.summary?.total_estimated_cost_ghs ?? "0";
    const totalYield = plan?.summary?.predicted_total_yield_t ?? "0";

    return [
      {
        title: t("metrics.expectedYield"),
        value: totalYield,
        unit: t("metrics.tons"),
        bgColor: "bg-blue-100",
        textColor: "text-blue-600",
        valueColor: "text-blue-700",
      },
      {
        title: t("metrics.totalCost"),
        value: totalCost,
        unit: `GH₵ ${t("metrics.estimated")}`,
        bgColor: "bg-green-100",
        textColor: "text-green-600",
        valueColor: "text-green-700",
      },
      {
        title: t("metrics.activities"),
        value: scheduleCount.toString(),
        unit: t("metrics.scheduledTasks"),
        bgColor: "bg-purple-100",
        textColor: "text-purple-600",
        valueColor: "text-purple-700",
      },
      {
        title: t("metrics.materials"),
        value: bomCount.toString(),
        unit: t("metrics.requiredItems"),
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-600",
        valueColor: "text-yellow-700",
      },
    ];
  }, [plan, t]);

  const tabs = useMemo(
    () => [
      { name: t("tabs.overview"), badge: null },
      { name: t("tabs.timelines"), badge: plan?.schedule?.length ?? 0 },
      { name: t("tabs.materials"), badge: plan?.bom?.length ?? 0 },
    ],
    [plan, t],
  );

  const daysUntilStart = useMemo(() => {
    if (!plan?.startDate) return null;
    const now = new Date();
    const start = new Date(plan.startDate);
    const diffTime = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [plan?.startDate]);

  if (isLoading) {
    return (
      <div className="">
        {/* Action Buttons Skeleton */}
        <div className="mb-6">
          <div className="mb-4 flex gap-4 rounded-2xl bg-white p-4 shadow-md">
            <Skeleton className="h-10 w-40 rounded-xl" />
            <Skeleton className="h-10 w-40 rounded-xl" />
          </div>

          {/* Farm Dashboard Card Skeleton */}
          <div className="rounded-2xl bg-white p-4 shadow-md">
            <Skeleton className="mb-4 h-6 w-48" />

            {/* Location and Date Info */}
            <div className="text-gray-dark mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>

            {/* Farm Details Grid Skeleton */}
            <div className="mb-6 flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-xl lg:flex-row lg:items-center lg:justify-between">
              <div className="grid flex-1 grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="mb-1 h-4 w-24" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                ))}
              </div>
            </div>

            {/* Farm This Plan Button */}
            <div className="flex items-center justify-end">
              <Skeleton className="h-10 w-40 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Soil Analysis Section Skeleton */}
        <div className="mb-6 rounded-2xl bg-white p-4">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Skeleton className="mb-1 h-6 w-40" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="text-left sm:text-right">
              <Skeleton className="mb-1 h-4 w-24" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>

          {/* Metrics Cards Skeleton */}
          <div className="mb-8 w-full">
            <div className="overflow-x-auto overflow-y-hidden">
              <div className="flex gap-6 pb-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-[204px] shrink-0 lg:w-[300px]">
                    <div className="animate-pulse rounded-xl bg-gray-100 p-6">
                      <Skeleton className="mb-2 h-4 w-32" />
                      <Skeleton className="mb-1 h-8 w-24" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <hr className="text-gray-dark my-5 h-0.5" />

          {/* Bottom Farm Details Grid Skeleton */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            <div>
              <Skeleton className="mb-4 h-5 w-48" />
              <Skeleton className="h-5 w-40" />
            </div>
            <div>
              <Skeleton className="mb-4 h-5 w-48" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
        </div>

        {/* Tabs Section Skeleton */}
        <div className="w-full rounded-2xl bg-white p-4 shadow-md">
          {/* Tab Headers Skeleton */}
          <div className="border-gray-light mb-6 flex gap-6 border-b pb-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-24" />
            ))}
          </div>

          {/* Tab Content Skeleton - Overview Tab */}
          <div className="space-y-6">
            {/* Cost Breakdown and Production Timeline Grid */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Cost Breakdown Skeleton */}
              <div>
                <Skeleton className="mb-4 h-6 w-40" />
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-userDropdown-background flex items-center justify-between rounded-2xl p-4"
                    >
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Production Timeline Skeleton */}
              <div>
                <Skeleton className="mb-4 h-6 w-48" />
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-2xl bg-gray-100 p-4"
                    >
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Crop-Specific Information Skeleton */}
            <div className="bg-userDropdown-background rounded-2xl p-4">
              <Skeleton className="mb-4 h-6 w-56" />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex flex-row gap-1">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Save Plan Button Skeleton */}
        <div className="my-14 flex w-full items-center justify-center">
          <Skeleton className="h-11 w-1/2 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !plan) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-lg text-red-600">
          Failed to load farm plan. Please try again.
        </div>
      </div>
    );
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="">
      {/* Header Section */}
      <div className="mb-6">
        <div className="mb-4  flex gap-4 rounded-2xl bg-white  p-4 shadow-md">
          <Button
            className="rounded-xl font-semibold"
            onClick={handleEditFarmData}
          >
            <Edit className="mr-1 size-6 font-semibold" />
            {t("editFarmData")}
          </Button>
          <Button
            className="rounded-xl font-semibold"
            onClick={handleStartNewPlan}
          >
            <PlusIcon className="mr-1 size-6 font-semibold" />
            {t("startNewPlan")}
          </Button>
        </div>
        <div className=" rounded-2xl bg-white p-4 shadow-md">
          <h1 className="text-md mb-4 font-semibold">{t("farmDashboard")}</h1>

          {/* Mobile: Column layout, Desktop: Row layout */}
          <div className="text-gray-dark mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center gap-1 font-thin">
              <MapPin className="size-5" />
              <span className="text-md font-thin">Tagadzi, Voltan Region</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar1Icon className="size-5" />
              <span className="text-md font-thin">
                Start date: {formatDate(plan.startDate)}
              </span>
            </div>
            {daysUntilStart !== null && daysUntilStart > 0 && (
              <div className="text-warning-orange-light w-fit rounded-full bg-orange-100 px-3 py-1 text-sm font-thin">
                {daysUntilStart} {daysUntilStart === 1 ? "day" : "days"} left
              </div>
            )}
          </div>

          {/* Farm Details */}
          <div className="mb-6 flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-xl lg:flex-row lg:items-center lg:justify-between">
            <div className="grid flex-1  grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
              <div>
                <div className="text-gray-dark mb-1 text-sm">
                  {t("fields.cropType")}
                </div>
                <div className="text-md font-thin">
                  {plan.cropName ?? "N/A"}
                </div>
              </div>
              <div>
                <div className="text-gray-dark mb-1 text-sm">
                  {t("fields.cropVariety")}
                </div>
                <div className="text-md font-thin">
                  {plan.cropVariety ?? "N/A"}
                </div>
              </div>
              <div>
                <div className="text-gray-dark mb-1 text-sm">
                  {t("fields.landSize")}
                </div>
                <div className="text-md font-thin">
                  {plan.acres ?? "N/A"} acres
                </div>
              </div>
              <div>
                <div className="text-gray-dark mb-1 text-sm">
                  {t("fields.dateCreated")}
                </div>
                <div className="text-md font-thin">
                  {formatDate(plan.createdAt)}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end">
            <Button
              onClick={() => handleFarmPlan()}
              className="rounded-xl font-semibold"
            >
              {t("farmThisPlan")}
              <ChevronRight className="ml-2 !size-6 font-semibold" />
            </Button>
          </div>
        </div>
      </div>

      {/* Soil Analysis Section */}
      <div className="mb-6 rounded-2xl bg-white p-4">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-md mb-1 font-semibold">{t("soilAnalysis")}</h1>
            <p className="text-gray-dark text-sm">{t("currentConditions")}</p>
          </div>
          <div className="text-left text-sm sm:text-right">
            <div className="text-gray-dark">{t("planId")}</div>
            <div className="font-thin">{plan.externalId ?? plan.id}</div>
          </div>
        </div>
        <div className="mb-8 w-full">
          <div className="overflow-x-auto overflow-y-hidden">
            <div className="flex  gap-6 pb-2">
              {metricsData.map((metric, index) => (
                <div key={index} className="w-[204px] shrink-0 lg:w-[300px]">
                  <SummaryCard
                    title={metric.title}
                    value={
                      typeof metric.value === "number"
                        ? Math.round(metric.value * 100) / 100
                        : isNaN(Number(metric.value))
                          ? metric.value
                          : Math.round(Number(metric.value) * 100) / 100
                    }
                    unit={metric.unit}
                    bgColor={metric.bgColor}
                    textColor={metric.textColor}
                    valueColor={metric.valueColor}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <hr className="text-gray-dark my-5 h-0.5" />
        {/* Bottom Farm Details */}
        <div className="text-md grid grid-cols-1 gap-6 font-thin md:grid-cols-2 md:gap-8">
          <div>
            <div className="text-md mb-4">
              <span className="text-gray-dark">{t("fields.crop")}</span>{" "}
              {plan.cropName ?? "N/A"}
            </div>
            <div>
              <span className="text-gray-dark">{t("fields.startDate")}</span>{" "}
              {formatDate(plan.startDate)}
            </div>
          </div>
          <div>
            <div className="mb-4">
              <span className="text-gray-dark">{t("fields.area")}</span>{" "}
              {plan.acres} acres
            </div>
            <div>
              <span className="text-gray-dark">{t("fields.harvestDate")}</span>{" "}
              {formatDate(plan.estimatedHarvestDate)}
            </div>
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div className="w-full rounded-2xl bg-white p-4 shadow-md">
        <div className="border-gray-light mb-6 flex gap-6 border-b">
          {tabs.map((tab) => (
            <Button
              key={tab.name}
              variant="unstyled"
              onClick={() => setActiveTab(tab.name)}
              className={`text-gray-dark whitespace-nowrap rounded-none border-b-2 p-0 px-1 text-sm font-thin ${
                activeTab === tab.name
                  ? "border-primary text-primary"
                  : "border-transparent"
              }`}
            >
              {tab.name}
              {tab.badge != null && tab.badge > 0 && (
                <span
                  className={`ml-2 rounded-full px-1.5 py-0.5 text-xs text-white ${activeTab === tab.name ? "bg-primary" : "bg-black"}`}
                >
                  {tab.badge}
                </span>
              )}
            </Button>
          ))}
        </div>
        {activeTab === t("tabs.overview") && (
          <FarmDetailsComponent plan={plan} />
        )}
        {activeTab === t("tabs.timelines") && (
          <ProductionTimeline schedule={plan.schedule ?? []} />
        )}
        {activeTab === t("tabs.materials") && (
          <MaterialRequirements bom={plan.bom ?? []} />
        )}
      </div>
      <div className="my-14 flex w-full items-center justify-center">
        <Button
          className="w-1/2 justify-center rounded-xl"
          onClick={handleSaveFarmPlan}
          disabled={isPending}
        >
          {isPending && (
            <Loader2 className="primar-foreground size-4 animate-spin" />
          )}
          {!isPending && t("savePlan")}
        </Button>
      </div>
    </div>
  );
};
