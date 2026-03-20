import { useQuery } from "@tanstack/react-query";

import { useApiClient } from "../api";
import { shouldRetry } from "../utils";

export function useFarmLandsDetail(farmId: string | undefined) {
  const hasValidId = Boolean(farmId);
  const api = useApiClient();

  const options = api.queryOptions(
    "post",
    "/farm-management/get-farm-detail",
    {
      body: {
        identifier: farmId ?? "",
      },
    },
    {
      enabled: hasValidId,
      retry: shouldRetry,
    },
  );

  const { queryKey, ...queryOptionsWithoutKey } = options;

  const {
    data: farmLandDetailsData,
    error,
    isPending,
    isError,
  } = useQuery({
    queryKey,
    ...queryOptionsWithoutKey,
  });

  return {
    queryKey,
    farmLandDetailsData,
    isPending,
    isError,
    error,
  };
}

export const FARM_LAND_DETAILS_QUERY_KEY_ROOT = [
  "post",
  "/farm-management/get-farm-detail",
] as const;
