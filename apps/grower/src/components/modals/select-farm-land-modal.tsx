"use client";

import { Button, Input } from "@cf/ui";
import { CustomRadioButton } from "@cf/ui/components/radio-button";
import { Search } from "@cf/ui/icons";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { useApiClient } from "@/lib/api";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";
import { useModal } from "@/lib/stores/use-modal";
import type { GeoFeature } from "@/lib/utils/map-helpers";
import { showErrorToast } from "@/lib/utils/toast";
import {
  extractFarmsData,
  type FarmDetailsResponse,
  type FarmStatus,
} from "@/utils/farm-api-helpers";
import { createMapData, getFarmStatus } from "@/utils/map-farm-lands";

import FarmCardSkeleton from "../dashboard/skeletons/select-farm-popup-skeleton";
import type { FarmLandItem } from "../forms/base-farm-selection-form";
import PolygonMap from "../map/polygon-map";

export interface Farm {
  id: string;
  name: string;
  acres: number;
  region: string;
  status: FarmStatus | "Not started";
  geoData: GeoFeature;
}

// eslint-disable-next-line max-lines-per-function
export default function SelectFarmLandModal() {
  const { isOpen, onClose, type, data: modalData } = useModal();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFarm, setSelectedFarm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [allFarms, setAllFarms] = useState<FarmDetailsResponse[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const t = useTranslations("dashboard.hireManager");
  const api = useApiClient();
  const queryClient = useQueryClient();
  const { userId: authUserId } = useAuthUser();
  const searchParams = useSearchParams();
  const managerId = searchParams.get("id")!;
  const isModalOpen = isOpen && type === "SelectFarmLand";

  const { data, isFetching } = api.useQuery(
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
      enabled: !!authUserId && isModalOpen,
      retry: (failureCount, error) => {
        if (error && "status" in error && error.status === 401) return false;
        return failureCount < 3;
      },
    },
  );

  const { mutate: assignFarm } = api.useMutation(
    "post",
    "/farm-management/assign",
  );

  // Reset when modal opens/closes
  useEffect(() => {
    if (isModalOpen) {
      setCurrentPage(1);
      setAllFarms([]);
      setHasMore(true);
      setSelectedFarm("");
      setSearchQuery("");
    }
  }, [isModalOpen, authUserId]);

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

  const farmLandsData = allFarms;

  const farms: Farm[] = farmLandsData
    ? farmLandsData.map((farm: FarmLandItem) => ({
        id: farm.farmId || "",
        name: farm.farmName || "",
        acres: farm.acreage || 0,
        region:
          `${farm.village || ""} ${farm.region || ""}`.trim() ||
          "Location not specified",
        status: getFarmStatus(farm) as Farm["status"],
        geoData: createMapData(farm),
      }))
    : [];

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

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

  if (!isModalOpen) return null;

  const filteredFarms = farms.filter((farm: Farm) => {
    const query = searchQuery.toLowerCase();
    return (
      farm.name.toLowerCase().includes(query) ||
      farm.region.toLowerCase().includes(query)
    );
  });

  const handleSelect = (farmId: string) => {
    setSelectedFarm(farmId);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (selectedFarm) {
      setSelectedFarm("");
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleSaveAndAssign = () => {
    if (!selectedFarm) return;

    const selectedFarmData = farms.find(
      (farm: Farm) => farm.id === selectedFarm,
    );

    assignFarm(
      {
        body: {
          farmId: selectedFarm,
          farmOwnerId: authUserId || "",
          farmManagerId: managerId || "",
        },
      },
      {
        onError: () => {
          showErrorToast("Failed to assign farm");
        },
        onSuccess: () => {
          void queryClient.invalidateQueries({
            queryKey: ["/farm-management/get-farms"],
          });
          onClose();
          setTimeout(() => {
            if (modalData?.onFarmAssigned && selectedFarmData) {
              modalData.onFarmAssigned(selectedFarm, selectedFarmData.name);
            }
          }, 100);
        },
      },
    );
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="border-input relative max-h-[80vh] w-[90vw] max-w-2xl overflow-hidden rounded-3xl border bg-white p-6 shadow-xl">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold">Select farm land</h2>
          <Button
            onClick={handleClose}
            className="rounded-full bg-transparent p-1 text-lg font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="size-6" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="text-input-placeholder absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder={t("searchLand")}
            value={searchQuery}
            onChange={handleSearchChange}
            className="border-input-border bg-input rounded-lg  pl-10"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              type="button"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Farm Listings */}
        <div
          className="my-8 max-h-[250px] space-y-2 overflow-y-auto px-0 pb-6"
          onScroll={handleScroll}
        >
          {isFetching && allFarms.length === 0 ? (
            <FarmCardSkeleton count={3} />
          ) : (
            <>
              {filteredFarms.map((farm: Farm) => (
                <div
                  key={farm.id}
                  className="relative cursor-pointer rounded-md  p-2 shadow-lg transition-shadow"
                  onClick={() => handleSelect(farm.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelect(farm.id);
                    }
                  }}
                >
                  {/* Custom Radio Button - Top Right */}
                  <div className="absolute right-4 top-4">
                    <CustomRadioButton
                      isSelected={selectedFarm === farm.id}
                      onClick={() => handleSelect(farm.id)}
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <PolygonMap
                        data={farm.geoData}
                        className="h-[90px] w-[105px] rounded"
                        boundsPadding={{
                          top: 10,
                          bottom: 10,
                          left: 10,
                          right: 10,
                        }}
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="mb-2 text-start text-base font-thin">
                        {farm.name}
                      </h3>
                      <p className="mb-2 text-start text-base font-thin">
                        {farm.acres} acres
                      </p>
                      <p className="text-gray-dark text-sm">{farm.region}</p>
                    </div>
                  </div>
                </div>
              ))}

              {filteredFarms.length === 0 &&
                !isFetching &&
                allFarms.length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    <p>
                      {searchQuery
                        ? `No farms found matching "${searchQuery}"`
                        : "No farms available"}
                    </p>
                    {searchQuery && (
                      <Button
                        onClick={handleClearSearch}
                        variant="unstyled"
                        className="text-primary bg-transparent text-sm hover:underline"
                      >
                        Clear search
                      </Button>
                    )}
                  </div>
                )}
              {isFetching && allFarms.length > 0 && (
                <div className="py-4 text-center text-sm text-gray-500">
                  Loading more...
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-4 flex w-full items-center justify-center">
          <Button
            onClick={handleSaveAndAssign}
            disabled={!selectedFarm || isFetching}
            className="bg-primary w-3/4   rounded-xl py-3 text-base font-medium"
          >
            {isFetching && allFarms.length === 0
              ? "Processing..."
              : "Save and assign"}
          </Button>
        </div>
      </div>
    </div>
  );
}
