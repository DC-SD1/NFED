import type { paths } from "@cf/api";

import type { NutrientKey } from "@/lib/constants/nutrient-configs";
import { NUTRIENT_CONFIGS } from "@/lib/constants/nutrient-configs";
import type {
  Coordinate,
  FarmSoilResponse,
  SoilAcreData,
} from "@/types/soil-gradient";

type SoilAnalysis =
  paths["/crop-management/get-soil-analysis"]["post"]["responses"]["200"]["content"]["application/json"];

type LandPerimeter =
  | {
      type?: string | undefined;
      coordinates?: number[][][] | undefined;
    }
  | null
  | undefined;

const NUTRIENT_PROPERTY_KEY: Record<NutrientKey, string> = {
  phosphorus: "phosphorous_extractable",
  potassium: "potassium_extractable",
  ph: "ph",
  calcium: "calcium_extractable",
  magnesium: "magnesium_extractable",
  iron: "iron_extractable",
  manganese: "manganese_extractable",
  boron: "boron_extractable",
  copper: "copper_extractable",
  zinc: "zinc_extractable",
  nitrogen: "nitrogen_total",
  organicMatter: "carbon_organic",
  cec: "cation_exchange_capacity",
};

function toPercentFromGPerKg(value: number): number {
  // g/kg to %: divide by 10
  return value / 10;
}

function organicMatterFromOrganicCarbon(ocGPerKg: number): number {
  // OC (g/kg) -> OC% -> OM% (Van Bemmelen factor ~1.724)
  const ocPercent = toPercentFromGPerKg(ocGPerKg);
  return ocPercent * 1.724;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// function mapToSoilLevel(rawValue: number, nutrientKey: NutrientKey): number {
//   const config = NUTRIENT_CONFIGS[nutrientKey];
//   const { thresholds } = config;

//   if (rawValue < thresholds.veryLow) {
//     return clamp((rawValue / thresholds.veryLow) * 25, 0, 25);
//   } else if (rawValue < thresholds.low) {
//     const range = thresholds.low - thresholds.veryLow;
//     const normalized = (rawValue - thresholds.veryLow) / range;
//     return clamp(25 + normalized * 25, 25, 50);
//   } else if (rawValue < thresholds.adequate) {
//     const range = thresholds.adequate - thresholds.low;
//     const normalized = (rawValue - thresholds.low) / range;
//     return clamp(50 + normalized * 25, 50, 75);
//   } else {
//     const range = thresholds.high - thresholds.adequate;
//     const normalized =
//       range > 0 ? Math.min(1, (rawValue - thresholds.adequate) / range) : 1;
//     return clamp(75 + normalized * 25, 75, 100);
//   }
// }

function mapToSoilLevel(rawValue: number, nutrientKey: NutrientKey): number {
  const config = NUTRIENT_CONFIGS[nutrientKey];
  const { thresholds } = config;

  if (rawValue < thresholds.veryLow) {
    return clamp((rawValue / thresholds.veryLow) * 25, 0, 25);
  } else if (rawValue < thresholds.low) {
    const range = thresholds.low - thresholds.veryLow;
    const normalized = (rawValue - thresholds.veryLow) / range;
    return clamp(25 + normalized * 25, 25, 50);
  } else if (rawValue < thresholds.adequate) {
    const range = thresholds.adequate - thresholds.low;
    const normalized = (rawValue - thresholds.low) / range;
    return clamp(50 + normalized * 25, 50, 75);
  } else {
    const range = thresholds.high - thresholds.adequate;
    const normalized =
      range > 0 ? Math.min(1, (rawValue - thresholds.adequate) / range) : 1;
    return clamp(75 + normalized * 25, 75, 100);
  }
}

// Map status from raw value using nutrient thresholds
export function statusFromRawValue(
  nutrientKey: NutrientKey,
  raw: number,
): "high" | "medium" | "low" | "very low" | "adequate" {
  const { thresholds } = NUTRIENT_CONFIGS[nutrientKey];
  // The thresholds represent increasing levels of sufficiency:
  // Below veryLow: "very low" status (critically deficient)
  // veryLow to low: still "very low" (severely deficient)
  // low to adequate: "low" status (deficient)
  // adequate to high: "adequate" status (sufficient)
  // Above high: "high" status (optimal/excess)
  if (raw < thresholds.veryLow) return "very low";
  if (raw < thresholds.low) return "very low"; // Between veryLow and low is still very low
  if (raw < thresholds.adequate) return "low"; // Between low and adequate is low
  if (raw < thresholds.high) return "adequate"; // Between adequate and high is adequate
  return "high"; // Above high is high
}

function ensurePolygonFromCentroid(centroid: Coordinate, size = 0.0005) {
  const [lng, lat] = centroid;
  return {
    type: "Polygon" as const,
    coordinates: [
      [
        [lng - size, lat - size],
        [lng + size, lat - size],
        [lng + size, lat + size],
        [lng - size, lat + size],
        [lng - size, lat - size],
      ],
    ],
  };
}

function extractNutrientValue(
  nutrientKey: NutrientKey,
  properties: Record<string, { value?: unknown } | undefined> | undefined,
  profile: Record<string, { value?: number } | undefined> | undefined,
): number | null {
  const key = NUTRIENT_PROPERTY_KEY[nutrientKey];
  const propVal = properties?.[key]?.value as number | undefined;
  if (typeof propVal === "number") {
    return transformIfNeeded(nutrientKey, propVal);
  }
  const profileVal = profile?.[key]?.value;
  if (typeof profileVal === "number") {
    return transformIfNeeded(nutrientKey, profileVal);
  }
  return null;
}

function transformIfNeeded(nutrientKey: NutrientKey, raw: number): number {
  if (nutrientKey === "nitrogen") {
    return toPercentFromGPerKg(raw);
  }
  if (nutrientKey === "organicMatter") {
    return organicMatterFromOrganicCarbon(raw);
  }
  return raw;
}

interface MapSoilAnalysisOptions {
  soil: SoilAnalysis | undefined;
  nutrientKey: NutrientKey;
  farmId: string;
  farmName: string;
  perimeter: LandPerimeter;
}

export function mapSoilAnalysisToFarmSoilResponse({
  soil,
  nutrientKey,
  farmId,
  farmName,
  perimeter,
}: MapSoilAnalysisOptions): FarmSoilResponse | null {
  /**
   * Maps backend soil analysis to FarmSoilResponse for a specific nutrient.
   *
   * Precedence (per acre):
   * 1) parcelResults.properties[<nutrientKey>].value
   * 2) soilProfile.properties[<nutrientKey>].value
   * 3) skip parcel if neither is available
   *
   * Unit handling:
   * - nitrogen_total (g/kg) -> convert to % (value / 10) to align with app thresholds
   * - organicMatter -> derived from carbon_organic: OC (g/kg) -> OC% -> OM% = OC% * 1.724
   * - cation_exchange_capacity ('cmol(+)/kg') is equivalent to meq/100g; used as-is
   * - ppm metrics and pH are used as-is
   *
   * Returns null when no valid parcels can be mapped.
   */
  if (!soil?.parcelResults || soil.parcelResults.length === 0) {
    return null;
  }

  const acres: SoilAcreData[] = [];

  for (const pr of soil.parcelResults || []) {
    const centroidCoords = pr.parcel?.centroid?.coordinates;
    if (!centroidCoords || centroidCoords.length < 2) continue;

    const centroid: Coordinate = [centroidCoords[0]!, centroidCoords[1]!];

    const value = extractNutrientValue(
      nutrientKey,
      pr.properties as any,
      (soil.soilProfile?.properties as any) || undefined,
    );

    if (value == null) continue;

    const soilLevel = Math.round(mapToSoilLevel(value, nutrientKey));

    const polygon = pr.parcel?.boundary?.coordinates?.[0]
      ? {
          type: "Polygon" as const,
          coordinates: pr.parcel.boundary.coordinates,
        }
      : ensurePolygonFromCentroid(centroid);

    acres.push({
      id: pr.parcel?.id || `${centroid[0]}_${centroid[1]}`,
      geometry: polygon,
      centroid,
      soilLevel,
      productionRate: 0,
      status: statusFromRawValue(nutrientKey, value),
      nutrientValue: value,
      unit: NUTRIENT_CONFIGS[nutrientKey].unit,
    });
  }

  if (acres.length === 0) return null;

  const bounds = perimeter?.coordinates?.length
    ? {
        type: "Polygon" as const,
        coordinates: perimeter.coordinates,
      }
    : {
        type: "Polygon" as const,
        coordinates: [acres[0]!.geometry.coordinates[0]!],
      };

  return {
    farmId,
    farmName,
    totalAcres: acres.length,
    acres,
    bounds,
  };
}
