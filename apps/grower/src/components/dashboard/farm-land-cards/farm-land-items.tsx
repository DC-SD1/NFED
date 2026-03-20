import type { paths } from "@cf/api";
import { Button } from "@cf/ui/components/button";
import { Plus, PlusCircleIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

import experiencedImage from "@/assets/images/experienced.png";
import openLandsImage from "@/assets/images/farm-lands/open-lands.png";
import { useApiClient } from "@/lib/api";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";
import { showErrorToast } from "@/lib/utils/toast";
import {
  extractFarmsData,
  extractPaginationData,
  type FarmStatus,
} from "@/utils/farm-api-helpers";
import {
  createMapData,
  getCropCultivationStatus,
  getLandStatus,
  getSoilProfileStatus,
  mapLandStatusDisplay,
} from "@/utils/map-farm-lands";

import FarmCard from "../farm-land-card";
import FarmListingSkeleton from "../skeletons/farm-listing-skeleton";

type FarmLandsResponse =
  paths["/farm-management/get-farms"]["get"]["responses"]["200"]["content"]["application/json"];
export type FarmLandItem = NonNullable<
  NonNullable<FarmLandsResponse["data"]>["data"]
>[number];

export interface FarmLandItemsProps {
  activeFilter?: string;
  searchQuery?: string;
}

export default function FarmLandItems({
  activeFilter,
  searchQuery,
}: FarmLandItemsProps) {
  const router = useRouter();
  const api = useApiClient();
  const t = useTranslations("dashboard.farmManager.emptyState");

  const { userId: authUserId } = useAuthUser();

  // Pagination state at component level
  const [page, setPage] = useState(1);

  const handleAdd = () => {
    router.push("/farm-owner/farm-lands/add");
  };

  const { data: response, isLoading } = api.useQuery(
    "get",
    "/farm-management/get-farms",
    {
      params: {
        query: {
          FarmOwnerId: authUserId || "",
          PageNumber: page,
          PageSize: 10,
          Statuses:
            activeFilter && activeFilter !== "All"
              ? ([activeFilter] as FarmStatus[])
              : undefined,
          SearchTerm: searchQuery || undefined,
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

  const farmLands = extractFarmsData(response);
  const pageData = extractPaginationData(response);

  // Pre-process map data to prevent re-creation on every render
  // Must be called BEFORE any conditional returns
  const farmsWithMapData = useMemo(() => {
    if (!farmLands) return [];
    const result = farmLands.map((farm) => {
      const mapData = createMapData(farm);
      // Freeze the mapData object to prevent mutations
      Object.freeze(mapData);
      Object.freeze(mapData.geometry);
      Object.freeze(mapData.properties);
      return {
        ...farm,
        mapData,
      };
    });
    return result;
  }, [farmLands]);

  const handleViewDetails = useCallback(
    (id: string) => {
      if (!id) return;
      router.push(`/farm-owner/farm-lands/details/${id}`);
    },
    [router],
  );

  const updateStatus = api.useMutation(
    "put",
    "/farm-planning/lands/{LandId}/start-farming",
    {
      onSuccess: (data, variables) => {
        const landId = variables.params.path.LandId;
        router.push(`/farm-owner/farm-grow?landId=${landId}`);
      },
      onError: (error) => {
        if (error?.errors?.[0]?.code === "LAND_NOT_FOUND") {
          showErrorToast("Land not found");
          return;
        }
        showErrorToast("Something went wrong, whilst starting farming");
        return;
      },
    },
  );

  const handleStartFarming = (landId: string) => {
    updateStatus.mutate({
      params: {
        path: {
          LandId: landId,
        },
      },
    });
  };

  // Use server-side pagination
  const totalPages = pageData?.totalPages ?? 1;
  const paginatedFarms = farmsWithMapData;

  // Handlers for pagination
  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [activeFilter, searchQuery]);

  if (isLoading) {
    return <FarmListingSkeleton />;
  }

  return (
    <div className="mb-24 flex items-center justify-center px-0 py-6 sm:py-8 md:px-4 xl:mb-0">
      {farmsWithMapData && farmsWithMapData.length > 0 ? (
        <div className="flex w-full flex-col items-center">
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
            {paginatedFarms.map((farm) => {
              const landStatus = mapLandStatusDisplay(getLandStatus(farm));

              return (
                <FarmCard
                  key={farm.farmId}
                  farmName={farm.farmName || ""}
                  acreage={farm.acreage || 0}
                  status={landStatus}
                  hasFarmPlans={Object.values(farm?.landStatuses ?? {}).some(
                    (land) => land.hasFarmPlan ?? false,
                  )}
                  location={
                    `${farm.village || ""} ${farm.region || ""}`.trim() ||
                    "Location not specified"
                  }
                  cropCultivated={getCropCultivationStatus(farm)}
                  soilProfile={getSoilProfileStatus(farm)}
                  data={farm.mapData}
                  onMoreDetails={() => handleViewDetails(farm.farmId || "")}
                  isPending={updateStatus.isPending}
                  onStartFarming={() =>
                    handleStartFarming(farm.lands?.[0]?.id || "")
                  }
                />
              );
            })}
            <Button
              onClick={handleAdd}
              variant="unstyled"
              className="flex h-[400px] flex-col items-center justify-center rounded-2xl border border-l-gray-light p-4 font-extrabold focus:outline-none md:p-8"
            >
              <PlusCircleIcon className="mb-2 !h-10 !w-10 " />
              <span className="text-xs font-normal md:text-sm">
                Add farm land
              </span>
            </Button>
          </div>
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <Button
                onClick={handlePrev}
                disabled={page === 1}
                variant="outline"
                className="px-4 py-2"
              >
                Previous
              </Button>
              <span className="text-sm font-medium">
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={handleNext}
                disabled={page === totalPages}
                variant="outline"
                className="px-4 py-2"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-8">
            <div className="flex justify-center">
              <Image
                src={
                  activeFilter && activeFilter !== "All"
                    ? openLandsImage
                    : experiencedImage
                }
                alt={
                  activeFilter && activeFilter !== "All"
                    ? "Open farm lands"
                    : "Experienced"
                }
                width={100}
                height={100}
                className="rounded-md object-contain"
              />
            </div>

            <div className="space-y-4">
              <h1 className="text-xl font-bold text-gray-900 md:text-2xl">
                {activeFilter && activeFilter !== "All"
                  ? t("filtered.title")
                  : t("subtitle")}
              </h1>
              <p className="text-sm leading-relaxed text-gray-600 md:text-base">
                {activeFilter && activeFilter !== "All"
                  ? t("filtered.subtitle", { filter: activeFilter })
                  : t("description")}
              </p>
            </div>

            {activeFilter && activeFilter !== "All" ? (
              <Button
                className="w-full rounded-2xl bg-primary px-6 py-3 font-medium text-white"
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("landFilter", "All");
                  router.push(url.pathname + url.search);
                }}
              >
                {t("filtered.clearButton")}
              </Button>
            ) : (
              <Button
                className="w-full rounded-2xl bg-primary px-6 py-3 font-medium text-white"
                onClick={handleAdd}
              >
                {t("addFarmLand")}
                <Plus className="ml-2 size-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
