"use client";

import { cn } from "@cf/ui";

import PolygonMap from "@/components/map/polygon-map";
import SoilGradientMap from "@/components/map/soil-gradient-map";
import { getNutrientDisplayName } from "@/lib/constants/nutrient-configs";
import type { OpenApiFetchError } from "@/lib/utils/error-mapper";
import type { GeoFeature } from "@/lib/utils/map-helpers";
import type { FarmSoilResponse, SoilAcreData } from "@/types/soil-gradient";
import type { LandStatusDisplay } from "@/utils/map-farm-lands";

interface MapDisplayProps {
  data: GeoFeature;
  soilData: FarmSoilResponse | null | undefined;
  selectedNutrient: string;
  isLoading: boolean;
  error: OpenApiFetchError | null;
  className?: string;
  mapZoom?: boolean;
  zoomControlsPosition?: {
    bottom?: string;
    right?: string;
    top?: string;
    left?: string;
  };
  boundsPadding?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  showStatus?: boolean;
  statusPosition?: "left" | "right";
  nutrientLabelPosition?: "left" | "right";
  onAcreClick?: (acre: SoilAcreData | null) => void;
  // Label props for both map types
  showAcreLabels?: boolean;
  showCenterLabel?: boolean;
  centerLabelText?: string;
  labelStyle?: {
    textColor?: string;
    backgroundColor?: string;
    backgroundWidth?: number;
    textSize?: number;
  };
  status?: LandStatusDisplay;
}

export default function MapDisplay({
  data,
  soilData,
  selectedNutrient,
  isLoading,
  error,
  className = "size-full",
  mapZoom,
  zoomControlsPosition,
  boundsPadding = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50,
  },
  showStatus = true,
  statusPosition = "right",
  nutrientLabelPosition = "left",
  onAcreClick,
  showCenterLabel = false,
  centerLabelText = "",
  labelStyle,
  status,
}: MapDisplayProps) {
  // Determine which map to show (only show gradient when data is ready)
  const showGradientMap = selectedNutrient && !isLoading && !error && soilData;
  // Show loading state when nutrient is selected but data is loading
  const showLoadingState = selectedNutrient && isLoading;

  return (
    <div className={className}>
      {/* Always show the base map to prevent flicker */}
      {!showGradientMap && (
        <PolygonMap
          key="polygon-map"
          data={data}
          className="size-full"
          fillColor="rgba(224, 224, 224, 0.5)"
          lineColor="#e0e0e0"
          mapZoom={mapZoom}
          zoomControlsPosition={zoomControlsPosition}
          boundsPadding={boundsPadding}
          showCenterLabel={showCenterLabel}
          centerLabelText={centerLabelText}
          labelStyle={labelStyle}
        />
      )}

      {/* Show gradient map when data is ready */}
      {showGradientMap && (
        <SoilGradientMap
          key={`gradient-${selectedNutrient}`}
          data={soilData}
          originalGeoFeature={data}
          className="size-full"
          mapZoom={mapZoom}
          zoomControlsPosition={zoomControlsPosition}
          boundsPadding={boundsPadding}
          onAcreClick={onAcreClick}
          showAcreLabels={false}
          showCenterLabel={showCenterLabel}
          centerLabelText={centerLabelText}
          labelStyle={labelStyle}
        />
      )}

      {/* Loading overlay */}
      {showLoadingState && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div className="rounded-lg bg-white px-4 py-3 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm font-medium text-gray-700">
                Loading {getNutrientDisplayName(selectedNutrient)}...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Status label */}
      {!showLoadingState && !selectedNutrient && showStatus && status && (
        <span
          className={cn(
            "absolute top-3 z-10 inline-block rounded-full px-3 py-1 text-xs md:px-4",
            statusPosition === "right" ? "right-3 md:right-6" : "left-3",
            status.badgeClassName,
          )}
        >
          {status.label}
        </span>
      )}

      {/* Nutrient label */}
      {selectedNutrient && !showLoadingState && (
        <div
          className={`absolute top-4 z-10 rounded-lg bg-white px-3 py-1.5 shadow-md md:top-12 xl:top-4 ${
            nutrientLabelPosition === "right" ? "right-4" : "left-4"
          }`}
        >
          <span className="text-sm font-medium text-gray-700">
            {getNutrientDisplayName(selectedNutrient)}
          </span>
        </div>
      )}
    </div>
  );
}
