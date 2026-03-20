"use client";

import type { components } from "@cf/api";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import TopLeftHeaderLayout from "@/components/dashboard/top-left-header";
import ProductionPlanForm from "@/components/forms/production-plan";
import { useApiClient } from "@/lib/api/client";
import { useFarmLandsDetail } from "@/lib/queries/farm-land-query";

export default function ProductionPlanPage() {
  const t = useTranslations("farmPlan.productionPlan");
  const searchParams = useSearchParams();
  const farmId = searchParams.get("farmId");
  const landId = searchParams.get("landId");
  const api = useApiClient();

  const {
    farmLandDetailsData: farmDetails,
    isPending: isFarmLoading,
    isError: isFarmError,
  } = useFarmLandsDetail(farmId ?? undefined);

  const {
    data: cropsResponse,
    isLoading: isCropsLoading,
    isError: isCropsError,
  } = api.useQuery("get", "/crop/get_all");

  const allCrops = (cropsResponse?.value?.filter(Boolean) ||
    []) as components["schemas"]["Crop"][];
  const isLoading = isFarmLoading || isCropsLoading;
  const error = isFarmError || isCropsError;

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

          <ProductionPlanForm
            farmDetails={farmDetails ?? null}
            allCrops={allCrops}
            farmId={farmId}
            landId={landId ?? farmDetails?.lands?.[0]?.id ?? null}
            isLoading={isLoading}
          />
        </div>
      </div>
    </TopLeftHeaderLayout>
  );
}
