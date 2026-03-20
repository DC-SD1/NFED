"use client";

import { useEffect } from "react";
import type { UseFormSetValue } from "react-hook-form";

import type { CenterDetailData } from "@/lib/schemas/fulfilment-center-schema";
import type { FormDataProps } from "@/lib/stores/fulfilment-center-store/fufilment-center-store";

/**
 * @name useRestoreFulfilmentCenterFormData
 * @description Restores form data from the fulfillment center store cache into the react-hook-form.
 *              This hook synchronizes the cached form data with the form state, ensuring that
 *              when users navigate between steps, their entered data is preserved and restored.
 *              Only restores data when cacheFormData contains actual values (not empty/default).
 * @param {FormDataProps} cacheFormData - The cached form data from the fulfillment center store.
 * @param {UseFormSetValue<CenterDetailData>} setValue - The setValue function from react-hook-form.
 * @returns {void}
 */
export function useRestoreFulfilmentCenterFormData(
  cacheFormData: FormDataProps,
  setValue: UseFormSetValue<CenterDetailData>,
): void {
  useEffect(() => {
    if (cacheFormData) {
      setValue("name", cacheFormData.name, { shouldDirty: true });
      setValue("country", cacheFormData.country, { shouldDirty: true });
      setValue("phoneNumber", cacheFormData.phoneNumber, { shouldDirty: true });
      setValue("locationAddress", cacheFormData.locationAddress, {
        shouldDirty: true,
      });
      setValue("googleMapLink", cacheFormData.googleMapLink, {
        shouldDirty: true,
      });
      setValue("focusCrops", cacheFormData.focusCrops, { shouldDirty: true });
      setValue("region", cacheFormData.region, { shouldDirty: true });
      setValue("assignedDistricts", cacheFormData.assignedDistricts, {
        shouldDirty: true,
      });
    }
  }, [cacheFormData, setValue]);
}
