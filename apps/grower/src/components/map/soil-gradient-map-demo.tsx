"use client";

import { useState } from "react";

import type {
  FarmSoilResponse,
} from "@/lib/mock-data/farm-soil-data";
import {
  generateFarmAcres,
  mockFarmSoilData,
} from "@/lib/mock-data/farm-soil-data";

import SoilGradientMap from "./soil-gradient-map";

// Different polygon shapes for testing
const polygonShapes = {
  irregular: {
    name: "Irregular",
    coordinates: [
      [-3.7043, 40.4168],
      [-3.7033, 40.4169],
      [-3.703, 40.4165],
      [-3.7032, 40.416],
      [-3.7038, 40.4158],
      [-3.7044, 40.4161],
      [-3.7043, 40.4168],
    ],
  },
  triangle: {
    name: "Triangle",
    coordinates: [
      [-3.704, 40.417],
      [-3.703, 40.416],
      [-3.705, 40.416],
      [-3.704, 40.417],
    ],
  },
  lShape: {
    name: "L-Shape",
    coordinates: [
      [-3.7045, 40.417],
      [-3.7035, 40.417],
      [-3.7035, 40.4165],
      [-3.704, 40.4165],
      [-3.704, 40.416],
      [-3.7045, 40.416],
      [-3.7045, 40.417],
    ],
  },
  complex: {
    name: "Complex",
    coordinates: [
      [-3.7043, 40.4172],
      [-3.7038, 40.417],
      [-3.7033, 40.4171],
      [-3.703, 40.4168],
      [-3.7032, 40.4164],
      [-3.703, 40.416],
      [-3.7035, 40.4158],
      [-3.704, 40.4159],
      [-3.7044, 40.4161],
      [-3.7046, 40.4164],
      [-3.7045, 40.4168],
      [-3.7043, 40.4172],
    ],
  },
  rectangular: {
    name: "Rectangle",
    coordinates: [
      [-3.7045, 40.417],
      [-3.703, 40.417],
      [-3.703, 40.416],
      [-3.7045, 40.416],
      [-3.7045, 40.417],
    ],
  },
};

export default function SoilGradientMapDemo() {
  const [currentShape, setCurrentShape] =
    useState<keyof typeof polygonShapes>("irregular");
  const [randomSeed, setRandomSeed] = useState(0);

  // Create farm data with selected polygon shape
  const customFarmData: FarmSoilResponse = {
    ...mockFarmSoilData,
    bounds: {
      type: "Polygon",
      coordinates: [polygonShapes[currentShape].coordinates],
    },
    acres: generateFarmAcres(-3.7037, 40.41635, 4, 3).map((acre, index) => {
      // Use seed for consistent randoms per shape, but different between shapes
      const random = Math.sin(randomSeed + index) * 10000;
      const soilLevel = Math.floor((random - Math.floor(random)) * 86) + 10;
      return {
        ...acre,
        soilLevel,
        status: soilLevel >= 70 ? "high" : soilLevel >= 40 ? "medium" : "low",
      };
    }),
  };

  const handleShapeChange = (shape: keyof typeof polygonShapes) => {
    setCurrentShape(shape);
    // Change random seed to get different soil patterns for each shape
    setRandomSeed(Math.random() * 1000);
  };


  return (
    <div className="space-y-6">
      {/* Shape selector */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">
          Farm Soil Level Visualization
        </h2>
        <div className="mb-4 flex gap-2">
          <span className="text-sm font-medium text-gray-700">Shape:</span>
          {Object.entries(polygonShapes).map(([key, shape]) => (
            <button
              key={key}
              onClick={() =>
                handleShapeChange(key as keyof typeof polygonShapes)
              }
              className={`rounded-md px-3 py-1 text-sm transition-colors ${
                currentShape === key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {shape.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main map */}
      <div>
        <SoilGradientMap
          key={currentShape} // Force re-render when shape changes
          mapStyle="mapbox://styles/mapbox/satellite-v9"
          data={customFarmData}
          className="h-[600px] w-full rounded-xl"
        />
      </div>

    </div>
  );
}
