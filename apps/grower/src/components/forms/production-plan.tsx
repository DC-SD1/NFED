import type { components } from "@cf/api";
import { Button } from "@cf/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { memo, useCallback, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { usePlantingWindow } from "@/hooks/use-planting-window";
import { useApiClient } from "@/lib/api/client";
import { FARM_PLAN_QUERY_KEY_ROOT } from "@/lib/queries/farm-plan-query";
import { FARM_PLANS_QUERY_KEY_ROOT } from "@/lib/queries/farm-plans-query";
import type { ProductionFormData } from "@/lib/schemas/farm-manager-details";
import { productionSchema } from "@/lib/schemas/farm-manager-details";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";
import { logger } from "@/lib/utils/logger";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

import ResultsCard from "../farm-plan/results-card";
import { AnalyzingCard } from "./production-plan-analyzing-card";
import { CropSelectionSection } from "./production-plan-crop-selection";
import { FarmInfoSection } from "./production-plan-farm-info";
import { PreferencesSection } from "./production-plan-preferences";
import ProductionPlanSkeleton from "./production-plan-skeleton";

interface ProductionPlanFormProps {
  farmDetails: components["schemas"]["FarmDetailsResponse"] | null;
  allCrops: components["schemas"]["Crop"][];
  farmId: string | null;
  landId: string | null;
  isLoading: boolean;
}

const ProductionPlanForm = memo(
  ({
    farmDetails,
    allCrops,
    farmId,
    landId,
    isLoading,
  }: ProductionPlanFormProps) => {
    const t = useTranslations("farmPlan.productionPlan");
    const router = useRouter();
    const api = useApiClient();
    const queryClient = useQueryClient();
    const { userId } = useAuthUser();

    // Use react-hook-form for form fields (cropType, cropVariety, startDate)
    const methods = useForm<ProductionFormData>({
      resolver: zodResolver(productionSchema),
      defaultValues: {
        cropType: "",
        cropVariety: "",
        startDate: "",
      },
    });

    // Watch form values
    const cropType = methods.watch("cropType");
    const cropVariety = methods.watch("cropVariety");

    // useIrrigation is separate state (not sent to backend yet)
    const [useIrrigation, setUseIrrigation] = useState(false);

    // Memoized derived values
    const cropTypes = useMemo(
      () => allCrops.map((c) => c.name || "").filter(Boolean),
      [allCrops],
    );

    const selectedCrop = useMemo(
      () => allCrops.find((c) => c.name === cropType),
      [allCrops, cropType],
    );

    const varieties = useMemo(
      () => selectedCrop?.cropVariety || [],
      [selectedCrop],
    );

    // Planting window hook
    const { isAnalyzing, showResults, analysisResults, resetResults } =
      usePlantingWindow({
        cropVariety,
        farmDetails,
        cropId: selectedCrop?.id,
        enabled: !!cropVariety,
      });

    // Use api.useMutation directly (no custom hook)
    const createPlanMutation = api.useMutation(
      "post",
      "/farm-planning/farm-plan",
      {
        onSuccess: async (data) => {
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: FARM_PLAN_QUERY_KEY_ROOT,
            }),
            queryClient.invalidateQueries({
              queryKey: FARM_PLANS_QUERY_KEY_ROOT,
            }),
          ]);

          logger.info("Farm plan created successfully", { farmPlanId: data });
          showSuccessToast("Farm plan created successfully");

          router.push(
            `/farm-owner/farm-plan/summary?farmPlanId=${data}&farmId=${farmId}&landId=${landId}`,
          );
        },
        onError: (error) => {
          logger.error("Error creating farm plan", error);
          showErrorToast(
            error.errors?.[0]?.message ??
              "Failed to create farm plan, please try again.",
          );
        },
      },
    );

    // Handlers with useCallback
    const handleCropTypeSelect = useCallback(
      (value: string) => {
        methods.setValue("cropType", value);
        methods.setValue("cropVariety", "");
        resetResults();
      },
      [methods, resetResults],
    );

    const handleCropVarietySelect = useCallback(
      (value: string) => {
        methods.setValue("cropVariety", value);
      },
      [methods],
    );

    const handleIrrigationChange = useCallback((value: boolean) => {
      setUseIrrigation(value);
    }, []);

    const handleGenerate = useCallback(async () => {
      if (!farmId || !landId || !selectedCrop?.id || !userId) {
        // Detect which fields are missing
        const missingFields: string[] = [];
        if (!farmId) missingFields.push(t("errors.missingFarmId"));
        if (!landId) missingFields.push(t("errors.missingLandId"));
        if (!selectedCrop?.id) missingFields.push(t("errors.missingCropId"));
        if (!userId) missingFields.push(t("errors.missingUserId"));

        // Show localized error toast with missing fields
        showErrorToast(
          t("errors.missingMultipleFields", {
            fields: missingFields.join(", "),
          }),
        );

        logger.error("Missing required data for farm plan creation", {
          farmId,
          landId,
          cropId: selectedCrop?.id,
          userId,
        });
        return;
      }

      // Get the form values
      const formData = methods.getValues();

      // Find the selected crop variety to get its ID
      const selectedVarietyObj = varieties.find(
        (v) => v.name === formData.cropVariety,
      );

      // Convert DD/MM/YYYY to ISO string
      let userStartDate: string | null = null;
      if (formData.startDate) {
        const [dd, mm, yyyy] = formData.startDate.split("/");
        if (dd && mm && yyyy) {
          const date = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
          if (!isNaN(date.getTime())) {
            userStartDate = date.toISOString();
          }
        }
      }

      await createPlanMutation.mutateAsync({
        body: {
          farmerId: userId,
          farmId,
          landId,
          cropId: selectedCrop.id,
          cropVarietyId: selectedVarietyObj?.id || null,
          userStartDate,
        },
      });
    }, [
      farmId,
      landId,
      selectedCrop,
      userId,
      varieties,
      methods,
      createPlanMutation,
      t,
    ]);

    if (isLoading) {
      return <ProductionPlanSkeleton />;
    }

    return (
      <FormProvider {...methods}>
        <div className="rounded-2xl bg-white shadow-xl">
          <div className="w-full p-2 lg:p-4">
            <div className="rounded-lg border-none bg-white">
              <FarmInfoSection
                farmName={farmDetails?.farmName}
                acreage={farmDetails?.acreage}
              />

              <CropSelectionSection
                cropTypes={cropTypes}
                varieties={varieties}
                selectedCropType={cropType}
                selectedVariety={cropVariety}
                onCropTypeChange={handleCropTypeSelect}
                onVarietyChange={handleCropVarietySelect}
              />

              {isAnalyzing && (
                <AnalyzingCard message={t("analyzingConditions")} />
              )}

              {showResults && analysisResults && (
                <ResultsCard
                  results={analysisResults}
                  variant="warning"
                  title={t("plantingRecommendation")}
                />
              )}

              <PreferencesSection
                useIrrigation={useIrrigation}
                onIrrigationChange={handleIrrigationChange}
              />

              <div className="flex flex-row justify-start">
                <Button
                  className="rounded-xl"
                  onClick={handleGenerate}
                  disabled={createPlanMutation.isPending || !cropType}
                >
                  {createPlanMutation.isPending
                    ? t("generating")
                    : t("generateFarmPlan")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </FormProvider>
    );
  },
);

ProductionPlanForm.displayName = "ProductionPlanForm";

export default ProductionPlanForm;
