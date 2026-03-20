"use client";

import { parseAsString, useQueryState } from "nuqs";

export function useNutrientSelection() {
  const [selectedNutrient, setSelectedNutrient] = useQueryState(
    "nutrient",
    parseAsString.withDefault(""),
  );

  const selectNutrient = (nutrientKey: string) => {
    // Toggle: if same nutrient is clicked, clear selection
    if (selectedNutrient === nutrientKey) {
      void setSelectedNutrient("");
    } else {
      void setSelectedNutrient(nutrientKey);
    }
  };

  const clearSelection = () => {
    void setSelectedNutrient("");
  };

  return {
    selectedNutrient,
    selectNutrient,
    clearSelection,
    isSelected: (nutrientKey: string) => selectedNutrient === nutrientKey,
  };
}