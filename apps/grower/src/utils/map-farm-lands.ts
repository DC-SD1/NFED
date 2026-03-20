import type { components, paths } from "@cf/api";

import type { FarmLandItem } from "@/components/dashboard/farm-land-cards/farm-land-items";
import type { GeoFeature } from "@/lib/utils/map-helpers";
import { cleanPolygonCoordinates } from "@/lib/utils/map-helpers";
import { mapFarmStatus as unifiedMapFarmStatus } from "@/utils/farm-api-helpers";

type LandStatus = components["schemas"]["LandStatusType"];

export const LAND_STATUS_LABELS: Record<LandStatus, string> = {
  Pending: "Pending",
  ReadyForFarming: "Ready For Farming",
  Farming: "Farming",
  Harvesting: "Harvesting",
  Inactive: "Inactive",
  Archived: "Archived",
};

export const LAND_STATUS_STYLES: Record<
  LandStatus,
  { badgeClassName: string }
> = {
  Pending: { badgeClassName: "bg-white text-[hsl(var(--foreground))]" },
  ReadyForFarming: {
    badgeClassName: "bg-[hsl(var(--blue-light))] text-[hsl(var(--blue-dark))]",
  },
  Farming: {
    badgeClassName: "bg-[hsl(var(--blue-light))] text-[hsl(var(--blue-dark))]",
  },
  Harvesting: {
    badgeClassName:
      "bg-[hsl(var(--primary-light))] text-[hsl(var(--primary-dark))]",
  },
  Inactive: {
    badgeClassName: "bg-[hsl(var(--red-light))] text-[hsl(var(--red-dark))]",
  },
  Archived: {
    badgeClassName: "bg-[hsl(var(--red-light))] text-[hsl(var(--red-dark))]",
  },
};

export interface LandStatusDisplay {
  value: LandStatus;
  label: string;
  badgeClassName: string;
}

export const getLandStatus = (farm: FarmLandItem): LandStatus => {
  const firstLandStatus = farm.landStatuses
    ? Object.values(farm.landStatuses)[0]
    : undefined;

  const candidate =
    firstLandStatus?.landStatus ?? farm.lands?.[0]?.status?.value ?? "Pending";

  if (
    candidate === "Pending" ||
    candidate === "ReadyForFarming" ||
    candidate === "Farming" ||
    candidate === "Harvesting" ||
    candidate === "Inactive" ||
    candidate === "Archived"
  ) {
    return candidate;
  }

  return "Pending";
};

export const mapLandStatusDisplay = (
  status: LandStatus,
): LandStatusDisplay => ({
  value: status,
  label: LAND_STATUS_LABELS[status],
  badgeClassName: LAND_STATUS_STYLES[status].badgeClassName,
});

export type FarmLandsResponse =
  paths["/farm-management/get-farms"]["get"]["responses"]["200"]["content"]["application/json"];

type ManagerLandsResponse =
  paths["/farm-management/get-farms-by-manager"]["get"]["responses"]["200"]["content"]["application/json"];
export type ManagerLandItem = NonNullable<
  NonNullable<ManagerLandsResponse>
>[number];

export const getSoilProfileStatus = (farm: FarmLandItem): string => {
  if (!farm.landStatuses || Object.keys(farm.landStatuses).length === 0)
    return "Pending";
  const firstLandStatus = Object.values(farm.landStatuses)[0];
  return firstLandStatus?.soilProfileStatus ?? "Pending";
};

export const getCropCultivationStatus = (farm: FarmLandItem): string => {
  if (!farm.landStatuses || Object.keys(farm.landStatuses).length === 0)
    return "Pending";
  const firstLandStatus = Object.values(farm.landStatuses)[0];
  return firstLandStatus?.topRecommendedCropName ?? "Pending";
};

export const getFarmStatus = (farm: FarmLandItem): string => {
  if (!farm.lands || farm.lands.length === 0) return "Not started";

  const status = farm.lands[0]?.status;
  return status?.value !== undefined ? String(status.value) : "Not started";
};

/**
 * Maps numeric or string status to localized display string
 * @deprecated This function now uses the unified mapping from farm-api-helpers.ts
 * Consider importing mapFarmStatus directly from farm-api-helpers.ts instead
 */
export const getLocalisedStatus = (status: number | string): string => {
  const result = unifiedMapFarmStatus(status);
  return result?.label ?? "Unknown";
};

export const createMapData = (farm: FarmLandItem): GeoFeature => {
  try {
    if (
      farm.location?.perimeter?.coordinates &&
      Array.isArray(farm.location.perimeter.coordinates) &&
      farm.location.perimeter.coordinates.length > 0
    ) {
      let coordinates = farm.location.perimeter.coordinates;

      // The issue: coordinates come as [[[lng,lat]...]] but we're checking for [[[[lng,lat]...]]]
      // For a valid Polygon in GeoJSON, we need exactly [[[lng,lat]...]]
      // But if coordinates[0][0] is a coordinate pair (not another array), we have the right structure

      // Check if we have the correct structure
      if (coordinates[0] && Array.isArray(coordinates[0][0])) {
        // Check if coordinates[0][0] is a coordinate pair [lng, lat] or another array level
        if (typeof coordinates[0][0][0] === "number") {
          // coordinates[0][0] = [lng, lat] - this is correct for Polygon
        } else if (Array.isArray(coordinates[0][0][0])) {
          // coordinates[0][0][0] = [lng, lat] - one level too deep
          coordinates = [coordinates[0]];
        }
      }

      // Clean the coordinates to remove duplicates
      const cleanedCoordinates = cleanPolygonCoordinates(coordinates);

      return {
        type: "Feature",
        geometry: {
          type: (farm.location.perimeter.type as "Polygon") || "Polygon",
          coordinates: cleanedCoordinates,
        },
        properties: {
          farmId: farm.farmId,
          farmName: farm.farmName || "Unknown Farm",
        },
      };
    }
  } catch (error) {
    console.error("Error creating map data for farm:", farm.farmName, error);
  }

  // Return default polygon if no valid location data
  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [0, 0],
          [0, 1],
          [1, 1],
          [1, 0],
          [0, 0],
        ],
      ],
    },
    properties: {
      farmId: farm.farmId,
      farmName: farm.farmName || "Unknown Farm",
    },
  };
};

export const createFarmLandMapData = (farm: FarmLandItem): GeoFeature => {
  if (farm.lands?.[0]?.location?.perimeter) {
    // Clean the coordinates to remove duplicates and ensure valid polygon
    const rawCoordinates = farm.lands[0]?.location.perimeter.coordinates ?? [
      [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
      ],
    ];

    const cleanedCoordinates = cleanPolygonCoordinates(rawCoordinates);

    return {
      type: "Feature",
      geometry: {
        type: farm.lands[0]?.location.perimeter.type as "Polygon",
        coordinates: cleanedCoordinates,
      },
      properties: {
        farmId: farm.farmId,
        farmName: farm.farmName,
      },
    };
  }

  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [0, 0],
          [0, 1],
          [1, 1],
          [1, 0],
          [0, 0],
        ],
      ],
    },
    properties: {
      farmId: farm.farmId,
      farmName: farm.farmName || "Unknown Farm",
    },
  };
};

export const transformFarmForMapData = (farm: ManagerLandItem) => {
  return {
    farmId: farm.id,
    farmName: farm.name,
    location: farm.location,
    acreage:
      typeof farm.acreage === "number"
        ? farm.acreage
        : typeof farm.acreage === "string"
          ? parseFloat(farm.acreage) || 0
          : 0,
  };
};
