"use client";

import { useEffect } from "react";
import type { UseFormSetValue } from "react-hook-form";

import type { ManagementTeamData } from "@/lib/schemas/fulfilment-center-schema";
import type { FormDataProps } from "@/lib/stores/fulfilment-center-store/fufilment-center-store";

/**
 * @name useRestoreManagementTeamFormData
 * @description Restores management team form data from the fulfillment center store cache into the react-hook-form.
 *              This hook synchronizes the cached form data with the form state, ensuring that
 *              when users navigate between steps, their entered management team data is preserved and restored.
 *              Sets form fields as dirty to reflect that data has been restored from cache.
 * @param {FormDataProps} cacheFormData - The cached form data from the fulfillment center store.
 * @param {UseFormSetValue<ManagementTeamData>} setValue - The setValue function from react-hook-form.
 * @returns {void}
 */
export function useRestoreManagementTeamFormData(
  cacheFormData: FormDataProps,
  setValue: UseFormSetValue<ManagementTeamData>,
): void {
  useEffect(() => {
    if (cacheFormData) {
      setValue("regionalManagerId", cacheFormData.regionalManagerId, {
        shouldDirty: true,
      });
      setValue("operationsDirectorId", cacheFormData.operationsDirectorId, {
        shouldDirty: true,
      });
      setValue("warehouseManagerId", cacheFormData.warehouseManagerId, {
        shouldDirty: true,
      });
      setValue("fieldAgronomistId", cacheFormData.fieldAgronomistId, {
        shouldDirty: true,
      });
      setValue("fieldCoordinatorId", cacheFormData.fieldCoordinatorId, {
        shouldDirty: true,
      });
    }
  }, [cacheFormData, setValue]);
}
