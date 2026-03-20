"use client";

import { useQuery } from "@tanstack/react-query";

import { useApiClient } from "../api";
import { useAuthUser } from "../stores/auth-store-ssr";

export function useFarmPlans(farmId?: string) {
  const api = useApiClient();
  const { userId: authUserId } = useAuthUser();
  const isValidUserId = Boolean(authUserId);

  const options = api.queryOptions(
    "get",
    "/farm-planning/farm-plans/by-farmer",
    {
      params: {
        query: {
          FarmerId: authUserId ?? "",
          ...(farmId ? { FarmId: farmId } : {}),
        },
      },
    },
    {
      enabled: isValidUserId,
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
    data: farmPlansData,
    error,
    isPending: isLoading,
    isError,
  } = useQuery({
    queryKey,
    ...queryOptionsWithoutKey,
  });

  return {
    queryKey,
    farmPlansData,
    isLoading,
    isError,
    error,
    isValidUserId,
  };
}

export const FARM_PLANS_QUERY_KEY_ROOT = [
  "get",
  "/farm-planning/farm-plans/by-farmer",
] as const;
