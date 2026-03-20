/* eslint-disable max-lines-per-function */
"use client";

import {
  useInitializedEffect,
  useInitializedEffectOnce,
} from "@cf/common/hooks";
import { Button } from "@cf/ui";
import { Card, CardContent } from "@cf/ui/components/card";
import { MoreHorizontal } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import {
  parseAsBoolean,
  parseAsString,
  parseAsStringEnum,
  useQueryState,
} from "nuqs";
import { useCallback, useMemo, useRef, useState } from "react";

import CardHeader from "@/components/card-header";
import FarmLandMainForm from "@/components/dashboard/farm-land-main-form";
import FarmLandDetailsPageSkeleton from "@/components/dashboard/skeletons/farm-land-details-skeleton";
import TopLeftHeaderLayout from "@/components/dashboard/top-left-header";
import MapDisplay from "@/components/map/farm-lands-map-display";
import { PlanList } from "@/components/plan/plan-list";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useNutrientSelection } from "@/hooks/use-nutrient-selection";
import { useApiClient } from "@/lib/api";
import type { NutrientKey } from "@/lib/constants/nutrient-configs";
import { useFarmLandsDetail } from "@/lib/queries/farm-land-query";
import type { GeoFeature } from "@/lib/utils/map-helpers";
import { mapSoilAnalysisToFarmSoilResponse } from "@/lib/utils/map-soil-analysis";
import {
  createFarmLandMapData,
  getLandStatus,
  mapLandStatusDisplay,
} from "@/utils/map-farm-lands";

type TabType = "details" | "plan";

const LABEL_STYLE = {
  textColor: "#FFFFFF",
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  backgroundWidth: 3,
  textSize: 14,
} as const;

const TABS: { id: TabType; label: string }[] = [
  { id: "details", label: "Land details" },
  { id: "plan", label: "Farm plan" },
];

export default function FarmLandDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const api = useApiClient();
  const farmId = params.id as string;

  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsStringEnum<TabType>(["details", "plan"]).withDefault("details"),
  );

  const [isExpanded] = useQueryState(
    "expanded",
    parseAsBoolean.withDefault(false),
  );

  // NEW: Add land selection to URL state
  const [selectedLandId, setSelectedLandId] = useQueryState(
    "landId",
    parseAsString.withDefault(""),
  );

  const { selectedNutrient } = useNutrientSelection();
  const { farmLandDetailsData: farmDetails, isPending: isFarmLoading } =
    useFarmLandsDetail(farmId);

  // Memoize the selected land to avoid unnecessary re-computations
  const selectedLand = useMemo(() => {
    if (!farmDetails?.lands?.length) return null;

    // If we have a selected land ID, try to find it
    if (selectedLandId) {
      const found = farmDetails.lands.find(
        (land) => land.id === selectedLandId,
      );
      if (found) return found;
    }

    // Fallback to first land if selected ID doesn't exist
    return farmDetails.lands[0];
  }, [farmDetails?.lands, selectedLandId]);

  const { data: farmingStatusResponse, isLoading: isFarmingStatusLoading } =
    api.useQuery(
      "get",
      "/farm-planning/lands/{LandId}/farming-status",
      {
        params: {
          path: {
            LandId: selectedLand?.id || "",
          },
        },
      },
      {
        enabled: !!selectedLand?.id,
        staleTime: 5 * 60 * 1000,
      },
    );
  const planStatus = farmingStatusResponse?.startFarmingButtonStatus;
  const getBtnStatusText = () => {
    if (isFarmingStatusLoading) {
      return "Loading...";
    }

    switch (planStatus) {
      case "none":
        return "Create Farm Plan";
      case "draft":
        return "Continue with Plan";
      case "start_farming":
        return "Start Farming";
      case "continue_farming":
        return "Continue Farming";
      default:
        return "Create Plan";
    }
  };
  // Auto-select first land when farm details load (only if no land is selected)
  useInitializedEffect(() => {
    if (farmDetails?.lands?.length && !selectedLandId) {
      const firstLandId = farmDetails.lands[0]?.id;
      if (firstLandId) {
        // Use the shallow option to avoid triggering navigation events
        void setSelectedLandId(firstLandId, {
          shallow: true,
          scroll: false,
        });
      }
    }
  }, [farmDetails?.lands, selectedLandId, setSelectedLandId]);

  const mapData: GeoFeature | null = useMemo(
    () => (farmDetails ? createFarmLandMapData(farmDetails) : null),
    [farmDetails],
  );

  // Scroll to map on mobile when nutrient is selected
  useInitializedEffect(() => {
    if (selectedNutrient) {
      // Only scroll on mobile viewports
      const isMobile = window.innerWidth < 768; // md breakpoint
      if (isMobile) {
        const mapElement = document.getElementById("mobile-map");
        if (mapElement) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              mapElement.scrollIntoView({ behavior: "smooth", block: "start" });
            });
          });
        }
      }
    }
  }, [selectedNutrient]);

  const {
    data: soilAnalysisData,
    isPending: isSoilLoading,
    error: soilError,
  } = api.useQuery(
    "post",
    "/crop-management/get-soil-analysis",
    {
      body: {
        landId: selectedLand?.id ?? "",
      },
    },
    {
      enabled: !!selectedLand?.id,
      retry: (failureCount, error) => {
        if (error && "status" in error && error.status === 401) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  );

  const soilData = useMemo(() => {
    if (!selectedNutrient || !selectedLand) return null;
    const mapped = mapSoilAnalysisToFarmSoilResponse({
      soil: soilAnalysisData,
      nutrientKey: selectedNutrient as NutrientKey,
      farmId: farmDetails?.farmId ?? "",
      farmName: farmDetails?.farmName ?? "",
      perimeter: selectedLand?.location?.perimeter ?? null,
    });

    return mapped || null;
  }, [
    soilAnalysisData,
    selectedNutrient,
    selectedLand,
    farmDetails?.farmId,
    farmDetails?.farmName,
  ]);

  // Callback for changing selected land (for future use)
  // const handleLandSelection = useCallback(
  //   (landId: string) => {
  //     void setSelectedLandId(landId);
  //   },
  //   [setSelectedLandId],
  // );
  // const updateStatus = api.useMutation(
  //   "put",
  //   "/farm-planning/lands/{LandId}/start-farming",
  //   {
  //     onSuccess: (data, variables) => {
  //       const landId = variables.params.path.LandId;
  //       router.push(`/farm-owner/farm-grow?landId=${landId}`);
  //     },
  //     onError: (error) => {
  //       if (error?.errors?.[0]?.code === "LAND_NOT_FOUND") {
  //         showErrorToast("Land not found");
  //         return;
  //       }
  //       showErrorToast("Something went wrong, whilst starting farming");
  //       return;
  //     },
  //   },
  // );

  const handleAddFarmPlan = useCallback(() => {
    router.push(
      `/farm-owner/farm-plan/production-plan?farmId=${farmId}&landId=${selectedLandId}`,
    );
  }, [router, farmId, selectedLandId]);

  const handleStartFarming = () => {
    router.push(
      `/farm-owner/farm-grow?landId=${selectedLandId}&farmId=${farmId}`,
    );
    // updateStatus.mutate({
    //   params: {
    //     path: {
    //       LandId: selectedLandId,
    //     },
    //   },
    // });
  };

  const continueFarmPlanDraft = useCallback(() => {
    // temp navigation
    router.push(
      `/farm-owner/farm-grow/production-plan?farmId=${farmId}&landId=${selectedLandId}`,
    );
  }, [router, farmId, selectedLandId]);

  const getBtnStatusHandler = () => {
    if (isFarmingStatusLoading) {
      return () => {
        //
      };
    }

    switch (planStatus) {
      case "none":
        return handleAddFarmPlan;
      case "draft":
        return continueFarmPlanDraft;
      case "start_farming":
        return handleStartFarming;
      case "continue_farming":
        return handleStartFarming;
      default:
        return handleAddFarmPlan;
    }
  };

  const isGradientLoading = isSoilLoading;
  // Breakpoints must be queried before any returns to avoid conditional hook calls
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1279px)");
  const isDesktop = useMediaQuery("(min-width: 1280px)");

  // Show loading state while farm data is loading
  if (isFarmLoading || !farmDetails) {
    return (
      <TopLeftHeaderLayout>
        <FarmLandDetailsPageSkeleton />
      </TopLeftHeaderLayout>
    );
  }

  const centerLabelText =
    farmDetails?.farmName || selectedLand?.code?.value || "Farm";

  const landStatus = farmDetails
    ? mapLandStatusDisplay(getLandStatus(farmDetails))
    : undefined;

  return (
    <TopLeftHeaderLayout>
      <Button
        onClick={getBtnStatusHandler()}
        className="ml-5 rounded-2xl bg-primary text-white hover:bg-primary/90"
      >
        {getBtnStatusText()}
      </Button>

      <CustomTabs activeTab={activeTab} onChange={setActiveTab} tabs={TABS} />

      {activeTab === "details" && (
        <>
          {/* Mobile Layout - Scrollable (sm: and below) */}
          <div className="min-h-screen w-full md:hidden">
            {/* Map Layer */}
            <div id="mobile-map" className="relative h-[50vh] w-full">
              {mapData && isMobile && (
                <MapDisplay
                  data={mapData}
                  soilData={soilData}
                  selectedNutrient={selectedNutrient}
                  isLoading={isGradientLoading}
                  error={soilError}
                  boundsPadding={{
                    top: 50,
                    bottom: 50,
                    left: 50,
                    right: 50,
                  }}
                  statusPosition="left"
                  nutrientLabelPosition="left"
                  // Enable acre labels for gradient map
                  showAcreLabels={false}
                  // Or enable center label for polygon map
                  showCenterLabel={true}
                  centerLabelText={centerLabelText}
                  // Custom styling
                  labelStyle={LABEL_STYLE}
                  status={landStatus}
                />
              )}
            </div>

            <div className="w-full">
              {isMobile && <FarmLandMainForm farmDetails={farmDetails} />}
            </div>
          </div>

          {/* Tablet Layout - Overlay (md: to xl:) */}
          <div className="relative hidden h-screen w-full overflow-hidden md:block xl:hidden">
            {/* Map Layer - Full screen */}
            <div className="absolute inset-0 z-0 px-3">
              {mapData && isTablet && (
                <MapDisplay
                  data={mapData}
                  soilData={soilData}
                  selectedNutrient={selectedNutrient}
                  isLoading={isGradientLoading}
                  error={soilError}
                  mapZoom
                  zoomControlsPosition={{
                    bottom: "calc(40vh + 2rem)",
                    right: "2rem",
                  }}
                  boundsPadding={{
                    top: 50,
                    bottom: isExpanded ? 400 : 150,
                    left: 50,
                    right: 50,
                  }}
                  statusPosition="right"
                  nutrientLabelPosition="left"
                  // Enable acre labels for gradient map
                  showAcreLabels={false}
                  // Or enable center label for polygon map
                  showCenterLabel={true}
                  centerLabelText={centerLabelText}
                  // Custom styling
                  labelStyle={LABEL_STYLE}
                  status={landStatus}
                />
              )}
            </div>

            {/* Form Layer - Floating over map */}
            <div
              className={`
            absolute inset-x-6 bottom-6 z-10 overflow-hidden rounded-lg shadow-2xl backdrop-blur-sm transition-all
            duration-300 ease-in-out
            ${isExpanded ? "h-[85vh]" : "h-[40vh]"}
          `}
            >
              <div className="h-full px-4 pt-2">
                {isTablet && <FarmLandMainForm farmDetails={farmDetails} />}
              </div>
            </div>
          </div>

          {/* Desktop Layout - Side by Side (xl: and above) */}
          <div className="relative hidden h-[calc(100vh-240px)] w-full overflow-hidden xl:block">
            {/* Map Layer */}
            <div className="absolute inset-0 z-0 px-3">
              {mapData && isDesktop && (
                <MapDisplay
                  data={mapData}
                  soilData={soilData}
                  selectedNutrient={selectedNutrient}
                  isLoading={isGradientLoading}
                  error={soilError}
                  mapZoom
                  zoomControlsPosition={{ bottom: "2rem", right: "1rem" }}
                  boundsPadding={{
                    top: 50,
                    bottom: 150,
                    left: 500,
                    right: 50,
                  }}
                  statusPosition="right"
                  nutrientLabelPosition="right"
                  // Enable acre labels for gradient map
                  showAcreLabels={true}
                  // Or enable center label for polygon map
                  showCenterLabel={true}
                  centerLabelText={centerLabelText}
                  // Custom styling
                  labelStyle={LABEL_STYLE}
                  status={landStatus}
                />
              )}
            </div>

            <div className="absolute left-6 top-3 z-10 h-[calc(100vh-265px)] w-2/5 max-w-[1100px] overflow-hidden bg-transparent">
              <div className="h-full">
                {isDesktop && <FarmLandMainForm farmDetails={farmDetails} />}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "plan" && (
        <Card className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border-none shadow-lg">
          <CardContent className="md:p=6 min-w-0 max-w-full bg-[#FBFBFB] p-0 pt-4 md:px-2">
            <CardHeader
              containerClassName="mx-2"
              text={"Farm plan"}
              rightComponent={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 transition-all duration-200 hover:scale-105"
                  aria-label="Create farm plan"
                  onClick={handleAddFarmPlan}
                >
                  <MoreHorizontal size={20} className="text-foreground" />
                </Button>
              }
            />
            <div className="space-y-3">
              <PlanList
                farmId={farmId}
                onCreate={handleAddFarmPlan}
                showFilterTabsLine={false}
                containerClassName="lg:px-1"
              />
            </div>
          </CardContent>
        </Card>
        // <div className="mt-4 px-2 md:px-4">
        //   <PlanList
        //     farmId={farmId}
        //     onCreate={handleAddFarmPlan}
        //     showFilterTabsLine={false}
        //   />
        // </div>
      )}
    </TopLeftHeaderLayout>
  );
}

function CustomTabs({
  activeTab,
  onChange,
  tabs,
}: {
  activeTab: TabType;
  onChange: (value: TabType) => void;
  tabs: { id: TabType; label: string }[];
}) {
  const tabContainerRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<TabType, HTMLButtonElement | null>>({
    details: null,
    plan: null,
  });
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  const updateIndicator = useCallback(() => {
    requestAnimationFrame(() => {
      const container = tabContainerRef.current;
      const el = tabRefs.current[activeTab];
      if (!container || !el) return;
      const c = container.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      setIndicator({ left: r.left - c.left, width: r.width });
    });
  }, [activeTab]);

  useInitializedEffect(() => {
    updateIndicator();
  }, [activeTab, updateIndicator]);

  useInitializedEffectOnce(() => {
    const onResize = () => updateIndicator();
    const container = tabContainerRef.current;
    window.addEventListener("resize", onResize);
    container?.addEventListener("scroll", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      container?.removeEventListener("scroll", onResize);
    };
  }, []);

  return (
    <div className="mb-4 w-full px-2 md:px-4">
      <div
        ref={tabContainerRef}
        className="relative flex w-full min-w-0 flex-nowrap overflow-x-auto border-b border-gray-200"
      >
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[tab.id] = el;
            }}
            variant="unstyled"
            onClick={() => onChange(tab.id)}
            className={`relative whitespace-nowrap px-6 py-1.5 text-sm transition-colors duration-200 md:px-6 ${
              activeTab === tab.id
                ? "text-primary"
                : "text-gray-400 hover:cursor-pointer hover:text-primary"
            }`}
          >
            {tab.label}
          </Button>
        ))}
        <span
          className="absolute bottom-0 h-[2px] bg-primary transition-all duration-200"
          style={{ left: indicator.left, width: indicator.width }}
        />
      </div>
    </div>
  );
}
