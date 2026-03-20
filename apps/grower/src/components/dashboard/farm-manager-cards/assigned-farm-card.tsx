"use client";

import { Button, CardContent } from "@cf/ui";
import { BellIcon } from "@cf/ui/icons";
import { ChevronDownCircle, PlusIcon, RotateCw, X } from "lucide-react";
import React, { useState } from "react";

import PolygonMap from "@/components/map/polygon-map";
import { useApiClient } from "@/lib/api";
import { useModal } from "@/lib/stores/use-modal";
import { mapFarmStatus as unifiedMapFarmStatus } from "@/utils/farm-api-helpers";
import type { ManagerLandItem } from "@/utils/map-farm-lands";
import { createMapData, transformFarmForMapData } from "@/utils/map-farm-lands";

import AssignedFarmLandsSkeleton from "../skeletons/asssign-farm-land-skeleton";

interface Details {
  fullName: string;
  managerId: string;
}

export default function AssignedFarmLands({ fullName, managerId }: Details) {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const { onOpen, onClose } = useModal();
  const api = useApiClient();

  const { data: farmManagerLand, isLoading } = api.useQuery(
    "get",
    "/farm-management/get-farms-by-manager",
    {
      params: {
        query: {
          FarmManagerId: managerId,
        },
      },
    },
  );

  if (isLoading) {
    return <AssignedFarmLandsSkeleton />;
  }
  const farms = farmManagerLand;

  const handleFarmAssigned = (farmId: string, farmName: string) => {
    console.log(`Farm assigned: ${farmName} (ID: ${farmId})`);
    onOpen("Success", {
      successTitle: "Farm land assigned",
      successDescription: `Farm land assigned to ${fullName} successfully`,
      primaryButton: {
        label: "Done",
        onClick: () => {
          onClose();
        },
        variant: "default",
      },
    });
  };

  const handleAssignClick = () => {
    onOpen("SelectFarmLand", {
      farms: farms,
      onFarmAssigned: handleFarmAssigned,
    });
  };
  const toggleExpand = (farmId: string) => {
    const newExpandedCards = new Set(expandedCards);
    if (newExpandedCards.has(farmId)) {
      newExpandedCards.delete(farmId);
    } else {
      newExpandedCards.add(farmId);
    }
    setExpandedCards(newExpandedCards);
  };

  const isExpanded = (farmId: string) => expandedCards.has(farmId);

  return (
    <div className="size-full h-96   rounded-3xl border-none bg-white p-3">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <h2 className="text-md font-semibold leading-none">
          Assigned farm lands
        </h2>
        <button
          onClick={handleAssignClick}
          className="text-primary flex items-center gap-1 font-medium"
        >
          <PlusIcon size={16} />
          Assign farm land
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="h-72 overflow-y-auto px-2 py-3 pt-2">
        <div className="space-y-6">
          {!farms || farms.length === 0 ? (
            <CardContent className="h-80  text-center">
              <div className="mb-4 flex justify-center">
                <BellIcon />
              </div>
              <h3 className="mb-3 text-base font-semibold">No farm lands</h3>
              <p className="text-gray-dark mb-8">
                No farm has been assigned to you.
                <br />
                Once you are invited to manage the farm it will appear here.
              </p>
            </CardContent>
          ) : (
            farms?.map((farm: ManagerLandItem) => {
              const farmId = farm.id?.toString() || "";
              const statusMapped = unifiedMapFarmStatus(
                farm.status as string | undefined,
              );

              let mapData = null;
              if (farm.location) {
                const transformedFarm = transformFarmForMapData(farm);
                mapData = createMapData(transformedFarm as any);
              }

              return (
                <div
                  key={farmId}
                  className="rounded-lg shadow-lg  transition-colors"
                >
                  {/* Main Card Content */}
                  <div className="flex items-center gap-4 p-4">
                    {/* Farm Image with Status Badge */}
                    <div className="relative">
                      <div className="h-24 w-[100px] overflow-hidden rounded-lg p-0 md:w-[180px]">
                        {mapData ? (
                          <PolygonMap
                            data={mapData}
                            className="size-full"
                            boundsPadding={{
                              top: 10,
                              bottom: 10,
                              left: 10,
                              right: 10,
                            }}
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center bg-gray-100 text-xs text-gray-400">
                            No map data
                          </div>
                        )}
                      </div>

                      {statusMapped && (
                        <span
                          className={`hidden md:absolute md:left-2 md:top-1 md:inline-block md:rounded-full md:px-2 md:text-xs md:font-medium ${statusMapped.className}`}
                        >
                          {statusMapped.label}
                        </span>
                      )}
                    </div>

                    {/* Farm Details */}
                    <div className="flex-1 space-y-2">
                      <h3 className="font-thin">
                        {farm.name || "Unnamed Farm"}
                      </h3>
                      <p className="mb-">{farm.acreage ?? 0} acres</p>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-dark text-sm">
                          {farm.villageLocation || ""} {farm.region || ""}
                        </p>
                        <Button
                          variant="unstyled"
                          onClick={() => toggleExpand(farmId)}
                          className="flex items-center justify-center md:hidden"
                          aria-label="Expand actions"
                        >
                          <ChevronDownCircle
                            className={`text-primary !h-6 !w-6 transition-transform ${
                              isExpanded(farmId) ? "rotate-180" : "rotate-0"
                            }`}
                          />
                        </Button>
                      </div>
                    </div>

                    {/* Action Buttons - Desktop Only */}
                    <div className="hidden items-center gap-3 md:flex">
                      {/* <button className="text-primary flex items-center gap-2 rounded-md px-3 py-2 font-semibold transition-colors">
                        <RotateCw size={16} />
                        <span className="font-medium">Re-assign</span>
                      </button>
                      <button className="text-red-dark flex items-center gap-2 rounded-md px-3 py-2 font-semibold transition-colors">
                        <X size={16} />
                        <span className="font-medium">Remove</span>
                      </button> */}
                    </div>
                  </div>

                  {/* Mobile Expand Button and Actions */}
                  {isExpanded(farmId) && (
                    <div className="py-3 md:hidden">
                      <div className="flex justify-center gap-4">
                        <button className="text-primary flex items-center gap-2 rounded-md px-4 py-2 font-semibold transition-colors">
                          <RotateCw size={16} />
                          <span className="font-medium">Re-assign</span>
                        </button>
                        <button className="text-red-dark flex items-center gap-2 rounded-md px-4 py-2 font-semibold transition-colors">
                          <X size={16} />
                          <span className="font-medium">Remove</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
