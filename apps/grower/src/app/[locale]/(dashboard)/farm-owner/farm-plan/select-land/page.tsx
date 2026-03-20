"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import TopLeftHeaderLayout from "@/components/dashboard/top-left-header";
import BaseFarmSelectionForm from "@/components/forms/base-farm-selection-form";
import { useApiClient } from "@/lib/api";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";
import {
  extractFarmsData,
  type FarmDetailsResponse,
} from "@/utils/farm-api-helpers";

export default function SelectFarmLandPage() {
  const t = useTranslations("farmPlan.selectLand");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allFarms, setAllFarms] = useState<FarmDetailsResponse[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const api = useApiClient();
  const { userId: authUserId } = useAuthUser();

  const _crops = searchParams.get("crops") || "";

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
    setIsProcessing(true);
    try {
      const farm = (farmLands || []).find((f) => f.farmId === selectedFarm);
      const firstLandId = farm?.lands?.[0]?.id;

      if (!firstLandId) {
        toast.error(t("errors.nextFailed"));
        return;
      }

      router.push(
        `/farm-owner/farm-plan/production-plan?farmId=${selectedFarm}&landId=${firstLandId}`,
      );
    } catch (error) {
      console.error("Error proceeding to next step:", error);
      toast.error(t("errors.nextFailed"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAsDraft = async (selectedFarm: string) => {
    setIsSavingDraft(true);
    try {
      // TODO: Save farm plan as draft to API
      console.log("Saving farm plan as draft with farm:", selectedFarm);

      toast.success(t("draftSaved"));
      router.push("/farm-owner");
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error(t("errors.saveDraftFailed"));
    } finally {
      setIsSavingDraft(false);
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
    <TopLeftHeaderLayout>
      <div className="flex flex-col items-center justify-center p-2 md:px-12">
        <div className="w-full max-w-4xl space-y-8 md:max-w-6xl lg:max-w-2xl">
          {/* Header */}
          <div className="space-y-3 text-left md:text-center">
            <h1 className="text-foreground text-3xl font-semibold leading-9">
              {t("title")}
            </h1>
            <p className="text-muted-foreground w-2/3 break-words text-sm leading-6 md:w-full">
              {t("subtitle")}
            </p>
            <BaseFarmSelectionForm
              farmLands={farmLands}
              isLoading={isLoading}
              onNext={handleNext}
              isProcessing={isProcessing}
              nextButtonLabel={t("next")}
              showSecondaryButton={true}
              secondaryButtonTitle={t("saveAsDraft")}
              secondaryButtonClassName="bg-gray-light hover:bg-gray-light/90 h-14 w-full rounded-2xl text-[#1A5514]"
              onSecondaryAction={handleSaveAsDraft}
              isSecondaryProcessing={isSavingDraft}
              onScroll={handleScroll}
              isFetchingNextPage={isFetching && farmLands.length > 0}
            />
          </div>
        </div>
      </div>
    </TopLeftHeaderLayout>
  );
}
