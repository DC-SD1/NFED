"use client";

import { useQuery } from "@tanstack/react-query";

import { useApiClient } from "../api";

export function useFarmPlan(farmPlanId?: string) {
  const api = useApiClient();
  const isValidFarmPlanId = Boolean(farmPlanId);

  const options = api.queryOptions(
    "get",
    "/farm-planning/farm-plan",
    {
      params: {
        query: {
          FarmPlanId: farmPlanId ?? "",
        },
      },
    },
    {
      enabled: isValidFarmPlanId,
      retry: (failureCount, error: unknown) => {
        if (error && typeof error === "object" && "status" in error) {
          const e = error as { status?: number };
          if (e.status === 401) return false;
        }
        return failureCount < 3;
      },
    },
  );

  const { queryKey, ...queryOptionsWithoutKey } = options;
  const {
    data: farmPlanData,
    error,
    isPending: isLoading,
    isError,
  } = useQuery({
    queryKey,
    ...queryOptionsWithoutKey,
  });

  return {
    queryKey,
    farmPlanData,
    isLoading,
    isError,
    error,
    isValidFarmPlanId,
  };
}

export const FARM_PLAN_QUERY_KEY_ROOT = [
  "get",
  "/farm-planning/farm-plan",
] as const;
