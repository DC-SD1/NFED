"use client";

import { cn } from "@cf/ui";
import { Check } from "lucide-react";

import type { Crop } from "@/app/[locale]/(dashboard)/farm-owner/farm-plan/production-plan/types";

interface RecommendedCropsProps {
  crops: Crop[];
  selectedCrop: string;
  onCropToggle: (cropValue: string) => void;
}

export default function RecommendedCrops({
  crops,
  selectedCrop,
  onCropToggle,
}: RecommendedCropsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {crops.map((crop) => {
        const isSelected = selectedCrop === crop.value;

        // variant = "ghost";
        // size = "icon";
        // className = " bg-primary-light relative rounded-full";

        return (
          <button
            key={crop.id}
            type="button"
            onClick={() => onCropToggle(crop.value)}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-full px-3 py-2 text-sm font-normal transition-all",
              "focus:ring-primary focus:outline-none focus:ring-2 focus:ring-offset-2",
              "text-foreground bg-primary-light relative hover:bg-[--gray-light]",
            )}
          >
            {crop.label}
            {isSelected && (
              <div className="bg-primary flex size-4 items-center justify-center rounded-full">
                <Check className="size-3 text-white" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
