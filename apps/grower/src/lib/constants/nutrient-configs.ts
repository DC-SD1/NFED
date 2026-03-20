export type NutrientKey =
  | "phosphorus"
  | "potassium"
  | "ph"
  | "calcium"
  | "magnesium"
  | "iron"
  | "manganese"
  | "boron"
  | "copper"
  | "zinc"
  | "nitrogen"
  | "organicMatter"
  | "cec";

export interface NutrientThresholds {
  veryLow: number;
  low: number;
  adequate: number;
  high: number;
}

export interface NutrientConfig {
  range: [number, number];
  unit: string;
  thresholds: NutrientThresholds;
  displayName: string;
  color: {
    low: string;
    medium: string;
    high: string;
  };
}

export const NUTRIENT_CONFIGS: Record<NutrientKey, NutrientConfig> = {
  phosphorus: {
    range: [0, 50],
    unit: "ppm",
    thresholds: {
      veryLow: 5,
      low: 10,
      adequate: 20,
      high: 30,
    },
    displayName: "Available P",
    color: {
      low: "#FF6B6B",
      medium: "#FFD93D",
      high: "#6BCF7F",
    },
  },
  potassium: {
    range: [0, 300],
    unit: "ppm",
    thresholds: {
      veryLow: 50,
      low: 100,
      adequate: 200,
      high: 250,
    },
    displayName: "Exchangeable K",
    color: {
      low: "#FF6B6B",
      medium: "#FFD93D",
      high: "#6BCF7F",
    },
  },
  ph: {
    range: [4.5, 8.0],
    unit: "in water",
    thresholds: {
      veryLow: 5.0,
      low: 5.5,
      adequate: 6.5,
      high: 7.5,
    },
    displayName: "Soil pH",
    color: {
      low: "#FF6B6B",
      medium: "#FFD93D",
      high: "#6BCF7F",
    },
  },
  calcium: {
    range: [0, 5000],
    unit: "ppm",
    thresholds: {
      veryLow: 500,
      low: 1000,
      adequate: 3000,
      high: 4000,
    },
    displayName: "Calcium",
    color: {
      low: "#FF6B6B",
      medium: "#FFD93D",
      high: "#6BCF7F",
    },
  },
  magnesium: {
    range: [0, 1000],
    unit: "ppm",
    thresholds: {
      veryLow: 100,
      low: 200,
      adequate: 500,
      high: 700,
    },
    displayName: "Magnesium",
    color: {
      low: "#FF6B6B",
      medium: "#FFD93D",
      high: "#6BCF7F",
    },
  },
  iron: {
    range: [0, 800],
    unit: "ppm",
    thresholds: {
      veryLow: 50,
      low: 100,
      adequate: 300,
      high: 500,
    },
    displayName: "Iron",
    color: {
      low: "#FF6B6B",
      medium: "#FFD93D",
      high: "#6BCF7F",
    },
  },
  manganese: {
    range: [0, 100],
    unit: "ppm",
    thresholds: {
      veryLow: 10,
      low: 20,
      adequate: 50,
      high: 70,
    },
    displayName: "Manganese",
    color: {
      low: "#FF6B6B",
      medium: "#FFD93D",
      high: "#6BCF7F",
    },
  },
  boron: {
    range: [0, 5],
    unit: "ppm",
    thresholds: {
      veryLow: 0.5,
      low: 1.0,
      adequate: 2.0,
      high: 3.0,
    },
    displayName: "Boron",
    color: {
      low: "#FF6B6B",
      medium: "#FFD93D",
      high: "#6BCF7F",
    },
  },
  copper: {
    range: [0, 10],
    unit: "ppm",
    thresholds: {
      veryLow: 1.0,
      low: 2.0,
      adequate: 4.0,
      high: 6.0,
    },
    displayName: "Copper",
    color: {
      low: "#FF6B6B",
      medium: "#FFD93D",
      high: "#6BCF7F",
    },
  },
  zinc: {
    range: [0, 20],
    unit: "ppm",
    thresholds: {
      veryLow: 2,
      low: 5,
      adequate: 10,
      high: 15,
    },
    displayName: "Zinc",
    color: {
      low: "#FF6B6B",
      medium: "#FFD93D",
      high: "#6BCF7F",
    },
  },
  nitrogen: {
    range: [0, 2],
    unit: "%",
    thresholds: {
      veryLow: 0.1,
      low: 0.2,
      adequate: 0.5,
      high: 1.0,
    },
    displayName: "Total Nitrogen",
    color: {
      low: "#FF6B6B",
      medium: "#FFD93D",
      high: "#6BCF7F",
    },
  },
  organicMatter: {
    range: [0, 10],
    unit: "%",
    thresholds: {
      veryLow: 1.0,
      low: 2.0,
      adequate: 4.0,
      high: 6.0,
    },
    displayName: "Organic Matter",
    color: {
      low: "#FF6B6B",
      medium: "#FFD93D",
      high: "#6BCF7F",
    },
  },
  cec: {
    range: [0, 40],
    unit: "meq/100g",
    thresholds: {
      veryLow: 5,
      low: 10,
      adequate: 20,
      high: 30,
    },
    displayName: "C.E.C",
    color: {
      low: "#FF6B6B",
      medium: "#FFD93D",
      high: "#6BCF7F",
    },
  },
};

export function getNutrientDisplayName(nutrientKey: string): string {
  return (NUTRIENT_CONFIGS as any)[nutrientKey]?.displayName ?? nutrientKey;
}
