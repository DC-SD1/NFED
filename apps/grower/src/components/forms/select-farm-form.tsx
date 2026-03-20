"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { useApiClient } from "@/lib/api";
import { FARM_PLANS_QUERY_KEY_ROOT } from "@/lib/queries/farm-plans-query";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";
import { useLocalizedErrorHandler } from "@/lib/utils/localized-error-handler";
import { showErrorToast } from "@/lib/utils/toast";
import {
  extractFarmsData,
  type FarmDetailsResponse,
} from "@/utils/farm-api-helpers";

import BaseFarmSelectionForm from "./base-farm-selection-form";

export interface FarmSearchFormProps {
  selfAssign?: boolean;
}

export default function FarmSearchForm({ selfAssign }: FarmSearchFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allFarms, setAllFarms] = useState<FarmDetailsResponse[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const router = useRouter();
  const tError = useTranslations("auth.errors");
  const api = useApiClient();
  const { handleError } = useLocalizedErrorHandler();
  const { userId: authUserId } = useAuthUser();
  const queryClient = useQueryClient();

  const { data, isFetching, isLoading } = api.useQuery(
    "get",
    "/farm-management/get-farms",
    {
      params: {
        query: {
          FarmOwnerId: authUserId || "",
          PageNumber: currentPage,
          PageSize: 20,
        },
      },
    },
    {
      enabled: !!authUserId,
      retry: (failureCount, error) => {
        if (error && "status" in error && error.status === 401) return false;
        return failureCount < 3;
      },
    },
  );

  // Reset farms when authUserId changes
  useEffect(() => {
    setAllFarms([]);
    setCurrentPage(1);
    setHasMore(true);
  }, [authUserId]);

  // Aggregate farms as pages load
  useEffect(() => {
    if (data) {
      const farms = extractFarmsData(data);
      setAllFarms((prev) => [...prev, ...farms]);

      const pageData = data.data?.pageData;
      if (pageData?.currentPage && pageData.totalPages) {
        setHasMore(pageData.currentPage < pageData.totalPages);
      }
    }
  }, [data]);

  // Use aggregated farms
  const farmLands = allFarms;

  const handleNext = async (selectedFarm: string) => {
    if (!selfAssign) {
      console.log("Selected farm:", selectedFarm);
      router.push(
        `/farm-owner/farm-managers/hire-manager/work-conditions?farmId=${selectedFarm}`,
      );
      return;
    }

    setIsProcessing(true);
    console.log("Selected farm:", selectedFarm);
    console.log("USER id:", authUserId);

    try {
      const { error: postError, data: selfAssignData } = await api.client.POST(
        "/farm-management/self-assign",
        {
          body: { farmId: selectedFarm, farmOwnerId: authUserId || "" },
        },
      );

      if (
        postError?.errors?.some((err) =>
          err.message
            ?.toLowerCase()
            .includes("maximum number of active/renewed contracts"),
        )
      ) {
        handleError("maximum number of active/renewed contracts");
        return;
      } else if (
        postError?.errors?.some((err) =>
          err.message
            ?.toLowerCase()
            .includes("An active contract already exists"),
        )
      ) {
        showErrorToast(tError("already_managing"));
        return;
      }

      if (!selfAssignData) {
        showErrorToast(tError("error_assigning_self"));
        return;
      }

      if (!selfAssignData || postError) {
        showErrorToast("Failed to self assign farm");
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: FARM_PLANS_QUERY_KEY_ROOT,
      });
      void queryClient.invalidateQueries({
        queryKey: ["/farm-management/get-farms"],
      });
      router.push(`/farm-owner/farm-managers/assign-myself/success`);
    } catch (_error) {
      showErrorToast("Failed to self assign farm. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      if (scrollPercentage > 0.8 && hasMore && !isFetching) {
        setCurrentPage((prev) => prev + 1);
      }
    },
    [hasMore, isFetching],
  );

  return (
    <BaseFarmSelectionForm
      farmLands={farmLands}
      isLoading={isLoading}
      onNext={handleNext}
      isProcessing={isProcessing}
      nextButtonLabel="Next"
      onScroll={handleScroll}
      isFetchingNextPage={isFetching && farmLands.length > 0}
    />
  );
}
