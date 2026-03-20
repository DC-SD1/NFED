"use client";

import type { paths } from "@cf/api";
import { Badge, Button, Input } from "@cf/ui";
import { CustomRadioButton } from "@cf/ui/components/radio-button";
import { ChevronRight, Search } from "@cf/ui/icons";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";

import { createMapData } from "@/utils/map-farm-lands";

import FarmSearchFormSkeleton from "../dashboard/skeletons/select-farm-form-skeleton";
import LiveOrStaticMap from "../map/live-or-static";

const getStatusColor = (status: string) => {
  switch (status) {
    case "Not started":
      return "bg-white";
    case "Planting":
      return "bg-white";
    case "Cultivating":
      return "bg-yellow-dark";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
};

type FarmLandsResponse =
  paths["/farm-management/get-farms"]["post"]["responses"]["200"]["content"]["application/json"];
export type FarmLandItem = NonNullable<NonNullable<FarmLandsResponse>>[number];

export interface BaseFarmSelectionFormProps {
  farmLands?: FarmLandItem[];
  isLoading?: boolean;
  onNext: (selectedFarm: string) => Promise<void> | void;
  isProcessing?: boolean;
  nextButtonLabel?: string;
  showSecondaryButton?: boolean;
  secondaryButtonTitle?: string;
  secondaryButtonClassName?: string;
  onSecondaryAction?: (selectedFarm: string) => Promise<void> | void;
  isSecondaryProcessing?: boolean;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  isFetchingNextPage?: boolean;
}

export default function BaseFarmSelectionForm({
  farmLands,
  isLoading = false,
  onNext,
  isProcessing = false,
  nextButtonLabel = "Next",
  showSecondaryButton = false,
  secondaryButtonTitle = "Secondary Action",
  secondaryButtonClassName = "",
  onSecondaryAction,
  isSecondaryProcessing = false,
  onScroll,
  isFetchingNextPage = false,
}: BaseFarmSelectionFormProps) {
  const t = useTranslations("dashboard.hireManager");

  // Using nuqs for state management
  const [searchQuery, setSearchQuery] = useQueryState(
    "farmSearch",
    parseAsString.withDefault(""),
  );

  const [selectedFarm, setSelectedFarm] = useQueryState(
    "selectedFarm",
    parseAsString.withDefault(""),
  );

  // Enhanced search functionality with memoization for performance
  const filteredFarms = useMemo(() => {
    if (!farmLands || !searchQuery.trim()) {
      return farmLands || [];
    }

    const query = searchQuery.toLowerCase().trim();

    return farmLands.filter((farm) => {
      // Search by farm name
      const farmName = (farm.farmName || "").toLowerCase();
      if (farmName.includes(query)) return true;

      // Search by village
      const village = (farm.village || "").toLowerCase();
      if (village.includes(query)) return true;

      // Search by region
      const region = (farm.region || "").toLowerCase();
      if (region.includes(query)) return true;

      // Search by combined location (village + region)
      const fullLocation = `${village} ${region}`.trim();
      if (fullLocation.includes(query)) return true;

      // Search by acreage (if user types a number)
      const acreageStr = (farm.acreage || 0).toString();
      if (acreageStr.includes(query)) return true;

      // Search in lands array if it exists
      if (farm.lands && Array.isArray(farm.lands)) {
        const landsMatch = farm.lands.some((land) => {
          const landName = (land?.location?.name || "").toLowerCase();
          return landName.includes(query);
        });
        if (landsMatch) return true;
      }

      return false;
    });
  }, [farmLands, searchQuery]);

  // Clear search functionality
  const clearSearch = () => {
    void setSearchQuery("");
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    void setSearchQuery(e.target.value);
    // Clear selected farm if search changes to avoid confusion
    if (selectedFarm && e.target.value !== searchQuery) {
      void setSelectedFarm("");
    }
  };

  const handleSelect = (farmId: string) => {
    void setSelectedFarm(farmId);
  };

  const handleNext = async () => {
    if (selectedFarm) {
      await onNext(selectedFarm);
    }
  };

  const handleSecondaryAction = async () => {
    if (onSecondaryAction && selectedFarm) {
      await onSecondaryAction(selectedFarm);
    }
  };

  if (isLoading || !farmLands) {
    return <FarmSearchFormSkeleton />;
  }

  return (
    <div className="flex h-full flex-col space-y-2">
      {/* Search Bar */}
      <div className="border-input-border relative mb-3 w-full rounded-xl border">
        <Search className="text-input-placeholder absolute left-3 top-1/2 size-4 -translate-y-1/2" />
        <Input
          type="text"
          placeholder={t("searchLand")}
          value={searchQuery}
          onChange={handleSearchChange}
          className="bg-input rounded-xl border-none px-10"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            type="button"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      {searchQuery && (
        <div className="text-sm text-gray-600">
          {filteredFarms.length === 0 ? (
            <p>No farms found matching &quot;{searchQuery}&quot;</p>
          ) : (
            <p>
              Found {filteredFarms.length} farm
              {filteredFarms.length !== 1 ? "s" : ""}
              &nbsp;matching &quot;{searchQuery}&quot;
            </p>
          )}
        </div>
      )}

      {/* Farm Listings */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <div
          className="h-full max-h-[400px] space-y-4 overflow-y-auto pr-2"
          onScroll={onScroll}
        >
          {filteredFarms.length === 0 && !searchQuery ? (
            <div className="py-8 text-center text-gray-500">
              <p>No farms available</p>
            </div>
          ) : (
            <>
              {filteredFarms.map((farm) => (
                <div
                  key={farm.farmId}
                  className="relative cursor-pointer rounded-xl bg-white p-4 shadow-lg transition-shadow hover:shadow-md"
                  onClick={() => handleSelect(farm.farmId || "")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelect(farm.farmId || "");
                    }
                  }}
                >
                  <div className="absolute right-4 top-4">
                    <CustomRadioButton
                      isSelected={selectedFarm === farm.farmId}
                      onClick={() => handleSelect(farm.farmId || "")}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Farm Image */}
                    <div className="relative shrink-0">
                      <LiveOrStaticMap
                        data={createMapData(farm)}
                        className="h-28 w-36 rounded-xl md:w-48"
                        boundsPadding={{
                          top: 10,
                          bottom: 10,
                          left: 10,
                          right: 10,
                        }}
                      />
                      <Badge
                        className={`absolute left-2 top-2 text-xs font-thin text-black ${getStatusColor("Planting")}`}
                      >
                        {"Not started"}
                      </Badge>
                    </div>

                    {/* Farm Details */}
                    <div className="h-full">
                      <h3 className="mb-2 text-start text-lg font-thin">
                        {farm.farmName || "Unknown Farm"}
                      </h3>
                      <p className="mb-6 text-start text-lg font-thin">
                        {farm.acreage || 0} acres
                      </p>
                      <p className="text-gray-dark">
                        {(() => {
                          const village = farm.village || "";
                          const region = farm.region || "";
                          const location = `${village} ${region}`.trim();
                          return location || "Location not specified";
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading indicator for infinite scroll */}
              {isFetchingNextPage && (
                <div className="py-4 text-center text-sm text-gray-500">
                  Loading more farms...
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="!mt-8 flex w-full flex-col gap-3 pt-4">
        <div className="w-full">
          <Button
            onClick={handleNext}
            disabled={isProcessing || !selectedFarm}
            className="bg-primary flex w-full items-center justify-center rounded-xl"
            size="lg"
          >
            {isProcessing ? "Processing..." : nextButtonLabel}
            <ChevronRight className="ml-2 size-5" />
          </Button>
        </div>

        {showSecondaryButton && (
          <div className="w-full">
            <Button
              onClick={handleSecondaryAction}
              disabled={isSecondaryProcessing || !selectedFarm}
              className={secondaryButtonClassName || "w-full"}
              variant="secondary"
              size="lg"
            >
              {isSecondaryProcessing ? "Processing..." : secondaryButtonTitle}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
