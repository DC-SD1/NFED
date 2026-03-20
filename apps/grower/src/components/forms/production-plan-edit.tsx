import type { components } from "@cf/api";
import { Button } from "@cf/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { memo, useCallback, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { AnalyzingCard } from "@/components/forms/production-plan-analyzing-card";
import { usePlantingWindow } from "@/hooks/use-planting-window";
import { useApiClient } from "@/lib/api/client";
import { FARM_PLAN_QUERY_KEY_ROOT } from "@/lib/queries/farm-plan-query";
import { FARM_PLANS_QUERY_KEY_ROOT } from "@/lib/queries/farm-plans-query";
import type { ProductionFormData } from "@/lib/schemas/farm-manager-details";
import { productionSchema } from "@/lib/schemas/farm-manager-details";
import { logger } from "@/lib/utils/logger";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

import ResultsCard from "../farm-plan/results-card";
import { CropSelectionSection } from "./production-plan-crop-selection";
import { FarmInfoSection } from "./production-plan-farm-info";
import { PreferencesSection } from "./production-plan-preferences";
import ProductionPlanSkeleton from "./production-plan-skeleton";

interface ExistingPlan {
  id: string;
  farmId: string;
  landId: string;
  cropId: string;
  cropType: string;
  cropVariety: string;
  startDate: string;
  useIrrigation: boolean;
}

interface ProductionPlanEditFormProps {
  farmDetails: components["schemas"]["FarmDetailsResponse"];
  allCrops: components["schemas"]["Crop"][];
  existingPlan: ExistingPlan;
  farmId: string | null;
  landId: string | null;
  isLoading: boolean;
}

const ProductionPlanEditForm = memo(
  ({
    farmDetails,
    allCrops,
    existingPlan,
    farmId,
    landId,
    isLoading,
  }: ProductionPlanEditFormProps) => {
    const t = useTranslations("farmPlan.productionPlan");
    const router = useRouter();
    const api = useApiClient();
    const queryClient = useQueryClient();

    // Initialize form with existing plan data
    const methods = useForm<ProductionFormData>({
      resolver: zodResolver(productionSchema),
      defaultValues: {
        cropType: existingPlan.cropType,
        cropVariety: existingPlan.cropVariety,
        startDate: existingPlan.startDate,
      },
    });

    // Watch form values
    const cropType = methods.watch("cropType");
    const cropVariety = methods.watch("cropVariety");

    // Memoized selected crop to get crop ID
    const selectedCrop = useMemo(
      () => allCrops.find((c) => c.name === cropType),
      [allCrops, cropType],
    );

    // Use planting window hook to fetch fresh recommendations
    const { isAnalyzing, showResults, analysisResults } = usePlantingWindow({
      cropVariety,
      farmDetails,
      cropId: selectedCrop?.id,
      enabled: Boolean(cropVariety && farmDetails && selectedCrop?.id),
      forceShow: false,
    });

    // Initialize irrigation state from existing plan
    const [useIrrigation, setUseIrrigation] = useState(
      existingPlan.useIrrigation,
    );

    // Use api.useMutation for updating the farm plan
    const updatePlanMutation = api.useMutation(
      "put",
      "/farm-planning/farm-plan/{FarmPlanId}",
      {
        onSuccess: async () => {
          showSuccessToast("Farm plan updated successfully");
          // Invalidate queries to refresh the data
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: FARM_PLAN_QUERY_KEY_ROOT,
            }),
            queryClient.invalidateQueries({
              queryKey: FARM_PLANS_QUERY_KEY_ROOT,
            }),
          ]);
          router.push(
            `/farm-owner/farm-plan/summary?farmPlanId=${existingPlan.id}`,
          );
        },
        onError: (error) => {
          logger.error("Error updating farm plan", error);
          showErrorToast(
            error.errors?.[0]?.message ??
              "Failed to update farm plan, please try again.",
          );
        },
      },
    );

    // Memoized derived values
    const cropTypes = useMemo(
      () => allCrops.map((c) => c.name || "").filter(Boolean),
      [allCrops],
    );

    const varieties = useMemo(
      () => selectedCrop?.cropVariety || [],
      [selectedCrop],
    );

    // Handlers with useCallback
    const handleCropTypeSelect = useCallback(
      (value: string) => {
        // Crop type is disabled in edit mode, but we keep the handler for consistency
        methods.setValue("cropType", value);
      },
      [methods],
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

    const handleUpdate = useCallback(async () => {
      if (!farmId || !landId || !selectedCrop?.id) {
        // Detect which fields are missing
        const missingFields: string[] = [];
        if (!farmId) missingFields.push(t("errors.missingFarmId"));
        if (!landId) missingFields.push(t("errors.missingLandId"));
        if (!selectedCrop?.id) missingFields.push(t("errors.missingCropId"));

        // Show localized error toast with missing fields
        showErrorToast(
          t("errors.missingMultipleFields", {
            fields: missingFields.join(", "),
          }),
        );

        logger.error("Missing required data for farm plan update", {
          farmId,
          landId,
          cropId: selectedCrop?.id,
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

      await updatePlanMutation.mutateAsync({
        params: {
          path: {
            FarmPlanId: existingPlan.id,
          },
        },
        body: {
          cropVarietyId: selectedVarietyObj?.id || null,
          userStartDate,
        },
      });
    }, [
      farmId,
      landId,
      selectedCrop,
      existingPlan.id,
      varieties,
      methods,
      updatePlanMutation,
      t,
    ]);

    if (isLoading) {
      return <ProductionPlanSkeleton isEditMode={true} />;
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
                isEditMode={true}
              />

              {/* Show planting window analysis */}
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
                  onClick={handleUpdate}
                  disabled={
                    updatePlanMutation.isPending || !cropType || !cropVariety
                  }
                >
                  {updatePlanMutation.isPending ? (
                    <Loader2 className="primar-foreground size-4 animate-spin" />
                  ) : (
                    "Update Farm Plan"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </FormProvider>
    );
  },
);

ProductionPlanEditForm.displayName = "ProductionPlanEditForm";

export default ProductionPlanEditForm;
