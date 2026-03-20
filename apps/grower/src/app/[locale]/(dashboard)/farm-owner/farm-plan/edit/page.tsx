"use client";

import type { components } from "@cf/api";
import { useInitializedEffectOnce } from "@cf/common/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import TopLeftHeaderLayout from "@/components/dashboard/top-left-header";
import ProductionPlanEditForm from "@/components/forms/production-plan-edit";
import ProductionPlanSkeleton from "@/components/forms/production-plan-skeleton";
import { useApiClient } from "@/lib/api/client";
import { useFarmLandsDetail } from "@/lib/queries/farm-land-query";
import { useFarmPlan } from "@/lib/queries/farm-plan-query";

export default function FarmPlanEditPage() {
  const t = useTranslations("farmPlan.productionPlan");
  const searchParams = useSearchParams();
  const farmPlanId = searchParams.get("farmPlanId");
  const farmId = searchParams.get("farmid");
  const api = useApiClient();
  const router = useRouter();

  useInitializedEffectOnce(() => {
    if (!farmPlanId) {
      router.push("/farm-owner/farm-plan");
    }
  }, [farmPlanId]);

  // Fetch the existing farm plan
  const { farmPlanData: plan, isLoading: isPlanLoading } = useFarmPlan(
    farmPlanId ?? undefined,
  );

  // Fetch farm details
  const {
    farmLandDetailsData: farmDetails,
    isPending: isFarmLoading,
    isError: isFarmError,
  } = useFarmLandsDetail(farmId ?? plan?.farmId ?? undefined);

  // Fetch all crops
  const {
    data: cropsResponse,
    isLoading: isCropsLoading,
    isError: isCropsError,
  } = api.useQuery("get", "/crop/get_all");

  const allCrops = (cropsResponse?.value?.filter(Boolean) ||
    []) as components["schemas"]["Crop"][];

  const isLoading = isPlanLoading || isFarmLoading || isCropsLoading;
  const error = isFarmError || isCropsError;

  // Helper function to convert ISO date to DD/MM/YYYY format
  const formatDateForForm = (isoDate: string | null | undefined): string => {
    if (!isoDate) return "";
    try {
      const date = new Date(isoDate);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return "";
    }
  };

  // Transform plan data to existingPlan format
  const existingPlan = useMemo(() => {
    if (!plan) return null;

    return {
      id: plan.id || "",
      farmId: plan.farmId || "",
      landId: plan.landId || "",
      cropId: plan.cropId || "",
      cropType: plan.cropName || "",
      cropVariety: plan.cropVariety || "",
      startDate: formatDateForForm(plan.startDate),
      useIrrigation: false,
    };
  }, [plan]);

  if (!farmPlanId) {
    return (
      <TopLeftHeaderLayout>
        <div className="flex min-h-screen flex-col items-center px-2 lg:px-4">
          <div className="w-full space-y-6 pt-4 md:pt-6 lg:pt-6">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              Farm Plan ID is required
            </div>
          </div>
        </div>
      </TopLeftHeaderLayout>
    );
  }

  return (
    <TopLeftHeaderLayout>
      <div className="flex min-h-screen flex-col items-center px-2 lg:px-4">
        <div className="w-full space-y-6 pt-4 md:pt-6 lg:pt-6">
          <div className="text-left">
            <h1 className="text-2xl font-semibold text-foreground md:text-3xl lg:text-4xl">
              {t("title")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>

          {error && !isLoading && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              {t("errors.loadFailed")}
            </div>
          )}

          {!isLoading && existingPlan && farmDetails && (
            <ProductionPlanEditForm
              farmDetails={farmDetails}
              allCrops={allCrops}
              existingPlan={existingPlan}
              farmId={plan?.farmId || null}
              landId={plan?.landId || null}
              isLoading={isLoading}
            />
          )}

          {isLoading && <ProductionPlanSkeleton isEditMode={true} />}
        </div>
      </div>
    </TopLeftHeaderLayout>
  );
}
