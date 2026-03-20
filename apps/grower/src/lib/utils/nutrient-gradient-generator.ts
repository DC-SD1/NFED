import { getNutrientDisplayName as displayNameFromConfig } from "@/lib/constants/nutrient-configs";
import type { GeoFeature } from "@/lib/utils/map-helpers";
import { getBoundsFromGeometry } from "@/lib/utils/map-helpers";
import type {
  FarmSoilResponse,
  NutrientConfig,
  SoilAcreData,
} from "@/types/soil-gradient";

// Nutrient configurations with realistic ranges
const NUTRIENT_CONFIGS = {
  phosphorus: {
    min: 5,
    max: 50,
    unit: "ppm",
    optimalMin: 15,
    optimalMax: 30,
  },
  potassium: {
    min: 100,
    max: 300,
    unit: "ppm",
    optimalMin: 150,
    optimalMax: 250,
  },
  ph: {
    min: 4.5,
    max: 8.5,
    unit: "pH",
    optimalMin: 6.0,
    optimalMax: 7.0,
  },
  calcium: {
    min: 1000,
    max: 3000,
    unit: "ppm",
    optimalMin: 1500,
    optimalMax: 2500,
  },
  magnesium: {
    min: 200,
    max: 800,
    unit: "ppm",
    optimalMin: 400,
    optimalMax: 600,
  },
  iron: {
    min: 100,
    max: 600,
    unit: "ppm",
    optimalMin: 300,
    optimalMax: 500,
  },
  manganese: {
    min: 20,
    max: 80,
    unit: "ppm",
    optimalMin: 40,
    optimalMax: 60,
  },
  boron: {
    min: 0.2,
    max: 2.0,
    unit: "ppm",
    optimalMin: 0.5,
    optimalMax: 1.5,
  },
  copper: {
    min: 1,
    max: 5,
    unit: "ppm",
    optimalMin: 2,
    optimalMax: 4,
  },
  zinc: {
    min: 3,
    max: 15,
    unit: "ppm",
    optimalMin: 6,
    optimalMax: 12,
  },
  nitrogen: {
    min: 0.05,
    max: 0.3,
    unit: "%",
    optimalMin: 0.1,
    optimalMax: 0.2,
  },
  organicMatter: {
    min: 1,
    max: 5,
    unit: "%",
    optimalMin: 2,
    optimalMax: 4,
  },
  cec: {
    min: 10,
    max: 40,
    unit: "me/100g",
    optimalMin: 20,
    optimalMax: 30,
  },
};

function generateAcreGrid(
  polygon: GeoFeature,
  gridSize: { rows: number; cols: number },
): { centroid: [number, number]; id: string }[] {
  const bounds = getBoundsFromGeometry(polygon.geometry);
  const [[minLng, minLat], [maxLng, maxLat]] = bounds;

  const acres: { centroid: [number, number]; id: string }[] = [];
  const cellWidth = (maxLng - minLng) / gridSize.cols;
  const cellHeight = (maxLat - minLat) / gridSize.rows;

  for (let row = 0; row < gridSize.rows; row++) {
    for (let col = 0; col < gridSize.cols; col++) {
      const id = `A${String(row * gridSize.cols + col + 1).padStart(2, "0")}`;
      const centroid: [number, number] = [
        minLng + (col + 0.5) * cellWidth,
        minLat + (row + 0.5) * cellHeight,
      ];
      acres.push({ id, centroid });
    }
  }

  return acres;
}

function generateNutrientDistribution(
  nutrientKey: string,
  acres: { centroid: [number, number]; id: string }[],
  seed = 0,
): number[] {
  const config =
    NUTRIENT_CONFIGS[nutrientKey as keyof typeof NUTRIENT_CONFIGS] ||
    NUTRIENT_CONFIGS.nitrogen;

  // Generate realistic spatial patterns based on nutrient type
  return acres.map((acre, index) => {
    const [lng, lat] = acre.centroid;

    // Create spatial variations
    let baseValue = 0.5;

    // Add gradient patterns based on nutrient type
    switch (nutrientKey) {
      case "ph":
        // pH tends to be more uniform with slight variations
        baseValue =
          0.6 + Math.sin(lng * 100 + seed) * 0.1 + Math.cos(lat * 100) * 0.1;
        break;

      case "nitrogen":
        // Nitrogen can vary significantly, often depleted in overused areas
        baseValue = 0.3 + Math.sin((lng + lat) * 50 + seed) * 0.3;
        // Add patches of depletion
        if (Math.sin(index * 0.5 + seed) > 0.7) {
          baseValue *= 0.5;
        }
        break;

      case "phosphorus":
      case "potassium":
        // P and K often have patchy distributions
        baseValue =
          0.5 +
          Math.sin(lng * 80 + seed) * 0.2 +
          Math.cos(lat * 80 + seed * 2) * 0.2;
        // Add random patches
        if (Math.sin(index * 0.3 + seed) > 0.5) {
          baseValue += 0.2;
        }
        break;

      default:
        // General pattern for other nutrients
        baseValue =
          0.5 +
          Math.sin(lng * 60 + seed) * 0.15 +
          Math.cos(lat * 60 + seed) * 0.15 +
          (Math.random() - 0.5) * 0.2;
    }

    // Clamp to 0-1 range
    baseValue = Math.max(0, Math.min(1, baseValue));

    // Convert to actual nutrient range
    const actualValue = config.min + (config.max - config.min) * baseValue;

    return actualValue;
  });
}

function mapToSoilLevel(value: number, config: NutrientConfig): number {
  const { thresholds } = config;

  // Map based on thresholds
  if (value < thresholds.veryLow) {
    return (value / thresholds.veryLow) * 25; // 0-25%
  } else if (value < thresholds.low) {
    const range = thresholds.low - thresholds.veryLow;
    const normalized = (value - thresholds.veryLow) / range;
    return 25 + normalized * 25; // 25-50%
  } else if (value < thresholds.adequate) {
    const range = thresholds.adequate - thresholds.low;
    const normalized = (value - thresholds.low) / range;
    return 50 + normalized * 25; // 50-75%
  } else {
    const range = thresholds.high - thresholds.adequate;
    const normalized = Math.min(1, (value - thresholds.adequate) / range);
    return 75 + normalized * 25; // 75-100%
  }
}

export function generateNutrientGradientData(
  nutrientKey: string,
  polygon: GeoFeature,
  gridSize: { rows: number; cols: number } = { rows: 4, cols: 5 },
): FarmSoilResponse {
  // Generate acre grid
  const acreGrid = generateAcreGrid(polygon, gridSize);

  // Generate nutrient distribution
  const seed = nutrientKey
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const nutrientValues = generateNutrientDistribution(
    nutrientKey,
    acreGrid,
    seed,
  );

  // Create soil acre data
  const acres: SoilAcreData[] = acreGrid.map((acre, index) => {
    const nutrientValue = nutrientValues[index]!;
    // Use the correct type for config (NutrientConfig) and call mapToSoilLevel as in map-soil-analysis
    const soilLevel = mapToSoilLevel(nutrientValue, nutrientKey as any);

    // Create a clickable square around the centroid
    // Increased size for better click detection (approximately 1-2km per side)
    const size = 0.01; // Clickable acre size in degrees
    const [lng, lat] = acre.centroid;

    return {
      id: acre.id,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [lng - size / 2, lat - size / 2],
            [lng + size / 2, lat - size / 2],
            [lng + size / 2, lat + size / 2],
            [lng - size / 2, lat + size / 2],
            [lng - size / 2, lat - size / 2],
          ],
        ],
      },
      centroid: acre.centroid,
      soilLevel: Math.round(soilLevel),
      productionRate: 8, // Default production rate
      status: soilLevel >= 70 ? "high" : soilLevel >= 40 ? "medium" : "low",
    };
  });

  return {
    farmId: "farm-001",
    farmName: "Kojo Farm",
    totalAcres: gridSize.rows * gridSize.cols,
    acres,
    bounds: {
      type: "Polygon" as const,
      coordinates:
        polygon.geometry.type === "Polygon"
          ? polygon.geometry.coordinates
          : polygon.geometry.coordinates[0] ?? [[]],
    },
  };
}

// Helper to format nutrient display name
export function getNutrientDisplayName(nutrientKey: string): string {
  return displayNameFromConfig(nutrientKey);
}
