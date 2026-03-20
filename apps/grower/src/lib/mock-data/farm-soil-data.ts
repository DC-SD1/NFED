// NOTE: canonical types now live in '@/lib/utils/map-soil-analysis'.
// Kept here for mock/demo data only.
export interface SoilAcreData {
  id: string;
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
  centroid: [number, number];
  soilLevel: number;
  productionRate: number;
  status: "high" | "medium" | "low";
}

export interface FarmSoilResponse {
  farmId: string;
  farmName: string;
  totalAcres: number;
  acres: SoilAcreData[];
  bounds: {
    type: "Polygon";
    coordinates: number[][][];
  };
}

// Mock data for a 20-acre farm (4 x 5-acre sections)
export const mockFarmSoilData: FarmSoilResponse = {
  farmId: "farm-001",
  farmName: "Demo Farm",
  totalAcres: 20,
  acres: [
    {
      id: "P01",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-3.7043, 40.4168],
            [-3.7038, 40.4168],
            [-3.7038, 40.4164],
            [-3.7043, 40.4164],
            [-3.7043, 40.4168],
          ],
        ],
      },
      centroid: [-3.70405, 40.4166],
      soilLevel: 85,
      productionRate: 8,
      status: "high",
    },
    {
      id: "P02",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-3.7038, 40.4168],
            [-3.7033, 40.4168],
            [-3.7033, 40.4164],
            [-3.7038, 40.4164],
            [-3.7038, 40.4168],
          ],
        ],
      },
      centroid: [-3.70355, 40.4166],
      soilLevel: 45,
      productionRate: 8,
      status: "low",
    },
    {
      id: "P03",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-3.7043, 40.4164],
            [-3.7038, 40.4164],
            [-3.7038, 40.416],
            [-3.7043, 40.416],
            [-3.7043, 40.4164],
          ],
        ],
      },
      centroid: [-3.70405, 40.4162],
      soilLevel: 65,
      productionRate: 8,
      status: "medium",
    },
    {
      id: "P04",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-3.7038, 40.4164],
            [-3.7033, 40.4164],
            [-3.7033, 40.416],
            [-3.7038, 40.416],
            [-3.7038, 40.4164],
          ],
        ],
      },
      centroid: [-3.70355, 40.4162],
      soilLevel: 25,
      productionRate: 8,
      status: "low",
    },
  ],
  bounds: {
    type: "Polygon",
    coordinates: [
      [
        [-3.7043, 40.4168],
        [-3.7033, 40.4168],
        [-3.7033, 40.416],
        [-3.7043, 40.416],
        [-3.7043, 40.4168],
      ],
    ],
  },
};

// Function to generate more complex farm data
export function generateFarmAcres(
  centerLng: number,
  centerLat: number,
  rows: number,
  cols: number,
): SoilAcreData[] {
  const acres: SoilAcreData[] = [];
  const acreWidth = 0.0005; // ~5 acres width in degrees
  const acreHeight = 0.0004; // ~5 acres height in degrees

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const id = `P${String(row * cols + col + 1).padStart(2, "0")}`;

      // Generate random soil levels with some spatial correlation
      const baseLevel = 50;
      const variation = Math.sin(row * 0.5) * 20 + Math.cos(col * 0.5) * 15;
      const randomNoise = (Math.random() - 0.5) * 20;
      const soilLevel = Math.max(
        0,
        Math.min(100, baseLevel + variation + randomNoise),
      );

      const west = centerLng - (cols * acreWidth) / 2 + col * acreWidth;
      const east = west + acreWidth;
      const north = centerLat + (rows * acreHeight) / 2 - row * acreHeight;
      const south = north - acreHeight;

      acres.push({
        id,
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [west, north],
              [east, north],
              [east, south],
              [west, south],
              [west, north],
            ],
          ],
        },
        centroid: [(west + east) / 2, (north + south) / 2],
        soilLevel,
        productionRate: 8, // Fixed for demo
        status: soilLevel >= 70 ? "high" : soilLevel >= 40 ? "medium" : "low",
      });
    }
  }

  return acres;
}
